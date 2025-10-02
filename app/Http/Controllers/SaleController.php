<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Customer;
use App\Models\Branch;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\DocumentSeries;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use App\Models\Setting;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with(['customer', 'branch', 'user']);

        // Búsqueda en tiempo real
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sale_number', 'like', "%{$search}%")
                    ->orWhere('series', 'like', "%{$search}%")
                    ->orWhere('correlativo', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($customerQuery) use ($search) {
                        $customerQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('document_number', 'like', "%{$search}%");
                    })
                    ->orWhere('total', 'like', "%{$search}%");
            });
        }

        // Filtros
        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->document_type) {
            $query->where('document_type', $request->document_type);
        }

        if ($request->payment_type) {
            $query->where('payment_type', $request->payment_type);
        }

        if ($request->branch_id) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->date_from) {
            $query->whereDate('sale_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('sale_date', '<=', $request->date_to);
        }

        // Ordenamiento dinámico
        $sortField = $request->get('sort_field', 'sale_date');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Mapear campos para ordenamiento
        if ($sortField === 'customer') {
            $query->join('customers', 'sales.customer_id', '=', 'customers.id')
                ->orderBy('customers.name', $sortDirection)
                ->select('sales.*');
        } elseif ($sortField === 'branch') {
            $query->join('branches', 'sales.branch_id', '=', 'branches.id')
                ->orderBy('branches.name', $sortDirection)
                ->select('sales.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $perPage = $request->get('per_page', 15);
        $sales = $query->paginate($perPage)->withQueryString();

        // Estadísticas
        $stats = [
            'total_sales' => Sale::count(),
            'total_amount' => Sale::where('status', '!=', 'anulado')->sum('total'),
            'pending' => Sale::where('status', 'pendiente')->count(),
            'paid' => Sale::where('status', 'pagado')->count(),
            'credit_sales' => Sale::where('payment_type', 'credito')->count(),
            'credit_balance' => Sale::where('payment_type', 'credito')
                ->where('status', '!=', 'anulado')
                ->sum('remaining_balance'),
        ];

        $branches = Branch::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'stats' => $stats,
            'branches' => $branches,
            'filters' => $request->only(['search', 'status', 'document_type', 'payment_type', 'branch_id', 'date_from', 'date_to', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function create()
    {
        $customers = Customer::active()->get();
        $branches = Branch::active()->get();
        $products = Product::active()->with(['category', 'brand'])->get();

        // Obtener productos con inventario disponible
        $productsWithStock = $products->map(function ($product) {
            $totalStock = Inventory::where('product_id', $product->id)->sum('current_stock');
            $product->total_stock = $totalStock;
            return $product;
        });

        // Obtener series activas para cada tipo de documento
        $documentSeries = [
            'boleta' => DocumentSeries::active()
                ->byBranch(auth()->user()->branch_id ?? 1)
                ->byDocumentType('boleta')
                ->get(),
            'factura' => DocumentSeries::active()
                ->byBranch(auth()->user()->branch_id ?? 1)
                ->byDocumentType('factura')
                ->get(),
        ];

        // Obtener la sucursal por defecto del usuario o la primera disponible
        $defaultBranchId = auth()->user()->branch_id ?? $branches->first()?->id;

        return Inertia::render('Sales/Create', [
            'defaultBranchId' => $defaultBranchId,
            'customers' => $customers,
            'branches' => $branches,
            'products' => $productsWithStock,
            'documentSeries' => $documentSeries,
        ]);
    }

    public function store(Request $request)
    {
        $settings = Setting::get();

        // Validación básica primero
        $basicValidation = $request->validate([
            'document_type' => 'required|in:boleta,factura,nota_venta',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,id',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit_price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
        ]);

        // Calcular total para validación de cliente
        $subtotal = 0;
        foreach ($basicValidation['details'] as $detail) {
            $subtotal += $detail['quantity'] * $detail['unit_price'];
        }
        $discount = $basicValidation['discount'] ?? 0;
        $total = $subtotal - $discount;

        // Determinar si el cliente es obligatorio según reglas SUNAT
        $customerRule = 'nullable';
        if ($basicValidation['document_type'] === 'factura') {
            // Factura: Cliente siempre obligatorio
            $customerRule = 'required';
        } elseif ($basicValidation['document_type'] === 'boleta' && $total >= 700) {
            // Boleta >= S/ 700: Cliente obligatorio
            $customerRule = 'required';
        }
        // Nota de venta: Cliente opcional

        // Validación completa
        $validated = $request->validate([
            'document_type' => 'required|in:boleta,factura,nota_venta',
            'document_series_id' => 'nullable|exists:document_series,id',
            'customer_id' => $customerRule . '|exists:customers,id',
            'branch_id' => 'required|exists:branches,id',
            'sale_date' => 'required|date',
            'payment_method' => 'required|in:efectivo,tarjeta,transferencia,yape,plin,credito',
            'payment_type' => 'required|in:contado,credito',
            'credit_days' => 'nullable|required_if:payment_type,credito|integer|min:1|max:' . $settings->days_for_credit_sale,
            'installments' => 'nullable|required_if:payment_type,credito|integer|min:1|max:12',
            'initial_payment' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'amount_paid' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,id',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit_price' => 'required|numeric|min:0',
        ]);

        // Validar ventas por debajo del costo si está configurado
        if (!$settings->allow_sale_below_cost) {
            foreach ($validated['details'] as $detail) {
                $product = Product::find($detail['product_id']);
                if ($detail['unit_price'] < $product->purchase_price) {
                    return back()->withErrors([
                        'details' => "No se permite vender el producto '{$product->name}' por debajo del costo de compra (S/ {$product->purchase_price})."
                    ]);
                }
            }
        }

        DB::beginTransaction();
        try {
            // Generar serie y correlativo automático
            $documentSeriesId = $validated['document_series_id'] ?? null;

            if ($validated['document_type'] !== 'nota_venta') {
                // Para boleta y factura, usar serie automática
                if ($documentSeriesId) {
                    $documentSerie = DocumentSeries::findOrFail($documentSeriesId);
                } else {
                    // Obtener o crear serie por defecto
                    $documentSerie = DocumentSeries::getOrCreateSeries(
                        $validated['branch_id'],
                        $validated['document_type']
                    );
                }

                // Generar siguiente número
                $documentSerie->increment('current_number');
                $series = $documentSerie->series;
                $correlativo = str_pad($documentSerie->current_number, 8, '0', STR_PAD_LEFT);
            } else {
                // Para nota de venta, generar serie simple
                $series = 'NV';
                $correlativo = str_pad(
                    Sale::where('document_type', 'nota_venta')
                        ->where('branch_id', $validated['branch_id'])
                        ->count() + 1,
                    8,
                    '0',
                    STR_PAD_LEFT
                );
            }
            // Verificar stock disponible antes de crear la venta
            foreach ($validated['details'] as $detail) {
                $inventory = Inventory::where('product_id', $detail['product_id'])
                    ->where('branch_id', $validated['branch_id'])
                    ->first();

                if (!$inventory) {
                    $product = Product::find($detail['product_id']);
                    return back()->withErrors(['error' => "El producto {$product->name} no tiene inventario en esta sucursal."]);
                }

                if ($inventory->current_stock < $detail['quantity']) {
                    $product = Product::find($detail['product_id']);
                    return back()->withErrors(['error' => "Stock insuficiente para {$product->name}. Disponible: {$inventory->current_stock}"]);
                }
            }

            $sale = Sale::create([
                'series' => $series,
                'correlativo' => $correlativo,
                'document_type' => $validated['document_type'],
                'customer_id' => $validated['customer_id'],
                'branch_id' => $validated['branch_id'],
                'user_id' => auth()->id(),
                'sale_date' => $validated['sale_date'],
                'payment_method' => $validated['payment_method'],
                'payment_type' => $validated['payment_type'],
                'credit_days' => $validated['credit_days'] ?? null,
                'installments' => $validated['installments'] ?? null,
                'initial_payment' => $validated['initial_payment'] ?? 0,
                'status' => 'pendiente',
                'discount' => $validated['discount'] ?? 0,
                'amount_paid' => $validated['amount_paid'],
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['details'] as $detail) {
                $sale->details()->create([
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'unit_price' => $detail['unit_price'],
                    'subtotal' => $detail['quantity'] * $detail['unit_price'],
                ]);
            }

            $sale->calculateTotals();

            // Calcular vuelto y saldo pendiente
            if ($validated['payment_type'] === 'credito') {
                // Para crédito: el saldo pendiente es el total menos el pago inicial
                $sale->remaining_balance = $sale->total - $validated['initial_payment'];
                $sale->change_amount = 0;

                // Crear las cuotas de pago
                $sale->createPaymentInstallments();
            } else {
                // Para contado: calcular vuelto normal
                $sale->change_amount = max(0, $validated['amount_paid'] - $sale->total);
                $sale->remaining_balance = 0;
            }

            $sale->save();

            // Procesar la venta (actualizar inventario)
            $sale->processSale();

            DB::commit();

            // Devolver datos para el modal en lugar de redirigir
            return response()->json([
                'success' => true,
                'message' => 'Venta creada exitosamente',
                'sale' => [
                    'id' => $sale->id,
                    'sale_number' => $sale->sale_number,
                    'total' => $sale->total,
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            // Si es una petición AJAX, devolver JSON
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al crear la venta: ' . $e->getMessage(),
                ], 500);
            }

            return back()->withErrors(['error' => 'Error al crear la venta: ' . $e->getMessage()]);
        }
    }

    public function show(Sale $sale)
    {
        $sale->load([
            'customer',
            'branch',
            'user',
            'details.product.category',
            'details.product.brand',
            'payments' => function ($query) {
                $query->orderBy('payment_number', 'asc');
            }
        ]);

        return Inertia::render('Sales/Show', [
            'sale' => $sale,
        ]);
    }

    public function edit(Sale $sale)
    {
        if ($sale->status !== 'pendiente') {
            return back()->withErrors(['error' => 'Solo se pueden editar ventas pendientes.']);
        }

        $sale->load(['customer', 'branch', 'details.product']);
        $branches = Branch::active()->get();

        // Obtener series disponibles para el tipo de documento y sucursal actual
        $availableSeries = [];
        if ($sale->document_type !== 'nota_venta') {
            $availableSeries = DocumentSeries::where('branch_id', $sale->branch_id)
                ->where('document_type', $sale->document_type)
                ->where('is_active', true)
                ->get();
        }

        return Inertia::render('Sales/Edit', [
            'sale' => $sale,
            'branches' => $branches,
            'available_series' => $availableSeries,
        ]);
    }

    public function update(Request $request, Sale $sale)
    {
        if ($sale->status !== 'pendiente') {
            return back()->withErrors(['error' => 'Solo se pueden editar ventas pendientes.']);
        }

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'branch_id' => 'required|exists:branches,id',
            'sale_date' => 'required|date',
            'payment_method' => 'required|in:efectivo,tarjeta,transferencia,yape,plin,credito',
            'discount' => 'nullable|numeric|min:0',
            'amount_paid' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
            'products.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // PASO 1: Ajustar inventario comparando detalles originales vs nuevos
            // Esto devuelve stock de productos eliminados y descuenta stock de productos nuevos
            $sale->adjustInventoryOnUpdate($validated['products'], $validated['branch_id']);

            // PASO 2: Actualizar datos de la venta
            $sale->update([
                'customer_id' => $validated['customer_id'],
                'branch_id' => $validated['branch_id'],
                'sale_date' => $validated['sale_date'],
                'payment_method' => $validated['payment_method'],
                'discount' => $validated['discount'] ?? 0,
                'amount_paid' => $validated['amount_paid'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // PASO 3: Eliminar detalles anteriores
            $sale->details()->delete();

            // PASO 4: Crear nuevos detalles
            foreach ($validated['products'] as $productData) {
                $sale->details()->create([
                    'product_id' => $productData['product_id'],
                    'quantity' => $productData['quantity'],
                    'unit_price' => $productData['unit_price'],
                    'subtotal' => $productData['quantity'] * $productData['unit_price'],
                ]);
            }

            // PASO 5: Recalcular totales
            $sale->calculateTotals();
            $sale->change_amount = max(0, $validated['amount_paid'] - $sale->total);
            $sale->save();

            DB::commit();

            return redirect()->route('sales.show', $sale)
                ->with('success', 'Venta actualizada exitosamente. El inventario ha sido ajustado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    public function destroy(Sale $sale)
    {
        if ($sale->status !== 'pendiente') {
            return back()->withErrors(['error' => 'Solo se pueden eliminar ventas pendientes.']);
        }

        $sale->delete();
        return redirect()->route('sales.index')
            ->with('success', 'Venta eliminada exitosamente.');
    }

    public function cancel(Sale $sale)
    {
        if ($sale->status === 'anulado') {
            return back()->withErrors(['error' => 'Esta venta ya está anulada.']);
        }

        DB::beginTransaction();
        try {
            $sale->cancelSale();
            DB::commit();

            return redirect()->route('sales.show', $sale)
                ->with('success', 'Venta anulada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al anular la venta: ' . $e->getMessage()]);
        }
    }

    public function pdf(Sale $sale, Request $request)
    {
        $sale->load(['customer', 'branch', 'user', 'details.product', 'payments']);

        // Obtener configuraciones de la empresa
        $settings = Setting::get();

        $size = $request->query('size', 'a4'); // a4, a5, 80mm, 50mm

        // Configuración según el tamaño
        $config = $this->getPdfConfig($size);

        // Determinar qué vista usar según el tamaño
        $view = in_array($size, ['80mm', '50mm']) ? 'pdf.sale-ticket' : 'pdf.sale-a4';

        $pdf = PDF::loadView($view, [
            'sale' => $sale,
            'config' => $config,
            'settings' => $settings,
        ])
        ->setPaper($config['paper'], $config['orientation']);

        $filename = "venta-{$sale->sale_number}.pdf";

        $action = $request->query('action', 'download'); // print, download

        // Si es para imprimir, mostrar inline en el navegador
        if ($action === 'print' || $request->query('preview') === 'true') {
            return $pdf->stream($filename);
        }

        // Si no, descargar el PDF
        return $pdf->download($filename);
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
                    'width' => '70mm', // Ancho útil (dejando 5mm de margen a cada lado)
                    'height' => 'auto',
                    'fontSize' => '13px', // Letras más grandes y legibles
                ];
            case '50mm':
                return [
                    'paper' => [0, 0, 141.73, 566.93], // 50mm ancho
                    'orientation' => 'portrait',
                    'width' => '46mm', // Más margen para evitar desbordamiento
                    'height' => 'auto',
                    'fontSize' => '9px', // Más grande para mejor legibilidad
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