<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\DocumentApiService;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $customers = Customer::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->has('is_active'), function ($query) use ($request) {
                $query->where('is_active', $request->is_active);
            })
            ->when($request->customer_type, function ($query, $type) {
                $query->where('customer_type', $type);
            })
            ->when($request->document_type, function ($query, $type) {
                $query->where('document_type', $type);
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'is_active', 'customer_type', 'document_type']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Customers/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:customers,code',
            'document_type' => 'nullable|string|in:RUC,DNI,CE',
            'document_number' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'birth_date' => 'nullable|date',
            'customer_type' => 'required|in:personal,empresa',
            'payment_terms' => 'required|in:contado,credito_15,credito_30,credito_45,credito_60',
            'credit_limit' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        // Convertir strings vacíos a null
        $validated['document_type'] = $validated['document_type'] ?: null;
        $validated['document_number'] = $validated['document_number'] ?: null;
        $validated['credit_limit'] = $validated['credit_limit'] ?: null;

        Customer::create($validated);

        return redirect()->route('customers.index')
            ->with('success', 'Cliente creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        return Inertia::render('Customers/Show', [
            'customer' => $customer,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer)
    {
        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:customers,code,' . $customer->id,
            'document_type' => 'nullable|string|in:RUC,DNI,CE',
            'document_number' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'birth_date' => 'nullable|date',
            'customer_type' => 'required|in:personal,empresa',
            'payment_terms' => 'required|in:contado,credito_15,credito_30,credito_45,credito_60',
            'credit_limit' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        // Convertir strings vacíos a null
        $validated['document_type'] = $validated['document_type'] ?: null;
        $validated['document_number'] = $validated['document_number'] ?: null;
        $validated['credit_limit'] = $validated['credit_limit'] ?: null;

        $customer->update($validated);

        return redirect()->route('customers.index')
            ->with('success', 'Cliente actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();

        return redirect()->route('customers.index')
            ->with('success', 'Cliente eliminado exitosamente.');
    }

    /**
     * Buscar cliente por número de documento
     */
    public function searchByDocument(Request $request)
    {
        $request->validate([
            'document_number' => 'required|string',
        ]);

        $customer = Customer::where('document_number', $request->document_number)
            ->first();

        if ($customer) {
            return response()->json([
                'found' => true,
                'customer' => $customer,
            ]);
        }

        return response()->json([
            'found' => false,
            'message' => 'Cliente no encontrado',
        ]);
    }

    /**
     * Consultar documento en API externa (RENIEC/SUNAT)
     */
    public function consultarDocumento(Request $request, DocumentApiService $apiService)
    {
        $request->validate([
            'document_number' => 'required|string|min:8|max:11',
        ]);

        $documentNumber = trim($request->document_number);

        // Primero buscar en la base de datos local
        $customer = Customer::where('document_number', $documentNumber)->first();

        if ($customer) {
            return response()->json([
                'success' => true,
                'found_in_db' => true,
                'customer' => $customer,
            ]);
        }

        // Si no existe localmente, consultar en la API externa
        $result = $apiService->consultarDocumento($documentNumber);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'found_in_db' => false,
                'api_data' => $result['data'],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message'] ?? 'No se pudo consultar el documento',
        ], 400);
    }

    /**
     * Crear cliente desde modal (versión simplificada)
     */
    public function quickStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'document_type' => 'required|in:DNI,RUC,CE',
            'document_number' => 'required|string|max:20|unique:customers,document_number',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'customer_type' => 'nullable|in:personal,empresa',
        ]);

        // Generar código automático
        $lastCustomer = Customer::orderBy('id', 'desc')->first();
        $nextNumber = $lastCustomer ? ((int) substr($lastCustomer->code, 3)) + 1 : 1;
        $code = 'CLI' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

        // Determinar el tipo de cliente si no se proporciona
        $customerType = $validated['customer_type'] ?? ($validated['document_type'] === 'RUC' ? 'empresa' : 'personal');

        $customer = Customer::create([
            'code' => $code,
            'name' => $validated['name'],
            'document_type' => $validated['document_type'],
            'document_number' => $validated['document_number'],
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'address' => $validated['address'] ?? null,
            'customer_type' => $customerType,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'customer' => $customer,
            'message' => 'Cliente creado exitosamente.',
        ]);
    }

    public function searchApi(Request $request)
    {
        $search = $request->get('q', '');

        if (strlen($search) < 2) {
            return response()->json([]);
        }

        $customers = Customer::where('is_active', true)
            ->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->select('id', 'code', 'name', 'document_type', 'document_number', 'phone', 'email', 'address')
            ->limit(10)
            ->get();

        return response()->json($customers);
    }
}
