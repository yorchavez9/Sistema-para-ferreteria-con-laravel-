<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand'])
            ->withSum('inventory', 'current_stock');

        // Búsqueda en tiempo real
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($categoryQuery) use ($search) {
                        $categoryQuery->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('brand', function ($brandQuery) use ($search) {
                        $brandQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filtros
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->brand_id) {
            $query->where('brand_id', $request->brand_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Ordenamiento dinámico
        $sortField = $request->get('sort_field', 'name');
        $sortDirection = $request->get('sort_direction', 'asc');

        if ($sortField === 'category') {
            $query->join('categories', 'products.category_id', '=', 'categories.id')
                ->orderBy('categories.name', $sortDirection)
                ->select('products.*');
        } elseif ($sortField === 'brand') {
            $query->join('brands', 'products.brand_id', '=', 'brands.id')
                ->orderBy('brands.name', $sortDirection)
                ->select('products.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $perPage = $request->get('per_page', 15);
        $products = $query->paginate($perPage)->withQueryString();

        // Estadísticas
        $stats = [
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'low_stock' => Product::whereHas('inventory', function ($q) {
                $q->whereColumn('current_stock', '<=', 'min_stock');
            })->count(),
            'out_of_stock' => Product::whereHas('inventory', function ($q) {
                $q->where('current_stock', 0);
            })->count(),
        ];

        $categories = Category::active()->orderBy('name')->get(['id', 'name']);
        $brands = Brand::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'stats' => $stats,
            'categories' => $categories,
            'brands' => $brands,
            'filters' => $request->only(['search', 'category_id', 'brand_id', 'is_active', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::active()->get();
        $brands = Brand::active()->get();

        return Inertia::render('Products/Create', [
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:products',
            'barcode' => 'nullable|string|max:50|unique:products',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'unit_of_measure' => 'required|string|max:10',
            'purchase_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'min_stock' => 'required|integer|min:0',
            'max_stock' => 'required|integer|min:0',
            'igv_percentage' => 'required|numeric|min:0|max:100',
            'description' => 'nullable|string',
            'technical_specifications' => 'nullable|string',
        ]);

        Product::create($request->all());

        return redirect()->route('products.index')
            ->with('success', 'Producto creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load(['category', 'brand', 'inventory.branch']);

        return Inertia::render('Products/Show', [
            'product' => $product,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $categories = Category::active()->get();
        $brands = Brand::active()->get();

        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:products,code,' . $product->id,
            'barcode' => 'nullable|string|max:50|unique:products,barcode,' . $product->id,
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'unit_of_measure' => 'required|string|max:10',
            'purchase_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'min_stock' => 'required|integer|min:0',
            'max_stock' => 'required|integer|min:0',
            'igv_percentage' => 'required|numeric|min:0|max:100',
            'description' => 'nullable|string',
            'technical_specifications' => 'nullable|string',
        ]);

        $product->update($request->all());

        return redirect()->route('products.index')
            ->with('success', 'Producto actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Con SoftDeletes, ahora se hace eliminación lógica
        // No importa si tiene inventario, solo se marca como eliminado
        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Producto eliminado exitosamente.');
    }

    /**
     * Restore a soft deleted product.
     */
    public function restore($id)
    {
        $product = Product::withTrashed()->findOrFail($id);
        $product->restore();

        return redirect()->route('products.index')
            ->with('success', 'Producto restaurado exitosamente.');
    }

    /**
     * Permanently delete a product.
     */
    public function forceDelete($id)
    {
        $product = Product::withTrashed()->findOrFail($id);

        // Verificar si tiene inventario asociado antes de eliminar permanentemente
        if ($product->inventory()->exists()) {
            return redirect()->route('products.index')
                ->with('error', 'No se puede eliminar permanentemente el producto porque tiene registros de inventario asociados.');
        }

        $product->forceDelete();

        return redirect()->route('products.index')
            ->with('success', 'Producto eliminado permanentemente.');
    }

    /**
     * Search products for API (used in sales and purchase orders)
     */
    public function search(Request $request)
    {
        $search = $request->input('search', '');
        $branchId = $request->input('branch_id');

        $products = Product::with(['category', 'brand'])
            ->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            })
            ->where('is_active', true)
            ->limit(10)
            ->get()
            ->map(function ($product) use ($branchId) {
                // Agregar stock de la sucursal si se proporciona
                if ($branchId) {
                    $inventory = $product->inventory()->where('branch_id', $branchId)->first();
                    $product->stock = $inventory ? $inventory->current_stock : 0;
                } else {
                    $product->stock = $product->inventory()->sum('current_stock');
                }

                // Renombrar unit_of_measure a unit para consistencia
                $product->unit = $product->unit_of_measure;

                return $product;
            });

        return response()->json([
            'products' => $products
        ]);
    }
}
