<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'document_type',
        'document_number',
        'address',
        'phone',
        'email',
        'contact_person',
        'contact_phone',
        'website',
        'notes',
        'payment_terms',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Scope para proveedores activos
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope por tipo de documento
    public function scopeByDocumentType($query, $type)
    {
        return $query->where('document_type', $type);
    }

    // Obtener nombre completo con documento
    public function getFullIdentificationAttribute()
    {
        $document = $this->document_number ? " ({$this->document_type}: {$this->document_number})" : '';
        return $this->name . $document;
    }
}
