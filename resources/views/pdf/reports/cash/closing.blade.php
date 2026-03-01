@extends('pdf.layouts.base')

@section('content')

@php
    $totalIngresos = $session->movements->whereIn('type', ['ingreso', 'venta', 'pago_credito', 'transferencia_entrada'])->where('payment_method', 'efectivo')->sum('amount');
    $totalEgresos = $session->movements->whereIn('type', ['egreso', 'compra', 'gasto', 'transferencia_salida'])->where('payment_method', 'efectivo')->sum('amount');
    $expectedBalance = $session->expected_balance ?? $session->calculateExpectedBalance();
@endphp

{{-- Info de Sesion + Resumen en 2 columnas --}}
<table class="two-col">
    <tr>
        <td>
            <div class="summary-box">
                <div class="summary-title">Sesion #{{ $session->id }}</div>
                <table class="summary-table">
                    <tr><td>Caja:</td><td>{{ $session->cashRegister->name }}</td></tr>
                    <tr><td>Sucursal:</td><td>{{ $session->cashRegister->branch->name ?? 'N/A' }}</td></tr>
                    <tr><td>Cajero:</td><td class="text-bold">{{ $session->user->name }}</td></tr>
                    <tr><td>Apertura:</td><td>{{ \Carbon\Carbon::parse($session->opened_at)->format('d/m/Y H:i') }}</td></tr>
                    <tr>
                        <td>Cierre:</td>
                        <td>
                            @if($session->closed_at)
                                {{ \Carbon\Carbon::parse($session->closed_at)->format('d/m/Y H:i') }}
                            @else
                                <span class="badge badge-warning">Abierta</span>
                            @endif
                        </td>
                    </tr>
                    @if($session->closed_at)
                    <tr>
                        <td>Duracion:</td>
                        <td>
                            @php $duration = \Carbon\Carbon::parse($session->opened_at)->diff(\Carbon\Carbon::parse($session->closed_at)); @endphp
                            {{ $duration->h }}h {{ $duration->i }}m
                        </td>
                    </tr>
                    @endif
                </table>
            </div>
        </td>
        <td>
            <div class="summary-box">
                <div class="summary-title">Resumen de Caja</div>
                <table class="summary-table">
                    <tr><td>Saldo Inicial:</td><td class="currency">S/ {{ number_format($session->opening_balance, 2) }}</td></tr>
                    <tr><td class="text-success">Total Ingresos:</td><td class="currency text-success">S/ {{ number_format($totalIngresos, 2) }}</td></tr>
                    <tr><td class="text-danger">Total Egresos:</td><td class="currency text-danger">S/ {{ number_format($totalEgresos, 2) }}</td></tr>
                    <tr><td class="text-bold">Saldo Esperado:</td><td class="currency text-bold">S/ {{ number_format($expectedBalance, 2) }}</td></tr>
                    <tr>
                        <td class="text-bold">Saldo Real:</td>
                        <td class="currency text-bold">
                            @if($session->actual_balance !== null)
                                S/ {{ number_format($session->actual_balance, 2) }}
                            @else
                                ___________
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td class="text-bold">DIFERENCIA:</td>
                        <td class="currency text-bold {{ ($session->difference ?? 0) > 0 ? 'text-success' : (($session->difference ?? 0) < 0 ? 'text-danger' : '') }}">
                            @if($session->difference !== null)
                                S/ {{ number_format($session->difference, 2) }}
                                @if($session->difference > 0)
                                    <span class="badge badge-success">Sobrante</span>
                                @elseif($session->difference < 0)
                                    <span class="badge badge-danger">Faltante</span>
                                @else
                                    <span class="badge badge-success">OK</span>
                                @endif
                            @else
                                ___________
                            @endif
                        </td>
                    </tr>
                </table>
            </div>
        </td>
    </tr>
</table>

