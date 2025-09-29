<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'logo',
        'website',
        'contact_email',
        'contact_phone',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relación con productos
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    // Scope para marcas activas
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
