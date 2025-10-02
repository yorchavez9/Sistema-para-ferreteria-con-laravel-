<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();

            // Información de la Empresa
            $table->string('company_name')->nullable();
            $table->string('company_ruc', 11)->nullable();
            $table->text('company_address')->nullable();
            $table->string('company_phone')->nullable();
            $table->string('company_email')->nullable();
            $table->string('company_website')->nullable();
            $table->string('company_logo')->nullable(); // Ruta del archivo

            // Configuraciones Fiscales
            $table->decimal('igv_percentage', 5, 2)->default(18.00);
            $table->string('currency', 3)->default('PEN'); // PEN, USD, etc.
            $table->string('currency_symbol', 5)->default('S/');

            // Configuraciones de Sistema
            $table->string('timezone', 50)->default('America/Lima');
            $table->string('date_format', 20)->default('d/m/Y');
            $table->string('time_format', 20)->default('H:i');
            $table->string('locale', 10)->default('es');
            $table->integer('price_decimals')->default(2);
            $table->boolean('allow_negative_stock')->default(false);

            // APIs Externas - RENIEC
            $table->string('reniec_api_url')->nullable();
            $table->string('reniec_api_token')->nullable();
            $table->boolean('reniec_api_enabled')->default(false);

            // APIs Externas - SUNAT
            $table->string('sunat_api_url')->nullable();
            $table->string('sunat_api_token')->nullable();
            $table->string('sunat_api_ruc')->nullable();
            $table->string('sunat_api_username')->nullable();
            $table->string('sunat_api_password')->nullable();
            $table->boolean('sunat_api_enabled')->default(false);
            $table->boolean('sunat_production_mode')->default(false); // false = pruebas, true = producción

            // Configuraciones de Documentos
            $table->text('invoice_terms')->nullable(); // Términos y condiciones
            $table->text('invoice_footer')->nullable(); // Pie de página en facturas
            $table->text('invoice_notes')->nullable(); // Notas adicionales

            // Configuraciones de Notificaciones
            $table->boolean('email_notifications')->default(true);
            $table->boolean('low_stock_alerts')->default(true);
            $table->integer('low_stock_threshold')->default(10);

            // Configuraciones de Ventas
            $table->boolean('require_customer_for_sale')->default(false);
            $table->boolean('allow_sale_below_cost')->default(false);
            $table->integer('days_for_credit_sale')->default(30);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
