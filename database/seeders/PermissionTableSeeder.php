<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Permisos de Roles
            'role-list',
            'role-create',
            'role-edit',
            'role-delete',

            // Permisos de Usuarios
            'user-list',
            'user-create',
            'user-edit',
            'user-delete',

            // Permisos de Productos
            'product-list',
            'product-create',
            'product-edit',
            'product-delete',

            // Permisos de Categorías
            'category-list',
            'category-create',
            'category-edit',
            'category-delete',

            // Permisos de Marcas
            'brand-list',
            'brand-create',
            'brand-edit',
            'brand-delete',

            // Permisos de Sucursales
            'branch-list',
            'branch-create',
            'branch-edit',
            'branch-delete',

            // Permisos de Inventario
            'inventory-list',
            'inventory-create',
            'inventory-edit',
            'inventory-delete',

            // Permisos de Proveedores
            'supplier-list',
            'supplier-create',
            'supplier-edit',
            'supplier-delete',

            // Permisos de Clientes
            'customer-list',
            'customer-create',
            'customer-edit',
            'customer-delete',

            // Permisos de Órdenes de Compra
            'purchase-order-list',
            'purchase-order-create',
            'purchase-order-edit',
            'purchase-order-delete',

            // Permisos de Ventas/Facturas
            'sale-list',
            'sale-create',
            'sale-edit',
            'sale-delete',

            // Permisos de Pagos
            'payment-list',
            'payment-create',
            'payment-edit',
            'payment-delete',

            // Permisos de Cotizaciones
            'quote-list',
            'quote-create',
            'quote-edit',
            'quote-delete',

            // Permisos de Reportes
            'report-sales',
            'report-inventory',
            'report-purchases',
            'report-financial',

            // Permisos de Configuración
            'settings-view',
            'settings-edit',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
