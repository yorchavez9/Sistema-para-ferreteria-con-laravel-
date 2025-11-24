<?php

namespace App\Exports;

use App\Models\Category;
use App\Models\Brand;
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
                '27.00',                                // Precio Menor
                '10',                                   // Stock Mín
                '100',                                  // Stock Máx
                'UND',                                  // Unidad Medida
                '18.00',                                // IGV %
                'No',                                   // Precio incluye IGV
                'Martillo de acero forjado de 16 oz',  // Descripción
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
            'Precio Menor',
            'Stock Mín',
            'Stock Máx',
            'Unidad Medida',
            'IGV %',
            'Precio incluye IGV',
            'Descripción',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Estilos para el encabezado
        $sheet->getStyle('A1:O1')->applyFromArray([
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
        $sheet->getColumnDimension('I')->setWidth(15); // Precio Menor
        $sheet->getColumnDimension('J')->setWidth(12); // Stock Mín
        $sheet->getColumnDimension('K')->setWidth(12); // Stock Máx
        $sheet->getColumnDimension('L')->setWidth(15); // Unidad Medida
        $sheet->getColumnDimension('M')->setWidth(12); // IGV %
        $sheet->getColumnDimension('N')->setWidth(20); // Precio incluye IGV
        $sheet->getColumnDimension('O')->setWidth(40); // Descripción

        // Altura de la fila de encabezado
        $sheet->getRowDimension(1)->setRowHeight(25);

        // Estilo para la fila de ejemplo
        $sheet->getStyle('A2:O2')->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E7E6E6'],
            ],
        ]);

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
