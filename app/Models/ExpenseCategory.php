<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpenseCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'color',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relación con gastos
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    // Scope para categorías activas
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Obtener total gastado en esta categoría
    public function getTotalSpentAttribute()
    {
        return $this->expenses()
            ->where('status', 'aprobado')
            ->sum('amount');
    }

    // Obtener total gastado este mes
    public function getMonthlySpentAttribute()
    {
        return $this->expenses()
            ->where('status', 'aprobado')
            ->whereMonth('expense_date', now()->month)
            ->whereYear('expense_date', now()->year)
            ->sum('amount');
    }
}
