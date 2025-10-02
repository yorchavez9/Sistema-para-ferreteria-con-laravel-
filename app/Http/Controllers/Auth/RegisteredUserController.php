<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

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

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
