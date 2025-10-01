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
        Schema::table('sales', function (Blueprint $table) {
            $table->enum('payment_type', ['contado', 'credito'])->default('contado')->after('payment_method');
            $table->integer('credit_days')->nullable()->after('payment_type'); // 15, 30, 45, 60
            $table->integer('installments')->nullable()->after('credit_days'); // Número de cuotas
            $table->decimal('initial_payment', 12, 2)->default(0)->after('installments'); // Pago inicial/enganche
            $table->decimal('remaining_balance', 12, 2)->default(0)->after('initial_payment'); // Saldo pendiente

            $table->index('payment_type');
            $table->index(['payment_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex(['payment_type']);
            $table->dropIndex(['payment_type', 'status']);

            $table->dropColumn([
                'payment_type',
                'credit_days',
                'installments',
                'initial_payment',
                'remaining_balance',
            ]);
        });
    }
};
