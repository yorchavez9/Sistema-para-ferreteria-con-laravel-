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
        Schema::create('cash_registers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // "Caja Principal", "Caja 2"
            $table->string('code')->unique(); // Código único para la caja
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['principal', 'secundaria'])->default('principal');
            $table->boolean('is_active')->default(true);
            $table->decimal('opening_balance', 12, 2)->default(0); // Fondo fijo inicial
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['branch_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_registers');
    }
};
