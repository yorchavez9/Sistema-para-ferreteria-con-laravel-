<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'cash_register_id',
        'user_id',
        'branch_id',
        'opened_at',
        'opening_balance',
        'opening_notes',
        'closed_at',
        'expected_balance',
        'actual_balance',
        'difference',
        'closing_notes',
        'status',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
        'opening_balance' => 'decimal:2',
        'expected_balance' => 'decimal:2',
        'actual_balance' => 'decimal:2',
        'difference' => 'decimal:2',
    ];

    // Relaciones
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

    public function movements(): HasMany
    {
        return $this->hasMany(CashMovement::class);
    }

    // Métodos de negocio

    /**
     * Abrir sesión de caja
     */
    public static function open($cashRegisterId, $openingBalance, $notes = null)
    {
        $cashRegister = CashRegister::findOrFail($cashRegisterId);

        // Verificar que no haya una sesión abierta
        if ($cashRegister->isOpen()) {
            throw new \Exception('Esta caja ya tiene una sesión abierta.');
        }

        return self::create([
            'cash_register_id' => $cashRegisterId,
            'user_id' => auth()->id(),
            'branch_id' => $cashRegister->branch_id,
            'opened_at' => now(),
            'opening_balance' => $openingBalance,
            'opening_notes' => $notes,
            'status' => 'abierta',
        ]);
    }

    /**
     * Cerrar sesión de caja
     */
    public function close($actualBalance, $notes = null): void
    {
        if ($this->status === 'cerrada') {
            throw new \Exception('Esta sesión ya está cerrada.');
        }

        $expectedBalance = $this->calculateExpectedBalance();

        $this->update([
            'closed_at' => now(),
            'expected_balance' => $expectedBalance,
            'actual_balance' => $actualBalance,
            'difference' => $actualBalance - $expectedBalance,
            'closing_notes' => $notes,
            'status' => 'cerrada',
        ]);
    }

    /**
     * Reabrir sesión de caja cerrada
     */
    public function reopen($notes = null): void
    {
        if ($this->status === 'abierta') {
            throw new \Exception('Esta sesión ya está abierta.');
        }

        // Verificar que la caja no tenga otra sesión abierta
        $cashRegister = $this->cashRegister;
        if ($cashRegister->isOpen()) {
            throw new \Exception('Esta caja ya tiene otra sesión abierta. Debes cerrarla primero.');
        }

        // Verificar que la sesión pertenece al usuario actual
        if ($this->user_id !== auth()->id()) {
            throw new \Exception('Solo puedes reabrir tus propias sesiones de caja.');
        }

        $this->update([
            'closed_at' => null,
            'expected_balance' => null,
            'actual_balance' => null,
            'difference' => null,
            'closing_notes' => $notes ? $this->closing_notes . "\n\nREABIERTO: " . $notes : $this->closing_notes,
            'status' => 'abierta',
        ]);
    }

    /**
     * Calcular saldo esperado
     */
    public function calculateExpectedBalance(): float
    {
        $totalIngresos = $this->movements()
            ->whereIn('type', ['ingreso', 'venta', 'pago_credito', 'transferencia_entrada'])
            ->where('payment_method', 'efectivo')
            ->sum('amount');

        $totalEgresos = $this->movements()
            ->whereIn('type', ['egreso', 'compra', 'gasto', 'transferencia_salida'])
            ->where('payment_method', 'efectivo')
            ->sum('amount');

        return round($this->opening_balance + $totalIngresos - $totalEgresos, 2);
    }

    /**
     * Obtener diferencia (sobrante/faltante)
     */
    public function getDifference(): float
    {
        return $this->difference ?? 0;
    }

    /**
     * Obtener total de ventas
     */
    public function getSalesTotal(): float
    {
        return $this->movements()
            ->where('type', 'venta')
            ->sum('amount');
    }

    /**
     * Obtener total de gastos
     */
    public function getExpensesTotal(): float
    {
        return $this->movements()
            ->where('type', 'gasto')
            ->sum('amount');
    }

    /**
     * Obtener total de ingresos
     */
    public function getIncomesTotal(): float
    {
        return $this->movements()
            ->whereIn('type', ['ingreso', 'venta', 'pago_credito', 'transferencia_entrada'])
            ->sum('amount');
    }

    /**
     * Obtener total de egresos
     */
    public function getEgressesTotal(): float
    {
        return $this->movements()
            ->whereIn('type', ['egreso', 'compra', 'gasto', 'transferencia_salida'])
            ->sum('amount');
    }

    /**
     * Obtener movimientos por método de pago
     */
    public function getMovementsByPaymentMethod()
    {
        return $this->movements()
            ->selectRaw('payment_method, SUM(amount) as total')
            ->groupBy('payment_method')
            ->get();
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->where('status', 'abierta');
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'cerrada');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForBranch($query, $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    /**
     * Obtener sesión activa del usuario actual
     */
    public static function getCurrentUserSession()
    {
        return self::where('user_id', auth()->id())
            ->where('status', 'abierta')
            ->latest('opened_at')
            ->first();
    }
}
