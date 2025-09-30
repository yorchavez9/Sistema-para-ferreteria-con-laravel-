<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentSeries extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'document_type',
        'series',
        'current_number',
        'is_active',
    ];

    protected $casts = [
        'current_number' => 'integer',
        'is_active' => 'boolean',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByBranch($query, $branchId)
    {
        return $query->where('branch_id', $branchId);
    }

    public function scopeByDocumentType($query, $documentType)
    {
        return $query->where('document_type', $documentType);
    }

    public function getNextNumber(): string
    {
        $this->increment('current_number');
        $correlativo = str_pad($this->current_number, 8, '0', STR_PAD_LEFT);
        return "{$this->series}-{$correlativo}";
    }

    public static function getOrCreateSeries(int $branchId, string $documentType, string $series = null): self
    {
        if (!$series) {
            $series = self::generateDefaultSeries($documentType);
        }

        return self::firstOrCreate(
            [
                'branch_id' => $branchId,
                'document_type' => $documentType,
                'series' => $series,
            ],
            [
                'current_number' => 0,
                'is_active' => true,
            ]
        );
    }

    private static function generateDefaultSeries(string $documentType): string
    {
        $prefixes = [
            'orden_compra' => 'O',
            'factura' => 'F',
            'boleta' => 'B',
            'nota_credito' => 'NC',
            'nota_debito' => 'ND',
            'guia_remision' => 'G',
        ];

        $prefix = $prefixes[$documentType] ?? 'DOC';
        return $prefix . '001';
    }

    public function getCurrentFullNumber(): string
    {
        $correlativo = str_pad($this->current_number, 8, '0', STR_PAD_LEFT);
        return "{$this->series}-{$correlativo}";
    }
}
