<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // API Routes
    Route::get('api/products/search', [ProductController::class, 'search'])->name('api.products.search');
    Route::get('api/customers/search', [\App\Http\Controllers\CustomerController::class, 'searchApi'])->name('api.customers.search');
    Route::get('api/suppliers/search', [\App\Http\Controllers\SupplierController::class, 'searchApi'])->name('api.suppliers.search');
    Route::get('api/suppliers/external-search/{document}', [\App\Http\Controllers\SupplierController::class, 'externalSearch'])->name('api.suppliers.external-search');

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

    // Proveedores - Rutas personalizadas ANTES del resource
    Route::post('suppliers/quick-store', [\App\Http\Controllers\SupplierController::class, 'quickStore'])->name('suppliers.quick-store');

    // Proveedores - Resource routes
    Route::resource('suppliers', \App\Http\Controllers\SupplierController::class);

    // Clientes - Rutas personalizadas ANTES del resource
    Route::post('customers/search-by-document', [\App\Http\Controllers\CustomerController::class, 'searchByDocument'])->name('customers.search-by-document');
    Route::post('customers/consultar-documento', [\App\Http\Controllers\CustomerController::class, 'consultarDocumento'])->name('customers.consultar-documento');
    Route::post('customers/quick-store', [\App\Http\Controllers\CustomerController::class, 'quickStore'])->name('customers.quick-store');

    // Clientes - Resource routes
    Route::resource('customers', \App\Http\Controllers\CustomerController::class);

    // Órdenes de Compra - Rutas personalizadas ANTES del resource
    Route::post('purchase-orders/{purchaseOrder}/receive', [\App\Http\Controllers\PurchaseOrderController::class, 'receive'])->name('purchase-orders.receive');
    Route::get('purchase-orders/{purchaseOrder}/pdf', [\App\Http\Controllers\PurchaseOrderController::class, 'pdf'])->name('purchase-orders.pdf');

    // Órdenes de Compra - Resource routes
    Route::resource('purchase-orders', \App\Http\Controllers\PurchaseOrderController::class);

    // Ventas - Rutas personalizadas ANTES del resource
    Route::post('sales/{sale}/cancel', [\App\Http\Controllers\SaleController::class, 'cancel'])->name('sales.cancel');
    Route::get('sales/{sale}/pdf', [\App\Http\Controllers\SaleController::class, 'pdf'])->name('sales.pdf');

    // Ventas - Resource routes
    Route::resource('sales', \App\Http\Controllers\SaleController::class);

    // Pagos de Ventas a Crédito
    Route::get('payments', [\App\Http\Controllers\PaymentController::class, 'index'])->name('payments.index');
    Route::get('payments/sales/{sale}', [\App\Http\Controllers\PaymentController::class, 'show'])->name('payments.show');
    Route::get('payments/{payment}/pay', [\App\Http\Controllers\PaymentController::class, 'showPayForm'])->name('payments.pay.form');
    Route::post('payments/{payment}/pay', [\App\Http\Controllers\PaymentController::class, 'pay'])->name('payments.pay');
    Route::get('payments/{payment}/voucher', [\App\Http\Controllers\PaymentController::class, 'voucher'])->name('payments.voucher');
    Route::post('payments/update-overdue', [\App\Http\Controllers\PaymentController::class, 'updateOverdueStatuses'])->name('payments.update-overdue');

    // Usuarios
    Route::resource('users', UserController::class)->middleware([
        'permission:user-list|user-create|user-edit|user-delete'
    ]);

    // Roles y Permisos
    Route::resource('roles', RoleController::class)->middleware([
        'permission:role-list|role-create|role-edit|role-delete'
    ]);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
