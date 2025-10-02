<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Customer;

class ClienteVariosSeeder extends Seeder
{
    public function run(): void
    {
        // Verificar si ya existe el cliente "Varios"
        $existingCustomer = Customer::where('document_number', '00000000')->first();

        if (!$existingCustomer) {
            Customer::create([
                'code' => 'CLI-00001',
                'name' => 'CLIENTE VARIOS',
                'document_type' => 'DNI',
                'document_number' => '00000000',
                'customer_type' => 'personal',
                'phone' => '',
                'email' => '',
                'address' => '',
                'is_active' => true,
            ]);

            $this->command->info('Cliente "CLIENTE VARIOS" creado exitosamente.');
        } else {
            $this->command->info('Cliente "CLIENTE VARIOS" ya existe.');
        }
    }
}
