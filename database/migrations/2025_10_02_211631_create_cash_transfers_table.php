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
        Schema::create('cash_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_cash_register_id')->constrained('cash_registers');
            $table->foreignId('to_cash_register_id')->constrained('cash_registers');
            $table->foreignId('from_branch_id')->constrained('branches');
            $table->foreignId('to_branch_id')->constrained('branches');
            $table->foreignId('user_id')->constrained(); // Usuario que realiza

            $table->dateTime('transfer_date');
            $table->decimal('amount', 12, 2);
            $table->text('description');
            $table->text('notes')->nullable();

            $table->enum('status', ['pendiente', 'completada', 'cancelada'])->default('pendiente');
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();

            $table->index(['from_cash_register_id', 'status']);
            $table->index(['to_cash_register_id', 'status']);
            $table->index(['transfer_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_transfers');
    }
};
