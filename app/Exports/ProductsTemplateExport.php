<?php

namespace App\Exports;

use App\Models\Category;
use App\Models\Brand;
use App\Models\Branch;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class ProductsTemplateExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            new ProductsTemplateSheet(),
            new CategoriesSheet(),
            new BrandsSheet(),
            new BranchesSheet(),
        ];
    }
}

class ProductsTemplateSheet implements FromArray, WithHeadings, WithStyles, WithTitle
{
    public function array(): array
    {
        // Retornar una fila de ejemplo
        return [
            [
                'Martillo de Acero',                    // Nombre
                'MART-001',                             // Código
                '7501234567890',                        // Código de Barras
                'Herramientas',                         // Categoría
                'Stanley',                              // Marca
                '15.50',                                // Precio Compra
                '25.00',                                // Precio Venta
                '22.00',                                // Precio Mayor
                '10',                                   // Stock Mín
                '100',                                  // Stock Máx
                'UND',                                  // Unidad Medida
                '18',                                   // IGV %
                'No',                                   // Precio incluye IGV
                'Martillo de acero forjado de 16 oz',  // Descripción
                '50',                                   // Stock Inicial (opcional)
                'Principal',                            // Sucursal (opcional)
            ],
        ];
    }

    public function headings(): array
    {
        return [
            'Nombre',
            'Código',
            'Código de Barras',
            'Categoría',
            'Marca',
            'Precio Compra',
            'Precio Venta',
            'Precio Mayor',
            'Stock Mín',
            'Stock Máx',
            'Unidad Medida',
            'IGV %',
            'Precio incluye IGV',
            'Descripción',
            'Stock Inicial',
            'Sucursal',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Estilos para el encabezado
        $sheet->getStyle('A1:P1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4472C4'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Ajustar ancho de columnas
        $sheet->getColumnDimension('A')->setWidth(30); // Nombre
        $sheet->getColumnDimension('B')->setWidth(15); // Código
        $sheet->getColumnDimension('C')->setWidth(20); // Código de Barras
        $sheet->getColumnDimension('D')->setWidth(20); // Categoría
        $sheet->getColumnDimension('E')->setWidth(20); // Marca
        $sheet->getColumnDimension('F')->setWidth(15); // Precio Compra
        $sheet->getColumnDimension('G')->setWidth(15); // Precio Venta
        $sheet->getColumnDimension('H')->setWidth(15); // Precio Mayor
        $sheet->getColumnDimension('I')->setWidth(12); // Stock Mín
        $sheet->getColumnDimension('J')->setWidth(12); // Stock Máx
        $sheet->getColumnDimension('K')->setWidth(15); // Unidad Medida
        $sheet->getColumnDimension('L')->setWidth(12); // IGV %
        $sheet->getColumnDimension('M')->setWidth(20); // Precio incluye IGV
        $sheet->getColumnDimension('N')->setWidth(40); // Descripción
        $sheet->getColumnDimension('O')->setWidth(15); // Stock Inicial
        $sheet->getColumnDimension('P')->setWidth(20); // Sucursal

        // Altura de la fila de encabezado
        $sheet->getRowDimension(1)->setRowHeight(25);

        // Estilo para la fila de ejemplo
        $sheet->getStyle('A2:P2')->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E7E6E6'],
            ],
        ]);

        // Agregar nota informativa en la fila 3
        $sheet->setCellValue('A3', 'NOTA: Los campos "Stock Inicial" y "Sucursal" son OPCIONALES. Si los llenas, se creará el inventario automáticamente. Borra la fila de ejemplo antes de importar. Consulta las hojas "Categorías", "Marcas" y "Sucursales" para ver los valores disponibles.');
        $sheet->mergeCells('A3:P3');
        $sheet->getStyle('A3')->applyFromArray([
            'font' => [
                'italic' => true,
                'color' => ['rgb' => '0066CC'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E3F2FD'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_LEFT,
                'wrapText' => true,
            ],
        ]);
        $sheet->getRowDimension(3)->setRowHeight(40);

        return [];
    }

    public function title(): string
    {
        return 'Productos';
    }
}

class CategoriesSheet implements FromArray, WithHeadings, WithStyles, WithTitle
{
    public function array(): array
    {
        $categories = Category::active()->orderBy('name')->get(['name', 'description']);

        return $categories->map(function ($category) {
            return [
                $category->name,
                $category->description ?? '-',
            ];
        })->toArray();
    }

    public function headings(): array
    {
        return ['Categoría', 'Descripción'];
    }

    public function styles(Worksheet $sheet)
    {
        // Estilos para el encabezado
        $sheet->getStyle('A1:B1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '70AD47'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Ajustar ancho de columnas
        $sheet->getColumnDimension('A')->setWidth(30);
        $sheet->getColumnDimension('B')->setWidth(50);

        // Altura de la fila de encabezado
        $sheet->getRowDimension(1)->setRowHeight(25);

        return [];
    }

    public function title(): string
    {
        return 'Categorías';
    }
}

class BrandsSheet implements FromArray, WithHeadings, WithStyles, WithTitle
{
    public function array(): array
    {
        $brands = Brand::active()->orderBy('name')->get(['name', 'description']);

        return $brands->map(function ($brand) {
            return [
                $brand->name,
                $brand->description ?? '-',
            ];
        })->toArray();
    }

    public function headings(): array
    {
        return ['Marca', 'Descripción'];
    }

    public function styles(Worksheet $sheet)
    {
        // Estilos para el encabezado
        $sheet->getStyle('A1:B1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'FFC000'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Ajustar ancho de columnas
        $sheet->getColumnDimension('A')->setWidth(30);
        $sheet->getColumnDimension('B')->setWidth(50);

        // Altura de la fila de encabezado
        $sheet->getRowDimension(1)->setRowHeight(25);

        return [];
    }

    public function title(): string
    {
        return 'Marcas';
    }
}

class BranchesSheet implements FromArray, WithHeadings, WithStyles, WithTitle
{
    public function array(): array
    {
        $branches = Branch::active()->orderBy('name')->get(['name', 'address']);

        return $branches->map(function ($branch) {
            return [
                $branch->name,
                $branch->address ?? '-',
            ];
        })->toArray();
    }

    public function headings(): array
    {
        return ['Sucursal', 'Dirección'];
    }

    public function styles(Worksheet $sheet)
    {
        // Estilos para el encabezado
        $sheet->getStyle('A1:B1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '9B59B6'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Ajustar ancho de columnas
        $sheet->getColumnDimension('A')->setWidth(30);
        $sheet->getColumnDimension('B')->setWidth(50);

        // Altura de la fila de encabezado
        $sheet->getRowDimension(1)->setRowHeight(25);

        return [];
    }

    public function title(): string
    {
        return 'Sucursales';
    }
}
