<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\InventoryController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Productos
    Route::resource('products', ProductController::class)->middleware([
        'permission:product-list|product-create|product-edit|product-delete'
    ]);

    // Categorías
    Route::resource('categories', CategoryController::class)->middleware([
        'permission:category-list|category-create|category-edit|category-delete'
    ]);

    // Inventario - Rutas personalizadas ANTES del resource
    Route::get('inventory/adjustment', [InventoryController::class, 'adjustment'])->name('inventory.adjustment')->middleware('permission:inventory-adjustment');
    Route::post('inventory/adjustment', [InventoryController::class, 'processAdjustment'])->name('inventory.adjustment.process')->middleware('permission:inventory-adjustment');
    Route::get('inventory/low-stock', [InventoryController::class, 'lowStockReport'])->name('inventory.low-stock')->middleware('permission:inventory-list');

    // Inventario - Resource routes
    Route::resource('inventory', InventoryController::class)->except(['create', 'store', 'destroy'])->middleware([
        'permission:inventory-list|inventory-edit'
    ]);

    // Marcas
    Route::resource('brands', \App\Http\Controllers\BrandController::class)->middleware([
        'permission:brand-list|brand-create|brand-edit|brand-delete'
    ]);

    // Sucursales
    Route::resource('branches', \App\Http\Controllers\BranchController::class)->middleware([
        'permission:branch-list|branch-create|branch-edit|branch-delete'
    ]);

    // Proveedores
    Route::resource('suppliers', \App\Http\Controllers\SupplierController::class);

    // Clientes
    Route::resource('customers', \App\Http\Controllers\CustomerController::class);

    // Órdenes de Compra - Rutas personalizadas ANTES del resource
    Route::post('purchase-orders/{purchaseOrder}/receive', [\App\Http\Controllers\PurchaseOrderController::class, 'receive'])->name('purchase-orders.receive');

    // Órdenes de Compra - Resource routes
    Route::resource('purchase-orders', \App\Http\Controllers\PurchaseOrderController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
