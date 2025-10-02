<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class CreateAdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear rol de Administrador con todos los permisos
        $adminRole = Role::firstOrCreate(['name' => 'Administrador']);
        $permissions = Permission::pluck('id', 'id')->all();
        $adminRole->syncPermissions($permissions);

        // Crear rol de Gerente con permisos limitados
        $managerRole = Role::firstOrCreate(['name' => 'Gerente']);
        $managerPermissions = Permission::whereIn('name', [
            'product-list', 'product-create', 'product-edit',
            'category-list', 'category-create', 'category-edit',
            'brand-list', 'brand-create', 'brand-edit',
            'inventory-list', 'inventory-edit',
            'supplier-list', 'supplier-create', 'supplier-edit',
            'customer-list', 'customer-create', 'customer-edit',
            'purchase-order-list', 'purchase-order-create', 'purchase-order-edit',
            'sale-list', 'sale-create', 'sale-edit',
            'payment-list', 'payment-create',
            'quote-list', 'quote-create', 'quote-edit',
            'report-sales', 'report-inventory', 'report-purchases',
        ])->pluck('id', 'id')->all();
        $managerRole->syncPermissions($managerPermissions);

        // Crear rol de Vendedor
        $sellerRole = Role::firstOrCreate(['name' => 'Vendedor']);
        $sellerPermissions = Permission::whereIn('name', [
            'product-list',
            'inventory-list',
            'customer-list', 'customer-create', 'customer-edit',
            'sale-list', 'sale-create',
            'payment-list', 'payment-create',
            'quote-list', 'quote-create', 'quote-edit',
        ])->pluck('id', 'id')->all();
        $sellerRole->syncPermissions($sellerPermissions);

        // Crear rol de Almacenero
        $warehouseRole = Role::firstOrCreate(['name' => 'Almacenero']);
        $warehousePermissions = Permission::whereIn('name', [
            'product-list',
            'inventory-list', 'inventory-create', 'inventory-edit',
            'purchase-order-list',
            'supplier-list',
        ])->pluck('id', 'id')->all();
        $warehouseRole->syncPermissions($warehousePermissions);

        // Crear usuario Administrador
        $admin = User::firstOrCreate(
            ['email' => 'admin@ferreteria.com'],
            [
                'name' => 'Administrador',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->syncRoles([$adminRole->id]);

        // Crear usuario Gerente de ejemplo
        $manager = User::firstOrCreate(
            ['email' => 'gerente@ferreteria.com'],
            [
                'name' => 'Gerente Principal',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $manager->syncRoles([$managerRole->id]);
    }
}
