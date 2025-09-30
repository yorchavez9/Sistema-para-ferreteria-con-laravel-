<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DocumentSeriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener todas las sucursales
        $branches = \App\Models\Branch::all();

        foreach ($branches as $branch) {
            // Para cada sucursal, crear series para diferentes tipos de documentos

            // Serie para Facturas (Automática)
            \App\Models\DocumentSeries::create([
                'branch_id' => $branch->id,
                'document_type' => 'factura',
                'series' => 'F001',
                'current_number' => 0,
                'is_active' => true,
            ]);

            // Serie para Boletas (Automática)
            \App\Models\DocumentSeries::create([
                'branch_id' => $branch->id,
                'document_type' => 'boleta',
                'series' => 'B001',
                'current_number' => 0,
                'is_active' => true,
            ]);

            // Serie para Notas de Crédito (Automática)
            \App\Models\DocumentSeries::create([
                'branch_id' => $branch->id,
                'document_type' => 'nota_credito',
                'series' => 'NC01',
                'current_number' => 0,
                'is_active' => true,
            ]);

            // Serie para Notas de Débito (Automática)
            \App\Models\DocumentSeries::create([
                'branch_id' => $branch->id,
                'document_type' => 'nota_debito',
                'series' => 'ND01',
                'current_number' => 0,
                'is_active' => true,
            ]);

            // Serie para Guías de Remisión (Automática)
            \App\Models\DocumentSeries::create([
                'branch_id' => $branch->id,
                'document_type' => 'guia_remision',
                'series' => 'G001',
                'current_number' => 0,
                'is_active' => true,
            ]);
        }

        $this->command->info('Series de documentos creadas exitosamente para todas las sucursales.');
    }
}
