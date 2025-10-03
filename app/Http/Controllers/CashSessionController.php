<?php

namespace App\Http\Controllers;

use App\Models\CashSession;
use App\Models\CashRegister;
use App\Models\CashMovement;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CashSessionController extends Controller
{
    /**
     * Mostrar dashboard de caja
     */
    public function index(Request $request)
    {
        $query = CashSession::with(['cashRegister', 'user', 'branch']);

        // Filtros
        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->branch_id) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->date_from) {
            $query->whereDate('opened_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('opened_at', '<=', $request->date_to);
        }

        $sessions = $query->orderBy('opened_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Obtener sesión activa del usuario
        $currentSession = CashSession::getCurrentUserSession();

        // Estadísticas
        $stats = [
            'active_sessions' => CashSession::where('status', 'abierta')->count(),
            'today_sessions' => CashSession::whereDate('opened_at', today())->count(),
            'today_sales' => $currentSession ? $currentSession->getSalesTotal() : 0,
            'today_income' => $currentSession ? $currentSession->getIncomesTotal() : 0,
        ];

        $branches = Branch::active()->orderBy('name')->get(['id', 'name']);
        $cashRegisters = CashRegister::with('branch')
            ->active()
            ->orderBy('name')
            ->get();

        return Inertia::render('Cash/Index', [
            'sessions' => $sessions,
            'currentSession' => $currentSession ? $currentSession->load(['cashRegister.branch', 'user', 'movements' => function ($query) {
                $query->latest()->take(10);
            }]) : null,
            'stats' => $stats,
            'branches' => $branches,
            'cashRegisters' => $cashRegisters,
        ]);
    }

    /**
     * Mostrar formulario de apertura de caja
     */
    public function create()
    {
        // Verificar si el usuario ya tiene una sesión abierta
        $currentSession = CashSession::getCurrentUserSession();

        if ($currentSession) {
            return redirect()->route('cash.index')
                ->with('error', 'Ya tienes una sesión de caja abierta.');
        }

        $cashRegisters = CashRegister::with('branch')
            ->active()
            ->whereDoesntHave('sessions', function ($query) {
                $query->where('status', 'abierta');
            })
            ->orderBy('name')
            ->get();

        return Inertia::render('Cash/Open', [
            'cashRegisters' => $cashRegisters,
        ]);
    }

    /**
     * Abrir sesión de caja
     */
    public function store(Request $request)
    {
        $request->validate([
            'cash_register_id' => 'required|exists:cash_registers,id',
            'opening_balance' => 'required|numeric|min:0',
            'opening_notes' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $session = CashSession::open(
                $request->cash_register_id,
                $request->opening_balance,
                $request->opening_notes
            );

            DB::commit();

            return redirect()->route('cash.index')
                ->with('success', 'Caja abierta correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Mostrar detalles de una sesión
     */
    public function show(CashSession $cashSession)
    {
        $cashSession->load([
            'cashRegister.branch',
            'user',
            'branch',
            'movements' => function ($query) {
                $query->with(['user', 'sale', 'payment', 'expense'])
                    ->orderBy('created_at', 'desc');
            }
        ]);

        // Resumen de movimientos
        $summary = [
            'sales_total' => $cashSession->getSalesTotal(),
            'expenses_total' => $cashSession->getExpensesTotal(),
            'incomes_total' => $cashSession->getIncomesTotal(),
            'egresses_total' => $cashSession->getEgressesTotal(),
            'movements_by_type' => $cashSession->movements()
                ->selectRaw('type, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('type')
                ->get(),
            'movements_by_payment' => $cashSession->getMovementsByPaymentMethod(),
        ];

        return Inertia::render('Cash/Show', [
            'session' => $cashSession,
            'summary' => $summary,
        ]);
    }

    /**
     * Mostrar formulario de cierre de caja
     */
    public function closeForm()
    {
        $currentSession = CashSession::getCurrentUserSession();

        if (!$currentSession) {
            return redirect()->route('cash.index')
                ->with('error', 'No tienes una sesión de caja abierta.');
        }

        $currentSession->load([
            'cashRegister',
            'movements' => function ($query) {
                $query->with(['sale', 'payment', 'expense'])
                    ->orderBy('created_at', 'desc');
            }
        ]);

        $expectedBalance = $currentSession->calculateExpectedBalance();

        $summary = [
            'opening_balance' => $currentSession->opening_balance,
            'sales_total' => $currentSession->getSalesTotal(),
            'expenses_total' => $currentSession->getExpensesTotal(),
            'incomes_total' => $currentSession->getIncomesTotal(),
            'egresses_total' => $currentSession->getEgressesTotal(),
            'expected_balance' => $expectedBalance,
            'movements_by_type' => $currentSession->movements()
                ->selectRaw('type, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('type')
                ->get(),
            'movements_by_payment' => $currentSession->getMovementsByPaymentMethod(),
        ];

        return Inertia::render('Cash/Close', [
            'session' => $currentSession,
            'summary' => $summary,
        ]);
    }

    /**
     * Cerrar sesión de caja
     */
    public function close(Request $request)
    {
        $request->validate([
            'actual_balance' => 'required|numeric|min:0',
            'closing_notes' => 'nullable|string|max:500',
        ]);

        $currentSession = CashSession::getCurrentUserSession();

        if (!$currentSession) {
            return back()->with('error', 'No tienes una sesión de caja abierta.');
        }

        try {
            DB::beginTransaction();

            $currentSession->close(
                $request->actual_balance,
                $request->closing_notes
            );

            DB::commit();

            return redirect()->route('cash.index')
                ->with('success', 'Caja cerrada correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reabrir sesión de caja cerrada
     */
    public function reopen(CashSession $cashSession, Request $request)
    {
        $request->validate([
            'reopen_notes' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $cashSession->reopen($request->reopen_notes);

            DB::commit();

            return redirect()->route('cash.index')
                ->with('success', 'Caja reabierta correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Obtener sesión actual del usuario (API)
     */
    public function current()
    {
        $currentSession = CashSession::getCurrentUserSession();

        if (!$currentSession) {
            return response()->json([
                'session' => null,
                'message' => 'No hay sesión activa'
            ]);
        }

        $currentSession->load(['cashRegister.branch', 'user']);

        return response()->json([
            'session' => $currentSession,
            'expected_balance' => $currentSession->calculateExpectedBalance(),
            'summary' => [
                'sales_total' => $currentSession->getSalesTotal(),
                'expenses_total' => $currentSession->getExpensesTotal(),
                'incomes_total' => $currentSession->getIncomesTotal(),
                'egresses_total' => $currentSession->getEgressesTotal(),
            ]
        ]);
    }

    /**
     * Registrar ingreso manual
     */
    public function addIncome(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'payment_method' => 'required|in:efectivo,tarjeta,transferencia,yape,plin',
            'notes' => 'nullable|string|max:500',
        ]);

        $currentSession = CashSession::getCurrentUserSession();

        if (!$currentSession) {
            return back()->with('error', 'No tienes una sesión de caja abierta.');
        }

        try {
            DB::beginTransaction();

            CashMovement::recordIncome(
                $request->amount,
                $request->description,
                $currentSession,
                $request->payment_method,
                $request->notes
            );

            DB::commit();

            return back()->with('success', 'Ingreso registrado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Registrar egreso manual
     */
    public function addEgress(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'payment_method' => 'required|in:efectivo,tarjeta,transferencia,yape,plin',
            'notes' => 'nullable|string|max:500',
        ]);

        $currentSession = CashSession::getCurrentUserSession();

        if (!$currentSession) {
            return back()->with('error', 'No tienes una sesión de caja abierta.');
        }

        try {
            DB::beginTransaction();

            CashMovement::recordEgress(
                $request->amount,
                $request->description,
                $currentSession,
                $request->payment_method,
                $request->notes
            );

            DB::commit();

            return back()->with('success', 'Egreso registrado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }
}
