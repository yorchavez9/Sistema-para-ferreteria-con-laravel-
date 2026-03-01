<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    // Configuraciones de Sistema
    Route::prefix('settings/system')->middleware('permission:settings-view')->group(function () {
        // Configuración de Empresa
        Route::get('company', [SettingController::class, 'company'])->name('settings.company');
        Route::put('company', [SettingController::class, 'updateCompany'])->name('settings.company.update')->middleware('permission:settings-edit');
        Route::delete('company/logo', [SettingController::class, 'deleteLogo'])->name('settings.company.logo.delete')->middleware('permission:settings-edit');

        // Configuración Fiscal
        Route::get('fiscal', [SettingController::class, 'fiscal'])->name('settings.fiscal');
        Route::put('fiscal', [SettingController::class, 'updateFiscal'])->name('settings.fiscal.update')->middleware('permission:settings-edit');

        // Configuración de Sistema
        Route::get('general', [SettingController::class, 'system'])->name('settings.system');
        Route::put('general', [SettingController::class, 'updateSystem'])->name('settings.system.update')->middleware('permission:settings-edit');

        // Configuración de APIs (RENIEC, SUNAT)
        Route::get('apis', [SettingController::class, 'apis'])->name('settings.apis');
        Route::put('apis', [SettingController::class, 'updateApis'])->name('settings.apis.update')->middleware('permission:settings-edit');

        // Configuración de Documentos
        Route::get('documents', [SettingController::class, 'documents'])->name('settings.documents');
        Route::put('documents', [SettingController::class, 'updateDocuments'])->name('settings.documents.update')->middleware('permission:settings-edit');

        // Configuración de Ventas
        Route::get('sales', [SettingController::class, 'sales'])->name('settings.sales');
        Route::put('sales', [SettingController::class, 'updateSales'])->name('settings.sales.update')->middleware('permission:settings-edit');

        // Personalización de Tema
        Route::get('theme', [SettingController::class, 'theme'])->name('settings.theme');
        Route::put('theme', [SettingController::class, 'updateTheme'])->name('settings.theme.update')->middleware('permission:settings-edit');
    });
});
