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
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // "Servicios", "Sueldos", "Alquiler", etc.
            $table->string('code')->unique(); // Código único
            $table->text('description')->nullable();
            $table->string('color')->default('#6b7280'); // Para UI
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expense_categories');
    }
};
