<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\Branch;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = PurchaseOrder::with(['supplier', 'branch', 'user'])
            ->when($request->search, function ($query, $search) {
                $query->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('supplier', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->supplier_id, function ($query, $supplierId) {
                $query->where('supplier_id', $supplierId);
            })
            ->when($request->branch_id, function ($query, $branchId) {
                $query->where('branch_id', $branchId);
            })
            ->orderBy('order_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        $suppliers = Supplier::active()->get();
        $branches = Branch::active()->get();

        return Inertia::render('PurchaseOrders/Index', [
            'orders' => $orders,
            'suppliers' => $suppliers,
            'branches' => $branches,
            'filters' => $request->only(['search', 'status', 'supplier_id', 'branch_id']),
        ]);
    }

    public function create()
    {
        $suppliers = Supplier::active()->get();
        $branches = Branch::active()->get();
        $products = Product::active()->with(['category', 'brand'])->get();

        return Inertia::render('PurchaseOrders/Create', [
            'suppliers' => $suppliers,
            'branches' => $branches,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'series' => 'required|string|max:20',
            'correlativo' => 'required|string|max:20',
            'supplier_id' => 'required|exists:suppliers,id',
            'branch_id' => 'required|exists:branches,id',
            'order_date' => 'required|date',
            'expected_date' => 'nullable|date|after_or_equal:order_date',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,id',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $order = PurchaseOrder::create([
                'series' => $validated['series'],
                'correlativo' => $validated['correlativo'],
                'supplier_id' => $validated['supplier_id'],
                'branch_id' => $validated['branch_id'],
                'user_id' => auth()->id(),
                'order_date' => $validated['order_date'],
                'expected_date' => $validated['expected_date'] ?? null,
                'status' => 'pendiente',
                'discount' => $validated['discount'] ?? 0,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['details'] as $detail) {
                $order->details()->create([
                    'product_id' => $detail['product_id'],
                    'quantity_ordered' => $detail['quantity'],
                    'quantity_received' => 0,
                    'unit_price' => $detail['unit_price'],
                    'subtotal' => $detail['quantity'] * $detail['unit_price'],
                ]);
            }

            $order->calculateTotals();
            DB::commit();

            return redirect()->route('purchase-orders.show', $order)
                ->with('success', 'Orden de compra creada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al crear la orden: ' . $e->getMessage()]);
        }
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load(['supplier', 'branch', 'user', 'details.product.category', 'details.product.brand']);

        return Inertia::render('PurchaseOrders/Show', [
            'order' => $purchaseOrder,
        ]);
    }

    public function edit(PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status !== 'pendiente') {
            return back()->withErrors(['error' => 'Solo se pueden editar órdenes pendientes.']);
        }

        $purchaseOrder->load(['details.product']);
        $suppliers = Supplier::active()->get();
        $branches = Branch::active()->get();
        $products = Product::active()->with(['category', 'brand'])->get();

        return Inertia::render('PurchaseOrders/Edit', [
            'order' => $purchaseOrder,
            'suppliers' => $suppliers,
            'branches' => $branches,
            'products' => $products,
        ]);
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status !== 'pendiente') {
            return back()->withErrors(['error' => 'Solo se pueden editar órdenes pendientes.']);
        }

        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'branch_id' => 'required|exists:branches,id',
            'order_date' => 'required|date',
            'expected_date' => 'nullable|date|after_or_equal:order_date',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,id',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $purchaseOrder->update([
                'supplier_id' => $validated['supplier_id'],
                'branch_id' => $validated['branch_id'],
                'order_date' => $validated['order_date'],
                'expected_date' => $validated['expected_date'] ?? null,
                'discount' => $validated['discount'] ?? 0,
                'notes' => $validated['notes'] ?? null,
            ]);

            $purchaseOrder->details()->delete();

            foreach ($validated['details'] as $detail) {
                $purchaseOrder->details()->create([
                    'product_id' => $detail['product_id'],
                    'quantity_ordered' => $detail['quantity'],
                    'quantity_received' => 0,
                    'unit_price' => $detail['unit_price'],
                    'subtotal' => $detail['quantity'] * $detail['unit_price'],
                ]);
            }

            $purchaseOrder->calculateTotals();
            DB::commit();

            return redirect()->route('purchase-orders.show', $purchaseOrder)
                ->with('success', 'Orden actualizada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status !== 'pendiente') {
            return back()->withErrors(['error' => 'Solo se pueden eliminar órdenes pendientes.']);
        }

        $purchaseOrder->delete();
        return redirect()->route('purchase-orders.index')
            ->with('success', 'Orden eliminada exitosamente.');
    }

    public function receive(PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status === 'recibido') {
            return back()->withErrors(['error' => 'Esta orden ya fue recibida.']);
        }

        if ($purchaseOrder->status === 'cancelado') {
            return back()->withErrors(['error' => 'No se puede recibir una orden cancelada.']);
        }

        DB::beginTransaction();
        try {
            $purchaseOrder->markAsReceived();
            DB::commit();

            return redirect()->route('purchase-orders.show', $purchaseOrder)
                ->with('success', 'Orden marcada como recibida e inventario actualizado.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al recibir la orden: ' . $e->getMessage()]);
        }
    }
}
