@extends('pdf.layouts.base')

@section('content')

{{-- Resumen Ejecutivo - Stat Cards --}}
<table class="stats-table">
    <tr>
        <td class="primary">
            <div class="stat-label">Total Compras</div>
            <div class="stat-value">{{ $totals['total_purchases'] }}</div>
        </td>
        <td class="success">
            <div class="stat-label">Total General</div>
            <div class="stat-value">S/ {{ number_format($totals['total_amount'], 2) }}</div>
        </td>
        <td class="warning">
            <div class="stat-label">Pendientes</div>
            <div class="stat-value">{{ $totals['pending_count'] }}</div>
        </td>
        <td class="info">
            <div class="stat-label">Recibidas</div>
            <div class="stat-value">{{ $totals['received_count'] }}</div>
        </td>
    </tr>
</table>

{{-- Alertas --}}
@if($totals['pending_count'] > 0)
<div class="alert alert-warning">
    <strong>Atencion:</strong> Hay {{ $totals['pending_count'] }} orden(es) de compra pendiente(s) de recepcion.
    @if($totals['partial_count'] > 0)
        Ademas, {{ $totals['partial_count'] }} orden(es) con recepcion parcial.
    @endif
</div>
@endif

{{-- Tabla de Compras --}}
<h2>Detalle de Ordenes de Compra</h2>

@if(count($purchases) > 0)
<table class="table-bordered table-compact">
    <thead>
        <tr>
            <th style="width: 10%;">N° Orden</th>
            <th style="width: 10%;">Fecha</th>
            <th style="width: 18%;">Proveedor</th>
            <th style="width: 12%;">Sucursal</th>
            <th class="text-center" style="width: 6%;">Items</th>
            <th class="text-right" style="width: 10%;">Subtotal</th>
            <th class="text-right" style="width: 8%;">IGV</th>
            <th class="text-right" style="width: 10%;">Total</th>
            <th class="text-center" style="width: 8%;">Pago</th>
            <th class="text-center" style="width: 8%;">Estado</th>
        </tr>
    </thead>
    <tbody>
        @foreach($purchases as $item)
        <tr>
            <td class="text-bold text-small">{{ $item['purchase']->order_number }}</td>
            <td class="text-small">{{ \Carbon\Carbon::parse($item['purchase']->order_date)->format('d/m/Y') }}</td>
            <td class="text-small">{{ $item['purchase']->supplier->name }}</td>
            <td class="text-small">{{ $item['purchase']->branch->name }}</td>
            <td class="text-center text-bold">
                {{ $item['total_items'] }}
                @if($item['purchase']->status === 'parcial')
                    <br><span class="text-small text-muted">({{ $item['received_items'] }} rec.)</span>
                @endif
            </td>
            <td class="text-right currency text-small">S/ {{ number_format($item['purchase']->subtotal, 2) }}</td>
            <td class="text-right currency text-small">S/ {{ number_format($item['purchase']->tax, 2) }}</td>
            <td class="text-right currency text-bold text-small">S/ {{ number_format($item['purchase']->total, 2) }}</td>
            <td class="text-center text-small">{{ ucfirst($item['purchase']->payment_method ?? '-') }}</td>
            <td class="text-center">
                @if($item['purchase']->status === 'pendiente')
                    <span class="badge badge-warning text-small">Pendiente</span>
                @elseif($item['purchase']->status === 'parcial')
                    <span class="badge badge-info text-small">Parcial</span>
                @elseif($item['purchase']->status === 'recibido')
                    <span class="badge badge-success text-small">Recibido</span>
                @else
                    <span class="badge badge-danger text-small">Cancelado</span>
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td colspan="5" class="text-right text-bold">TOTALES:</td>
            <td class="text-right currency text-bold">S/ {{ number_format($totals['total_subtotal'], 2) }}</td>
            <td class="text-right currency text-bold">S/ {{ number_format($totals['total_tax'], 2) }}</td>
            <td class="text-right currency text-bold text-primary">S/ {{ number_format($totals['total_amount'], 2) }}</td>
            <td colspan="2"></td>
        </tr>
    </tfoot>
</table>
@else
<div class="alert alert-info">
    <strong>No hay resultados:</strong> No se encontraron ordenes de compra con los filtros aplicados.
</div>
@endif

@endsection
