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
        Schema::create('cash_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_register_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained(); // Usuario que abre/cierra
            $table->foreignId('branch_id')->constrained();

            // Apertura
            $table->dateTime('opened_at');
            $table->decimal('opening_balance', 12, 2); // Efectivo inicial
            $table->text('opening_notes')->nullable();

            // Cierre
            $table->dateTime('closed_at')->nullable();
            $table->decimal('expected_balance', 12, 2)->nullable(); // Según sistema
            $table->decimal('actual_balance', 12, 2)->nullable(); // Conteo físico
            $table->decimal('difference', 12, 2)->nullable(); // Diferencia (sobrante/faltante)
            $table->text('closing_notes')->nullable();

            $table->enum('status', ['abierta', 'cerrada'])->default('abierta');
            $table->timestamps();

            $table->index(['cash_register_id', 'opened_at']);
            $table->index(['user_id', 'status']);
            $table->index(['branch_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_sessions');
    }
};
