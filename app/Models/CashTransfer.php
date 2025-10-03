<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_cash_register_id',
        'to_cash_register_id',
        'from_branch_id',
        'to_branch_id',
        'user_id',
        'transfer_date',
        'amount',
        'description',
        'notes',
        'status',
    ];

    protected $casts = [
        'transfer_date' => 'datetime',
        'amount' => 'decimal:2',
    ];

    // Relaciones
    public function fromCashRegister(): BelongsTo
    {
        return $this->belongsTo(CashRegister::class, 'from_cash_register_id');
    }

    public function toCashRegister(): BelongsTo
    {
        return $this->belongsTo(CashRegister::class, 'to_cash_register_id');
    }

    public function fromBranch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'from_branch_id');
    }

    public function toBranch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'to_branch_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Métodos de negocio

    /**
     * Completar transferencia
     */
    public function complete(): void
    {
        if ($this->status === 'completada') {
            throw new \Exception('Esta transferencia ya está completada.');
        }

        // Obtener sesiones activas de ambas cajas
        $fromSession = $this->fromCashRegister->currentSession();
        $toSession = $this->toCashRegister->currentSession();

        if (!$fromSession) {
            throw new \Exception('La caja de origen no tiene una sesión activa.');
        }

        if (!$toSession) {
            throw new \Exception('La caja de destino no tiene una sesión activa.');
        }

        // Registrar salida en caja origen
        CashMovement::create([
            'cash_session_id' => $fromSession->id,
            'cash_register_id' => $this->from_cash_register_id,
            'user_id' => $this->user_id,
            'branch_id' => $this->from_branch_id,
            'type' => 'transferencia_salida',
            'amount' => $this->amount,
            'payment_method' => 'efectivo',
            'description' => "Transferencia a {$this->toCashRegister->name}",
            'notes' => $this->description,
        ]);

        // Registrar entrada en caja destino
        CashMovement::create([
            'cash_session_id' => $toSession->id,
            'cash_register_id' => $this->to_cash_register_id,
            'user_id' => $this->user_id,
            'branch_id' => $this->to_branch_id,
            'type' => 'transferencia_entrada',
            'amount' => $this->amount,
            'payment_method' => 'efectivo',
            'description' => "Transferencia desde {$this->fromCashRegister->name}",
            'notes' => $this->description,
        ]);

        $this->status = 'completada';
        $this->save();
    }

    /**
     * Cancelar transferencia
     */
    public function cancel(): void
    {
        if ($this->status === 'completada') {
            throw new \Exception('No se puede cancelar una transferencia completada.');
        }

        $this->status = 'cancelada';
        $this->save();
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pendiente');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completada');
    }

    public function scopeCanceled($query)
    {
        return $query->where('status', 'cancelada');
    }
}
