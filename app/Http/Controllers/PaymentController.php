<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Sale;
use App\Models\CashSession;
use App\Models\CashMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentController extends Controller
{
    /**
     * Lista de pagos pendientes y gestión
     */
    public function index(Request $request)
    {
        $query = Payment::with(['sale.customer', 'sale.branch'])
            ->whereHas('sale', function ($q) {
                $q->where('payment_type', 'credito');
            });

        // Búsqueda en tiempo real
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('sale', function ($saleQuery) use ($search) {
                    $saleQuery->where('sale_number', 'like', "%{$search}%")
                        ->orWhere('series', 'like', "%{$search}%")
                        ->orWhere('correlativo', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($customerQuery) use ($search) {
                            $customerQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('document_number', 'like', "%{$search}%");
                        });
                })
                ->orWhere('payment_number', 'like', "%{$search}%")
                ->orWhere('amount', 'like', "%{$search}%");
            });
        }

        // Filtros
        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->branch_id) {
            $query->whereHas('sale', function ($q) use ($request) {
                $q->where('branch_id', $request->branch_id);
            });
        }

        if ($request->date_from) {
            $query->where('due_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->where('due_date', '<=', $request->date_to);
        }

        // Ordenamiento dinámico
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Mapear campos para ordenamiento
        if ($sortField === 'customer') {
            $query->join('sales', 'payments.sale_id', '=', 'sales.id')
                ->join('customers', 'sales.customer_id', '=', 'customers.id')
                ->orderBy('customers.name', $sortDirection)
                ->select('payments.*');
        } elseif ($sortField === 'sale_number') {
            $query->join('sales', 'payments.sale_id', '=', 'sales.id')
                ->orderBy('sales.sale_number', $sortDirection)
                ->select('payments.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $perPage = $request->get('per_page', 15);
        $payments = $query->paginate($perPage)->withQueryString();

        // Estadísticas
        $stats = [
            'overdue' => Payment::overdue()->count(),
            'due_soon' => Payment::dueSoon()->count(),
            'pending' => Payment::pending()->count(),
            'overdue_amount' => Payment::overdue()->sum('amount'),
            'pending_amount' => Payment::pending()->sum('amount'),
        ];

        // Obtener sucursales para el filtro
        $branches = \App\Models\Branch::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'stats' => $stats,
            'branches' => $branches,
            'filters' => $request->only(['search', 'status', 'branch_id', 'date_from', 'date_to', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    /**
     * Mostrar formulario para registrar pago
     */
    public function showPayForm(Payment $payment)
    {
        if ($payment->status === 'pagado') {
            return redirect()->route('payments.index')
                ->withErrors(['error' => 'Esta cuota ya ha sido pagada.']);
        }

        $payment->load(['sale.customer']);

        return Inertia::render('Payments/Pay', [
            'payment' => $payment,
        ]);
    }

    /**
     * Registrar pago de una cuota
     */
    public function pay(Request $request, Payment $payment)
    {
        // Validar que el pago no esté ya pagado
        if ($payment->status === 'pagado') {
            return back()->withErrors(['error' => 'Esta cuota ya ha sido pagada.']);
        }

        $validated = $request->validate([
            'payment_method' => 'required|in:efectivo,tarjeta,transferencia,yape,plin',
            'transaction_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            // Marcar cuota como pagada
            $payment->markAsPaid(
                $validated['payment_method'],
                $validated['transaction_reference'] ?? null,
                $validated['notes'] ?? null
            );

            // Registrar movimiento en caja si es pago en efectivo
            if ($validated['payment_method'] === 'efectivo') {
                $currentSession = CashSession::getCurrentUserSession();
                if ($currentSession) {
                    CashMovement::recordPayment($payment, $currentSession);
                }
            }

            DB::commit();

            // Cargar relaciones necesarias para la vista de éxito
            $payment->load(['sale.customer']);

            // Renderizar página de éxito con modal de voucher
            return Inertia::render('Payments/Success', [
                'payment' => $payment,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al registrar el pago: ' . $e->getMessage()]);
        }
    }

    /**
     * Generar voucher de pago en PDF
     */
    public function voucher(Payment $payment, Request $request)
    {
        $payment->load(['sale.customer', 'sale.branch', 'sale.payments', 'updater']);

        $size = $request->query('size', '80mm'); // Por defecto ticket 80mm

        // Configuración según el tamaño
        $config = $this->getPdfConfig($size);

        $pdf = PDF::loadView('pdf.payment-voucher', [
            'payment' => $payment,
            'config' => $config,
        ])
        ->setPaper($config['paper'], $config['orientation']);

        $filename = "voucher-pago-cuota-{$payment->payment_number}-{$payment->sale->sale_number}.pdf";

        // Si es preview, devolver el PDF inline
        if ($request->query('preview') === 'true') {
            return $pdf->stream($filename);
        }

        // Por defecto mostrar en el navegador
        return $pdf->stream($filename);
    }

    private function getPdfConfig($size)
    {
        switch ($size) {
            case '80mm':
                return [
                    'paper' => [0, 0, 226.77, 566.93], // 80mm ancho
                    'orientation' => 'portrait',
                    'width' => '80mm',
                    'height' => '200mm',
                    'fontSize' => '10px',
                ];
            case '58mm':
                return [
                    'paper' => [0, 0, 164.41, 566.93], // 58mm ancho
                    'orientation' => 'portrait',
                    'width' => '58mm',
                    'height' => '200mm',
                    'fontSize' => '9px',
                ];
            default: // a4
                return [
                    'paper' => 'a4',
                    'orientation' => 'portrait',
                    'width' => '210mm',
                    'height' => '297mm',
                    'fontSize' => '11px',
                ];
        }
    }

    /**
     * Ver detalles de la venta a crédito y sus cuotas
     */
    public function show(Sale $sale)
    {
        if (!$sale->isCredit()) {
            return redirect()->route('sales.show', $sale)
                ->withErrors(['error' => 'Esta venta no es a crédito.']);
        }

        $sale->load([
            'customer',
            'branch',
            'user',
            'details.product',
            'payments' => function ($query) {
                $query->orderBy('payment_number', 'asc');
            }
        ]);

        return Inertia::render('Payments/Show', [
            'sale' => $sale,
            'hasOverdue' => $sale->hasOverduePayments(),
            'maxDaysOverdue' => $sale->getMaxDaysOverdue(),
        ]);
    }

    /**
     * Actualizar estado de pagos vencidos (cron job o manual)
     */
    public function updateOverdueStatuses()
    {
        $payments = Payment::pending()->get();

        $updated = 0;
        foreach ($payments as $payment) {
            if ($payment->isOverdue()) {
                $payment->updateStatus();
                $updated++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Se actualizaron {$updated} pagos a estado vencido.",
            'updated' => $updated,
        ]);
    }
}
