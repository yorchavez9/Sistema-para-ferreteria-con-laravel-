<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BrandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Brand::withCount('products');

        // Búsqueda
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filtro de estado
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Ordenamiento
        $sortField = $request->get('sort_field', 'name');
        $sortDirection = $request->get('sort_direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        $perPage = $request->get('per_page', 15);
        $brands = $query->paginate($perPage)->withQueryString();

        // Estadísticas
        $stats = [
            'total_brands' => Brand::count(),
            'active_brands' => Brand::where('is_active', true)->count(),
            'with_products' => Brand::has('products')->count(),
            'without_products' => Brand::doesntHave('products')->count(),
        ];

        return Inertia::render('Brands/Index', [
            'brands' => $brands,
            'stats' => $stats,
            'filters' => $request->only(['search', 'is_active', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Brands/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:brands',
            'description' => 'nullable|string',
            'website' => 'nullable|url',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:20',
        ]);

        Brand::create($request->all());

        return redirect()->route('brands.index')
            ->with('success', 'Marca creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Brand $brand)
    {
        $brand->load(['products.category']);

        return Inertia::render('Brands/Show', [
            'brand' => $brand,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Brand $brand)
    {
        return Inertia::render('Brands/Edit', [
            'brand' => $brand,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Brand $brand)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:brands,code,' . $brand->id,
            'description' => 'nullable|string',
            'website' => 'nullable|url',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:20',
        ]);

        $brand->update($request->all());

        return redirect()->route('brands.index')
            ->with('success', 'Marca actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Brand $brand)
    {
        // Verificar si tiene productos asociados
        if ($brand->products()->count() > 0) {
            return redirect()->route('brands.index')
                ->with('error', 'No se puede eliminar la marca porque tiene productos asociados.');
        }

        $brand->delete();

        return redirect()->route('brands.index')
            ->with('success', 'Marca eliminada exitosamente.');
    }
}
