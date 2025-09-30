<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'series',
        'correlativo',
        'supplier_id',
        'branch_id',
        'user_id',
        'order_date',
        'expected_date',
        'received_date',
        'status',
        'subtotal',
        'tax',
        'discount',
        'total',
        'notes',
    ];

    protected $casts = [
        'order_date' => 'date',
        'expected_date' => 'date',
        'received_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    // Relaciones
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(PurchaseOrderDetail::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pendiente');
    }

    public function scopeReceived($query)
    {
        return $query->where('status', 'recibido');
    }

    public function scopeBySupplier($query, $supplierId)
    {
        return $query->where('supplier_id', $supplierId);
    }

    public function scopeByBranch($query, $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Métodos auxiliares
    public function calculateTotals()
    {
        $this->subtotal = $this->details->sum('subtotal');
        $this->tax = $this->subtotal * 0.18; // IGV 18%
        $this->total = $this->subtotal + $this->tax - $this->discount;
        $this->save();
    }

    public function markAsReceived()
    {
        $this->status = 'recibido';
        $this->received_date = now();
        $this->save();

        // Actualizar inventario
        foreach ($this->details as $detail) {
            $inventory = Inventory::where('product_id', $detail->product_id)
                ->where('branch_id', $this->branch_id)
                ->first();

            if ($inventory) {
                $inventory->current_stock += $detail->quantity_received;
                $inventory->cost_price = $detail->unit_price;
                $inventory->last_movement_date = now();
                $inventory->save();
            } else {
                // Crear registro de inventario si no existe
                Inventory::create([
                    'product_id' => $detail->product_id,
                    'branch_id' => $this->branch_id,
                    'current_stock' => $detail->quantity_received,
                    'min_stock' => 0,
                    'max_stock' => 0,
                    'cost_price' => $detail->unit_price,
                    'sale_price' => $detail->unit_price * 1.3, // Margen del 30%
                    'last_movement_date' => now(),
                ]);
            }
        }
    }

    public function checkStatus()
    {
        $totalOrdered = $this->details->sum('quantity_ordered');
        $totalReceived = $this->details->sum('quantity_received');

        if ($totalReceived == 0) {
            $this->status = 'pendiente';
        } elseif ($totalReceived < $totalOrdered) {
            $this->status = 'parcial';
        } else {
            $this->status = 'recibido';
            $this->received_date = now();
        }

        $this->save();
    }

    // Accessor para obtener el número completo de orden
    public function getOrderNumberAttribute(): string
    {
        return "{$this->series}-{$this->correlativo}";
    }
}