<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class FerreteriaRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear roles
        $adminRole = Role::create(['name' => 'Administrador']);
        $managerRole = Role::create(['name' => 'Gerente']);
        $sellerRole = Role::create(['name' => 'Vendedor']);
        $cashierRole = Role::create(['name' => 'Cajero']);
        $warehouseRole = Role::create(['name' => 'Almacenero']);

        // Obtener todos los permisos
        $allPermissions = Permission::all();

        // Asignar permisos al Administrador (todos los permisos)
        $adminRole->givePermissionTo($allPermissions);

        // Permisos para Gerente
        $managerPermissions = [
            // Consultas
            'branch-list', 'category-list', 'brand-list', 'product-list',
            'supplier-list', 'customer-list', 'inventory-list',
            'purchase-list', 'sale-list', 'quote-list',

            // Gestión de productos y categorías
            'category-create', 'category-edit', 'category-delete',
            'brand-create', 'brand-edit', 'brand-delete',
            'product-create', 'product-edit', 'product-delete',
            'product-import', 'product-export',

            // Gestión de proveedores y clientes
            'supplier-create', 'supplier-edit', 'supplier-delete',
            'customer-create', 'customer-edit', 'customer-delete',

            // Inventario
            'inventory-edit', 'inventory-adjustment', 'inventory-transfer',

            // Compras
            'purchase-create', 'purchase-edit', 'purchase-approve', 'purchase-receive',

            // Ventas y cotizaciones
            'sale-create', 'sale-edit', 'sale-refund',
            'quote-create', 'quote-edit', 'quote-delete', 'quote-convert',

            // Reportes
            'reports-sales', 'reports-inventory', 'reports-financial',
            'reports-customers', 'reports-suppliers',

            // Caja
            'cashier-list', 'cashier-reports',

            // Configuración
            'settings-view', 'settings-edit',
        ];
        $managerRole->givePermissionTo($managerPermissions);

        // Permisos para Vendedor
        $sellerPermissions = [
            // Consultas básicas
            'product-list', 'customer-list', 'inventory-list',
            'sale-list', 'quote-list',

            // Gestión de clientes
            'customer-create', 'customer-edit',

            // Ventas y cotizaciones
            'sale-create', 'sale-edit',
            'quote-create', 'quote-edit', 'quote-convert',
        ];
        $sellerRole->givePermissionTo($sellerPermissions);

        // Permisos para Cajero
        $cashierPermissions = [
            // Consultas básicas
            'product-list', 'customer-list', 'inventory-list', 'sale-list',

            // Ventas
            'sale-create', 'sale-edit', 'sale-refund',

            // Caja
            'cashier-open', 'cashier-close', 'cashier-list',

            // Clientes básico
            'customer-create',
        ];
        $cashierRole->givePermissionTo($cashierPermissions);

        // Permisos para Almacenero
        $warehousePermissions = [
            // Consultas
            'product-list', 'supplier-list', 'inventory-list',
            'purchase-list',

            // Inventario
            'inventory-edit', 'inventory-adjustment', 'inventory-transfer',

            // Compras (recepción)
            'purchase-receive',
        ];
        $warehouseRole->givePermissionTo($warehousePermissions);

        // Crear usuario administrador
        $admin = User::create([
            'name' => 'Administrador',
            'email' => 'admin@ferreteria.com',
            'password' => bcrypt('123456'),
            'email_verified_at' => now(),
        ]);

        $admin->assignRole($adminRole);
    }
}
