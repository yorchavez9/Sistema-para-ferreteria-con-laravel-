<?php

namespace App\Http\Controllers;

use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ExpenseCategoryController extends Controller
{
    /**
     * Display a listing of expense categories
     */
    public function index(Request $request)
    {
        $query = ExpenseCategory::withCount('expenses');

        // Búsqueda
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filtro de activas
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $categories = $query->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('ExpenseCategories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    /**
     * Show the form for creating a new expense category
     */
    public function create()
    {
        return Inertia::render('ExpenseCategories/Create');
    }

    /**
     * Store a newly created expense category
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:expense_categories,name',
            'code' => 'required|string|max:50|unique:expense_categories,code',
            'description' => 'nullable|string|max:500',
            'color' => 'required|string|max:7',
            'is_active' => 'required|boolean',
        ]);

        try {
            DB::beginTransaction();

            ExpenseCategory::create([
                'name' => $request->name,
                'code' => $request->code,
                'description' => $request->description,
                'color' => $request->color,
                'is_active' => $request->is_active,
            ]);

            DB::commit();

            return redirect()->route('expense-categories.index')
                ->with('success', 'Categoría creada correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified expense category
     */
    public function edit(ExpenseCategory $expenseCategory)
    {
        return Inertia::render('ExpenseCategories/Edit', [
            'category' => $expenseCategory,
        ]);
    }

    /**
     * Update the specified expense category
     */
    public function update(Request $request, ExpenseCategory $expenseCategory)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:expense_categories,name,' . $expenseCategory->id,
            'code' => 'required|string|max:50|unique:expense_categories,code,' . $expenseCategory->id,
            'description' => 'nullable|string|max:500',
            'color' => 'required|string|max:7',
            'is_active' => 'required|boolean',
        ]);

        try {
            DB::beginTransaction();

            $expenseCategory->update([
                'name' => $request->name,
                'code' => $request->code,
                'description' => $request->description,
                'color' => $request->color,
                'is_active' => $request->is_active,
            ]);

            DB::commit();

            return redirect()->route('expense-categories.index')
                ->with('success', 'Categoría actualizada correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified expense category
     */
    public function destroy(ExpenseCategory $expenseCategory)
    {
        // No permitir eliminar si tiene gastos asociados
        if ($expenseCategory->expenses()->exists()) {
            return back()->with('error', 'No se puede eliminar una categoría con gastos asociados.');
        }

        try {
            DB::beginTransaction();

            $expenseCategory->delete();

            DB::commit();

            return redirect()->route('expense-categories.index')
                ->with('success', 'Categoría eliminada correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }
}
