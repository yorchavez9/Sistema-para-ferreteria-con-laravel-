@extends('pdf.layouts.base')

@section('content')

{{-- Resumen Ejecutivo - Stat Cards --}}
<table class="stats-table">
    <tr>
        <td class="primary">
            <div class="stat-label">Total Gastos</div>
            <div class="stat-value">{{ $totals['total_expenses'] }}</div>
        </td>
        <td class="danger">
            <div class="stat-label">Monto Total</div>
            <div class="stat-value">S/ {{ number_format($totals['total_amount'], 2) }}</div>
        </td>
        @if(isset($totals['avg_expense']))
        <td class="info">
            <div class="stat-label">Gasto Promedio</div>
            <div class="stat-value">S/ {{ number_format($totals['avg_expense'], 2) }}</div>
        </td>
        @endif
        @if(isset($totals['max_expense']))
        <td class="warning">
            <div class="stat-label">Mayor Gasto</div>
            <div class="stat-value">S/ {{ number_format($totals['max_expense'], 2) }}</div>
        </td>
        @endif
    </tr>
</table>

{{-- Tabla de Gastos --}}
<h2>Detalle de Gastos</h2>

@if(count($expenses) > 0)
<table class="table-bordered table-compact">
    <thead>
        <tr>
            <th style="width: 10%;">Fecha</th>
            <th style="width: 30%;">Descripcion</th>
            <th style="width: 15%;">Categoria</th>
            <th style="width: 12%;">Sucursal</th>
            <th style="width: 12%;">Usuario</th>
            <th class="text-right" style="width: 12%;">Monto</th>
            <th class="text-center" style="width: 9%;">Metodo Pago</th>
        </tr>
    </thead>
    <tbody>
        @foreach($expenses as $expense)
        <tr>
            <td class="text-small">{{ \Carbon\Carbon::parse($expense->expense_date)->format('d/m/Y') }}</td>
            <td class="text-small">{{ $expense->description }}</td>
            <td class="text-center">
                <span class="badge badge-secondary text-small">{{ $expense->category->name }}</span>
            </td>
            <td class="text-small">{{ $expense->branch->name }}</td>
            <td class="text-small">{{ $expense->user->name }}</td>
            <td class="text-right currency text-bold text-danger text-small">S/ {{ number_format($expense->amount, 2) }}</td>
            <td class="text-center text-small">{{ ucfirst($expense->payment_method ?? '-') }}</td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td colspan="5" class="text-right text-bold">TOTAL:</td>
            <td class="text-right currency text-bold text-danger">S/ {{ number_format($totals['total_amount'], 2) }}</td>
            <td></td>
        </tr>
    </tfoot>
</table>
@else
<div class="alert alert-info">
    <strong>No hay resultados:</strong> No se encontraron gastos con los filtros aplicados.
</div>
@endif

@endsection
