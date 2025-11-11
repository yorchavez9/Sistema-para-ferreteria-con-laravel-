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
        // Cambiar el enum para incluir 'parcial'
        DB::statement("ALTER TABLE sale_payments MODIFY COLUMN status ENUM('pendiente', 'parcial', 'pagado', 'vencido') NOT NULL DEFAULT 'pendiente'");

        // Inicializar campos para pagos existentes
        DB::statement("UPDATE sale_payments SET paid_amount = amount, remaining_amount = 0 WHERE status = 'pagado' AND paid_amount = 0");
        DB::statement("UPDATE sale_payments SET paid_amount = 0, remaining_amount = amount WHERE status IN ('pendiente', 'vencido') AND paid_amount = 0");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE sale_payments MODIFY COLUMN status ENUM('pendiente', 'pagado', 'vencido') NOT NULL DEFAULT 'pendiente'");
    }
};
