@extends('pdf.layouts.base')

@section('content')

{{-- Resumen Ejecutivo --}}
<table class="stats-table">
    <tr>
        <td class="primary">
            <div class="stat-label">Ventas a Credito</div>
            <div class="stat-value">{{ $totals['total_sales'] }}</div>
        </td>
        <td class="info">
            <div class="stat-label">Monto Total</div>
            <div class="stat-value">S/ {{ number_format($totals['total_amount'], 2) }}</div>
        </td>
        <td class="success">
            <div class="stat-label">Total Cobrado</div>
            <div class="stat-value">S/ {{ number_format($totals['total_paid'], 2) }}</div>
        </td>
        <td class="warning">
            <div class="stat-label">Total Pendiente</div>
            <div class="stat-value">S/ {{ number_format($totals['total_pending'], 2) }}</div>
        </td>
    </tr>
</table>

@if($totals['total_overdue'] > 0)
<div class="alert alert-danger">
    <strong>MOROSIDAD:</strong> S/ {{ number_format($totals['total_overdue'], 2) }} en cuentas vencidas.
</div>
@endif

{{-- Tabla de Cuentas por Cobrar --}}
<h2>Detalle de Cuentas por Cobrar</h2>

@if(count($receivables) > 0)
<table class="table-bordered table-compact">
    <thead>
        <tr>
            <th style="width: 9%;">N° Venta</th>
            <th style="width: 9%;">Fecha</th>
            <th style="width: 16%;">Cliente</th>
            <th style="width: 10%;">Sucursal</th>
            <th class="text-right" style="width: 10%;">Total</th>
            <th class="text-right" style="width: 10%;">Pagado</th>
            <th class="text-right" style="width: 10%;">Saldo</th>
            <th class="text-center" style="width: 8%;">Cuotas</th>
            <th class="text-center" style="width: 8%;">Atraso</th>
            <th class="text-center" style="width: 10%;">Estado</th>
        </tr>
    </thead>
    <tbody>
        @foreach($receivables as $item)
        <tr>
            <td class="text-small">{{ $item['sale']->sale_number }}</td>
            <td class="text-small">{{ \Carbon\Carbon::parse($item['sale']->sale_date)->format('d/m/Y') }}</td>
            <td class="text-small">{{ $item['sale']->customer->name ?? 'Cliente General' }}</td>
            <td class="text-small">{{ $item['sale']->branch->name ?? 'N/A' }}</td>
            <td class="text-right currency text-small">S/ {{ number_format($item['sale']->total, 2) }}</td>
            <td class="text-right currency text-small">S/ {{ number_format($item['initial_payment'], 2) }}</td>
            <td class="text-right currency text-bold text-warning text-small">S/ {{ number_format($item['remaining_balance'], 2) }}</td>
            <td class="text-center text-small text-bold {{ $item['paid_installments'] == $item['total_installments'] ? 'text-success' : 'text-warning' }}">
                {{ $item['paid_installments'] }}/{{ $item['total_installments'] }}
            </td>
            <td class="text-center">
                @if($item['days_overdue'] > 0)
                    <span class="badge {{ $item['days_overdue'] > 30 ? 'badge-danger' : 'badge-warning' }}">{{ $item['days_overdue'] }}d</span>
                @else
                    <span class="text-muted text-small">-</span>
                @endif
            </td>
            <td class="text-center">
                @if($item['remaining_balance'] <= 0)
                    <span class="badge badge-success">Pagado</span>
                @elseif($item['days_overdue'] > 0)
                    <span class="badge badge-danger">Vencido</span>
                @else
                    <span class="badge badge-primary">Al dia</span>
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td colspan="4" class="text-right text-bold">TOTALES:</td>
            <td class="text-right currency text-bold">S/ {{ number_format($totals['total_amount'], 2) }}</td>
            <td class="text-right currency text-bold">S/ {{ number_format($totals['initial_payment_total'], 2) }}</td>
            <td class="text-right currency text-bold text-warning">S/ {{ number_format($totals['total_pending'], 2) }}</td>
            <td colspan="3"></td>
        </tr>
    </tfoot>
</table>
@else
<div class="alert alert-info">
    <strong>Sin resultados:</strong> No se encontraron cuentas por cobrar con los filtros aplicados.
</div>
@endif

@endsection
