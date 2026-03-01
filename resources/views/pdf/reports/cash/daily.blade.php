@extends('pdf.layouts.base')

@section('content')

{{-- Resumen Ejecutivo - Stat Cards --}}
<table class="stats-table">
    <tr>
        <td class="primary">
            <div class="stat-label">Total Sesiones</div>
            <div class="stat-value">{{ $totals['count'] }}</div>
        </td>
        <td class="info">
            <div class="stat-label">Saldo Inicial Total</div>
            <div class="stat-value">S/ {{ number_format($totals['total_opening_balance'], 2) }}</div>
        </td>
        <td class="success">
            <div class="stat-label">Saldo Real Total</div>
            <div class="stat-value">S/ {{ number_format($totals['total_actual_balance'], 2) }}</div>
        </td>
        <td class="{{ $totals['total_difference'] < 0 ? 'danger' : 'warning' }}">
            <div class="stat-label">Diferencia Total</div>
            <div class="stat-value {{ $totals['total_difference'] > 0 ? 'text-success' : ($totals['total_difference'] < 0 ? 'text-danger' : '') }}">
                S/ {{ number_format($totals['total_difference'], 2) }}
            </div>
        </td>
    </tr>
</table>

{{-- Tabla de Sesiones --}}
<h2>Detalle de Sesiones de Caja</h2>

@if(count($sessions) > 0)
<table class="table-bordered table-compact">
    <thead>
        <tr>
            <th style="width: 5%;">ID</th>
            <th style="width: 12%;">Apertura</th>
            <th style="width: 12%;">Cierre</th>
            <th style="width: 15%;">Caja / Sucursal</th>
            <th style="width: 12%;">Cajero</th>
            <th class="text-right" style="width: 10%;">Saldo Inicial</th>
            <th class="text-right" style="width: 10%;">Saldo Esperado</th>
            <th class="text-right" style="width: 10%;">Saldo Real</th>
            <th class="text-right" style="width: 10%;">Diferencia</th>
            <th class="text-center" style="width: 7%;">Estado</th>
        </tr>
    </thead>
    <tbody>
        @foreach($sessions as $session)
        <tr>
            <td class="text-center">{{ $session->id }}</td>
            <td>{{ \Carbon\Carbon::parse($session->opened_at)->format('d/m/Y H:i') }}</td>
            <td>
                @if($session->closed_at)
                    {{ \Carbon\Carbon::parse($session->closed_at)->format('d/m/Y H:i') }}
                @else
                    <span class="text-muted">-</span>
                @endif
            </td>
            <td>
                <strong>{{ $session->cashRegister->name }}</strong>
                @if($session->cashRegister->branch)
                    <br><span class="text-small text-muted">{{ $session->cashRegister->branch->name }}</span>
                @endif
            </td>
            <td>{{ $session->user->name }}</td>
            <td class="text-right currency">S/ {{ number_format($session->opening_balance, 2) }}</td>
            <td class="text-right currency">
                @if($session->expected_balance !== null)
                    S/ {{ number_format($session->expected_balance, 2) }}
                @else
                    <span class="text-muted">-</span>
                @endif
            </td>
            <td class="text-right currency">
                @if($session->actual_balance !== null)
                    S/ {{ number_format($session->actual_balance, 2) }}
                @else
                    <span class="text-muted">-</span>
                @endif
            </td>
            <td class="text-right currency">
                @if($session->difference !== null)
                    <span class="{{ $session->difference > 0 ? 'text-success' : ($session->difference < 0 ? 'text-danger' : '') }} text-bold">
                        S/ {{ number_format($session->difference, 2) }}
                    </span>
                @else
                    <span class="text-muted">-</span>
                @endif
            </td>
            <td class="text-center">
                @if($session->status === 'abierta')
                    <span class="badge badge-info">Abierta</span>
                @else
                    <span class="badge badge-success">Cerrada</span>
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td colspan="5" class="text-right text-bold">TOTALES:</td>
            <td class="text-right currency text-bold">S/ {{ number_format($totals['total_opening_balance'], 2) }}</td>
            <td class="text-right currency text-bold">S/ {{ number_format($totals['total_expected_balance'], 2) }}</td>
            <td class="text-right currency text-bold">S/ {{ number_format($totals['total_actual_balance'], 2) }}</td>
            <td class="text-right currency text-bold {{ $totals['total_difference'] > 0 ? 'text-success' : ($totals['total_difference'] < 0 ? 'text-danger' : '') }}">
                S/ {{ number_format($totals['total_difference'], 2) }}
            </td>
            <td></td>
        </tr>
    </tfoot>
</table>
@else
<div class="alert alert-info">
    <strong>No hay resultados:</strong> No se encontraron sesiones de caja con los filtros aplicados.
</div>
@endif

@endsection
