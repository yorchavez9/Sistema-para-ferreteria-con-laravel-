<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Payment extends Model
{
    protected $table = 'sale_payments';

    protected $fillable = [
        'sale_id',
        'payment_number',
        'amount',
        'due_date',
        'paid_date',
        'status',
        'payment_method',
        'transaction_reference',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_date' => 'date',
    ];

    /**
     * Relación con la venta
     */
    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * Usuario que creó el registro
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Usuario que actualizó el registro
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Marcar como pagado
     */
    public function markAsPaid(string $paymentMethod, ?string $transactionReference = null, ?string $notes = null): void
    {
        $this->update([
            'status' => 'pagado',
            'paid_date' => now(),
            'payment_method' => $paymentMethod,
            'transaction_reference' => $transactionReference,
            'notes' => $notes,
            'updated_by' => auth()->id(),
        ]);

        // Actualizar el saldo pendiente de la venta
        $this->sale->updateRemainingBalance();
    }

    /**
     * Verificar si el pago está vencido
     */
    public function isOverdue(): bool
    {
        return $this->status === 'pendiente' &&
               $this->due_date < now()->startOfDay();
    }

    /**
     * Verificar si el pago vence pronto (dentro de 7 días)
     */
    public function isDueSoon(): bool
    {
        return $this->status === 'pendiente' &&
               $this->due_date >= now()->startOfDay() &&
               $this->due_date <= now()->addDays(7)->endOfDay();
    }

    /**
     * Obtener días hasta vencimiento (negativo si ya venció)
     */
    public function getDaysUntilDue(): int
    {
        return now()->startOfDay()->diffInDays($this->due_date, false);
    }

    /**
     * Actualizar estado automáticamente basado en fecha de vencimiento
     */
    public function updateStatus(): void
    {
        if ($this->status === 'pendiente' && $this->isOverdue()) {
            $this->update([
                'status' => 'vencido',
                'updated_by' => auth()->id(),
            ]);
        }
    }

    /**
     * Scope para pagos pendientes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pendiente');
    }

    /**
     * Scope para pagos vencidos
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'vencido')
                    ->orWhere(function($q) {
                        $q->where('status', 'pendiente')
                          ->where('due_date', '<', now()->startOfDay());
                    });
    }

    /**
     * Scope para pagos que vencen pronto
     */
    public function scopeDueSoon($query)
    {
        return $query->where('status', 'pendiente')
                    ->where('due_date', '>=', now()->startOfDay())
                    ->where('due_date', '<=', now()->addDays(7)->endOfDay());
    }

    /**
     * Scope para pagos pagados
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'pagado');
    }
}
