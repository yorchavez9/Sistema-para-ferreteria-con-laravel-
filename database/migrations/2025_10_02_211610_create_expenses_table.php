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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained();
            $table->foreignId('expense_category_id')->constrained();
            $table->foreignId('user_id')->constrained(); // Usuario que registra
            $table->foreignId('cash_session_id')->nullable()->constrained()->onDelete('set null');

            $table->date('expense_date');
            $table->decimal('amount', 12, 2);
            $table->enum('payment_method', ['efectivo', 'tarjeta', 'transferencia', 'otro']);

            $table->string('supplier_name')->nullable(); // Proveedor del servicio
            $table->string('document_type')->nullable(); // boleta, factura, recibo
            $table->string('document_number')->nullable();

            $table->text('description');
            $table->text('notes')->nullable();
            $table->string('receipt_file')->nullable(); // Archivo adjunto

            $table->enum('status', ['pendiente', 'aprobado', 'rechazado'])->default('pendiente');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->dateTime('approved_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['expense_date']);
            $table->index(['expense_category_id']);
            $table->index(['status']);
            $table->index(['branch_id', 'expense_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
