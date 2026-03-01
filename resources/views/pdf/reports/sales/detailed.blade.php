@extends('pdf.layouts.base')

@section('content')

{{-- Resumen Ejecutivo - Stat Cards --}}
<table class="stats-table">
    <tr>
        <td class="primary">
            <div class="stat-label">Total de Ventas</div>
            <div class="stat-value">{{ $totals['count'] }}</div>
        </td>
        <td class="success">
            <div class="stat-label">Total General</div>
            <div class="stat-value">S/ {{ number_format($totals['total'], 2) }}</div>
        </td>
        <td class="info">
            <div class="stat-label">Ticket Promedio</div>
            <div class="stat-value">S/ {{ number_format($totals['avg_ticket'], 2) }}</div>
        </td>
        <td class="danger">
            <div class="stat-label">Descuentos</div>
            <div class="stat-value">S/ {{ number_format($totals['discount'], 2) }}</div>
        </td>
    </tr>
</table>

{{-- Tabla de Ventas --}}
<h2>Detalle de Ventas</h2>

@if(count($sales) > 0)
<table class="table-bordered table-compact">
    <thead>
        <tr>
            <th style="width: 8%;">N° Venta</th>
            <th style="width: 8%;">Fecha</th>
            <th style="width: 15%;">Cliente</th>
            <th style="width: 10%;">Documento</th>
            <th style="width: 12%;">Vendedor</th>
            <th style="width: 10%;">Método</th>
            <th style="width: 7%;">Tipo</th>
            <th class="text-right" style="width: 10%;">Subtotal</th>
            <th class="text-right" style="width: 8%;">IGV</th>
            <th class="text-right" style="width: 10%;">Total</th>
            <th class="text-center" style="width: 7%;">Estado</th>
        </tr>
    </thead>
    <tbody>
        @foreach($sales as $sale)
        <tr>
            <td>{{ $sale->sale_number }}</td>
            <td>{{ \Carbon\Carbon::parse($sale->sale_date)->format('d/m/Y') }}</td>
            <td>{{ $sale->customer->name ?? 'Cliente General' }}</td>
            <td>{{ ucfirst(str_replace('_', ' ', $sale->document_type)) }}</td>
            <td>{{ $sale->user->name }}</td>
            <td>{{ ucfirst($sale->payment_method) }}</td>
            <td>{{ ucfirst($sale->payment_type) }}</td>
            <td class="text-right currency">S/ {{ number_format($sale->subtotal, 2) }}</td>
            <td class="text-right currency">S/ {{ number_format($sale->tax, 2) }}</td>
            <td class="text-right currency text-bold">S/ {{ number_format($sale->total, 2) }}</td>
            <td class="text-center">
                @if($sale->status === 'pagado')
                    <span class="badge badge-success">Pagado</span>
                @elseif($sale->status === 'pendiente')
                    <span class="badge badge-warning">Pendiente</span>
                @elseif($sale->status === 'anulado')
                    <span class="badge badge-danger">Anulado</span>
                @else
                    <span class="badge badge-secondary">{{ ucfirst($sale->status) }}</span>
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td colspan="7" class="text-right text-bold">TOTALES:</td>
            <td class="text-right currency text-bold">S/ {{ number_format($totals['subtotal'], 2) }}</td>
            <td class="text-right currency text-bold">S/ {{ number_format($totals['tax'], 2) }}</td>
            <td class="text-right currency text-bold">S/ {{ number_format($totals['total'], 2) }}</td>
            <td></td>
        </tr>
    </tfoot>
</table>
@else
<div class="alert alert-info">
    <strong>No hay resultados:</strong> No se encontraron ventas con los filtros aplicados.
</div>
@endif

@endsection
