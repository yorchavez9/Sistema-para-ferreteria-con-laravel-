<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Página principal de reportes
     */
    public function index()
    {
        return Inertia::render('Reports/Index');
    }

    /**
     * PDF de prueba para verificar configuración
     */
    public function testPdf()
    {
        $data = [
            'reportTitle' => 'Reporte de Prueba',
            'period' => 'Prueba del Sistema',
            'filters' => [
                'Prueba' => 'Este es un filtro de prueba',
                'Estado' => 'Funcionando'
            ],
        ];

        $pdf = PDF::loadView('pdf.reports.test', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('prueba-pdf.pdf');
    }

    // ========================================
    // REPORTES DE VENTAS
    // ========================================

    public function salesDetailed(Request $request)
    {
        $data = $this->reportService->getSalesDetailed($request->all());
        return Inertia::render('Reports/Sales/Detailed', $data);
    }

    public function salesDetailedPdf(Request $request)
    {
        $filters = $request->all();
        $filters['per_page'] = 99999;
        $data = $this->reportService->getSalesDetailed($filters);

        // Convertir paginator a colección para el PDF
        $data['sales'] = collect($data['sales']->items());

        $pdf = PDF::loadView('pdf.reports.sales.detailed', $data);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('reporte-ventas-detallado-' . now()->format('Y-m-d') . '.pdf');
    }

    public function salesByClient(Request $request)
    {
        $data = $this->reportService->getSalesByClient($request->all());
        return Inertia::render('Reports/Sales/ByClient', $data);
    }

    public function salesByClientPdf(Request $request)
    {
        $data = $this->reportService->getSalesByClient($request->all());

        $pdf = PDF::loadView('pdf.reports.sales.by-client', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('reporte-ventas-por-cliente-' . now()->format('Y-m-d') . '.pdf');
    }

    // ========================================
    // REPORTES DE CAJA
    // ========================================

    public function cashDaily(Request $request)
    {
        $data = $this->reportService->getCashDaily($request->all());
        return Inertia::render('Reports/Cash/Daily', $data);
    }

    public function cashDailyPdf(Request $request)
    {
        $filters = $request->all();
        $filters['per_page'] = 99999;
        $data = $this->reportService->getCashDaily($filters);

        // Convertir paginator a colección
        $data['sessions'] = collect($data['sessions']->items());

        $pdf = PDF::loadView('pdf.reports.cash.daily', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('reporte-caja-diaria-' . now()->format('Y-m-d') . '.pdf');
    }

    public function cashClosing($cashSessionId)
    {
        $data = $this->reportService->getCashClosing($cashSessionId);
        return Inertia::render('Reports/Cash/Closing', $data);
    }

    public function cashClosingPdf($cashSessionId)
    {
        $data = $this->reportService->getCashClosing($cashSessionId);

        $pdf = PDF::loadView('pdf.reports.cash.closing', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('arqueo-caja-' . $data['session']->id . '.pdf');
    }

    // ========================================
    // REPORTES DE INVENTARIO
    // ========================================

    public function inventoryValued(Request $request)
    {
        $data = $this->reportService->getInventoryValued($request->all());
        return Inertia::render('Reports/Inventory/Valued', $data);
    }

    public function inventoryValuedPdf(Request $request)
    {
        $filters = $request->all();
        $filters['per_page'] = 99999;
        $data = $this->reportService->getInventoryValued($filters);

        // Convertir paginator a colección
        $data['inventory'] = collect($data['inventory']->items());

        $pdf = PDF::loadView('pdf.reports.inventory.valued', $data);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('inventario-valorizado-' . now()->format('Y-m-d') . '.pdf');
    }

    public function inventoryMovements(Request $request)
    {
        $data = $this->reportService->getInventoryMovements($request->all());
        return Inertia::render('Reports/Inventory/Movements', $data);
    }

    public function inventoryMovementsPdf(Request $request)
    {
        $data = $this->reportService->getInventoryMovements($request->all());

        $pdf = PDF::loadView('pdf.reports.inventory.movements', $data);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('movimientos-inventario-' . now()->format('Y-m-d') . '.pdf');
    }

    // ========================================
    // REPORTES DE CUENTAS POR COBRAR
    // ========================================

    public function receivables(Request $request)
    {
        $data = $this->reportService->getReceivables($request->all());
        return Inertia::render('Reports/Receivables/Index', $data);
    }

    public function receivablesPdf(Request $request)
    {
        $filters = $request->all();
        $filters['per_page'] = 99999;
        $data = $this->reportService->getReceivables($filters);

        // Renombrar 'sales' a 'receivables' y convertir paginator
        $items = collect($data['sales']->items());

        // Transformar items para que tengan las claves que espera la plantilla
        $data['receivables'] = $items->map(function ($item) {
            $sale = $item['sale'];
            return [
                'sale' => $sale,
                'total_installments' => $item['total_installments'],
                'paid_installments' => $item['paid_installments'],
                'initial_payment' => $sale->initial_payment ?? 0,
                'remaining_balance' => $sale->remaining_balance ?? 0,
                'days_overdue' => $item['max_days_overdue'] ?? 0,
            ];
        });
        unset($data['sales']);

        // Agregar initial_payment_total a totals
        $data['totals']['initial_payment_total'] = $data['receivables']->sum('initial_payment');

        $pdf = PDF::loadView('pdf.reports.receivables.index', $data);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('cuentas-por-cobrar-' . now()->format('Y-m-d') . '.pdf');
    }

    // ========================================
    // REPORTES DE COMPRAS
    // ========================================

    public function purchases(Request $request)
    {
        $data = $this->reportService->getPurchases($request->all());
        return Inertia::render('Reports/Purchases/Index', $data);
    }

    public function purchasesPdf(Request $request)
    {
        $filters = $request->all();
        $filters['per_page'] = 99999;
        $data = $this->reportService->getPurchases($filters);

        // Convertir paginator a colección
        $data['purchases'] = collect($data['purchases']->items());

        $pdf = PDF::loadView('pdf.reports.purchases.index', $data);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('reporte-compras-' . now()->format('Y-m-d') . '.pdf');
    }

    // ========================================
    // REPORTES DE GASTOS
    // ========================================

    public function expenses(Request $request)
    {
        $data = $this->reportService->getExpenses($request->all());
        return Inertia::render('Reports/Expenses/Index', $data);
    }

    public function expensesPdf(Request $request)
    {
        $data = $this->reportService->getExpenses($request->all());

        // Remapear totals para que coincidan con la plantilla PDF
        $expenses = $data['expenses'];
        $data['totals'] = [
            'total_expenses' => $expenses->count(),
            'total_amount' => $expenses->sum('amount'),
            'avg_expense' => $expenses->count() > 0 ? round($expenses->sum('amount') / $expenses->count(), 2) : 0,
            'max_expense' => $expenses->max('amount') ?? 0,
        ];

        $pdf = PDF::loadView('pdf.reports.expenses.index', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('reporte-gastos-' . now()->format('Y-m-d') . '.pdf');
    }

    // ========================================
    // REPORTES DE RENTABILIDAD
    // ========================================

    public function profitabilityByProduct(Request $request)
    {
        $data = $this->reportService->getProfitabilityByProduct($request->all());
        return Inertia::render('Reports/Profitability/ByProduct', $data);
    }

    public function profitabilityByProductPdf(Request $request)
    {
        $data = $this->reportService->getProfitabilityByProduct($request->all());

        // Renombrar 'products' a 'profitability' y adaptar estructura
        $data['profitability'] = $data['products'];
        unset($data['products']);

        // Remapear totals: 'total_sales' → 'total_revenue'
        $data['totals']['total_revenue'] = $data['totals']['total_sales'] ?? 0;

        $pdf = PDF::loadView('pdf.reports.profitability.by-product', $data);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('rentabilidad-productos-' . now()->format('Y-m-d') . '.pdf');
    }
}
