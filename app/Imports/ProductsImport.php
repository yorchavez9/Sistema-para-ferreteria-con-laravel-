<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Branch;
use App\Models\Inventory;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ProductsImport implements WithMultipleSheets
{
    private $productSheet;

    public function __construct()
    {
        $this->productSheet = new ProductsSheetImport();
    }

    public function sheets(): array
    {
        return [
            0 => $this->productSheet, // Solo procesar la primera hoja (Productos)
        ];
    }

    public function getErrors()
    {
        return $this->productSheet->getErrors();
    }

    public function getImported()
    {
        return $this->productSheet->getImported();
    }

    public function getSkipped()
    {
        return $this->productSheet->getSkipped();
    }

    public function getUpdated()
    {
        return $this->productSheet->getUpdated();
    }

    public function hasErrors()
    {
        return $this->productSheet->hasErrors();
    }
}

class ProductsSheetImport implements ToCollection, WithHeadingRow, SkipsEmptyRows
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
                // Verificar si la fila está completamente vacía
                $isEmpty = true;
                foreach ($row as $value) {
                    if ($value !== null && $value !== '') {
                        $isEmpty = false;
                        break;
                    }
                }

                if ($isEmpty) {
                    continue; // Saltar filas vacías
                }

                // Obtener valores de manera flexible
                $nombre = $this->getValue($row, ['nombre', 0]);

                // Saltar la fila si es la nota informativa
                if (!empty($nombre) && (str_starts_with(strtoupper($nombre), 'NOTA:') || str_starts_with($nombre, 'NOTA'))) {
                    continue;
                }
                $codigo = $this->getValue($row, ['codigo', 'code', 1]);
                $codigoBarras = $this->getValue($row, ['codigo_de_barras', 'codigo_barras', 'barcode', 2]);
                $categoria = $this->getValue($row, ['categoria', 'category', 3]);
                $marca = $this->getValue($row, ['marca', 'brand', 4]);
                $precioCompra = $this->getValue($row, ['precio_compra', 'precio_de_compra', 5]);
                $precioVenta = $this->getValue($row, ['precio_venta', 'precio_de_venta', 6]);
                $precioMayor = $this->getValue($row, ['precio_mayor', 'precio_al_por_mayor', 7]);
                $stockMin = $this->getValue($row, ['stock_min', 'stock_minimo', 'minimo', 8]);
                $stockMax = $this->getValue($row, ['stock_max', 'stock_maximo', 'maximo', 9]);
                $unidadMedida = $this->getValue($row, ['unidad_medida', 'unidad', 'unit', 10]);
                $igv = $this->getValue($row, ['igv', 'igv_porcentaje', 11]);
                $precioIncluyeIgv = $this->getValue($row, ['precio_incluye_igv', 'incluye_igv', 12]);
                $descripcion = $this->getValue($row, ['descripcion', 'description', 13]);
                $stockInicial = $this->getValue($row, ['stock_inicial', 'stock', 14]);
                $sucursal = $this->getValue($row, ['sucursal', 'branch', 'almacen', 15]);

                // Validar campos requeridos
                if (empty($nombre)) {
                    // Mostrar las claves disponibles para debugging
                    $availableKeys = implode(', ', array_keys($row->toArray()));
                    $this->errors[] = "Fila {$rowNumber}: El nombre es requerido. Columnas disponibles: [{$availableKeys}]";
                    $this->skipped++;
                    continue;
                }

                if (empty($codigo)) {
                    $this->errors[] = "Fila {$rowNumber}: El código es requerido";
                    $this->skipped++;
                    continue;
                }

                if (empty($categoria)) {
                    $this->errors[] = "Fila {$rowNumber}: La categoría es requerida";
                    $this->skipped++;
                    continue;
                }

                if ($precioCompra === null || $precioCompra === '') {
                    $this->errors[] = "Fila {$rowNumber}: El precio de compra es requerido";
                    $this->skipped++;
                    continue;
                }

                if ($precioVenta === null || $precioVenta === '') {
                    $this->errors[] = "Fila {$rowNumber}: El precio de venta es requerido";
                    $this->skipped++;
                    continue;
                }

                // Buscar o crear categoría
                $category = Category::firstOrCreate(
                    ['name' => trim($categoria)],
                    [
                        'code' => strtoupper(substr(trim($categoria), 0, 3)),
                        'is_active' => true
                    ]
                );

                // Buscar o crear marca si se proporciona
                $brandId = null;
                if (!empty($marca)) {
                    $brand = Brand::firstOrCreate(
                        ['name' => trim($marca)],
                        [
                            'code' => strtoupper(substr(trim($marca), 0, 3)),
                            'is_active' => true
                        ]
                    );
                    $brandId = $brand->id;
                }

                // Verificar si el producto ya existe por código
                $existingProduct = Product::where('code', $codigo)->first();

                // Si no existe por código pero el barcode está duplicado, buscar por barcode
                if (!$existingProduct && !empty($codigoBarras)) {
                    $existingByBarcode = Product::where('barcode', $codigoBarras)->first();
                    if ($existingByBarcode) {
                        $this->errors[] = "Fila {$rowNumber}: El código de barras '{$codigoBarras}' ya existe en el producto '{$existingByBarcode->name}' (código: {$existingByBarcode->code})";
                        $this->skipped++;
                        continue;
                    }
                }

                // Preparar datos del producto
                $productData = $this->prepareProductData(
                    $nombre,
                    $codigo,
                    $codigoBarras,
                    $category->id,
                    $brandId,
                    $descripcion,
                    $unidadMedida,
                    $precioCompra,
                    $precioVenta,
                    $precioMayor,
                    $stockMin,
                    $stockMax,
                    $igv,
                    $precioIncluyeIgv
                );

                if ($existingProduct) {
                    // Actualizar producto existente
                    $existingProduct->update($productData);
                    $product = $existingProduct;
                    $this->updated++;
                } else {
                    // Crear nuevo producto
                    $product = Product::create($productData);
                    $this->imported++;
                }

                // Crear o actualizar inventario si se proporcionó stock y sucursal
                if (!empty($stockInicial) && !empty($sucursal)) {
                    // Buscar la sucursal por nombre
                    $branch = Branch::where('name', 'like', '%' . trim($sucursal) . '%')->first();

                    if ($branch) {
                        // Verificar si ya existe un inventario para este producto en esta sucursal
                        $inventory = Inventory::where('product_id', $product->id)
                            ->where('branch_id', $branch->id)
                            ->first();

                        if ($inventory) {
                            // Actualizar stock existente
                            $inventory->update([
                                'current_stock' => (int) $stockInicial,
                            ]);
                        } else {
                            // Crear nuevo inventario
                            Inventory::create([
                                'product_id' => $product->id,
                                'branch_id' => $branch->id,
                                'current_stock' => (int) $stockInicial,
                                'reserved_stock' => 0,
                                'available_stock' => (int) $stockInicial,
                            ]);
                        }
                    } else {
                        $this->errors[] = "Fila {$rowNumber}: La sucursal '{$sucursal}' no existe. Stock no agregado.";
                    }
                }

            } catch (\Exception $e) {
                $this->errors[] = "Fila {$rowNumber}: " . $e->getMessage();
                $this->skipped++;
            }
        }
    }

    /**
     * Obtiene un valor de la fila probando múltiples claves posibles
     */
    private function getValue($row, array $possibleKeys)
    {
        foreach ($possibleKeys as $key) {
            if (isset($row[$key]) && $row[$key] !== null && $row[$key] !== '') {
                return $row[$key];
            }
        }
        return null;
    }

    private function prepareProductData(
        $nombre,
        $codigo,
        $codigoBarras,
        $categoryId,
        $brandId,
        $descripcion,
        $unidadMedida,
        $precioCompra,
        $precioVenta,
        $precioMayor,
        $stockMin,
        $stockMax,
        $igv,
        $precioIncluyeIgv
    ) {
        // Procesar precio incluye IGV
        $priceIncludesIgv = false;
        if ($precioIncluyeIgv !== null) {
            $value = strtolower(trim($precioIncluyeIgv));
            $priceIncludesIgv = in_array($value, ['si', 'sí', 'yes', '1', 'true']);
        }

        return [
            'name' => trim($nombre),
            'code' => trim($codigo),
            'barcode' => !empty($codigoBarras) ? trim($codigoBarras) : null,
            'category_id' => $categoryId,
            'brand_id' => $brandId,
            'description' => !empty($descripcion) ? trim($descripcion) : null,
            'unit_of_measure' => !empty($unidadMedida) ? trim($unidadMedida) : 'UND',
            'purchase_price' => (float) $precioCompra,
            'sale_price' => (float) $precioVenta,
            'wholesale_price' => !empty($precioMayor) ? (float) $precioMayor : 0,
            'min_stock' => !empty($stockMin) ? (int) $stockMin : 0,
            'max_stock' => !empty($stockMax) ? (int) $stockMax : 0,
            'igv_percentage' => !empty($igv) ? (float) $igv : 18.00,
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
