<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use HasFactory, SoftDeletes;

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
        'is_main',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_main' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    // Relación con inventario (plural para uso en withCount)
    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    // Alias para mantener compatibilidad
    public function inventory(): HasMany
    {
        return $this->inventories();
    }

    // Obtener productos únicos en esta sucursal
    public function products()
    {
        return $this->hasManyThrough(
            \App\Models\Product::class,
            Inventory::class,
            'branch_id',
            'id',
            'id',
            'product_id'
        )->distinct();
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
