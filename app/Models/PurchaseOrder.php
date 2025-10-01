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
        \Log::info('=== INICIANDO markAsReceived ===');

        // Actualizar inventario para cada detalle
        foreach ($this->details as $detail) {
            \Log::info('Procesando detalle', [
                'product_id' => $detail->product_id,
                'quantity_ordered' => $detail->quantity_ordered,
                'quantity_received' => $detail->quantity_received,
                'unit_price' => $detail->unit_price,
                'sale_price' => $detail->sale_price,
            ]);

            // Calcular la cantidad pendiente de recibir
            $quantityToReceive = $detail->quantity_ordered - $detail->quantity_received;
            \Log::info('Cantidad a recibir: ' . $quantityToReceive);

            if ($quantityToReceive > 0) {
                // Actualizar la cantidad recibida
                $detail->quantity_received = $detail->quantity_ordered;
                $detail->save();

                // Buscar o crear inventario
                $inventory = Inventory::where('product_id', $detail->product_id)
                    ->where('branch_id', $this->branch_id)
                    ->first();

                if ($inventory) {
                    // Aumentar el stock con la cantidad pendiente
                    $inventory->current_stock += $quantityToReceive;
                    $inventory->cost_price = $detail->unit_price;

                    // SIEMPRE actualizar precio de venta si tiene un valor numérico válido
                    if ($detail->sale_price !== null && $detail->sale_price > 0) {
                        $inventory->sale_price = $detail->sale_price;
                    }

                    $inventory->last_movement_date = now();
                    $inventory->save();
                } else {
                    // Crear registro de inventario si no existe
                    Inventory::create([
                        'product_id' => $detail->product_id,
                        'branch_id' => $this->branch_id,
                        'current_stock' => $quantityToReceive,
                        'min_stock' => 0,
                        'max_stock' => 0,
                        'cost_price' => $detail->unit_price,
                        'sale_price' => $detail->sale_price ?? 0, // Usar precio especificado o 0
                        'last_movement_date' => now(),
                    ]);
                }

                // Actualizar precios en el producto
                $product = Product::find($detail->product_id);
                if ($product) {
                    \Log::info('Actualizando producto', [
                        'product_id' => $product->id,
                        'old_purchase_price' => $product->purchase_price,
                        'new_purchase_price' => $detail->unit_price,
                        'old_sale_price' => $product->sale_price,
                        'new_sale_price' => $detail->sale_price,
                    ]);

                    // SIEMPRE actualizar precio de compra
                    $product->purchase_price = $detail->unit_price;

                    // SIEMPRE actualizar precio de venta si tiene un valor numérico válido
                    if ($detail->sale_price !== null && $detail->sale_price > 0) {
                        $product->sale_price = $detail->sale_price;
                        \Log::info('✓ Precio de venta actualizado a: ' . $detail->sale_price);
                    } else {
                        \Log::info('✗ NO se actualizó precio de venta. sale_price = ' . ($detail->sale_price ?? 'null'));
                    }

                    $product->save();
                    \Log::info('Producto guardado exitosamente');
                }
            } else {
                \Log::info('✗ NO se procesó este detalle porque quantityToReceive <= 0');
            }
        }

        \Log::info('=== FIN markAsReceived ===');

        // Actualizar estado de la orden
        $this->status = 'recibido';
        $this->received_date = now();
        $this->save();
    }

    public function receivePartial(array $receivedQuantities)
    {
        if ($this->status === 'recibido') {
            throw new \Exception('Esta orden ya fue recibida completamente.');
        }

        if ($this->status === 'cancelado') {
            throw new \Exception('No se puede recibir una orden cancelada.');
        }

        // Actualizar inventario para cada detalle recibido
        foreach ($receivedQuantities as $detailId => $quantity) {
            $detail = $this->details()->find($detailId);

            if (!$detail) {
                continue;
            }

            // Validar que no exceda la cantidad ordenada
            $newQuantityReceived = $detail->quantity_received + $quantity;
            if ($newQuantityReceived > $detail->quantity_ordered) {
                throw new \Exception("La cantidad recibida para {$detail->product->name} excede la cantidad ordenada.");
            }

            if ($quantity > 0) {
                // Actualizar la cantidad recibida
                $detail->quantity_received = $newQuantityReceived;
                $detail->save();

                // Buscar o crear inventario
                $inventory = Inventory::where('product_id', $detail->product_id)
                    ->where('branch_id', $this->branch_id)
                    ->first();

                if ($inventory) {
                    // Aumentar el stock con la cantidad recibida
                    $inventory->current_stock += $quantity;
                    $inventory->cost_price = $detail->unit_price;

                    // Actualizar precio de venta si fue especificado
                    if ($detail->sale_price) {
                        $inventory->sale_price = $detail->sale_price;
                    }

                    $inventory->last_movement_date = now();
                    $inventory->save();
                } else {
                    // Crear registro de inventario si no existe
                    Inventory::create([
                        'product_id' => $detail->product_id,
                        'branch_id' => $this->branch_id,
                        'current_stock' => $quantity,
                        'min_stock' => 0,
                        'max_stock' => 0,
                        'cost_price' => $detail->unit_price,
                        'sale_price' => $detail->sale_price ?? ($detail->unit_price * 1.3), // Usar precio especificado o margen del 30%
                        'last_movement_date' => now(),
                    ]);
                }

                // Actualizar precios en el producto
                $product = Product::find($detail->product_id);
                if ($product) {
                    // SIEMPRE actualizar precio de compra
                    $product->purchase_price = $detail->unit_price;

                    // SIEMPRE actualizar precio de venta si tiene un valor numérico válido
                    if ($detail->sale_price !== null && $detail->sale_price > 0) {
                        $product->sale_price = $detail->sale_price;
                    }

                    $product->save();
                }
            }
        }

        // Verificar y actualizar el estado de la orden
        $this->checkStatus();
    }

    public function cancelOrder()
    {
        if ($this->status === 'cancelado') {
            throw new \Exception('Esta orden ya está cancelada.');
        }

        // Si ya se recibió mercadería (parcial o total), revertir el inventario
        if (in_array($this->status, ['parcial', 'recibido'])) {
            foreach ($this->details as $detail) {
                if ($detail->quantity_received > 0) {
                    $inventory = Inventory::where('product_id', $detail->product_id)
                        ->where('branch_id', $this->branch_id)
                        ->first();

                    if ($inventory) {
                        // Restar la cantidad que ya había sido recibida
                        $inventory->current_stock -= $detail->quantity_received;
                        $inventory->last_movement_date = now();
                        $inventory->save();
                    }
                }
            }
        }

        // Actualizar estado de la orden
        $this->status = 'cancelado';
        $this->save();
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