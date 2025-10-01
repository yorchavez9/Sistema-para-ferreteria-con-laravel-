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
        Schema::create('sale_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->onDelete('cascade');
            $table->integer('payment_number'); // 1, 2, 3, etc.
            $table->decimal('amount', 12, 2); // Monto de la cuota
            $table->date('due_date'); // Fecha de vencimiento
            $table->date('paid_date')->nullable(); // Fecha de pago real
            $table->enum('status', ['pendiente', 'pagado', 'vencido'])->default('pendiente');
            $table->enum('payment_method', ['efectivo', 'tarjeta', 'transferencia', 'yape', 'plin'])->nullable();
            $table->string('transaction_reference')->nullable(); // N° de operación/voucher
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();

            $table->index(['sale_id', 'status']);
            $table->index(['due_date', 'status']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_payments');
    }
};
