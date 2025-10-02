<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Inventory;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

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

        // Valor total del inventario por sucursal
        $inventoryByBranch = Branch::with('inventory')
            ->active()
            ->get()
            ->map(function ($branch) {
                return [
                    'name' => $branch->name,
                    'value' => $branch->inventory->sum(function ($item) {
                        return $item->current_stock * $item->cost_price;
                    }),
                    'items' => $branch->inventory->sum('current_stock'),
                ];
            });

        // Productos por categoría para gráfico de donas
        $productsByCategory = Category::withCount('products')
            ->having('products_count', '>', 0)
            ->get()
            ->map(function ($category) {
                return [
                    'name' => $category->name,
                    'value' => $category->products_count,
                ];
            });

        // Inventario por marca para gráfico de barras
        $inventoryByBrand = Brand::with(['products.inventory'])
            ->get()
            ->map(function ($brand) {
                $totalStock = $brand->products->flatMap->inventory->sum('current_stock');
                return [
                    'name' => $brand->name,
                    'stock' => $totalStock,
                ];
            })
            ->filter(fn($item) => $item['stock'] > 0)
            ->sortByDesc('stock')
            ->take(10)
            ->values();

        // Estado del stock para gráfico de donas
        $stockStatus = [
            [
                'name' => 'Stock Normal',
                'value' => Inventory::normalStock()->count(),
            ],
            [
                'name' => 'Stock Bajo',
                'value' => Inventory::lowStock()->count(),
            ],
            [
                'name' => 'Sin Stock',
                'value' => Inventory::outOfStock()->count(),
            ],
        ];

        // Ventas de los últimos 7 días (si existen)
        $salesLastWeek = [];
        if (class_exists('App\Models\Sale')) {
            $salesLastWeek = Sale::where('sale_date', '>=', now()->subDays(7))
                ->selectRaw('DATE(sale_date) as date, COUNT(*) as count, SUM(total) as total')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($sale) {
                    return [
                        'name' => \Carbon\Carbon::parse($sale->date)->format('d/m'),
                        'ventas' => $sale->count,
                        'monto' => round($sale->total, 2),
                    ];
                });
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'lowStockProducts' => $lowStockProducts,
            'inventoryByBranch' => $inventoryByBranch,
            'productsByCategory' => $productsByCategory,
            'inventoryByBrand' => $inventoryByBrand,
            'stockStatus' => $stockStatus,
            'salesLastWeek' => $salesLastWeek,
        ]);
    }
}
