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
        Schema::create('cash_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('cash_register_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained(); // Usuario que registra
            $table->foreignId('branch_id')->constrained();

            $table->enum('type', [
                'ingreso',              // Entrada de dinero
                'egreso',               // Salida de dinero
                'venta',                // Ingreso por venta
                'pago_credito',         // Ingreso por pago de cuota
                'compra',               // Egreso por compra
                'gasto',                // Egreso por gasto operativo
                'transferencia_entrada', // Transferencia desde otra caja
                'transferencia_salida',  // Transferencia hacia otra caja
                'ajuste'                // Ajuste manual
            ]);

            $table->decimal('amount', 12, 2);
            $table->enum('payment_method', ['efectivo', 'tarjeta', 'transferencia', 'yape', 'plin', 'otro']);

            // Referencias opcionales
            $table->foreignId('sale_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('payment_id')->nullable()->constrained('sale_payments')->onDelete('set null');
            $table->foreignId('purchase_order_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('expense_id')->nullable()->constrained()->onDelete('set null');

            $table->string('reference_number')->nullable(); // Número de referencia
            $table->text('description');
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['cash_session_id', 'type']);
            $table->index(['created_at']);
            $table->index(['type', 'payment_method']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_movements');
    }
};
