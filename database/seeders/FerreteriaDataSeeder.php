<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\Inventory;

class FerreteriaDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear sucursales
        $branch1 = Branch::create([
            'name' => 'Sucursal Principal',
            'code' => 'SP001',
            'address' => 'Av. Principal 123, Lima',
            'phone' => '01-234-5678',
            'email' => 'principal@ferreteria.com',
            'manager_name' => 'Juan Pérez',
            'is_active' => true,
        ]);

        $branch2 = Branch::create([
            'name' => 'Sucursal Norte',
            'code' => 'SN002',
            'address' => 'Jr. Los Olivos 456, Lima Norte',
            'phone' => '01-987-6543',
            'email' => 'norte@ferreteria.com',
            'manager_name' => 'María García',
            'is_active' => true,
        ]);

        // Crear categorías principales
        $categoryHerramientas = Category::create([
            'name' => 'Herramientas',
            'code' => 'HER',
            'description' => 'Herramientas manuales y eléctricas',
            'is_active' => true,
        ]);

        $categoryElectricos = Category::create([
            'name' => 'Materiales Eléctricos',
            'code' => 'ELE',
            'description' => 'Cables, interruptores, tomacorrientes',
            'is_active' => true,
        ]);

        $categoryPlomeria = Category::create([
            'name' => 'Plomería',
            'code' => 'PLO',
            'description' => 'Tuberías, llaves, accesorios de baño',
            'is_active' => true,
        ]);

        // Crear subcategorías
        Category::create([
            'name' => 'Herramientas Manuales',
            'code' => 'HER-MAN',
            'parent_id' => $categoryHerramientas->id,
            'is_active' => true,
        ]);

        Category::create([
            'name' => 'Herramientas Eléctricas',
            'code' => 'HER-ELE',
            'parent_id' => $categoryHerramientas->id,
            'is_active' => true,
        ]);

        // Crear marcas
        $brandBosch = Brand::create([
            'name' => 'Bosch',
            'code' => 'BOSCH',
            'description' => 'Herramientas profesionales de calidad',
            'is_active' => true,
        ]);

        $brandDeWalt = Brand::create([
            'name' => 'DeWalt',
            'code' => 'DEWALT',
            'description' => 'Herramientas para construcción',
            'is_active' => true,
        ]);

        $brandIndeco = Brand::create([
            'name' => 'Indeco',
            'code' => 'INDECO',
            'description' => 'Materiales eléctricos peruanos',
            'is_active' => true,
        ]);

        // Crear proveedores
        $supplier1 = Supplier::create([
            'name' => 'Distribuidora Herramientas SAC',
            'code' => 'DH001',
            'document_type' => 'RUC',
            'document_number' => '20123456789',
            'address' => 'Av. Industrial 789, Lima',
            'phone' => '01-555-0001',
            'email' => 'ventas@disherramientas.com',
            'payment_terms' => 'credito_30',
            'is_active' => true,
        ]);

        $supplier2 = Supplier::create([
            'name' => 'Eléctricos del Perú EIRL',
            'code' => 'EP002',
            'document_type' => 'RUC',
            'document_number' => '20987654321',
            'address' => 'Jr. Electricidad 321, Lima',
            'phone' => '01-555-0002',
            'email' => 'contacto@electricosperu.com',
            'payment_terms' => 'credito_15',
            'is_active' => true,
        ]);

        // Crear clientes
        Customer::create([
            'name' => 'Constructora ABC SAC',
            'code' => 'C001',
            'document_type' => 'RUC',
            'document_number' => '20111222333',
            'customer_type' => 'empresa',
            'address' => 'Av. Construcción 100, Lima',
            'phone' => '01-666-0001',
            'email' => 'compras@constructoraabc.com',
            'payment_terms' => 'credito_30',
            'credit_limit' => 50000.00,
            'is_active' => true,
        ]);

        Customer::create([
            'name' => 'Carlos Mendoza',
            'code' => 'C002',
            'document_type' => 'DNI',
            'document_number' => '12345678',
            'customer_type' => 'personal',
            'address' => 'Jr. Los Pinos 456, Lima',
            'phone' => '987654321',
            'payment_terms' => 'contado',
            'is_active' => true,
        ]);

        // Crear productos
        $product1 = Product::create([
            'name' => 'Taladro Percutor 13mm',
            'code' => 'P001',
            'barcode' => '7894561230001',
            'description' => 'Taladro percutor profesional 13mm 600W',
            'category_id' => $categoryHerramientas->id,
            'brand_id' => $brandBosch->id,
            'unit_of_measure' => 'UND',
            'purchase_price' => 250.00,
            'sale_price' => 350.00,
            'min_stock' => 5,
            'max_stock' => 50,
            'is_active' => true,
        ]);

        $product2 = Product::create([
            'name' => 'Cable THW 2.5mm',
            'code' => 'P002',
            'barcode' => '7894561230002',
            'description' => 'Cable eléctrico THW 2.5mm x 100m',
            'category_id' => $categoryElectricos->id,
            'brand_id' => $brandIndeco->id,
            'unit_of_measure' => 'MTR',
            'purchase_price' => 180.00,
            'sale_price' => 220.00,
            'min_stock' => 10,
            'max_stock' => 100,
            'is_active' => true,
        ]);

        $product3 = Product::create([
            'name' => 'Llave de Paso 1/2"',
            'code' => 'P003',
            'description' => 'Llave de paso de bronce 1/2 pulgada',
            'category_id' => $categoryPlomeria->id,
            'brand_id' => $brandIndeco->id,
            'unit_of_measure' => 'UND',
            'purchase_price' => 15.00,
            'sale_price' => 22.00,
            'min_stock' => 20,
            'max_stock' => 200,
            'is_active' => true,
        ]);

        // Crear inventario inicial
        Inventory::create([
            'product_id' => $product1->id,
            'branch_id' => $branch1->id,
            'current_stock' => 25,
            'min_stock' => 5,
            'max_stock' => 50,
            'cost_price' => 250.00,
            'sale_price' => 350.00,
            'location' => 'A-01-001',
        ]);

        Inventory::create([
            'product_id' => $product1->id,
            'branch_id' => $branch2->id,
            'current_stock' => 15,
            'min_stock' => 3,
            'max_stock' => 30,
            'cost_price' => 250.00,
            'sale_price' => 350.00,
            'location' => 'B-01-001',
        ]);

        Inventory::create([
            'product_id' => $product2->id,
            'branch_id' => $branch1->id,
            'current_stock' => 50,
            'min_stock' => 10,
            'max_stock' => 100,
            'cost_price' => 180.00,
            'sale_price' => 220.00,
            'location' => 'A-02-001',
        ]);

        Inventory::create([
            'product_id' => $product3->id,
            'branch_id' => $branch1->id,
            'current_stock' => 100,
            'min_stock' => 20,
            'max_stock' => 200,
            'cost_price' => 15.00,
            'sale_price' => 22.00,
            'location' => 'A-03-001',
        ]);
    }
}
