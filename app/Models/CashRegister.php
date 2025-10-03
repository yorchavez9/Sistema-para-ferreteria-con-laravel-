<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CashRegister extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'branch_id',
        'type',
        'is_active',
        'opening_balance',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'opening_balance' => 'decimal:2',
    ];

    // Relación con sucursal
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    // Relación con sesiones
    public function sessions(): HasMany
    {
        return $this->hasMany(CashSession::class);
    }

    // Relación con movimientos
    public function movements(): HasMany
    {
        return $this->hasMany(CashMovement::class);
    }

    // Obtener sesión actual abierta
    public function currentSession()
    {
        return $this->sessions()
            ->where('status', 'abierta')
            ->latest('opened_at')
            ->first();
    }

    // Verificar si la caja está abierta
    public function isOpen(): bool
    {
        return $this->currentSession() !== null;
    }

    // Obtener usuario actual que tiene la caja abierta
    public function getCurrentUser()
    {
        $session = $this->currentSession();
        return $session ? $session->user : null;
    }

    // Scope para cajas activas
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope para cajas de una sucursal
    public function scopeForBranch($query, $branchId)
    {
        return $query->where('branch_id', $branchId);
    }
}
