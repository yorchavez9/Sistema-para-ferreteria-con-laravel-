@extends('pdf.layouts.base')

@section('content')

{{-- Resumen Ejecutivo --}}
<div class="summary-box">
    <div class="summary-title">RESUMEN EJECUTIVO</div>
    <div class="summary-grid">
        <div class="summary-row">
            <div class="summary-label">Total de Sesiones:</div>
            <div class="summary-value highlight">{{ $totals['count'] }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Saldo Inicial Total:</div>
            <div class="summary-value">S/ {{ number_format($totals['total_opening_balance'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Saldo Esperado Total:</div>
            <div class="summary-value">S/ {{ number_format($totals['total_expected_balance'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Saldo Real Total:</div>
            <div class="summary-value highlight text-success">S/ {{ number_format($totals['total_actual_balance'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Diferencia Total:</div>
            <div class="summary-value highlight {{ $totals['total_difference'] > 0 ? 'text-success' : ($totals['total_difference'] < 0 ? 'text-danger' : '') }}">
                S/ {{ number_format($totals['total_difference'], 2) }}
                @if($totals['total_difference'] > 0)
                    <span class="text-small">(Sobrante)</span>
                @elseif($totals['total_difference'] < 0)
                    <span class="text-small">(Faltante)</span>
                @endif
            </div>
        </div>
    </div>
</div>

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

{{-- Estadísticas Adicionales --}}
@if(count($sessions) > 0)
<div class="mt-20">
    <div class="grid-2">
        <div class="col">
            <div class="info-box">
                <div class="info-box-header">Estadísticas por Estado</div>
                <div class="info-box-content">
                    <div class="info-row">
                        <span class="info-label">Sesiones Abiertas:</span>
                        <span class="info-value">
                            {{ $sessions->where('status', 'abierta')->count() }}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Sesiones Cerradas:</span>
                        <span class="info-value">
                            {{ $sessions->where('status', 'cerrada')->count() }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="info-box">
                <div class="info-box-header">Análisis de Diferencias</div>
                <div class="info-box-content">
                    <div class="info-row">
                        <span class="info-label">Con Sobrante:</span>
                        <span class="info-value text-success">
                            {{ $sessions->where('difference', '>', 0)->count() }}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Con Faltante:</span>
                        <span class="info-value text-danger">
                            {{ $sessions->where('difference', '<', 0)->count() }}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Sin Diferencia:</span>
                        <span class="info-value">
                            {{ $sessions->where('difference', 0)->count() }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- Alertas si hay faltantes --}}
@php
    $sessionWithDeficit = $sessions->where('difference', '<', 0);
@endphp

@if($sessionWithDeficit->count() > 0)
<div class="alert alert-warning mt-15">
    <strong>⚠️ Atención:</strong> Se detectaron {{ $sessionWithDeficit->count() }} sesión(es) con faltante de dinero.
    Se recomienda revisar los movimientos y arqueos de estas sesiones.
</div>
@endif
@endif

@endsection
