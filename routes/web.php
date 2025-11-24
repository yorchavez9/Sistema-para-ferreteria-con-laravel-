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

    // Productos - Rutas personalizadas ANTES del resource
    Route::post('products/import', [ProductController::class, 'import'])->name('products.import');
    Route::get('products/template', [ProductController::class, 'downloadTemplate'])->name('products.template');

    // Productos - Resource routes
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

    // Cotizaciones - Rutas personalizadas ANTES del resource
    Route::post('quotes/{quote}/duplicate', [\App\Http\Controllers\QuoteController::class, 'duplicate'])->name('quotes.duplicate');
    Route::get('quotes/{quote}/pdf', [\App\Http\Controllers\QuoteController::class, 'pdf'])->name('quotes.pdf');

    // Cotizaciones - Resource routes
    Route::resource('quotes', \App\Http\Controllers\QuoteController::class)->middleware([
        'permission:quote-list|quote-create|quote-edit|quote-delete'
    ]);

    // Pagos de Ventas a Crédito
    Route::get('payments', [\App\Http\Controllers\PaymentController::class, 'index'])->name('payments.index');
    Route::get('payments/sales/{sale}', [\App\Http\Controllers\PaymentController::class, 'show'])->name('payments.show');
    Route::get('payments/{payment}/pay', [\App\Http\Controllers\PaymentController::class, 'showPayForm'])->name('payments.pay.form');
    Route::post('payments/{payment}/pay', [\App\Http\Controllers\PaymentController::class, 'pay'])->name('payments.pay');
    Route::post('payments/pay-multiple', [\App\Http\Controllers\PaymentController::class, 'payMultiple'])->name('payments.pay-multiple');
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

    // ========== MÓDULO DE CAJA ==========

    // Sesiones de Caja - Rutas personalizadas
    Route::prefix('cash')->name('cash.')->group(function () {
        Route::get('/', [\App\Http\Controllers\CashSessionController::class, 'index'])->name('index');
        Route::get('/open', [\App\Http\Controllers\CashSessionController::class, 'create'])->name('create');
        Route::post('/open', [\App\Http\Controllers\CashSessionController::class, 'store'])->name('store');
        Route::get('/close', [\App\Http\Controllers\CashSessionController::class, 'closeForm'])->name('close.form');
        Route::post('/close', [\App\Http\Controllers\CashSessionController::class, 'close'])->name('close');
        Route::post('/{cashSession}/reopen', [\App\Http\Controllers\CashSessionController::class, 'reopen'])->name('reopen');
        Route::get('/current', [\App\Http\Controllers\CashSessionController::class, 'current'])->name('current');
        Route::get('/{cashSession}', [\App\Http\Controllers\CashSessionController::class, 'show'])->name('show');
        Route::post('/income', [\App\Http\Controllers\CashSessionController::class, 'addIncome'])->name('income');
        Route::post('/egress', [\App\Http\Controllers\CashSessionController::class, 'addEgress'])->name('egress');
    });

    // Cajas Registradoras
    Route::resource('cash-registers', \App\Http\Controllers\CashRegisterController::class);

    // Gastos - Rutas personalizadas
    Route::post('expenses/{expense}/approve', [\App\Http\Controllers\ExpenseController::class, 'approve'])->name('expenses.approve');
    Route::post('expenses/{expense}/reject', [\App\Http\Controllers\ExpenseController::class, 'reject'])->name('expenses.reject');

    // Gastos - Resource routes
    Route::resource('expenses', \App\Http\Controllers\ExpenseController::class);

    // Categorías de Gastos
    Route::resource('expense-categories', \App\Http\Controllers\ExpenseCategoryController::class);

    // ========== MÓDULO DE REPORTES ==========

    Route::prefix('reports')->name('reports.')->group(function () {
        // Vista principal de reportes
        Route::get('/', [\App\Http\Controllers\ReportController::class, 'index'])->name('index');

        // PDF de prueba
        Route::get('/test-pdf', [\App\Http\Controllers\ReportController::class, 'testPdf'])->name('test.pdf');

        // Reportes de Ventas
        Route::get('/sales/detailed', [\App\Http\Controllers\ReportController::class, 'salesDetailed'])->name('sales.detailed');
        Route::get('/sales/detailed/pdf', [\App\Http\Controllers\ReportController::class, 'salesDetailedPdf'])->name('sales.detailed.pdf');
        Route::get('/sales/by-client', [\App\Http\Controllers\ReportController::class, 'salesByClient'])->name('sales.by-client');
        Route::get('/sales/by-client/pdf', [\App\Http\Controllers\ReportController::class, 'salesByClientPdf'])->name('sales.by-client.pdf');

        // Reportes de Caja
        Route::get('/cash/daily', [\App\Http\Controllers\ReportController::class, 'cashDaily'])->name('cash.daily');
        Route::get('/cash/daily/pdf', [\App\Http\Controllers\ReportController::class, 'cashDailyPdf'])->name('cash.daily.pdf');
        Route::get('/cash/closing/{cashSession}', [\App\Http\Controllers\ReportController::class, 'cashClosing'])->name('cash.closing');
        Route::get('/cash/closing/{cashSession}/pdf', [\App\Http\Controllers\ReportController::class, 'cashClosingPdf'])->name('cash.closing.pdf');

        // Reportes de Inventario
        Route::get('/inventory/valued', [\App\Http\Controllers\ReportController::class, 'inventoryValued'])->name('inventory.valued');
        Route::get('/inventory/valued/pdf', [\App\Http\Controllers\ReportController::class, 'inventoryValuedPdf'])->name('inventory.valued.pdf');
        Route::get('/inventory/movements', [\App\Http\Controllers\ReportController::class, 'inventoryMovements'])->name('inventory.movements');
        Route::get('/inventory/movements/pdf', [\App\Http\Controllers\ReportController::class, 'inventoryMovementsPdf'])->name('inventory.movements.pdf');

        // Reportes de Cuentas por Cobrar
        Route::get('/receivables', [\App\Http\Controllers\ReportController::class, 'receivables'])->name('receivables');
        Route::get('/receivables/pdf', [\App\Http\Controllers\ReportController::class, 'receivablesPdf'])->name('receivables.pdf');

        // Reportes de Compras
        Route::get('/purchases', [\App\Http\Controllers\ReportController::class, 'purchases'])->name('purchases');
        Route::get('/purchases/pdf', [\App\Http\Controllers\ReportController::class, 'purchasesPdf'])->name('purchases.pdf');

        // Reportes de Gastos
        Route::get('/expenses', [\App\Http\Controllers\ReportController::class, 'expenses'])->name('expenses');
        Route::get('/expenses/pdf', [\App\Http\Controllers\ReportController::class, 'expensesPdf'])->name('expenses.pdf');

        // Reportes de Rentabilidad
        Route::get('/profitability/by-product', [\App\Http\Controllers\ReportController::class, 'profitabilityByProduct'])->name('profitability.by-product');
        Route::get('/profitability/by-product/pdf', [\App\Http\Controllers\ReportController::class, 'profitabilityByProductPdf'])->name('profitability.by-product.pdf');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
