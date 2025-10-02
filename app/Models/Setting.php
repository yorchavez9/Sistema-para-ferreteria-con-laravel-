<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        // Información de la Empresa
        'company_name',
        'company_ruc',
        'company_address',
        'company_phone',
        'company_email',
        'company_website',
        'company_logo',

        // Configuraciones Fiscales
        'igv_percentage',
        'currency',
        'currency_symbol',

        // Configuraciones de Sistema
        'timezone',
        'date_format',
        'time_format',
        'locale',
        'price_decimals',
        'allow_negative_stock',

        // APIs Externas - RENIEC
        'reniec_api_url',
        'reniec_api_token',
        'reniec_api_enabled',

        // APIs Externas - SUNAT
        'sunat_api_url',
        'sunat_api_token',
        'sunat_api_ruc',
        'sunat_api_username',
        'sunat_api_password',
        'sunat_api_enabled',
        'sunat_production_mode',

        // Configuraciones de Documentos
        'invoice_terms',
        'invoice_footer',
        'invoice_notes',

        // Configuraciones de Notificaciones
        'email_notifications',
        'low_stock_alerts',
        'low_stock_threshold',

        // Configuraciones de Ventas
        'require_customer_for_sale',
        'allow_sale_below_cost',
        'days_for_credit_sale',
    ];

    protected $casts = [
        'igv_percentage' => 'decimal:2',
        'price_decimals' => 'integer',
        'allow_negative_stock' => 'boolean',
        'reniec_api_enabled' => 'boolean',
        'sunat_api_enabled' => 'boolean',
        'sunat_production_mode' => 'boolean',
        'email_notifications' => 'boolean',
        'low_stock_alerts' => 'boolean',
        'low_stock_threshold' => 'integer',
        'require_customer_for_sale' => 'boolean',
        'allow_sale_below_cost' => 'boolean',
        'days_for_credit_sale' => 'integer',
    ];

    /**
     * Boot del modelo
     */
    protected static function booted()
    {
        // Limpiar cache cuando se actualicen las configuraciones
        static::saved(function () {
            Cache::forget('app_settings');
        });

        static::deleted(function () {
            Cache::forget('app_settings');
        });
    }

    /**
     * Obtener todas las configuraciones (singleton pattern)
     * Solo debe haber un registro de configuraciones
     */
    public static function get(): self
    {
        return Cache::remember('app_settings', 3600, function () {
            return self::firstOrCreate([], [
                'company_name' => 'Mi Ferretería',
                'currency' => 'PEN',
                'currency_symbol' => 'S/',
                'igv_percentage' => 18.00,
                'timezone' => 'America/Lima',
                'date_format' => 'd/m/Y',
                'time_format' => 'H:i',
                'locale' => 'es',
                'price_decimals' => 2,
                'allow_negative_stock' => false,
                'reniec_api_enabled' => false,
                'sunat_api_enabled' => false,
                'sunat_production_mode' => false,
                'email_notifications' => true,
                'low_stock_alerts' => true,
                'low_stock_threshold' => 10,
                'require_customer_for_sale' => false,
                'allow_sale_below_cost' => false,
                'days_for_credit_sale' => 30,
            ]);
        });
    }

    /**
     * Actualizar configuraciones
     */
    public static function set(array $data): self
    {
        $settings = self::get();
        $settings->update($data);
        Cache::forget('app_settings');
        return $settings;
    }

    /**
     * Obtener una configuración específica
     */
    public static function getValue(string $key, $default = null)
    {
        $settings = self::get();
        return $settings->$key ?? $default;
    }

    /**
     * Verificar si RENIEC está habilitado
     */
    public static function isReniecEnabled(): bool
    {
        return self::getValue('reniec_api_enabled', false) &&
               !empty(self::getValue('reniec_api_token'));
    }

    /**
     * Verificar si SUNAT está habilitado
     */
    public static function isSunatEnabled(): bool
    {
        return self::getValue('sunat_api_enabled', false) &&
               !empty(self::getValue('sunat_api_token'));
    }

    /**
     * Obtener el logo de la empresa
     */
    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->company_logo) {
            return null;
        }

        // Generar URL absoluta usando el helper asset() con barra inicial
        return asset('/storage/' . $this->company_logo);
    }

    /**
     * Obtener IGV decimal (ejemplo: 18% = 0.18)
     */
    public function getIgvDecimalAttribute(): float
    {
        return $this->igv_percentage / 100;
    }
}
