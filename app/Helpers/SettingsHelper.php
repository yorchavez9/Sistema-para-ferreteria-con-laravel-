<?php

if (!function_exists('settings')) {
    /**
     * Obtener configuraciones de la aplicación
     *
     * @param string|null $key Clave específica a obtener
     * @param mixed $default Valor por defecto si no existe
     * @return mixed
     */
    function settings(?string $key = null, $default = null)
    {
        $settings = \App\Models\Setting::get();

        if ($key === null) {
            return $settings;
        }

        return $settings->$key ?? $default;
    }
}

if (!function_exists('company_name')) {
    /**
     * Obtener nombre de la empresa
     */
    function company_name(): string
    {
        return settings('company_name', config('app.name'));
    }
}

if (!function_exists('currency_symbol')) {
    /**
     * Obtener símbolo de moneda
     */
    function currency_symbol(): string
    {
        return settings('currency_symbol', 'S/');
    }
}

if (!function_exists('igv_percentage')) {
    /**
     * Obtener porcentaje de IGV
     */
    function igv_percentage(): float
    {
        return settings('igv_percentage', 18.00);
    }
}

if (!function_exists('igv_decimal')) {
    /**
     * Obtener IGV en formato decimal (18% = 0.18)
     */
    function igv_decimal(): float
    {
        return igv_percentage() / 100;
    }
}

if (!function_exists('format_currency')) {
    /**
     * Formatear cantidad como moneda
     */
    function format_currency(float $amount): string
    {
        $symbol = currency_symbol();
        $decimals = settings('price_decimals', 2);
        return $symbol . ' ' . number_format($amount, $decimals, '.', ',');
    }
}

if (!function_exists('is_reniec_enabled')) {
    /**
     * Verificar si API de RENIEC está habilitada
     */
    function is_reniec_enabled(): bool
    {
        return settings('reniec_api_enabled', false) && !empty(settings('reniec_api_token'));
    }
}

if (!function_exists('is_sunat_enabled')) {
    /**
     * Verificar si API de SUNAT está habilitada
     */
    function is_sunat_enabled(): bool
    {
        return settings('sunat_api_enabled', false) && !empty(settings('sunat_api_token'));
    }
}

if (!function_exists('setting')) {
    /**
     * Alias para settings() - Singular form
     */
    function setting(?string $key = null, $default = null)
    {
        return settings($key, $default);
    }
}
