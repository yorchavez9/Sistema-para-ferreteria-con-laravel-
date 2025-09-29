<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Customer extends Model
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
        'birth_date',
        'customer_type',
        'payment_terms',
        'credit_limit',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'birth_date' => 'date',
        'credit_limit' => 'decimal:2',
    ];

    // Scope para clientes activos
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope por tipo de cliente
    public function scopeByType($query, $type)
    {
        return $query->where('customer_type', $type);
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

    // Verificar si es empresa
    public function getIsCompanyAttribute()
    {
        return $this->customer_type === 'empresa';
    }

    // Obtener edad si tiene fecha de nacimiento
    public function getAgeAttribute()
    {
        return $this->birth_date ? $this->birth_date->age : null;
    }
}
