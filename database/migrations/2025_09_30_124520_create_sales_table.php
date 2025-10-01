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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('series', 20); // B001, F001, NV-001, etc.
            $table->string('correlativo', 20); // 1, 123, 4433, etc.
            $table->string('sale_number', 50)->unique()->virtualAs('CONCAT(series, "-", correlativo)'); // B001-123, F001-4433
            $table->enum('document_type', ['boleta', 'factura', 'nota_venta'])->default('boleta');
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('branch_id')->constrained('branches');
            $table->foreignId('user_id')->constrained('users'); // Usuario vendedor
            $table->date('sale_date');
            $table->enum('payment_method', ['efectivo', 'tarjeta', 'transferencia', 'yape', 'plin', 'credito'])->default('efectivo');
            $table->enum('status', ['pendiente', 'pagado', 'cancelado', 'anulado'])->default('pendiente');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0); // IGV 18%
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->decimal('amount_paid', 12, 2)->default(0); // Monto pagado
            $table->decimal('change_amount', 12, 2)->default(0); // Vuelto
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes(); // Para anular ventas

            $table->index(['customer_id', 'status']);
            $table->index(['branch_id', 'status']);
            $table->index('sale_date');
            $table->index('status');
            $table->index('document_type');
            $table->index('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};