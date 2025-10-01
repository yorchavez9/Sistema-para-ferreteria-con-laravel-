<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sale extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'series',
        'correlativo',
        'document_type',
        'customer_id',
        'branch_id',
        'user_id',
        'sale_date',
        'payment_method',
        'payment_type',
        'credit_days',
        'installments',
        'initial_payment',
        'remaining_balance',
        'status',
        'subtotal',
        'tax',
        'discount',
        'total',
        'amount_paid',
        'change_amount',
        'notes',
    ];

    protected $casts = [
        'sale_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'initial_payment' => 'decimal:2',
        'remaining_balance' => 'decimal:2',
    ];

    protected $appends = ['sale_number'];

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
        return $this->hasMany(SaleDetail::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    // Accessor para sale_number
    public function getSaleNumberAttribute(): string
    {
        return $this->series . '-' . $this->correlativo;
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
            $unitPrice = $detail->unit_price; // Este es el precio que se usó en la venta

            // Calcular el subtotal de esta línea CON IGV
            $lineTotal = $quantity * $unitPrice;

            // Si el producto tiene precio con IGV incluido, separar el IGV
            if ($product->price_includes_igv && $product->igv_percentage > 0) {
                // Precio sin IGV = Precio con IGV / (1 + IGV%)
                $igvMultiplier = 1 + ($product->igv_percentage / 100);
                $lineSubtotalWithoutIgv = round($lineTotal / $igvMultiplier, 2);
                $lineIgv = round($lineTotal - $lineSubtotalWithoutIgv, 2);

                $totalSubtotal += $lineSubtotalWithoutIgv;
                $totalTax += $lineIgv;
                $totalFinal += $lineTotal;
            } else if (!$product->price_includes_igv && $product->igv_percentage > 0) {
                // El precio NO incluye IGV, calcular hacia adelante
                $lineIgv = round($lineTotal * ($product->igv_percentage / 100), 2);

                $totalSubtotal += $lineTotal;
                $totalTax += $lineIgv;
                $totalFinal += $lineTotal + $lineIgv;
            } else {
                // Producto sin IGV
                $totalSubtotal += $lineTotal;
                $totalFinal += $lineTotal;
            }
        }

        // Asignar los totales calculados
        $this->subtotal = round($totalSubtotal, 2);
        $this->tax = round($totalTax, 2);
        $this->total = round($totalFinal - $this->discount, 2);

        $this->save();
    }

    // Procesar venta (actualizar inventario)
    public function processSale(): void
    {
        if ($this->status !== 'pendiente') {
            throw new \Exception('Solo se pueden procesar ventas pendientes.');
        }

        foreach ($this->details as $detail) {
            // Buscar inventario en la sucursal
            $inventory = Inventory::where('product_id', $detail->product_id)
                ->where('branch_id', $this->branch_id)
                ->first();

            if (!$inventory) {
                throw new \Exception("Producto {$detail->product->name} no tiene inventario en esta sucursal.");
            }

            if ($inventory->current_stock < $detail->quantity) {
                throw new \Exception("Stock insuficiente para {$detail->product->name}. Disponible: {$inventory->current_stock}");
            }

            // Reducir inventario
            $inventory->current_stock -= $detail->quantity;
            $inventory->last_movement_date = now();
            $inventory->save();
        }

        $this->status = 'pagado';
        $this->save();
    }

    // Anular venta (devolver inventario)
    public function cancelSale(): void
    {
        if ($this->status === 'anulado') {
            throw new \Exception('Esta venta ya está anulada.');
        }

        if ($this->status === 'pagado') {
            // Devolver inventario
            foreach ($this->details as $detail) {
                $inventory = Inventory::where('product_id', $detail->product_id)
                    ->where('branch_id', $this->branch_id)
                    ->first();

                if ($inventory) {
                    $inventory->current_stock += $detail->quantity;
                    $inventory->last_movement_date = now();
                    $inventory->save();
                }
            }
        }

        $this->status = 'anulado';
        $this->deleted_at = now();
        $this->save();
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pendiente');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'pagado');
    }

    public function scopeCanceled($query)
    {
        return $query->where('status', 'cancelado');
    }

    public function scopeAnnulled($query)
    {
        return $query->where('status', 'anulado');
    }

    public function scopeCredit($query)
    {
        return $query->where('payment_type', 'credito');
    }

    public function scopeCash($query)
    {
        return $query->where('payment_type', 'contado');
    }

    // Métodos para manejo de crédito

    /**
     * Verificar si es venta a crédito
     */
    public function isCredit(): bool
    {
        return $this->payment_type === 'credito';
    }

    /**
     * Crear cuotas de pago para venta a crédito
     */
    public function createPaymentInstallments(): void
    {
        if (!$this->isCredit()) {
            return;
        }

        // Calcular el saldo que se pagará en cuotas
        $balanceToFinance = $this->remaining_balance;
        $installmentAmount = $balanceToFinance / $this->installments;

        // Calcular días entre cuotas
        $daysBetweenInstallments = $this->credit_days / $this->installments;

        for ($i = 1; $i <= $this->installments; $i++) {
            $dueDate = now()->addDays($daysBetweenInstallments * $i);

            Payment::create([
                'sale_id' => $this->id,
                'payment_number' => $i,
                'amount' => round($installmentAmount, 2),
                'due_date' => $dueDate,
                'status' => 'pendiente',
                'created_by' => auth()->id(),
            ]);
        }
    }

    /**
     * Actualizar el saldo pendiente basado en los pagos realizados
     */
    public function updateRemainingBalance(): void
    {
        if (!$this->isCredit()) {
            return;
        }

        $totalPaid = $this->initial_payment + $this->payments()->paid()->sum('amount');
        $this->remaining_balance = $this->total - $totalPaid;

        // Si el saldo es 0, marcar venta como pagada
        if ($this->remaining_balance <= 0) {
            $this->status = 'pagado';
            $this->remaining_balance = 0;
        }

        $this->save();
    }

    /**
     * Obtener pagos vencidos
     */
    public function getOverduePayments()
    {
        return $this->payments()->overdue()->get();
    }

    /**
     * Obtener pagos que vencen pronto
     */
    public function getPaymentsDueSoon()
    {
        return $this->payments()->dueSoon()->get();
    }

    /**
     * Verificar si tiene pagos vencidos
     */
    public function hasOverduePayments(): bool
    {
        return $this->payments()->overdue()->exists();
    }

    /**
     * Calcular días de retraso máximo
     */
    public function getMaxDaysOverdue(): int
    {
        $overduePayments = $this->getOverduePayments();

        if ($overduePayments->isEmpty()) {
            return 0;
        }

        return $overduePayments->max(function ($payment) {
            return abs($payment->getDaysUntilDue());
        });
    }
}