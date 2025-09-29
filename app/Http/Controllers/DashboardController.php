<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Inventory;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_products' => Product::count(),
            'total_categories' => Category::count(),
            'total_brands' => Brand::count(),
            'total_branches' => Branch::active()->count(),
            'total_customers' => Customer::active()->count(),
            'total_suppliers' => Supplier::active()->count(),
            'low_stock_items' => Inventory::lowStock()->count(),
            'out_of_stock_items' => Inventory::outOfStock()->count(),
        ];

        // Productos con stock bajo
        $lowStockProducts = Inventory::with(['product', 'branch'])
            ->lowStock()
            ->limit(10)
            ->get();

        // Productos más vendidos (placeholder - implementar cuando tengamos ventas)
        $topProducts = Product::with(['category', 'brand'])
            ->active()
            ->limit(10)
            ->get();

        // Valor total del inventario por sucursal
        $inventoryByBranch = Branch::with('inventory')
            ->active()
            ->get()
            ->map(function ($branch) {
                return [
                    'branch_name' => $branch->name,
                    'total_value' => $branch->inventory->sum(function ($item) {
                        return $item->current_stock * $item->cost_price;
                    }),
                    'total_items' => $branch->inventory->sum('current_stock'),
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'lowStockProducts' => $lowStockProducts,
            'topProducts' => $topProducts,
            'inventoryByBranch' => $inventoryByBranch,
        ]);
    }
}
