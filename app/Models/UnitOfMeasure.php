<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class UnitOfMeasure extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'abbreviation',
        'type',
        'is_base',
        'base_conversion_factor',
        'is_active',
        'description',
    ];

    protected $casts = [
        'is_base' => 'boolean',
        'is_active' => 'boolean',
        'base_conversion_factor' => 'decimal:6',
    ];

    // Relaciones
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'base_unit_id');
    }

    public function saleProducts(): HasMany
    {
        return $this->hasMany(Product::class, 'sale_unit_id');
    }

    public function conversionsFrom(): HasMany
    {
        return $this->hasMany(UnitConversion::class, 'from_unit_id');
    }

    public function conversionsTo(): HasMany
    {
        return $this->hasMany(UnitConversion::class, 'to_unit_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeBase($query)
    {
        return $query->where('is_base', true);
    }

    // Métodos auxiliares
    public function getDisplayNameAttribute(): string
    {
        return "{$this->name} ({$this->abbreviation})";
    }

    /**
     * Convertir cantidad a unidad base del mismo tipo
     */
    public function toBaseUnit($quantity): float
    {
        if ($this->is_base) {
            return $quantity;
        }

        if (!$this->base_conversion_factor) {
            throw new \Exception("La unidad {$this->name} no tiene factor de conversión definido");
        }

        return $quantity * $this->base_conversion_factor;
    }

    /**
     * Convertir cantidad desde unidad base
     */
    public function fromBaseUnit($quantity): float
    {
        if ($this->is_base) {
            return $quantity;
        }

        if (!$this->base_conversion_factor) {
            throw new \Exception("La unidad {$this->name} no tiene factor de conversión definido");
        }

        return $quantity / $this->base_conversion_factor;
    }
}
