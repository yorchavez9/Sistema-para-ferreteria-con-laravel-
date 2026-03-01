<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('primary_color_light', 7)->default('#4f46e5')->after('allow_negative_stock');
            $table->string('primary_color_dark', 7)->default('#6366f1')->after('primary_color_light');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['primary_color_light', 'primary_color_dark']);
        });
    }
};
