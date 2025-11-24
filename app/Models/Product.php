<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

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
        'wholesale_price',
        'retail_price',
        'min_stock',
        'max_stock',
        'image',
        'images',
        'is_active',
        'track_stock',
        'igv_percentage',
        'price_includes_igv',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'track_stock' => 'boolean',
        'price_includes_igv' => 'boolean',
        'purchase_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'retail_price' => 'decimal:2',
        'igv_percentage' => 'decimal:2',
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

    /**
     * Calcular precio de venta sin IGV
     * Si el precio incluye IGV, lo calcula hacia atrás
     * Si no incluye IGV, retorna el precio tal cual
     */
    public function getPriceWithoutIgv()
    {
        if (!$this->price_includes_igv) {
            return $this->sale_price;
        }

        // Si el precio incluye IGV, calculamos el precio base
        // Precio sin IGV = Precio con IGV / (1 + porcentaje/100)
        $igvMultiplier = 1 + ($this->igv_percentage / 100);
        return round($this->sale_price / $igvMultiplier, 2);
    }

    /**
     * Calcular el monto del IGV para este producto
     */
    public function getIgvAmount()
    {
        if ($this->igv_percentage == 0) {
            return 0;
        }

        if ($this->price_includes_igv) {
            // IGV = Precio final - Precio sin IGV
            return round($this->sale_price - $this->getPriceWithoutIgv(), 2);
        }

        // Si el precio no incluye IGV, calculamos hacia adelante
        return round($this->sale_price * ($this->igv_percentage / 100), 2);
    }
}
