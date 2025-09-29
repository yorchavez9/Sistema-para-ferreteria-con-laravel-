<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'barcode',
        'description',
        'technical_specifications',
        'category_id',
        'brand_id',
        'unit_of_measure',
        'weight',
        'dimensions',
        'purchase_price',
        'sale_price',
        'min_stock',
        'max_stock',
        'image',
        'images',
        'is_active',
        'track_stock',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'track_stock' => 'boolean',
        'purchase_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'min_stock' => 'integer',
        'max_stock' => 'integer',
        'images' => 'array',
    ];

    // Relación con categoría
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Relación con marca
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    // Relación con inventario
    public function inventory(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    // Scope para productos activos
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Obtener stock total en todas las sucursales
    public function getTotalStockAttribute()
    {
        return $this->inventory->sum('current_stock');
    }

    // Obtener stock por sucursal específica
    public function getStockInBranch($branchId)
    {
        $inventory = $this->inventory->where('branch_id', $branchId)->first();
        return $inventory ? $inventory->current_stock : 0;
    }
}
