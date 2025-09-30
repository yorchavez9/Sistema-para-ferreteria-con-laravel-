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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('series', 20); // O001, OC-2025, etc.
            $table->string('correlativo', 20); // 1, 123, 4433, etc.
            $table->string('order_number', 50)->unique()->virtualAs('CONCAT(series, "-", correlativo)'); // O001-123, OC-2025-4433
            $table->foreignId('supplier_id')->constrained('suppliers');
            $table->foreignId('branch_id')->constrained('branches');
            $table->foreignId('user_id')->constrained('users'); // Usuario que crea la orden
            $table->date('order_date');
            $table->date('expected_date')->nullable(); // Fecha esperada de entrega
            $table->date('received_date')->nullable(); // Fecha de recepción
            $table->enum('status', ['pendiente', 'parcial', 'recibido', 'cancelado'])->default('pendiente');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0); // IGV 18%
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['supplier_id', 'status']);
            $table->index(['branch_id', 'status']);
            $table->index('order_date');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
