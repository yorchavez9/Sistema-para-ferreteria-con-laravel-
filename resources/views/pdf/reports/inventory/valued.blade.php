@extends('pdf.layouts.base')

@section('extra-styles')
<style>
    /* Estilos específicos para landscape */
    @page {
        margin: 15mm 10mm;
    }
</style>
@endsection

@section('content')

{{-- Resumen Ejecutivo --}}
<div class="summary-box">
    <div class="summary-title">RESUMEN EJECUTIVO</div>
    <div class="summary-grid">
        <div class="summary-row">
            <div class="summary-label">Total de Productos:</div>
            <div class="summary-value highlight">{{ $totals['total_products'] }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Valor Total en Costo:</div>
            <div class="summary-value">S/ {{ number_format($totals['total_cost_value'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Valor Total en Venta:</div>
            <div class="summary-value text-primary">S/ {{ number_format($totals['total_sale_value'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Ganancia Potencial:</div>
            <div class="summary-value highlight text-success">S/ {{ number_format($totals['potential_profit'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Productos Stock Bajo:</div>
            <div class="summary-value text-warning">{{ $totals['low_stock_count'] }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Productos Agotados:</div>
            <div class="summary-value text-danger">{{ $totals['out_stock_count'] }}</div>
        </div>
    </div>
</div>

{{-- Alertas --}}
@if($totals['low_stock_count'] > 0 || $totals['out_stock_count'] > 0)
<div class="alert alert-warning">
    <strong>⚠️ Atención:</strong> Hay {{ $totals['low_stock_count'] }} producto(s) con stock bajo
    y {{ $totals['out_stock_count'] }} producto(s) agotado(s). Se recomienda realizar pedidos pronto.
</div>
@endif

{{-- Tabla de Inventario --}}
<h2>Detalle de Inventario Valorizado</h2>

@if(count($inventory) > 0)
<table class="table-bordered table-compact">
    <thead>
        <tr>
            <th style="width: 6%;">Código</th>
            <th style="width: 14%;">Producto</th>
            <th style="width: 8%;">Categoría</th>
            <th style="width: 8%;">Marca</th>
            <th style="width: 8%;">Sucursal</th>
            <th class="text-center" style="width: 5%;">Stock</th>
            <th class="text-center" style="width: 6%;">Mín/Máx</th>
            <th class="text-right" style="width: 7%;">P. Costo</th>
            <th class="text-right" style="width: 7%;">P. Venta</th>
            <th class="text-right" style="width: 9%;">Val. Costo</th>
            <th class="text-right" style="width: 9%;">Val. Venta</th>
            <th class="text-center" style="width: 6%;">Margen</th>
            <th class="text-center" style="width: 7%;">Estado</th>
        </tr>
    </thead>
    <tbody>
        @foreach($inventory as $item)
        <tr>
            <td class="text-small">{{ $item['product']->code }}</td>
            <td class="text-bold text-small">{{ $item['product']->name }}</td>
            <td class="text-small">{{ $item['product']->category->name ?? '-' }}</td>
            <td class="text-small">{{ $item['product']->brand->name ?? '-' }}</td>
            <td class="text-small">{{ $item['branch']->name }}</td>
            <td class="text-center text-bold">
                <span class="{{ $item['stock_status'] === 'agotado' ? 'stock-out' : ($item['stock_status'] === 'bajo' ? 'stock-low' : 'stock-normal') }}">
                    {{ $item['current_stock'] }}
                </span>
            </td>
            <td class="text-center text-small text-muted">
                {{ $item['min_stock'] }} / {{ $item['max_stock'] }}
            </td>
            <td class="text-right currency text-small">S/ {{ number_format($item['cost_price'], 2) }}</td>
            <td class="text-right currency text-small">S/ {{ number_format($item['sale_price'], 2) }}</td>
            <td class="text-right currency text-bold text-small">S/ {{ number_format($item['total_cost_value'], 2) }}</td>
            <td class="text-right currency text-bold text-primary text-small">S/ {{ number_format($item['total_sale_value'], 2) }}</td>
            <td class="text-center text-success text-bold text-small">{{ number_format($item['profit_margin'], 1) }}%</td>
            <td class="text-center">
                @if($item['stock_status'] === 'normal')
                    <span class="badge badge-success text-small">Normal</span>
                @elseif($item['stock_status'] === 'bajo')
                    <span class="badge badge-warning text-small">Bajo</span>
                @else
                    <span class="badge badge-danger text-small">Agotado</span>
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td colspan="9" class="text-right text-bold">TOTALES:</td>
            <td class="text-right currency text-bold">S/ {{ number_format($totals['total_cost_value'], 2) }}</td>
            <td class="text-right currency text-bold text-primary">S/ {{ number_format($totals['total_sale_value'], 2) }}</td>
            <td colspan="2"></td>
        </tr>
        <tr>
            <td colspan="9" class="text-right text-bold">GANANCIA POTENCIAL:</td>
            <td colspan="2" class="text-right currency text-bold text-success">
                S/ {{ number_format($totals['potential_profit'], 2) }}
            </td>
            <td colspan="2" class="text-center text-bold text-success">
                {{ $totals['total_cost_value'] > 0 ? number_format(($totals['potential_profit'] / $totals['total_cost_value']) * 100, 1) : 0 }}%
            </td>
        </tr>
    </tfoot>
</table>
@else
<div class="alert alert-info">
    <strong>No hay resultados:</strong> No se encontraron productos con los filtros aplicados.
</div>
@endif

{{-- Análisis Adicional --}}
@if(count($inventory) > 0)
<div class="page-break-before"></div>

<h2>Análisis Detallado</h2>

<div class="grid-2 mb-15">
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Productos con Stock Bajo</div>
            <div class="info-box-content">
                @php
                    $lowStockItems = collect($inventory)->where('stock_status', 'bajo')->take(10);
                @endphp
                @if($lowStockItems->count() > 0)
                    <table class="table-clean text-small">
                        <thead>
                            <tr>
                                <th class="text-left">Producto</th>
                                <th class="text-center">Stock</th>
                                <th class="text-center">Mín.</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($lowStockItems as $item)
                            <tr>
                                <td class="text-small">{{ $item['product']->name }}</td>
                                <td class="text-center text-warning text-bold">{{ $item['current_stock'] }}</td>
                                <td class="text-center">{{ $item['min_stock'] }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                    @if(collect($inventory)->where('stock_status', 'bajo')->count() > 10)
                        <p class="text-small text-muted mt-10">
                            ... y {{ collect($inventory)->where('stock_status', 'bajo')->count() - 10 }} producto(s) más
                        </p>
                    @endif
                @else
                    <p class="text-small text-muted">✓ No hay productos con stock bajo</p>
                @endif
            </div>
        </div>
    </div>

    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Productos Agotados</div>
            <div class="info-box-content">
                @php
                    $outStockItems = collect($inventory)->where('stock_status', 'agotado')->take(10);
                @endphp
                @if($outStockItems->count() > 0)
                    <table class="table-clean text-small">
                        <thead>
                            <tr>
                                <th class="text-left">Producto</th>
                                <th class="text-center">Stock</th>
                                <th class="text-right">Valor Perdido</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($outStockItems as $item)
                            <tr>
                                <td class="text-small">{{ $item['product']->name }}</td>
                                <td class="text-center text-danger text-bold">{{ $item['current_stock'] }}</td>
                                <td class="text-right text-small">
                                    S/ {{ number_format($item['min_stock'] * $item['sale_price'], 2) }}
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                    @if(collect($inventory)->where('stock_status', 'agotado')->count() > 10)
                        <p class="text-small text-muted mt-10">
                            ... y {{ collect($inventory)->where('stock_status', 'agotado')->count() - 10 }} producto(s) más
                        </p>
                    @endif
                @else
                    <p class="text-small text-muted">✓ No hay productos agotados</p>
                @endif
            </div>
        </div>
    </div>
</div>

<div class="grid-2">
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Top 10 - Mayor Valor en Inventario</div>
            <div class="info-box-content">
                @php
                    $topValue = collect($inventory)->sortByDesc('total_sale_value')->take(10);
                @endphp
                <table class="table-clean text-small">
                    <thead>
                        <tr>
                            <th class="text-left">Producto</th>
                            <th class="text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($topValue as $item)
                        <tr>
                            <td class="text-small">{{ $item['product']->name }}</td>
                            <td class="text-right text-primary text-bold text-small">
                                S/ {{ number_format($item['total_sale_value'], 2) }}
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Top 10 - Mayor Margen de Ganancia</div>
            <div class="info-box-content">
                @php
                    $topMargin = collect($inventory)->sortByDesc('profit_margin')->take(10);
                @endphp
                <table class="table-clean text-small">
                    <thead>
                        <tr>
                            <th class="text-left">Producto</th>
                            <th class="text-right">Margen</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($topMargin as $item)
                        <tr>
                            <td class="text-small">{{ $item['product']->name }}</td>
                            <td class="text-right text-success text-bold text-small">
                                {{ number_format($item['profit_margin'], 1) }}%
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

{{-- Recomendaciones --}}
<div class="alert alert-info mt-15 no-page-break">
    <strong>💡 Recomendaciones:</strong>
    <ul class="text-small" style="margin-top: 5px; padding-left: 20px;">
        @if($totals['out_stock_count'] > 0)
            <li>Realizar pedidos urgentes para los {{ $totals['out_stock_count'] }} productos agotados</li>
        @endif
        @if($totals['low_stock_count'] > 0)
            <li>Programar reabastecimiento para los {{ $totals['low_stock_count'] }} productos con stock bajo</li>
        @endif
        @if(collect($inventory)->where('profit_margin', '<', 20)->count() > 0)
            <li>Revisar precios de {{ collect($inventory)->where('profit_margin', '<', 20)->count() }} productos con margen menor al 20%</li>
        @endif
        <li>Valor total del inventario: S/ {{ number_format($totals['total_sale_value'], 2) }}</li>
        <li>Ganancia potencial al vender todo el stock: S/ {{ number_format($totals['potential_profit'], 2) }}</li>
    </ul>
</div>
@endif

@endsection
