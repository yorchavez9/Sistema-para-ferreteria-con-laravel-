<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class CashPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Permisos para Sesiones de Caja
        $cashPermissions = [
            'cash-list',
            'cash-open',
            'cash-close',
            'cash-view',
            'cash-movement',
        ];

        // Permisos para Cajas Registradoras
        $cashRegisterPermissions = [
            'cash-register-list',
            'cash-register-create',
            'cash-register-edit',
            'cash-register-delete',
        ];

        // Permisos para Gastos
        $expensePermissions = [
            'expense-list',
            'expense-create',
            'expense-edit',
            'expense-delete',
            'expense-approve',
            'expense-reject',
        ];

        // Permisos para Categorías de Gastos
        $expenseCategoryPermissions = [
            'expense-category-list',
            'expense-category-create',
            'expense-category-edit',
            'expense-category-delete',
        ];

        // Crear todos los permisos
        $allPermissions = array_merge(
            $cashPermissions,
            $cashRegisterPermissions,
            $expensePermissions,
            $expenseCategoryPermissions
        );

        foreach ($allPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Asignar permisos al rol Admin
        $adminRole = Role::where('name', 'Admin')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo($allPermissions);
        }

        // Asignar permisos básicos al rol Vendedor
        $vendedorRole = Role::where('name', 'Vendedor')->first();
        if ($vendedorRole) {
            $vendedorRole->givePermissionTo([
                'cash-list',
                'cash-open',
                'cash-close',
                'cash-view',
                'cash-movement',
                'expense-list',
                'expense-create',
            ]);
        }

        // Asignar permisos al rol Cajero (si existe)
        $cajeroRole = Role::where('name', 'Cajero')->first();
        if ($cajeroRole) {
            $cajeroRole->givePermissionTo([
                'cash-list',
                'cash-open',
                'cash-close',
                'cash-view',
                'cash-movement',
            ]);
        }

        // Asignar permisos al rol Gerente (si existe)
        $gerenteRole = Role::where('name', 'Gerente')->first();
        if ($gerenteRole) {
            $gerenteRole->givePermissionTo($allPermissions);
        }
    }
}
