<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Setting::firstOrCreate([], [
            // Información de la Empresa
            'company_name' => 'Ferretería El Constructor',
            'company_ruc' => '20123456789',
            'company_address' => 'Av. Principal 123, Lima, Perú',
            'company_phone' => '+51 987 654 321',
            'company_email' => 'info@ferreteria.com',
            'company_website' => 'https://www.ferreteria.com',
            'company_logo' => null,

            // Configuraciones Fiscales
            'igv_percentage' => 18.00,
            'currency' => 'PEN',
            'currency_symbol' => 'S/',

            // Configuraciones de Sistema
            'timezone' => 'America/Lima',
            'date_format' => 'd/m/Y',
            'time_format' => 'H:i',
            'locale' => 'es',
            'price_decimals' => 2,
            'allow_negative_stock' => false,

            // APIs Externas - RENIEC
            'reniec_api_url' => 'https://api.apis.net.pe/v2/reniec/dni',
            'reniec_api_token' => null,
            'reniec_api_enabled' => false,

            // APIs Externas - SUNAT
            'sunat_api_url' => 'https://api.apis.net.pe/v2/sunat/ruc',
            'sunat_api_token' => null,
            'sunat_api_ruc' => null,
            'sunat_api_username' => null,
            'sunat_api_password' => null,
            'sunat_api_enabled' => false,
            'sunat_production_mode' => false,

            // Configuraciones de Documentos
            'invoice_terms' => 'TÉRMINOS Y CONDICIONES:
1. Los precios están expresados en Soles Peruanos (S/).
2. El IGV (18%) está incluido en los precios.
3. Los productos tienen garantía según lo establecido por el fabricante.
4. No se aceptan devoluciones después de 7 días de la compra.
5. Para reclamos, presentar el comprobante de pago.',

            'invoice_footer' => 'Gracias por su compra. Para consultas: info@ferreteria.com | Tel: +51 987 654 321',

            'invoice_notes' => 'Representación impresa de la Boleta/Factura Electrónica.
Consulte su documento electrónico en: www.sunat.gob.pe',

            // Configuraciones de Notificaciones
            'email_notifications' => true,
            'low_stock_alerts' => true,
            'low_stock_threshold' => 10,

            // Configuraciones de Ventas
            'require_customer_for_sale' => false,
            'allow_sale_below_cost' => false,
            'days_for_credit_sale' => 30,
        ]);
    }
}
