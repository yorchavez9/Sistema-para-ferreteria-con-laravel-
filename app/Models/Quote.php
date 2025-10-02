<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quote extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'quote_number',
        'customer_id',
        'branch_id',
        'user_id',
        'quote_date',
        'expiration_date',
        'status',
        'subtotal',
        'tax',
        'discount',
        'total',
        'notes',
        'converted_to_sale_id',
        'converted_at',
    ];

    protected $casts = [
        'quote_date' => 'date',
        'expiration_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'converted_at' => 'datetime',
    ];

    // Relaciones
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
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
        return $this->hasMany(QuoteDetail::class);
    }

    public function convertedSale(): BelongsTo
    {
        return $this->belongsTo(Sale::class, 'converted_to_sale_id');
    }

    // Calcular totales
    public function calculateTotals(): void
    {
        $totalSubtotal = 0;  // Precio sin IGV
        $totalTax = 0;        // Total de IGV
        $totalFinal = 0;      // Precio con IGV (antes de descuentos)

        foreach ($this->details as $detail) {
            $product = $detail->product;
            $quantity = $detail->quantity;
            $unitPrice = $detail->unit_price;

            // Calcular el subtotal de esta línea CON IGV
            $lineTotal = $quantity * $unitPrice;

            // Si el producto tiene precio con IGV incluido, separar el IGV
            if ($product->price_includes_igv && $product->igv_percentage > 0) {
                $igvMultiplier = 1 + ($product->igv_percentage / 100);
                $lineSubtotalWithoutIgv = round($lineTotal / $igvMultiplier, 2);
                $lineIgv = round($lineTotal - $lineSubtotalWithoutIgv, 2);

                $totalSubtotal += $lineSubtotalWithoutIgv;
                $totalTax += $lineIgv;
                $totalFinal += $lineTotal;
            } else if (!$product->price_includes_igv && $product->igv_percentage > 0) {
                $lineIgv = round($lineTotal * ($product->igv_percentage / 100), 2);

                $totalSubtotal += $lineTotal;
                $totalTax += $lineIgv;
                $totalFinal += $lineTotal + $lineIgv;
            } else {
                $totalSubtotal += $lineTotal;
                $totalFinal += $lineTotal;
            }
        }

        $this->subtotal = round($totalSubtotal, 2);
        $this->tax = round($totalTax, 2);
        $this->total = round($totalFinal - $this->discount, 2);

        $this->save();
    }

    // Convertir a venta
    public function convertToSale(array $saleData): Sale
    {
        if ($this->status === 'convertida') {
            throw new \Exception('Esta cotización ya fue convertida a venta.');
        }

        if ($this->isExpired()) {
            throw new \Exception('Esta cotización ha vencido.');
        }

        $sale = Sale::create([
            'series' => $saleData['series'],
            'correlativo' => $saleData['correlativo'],
            'document_type' => $saleData['document_type'],
            'customer_id' => $this->customer_id,
            'branch_id' => $this->branch_id,
            'user_id' => auth()->id(),
            'sale_date' => now(),
            'payment_method' => $saleData['payment_method'],
            'payment_type' => $saleData['payment_type'],
            'credit_days' => $saleData['credit_days'] ?? null,
            'installments' => $saleData['installments'] ?? null,
            'initial_payment' => $saleData['initial_payment'] ?? 0,
            'status' => 'pendiente',
            'discount' => $this->discount,
            'amount_paid' => $saleData['amount_paid'],
            'notes' => $this->notes,
        ]);

        // Copiar los detalles
        foreach ($this->details as $detail) {
            $sale->details()->create([
                'product_id' => $detail->product_id,
                'quantity' => $detail->quantity,
                'unit_price' => $detail->unit_price,
                'subtotal' => $detail->subtotal,
                'discount' => $detail->discount,
            ]);
        }

        // Actualizar cotización
        $this->status = 'convertida';
        $this->converted_to_sale_id = $sale->id;
        $this->converted_at = now();
        $this->save();

        return $sale;
    }

    // Verificar si está vencida
    public function isExpired(): bool
    {
        return $this->expiration_date < now() && $this->status === 'pendiente';
    }

    // Marcar como vencida si aplica
    public function checkAndMarkExpired(): void
    {
        if ($this->isExpired()) {
            $this->status = 'vencida';
            $this->save();
        }
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pendiente');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'aprobada');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rechazada');
    }

    public function scopeConverted($query)
    {
        return $query->where('status', 'convertida');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'vencida');
    }

    public function scopeValid($query)
    {
        return $query->where('expiration_date', '>=', now())
            ->whereIn('status', ['pendiente', 'aprobada']);
    }
}
