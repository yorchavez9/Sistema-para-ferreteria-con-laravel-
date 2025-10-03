<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id',
        'expense_category_id',
        'user_id',
        'cash_session_id',
        'expense_date',
        'amount',
        'payment_method',
        'supplier_name',
        'document_type',
        'document_number',
        'description',
        'notes',
        'receipt_file',
        'status',
        'approved_by',
        'approved_at',
        'rejected_at',
        'rejection_reason',
    ];

    protected $casts = [
        'expense_date' => 'date',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    // Relaciones
    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cashSession(): BelongsTo
    {
        return $this->belongsTo(CashSession::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Métodos de negocio

    /**
     * Aprobar gasto
     */
    public function approve(): void
    {
        if ($this->status === 'aprobado') {
            throw new \Exception('Este gasto ya está aprobado.');
        }

        $this->status = 'aprobado';
        $this->approved_by = auth()->id();
        $this->approved_at = now();
        $this->save();

        // Si hay una sesión de caja activa, registrar el movimiento
        if ($this->payment_method === 'efectivo' && $this->cash_session_id) {
            CashMovement::recordExpense($this, $this->cashSession);
        }
    }

    /**
     * Rechazar gasto
     */
    public function reject(string $reason = null): void
    {
        if ($this->status === 'rechazado') {
            throw new \Exception('Este gasto ya está rechazado.');
        }

        $this->status = 'rechazado';
        $this->approved_by = auth()->id();
        $this->rejected_at = now();
        $this->rejection_reason = $reason;
        $this->save();
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pendiente');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'aprobado');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rechazado');
    }

    public function scopeForBranch($query, $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    public function scopeForCategory($query, $categoryId)
    {
        return $query->where('expense_category_id', $categoryId);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('expense_date', now()->month)
            ->whereYear('expense_date', now()->year);
    }

    public function scopeThisYear($query)
    {
        return $query->whereYear('expense_date', now()->year);
    }
}
