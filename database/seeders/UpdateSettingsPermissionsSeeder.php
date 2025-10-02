<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UpdateSettingsPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar caché de permisos
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Crear los nuevos permisos si no existen
        $settingsPermissions = ['settings-view', 'settings-edit'];

        foreach ($settingsPermissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }

        // Asignar permisos al rol Administrador
        $adminRole = Role::where('name', 'Administrador')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo($settingsPermissions);
            if ($this->command) {
                $this->command->info('Permisos de configuraciones asignados al rol Administrador');
            }
        }

        // Asignar permisos al rol Gerente
        $managerRole = Role::where('name', 'Gerente')->first();
        if ($managerRole) {
            $managerRole->givePermissionTo($settingsPermissions);
            if ($this->command) {
                $this->command->info('Permisos de configuraciones asignados al rol Gerente');
            }
        }

        if ($this->command) {
            $this->command->info('¡Permisos de configuraciones actualizados correctamente!');
        }
    }
}
