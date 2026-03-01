@extends('pdf.layouts.base')

@section('content')

{{-- Resumen Ejecutivo --}}
<table class="stats-table">
    <tr>
        <td class="primary">
            <div class="stat-label">Total Productos</div>
            <div class="stat-value">{{ $totals['total_products'] }}</div>
        </td>
        <td class="info">
            <div class="stat-label">Valor en Costo</div>
            <div class="stat-value">S/ {{ number_format($totals['total_cost_value'], 2) }}</div>
        </td>
        <td class="success">
            <div class="stat-label">Valor en Venta</div>
            <div class="stat-value">S/ {{ number_format($totals['total_sale_value'], 2) }}</div>
        </td>
    </tr>
    <tr>
        <td class="success">
            <div class="stat-label">Ganancia Potencial</div>
            <div class="stat-value">S/ {{ number_format($totals['potential_profit'], 2) }}</div>
        </td>
        <td class="warning">
            <div class="stat-label">Stock Bajo</div>
            <div class="stat-value">{{ $totals['low_stock_count'] }}</div>
        </td>
        <td class="danger">
            <div class="stat-label">Agotados</div>
            <div class="stat-value">{{ $totals['out_stock_count'] }}</div>
        </td>
    </tr>
</table>

@if($totals['out_stock_count'] > 0 || $totals['low_stock_count'] > 0)
<div class="alert {{ $totals['out_stock_count'] > 0 ? 'alert-danger' : 'alert-warning' }}">
    @if($totals['out_stock_count'] > 0)
        <strong>AGOTADOS:</strong> {{ $totals['out_stock_count'] }} producto(s) sin stock.
    @endif
    @if($totals['low_stock_count'] > 0)
        <strong>STOCK BAJO:</strong> {{ $totals['low_stock_count'] }} producto(s) por debajo del minimo.
    @endif
</div>
@endif

<h2>Detalle de Inventario Valorizado</h2>

@if(count($inventory) > 0)
<table class="table-bordered table-compact">
    <thead>
        <tr>
            <th style="width: 6%;">Codigo</th>
            <th style="width: 14%;">Producto</th>
            <th style="width: 8%;">Categoria</th>
            <th style="width: 8%;">Marca</th>
            <th style="width: 8%;">Sucursal</th>
            <th class="text-center" style="width: 5%;">Stock</th>
            <th class="text-center" style="width: 6%;">Min/Max</th>
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
            <td class="text-small">{{ $item->product->code }}</td>
            <td class="text-bold text-small">{{ $item->product->name }}</td>
            <td class="text-small">{{ $item->product->category->name ?? '-' }}</td>
            <td class="text-small">{{ $item->product->brand->name ?? '-' }}</td>
            <td class="text-small">{{ $item->branch->name }}</td>
            <td class="text-center text-bold">
                <span class="{{ $item->stock_status === 'agotado' ? 'stock-out' : ($item->stock_status === 'bajo' ? 'stock-low' : 'stock-normal') }}">
                    {{ $item->current_stock }}
                </span>
            </td>
            <td class="text-center text-small text-muted">
                {{ $item->min_stock }} / {{ $item->max_stock }}
            </td>
            <td class="text-right currency text-small">S/ {{ number_format($item->cost_price, 2) }}</td>
            <td class="text-right currency text-small">S/ {{ number_format($item->sale_price, 2) }}</td>
            <td class="text-right currency text-bold text-small">S/ {{ number_format($item->total_cost_value, 2) }}</td>
            <td class="text-right currency text-bold text-primary text-small">S/ {{ number_format($item->total_sale_value, 2) }}</td>
            <td class="text-center text-bold text-small {{ $item->profit_margin >= 30 ? 'text-success' : ($item->profit_margin >= 15 ? 'text-primary' : ($item->profit_margin >= 5 ? 'text-warning' : 'text-danger')) }}">
                {{ number_format($item->profit_margin, 1) }}%
            </td>
            <td class="text-center">
                @if($item->stock_status === 'normal')
                    <span class="badge badge-success text-small">Normal</span>
                @elseif($item->stock_status === 'bajo')
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
    <strong>Sin resultados:</strong> No se encontraron productos con los filtros aplicados.
</div>
@endif

@endsection
