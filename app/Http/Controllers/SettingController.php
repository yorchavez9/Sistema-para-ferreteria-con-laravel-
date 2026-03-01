<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    /**
     * Mostrar configuración general de la empresa
     */
    public function company()
    {
        $settings = Setting::get();

        return Inertia::render('settings/Company', [
            'settings' => $settings,
        ]);
    }

    /**
     * Actualizar configuración de la empresa
     */
    public function updateCompany(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'company_ruc' => 'nullable|string|max:11',
            'company_address' => 'nullable|string',
            'company_phone' => 'nullable|string|max:50',
            'company_email' => 'nullable|email|max:255',
            'company_website' => 'nullable|url|max:255',
            'company_logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
        ]);

        $settings = Setting::get();
        $data = $request->except('company_logo');

        // Manejo del logo
        if ($request->hasFile('company_logo')) {
            // Eliminar logo anterior si existe
            if ($settings->company_logo && Storage::disk('public')->exists($settings->company_logo)) {
                Storage::disk('public')->delete($settings->company_logo);
            }

            // Guardar nuevo logo
            $logoPath = $request->file('company_logo')->store('logos', 'public');
            $data['company_logo'] = $logoPath;
        }

        $settings->update($data);

        return redirect()->back()->with('success', 'Configuración de empresa actualizada exitosamente.');
    }

    /**
     * Eliminar logo de la empresa
     */
    public function deleteLogo()
    {
        $settings = Setting::get();

        if ($settings->company_logo && Storage::disk('public')->exists($settings->company_logo)) {
            Storage::disk('public')->delete($settings->company_logo);
        }

        $settings->update(['company_logo' => null]);

        return redirect()->back()->with('success', 'Logo eliminado exitosamente.');
    }

    /**
     * Mostrar configuración fiscal
     */
    public function fiscal()
    {
        $settings = Setting::get();

        return Inertia::render('settings/Fiscal', [
            'settings' => $settings,
        ]);
    }

    /**
     * Actualizar configuración fiscal
     */
    public function updateFiscal(Request $request)
    {
        $request->validate([
            'igv_percentage' => 'required|numeric|min:0|max:100',
            'currency' => 'required|string|max:3',
            'currency_symbol' => 'required|string|max:5',
        ]);

        $settings = Setting::get();
        $settings->update($request->only([
            'igv_percentage',
            'currency',
            'currency_symbol',
        ]));

        return redirect()->back()->with('success', 'Configuración fiscal actualizada exitosamente.');
    }

    /**
     * Mostrar configuración de sistema
     */
    public function system()
    {
        $settings = Setting::get();

        return Inertia::render('settings/System', [
            'settings' => $settings,
        ]);
    }

    /**
     * Actualizar configuración de sistema
     */
    public function updateSystem(Request $request)
    {
        $request->validate([
            'timezone' => 'required|string|max:50',
            'date_format' => 'required|string|max:20',
            'time_format' => 'required|string|max:20',
            'locale' => 'required|string|max:10',
            'price_decimals' => 'required|integer|min:0|max:4',
            'allow_negative_stock' => 'boolean',
        ]);

        $settings = Setting::get();
        $settings->update($request->only([
            'timezone',
            'date_format',
            'time_format',
            'locale',
            'price_decimals',
            'allow_negative_stock',
        ]));

        return redirect()->back()->with('success', 'Configuración de sistema actualizada exitosamente.');
    }

    /**
     * Mostrar configuración de APIs
     */
    public function apis()
    {
        $settings = Setting::get();

        return Inertia::render('settings/Apis', [
            'settings' => $settings,
        ]);
    }

    /**
     * Actualizar configuración de APIs
     */
    public function updateApis(Request $request)
    {
        $request->validate([
            // RENIEC
            'reniec_api_url' => 'nullable|url',
            'reniec_api_token' => 'nullable|string',
            'reniec_api_enabled' => 'boolean',

            // SUNAT
            'sunat_api_url' => 'nullable|url',
            'sunat_api_token' => 'nullable|string',
            'sunat_api_ruc' => 'nullable|string|max:11',
            'sunat_api_username' => 'nullable|string',
            'sunat_api_password' => 'nullable|string',
            'sunat_api_enabled' => 'boolean',
            'sunat_production_mode' => 'boolean',
        ]);

        $settings = Setting::get();
        $settings->update($request->only([
            'reniec_api_url',
            'reniec_api_token',
            'reniec_api_enabled',
            'sunat_api_url',
            'sunat_api_token',
            'sunat_api_ruc',
            'sunat_api_username',
            'sunat_api_password',
            'sunat_api_enabled',
            'sunat_production_mode',
        ]));

        return redirect()->back()->with('success', 'Configuración de APIs actualizada exitosamente.');
    }

    /**
     * Mostrar configuración de documentos
     */
    public function documents()
    {
        $settings = Setting::get();

        return Inertia::render('settings/Documents', [
            'settings' => $settings,
        ]);
    }

    /**
     * Actualizar configuración de documentos
     */
    public function updateDocuments(Request $request)
    {
        $request->validate([
            'invoice_terms' => 'nullable|string',
            'invoice_footer' => 'nullable|string',
            'invoice_notes' => 'nullable|string',
        ]);

        $settings = Setting::get();
        $settings->update($request->only([
            'invoice_terms',
            'invoice_footer',
            'invoice_notes',
        ]));

        return redirect()->back()->with('success', 'Configuración de documentos actualizada exitosamente.');
    }

    /**
     * Mostrar configuración de tema
     */
    public function theme()
    {
        $settings = Setting::get();

        return Inertia::render('settings/Theme', [
            'settings' => $settings,
        ]);
    }

    /**
     * Actualizar configuración de tema
     */
    public function updateTheme(Request $request)
    {
        $request->validate([
            'primary_color_light' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'primary_color_dark' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $settings = Setting::get();
        $settings->update($request->only([
            'primary_color_light',
            'primary_color_dark',
        ]));

        return redirect()->back()->with('success', 'Colores del tema actualizados exitosamente.');
    }

    /**
     * Mostrar configuración de ventas
     */
    public function sales()
    {
        $settings = Setting::get();

        return Inertia::render('settings/Sales', [
            'settings' => $settings,
        ]);
    }

    /**
     * Actualizar configuración de ventas
     */
    public function updateSales(Request $request)
    {
        $request->validate([
            'require_customer_for_sale' => 'boolean',
            'allow_sale_below_cost' => 'boolean',
            'days_for_credit_sale' => 'required|integer|min:1',
            'low_stock_alerts' => 'boolean',
            'low_stock_threshold' => 'required|integer|min:0',
        ]);

        $settings = Setting::get();
        $settings->update($request->only([
            'require_customer_for_sale',
            'allow_sale_below_cost',
            'days_for_credit_sale',
            'low_stock_alerts',
            'low_stock_threshold',
        ]));

        return redirect()->back()->with('success', 'Configuración de ventas actualizada exitosamente.');
    }
}