{{-- Desglose por Metodo de Pago --}}
<h2>Desglose por Metodo de Pago</h2>
<table class="table-bordered table-compact">
    <thead>
        <tr>
            <th style="width: 35%;">Metodo</th>
            <th class="text-right" style="width: 22%;">Ingresos</th>
            <th class="text-right" style="width: 22%;">Egresos</th>
            <th class="text-right" style="width: 21%;">Neto</th>
        </tr>
    </thead>
    <tbody>
        @foreach($movementsByPaymentMethod as $method => $data)
        <tr>
            <td class="text-bold">{{ ucfirst($method) }}</td>
            <td class="text-right currency text-success">S/ {{ number_format($data['ingresos'], 2) }}</td>
            <td class="text-right currency text-danger">S/ {{ number_format($data['egresos'], 2) }}</td>
            <td class="text-right currency text-bold">S/ {{ number_format($data['neto'], 2) }}</td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td class="text-right text-bold">TOTALES:</td>
            <td class="text-right currency text-bold text-success">S/ {{ number_format($movementsByPaymentMethod->sum('ingresos'), 2) }}</td>
            <td class="text-right currency text-bold text-danger">S/ {{ number_format($movementsByPaymentMethod->sum('egresos'), 2) }}</td>
            <td class="text-right currency text-bold">S/ {{ number_format($movementsByPaymentMethod->sum('neto'), 2) }}</td>
        </tr>
    </tfoot>
</table>

{{-- Conteo de Billetes y Monedas --}}
<h2>Conteo de Billetes y Monedas</h2>
<table class="table-bordered table-compact">
    <thead>
        <tr>
            <th style="width: 18%;">Denominacion</th>
            <th class="text-center" style="width: 15%;">Cantidad</th>
            <th class="text-right" style="width: 17%;">Subtotal</th>
            <th style="width: 18%;">Denominacion</th>
            <th class="text-center" style="width: 15%;">Cantidad</th>
            <th class="text-right" style="width: 17%;">Subtotal</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="text-bold">S/ 200</td><td class="text-center">_______</td><td class="text-right">S/ ________</td>
            <td class="text-bold">S/ 5</td><td class="text-center">_______</td><td class="text-right">S/ ________</td>
        </tr>
        <tr>
            <td class="text-bold">S/ 100</td><td class="text-center">_______</td><td class="text-right">S/ ________</td>
            <td class="text-bold">S/ 2</td><td class="text-center">_______</td><td class="text-right">S/ ________</td>
        </tr>
        <tr>
            <td class="text-bold">S/ 50</td><td class="text-center">_______</td><td class="text-right">S/ ________</td>
            <td class="text-bold">S/ 1</td><td class="text-center">_______</td><td class="text-right">S/ ________</td>
        </tr>
        <tr>
            <td class="text-bold">S/ 20</td><td class="text-center">_______</td><td class="text-right">S/ ________</td>
            <td class="text-bold">S/ 0.50</td><td class="text-center">_______</td><td class="text-right">S/ ________</td>
        </tr>
        <tr>
            <td class="text-bold">S/ 10</td><td class="text-center">_______</td><td class="text-right">S/ ________</td>
            <td class="text-bold">S/ 0.20/0.10</td><td class="text-center">_______</td><td class="text-right">S/ ________</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td colspan="6" class="text-center text-bold" style="font-size: 9pt;">
                TOTAL CONTADO: S/ __________________
            </td>
        </tr>
    </tfoot>
</table>

{{-- Observaciones --}}
<div class="summary-box mt-5">
    <div class="summary-title">Observaciones</div>
    <table class="summary-table">
        <tr>
            <td style="padding: 4px;">
                @if($session->closing_notes)
                    {{ $session->closing_notes }}
                @else
                    <span class="text-muted text-small">___________________________________________________________________</span>
                @endif
            </td>
        </tr>
    </table>
</div>

{{-- Firmas --}}
<div class="signature-section">
    <div class="signature-box">
        <div class="signature-line">
            <div class="signature-label">Cajero</div>
            <div class="text-small text-muted">{{ $session->user->name }}</div>
        </div>
    </div>
    <div class="signature-box">
        <div class="signature-line">
            <div class="signature-label">Supervisor</div>
            <div class="text-small text-muted">Nombre y Firma</div>
        </div>
    </div>
</div>

@endsection
