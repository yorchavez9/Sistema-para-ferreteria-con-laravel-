<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExpenseCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Servicios Básicos',
                'code' => 'SERV_BAS',
                'description' => 'Agua, luz, internet, teléfono, etc.',
                'color' => '#3b82f6', // Azul
                'is_active' => true,
            ],
            [
                'name' => 'Alquiler',
                'code' => 'ALQUILER',
                'description' => 'Alquiler del local comercial',
                'color' => '#8b5cf6', // Púrpura
                'is_active' => true,
            ],
            [
                'name' => 'Sueldos y Salarios',
                'code' => 'SUELDOS',
                'description' => 'Pago de personal',
                'color' => '#10b981', // Verde
                'is_active' => true,
            ],
            [
                'name' => 'Mantenimiento',
                'code' => 'MANTEN',
                'description' => 'Mantenimiento de equipos, local, etc.',
                'color' => '#f59e0b', // Ámbar
                'is_active' => true,
            ],
            [
                'name' => 'Transporte',
                'code' => 'TRANSP',
                'description' => 'Combustible, pasajes, envíos',
                'color' => '#6366f1', // Índigo
                'is_active' => true,
            ],
            [
                'name' => 'Publicidad y Marketing',
                'code' => 'MARKET',
                'description' => 'Publicidad, promociones, marketing',
                'color' => '#ec4899', // Rosa
                'is_active' => true,
            ],
            [
                'name' => 'Impuestos y Tasas',
                'code' => 'IMPUEST',
                'description' => 'Impuestos municipales, tasas, licencias',
                'color' => '#ef4444', // Rojo
                'is_active' => true,
            ],
            [
                'name' => 'Útiles y Materiales',
                'code' => 'UTILES',
                'description' => 'Útiles de oficina, materiales de limpieza',
                'color' => '#14b8a6', // Teal
                'is_active' => true,
            ],
            [
                'name' => 'Honorarios Profesionales',
                'code' => 'HONOR',
                'description' => 'Contador, abogado, asesorías',
                'color' => '#a855f7', // Violeta
                'is_active' => true,
            ],
            [
                'name' => 'Otros Gastos',
                'code' => 'OTROS',
                'description' => 'Gastos varios no categorizados',
                'color' => '#6b7280', // Gris
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            DB::table('expense_categories')->insert(array_merge($category, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
