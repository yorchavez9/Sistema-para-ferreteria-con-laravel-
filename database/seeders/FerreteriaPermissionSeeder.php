<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class FerreteriaPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Resetear permisos
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Gestión de Usuarios y Roles
            'user-list',
            'user-create',
            'user-edit',
            'user-delete',
            'role-list',
            'role-create',
            'role-edit',
            'role-delete',

            // Gestión de Sucursales
            'branch-list',
            'branch-create',
            'branch-edit',
            'branch-delete',

            // Gestión de Categorías
            'category-list',
            'category-create',
            'category-edit',
            'category-delete',

            // Gestión de Marcas
            'brand-list',
            'brand-create',
            'brand-edit',
            'brand-delete',

            // Gestión de Productos
            'product-list',
            'product-create',
            'product-edit',
            'product-delete',
            'product-import',
            'product-export',

            // Gestión de Proveedores
            'supplier-list',
            'supplier-create',
            'supplier-edit',
            'supplier-delete',

            // Gestión de Clientes
            'customer-list',
            'customer-create',
            'customer-edit',
            'customer-delete',

            // Gestión de Inventario
            'inventory-list',
            'inventory-edit',
            'inventory-adjustment',
            'inventory-transfer',
            'inventory-reports',

            // Compras
            'purchase-list',
            'purchase-create',
            'purchase-edit',
            'purchase-delete',
            'purchase-approve',
            'purchase-receive',

            // Ventas
            'sale-list',
            'sale-create',
            'sale-edit',
            'sale-delete',
            'sale-refund',

            // Cotizaciones
            'quote-list',
            'quote-create',
            'quote-edit',
            'quote-delete',
            'quote-convert',

            // Caja
            'cashier-open',
            'cashier-close',
            'cashier-list',
            'cashier-reports',

            // Reportes
            'reports-sales',
            'reports-inventory',
            'reports-financial',
            'reports-customers',
            'reports-suppliers',

            // Configuración
            'settings-view',
            'settings-edit',
            'settings-general',
            'settings-company',
            'settings-tax',
            'settings-backup',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
    }
}
