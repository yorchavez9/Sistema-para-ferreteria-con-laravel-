<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\Customer;
use App\Models\Branch;
use App\Models\Product;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use App\Models\Setting;

class QuoteController extends Controller
{
    public function index(Request $request)
    {
        $query = Quote::with(['customer', 'branch', 'user']);

        // Búsqueda en tiempo real
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('quote_number', 'like', "%{$search}%")
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

        if ($request->branch_id) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->date_from) {
            $query->whereDate('quote_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('quote_date', '<=', $request->date_to);
        }

        // Ordenamiento dinámico
        $sortField = $request->get('sort_field', 'quote_date');
        $sortDirection = $request->get('sort_direction', 'desc');

        if ($sortField === 'customer') {
            $query->join('customers', 'quotes.customer_id', '=', 'customers.id')
                ->orderBy('customers.name', $sortDirection)
                ->select('quotes.*');
        } elseif ($sortField === 'branch') {
            $query->join('branches', 'quotes.branch_id', '=', 'branches.id')
                ->orderBy('branches.name', $sortDirection)
                ->select('quotes.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $perPage = $request->get('per_page', 15);
        $quotes = $query->paginate($perPage)->withQueryString();

        // Actualizar cotizaciones vencidas
        foreach ($quotes as $quote) {
            $quote->checkAndMarkExpired();
        }

        // Estadísticas
        $stats = [
            'total_quotes' => Quote::count(),
            'total_amount' => Quote::whereNotIn('status', ['rechazada', 'vencida'])->sum('total'),
            'pending' => Quote::where('status', 'pendiente')->count(),
            'approved' => Quote::where('status', 'aprobada')->count(),
            'converted' => Quote::where('status', 'convertida')->count(),
            'expired' => Quote::where('status', 'vencida')->count(),
        ];

        $branches = Branch::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Quotes/Index', [
            'quotes' => $quotes,
            'stats' => $stats,
            'branches' => $branches,
            'filters' => $request->only(['search', 'status', 'branch_id', 'date_from', 'date_to', 'sort_field', 'sort_direction', 'per_page']),
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

        // Obtener la sucursal por defecto del usuario
        $defaultBranchId = auth()->user()->branch_id ?? $branches->first()?->id;

        return Inertia::render('Quotes/Create', [
            'defaultBranchId' => $defaultBranchId,
            'customers' => $customers,
            'branches' => $branches,
            'products' => $productsWithStock,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'branch_id' => 'required|exists:branches,id',
            'quote_date' => 'required|date',
            'expiration_date' => 'required|date|after_or_equal:quote_date',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,id',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Generar número de cotización
            $lastQuote = Quote::where('branch_id', $validated['branch_id'])
                ->orderBy('id', 'desc')
                ->first();

            $nextNumber = $lastQuote ? (int) substr($lastQuote->quote_number, 3) + 1 : 1;
            $quoteNumber = 'QT-' . str_pad($nextNumber, 8, '0', STR_PAD_LEFT);

            $quote = Quote::create([
                'quote_number' => $quoteNumber,
                'customer_id' => $validated['customer_id'],
                'branch_id' => $validated['branch_id'],
                'user_id' => auth()->id(),
                'quote_date' => $validated['quote_date'],
                'expiration_date' => $validated['expiration_date'],
                'status' => 'pendiente',
                'discount' => $validated['discount'] ?? 0,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['details'] as $detail) {
                $quote->details()->create([
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'unit_price' => $detail['unit_price'],
                    'subtotal' => $detail['quantity'] * $detail['unit_price'],
                ]);
            }

            $quote->calculateTotals();

            DB::commit();

            return redirect()->route('quotes.show', $quote)
                ->with('success', 'Cotización creada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al crear la cotización: ' . $e->getMessage()]);
        }
    }

    public function show(Quote $quote)
    {
        $quote->load([
            'customer',
            'branch',
            'user',
            'details.product.category',
            'details.product.brand',
            'convertedSale'
        ]);

        // Verificar si está vencida
        $quote->checkAndMarkExpired();

        return Inertia::render('Quotes/Show', [
            'quote' => $quote,
        ]);
    }

    public function edit(Quote $quote)
    {
        if (!in_array($quote->status, ['pendiente', 'aprobada'])) {
            return back()->withErrors(['error' => 'Solo se pueden editar cotizaciones pendientes o aprobadas.']);
        }

        $quote->load(['customer', 'branch', 'details.product']);
        $customers = Customer::active()->get();
        $branches = Branch::active()->get();
        $products = Product::active()->with(['category', 'brand'])->get();

        $productsWithStock = $products->map(function ($product) {
            $totalStock = Inventory::where('product_id', $product->id)->sum('current_stock');
            $product->total_stock = $totalStock;
            return $product;
        });

        return Inertia::render('Quotes/Edit', [
            'quote' => $quote,
            'customers' => $customers,
            'branches' => $branches,
            'products' => $productsWithStock,
        ]);
    }

    public function update(Request $request, Quote $quote)
    {
        if (!in_array($quote->status, ['pendiente', 'aprobada'])) {
            return back()->withErrors(['error' => 'Solo se pueden editar cotizaciones pendientes o aprobadas.']);
        }

        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'branch_id' => 'required|exists:branches,id',
            'quote_date' => 'required|date',
            'expiration_date' => 'required|date|after_or_equal:quote_date',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,id',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $quote->update([
                'customer_id' => $validated['customer_id'],
                'branch_id' => $validated['branch_id'],
                'quote_date' => $validated['quote_date'],
                'expiration_date' => $validated['expiration_date'],
                'discount' => $validated['discount'] ?? 0,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Eliminar detalles anteriores
            $quote->details()->delete();

            // Crear nuevos detalles
            foreach ($validated['details'] as $detail) {
                $quote->details()->create([
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'unit_price' => $detail['unit_price'],
                    'subtotal' => $detail['quantity'] * $detail['unit_price'],
                ]);
            }

            // Recalcular totales
            $quote->calculateTotals();

            DB::commit();

            return redirect()->route('quotes.show', $quote)
                ->with('success', 'Cotización actualizada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(Quote $quote)
    {
        if ($quote->status === 'convertida') {
            return back()->withErrors(['error' => 'No se pueden eliminar cotizaciones convertidas a venta.']);
        }

        $quote->delete();
        return redirect()->route('quotes.index')
            ->with('success', 'Cotización eliminada exitosamente.');
    }

    public function duplicate(Quote $quote)
    {
        DB::beginTransaction();
        try {
            // Generar nuevo número de cotización
            $lastQuote = Quote::where('branch_id', $quote->branch_id)
                ->orderBy('id', 'desc')
                ->first();

            $nextNumber = $lastQuote ? (int) substr($lastQuote->quote_number, 3) + 1 : 1;
            $quoteNumber = 'QT-' . str_pad($nextNumber, 8, '0', STR_PAD_LEFT);

            // Crear nueva cotización
            $newQuote = Quote::create([
                'quote_number' => $quoteNumber,
                'customer_id' => $quote->customer_id,
                'branch_id' => $quote->branch_id,
                'user_id' => auth()->id(),
                'quote_date' => now(),
                'expiration_date' => now()->addDays(7),
                'status' => 'pendiente',
                'discount' => $quote->discount,
                'notes' => $quote->notes,
            ]);

            // Copiar detalles
            foreach ($quote->details as $detail) {
                $newQuote->details()->create([
                    'product_id' => $detail->product_id,
                    'quantity' => $detail->quantity,
                    'unit_price' => $detail->unit_price,
                    'subtotal' => $detail->subtotal,
                    'discount' => $detail->discount,
                ]);
            }

            $newQuote->calculateTotals();

            DB::commit();

            return redirect()->route('quotes.show', $newQuote)
                ->with('success', 'Cotización duplicada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al duplicar la cotización: ' . $e->getMessage()]);
        }
    }

    public function pdf(Quote $quote, Request $request)
    {
        $quote->load(['customer', 'branch', 'user', 'details.product']);

        // Obtener configuraciones de la empresa
        $settings = Setting::get();

        $size = $request->query('size', 'a4'); // a4, a5, 80mm, 50mm

        // Configuración según el tamaño
        $config = $this->getPdfConfig($size);

        // Determinar qué vista usar según el tamaño
        $view = in_array($size, ['80mm', '50mm']) ? 'pdf.quote-ticket' : 'pdf.quote-a4';

        $pdf = PDF::loadView($view, [
            'quote' => $quote,
            'config' => $config,
            'settings' => $settings,
        ])
        ->setPaper($config['paper'], $config['orientation']);

        $filename = "cotizacion-{$quote->quote_number}.pdf";

        $action = $request->query('action', 'download');

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
                    'paper' => [0, 0, 226.77, 566.93],
                    'orientation' => 'portrait',
                    'width' => '70mm',
                    'height' => 'auto',
                    'fontSize' => '13px',
                ];
            case '50mm':
                return [
                    'paper' => [0, 0, 141.73, 566.93],
                    'orientation' => 'portrait',
                    'width' => '46mm',
                    'height' => 'auto',
                    'fontSize' => '9px',
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
