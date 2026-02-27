<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DocumentApiService
{
    /**
     * Consultar DNI en RENIEC
     */
    public function consultarDNI(string $dni): ?array
    {
        if (!is_reniec_enabled()) {
            return [
                'success' => false,
                'message' => 'La API de RENIEC no está habilitada. Configúrala en Configuración > APIs Externas.'
            ];
        }

        $apiUrl = settings('reniec_api_url', 'https://api.decolecta.com/v1/reniec/dni');
        $apiToken = settings('reniec_api_token');

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiToken,
                'Content-Type' => 'application/json',
            ])->get($apiUrl, [
                'numero' => $dni
            ]);

            if ($response->successful()) {
                $data = $response->json();

                $fullName = $data['full_name']
                    ?? trim(($data['first_name'] ?? '') . ' ' . ($data['first_last_name'] ?? '') . ' ' . ($data['second_last_name'] ?? ''))
                    ?: null;

                return [
                    'success' => true,
                    'data' => [
                        'document_type' => 'DNI',
                        'document_number' => $data['document_number'] ?? $dni,
                        'name' => $fullName,
                        'first_name' => $data['first_name'] ?? null,
                        'first_last_name' => $data['first_last_name'] ?? null,
                        'second_last_name' => $data['second_last_name'] ?? null,
                    ]
                ];
            }

            Log::warning('API DNI Error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [
                'success' => false,
                'message' => 'No se pudo consultar el DNI. Código: ' . $response->status()
            ];
        } catch (\Exception $e) {
            Log::error('API DNI Exception', [
                'message' => $e->getMessage(),
                'dni' => $dni
            ]);

            return [
                'success' => false,
                'message' => 'Error al consultar el DNI: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Consultar RUC en SUNAT
     */
    public function consultarRUC(string $ruc): ?array
    {
        if (!is_sunat_enabled()) {
            return [
                'success' => false,
                'message' => 'La API de SUNAT no está habilitada. Configúrala en Configuración > APIs Externas.'
            ];
        }

        $apiUrl = settings('sunat_api_url', 'https://api.decolecta.com/v1/sunat/ruc');
        $apiToken = settings('sunat_api_token');

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiToken,
                'Content-Type' => 'application/json',
            ])->get($apiUrl, [
                'numero' => $ruc
            ]);

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'success' => true,
                    'data' => [
                        'document_type' => 'RUC',
                        'document_number' => $data['numero_documento'] ?? $ruc,
                        'name' => $data['razon_social'] ?? null,
                        'razon_social' => $data['razon_social'] ?? null,
                        'nombre_comercial' => $data['nombre_comercial'] ?? null,
                        'direccion' => $data['direccion'] ?? null,
                        'estado' => $data['estado'] ?? null,
                        'condicion' => $data['condicion'] ?? null,
                        'distrito' => $data['distrito'] ?? null,
                        'provincia' => $data['provincia'] ?? null,
                        'departamento' => $data['departamento'] ?? null,
                    ]
                ];
            }

            Log::warning('API RUC Error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [
                'success' => false,
                'message' => 'No se pudo consultar el RUC. Código: ' . $response->status()
            ];
        } catch (\Exception $e) {
            Log::error('API RUC Exception', [
                'message' => $e->getMessage(),
                'ruc' => $ruc
            ]);

            return [
                'success' => false,
                'message' => 'Error al consultar el RUC: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Consultar documento automáticamente según su longitud
     */
    public function consultarDocumento(string $numero): ?array
    {
        $numero = trim($numero);
        $length = strlen($numero);

        if ($length === 8) {
            return $this->consultarDNI($numero);
        } elseif ($length === 11) {
            return $this->consultarRUC($numero);
        }

        return [
            'success' => false,
            'message' => 'Número de documento inválido. Debe ser DNI (8 dígitos) o RUC (11 dígitos)'
        ];
    }
}
