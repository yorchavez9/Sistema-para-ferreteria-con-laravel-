<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class ProductsImport implements ToCollection, WithHeadingRow, SkipsEmptyRows
{
    use SkipsFailures;

    private $errors = [];
    private $imported = 0;
    private $skipped = 0;
    private $updated = 0;

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2; // +2 porque la primera fila es el header

            try {
                // Validar campos requeridos
                if (empty($row['nombre'])) {
                    $this->errors[] = "Fila {$rowNumber}: El nombre es requerido";
                    $this->skipped++;
                    continue;
                }

                if (empty($row['codigo'])) {
                    $this->errors[] = "Fila {$rowNumber}: El código es requerido";
                    $this->skipped++;
                    continue;
                }

                if (empty($row['categoria'])) {
                    $this->errors[] = "Fila {$rowNumber}: La categoría es requerida";
                    $this->skipped++;
                    continue;
                }

                if (!isset($row['precio_compra']) || $row['precio_compra'] === '') {
                    $this->errors[] = "Fila {$rowNumber}: El precio de compra es requerido";
                    $this->skipped++;
                    continue;
                }

                if (!isset($row['precio_venta']) || $row['precio_venta'] === '') {
                    $this->errors[] = "Fila {$rowNumber}: El precio de venta es requerido";
                    $this->skipped++;
                    continue;
                }

                // Buscar o crear categoría
                $category = Category::firstOrCreate(
                    ['name' => trim($row['categoria'])],
                    [
                        'code' => strtoupper(substr(trim($row['categoria']), 0, 3)),
                        'is_active' => true
                    ]
                );

                // Buscar o crear marca si se proporciona
                $brandId = null;
                if (!empty($row['marca'])) {
                    $brand = Brand::firstOrCreate(
                        ['name' => trim($row['marca'])],
                        [
                            'code' => strtoupper(substr(trim($row['marca']), 0, 3)),
                            'is_active' => true
                        ]
                    );
                    $brandId = $brand->id;
                }

                // Verificar si el producto ya existe
                $existingProduct = Product::where('code', $row['codigo'])->first();

                if ($existingProduct) {
                    // Actualizar producto existente
                    $existingProduct->update($this->prepareProductData($row, $category->id, $brandId));
                    $this->updated++;
                } else {
                    // Crear nuevo producto
                    Product::create($this->prepareProductData($row, $category->id, $brandId));
                    $this->imported++;
                }

            } catch (\Exception $e) {
                $this->errors[] = "Fila {$rowNumber}: " . $e->getMessage();
                $this->skipped++;
            }
        }
    }

    private function prepareProductData($row, $categoryId, $brandId)
    {
        // Procesar precio incluye IGV
        $priceIncludesIgv = false;
        if (isset($row['precio_incluye_igv'])) {
            $value = strtolower(trim($row['precio_incluye_igv']));
            $priceIncludesIgv = in_array($value, ['si', 'sí', 'yes', '1', 'true']);
        }

        return [
            'name' => trim($row['nombre']),
            'code' => trim($row['codigo']),
            'barcode' => !empty($row['codigo_de_barras']) ? trim($row['codigo_de_barras']) : null,
            'category_id' => $categoryId,
            'brand_id' => $brandId,
            'description' => !empty($row['descripcion']) ? trim($row['descripcion']) : null,
            'unit_of_measure' => !empty($row['unidad_medida']) ? trim($row['unidad_medida']) : 'UND',
            'purchase_price' => (float) $row['precio_compra'],
            'sale_price' => (float) $row['precio_venta'],
            'wholesale_price' => !empty($row['precio_mayor']) ? (float) $row['precio_mayor'] : null,
            'retail_price' => !empty($row['precio_menor']) ? (float) $row['precio_menor'] : null,
            'min_stock' => !empty($row['stock_min']) ? (int) $row['stock_min'] : 0,
            'max_stock' => !empty($row['stock_max']) ? (int) $row['stock_max'] : 0,
            'igv_percentage' => !empty($row['igv']) ? (float) $row['igv'] : 18.00,
            'price_includes_igv' => $priceIncludesIgv,
            'is_active' => true,
        ];
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function getImported()
    {
        return $this->imported;
    }

    public function getSkipped()
    {
        return $this->skipped;
    }

    public function getUpdated()
    {
        return $this->updated;
    }

    public function hasErrors()
    {
        return count($this->errors) > 0;
    }
}
