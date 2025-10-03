@extends('pdf.layouts.base')

@section('content')

{{-- Resumen Ejecutivo --}}
<div class="summary-box">
    <div class="summary-title">RESUMEN EJECUTIVO DE RENTABILIDAD</div>
    <div class="summary-grid">
        <div class="summary-row">
            <div class="summary-label">Total de Productos:</div>
            <div class="summary-value highlight">{{ $totals['total_products'] }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Unidades Vendidas:</div>
            <div class="summary-value">{{ $totals['total_units_sold'] }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Costo Total:</div>
            <div class="summary-value text-danger">S/ {{ number_format($totals['total_cost'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Ingresos Totales:</div>
            <div class="summary-value text-primary">S/ {{ number_format($totals['total_revenue'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Ganancia Total:</div>
            <div class="summary-value highlight text-success">S/ {{ number_format($totals['total_profit'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Margen Promedio:</div>
            <div class="summary-value text-bold {{ $totals['avg_margin'] >= 20 ? 'text-success' : ($totals['avg_margin'] >= 10 ? 'text-warning' : 'text-danger') }}">
                {{ number_format($totals['avg_margin'], 1) }}%
            </div>
        </div>
    </div>
</div>

{{-- Tabla de Rentabilidad --}}
<h2>Análisis de Rentabilidad por Producto</h2>

@if(count($profitability) > 0)
<table class="table-bordered table-compact">
    <thead>
        <tr>
            <th style="width: 8%;">Código</th>
            <th style="width: 18%;">Producto</th>
            <th style="width: 10%;">Categoría</th>
            <th class="text-center" style="width: 7%;">Unid.</th>
            <th class="text-right" style="width: 10%;">Precio Prom.</th>
            <th class="text-right" style="width: 10%;">Costo Prom.</th>
            <th class="text-right" style="width: 12%;">Ingresos</th>
            <th class="text-right" style="width: 12%;">Ganancia</th>
            <th class="text-center" style="width: 8%;">Margen</th>
            <th class="text-center" style="width: 5%;">Est.</th>
        </tr>
    </thead>
    <tbody>
        @foreach($profitability as $item)
        <tr>
            <td class="text-small">{{ $item['product']->code }}</td>
            <td class="text-bold text-small">{{ $item['product']->name }}</td>
            <td class="text-small">{{ $item['product']->category->name ?? '-' }}</td>
            <td class="text-center text-bold">{{ $item['units_sold'] }}</td>
            <td class="text-right currency text-small">S/ {{ number_format($item['avg_sale_price'], 2) }}</td>
            <td class="text-right currency text-danger text-small">S/ {{ number_format($item['avg_cost_price'], 2) }}</td>
            <td class="text-right currency text-primary text-bold text-small">S/ {{ number_format($item['total_revenue'], 2) }}</td>
            <td class="text-right currency text-success text-bold text-small">S/ {{ number_format($item['gross_profit'], 2) }}</td>
            <td class="text-center text-bold text-small {{ $item['profit_margin'] >= 30 ? 'text-success' : ($item['profit_margin'] >= 15 ? 'text-primary' : ($item['profit_margin'] >= 5 ? 'text-warning' : 'text-danger')) }}">
                {{ number_format($item['profit_margin'], 1) }}%
            </td>
            <td class="text-center">
                @if($item['profit_margin'] >= 30)
                    <span class="badge badge-success text-small">★★★</span>
                @elseif($item['profit_margin'] >= 15)
                    <span class="badge badge-info text-small">★★</span>
                @elseif($item['profit_margin'] >= 5)
                    <span class="badge badge-warning text-small">★</span>
                @else
                    <span class="badge badge-danger text-small">⚠</span>
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td colspan="3" class="text-right text-bold">TOTALES:</td>
            <td class="text-center text-bold">{{ $totals['total_units_sold'] }}</td>
            <td colspan="2"></td>
            <td class="text-right currency text-bold text-primary">S/ {{ number_format($totals['total_revenue'], 2) }}</td>
            <td class="text-right currency text-bold text-success">S/ {{ number_format($totals['total_profit'], 2) }}</td>
            <td class="text-center text-bold">{{ number_format($totals['avg_margin'], 1) }}%</td>
            <td></td>
        </tr>
    </tfoot>
</table>
@else
<div class="alert alert-info">
    <strong>No hay resultados:</strong> No se encontraron productos con los filtros aplicados.
</div>
@endif

{{-- Análisis Detallado --}}
@if(count($profitability) > 0)
<div class="page-break-before"></div>

<h2>Análisis de Rentabilidad</h2>

{{-- Top Productos --}}
<div class="grid-3 mb-15">
    <div class="col">
        <div class="info-box">
            <div class="info-box-header bg-success">Top 10 - Mayor Ganancia</div>
            <div class="info-box-content">
                @php
                    $topProfit = collect($profitability)->sortByDesc('gross_profit')->take(10);
                @endphp
                <table class="table-clean text-small">
                    <thead>
                        <tr>
                            <th class="text-left">Producto</th>
                            <th class="text-right">Ganancia</th>
                            <th class="text-center">Margen</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($topProfit as $item)
                        <tr>
                            <td class="text-small">{{ Str::limit($item['product']->name, 25) }}</td>
                            <td class="text-right text-success text-bold text-small">
                                S/ {{ number_format($item['gross_profit'], 2) }}
                            </td>
                            <td class="text-center text-small">{{ number_format($item['profit_margin'], 1) }}%</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="col">
        <div class="info-box">
            <div class="info-box-header bg-primary">Top 10 - Mejor Margen</div>
            <div class="info-box-content">
                @php
                    $topMargin = collect($profitability)->sortByDesc('profit_margin')->take(10);
                @endphp
                <table class="table-clean text-small">
                    <thead>
                        <tr>
                            <th class="text-left">Producto</th>
                            <th class="text-right">Margen</th>
                            <th class="text-right">Ganancia</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($topMargin as $item)
                        <tr>
                            <td class="text-small">{{ Str::limit($item['product']->name, 25) }}</td>
                            <td class="text-right text-primary text-bold text-small">{{ number_format($item['profit_margin'], 1) }}%</td>
                            <td class="text-right text-small">S/ {{ number_format($item['gross_profit'], 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="col">
        <div class="info-box">
            <div class="info-box-header bg-info">Top 10 - Más Vendidos</div>
            <div class="info-box-content">
                @php
                    $topUnits = collect($profitability)->sortByDesc('units_sold')->take(10);
                @endphp
                <table class="table-clean text-small">
                    <thead>
                        <tr>
                            <th class="text-left">Producto</th>
                            <th class="text-center">Unidades</th>
                            <th class="text-right">Ingresos</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($topUnits as $item)
                        <tr>
                            <td class="text-small">{{ Str::limit($item['product']->name, 25) }}</td>
                            <td class="text-center text-bold text-small">{{ $item['units_sold'] }}</td>
                            <td class="text-right text-primary text-small">S/ {{ number_format($item['total_revenue'], 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

{{-- Análisis por Categoría --}}
<h3>Rentabilidad por Categoría</h3>
<div class="info-box mb-15">
    <div class="info-box-content">
        @php
            $byCategory = collect($profitability)
                ->groupBy(function($item) {
                    return $item['product']->category->name ?? 'Sin Categoría';
                })
                ->map(function($items, $category) {
                    return [
                        'category' => $category,
                        'products' => $items->count(),
                        'units' => $items->sum('units_sold'),
                        'revenue' => $items->sum('total_revenue'),
                        'profit' => $items->sum('gross_profit'),
                        'margin' => $items->sum('total_revenue') > 0
                            ? ($items->sum('gross_profit') / $items->sum('total_revenue')) * 100
                            : 0,
                    ];
                })
                ->sortByDesc('profit');
        @endphp
        <table class="table-clean text-small">
            <thead>
                <tr>
                    <th class="text-left">Categoría</th>
                    <th class="text-center">Productos</th>
                    <th class="text-center">Unid. Vendidas</th>
                    <th class="text-right">Ingresos</th>
                    <th class="text-right">Ganancia</th>
                    <th class="text-center">Margen</th>
                </tr>
            </thead>
            <tbody>
                @foreach($byCategory as $cat)
                <tr>
                    <td class="text-bold text-small">{{ $cat['category'] }}</td>
                    <td class="text-center">{{ $cat['products'] }}</td>
                    <td class="text-center">{{ $cat['units'] }}</td>
                    <td class="text-right text-primary text-small">S/ {{ number_format($cat['revenue'], 2) }}</td>
                    <td class="text-right text-success text-bold text-small">S/ {{ number_format($cat['profit'], 2) }}</td>
                    <td class="text-center text-bold text-small {{ $cat['margin'] >= 20 ? 'text-success' : ($cat['margin'] >= 10 ? 'text-warning' : 'text-danger') }}">
                        {{ number_format($cat['margin'], 1) }}%
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>

{{-- Análisis de Rendimiento --}}
<div class="grid-2 mb-15">
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Distribución por Nivel de Margen</div>
            <div class="info-box-content">
                @php
                    $excellent = collect($profitability)->where('profit_margin', '>=', 30)->count();
                    $good = collect($profitability)->whereBetween('profit_margin', [15, 29.99])->count();
                    $regular = collect($profitability)->whereBetween('profit_margin', [5, 14.99])->count();
                    $poor = collect($profitability)->where('profit_margin', '<', 5)->count();
                @endphp
                <div class="info-row">
                    <span class="info-label">Excelente (≥30%):</span>
                    <span class="info-value text-success text-bold">{{ $excellent }} productos</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Bueno (15-29%):</span>
                    <span class="info-value text-primary">{{ $good }} productos</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Regular (5-14%):</span>
                    <span class="info-value text-warning">{{ $regular }} productos</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Bajo (<5%):</span>
                    <span class="info-value text-danger text-bold">{{ $poor }} productos</span>
                </div>
            </div>
        </div>
    </div>

    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Indicadores Clave</div>
            <div class="info-box-content">
                @php
                    $avgUnitProfit = $totals['total_units_sold'] > 0
                        ? $totals['total_profit'] / $totals['total_units_sold']
                        : 0;
                    $bestProduct = collect($profitability)->sortByDesc('gross_profit')->first();
                    $bestMarginProduct = collect($profitability)->sortByDesc('profit_margin')->first();
                @endphp
                <div class="info-row">
                    <span class="info-label">Ganancia por Unidad:</span>
                    <span class="info-value text-bold">S/ {{ number_format($avgUnitProfit, 2) }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Producto Estrella:</span>
                    <span class="info-value text-small">{{ $bestProduct ? Str::limit($bestProduct['product']->name, 30) : '-' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Mejor Margen:</span>
                    <span class="info-value text-small">{{ $bestMarginProduct ? Str::limit($bestMarginProduct['product']->name, 30) : '-' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">ROI Promedio:</span>
                    <span class="info-value text-success text-bold">
                        @php
                            $roi = $totals['total_cost'] > 0 ? ($totals['total_profit'] / $totals['total_cost']) * 100 : 0;
                        @endphp
                        {{ number_format($roi, 1) }}%
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- Productos con Margen Bajo --}}
@php
    $lowMarginProducts = collect($profitability)->where('profit_margin', '<', 10)->sortBy('profit_margin')->take(10);
@endphp
@if($lowMarginProducts->count() > 0)
<div class="alert alert-warning">
    <strong>⚠️ Atención - Productos con Margen Bajo:</strong>
    <div class="mt-5">
        <table class="table-clean text-small">
            <thead>
                <tr>
                    <th class="text-left">Producto</th>
                    <th class="text-center">Margen</th>
                    <th class="text-right">Ganancia</th>
                    <th class="text-center">Unidades</th>
                </tr>
            </thead>
            <tbody>
                @foreach($lowMarginProducts as $product)
                <tr>
                    <td class="text-small">{{ Str::limit($product['product']->name, 40) }}</td>
                    <td class="text-center text-danger text-bold text-small">{{ number_format($product['profit_margin'], 1) }}%</td>
                    <td class="text-right text-small">S/ {{ number_format($product['gross_profit'], 2) }}</td>
                    <td class="text-center text-small">{{ $product['units_sold'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
@endif

{{-- Recomendaciones --}}
<div class="alert alert-info no-page-break mt-15">
    <strong>💡 Recomendaciones Estratégicas:</strong>
    <ul class="text-small" style="margin-top: 5px; padding-left: 20px;">
        <li>Ganancia total generada: <strong>S/ {{ number_format($totals['total_profit'], 2) }}</strong> con un margen promedio de <strong>{{ number_format($totals['avg_margin'], 1) }}%</strong></li>
        @if($excellent > 0)
            <li>Potenciar los {{ $excellent }} producto(s) con margen excelente (≥30%) aumentando su promoción y disponibilidad</li>
        @endif
        @if($poor > 0)
            <li>Revisar estrategia de precios para {{ $poor }} producto(s) con margen bajo (<5%). Considerar ajustes o descontinuación</li>
        @endif
        @if($bestProduct)
            <li>Producto estrella: <strong>{{ $bestProduct['product']->name }}</strong> genera S/ {{ number_format($bestProduct['gross_profit'], 2) }} de ganancia</li>
        @endif
        @if($roi > 0)
            <li>ROI actual del {{ number_format($roi, 1) }}%. @if($roi >= 50) Excelente retorno de inversión @elseif($roi >= 30) Buen retorno de inversión @else Considerar estrategias para mejorar el retorno @endif</li>
        @endif
        @php
            $categoryWithBestMargin = $byCategory->sortByDesc('margin')->first();
        @endphp
        @if($categoryWithBestMargin)
            <li>Categoría más rentable: <strong>{{ $categoryWithBestMargin['category'] }}</strong> con {{ number_format($categoryWithBestMargin['margin'], 1) }}% de margen</li>
        @endif
        <li>Ganancia promedio por unidad vendida: S/ {{ number_format($avgUnitProfit, 2) }}</li>
    </ul>
</div>
@endif

@endsection

@section('extra-styles')
<style>
    .grid-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
    }

    .bg-success {
        background-color: #10b981 !important;
        color: white !important;
    }

    .bg-primary {
        background-color: #2563eb !important;
        color: white !important;
    }

    .bg-info {
        background-color: #0ea5e9 !important;
        color: white !important;
    }

    @media print {
        .grid-3 {
            page-break-inside: avoid;
        }
    }
</style>
@endsection
