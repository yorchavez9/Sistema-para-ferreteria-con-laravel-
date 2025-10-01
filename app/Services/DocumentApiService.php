<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DocumentApiService
{
    protected $apiUrl;
    protected $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('services.decolecta.url');
        $this->apiToken = config('services.decolecta.token');
    }

    /**
     * Consultar DNI en RENIEC
     */
    public function consultarDNI(string $dni): ?array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiToken,
                'Content-Type' => 'application/json',
            ])->get("{$this->apiUrl}/reniec/dni", [
                'numero' => $dni
            ]);

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'success' => true,
                    'data' => [
                        'document_type' => 'DNI',
                        'document_number' => $data['document_number'] ?? $dni,
                        'name' => $data['full_name'] ?? ($data['first_name'] . ' ' . $data['first_last_name'] . ' ' . $data['second_last_name']),
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
                'message' => 'No se pudo consultar el DNI'
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
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiToken,
                'Content-Type' => 'application/json',
            ])->get("{$this->apiUrl}/sunat/ruc", [
                'numero' => $ruc
            ]);

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'success' => true,
                    'data' => [
                        'document_type' => 'RUC',
                        'document_number' => $data['ruc'] ?? $ruc,
                        'name' => $data['razon_social'] ?? $data['nombre_comercial'] ?? null,
                        'razon_social' => $data['razon_social'] ?? null,
                        'nombre_comercial' => $data['nombre_comercial'] ?? null,
                        'direccion' => $data['direccion'] ?? null,
                        'estado' => $data['estado'] ?? null,
                        'condicion' => $data['condicion'] ?? null,
                    ]
                ];
            }

            Log::warning('API RUC Error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [
                'success' => false,
                'message' => 'No se pudo consultar el RUC'
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
