<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'image',
        'parent_id',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Relación con categoría padre
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    // Relación con categorías hijas
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    // Relación con productos
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    // Scope para categorías activas
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope para categorías principales (sin padre)
    public function scopeMain($query)
    {
        return $query->whereNull('parent_id');
    }
}
