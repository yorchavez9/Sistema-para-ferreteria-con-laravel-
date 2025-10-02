<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    use HasFactory;

    protected $table = 'inventory';

    protected $fillable = [
        'product_id',
        'branch_id',
        'current_stock',
        'min_stock',
        'max_stock',
        'cost_price',
        'sale_price',
        'location',
        'last_movement_date',
    ];

    protected $casts = [
        'current_stock' => 'integer',
        'min_stock' => 'integer',
        'max_stock' => 'integer',
        'cost_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'last_movement_date' => 'date',
    ];

    // Relación con producto
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Relación con sucursal
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    // Scope para productos con stock bajo
    public function scopeLowStock($query)
    {
        return $query->whereColumn('current_stock', '<=', 'min_stock')
            ->where('current_stock', '>', 0);
    }

    // Scope para productos sin stock
    public function scopeOutOfStock($query)
    {
        return $query->where('current_stock', 0);
    }

    // Scope para productos con stock normal
    public function scopeNormalStock($query)
    {
        return $query->whereColumn('current_stock', '>', 'min_stock');
    }

    // Scope por sucursal
    public function scopeByBranch($query, $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    // Verificar si está en stock bajo
    public function getIsLowStockAttribute()
    {
        return $this->current_stock <= $this->min_stock;
    }

    // Verificar si está agotado
    public function getIsOutOfStockAttribute()
    {
        return $this->current_stock <= 0;
    }

    // Calcular margen de ganancia
    public function getProfitMarginAttribute()
    {
        if ($this->cost_price > 0) {
            return (($this->sale_price - $this->cost_price) / $this->cost_price) * 100;
        }
        return 0;
    }
}
