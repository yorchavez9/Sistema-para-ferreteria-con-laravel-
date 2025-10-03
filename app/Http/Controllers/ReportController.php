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

    /**
     * Vista del reporte de ventas detallado
     */
    public function salesDetailed(Request $request)
    {
        $data = $this->reportService->getSalesDetailed($request->all());

        return Inertia::render('Reports/Sales/Detailed', $data);
    }

    /**
     * PDF del reporte de ventas detallado
     */
    public function salesDetailedPdf(Request $request)
    {
        $data = $this->reportService->getSalesDetailed($request->all());

        $pdf = PDF::loadView('pdf.reports.sales.detailed', $data);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('reporte-ventas-detallado-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Vista del reporte de ventas por cliente
     */
    public function salesByClient(Request $request)
    {
        $data = $this->reportService->getSalesByClient($request->all());

        return Inertia::render('Reports/Sales/ByClient', $data);
    }

    /**
     * PDF del reporte de ventas por cliente
     */
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

    /**
     * Vista del reporte de caja diaria
     */
    public function cashDaily(Request $request)
    {
        $data = $this->reportService->getCashDaily($request->all());

        return Inertia::render('Reports/Cash/Daily', $data);
    }

    /**
     * PDF del reporte de caja diaria
     */
    public function cashDailyPdf(Request $request)
    {
        $data = $this->reportService->getCashDaily($request->all());

        $pdf = PDF::loadView('pdf.reports.cash.daily', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('reporte-caja-diaria-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Vista del reporte de arqueo de caja
     */
    public function cashClosing($cashSessionId)
    {
        $data = $this->reportService->getCashClosing($cashSessionId);

        return Inertia::render('Reports/Cash/Closing', $data);
    }

    /**
     * PDF del reporte de arqueo de caja
     */
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

    /**
     * Vista del reporte de inventario valorizado
     */
    public function inventoryValued(Request $request)
    {
        $data = $this->reportService->getInventoryValued($request->all());

        return Inertia::render('Reports/Inventory/Valued', $data);
    }

    /**
     * PDF del reporte de inventario valorizado
     */
    public function inventoryValuedPdf(Request $request)
    {
        $data = $this->reportService->getInventoryValued($request->all());

        $pdf = PDF::loadView('pdf.reports.inventory.valued', $data);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('inventario-valorizado-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Vista del reporte de movimientos de inventario
     */
    public function inventoryMovements(Request $request)
    {
        $data = $this->reportService->getInventoryMovements($request->all());

        return Inertia::render('Reports/Inventory/Movements', $data);
    }

    /**
     * PDF del reporte de movimientos de inventario
     */
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

    /**
     * Vista del reporte de cuentas por cobrar
     */
    public function receivables(Request $request)
    {
        $data = $this->reportService->getReceivables($request->all());

        return Inertia::render('Reports/Receivables/Index', $data);
    }

    /**
     * PDF del reporte de cuentas por cobrar
     */
    public function receivablesPdf(Request $request)
    {
        $data = $this->reportService->getReceivables($request->all());

        $pdf = PDF::loadView('pdf.reports.receivables.index', $data);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('cuentas-por-cobrar-' . now()->format('Y-m-d') . '.pdf');
    }

    // ========================================
    // REPORTES DE COMPRAS
    // ========================================

    /**
     * Vista del reporte de compras
     */
    public function purchases(Request $request)
    {
        $data = $this->reportService->getPurchases($request->all());

        return Inertia::render('Reports/Purchases/Index', $data);
    }

    /**
     * PDF del reporte de compras
     */
    public function purchasesPdf(Request $request)
    {
        $data = $this->reportService->getPurchases($request->all());

        $pdf = PDF::loadView('pdf.reports.purchases.index', $data);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('reporte-compras-' . now()->format('Y-m-d') . '.pdf');
    }

    // ========================================
    // REPORTES DE GASTOS
    // ========================================

    /**
     * Vista del reporte de gastos
     */
    public function expenses(Request $request)
    {
        $data = $this->reportService->getExpenses($request->all());

        return Inertia::render('Reports/Expenses/Index', $data);
    }

    /**
     * PDF del reporte de gastos
     */
    public function expensesPdf(Request $request)
    {
        $data = $this->reportService->getExpenses($request->all());

        $pdf = PDF::loadView('pdf.reports.expenses.index', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('reporte-gastos-' . now()->format('Y-m-d') . '.pdf');
    }

    // ========================================
    // REPORTES DE RENTABILIDAD
    // ========================================

    /**
     * Vista del reporte de rentabilidad por producto
     */
    public function profitabilityByProduct(Request $request)
    {
        $data = $this->reportService->getProfitabilityByProduct($request->all());

        return Inertia::render('Reports/Profitability/ByProduct', $data);
    }

    /**
     * PDF del reporte de rentabilidad por producto
     */
    public function profitabilityByProductPdf(Request $request)
    {
        $data = $this->reportService->getProfitabilityByProduct($request->all());

        $pdf = PDF::loadView('pdf.reports.profitability.by-product', $data);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('rentabilidad-productos-' . now()->format('Y-m-d') . '.pdf');
    }
}
