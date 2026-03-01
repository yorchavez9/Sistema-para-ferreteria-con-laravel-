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
            <div class="stat-label">Unidades Vendidas</div>
            <div class="stat-value">{{ $totals['total_units_sold'] }}</div>
        </td>
        <td class="primary">
            <div class="stat-label">Ingresos Totales</div>
            <div class="stat-value">S/ {{ number_format($totals['total_revenue'], 2) }}</div>
        </td>
    </tr>
    <tr>
        <td class="danger">
            <div class="stat-label">Costo Total</div>
            <div class="stat-value">S/ {{ number_format($totals['total_cost'], 2) }}</div>
        </td>
        <td class="success">
            <div class="stat-label">Ganancia Total</div>
            <div class="stat-value">S/ {{ number_format($totals['total_profit'], 2) }}</div>
        </td>
        <td class="{{ $totals['avg_margin'] >= 20 ? 'success' : ($totals['avg_margin'] >= 10 ? 'warning' : 'danger') }}">
            <div class="stat-label">Margen Promedio</div>
            <div class="stat-value">{{ number_format($totals['avg_margin'], 1) }}%</div>
        </td>
    </tr>
</table>

{{-- Tabla de Rentabilidad --}}
<h2>Rentabilidad por Producto</h2>

@if(count($profitability) > 0)
<table class="table-bordered table-compact">
    <thead>
        <tr>
            <th style="width: 8%;">Codigo</th>
            <th style="width: 20%;">Producto</th>
            <th style="width: 10%;">Categoria</th>
            <th class="text-center" style="width: 7%;">Unid.</th>
            <th class="text-right" style="width: 10%;">P. Venta</th>
            <th class="text-right" style="width: 10%;">P. Costo</th>
            <th class="text-right" style="width: 12%;">Ingresos</th>
            <th class="text-right" style="width: 12%;">Ganancia</th>
            <th class="text-center" style="width: 8%;">Margen</th>
        </tr>
    </thead>
    <tbody>
        @foreach($profitability as $item)
        <tr>
            <td class="text-small">{{ $item->code }}</td>
            <td class="text-bold text-small">{{ $item->product_name }}</td>
            <td class="text-small">{{ $item->category ?? '-' }}</td>
            <td class="text-center text-bold">{{ $item->units_sold }}</td>
            <td class="text-right currency text-small">S/ {{ number_format($item->avg_sale_price, 2) }}</td>
            <td class="text-right currency text-danger text-small">S/ {{ number_format($item->avg_cost_price, 2) }}</td>
            <td class="text-right currency text-primary text-bold text-small">S/ {{ number_format($item->total_sales, 2) }}</td>
            <td class="text-right currency text-success text-bold text-small">S/ {{ number_format($item->gross_profit, 2) }}</td>
            <td class="text-center text-bold text-small {{ $item->profit_margin >= 30 ? 'text-success' : ($item->profit_margin >= 15 ? 'text-primary' : ($item->profit_margin >= 5 ? 'text-warning' : 'text-danger')) }}">
                {{ number_format($item->profit_margin, 1) }}%
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
        </tr>
    </tfoot>
</table>
@else
<div class="alert alert-info">
    <strong>Sin resultados:</strong> No se encontraron productos con los filtros aplicados.
</div>
@endif

@endsection
