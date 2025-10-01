<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\Branch;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf as PDF;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'branch', 'user']);

        // Búsqueda en tiempo real
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('series', 'like', "%{$search}%")
                    ->orWhere('correlativo', 'like', "%{$search}%")
                    ->orWhereHas('supplier', function ($supplierQuery) use ($search) {
                        $supplierQuery->where('name', 'like', "%{$search}%");
                    })
                    ->orWhere('total', 'like', "%{$search}%");
            });
        }

        // Filtros
        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->supplier_id) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->branch_id) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->date_from) {
            $query->whereDate('order_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('order_date', '<=', $request->date_to);
        }

        // Ordenamiento dinámico
        $sortField = $request->get('sort_field', 'order_date');
        $sortDirection = $request->get('sort_direction', 'desc');

        if ($sortField === 'supplier') {
            $query->join('suppliers', 'purchase_orders.supplier_id', '=', 'suppliers.id')
                ->orderBy('suppliers.name', $sortDirection)
                ->select('purchase_orders.*');
        } elseif ($sortField === 'branch') {
            $query->join('branches', 'purchase_orders.branch_id', '=', 'branches.id')
                ->orderBy('branches.name', $sortDirection)
                ->select('purchase_orders.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $perPage = $request->get('per_page', 15);
        $orders = $query->paginate($perPage)->withQueryString();

        // Estadísticas
        $stats = [
            'total_orders' => PurchaseOrder::count(),
            'total_amount' => PurchaseOrder::where('status', '!=', 'cancelado')->sum('total'),
            'pending' => PurchaseOrder::where('status', 'pendiente')->count(),
            'received' => PurchaseOrder::where('status', 'recibido')->count(),
            'partial' => PurchaseOrder::where('status', 'parcial')->count(),
            'pending_amount' => PurchaseOrder::whereIn('status', ['pendiente', 'parcial'])->sum('total'),
        ];

        $suppliers = Supplier::active()->orderBy('name')->get(['id', 'name']);
        $branches = Branch::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('PurchaseOrders/Index', [
            'orders' => $orders,
            'stats' => $stats,
            'suppliers' => $suppliers,
            'branches' => $branches,
            'filters' => $request->only(['search', 'status', 'supplier_id', 'branch_id', 'date_from', 'date_to', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function create()
    {
        $suppliers = Supplier::active()->get();
        $branches = Branch::active()->get();
        $products = Product::active()->with(['category', 'brand'])->get();

        // Obtener la sucursal por defecto del usuario o la primera disponible
        $defaultBranchId = auth()->user()->branch_id ?? $branches->first()?->id;

        return Inertia::render('PurchaseOrders/Create', [
            'defaultBranchId' => $defaultBranchId,
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
            'details.*.sale_price' => 'nullable|numeric|min:0',
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
                    'sale_price' => $detail['sale_price'] ?? null,
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

        $purchaseOrder->load(['details.product.category', 'details.product.brand']);
        $suppliers = Supplier::active()->get();
        $branches = Branch::active()->get();
        $products = Product::active()->with(['category', 'brand'])->get();

        // Obtener la sucursal por defecto del usuario o la primera disponible
        $defaultBranchId = auth()->user()->branch_id ?? $branches->first()?->id;

        return Inertia::render('PurchaseOrders/Edit', [
            'order' => $purchaseOrder,
            'defaultBranchId' => $defaultBranchId,
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
            'details.*.sale_price' => 'nullable|numeric|min:0',
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
                    'sale_price' => $detail['sale_price'] ?? null,
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

    public function pdf(PurchaseOrder $purchaseOrder, Request $request)
    {
        $purchaseOrder->load(['supplier', 'branch', 'user', 'details.product.category', 'details.product.brand']);

        $size = $request->query('size', 'a4'); // a4, a5, 80mm, 50mm

        // Configuración según el tamaño
        $config = $this->getPdfConfig($size);

        $pdf = Pdf::loadView('pdf.purchase-order', [
            'order' => $purchaseOrder,
            'config' => $config,
        ])
        ->setPaper($config['paper'], $config['orientation']);

        // Si es preview, devolver el PDF inline para mostrarlo en el navegador
        if ($request->query('preview') === 'true') {
            return $pdf->stream("orden-compra-{$purchaseOrder->order_number}.pdf");
        }

        // Si no es preview, descargar el PDF
        return $pdf->download("orden-compra-{$purchaseOrder->order_number}.pdf");
    }

    private function getPdfConfig($size)
    {
        switch ($size) {
            case 'a5':
                return [
                    'paper' => 'a5',
                    'orientation' => 'portrait',
                    'width' => '148mm',
                    'height' => '210mm',
                    'fontSize' => '9px',
                ];
            case '80mm':
                return [
                    'paper' => [0, 0, 226.77, 566.93], // 80mm ancho
                    'orientation' => 'portrait',
                    'width' => '80mm',
                    'height' => '200mm',
                    'fontSize' => '8px',
                ];
            case '50mm':
                return [
                    'paper' => [0, 0, 141.73, 566.93], // 50mm ancho
                    'orientation' => 'portrait',
                    'width' => '50mm',
                    'height' => '200mm',
                    'fontSize' => '7px',
                ];
            default: // a4
                return [
                    'paper' => 'a4',
                    'orientation' => 'portrait',
                    'width' => '210mm',
                    'height' => '297mm',
                    'fontSize' => '10px',
                ];
        }
    }
}
