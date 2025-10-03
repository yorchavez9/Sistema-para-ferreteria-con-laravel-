<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Branch;
use App\Models\CashSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ExpenseController extends Controller
{
    /**
     * Display a listing of expenses
     */
    public function index(Request $request)
    {
        $query = Expense::with(['category', 'branch', 'user', 'cashSession']);

        // Búsqueda
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('supplier_name', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%")
                    ->orWhere('amount', 'like', "%{$search}%");
            });
        }

        // Filtros
        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->category_id) {
            $query->where('expense_category_id', $request->category_id);
        }

        if ($request->branch_id) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->payment_method) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->date_from) {
            $query->whereDate('expense_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('expense_date', '<=', $request->date_to);
        }

        $sortField = $request->get('sort_field', 'expense_date');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $perPage = $request->get('per_page', 15);
        $expenses = $query->paginate($perPage)->withQueryString();

        // Estadísticas
        $stats = [
            'total_expenses' => Expense::approved()->count(),
            'total_amount' => Expense::approved()->sum('amount'),
            'pending_count' => Expense::pending()->count(),
            'pending_amount' => Expense::pending()->sum('amount'),
            'this_month' => Expense::approved()->thisMonth()->sum('amount'),
            'this_year' => Expense::approved()->thisYear()->sum('amount'),
        ];

        $categories = ExpenseCategory::active()->orderBy('name')->get();
        $branches = Branch::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses,
            'stats' => $stats,
            'categories' => $categories,
            'branches' => $branches,
            'filters' => $request->only(['search', 'status', 'category_id', 'branch_id', 'payment_method', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show the form for creating a new expense
     */
    public function create()
    {
        $categories = ExpenseCategory::active()->orderBy('name')->get();
        $branches = Branch::active()->orderBy('name')->get(['id', 'name']);
        $currentSession = CashSession::getCurrentUserSession();

        // Cargar relación cashRegister si existe sesión
        if ($currentSession) {
            $currentSession->load('cashRegister');
        }

        return Inertia::render('Expenses/Create', [
            'categories' => $categories,
            'branches' => $branches,
            'currentSession' => $currentSession,
        ]);
    }

    /**
     * Store a newly created expense
     */
    public function store(Request $request)
    {
        $request->validate([
            'expense_category_id' => 'required|exists:expense_categories,id',
            'branch_id' => 'required|exists:branches,id',
            'expense_date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:efectivo,tarjeta,transferencia',
            'supplier_name' => 'nullable|string|max:255',
            'document_type' => 'nullable|in:boleta,factura,recibo,sin_documento',
            'document_number' => 'nullable|string|max:50',
            'description' => 'required|string|max:500',
            'notes' => 'nullable|string|max:500',
            'receipt_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        try {
            DB::beginTransaction();

            $data = $request->except('receipt_file');
            $data['user_id'] = auth()->id();

            // Si es pago en efectivo, obtener sesión activa
            if ($request->payment_method === 'efectivo') {
                $currentSession = CashSession::getCurrentUserSession();
                if ($currentSession) {
                    $data['cash_session_id'] = $currentSession->id;
                }
            }

            // Subir archivo si existe
            if ($request->hasFile('receipt_file')) {
                $data['receipt_file'] = $request->file('receipt_file')
                    ->store('expenses', 'public');
            }

            $expense = Expense::create($data);

            // Si está configurado para auto-aprobar, aprobar inmediatamente
            // (puedes configurar esto en settings)
            if (setting('expenses_auto_approve', false)) {
                $expense->approve();
            }

            DB::commit();

            return redirect()->route('expenses.index')
                ->with('success', 'Gasto registrado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified expense
     */
    public function show(Expense $expense)
    {
        $expense->load(['category', 'branch', 'user', 'approvedBy', 'cashSession.cashRegister']);

        return Inertia::render('Expenses/Show', [
            'expense' => $expense,
        ]);
    }

    /**
     * Show the form for editing the specified expense
     */
    public function edit(Expense $expense)
    {
        // Solo permitir editar gastos pendientes
        if ($expense->status !== 'pendiente') {
            return redirect()->route('expenses.index')
                ->with('error', 'Solo se pueden editar gastos pendientes.');
        }

        $categories = ExpenseCategory::active()->orderBy('name')->get();
        $branches = Branch::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Expenses/Edit', [
            'expense' => $expense,
            'categories' => $categories,
            'branches' => $branches,
        ]);
    }

    /**
     * Update the specified expense
     */
    public function update(Request $request, Expense $expense)
    {
        // Solo permitir editar gastos pendientes
        if ($expense->status !== 'pendiente') {
            return back()->with('error', 'Solo se pueden editar gastos pendientes.');
        }

        $request->validate([
            'expense_category_id' => 'required|exists:expense_categories,id',
            'branch_id' => 'required|exists:branches,id',
            'expense_date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:efectivo,tarjeta,transferencia',
            'supplier_name' => 'nullable|string|max:255',
            'document_type' => 'nullable|in:boleta,factura,recibo,sin_documento',
            'document_number' => 'nullable|string|max:50',
            'description' => 'required|string|max:500',
            'notes' => 'nullable|string|max:500',
            'receipt_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        try {
            DB::beginTransaction();

            $data = $request->except('receipt_file');

            // Subir nuevo archivo si existe
            if ($request->hasFile('receipt_file')) {
                // Eliminar archivo anterior
                if ($expense->receipt_file) {
                    Storage::disk('public')->delete($expense->receipt_file);
                }
                $data['receipt_file'] = $request->file('receipt_file')
                    ->store('expenses', 'public');
            }

            $expense->update($data);

            DB::commit();

            return redirect()->route('expenses.index')
                ->with('success', 'Gasto actualizado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified expense
     */
    public function destroy(Expense $expense)
    {
        // Solo permitir eliminar gastos pendientes o rechazados
        if ($expense->status === 'aprobado') {
            return back()->with('error', 'No se pueden eliminar gastos aprobados.');
        }

        try {
            DB::beginTransaction();

            // Eliminar archivo si existe
            if ($expense->receipt_file) {
                Storage::disk('public')->delete($expense->receipt_file);
            }

            $expense->delete();

            DB::commit();

            return redirect()->route('expenses.index')
                ->with('success', 'Gasto eliminado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Aprobar gasto
     */
    public function approve(Expense $expense)
    {
        try {
            DB::beginTransaction();

            $expense->approve();

            DB::commit();

            return back()->with('success', 'Gasto aprobado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Rechazar gasto
     */
    public function reject(Request $request, Expense $expense)
    {
        $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $expense->reject($request->rejection_reason);

            DB::commit();

            return back()->with('success', 'Gasto rechazado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }
}
