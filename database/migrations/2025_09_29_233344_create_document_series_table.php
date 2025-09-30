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
        Schema::create('document_series', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches');
            $table->enum('document_type', ['orden_compra', 'factura', 'boleta', 'nota_credito', 'nota_debito', 'guia_remision']);
            $table->string('series', 4); // F001, B001, O001, etc.
            $table->integer('current_number')->default(0); // Correlativo actual
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['branch_id', 'document_type', 'series']);
            $table->index(['branch_id', 'document_type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_series');
    }
};
