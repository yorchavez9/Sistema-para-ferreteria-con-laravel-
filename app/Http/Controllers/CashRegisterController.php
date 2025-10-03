<?php

namespace App\Http\Controllers;

use App\Models\CashRegister;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CashRegisterController extends Controller
{
    /**
     * Display a listing of cash registers
     */
    public function index(Request $request)
    {
        $query = CashRegister::with(['branch', 'sessions' => function ($q) {
            $q->latest()->take(1);
        }]);

        // Búsqueda
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhereHas('branch', function ($branchQuery) use ($search) {
                        $branchQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filtros
        if ($request->branch_id) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $cashRegisters = $query->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        // Agregar información de sesión actual
        $cashRegisters->each(function ($register) {
            $register->current_session = $register->currentSession();
            $register->is_open = $register->isOpen();
            $register->current_user = $register->getCurrentUser();
        });

        $branches = Branch::active()->orderBy('name')->get(['id', 'name']);

        // Estadísticas
        $stats = [
            'total_registers' => CashRegister::count(),
            'active_registers' => CashRegister::where('is_active', true)->count(),
            'open_registers' => CashRegister::whereHas('sessions', function ($q) {
                $q->where('status', 'abierta');
            })->count(),
        ];

        return Inertia::render('CashRegisters/Index', [
            'cashRegisters' => $cashRegisters,
            'branches' => $branches,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new cash register
     */
    public function create()
    {
        $branches = Branch::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('CashRegisters/Create', [
            'branches' => $branches,
        ]);
    }

    /**
     * Store a newly created cash register
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:cash_registers,code',
            'branch_id' => 'required|exists:branches,id',
            'type' => 'required|in:principal,secundaria',
            'opening_balance' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $cashRegister = CashRegister::create([
                'name' => $request->name,
                'code' => $request->code,
                'branch_id' => $request->branch_id,
                'type' => $request->type,
                'opening_balance' => $request->opening_balance,
                'description' => $request->description,
                'is_active' => true,
            ]);

            DB::commit();

            return redirect()->route('cash-registers.index')
                ->with('success', 'Caja registrada correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified cash register
     */
    public function show(CashRegister $cashRegister)
    {
        $cashRegister->load('branch');

        // Obtener sesiones recientes
        $recentSessions = $cashRegister->sessions()
            ->with('user')
            ->latest('opened_at')
            ->take(10)
            ->get();

        return Inertia::render('CashRegisters/Show', [
            'cashRegister' => $cashRegister,
            'recentSessions' => $recentSessions,
        ]);
    }

    /**
     * Show the form for editing the specified cash register
     */
    public function edit(CashRegister $cashRegister)
    {
        $branches = Branch::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('CashRegisters/Edit', [
            'cashRegister' => $cashRegister,
            'branches' => $branches,
        ]);
    }

    /**
     * Update the specified cash register
     */
    public function update(Request $request, CashRegister $cashRegister)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:cash_registers,code,' . $cashRegister->id,
            'branch_id' => 'required|exists:branches,id',
            'type' => 'required|in:principal,secundaria',
            'opening_balance' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'is_active' => 'required|boolean',
        ]);

        try {
            DB::beginTransaction();

            // No permitir desactivar si tiene sesión abierta
            if (!$request->is_active && $cashRegister->isOpen()) {
                throw new \Exception('No se puede desactivar una caja con sesión abierta.');
            }

            $cashRegister->update($request->all());

            DB::commit();

            return redirect()->route('cash-registers.index')
                ->with('success', 'Caja actualizada correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified cash register
     */
    public function destroy(CashRegister $cashRegister)
    {
        // No permitir eliminar si tiene sesiones
        if ($cashRegister->sessions()->exists()) {
            return back()->with('error', 'No se puede eliminar una caja con sesiones registradas.');
        }

        // No permitir eliminar si está abierta
        if ($cashRegister->isOpen()) {
            return back()->with('error', 'No se puede eliminar una caja con sesión abierta.');
        }

        try {
            DB::beginTransaction();

            $cashRegister->delete();

            DB::commit();

            return redirect()->route('cash-registers.index')
                ->with('success', 'Caja eliminada correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }
}
