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
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('quote_number', 50)->unique(); // QT-00000001
            $table->foreignId('customer_id')->nullable()->constrained('customers');
            $table->foreignId('branch_id')->constrained('branches');
            $table->foreignId('user_id')->constrained('users'); // Usuario que creó la cotización
            $table->date('quote_date');
            $table->date('expiration_date'); // Fecha de validez de la cotización
            $table->enum('status', ['pendiente', 'aprobada', 'rechazada', 'convertida', 'vencida'])->default('pendiente');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0); // IGV 18%
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('converted_to_sale_id')->nullable()->constrained('sales'); // Venta generada
            $table->timestamp('converted_at')->nullable(); // Fecha de conversión
            $table->timestamps();
            $table->softDeletes(); // Para anular cotizaciones

            $table->index(['customer_id', 'status']);
            $table->index(['branch_id', 'status']);
            $table->index('quote_date');
            $table->index('expiration_date');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
