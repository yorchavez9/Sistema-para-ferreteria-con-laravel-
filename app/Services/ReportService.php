<?php

namespace App\Services;

use App\Models\Sale;
use App\Models\Customer;
use App\Models\CashSession;
use App\Models\Inventory;
use App\Models\PurchaseOrder;
use App\Models\Expense;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Brand;
use App\Models\User;
use App\Models\ExpenseCategory;
use Illuminate\Support\Facades\DB;

class ReportService
{
    // ========================================
    // REPORTES DE VENTAS
    // ========================================

    /**
     * Obtener reporte de ventas detallado
     */
    public function getSalesDetailed(array $filters = [])
    {
        $query = Sale::with(['customer', 'branch', 'user', 'details.product']);

        // Aplicar filtros
        if (!empty($filters['date_from'])) {
            $query->where('sale_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('sale_date', '<=', $filters['date_to']);
        }

        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['document_type'])) {
            $query->where('document_type', $filters['document_type']);
        }

        if (!empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        if (!empty($filters['payment_type'])) {
            $query->where('payment_type', $filters['payment_type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $sales = $query->orderBy('sale_date', 'desc')->get();

        // Calcular totales
        $totals = [
            'count' => $sales->count(),
            'subtotal' => $sales->sum('subtotal'),
            'tax' => $sales->sum('tax'),
            'discount' => $sales->sum('discount'),
            'total' => $sales->sum('total'),
            'avg_ticket' => $sales->count() > 0 ? $sales->sum('total') / $sales->count() : 0,
        ];

        // Totales por método de pago
        $totalsByPaymentMethod = $sales->groupBy('payment_method')->map(function ($group) {
            return [
                'count' => $group->count(),
                'total' => $group->sum('total'),
            ];
        });

        // Totales por tipo de documento
        $totalsByDocumentType = $sales->groupBy('document_type')->map(function ($group) {
            return [
                'count' => $group->count(),
                'total' => $group->sum('total'),
            ];
        });

        return [
            'sales' => $sales,
            'totals' => $totals,
            'totalsByPaymentMethod' => $totalsByPaymentMethod,
            'totalsByDocumentType' => $totalsByDocumentType,
            'filters' => $this->formatFilters($filters),
            'branches' => Branch::all(),
            'users' => User::all(),
            'customers' => Customer::all(),
            'reportTitle' => 'Reporte de Ventas Detallado',
            'dateFrom' => $filters['date_from'] ?? null,
            'dateTo' => $filters['date_to'] ?? null,
        ];
    }

    /**
     * Obtener reporte de ventas por cliente
     */
    public function getSalesByClient(array $filters = [])
    {
        $query = Customer::withCount('sales')
            ->with(['sales' => function ($q) use ($filters) {
                if (!empty($filters['date_from'])) {
                    $q->where('sale_date', '>=', $filters['date_from']);
                }
                if (!empty($filters['date_to'])) {
                    $q->where('sale_date', '<=', $filters['date_to']);
                }
            }]);

        if (!empty($filters['customer_id'])) {
            $query->where('id', $filters['customer_id']);
        }

        if (!empty($filters['customer_type'])) {
            $query->where('customer_type', $filters['customer_type']);
        }

        $customers = $query->get()->map(function ($customer) {
            $sales = $customer->sales;
            return [
                'customer' => $customer,
                'total_purchases' => $sales->count(),
                'total_amount' => $sales->sum('total'),
                'avg_ticket' => $sales->count() > 0 ? $sales->sum('total') / $sales->count() : 0,
                'last_purchase' => $sales->max('sale_date'),
                'first_purchase' => $sales->min('sale_date'),
            ];
        })->sortByDesc('total_amount');

        return [
            'customers' => $customers,
            'filters' => $this->formatFilters($filters),
            'allCustomers' => Customer::all(),
            'reportTitle' => 'Reporte de Ventas por Cliente',
            'dateFrom' => $filters['date_from'] ?? null,
            'dateTo' => $filters['date_to'] ?? null,
        ];
    }

    // ========================================
    // REPORTES DE CAJA
    // ========================================

    /**
     * Obtener reporte de caja diaria
     */
    public function getCashDaily(array $filters = [])
    {
        $query = CashSession::with(['cashRegister.branch', 'user', 'movements']);

        if (!empty($filters['date_from'])) {
            $query->whereDate('opened_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('opened_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        if (!empty($filters['cash_register_id'])) {
            $query->where('cash_register_id', $filters['cash_register_id']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $sessions = $query->orderBy('opened_at', 'desc')->get();

        // Calcular totales
        $totals = [
            'count' => $sessions->count(),
            'total_opening_balance' => $sessions->sum('opening_balance'),
            'total_expected_balance' => $sessions->where('status', 'cerrada')->sum('expected_balance'),
            'total_actual_balance' => $sessions->where('status', 'cerrada')->sum('actual_balance'),
            'total_difference' => $sessions->where('status', 'cerrada')->sum('difference'),
        ];

        return [
            'sessions' => $sessions,
            'totals' => $totals,
            'filters' => $this->formatFilters($filters),
            'branches' => Branch::all(),
            'cashRegisters' => \App\Models\CashRegister::all(),
            'users' => User::all(),
            'reportTitle' => 'Reporte de Caja Diaria',
            'dateFrom' => $filters['date_from'] ?? null,
            'dateTo' => $filters['date_to'] ?? null,
        ];
    }

    /**
     * Obtener reporte de arqueo de caja
     */
    public function getCashClosing($cashSessionId)
    {
        $session = CashSession::with([
            'cashRegister.branch',
            'user',
            'movements' => function ($q) {
                $q->orderBy('created_at', 'asc');
            }
        ])->findOrFail($cashSessionId);

        // Calcular movimientos por método de pago
        $movementsByPaymentMethod = $session->movements->groupBy('payment_method')->map(function ($group) {
            $ingresos = $group->whereIn('type', ['ingreso', 'venta', 'pago_credito', 'transferencia_entrada'])->sum('amount');
            $egresos = $group->whereIn('type', ['egreso', 'compra', 'gasto', 'transferencia_salida'])->sum('amount');

            return [
                'ingresos' => $ingresos,
                'egresos' => $egresos,
                'neto' => $ingresos - $egresos,
            ];
        });

        return [
            'session' => $session,
            'movementsByPaymentMethod' => $movementsByPaymentMethod,
            'reportTitle' => 'Arqueo de Caja',
        ];
    }

    // ========================================
    // REPORTES DE INVENTARIO
    // ========================================

    /**
     * Obtener reporte de inventario valorizado
     */
    public function getInventoryValued(array $filters = [])
    {
        $query = Inventory::with(['product.category', 'product.brand', 'branch']);

        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        if (!empty($filters['category_id'])) {
            $query->whereHas('product', function ($q) use ($filters) {
                $q->where('category_id', $filters['category_id']);
            });
        }

        if (!empty($filters['brand_id'])) {
            $query->whereHas('product', function ($q) use ($filters) {
                $q->where('brand_id', $filters['brand_id']);
            });
        }

        if (!empty($filters['stock_status'])) {
            if ($filters['stock_status'] === 'low') {
                $query->lowStock();
            } elseif ($filters['stock_status'] === 'out') {
                $query->outOfStock();
            } elseif ($filters['stock_status'] === 'normal') {
                $query->normalStock();
            }
        }

        $inventory = $query->get()->map(function ($item) {
            return [
                'product' => $item->product,
                'branch' => $item->branch,
                'current_stock' => $item->current_stock,
                'min_stock' => $item->min_stock,
                'max_stock' => $item->max_stock,
                'cost_price' => $item->cost_price,
                'sale_price' => $item->sale_price,
                'total_cost_value' => $item->current_stock * $item->cost_price,
                'total_sale_value' => $item->current_stock * $item->sale_price,
                'profit_margin' => $item->profit_margin,
                'stock_status' => $item->is_out_of_stock ? 'agotado' : ($item->is_low_stock ? 'bajo' : 'normal'),
            ];
        });

        // Calcular totales
        $totals = [
            'total_products' => $inventory->count(),
            'total_cost_value' => $inventory->sum('total_cost_value'),
            'total_sale_value' => $inventory->sum('total_sale_value'),
            'potential_profit' => $inventory->sum('total_sale_value') - $inventory->sum('total_cost_value'),
            'low_stock_count' => $inventory->where('stock_status', 'bajo')->count(),
            'out_stock_count' => $inventory->where('stock_status', 'agotado')->count(),
        ];

        return [
            'inventory' => $inventory,
            'totals' => $totals,
            'filters' => $this->formatFilters($filters),
            'branches' => Branch::all(),
            'categories' => Category::all(),
            'brands' => Brand::all(),
            'reportTitle' => 'Inventario Valorizado',
        ];
    }

    /**
     * Obtener reporte de movimientos de inventario
     */
    public function getInventoryMovements(array $filters = [])
    {
        // TODO: Implementar cuando se tenga tabla de movimientos de inventario
        // Por ahora retornar estructura básica

        return [
            'movements' => collect([]),
            'totals' => [],
            'filters' => $this->formatFilters($filters),
            'reportTitle' => 'Movimientos de Inventario',
        ];
    }

    // ========================================
    // REPORTES DE CUENTAS POR COBRAR
    // ========================================

    /**
     * Obtener reporte de cuentas por cobrar
     */
    public function getReceivables(array $filters = [])
    {
        $query = Sale::with(['customer', 'branch', 'user', 'payments'])
            ->where('payment_type', 'credito')
            ->where('status', 'pendiente');

        if (!empty($filters['date_from'])) {
            $query->where('sale_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('sale_date', '<=', $filters['date_to']);
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        $sales = $query->get()->map(function ($sale) {
            $overduePayments = $sale->payments()->overdue()->count();

            return [
                'sale' => $sale,
                'total_installments' => $sale->payments->count(),
                'paid_installments' => $sale->payments->where('status', 'pagado')->count(),
                'pending_installments' => $sale->payments->where('status', 'pendiente')->count(),
                'has_overdue' => $overduePayments > 0,
                'overdue_count' => $overduePayments,
                'max_days_overdue' => $sale->getMaxDaysOverdue(),
            ];
        });

        // Calcular totales
        $totals = [
            'total_sales' => $sales->count(),
            'total_amount' => $sales->sum('sale.total'),
            'total_paid' => $sales->sum(function ($item) {
                return $item['sale']->initial_payment + $item['sale']->payments->where('status', 'pagado')->sum('amount');
            }),
            'total_pending' => $sales->sum('sale.remaining_balance'),
            'total_overdue' => $sales->where('has_overdue', true)->sum('sale.remaining_balance'),
        ];

        return [
            'sales' => $sales,
            'totals' => $totals,
            'filters' => $this->formatFilters($filters),
            'customers' => Customer::all(),
            'branches' => Branch::all(),
            'reportTitle' => 'Cuentas por Cobrar',
            'dateFrom' => $filters['date_from'] ?? null,
            'dateTo' => $filters['date_to'] ?? null,
        ];
    }

    // ========================================
    // REPORTES DE COMPRAS
    // ========================================

    /**
     * Obtener reporte de compras
     */
    public function getPurchases(array $filters = [])
    {
        $query = PurchaseOrder::with(['supplier', 'branch', 'user', 'details.product']);

        if (!empty($filters['date_from'])) {
            $query->where('order_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('order_date', '<=', $filters['date_to']);
        }

        if (!empty($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $purchases = $query->orderBy('order_date', 'desc')->get();

        // Calcular totales
        $totals = [
            'count' => $purchases->count(),
            'subtotal' => $purchases->sum('subtotal'),
            'tax' => $purchases->sum('tax'),
            'discount' => $purchases->sum('discount'),
            'total' => $purchases->sum('total'),
        ];

        // Totales por estado
        $totalsByStatus = $purchases->groupBy('status')->map(function ($group) {
            return [
                'count' => $group->count(),
                'total' => $group->sum('total'),
            ];
        });

        return [
            'purchases' => $purchases,
            'totals' => $totals,
            'totalsByStatus' => $totalsByStatus,
            'filters' => $this->formatFilters($filters),
            'suppliers' => \App\Models\Supplier::all(),
            'branches' => Branch::all(),
            'reportTitle' => 'Reporte de Compras',
            'dateFrom' => $filters['date_from'] ?? null,
            'dateTo' => $filters['date_to'] ?? null,
        ];
    }

    // ========================================
    // REPORTES DE GASTOS
    // ========================================

    /**
     * Obtener reporte de gastos
     */
    public function getExpenses(array $filters = [])
    {
        $query = Expense::with(['category', 'branch', 'user', 'approvedBy']);

        if (!empty($filters['date_from'])) {
            $query->where('expense_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('expense_date', '<=', $filters['date_to']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('expense_category_id', $filters['category_id']);
        }

        if (!empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        $expenses = $query->orderBy('expense_date', 'desc')->get();

        // Calcular totales
        $totals = [
            'count' => $expenses->count(),
            'total' => $expenses->sum('amount'),
            'approved' => $expenses->where('status', 'aprobado')->sum('amount'),
            'pending' => $expenses->where('status', 'pendiente')->sum('amount'),
            'rejected' => $expenses->where('status', 'rechazado')->sum('amount'),
        ];

        // Totales por categoría
        $totalsByCategory = $expenses->groupBy('expense_category_id')->map(function ($group) {
            return [
                'category' => $group->first()->category->name ?? 'Sin categoría',
                'count' => $group->count(),
                'total' => $group->sum('amount'),
            ];
        });

        // Totales por método de pago
        $totalsByPaymentMethod = $expenses->groupBy('payment_method')->map(function ($group) {
            return [
                'count' => $group->count(),
                'total' => $group->sum('amount'),
            ];
        });

        return [
            'expenses' => $expenses,
            'totals' => $totals,
            'totalsByCategory' => $totalsByCategory,
            'totalsByPaymentMethod' => $totalsByPaymentMethod,
            'filters' => $this->formatFilters($filters),
            'categories' => ExpenseCategory::all(),
            'branches' => Branch::all(),
            'reportTitle' => 'Reporte de Gastos',
            'dateFrom' => $filters['date_from'] ?? null,
            'dateTo' => $filters['date_to'] ?? null,
        ];
    }

    // ========================================
    // REPORTES DE RENTABILIDAD
    // ========================================

    /**
     * Obtener reporte de rentabilidad por producto
     */
    public function getProfitabilityByProduct(array $filters = [])
    {
        // Obtener ventas en el período
        $salesQuery = DB::table('sale_details')
            ->join('sales', 'sale_details.sale_id', '=', 'sales.id')
            ->join('products', 'sale_details.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
            ->select(
                'products.id',
                'products.name as product_name',
                'products.code',
                'categories.name as category_name',
                'brands.name as brand_name',
                DB::raw('SUM(sale_details.quantity) as units_sold'),
                DB::raw('AVG(sale_details.unit_price) as avg_sale_price'),
                DB::raw('SUM(sale_details.subtotal) as total_sales')
            )
            ->where('sales.status', '!=', 'anulado');

        if (!empty($filters['date_from'])) {
            $salesQuery->where('sales.sale_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $salesQuery->where('sales.sale_date', '<=', $filters['date_to']);
        }

        if (!empty($filters['category_id'])) {
            $salesQuery->where('products.category_id', $filters['category_id']);
        }

        if (!empty($filters['brand_id'])) {
            $salesQuery->where('products.brand_id', $filters['brand_id']);
        }

        $products = $salesQuery->groupBy('products.id', 'products.name', 'products.code', 'categories.name', 'brands.name')
            ->orderByDesc('total_sales')
            ->get();

        // Obtener costos actuales de inventario
        $products = $products->map(function ($product) {
            $inventory = Inventory::where('product_id', $product->id)->first();
            $costPrice = $inventory ? $inventory->cost_price : 0;

            $totalCost = $product->units_sold * $costPrice;
            $grossProfit = $product->total_sales - $totalCost;
            $profitMargin = $totalCost > 0 ? (($grossProfit / $totalCost) * 100) : 0;

            return (object) [
                'product_name' => $product->product_name,
                'code' => $product->code,
                'category' => $product->category_name,
                'brand' => $product->brand_name ?? 'Sin marca',
                'units_sold' => $product->units_sold,
                'avg_cost_price' => $costPrice,
                'avg_sale_price' => $product->avg_sale_price,
                'total_cost' => $totalCost,
                'total_sales' => $product->total_sales,
                'gross_profit' => $grossProfit,
                'profit_margin' => round($profitMargin, 2),
            ];
        });

        // Aplicar límite si se especificó
        if (!empty($filters['top_n'])) {
            $products = $products->take($filters['top_n']);
        }

        // Calcular totales
        $totals = [
            'total_products' => $products->count(),
            'total_units_sold' => $products->sum('units_sold'),
            'total_cost' => $products->sum('total_cost'),
            'total_sales' => $products->sum('total_sales'),
            'total_profit' => $products->sum('gross_profit'),
            'avg_margin' => $products->count() > 0 ? $products->avg('profit_margin') : 0,
        ];

        return [
            'products' => $products,
            'totals' => $totals,
            'filters' => $this->formatFilters($filters),
            'categories' => Category::all(),
            'brands' => Brand::all(),
            'reportTitle' => 'Rentabilidad por Producto',
            'dateFrom' => $filters['date_from'] ?? null,
            'dateTo' => $filters['date_to'] ?? null,
        ];
    }

    // ========================================
    // HELPERS
    // ========================================

    /**
     * Formatear filtros para mostrar en el PDF
     */
    private function formatFilters(array $filters): array
    {
        $formatted = [];

        if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
            $formatted['Período'] = date('d/m/Y', strtotime($filters['date_from'])) . ' - ' . date('d/m/Y', strtotime($filters['date_to']));
        } elseif (!empty($filters['date_from'])) {
            $formatted['Desde'] = date('d/m/Y', strtotime($filters['date_from']));
        } elseif (!empty($filters['date_to'])) {
            $formatted['Hasta'] = date('d/m/Y', strtotime($filters['date_to']));
        }

        if (!empty($filters['branch_id'])) {
            $branch = Branch::find($filters['branch_id']);
            $formatted['Sucursal'] = $branch ? $branch->name : 'N/A';
        }

        if (!empty($filters['customer_id'])) {
            $customer = Customer::find($filters['customer_id']);
            $formatted['Cliente'] = $customer ? $customer->name : 'N/A';
        }

        if (!empty($filters['document_type'])) {
            $formatted['Tipo de Documento'] = strtoupper($filters['document_type']);
        }

        if (!empty($filters['payment_method'])) {
            $formatted['Método de Pago'] = ucfirst($filters['payment_method']);
        }

        if (!empty($filters['payment_type'])) {
            $formatted['Tipo de Pago'] = ucfirst($filters['payment_type']);
        }

        if (!empty($filters['status'])) {
            $formatted['Estado'] = ucfirst($filters['status']);
        }

        return $formatted;
    }
}
