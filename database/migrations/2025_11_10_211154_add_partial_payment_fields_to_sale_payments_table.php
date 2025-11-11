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
        Schema::table('sale_payments', function (Blueprint $table) {
            $table->decimal('paid_amount', 12, 2)->default(0)->after('amount')->comment('Monto pagado (para pagos parciales)');
            $table->decimal('remaining_amount', 12, 2)->default(0)->after('paid_amount')->comment('Monto pendiente');
            $table->decimal('received_amount', 12, 2)->nullable()->after('remaining_amount')->comment('Monto recibido del cliente (para calcular vuelto)');
            $table->decimal('change_amount', 12, 2)->default(0)->after('received_amount')->comment('Vuelto/cambio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_payments', function (Blueprint $table) {
            $table->dropColumn(['paid_amount', 'remaining_amount', 'received_amount', 'change_amount']);
        });
    }
};
