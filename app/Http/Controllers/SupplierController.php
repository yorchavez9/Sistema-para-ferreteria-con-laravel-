<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\DocumentApiService;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Supplier::query();

        // Búsqueda
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('document_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%");
            });
        }

        // Filtro de estado
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Filtro de tipo de documento
        if ($request->document_type) {
            $query->where('document_type', $request->document_type);
        }

        // Filtro de términos de pago
        if ($request->payment_terms) {
            $query->where('payment_terms', $request->payment_terms);
        }

        // Ordenamiento
        $sortField = $request->get('sort_field', 'name');
        $sortDirection = $request->get('sort_direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        $perPage = $request->get('per_page', 15);
        $suppliers = $query->paginate($perPage)->withQueryString();

        // Estadísticas
        $stats = [
            'total_suppliers' => Supplier::count(),
            'active_suppliers' => Supplier::where('is_active', true)->count(),
            'with_ruc' => Supplier::where('document_type', 'RUC')->count(),
            'credit_suppliers' => Supplier::where('payment_terms', '!=', 'contado')->count(),
        ];

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
            'stats' => $stats,
            'filters' => $request->only(['search', 'is_active', 'document_type', 'payment_terms', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Suppliers/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:suppliers,code',
            'document_type' => 'nullable|string|in:RUC,DNI,CE',
            'document_number' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'contact_person' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'notes' => 'nullable|string|max:1000',
            'payment_terms' => 'required|in:contado,credito_15,credito_30,credito_45,credito_60',
            'is_active' => 'boolean',
        ]);

        // Convertir strings vacíos a null
        $validated['document_type'] = $validated['document_type'] ?: null;
        $validated['document_number'] = $validated['document_number'] ?: null;

        Supplier::create($validated);

        return redirect()->route('suppliers.index')
            ->with('success', 'Proveedor creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        return Inertia::render('Suppliers/Show', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Supplier $supplier)
    {
        return Inertia::render('Suppliers/Edit', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:suppliers,code,' . $supplier->id,
            'document_type' => 'nullable|string|in:RUC,DNI,CE',
            'document_number' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'contact_person' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'notes' => 'nullable|string|max:1000',
            'payment_terms' => 'required|in:contado,credito_15,credito_30,credito_45,credito_60',
            'is_active' => 'boolean',
        ]);

        // Convertir strings vacíos a null
        $validated['document_type'] = $validated['document_type'] ?: null;
        $validated['document_number'] = $validated['document_number'] ?: null;

        $supplier->update($validated);

        return redirect()->route('suppliers.index')
            ->with('success', 'Proveedor actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return redirect()->route('suppliers.index')
            ->with('success', 'Proveedor eliminado exitosamente.');
    }

    /**
     * Crear proveedor rápido desde modal (versión simplificada)
     */
    public function quickStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'document_type' => 'required|in:DNI,RUC,CE',
            'document_number' => 'required|string|max:20|unique:suppliers,document_number',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
        ]);

        // Generar código automático
        $lastSupplier = Supplier::orderBy('id', 'desc')->first();
        $nextNumber = $lastSupplier ? ((int) substr($lastSupplier->code, 3)) + 1 : 1;
        $code = 'PRV' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

        $supplier = Supplier::create([
            'code' => $code,
            'name' => $validated['name'],
            'document_type' => $validated['document_type'],
            'document_number' => $validated['document_number'],
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'address' => $validated['address'] ?? null,
            'payment_terms' => 'contado', // Valor por defecto
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'supplier' => $supplier,
            'message' => 'Proveedor creado exitosamente.',
        ]);
    }

    /**
     * Buscar proveedores para API (usado en órdenes de compra)
     */
    public function searchApi(Request $request)
    {
        $search = $request->get('q', '');

        if (strlen($search) < 2) {
            return response()->json([]);
        }

        $suppliers = Supplier::where('is_active', true)
            ->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->select('id', 'code', 'name', 'document_type', 'document_number', 'phone', 'email', 'address')
            ->limit(10)
            ->get();

        return response()->json($suppliers);
    }

    /**
     * Buscar proveedor en API externa (RENIEC/SUNAT) o en base de datos local
     */
    public function externalSearch($document, DocumentApiService $apiService)
    {
        $documentNumber = trim($document);

        // Primero buscar en la base de datos local
        $supplier = Supplier::where('document_number', $documentNumber)
            ->where('is_active', true)
            ->first();

        if ($supplier) {
            return response()->json($supplier);
        }

        // Si no existe localmente, consultar en la API externa
        $result = $apiService->consultarDocumento($documentNumber);

        if ($result['success']) {
            // Retornar los datos de la API para que el frontend pueda crear el proveedor
            $apiData = $result['data'];

            // Preparar datos en formato compatible con el modelo Supplier
            $supplierData = [
                'name' => $apiData['name'] ?? '',
                'document_type' => $apiData['document_type'] ?? (strlen($documentNumber) === 8 ? 'DNI' : 'RUC'),
                'document_number' => $documentNumber,
                'address' => $apiData['direccion'] ?? '',
            ];

            return response()->json($supplierData);
        }

        return response()->json([
            'message' => $result['message'] ?? 'No se pudo consultar el documento',
        ], 404);
    }
}
