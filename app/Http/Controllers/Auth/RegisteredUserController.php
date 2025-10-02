<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Branch;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Database\Seeders\FerreteriaPermissionSeeder;
use Database\Seeders\FerreteriaRoleSeeder;
use Database\Seeders\FerreteriaDataSeeder;
use Database\Seeders\DocumentSeriesSeeder;
use Database\Seeders\ClienteVariosSeeder;
use Database\Seeders\SettingsSeeder;
use Database\Seeders\ExpenseCategorySeeder;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response|RedirectResponse
    {
        // Verificar si ya hay usuarios en la base de datos
        $hasUsers = User::count() > 0;

        // Si ya hay usuarios, redirigir al login (el registro está deshabilitado)
        if ($hasUsers) {
            return redirect()->route('login')->with('status', 'El registro está deshabilitado.');
        }

        // Es el primer usuario (configuración inicial)
        return Inertia::render('auth/register', [
            'isFirstUser' => true,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Verificar si ya hay usuarios (solo permitir registro si es el primer usuario)
        $hasUsers = User::count() > 0;

        if ($hasUsers) {
            return redirect()->route('login')->withErrors([
                'email' => 'El registro está deshabilitado. Por favor, inicia sesión.'
            ]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        DB::beginTransaction();
        try {
            // ========================================
            // PASO 1: Ejecutar seeders del sistema
            // ========================================

            // Limpiar caché de permisos
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            // 1. Crear permisos
            (new FerreteriaPermissionSeeder())->run();

            // 2. Crear roles (pero NO usuarios aún, se modificará el seeder)
            // Nota: FerreteriaRoleSeeder crea roles pero también un usuario admin,
            // lo comentaremos temporalmente para evitar conflictos
            $this->createRolesWithoutUser();

            // 3. Crear datos base (sucursales, categorías, productos, etc.)
            (new FerreteriaDataSeeder())->run();

            // 4. Crear series de documentos
            (new DocumentSeriesSeeder())->run();

            // 5. Crear cliente "Varios"
            (new ClienteVariosSeeder())->run();

            // 6. Crear configuraciones del sistema
            (new SettingsSeeder())->run();

            // 7. Crear categorías de gastos
            (new ExpenseCategorySeeder())->run();

            // ========================================
            // PASO 2: Obtener la sucursal principal creada por el seeder
            // ========================================
            $branch = Branch::where('code', 'SP001')->first();

            // Si no existe (por alguna razón), crear una por defecto
            if (!$branch) {
                $branch = Branch::create([
                    'name' => 'Sucursal Principal',
                    'code' => 'MAIN',
                    'address' => 'Por definir',
                    'phone' => '000000000',
                    'is_active' => true,
                    'is_main' => true,
                ]);
            }

            // ========================================
            // PASO 3: Crear el primer usuario (Super Admin)
            // ========================================
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'branch_id' => $branch->id,
                'is_active' => true,
                'email_verified_at' => now(), // Verificar email automáticamente
            ]);

            // ========================================
            // PASO 4: Asignar rol de Administrador
            // ========================================
            $adminRole = Role::where('name', 'Administrador')->first();

            if ($adminRole) {
                $user->assignRole($adminRole);
            } else {
                // Fallback: crear rol básico si no existe
                $superAdminRole = Role::create(['name' => 'Super Admin', 'guard_name' => 'web']);
                $superAdminRole->syncPermissions(Permission::all());
                $user->assignRole($superAdminRole);
            }

            DB::commit();

            event(new Registered($user));

            Auth::login($user);

            $request->session()->regenerate();

            // Redirigir al dashboard con mensaje de éxito
            return redirect()->route('dashboard')->with('success', '¡Bienvenido! El sistema ha sido configurado correctamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al configurar el sistema: ' . $e->getMessage()]);
        }
    }

    /**
     * Crear roles sin usuario (versión modificada del FerreteriaRoleSeeder)
     */
    private function createRolesWithoutUser(): void
    {
        // Crear roles
        $adminRole = Role::create(['name' => 'Administrador']);
        $managerRole = Role::create(['name' => 'Gerente']);
        $sellerRole = Role::create(['name' => 'Vendedor']);
        $cashierRole = Role::create(['name' => 'Cajero']);
        $warehouseRole = Role::create(['name' => 'Almacenero']);

        // Obtener todos los permisos
        $allPermissions = Permission::all();

        // Asignar permisos al Administrador (todos los permisos)
        $adminRole->givePermissionTo($allPermissions);

        // Permisos para Gerente
        $managerPermissions = Permission::whereIn('name', [
            'branch-list', 'category-list', 'brand-list', 'product-list',
            'supplier-list', 'customer-list', 'inventory-list',
            'purchase-list', 'sale-list', 'quote-list',
            'category-create', 'category-edit', 'category-delete',
            'brand-create', 'brand-edit', 'brand-delete',
            'product-create', 'product-edit', 'product-delete',
            'product-import', 'product-export',
            'supplier-create', 'supplier-edit', 'supplier-delete',
            'customer-create', 'customer-edit', 'customer-delete',
            'inventory-edit', 'inventory-adjustment', 'inventory-transfer',
            'purchase-create', 'purchase-edit', 'purchase-approve', 'purchase-receive',
            'sale-create', 'sale-edit', 'sale-refund',
            'quote-create', 'quote-edit', 'quote-delete', 'quote-convert',
            'reports-sales', 'reports-inventory', 'reports-financial',
            'reports-customers', 'reports-suppliers',
            'cashier-list', 'cashier-reports',
            'settings-view', 'settings-edit',
        ])->get();
        $managerRole->givePermissionTo($managerPermissions);

        // Permisos para Vendedor
        $sellerPermissions = Permission::whereIn('name', [
            'product-list', 'customer-list', 'inventory-list',
            'sale-list', 'quote-list',
            'customer-create', 'customer-edit',
            'sale-create', 'sale-edit',
            'quote-create', 'quote-edit', 'quote-convert',
        ])->get();
        $sellerRole->givePermissionTo($sellerPermissions);

        // Permisos para Cajero
        $cashierPermissions = Permission::whereIn('name', [
            'product-list', 'customer-list', 'inventory-list', 'sale-list',
            'sale-create', 'sale-edit', 'sale-refund',
            'cashier-open', 'cashier-close', 'cashier-list',
            'customer-create',
        ])->get();
        $cashierRole->givePermissionTo($cashierPermissions);

        // Permisos para Almacenero
        $warehousePermissions = Permission::whereIn('name', [
            'product-list', 'supplier-list', 'inventory-list',
            'purchase-list',
            'inventory-edit', 'inventory-adjustment', 'inventory-transfer',
            'purchase-receive',
        ])->get();
        $warehouseRole->givePermissionTo($warehousePermissions);
    }
}
