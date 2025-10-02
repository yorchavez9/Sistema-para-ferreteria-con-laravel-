<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $query = Branch::withCount(['products', 'inventories']);

        // Búsqueda
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('manager_name', 'like', "%{$search}%");
            });
        }

        // Filtro de estado
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Filtro de tipo (principal o secundaria)
        if ($request->has('is_main')) {
            $query->where('is_main', $request->is_main);
        }

        // Ordenamiento
        $sortField = $request->get('sort_field', 'name');
        $sortDirection = $request->get('sort_direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        $perPage = $request->get('per_page', 15);
        $branches = $query->paginate($perPage)->withQueryString();

        // Estadísticas
        $stats = [
            'total_branches' => Branch::count(),
            'active_branches' => Branch::where('is_active', true)->count(),
            'main_branches' => Branch::where('is_main', true)->count(),
            'with_inventory' => Branch::has('inventories')->count(),
        ];

        return Inertia::render('Branches/Index', [
            'branches' => $branches,
            'stats' => $stats,
            'filters' => $request->only(['search', 'is_active', 'is_main', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Branches/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:branches,code',
            'address' => 'required|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'manager_name' => 'nullable|string|max:255',
            'is_main' => 'boolean',
            'is_active' => 'boolean',
        ]);

        Branch::create($request->all());

        return redirect()->route('branches.index')
                        ->with('success', 'Sucursal creada exitosamente.');
    }

    public function show(Branch $branch)
    {
        $branch->load(['products' => function ($query) {
            $query->with('category')->orderBy('name');
        }]);

        return Inertia::render('Branches/Show', [
            'branch' => $branch,
        ]);
    }

    public function edit(Branch $branch)
    {
        return Inertia::render('Branches/Edit', [
            'branch' => $branch,
        ]);
    }

    public function update(Request $request, Branch $branch)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:branches,code,' . $branch->id,
            'address' => 'required|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'manager_name' => 'nullable|string|max:255',
            'is_main' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $branch->update($request->all());

        return redirect()->route('branches.index')
                        ->with('success', 'Sucursal actualizada exitosamente.');
    }

    public function destroy(Branch $branch)
    {
        if ($branch->is_main) {
            return redirect()->route('branches.index')
                           ->with('error', 'No se puede eliminar la sucursal principal.');
        }

        if ($branch->products()->count() > 0) {
            return redirect()->route('branches.index')
                           ->with('error', 'No se puede eliminar una sucursal con productos asociados.');
        }

        $branch->delete();

        return redirect()->route('branches.index')
                        ->with('success', 'Sucursal eliminada exitosamente.');
    }
}
