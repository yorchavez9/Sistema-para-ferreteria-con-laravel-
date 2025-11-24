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
        Schema::table('products', function (Blueprint $table) {
            // Primero eliminar la clave foránea existente
            $table->dropForeign(['brand_id']);

            // Hacer el campo nullable
            $table->foreignId('brand_id')->nullable()->change();

            // Recrear la clave foránea
            $table->foreign('brand_id')->references('id')->on('brands');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Eliminar la clave foránea
            $table->dropForeign(['brand_id']);

            // Hacer el campo no nullable de nuevo
            $table->foreignId('brand_id')->nullable(false)->change();

            // Recrear la clave foránea
            $table->foreign('brand_id')->references('id')->on('brands');
        });
    }
};
