<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'address',
        'phone',
        'email',
        'manager_name',
        'latitude',
        'longitude',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    // Relación con inventario
    public function inventory(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    // Scope para sucursales activas
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Obtener productos con stock en esta sucursal
    public function getProductsWithStockAttribute()
    {
        return $this->inventory()->where('current_stock', '>', 0)->count();
    }

    // Obtener total de productos en inventario
    public function getTotalProductsAttribute()
    {
        return $this->inventory()->count();
    }

    // Obtener valor total del inventario
    public function getTotalInventoryValueAttribute()
    {
        return $this->inventory()->selectRaw('SUM(current_stock * cost_price) as total')->first()->total ?? 0;
    }
}
