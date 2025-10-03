<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'cash_session_id',
        'cash_register_id',
        'user_id',
        'branch_id',
        'type',
        'amount',
        'payment_method',
        'sale_id',
        'payment_id',
        'purchase_order_id',
        'expense_id',
        'reference_number',
        'description',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    // Relaciones
    public function cashSession(): BelongsTo
    {
        return $this->belongsTo(CashSession::class);
    }

    public function cashRegister(): BelongsTo
    {
        return $this->belongsTo(CashRegister::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }

    // Métodos estáticos para registrar movimientos

    /**
     * Registrar venta en caja
     */
    public static function recordSale(Sale $sale, CashSession $cashSession)
    {
        // Solo registrar ventas al contado en efectivo
        if ($sale->payment_type !== 'contado') {
            return null;
        }

        return self::create([
            'cash_session_id' => $cashSession->id,
            'cash_register_id' => $cashSession->cash_register_id,
            'user_id' => auth()->id(),
            'branch_id' => $sale->branch_id,
            'type' => 'venta',
            'amount' => $sale->total,
            'payment_method' => $sale->payment_method,
            'sale_id' => $sale->id,
            'reference_number' => $sale->sale_number,
            'description' => "Venta {$sale->sale_number} - Cliente: " . ($sale->customer->name ?? 'Cliente Varios'),
        ]);
    }

    /**
     * Registrar pago de cuota en caja
     */
    public static function recordPayment(Payment $payment, CashSession $cashSession)
    {
        // Solo registrar pagos en efectivo
        if ($payment->payment_method !== 'efectivo') {
            return null;
        }

        return self::create([
            'cash_session_id' => $cashSession->id,
            'cash_register_id' => $cashSession->cash_register_id,
            'user_id' => auth()->id(),
            'branch_id' => $cashSession->branch_id,
            'type' => 'pago_credito',
            'amount' => $payment->amount,
            'payment_method' => $payment->payment_method,
            'payment_id' => $payment->id,
            'sale_id' => $payment->sale_id,
            'reference_number' => $payment->transaction_reference,
            'description' => "Pago de cuota #{$payment->payment_number} - Venta {$payment->sale->sale_number}",
        ]);
    }

    /**
     * Registrar gasto en caja
     */
    public static function recordExpense(Expense $expense, CashSession $cashSession)
    {
        // Solo registrar gastos en efectivo
        if ($expense->payment_method !== 'efectivo') {
            return null;
        }

        return self::create([
            'cash_session_id' => $cashSession->id,
            'cash_register_id' => $cashSession->cash_register_id,
            'user_id' => auth()->id(),
            'branch_id' => $expense->branch_id,
            'type' => 'gasto',
            'amount' => $expense->amount,
            'payment_method' => $expense->payment_method,
            'expense_id' => $expense->id,
            'reference_number' => $expense->document_number,
            'description' => $expense->description,
        ]);
    }

    /**
     * Registrar ingreso manual
     */
    public static function recordIncome($amount, $description, CashSession $cashSession, $paymentMethod = 'efectivo', $notes = null)
    {
        return self::create([
            'cash_session_id' => $cashSession->id,
            'cash_register_id' => $cashSession->cash_register_id,
            'user_id' => auth()->id(),
            'branch_id' => $cashSession->branch_id,
            'type' => 'ingreso',
            'amount' => $amount,
            'payment_method' => $paymentMethod,
            'description' => $description,
            'notes' => $notes,
        ]);
    }

    /**
     * Registrar egreso manual
     */
    public static function recordEgress($amount, $description, CashSession $cashSession, $paymentMethod = 'efectivo', $notes = null)
    {
        return self::create([
            'cash_session_id' => $cashSession->id,
            'cash_register_id' => $cashSession->cash_register_id,
            'user_id' => auth()->id(),
            'branch_id' => $cashSession->branch_id,
            'type' => 'egreso',
            'amount' => $amount,
            'payment_method' => $paymentMethod,
            'description' => $description,
            'notes' => $notes,
        ]);
    }

    // Scopes
    public function scopeIngresos($query)
    {
        return $query->whereIn('type', ['ingreso', 'venta', 'pago_credito', 'transferencia_entrada']);
    }

    public function scopeEgresos($query)
    {
        return $query->whereIn('type', ['egreso', 'compra', 'gasto', 'transferencia_salida']);
    }

    public function scopeEfectivo($query)
    {
        return $query->where('payment_method', 'efectivo');
    }

    public function scopeForSession($query, $sessionId)
    {
        return $query->where('cash_session_id', $sessionId);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }
}
