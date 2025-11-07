<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UnitOfMeasureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            // CANTIDAD (quantity) - Base: Unidad
            ['name' => 'Unidad', 'abbreviation' => 'UND', 'type' => 'quantity', 'is_base' => true, 'base_conversion_factor' => 1],
            ['name' => 'Caja', 'abbreviation' => 'CJA', 'type' => 'quantity', 'is_base' => false, 'base_conversion_factor' => null],
            ['name' => 'Paquete', 'abbreviation' => 'PQT', 'type' => 'quantity', 'is_base' => false, 'base_conversion_factor' => null],
            ['name' => 'Docena', 'abbreviation' => 'DOC', 'type' => 'quantity', 'is_base' => false, 'base_conversion_factor' => 12],
            ['name' => 'Ciento', 'abbreviation' => 'CTO', 'type' => 'quantity', 'is_base' => false, 'base_conversion_factor' => 100],
            ['name' => 'Millar', 'abbreviation' => 'MLL', 'type' => 'quantity', 'is_base' => false, 'base_conversion_factor' => 1000],
            ['name' => 'Par', 'abbreviation' => 'PAR', 'type' => 'quantity', 'is_base' => false, 'base_conversion_factor' => 2],

            // PESO (weight) - Base: Kilogramo
            ['name' => 'Kilogramo', 'abbreviation' => 'KG', 'type' => 'weight', 'is_base' => true, 'base_conversion_factor' => 1],
            ['name' => 'Gramo', 'abbreviation' => 'GR', 'type' => 'weight', 'is_base' => false, 'base_conversion_factor' => 0.001],
            ['name' => 'Tonelada', 'abbreviation' => 'TON', 'type' => 'weight', 'is_base' => false, 'base_conversion_factor' => 1000],
            ['name' => 'Libra', 'abbreviation' => 'LB', 'type' => 'weight', 'is_base' => false, 'base_conversion_factor' => 0.453592],
            ['name' => 'Onza', 'abbreviation' => 'OZ', 'type' => 'weight', 'is_base' => false, 'base_conversion_factor' => 0.0283495],
            ['name' => 'Quintal', 'abbreviation' => 'QTL', 'type' => 'weight', 'is_base' => false, 'base_conversion_factor' => 46],
            ['name' => 'Saco', 'abbreviation' => 'SCO', 'type' => 'weight', 'is_base' => false, 'base_conversion_factor' => null], // Variable según producto

            // VOLUMEN (volume) - Base: Litro
            ['name' => 'Litro', 'abbreviation' => 'LT', 'type' => 'volume', 'is_base' => true, 'base_conversion_factor' => 1],
            ['name' => 'Mililitro', 'abbreviation' => 'ML', 'type' => 'volume', 'is_base' => false, 'base_conversion_factor' => 0.001],
            ['name' => 'Galón', 'abbreviation' => 'GAL', 'type' => 'volume', 'is_base' => false, 'base_conversion_factor' => 3.78541],
            ['name' => 'Metro Cúbico', 'abbreviation' => 'M3', 'type' => 'volume', 'is_base' => false, 'base_conversion_factor' => 1000],
            ['name' => 'Barril', 'abbreviation' => 'BRL', 'type' => 'volume', 'is_base' => false, 'base_conversion_factor' => 159],

            // LONGITUD (length) - Base: Metro
            ['name' => 'Metro', 'abbreviation' => 'MT', 'type' => 'length', 'is_base' => true, 'base_conversion_factor' => 1],
            ['name' => 'Centímetro', 'abbreviation' => 'CM', 'type' => 'length', 'is_base' => false, 'base_conversion_factor' => 0.01],
            ['name' => 'Milímetro', 'abbreviation' => 'MM', 'type' => 'length', 'is_base' => false, 'base_conversion_factor' => 0.001],
            ['name' => 'Kilómetro', 'abbreviation' => 'KM', 'type' => 'length', 'is_base' => false, 'base_conversion_factor' => 1000],
            ['name' => 'Pulgada', 'abbreviation' => 'PLG', 'type' => 'length', 'is_base' => false, 'base_conversion_factor' => 0.0254],
            ['name' => 'Pie', 'abbreviation' => 'PIE', 'type' => 'length', 'is_base' => false, 'base_conversion_factor' => 0.3048],
            ['name' => 'Yarda', 'abbreviation' => 'YD', 'type' => 'length', 'is_base' => false, 'base_conversion_factor' => 0.9144],
            ['name' => 'Rollo', 'abbreviation' => 'RLL', 'type' => 'length', 'is_base' => false, 'base_conversion_factor' => null], // Variable según producto

            // ÁREA (area) - Base: Metro Cuadrado
            ['name' => 'Metro Cuadrado', 'abbreviation' => 'M2', 'type' => 'area', 'is_base' => true, 'base_conversion_factor' => 1],
            ['name' => 'Centímetro Cuadrado', 'abbreviation' => 'CM2', 'type' => 'area', 'is_base' => false, 'base_conversion_factor' => 0.0001],
            ['name' => 'Hectárea', 'abbreviation' => 'HA', 'type' => 'area', 'is_base' => false, 'base_conversion_factor' => 10000],

            // SERVICIOS
            ['name' => 'Hora', 'abbreviation' => 'HR', 'type' => 'service', 'is_base' => true, 'base_conversion_factor' => 1],
            ['name' => 'Día', 'abbreviation' => 'DIA', 'type' => 'service', 'is_base' => false, 'base_conversion_factor' => 24],
            ['name' => 'Mes', 'abbreviation' => 'MES', 'type' => 'service', 'is_base' => false, 'base_conversion_factor' => 720],
        ];

        foreach ($units as $unit) {
            \App\Models\UnitOfMeasure::create($unit);
        }
    }
}
