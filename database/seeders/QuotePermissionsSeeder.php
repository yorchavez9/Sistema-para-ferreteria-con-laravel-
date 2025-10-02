<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class QuotePermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Asignar permisos de cotizaciones al rol Administrador
        $admin = Role::where('name', 'Administrador')->first();
        if ($admin) {
            $admin->givePermissionTo([
                'quote-list',
                'quote-create',
                'quote-edit',
                'quote-delete',
            ]);
            $this->command->info('Permisos de cotizaciones asignados al rol Administrador');
        }

        // Asignar permisos de cotizaciones al rol Vendedor si existe
        $vendedor = Role::where('name', 'Vendedor')->first();
        if ($vendedor) {
            $vendedor->givePermissionTo([
                'quote-list',
                'quote-create',
                'quote-edit',
            ]);
            $this->command->info('Permisos de cotizaciones asignados al rol Vendedor');
        }

        // Asignar permisos de solo lectura al rol Almacenero si existe
        $almacenero = Role::where('name', 'Almacenero')->first();
        if ($almacenero) {
            $almacenero->givePermissionTo([
                'quote-list',
            ]);
            $this->command->info('Permisos de cotizaciones asignados al rol Almacenero');
        }
    }
}
