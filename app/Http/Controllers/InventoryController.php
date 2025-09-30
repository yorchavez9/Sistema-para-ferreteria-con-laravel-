<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $inventory = Inventory::with(['product.category', 'product.brand', 'branch'])
            ->whereHas('product') // Solo inventarios con productos activos (no eliminados)
            ->when($request->branch_id, function ($query, $branchId) {
                $query->where('branch_id', $branchId);
            })
            ->when($request->search, function ($query, $search) {
                $query->whereHas('product', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->when($request->low_stock, function ($query) {
                $query->lowStock();
            })
            ->when($request->out_of_stock, function ($query) {
                $query->outOfStock();
            })
            ->paginate(15);

        $branches = Branch::active()->get();

        return Inertia::render('Inventory/Index', [
            'inventory' => $inventory,
            'branches' => $branches,
            'filters' => $request->only(['branch_id', 'search', 'low_stock', 'out_of_stock']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Inventory $inventory)
    {
        $inventory->load(['product', 'branch']);

        return Inertia::render('Inventory/Edit', [
            'inventory' => $inventory,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Inventory $inventory)
    {
        $request->validate([
            'min_stock' => 'required|integer|min:0',
            'max_stock' => 'required|integer|min:0',
            'cost_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'location' => 'nullable|string|max:50',
        ]);

        $inventory->update($request->all());

        return redirect()->route('inventory.index')
            ->with('success', 'Inventario actualizado exitosamente.');
    }

    /**
     * Mostrar formulario de ajuste de inventario.
     */
    public function adjustment(Request $request)
    {
        $inventory = Inventory::with(['product.category', 'product.brand', 'branch'])
            ->whereHas('product') // Solo inventarios con productos activos
            ->when($request->branch_id, function ($query, $branchId) {
                $query->where('branch_id', $branchId);
            })
            ->when($request->search, function ($query, $search) {
                $query->whereHas('product', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->get();

        $branches = Branch::active()->get();

        return Inertia::render('Inventory/Adjustment', [
            'inventory' => $inventory,
            'branches' => $branches,
            'filters' => $request->only(['branch_id', 'search']),
        ]);
    }

    /**
     * Procesar ajuste de inventario.
     */
    public function processAdjustment(Request $request)
    {
        $request->validate([
            'inventory_id' => 'required|exists:inventory,id',
            'new_stock' => 'required|integer|min:0',
            'reason' => 'required|string|max:255',
        ]);

        $inventory = Inventory::findOrFail($request->inventory_id);
        $oldStock = $inventory->current_stock;

        $inventory->update([
            'current_stock' => $request->new_stock,
            'last_movement_date' => now(),
        ]);

        // Aquí podrías crear un registro de movimiento de inventario
        // InventoryMovement::create([
        //     'inventory_id' => $inventory->id,
        //     'old_stock' => $oldStock,
        //     'new_stock' => $request->new_stock,
        //     'difference' => $request->new_stock - $oldStock,
        //     'reason' => $request->reason,
        //     'user_id' => auth()->id(),
        // ]);

        return redirect()->route('inventory.adjustment')
            ->with('success', 'Ajuste de inventario realizado exitosamente.');
    }

    /**
     * Reporte de productos con stock bajo.
     */
    public function lowStockReport(Request $request)
    {
        $lowStockItems = Inventory::with(['product.category', 'product.brand', 'branch'])
            ->whereHas('product') // Solo inventarios con productos activos
            ->lowStock()
            ->when($request->branch_id, function ($query, $branchId) {
                $query->where('branch_id', $branchId);
            })
            ->get();

        $branches = Branch::active()->get();

        return Inertia::render('Inventory/LowStockReport', [
            'lowStockItems' => $lowStockItems,
            'branches' => $branches,
            'filters' => $request->only(['branch_id']),
        ]);
    }
}
