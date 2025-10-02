<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Category::with(['parent'])
            ->withCount(['children', 'products']);

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

        // Filtro de tipo (principal o subcategoría)
        if ($request->type === 'main') {
            $query->whereNull('parent_id');
        } elseif ($request->type === 'sub') {
            $query->whereNotNull('parent_id');
        }

        // Ordenamiento
        $sortField = $request->get('sort_field', 'sort_order');
        $sortDirection = $request->get('sort_direction', 'asc');

        if ($sortField === 'parent') {
            $query->leftJoin('categories as parent_categories', 'categories.parent_id', '=', 'parent_categories.id')
                ->orderBy('parent_categories.name', $sortDirection)
                ->select('categories.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
            if ($sortField !== 'name') {
                $query->orderBy('name', 'asc');
            }
        }

        $perPage = $request->get('per_page', 15);
        $categories = $query->paginate($perPage)->withQueryString();

        // Estadísticas
        $stats = [
            'total_categories' => Category::count(),
            'active_categories' => Category::where('is_active', true)->count(),
            'main_categories' => Category::whereNull('parent_id')->count(),
            'subcategories' => Category::whereNotNull('parent_id')->count(),
        ];

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['search', 'is_active', 'type', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $parentCategories = Category::main()->active()->get();

        return Inertia::render('Categories/Create', [
            'parentCategories' => $parentCategories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:categories',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        Category::create($request->all());

        return redirect()->route('categories.index')
            ->with('success', 'Categoría creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        $category->load(['parent', 'children', 'products']);

        return Inertia::render('Categories/Show', [
            'category' => $category,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        $parentCategories = Category::main()
            ->active()
            ->where('id', '!=', $category->id)
            ->get();

        return Inertia::render('Categories/Edit', [
            'category' => $category,
            'parentCategories' => $parentCategories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:categories,code,' . $category->id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id|not_in:' . $category->id,
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $category->update($request->all());

        return redirect()->route('categories.index')
            ->with('success', 'Categoría actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Verificar si tiene productos asociados
        if ($category->products()->count() > 0) {
            return redirect()->route('categories.index')
                ->with('error', 'No se puede eliminar la categoría porque tiene productos asociados.');
        }

        // Verificar si tiene subcategorías
        if ($category->children()->count() > 0) {
            return redirect()->route('categories.index')
                ->with('error', 'No se puede eliminar la categoría porque tiene subcategorías.');
        }

        $category->delete();

        return redirect()->route('categories.index')
            ->with('success', 'Categoría eliminada exitosamente.');
    }
}
