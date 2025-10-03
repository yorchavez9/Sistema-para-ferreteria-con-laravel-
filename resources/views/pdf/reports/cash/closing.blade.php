@extends('pdf.layouts.base')

@section('content')

{{-- Información de la Sesión --}}
<div class="info-box mb-15">
    <div class="info-box-header">INFORMACIÓN DE LA SESIÓN</div>
    <div class="info-box-content">
        <div class="grid-2">
            <div class="col">
                <div class="info-row">
                    <span class="info-label">N° de Sesión:</span>
                    <span class="info-value text-bold">#{{ $session->id }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Caja:</span>
                    <span class="info-value">{{ $session->cashRegister->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Sucursal:</span>
                    <span class="info-value">{{ $session->cashRegister->branch->name ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Cajero:</span>
                    <span class="info-value">{{ $session->user->name }}</span>
                </div>
            </div>
            <div class="col">
                <div class="info-row">
                    <span class="info-label">Fecha Apertura:</span>
                    <span class="info-value">{{ \Carbon\Carbon::parse($session->opened_at)->format('d/m/Y H:i') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fecha Cierre:</span>
                    <span class="info-value">
                        @if($session->closed_at)
                            {{ \Carbon\Carbon::parse($session->closed_at)->format('d/m/Y H:i') }}
                        @else
                            <span class="text-warning">Aún Abierta</span>
                        @endif
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Duración:</span>
                    <span class="info-value">
                        @if($session->closed_at)
                            @php
                                $duration = \Carbon\Carbon::parse($session->opened_at)->diff(\Carbon\Carbon::parse($session->closed_at));
                            @endphp
                            {{ $duration->h }}h {{ $duration->i }}m
                        @else
                            -
                        @endif
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- Resumen de Movimientos --}}
<div class="summary-box">
    <div class="summary-title">RESUMEN DE CAJA</div>
    <div class="summary-grid">
        <div class="summary-row">
            <div class="summary-label">Saldo Inicial:</div>
            <div class="summary-value">S/ {{ number_format($session->opening_balance, 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">(+) Total Ingresos:</div>
            <div class="summary-value text-success">
                S/ {{ number_format($session->movements->whereIn('type', ['ingreso', 'venta', 'pago_credito', 'transferencia_entrada'])->where('payment_method', 'efectivo')->sum('amount'), 2) }}
            </div>
        </div>
        <div class="summary-row">
            <div class="summary-label">(-) Total Egresos:</div>
            <div class="summary-value text-danger">
                S/ {{ number_format($session->movements->whereIn('type', ['egreso', 'compra', 'gasto', 'transferencia_salida'])->where('payment_method', 'efectivo')->sum('amount'), 2) }}
            </div>
        </div>
        <div class="summary-row border-top">
            <div class="summary-label text-bold">Saldo Esperado:</div>
            <div class="summary-value highlight">
                S/ {{ number_format($session->expected_balance ?? $session->calculateExpectedBalance(), 2) }}
            </div>
        </div>
    </div>
</div>

{{-- Desglose por Método de Pago --}}
<h2>Desglose por Método de Pago</h2>

<table class="table-bordered">
    <thead>
        <tr>
            <th style="width: 30%;">Método de Pago</th>
            <th class="text-right" style="width: 23%;">Ingresos</th>
            <th class="text-right" style="width: 23%;">Egresos</th>
            <th class="text-right" style="width: 24%;">Neto</th>
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
            <td class="text-right currency text-bold text-success">
                S/ {{ number_format($movementsByPaymentMethod->sum('ingresos'), 2) }}
            </td>
            <td class="text-right currency text-bold text-danger">
                S/ {{ number_format($movementsByPaymentMethod->sum('egresos'), 2) }}
            </td>
            <td class="text-right currency text-bold">
                S/ {{ number_format($movementsByPaymentMethod->sum('neto'), 2) }}
            </td>
        </tr>
    </tfoot>
</table>

{{-- Tabla de Conteo de Billetes y Monedas (Solo para Efectivo) --}}
<div class="page-break-before"></div>

<h2>Conteo de Billetes y Monedas</h2>

<table class="money-count-table">
    <thead>
        <tr>
            <th class="text-left">Denominación</th>
            <th>Cantidad</th>
            <th class="text-right">Subtotal</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="denomination">S/ 200.00</td>
            <td class="text-center">___________</td>
            <td class="text-right">S/ __________</td>
        </tr>
        <tr>
            <td class="denomination">S/ 100.00</td>
            <td class="text-center">___________</td>
            <td class="text-right">S/ __________</td>
        </tr>
        <tr>
            <td class="denomination">S/ 50.00</td>
            <td class="text-center">___________</td>
            <td class="text-right">S/ __________</td>
        </tr>
        <tr>
            <td class="denomination">S/ 20.00</td>
            <td class="text-center">___________</td>
            <td class="text-right">S/ __________</td>
        </tr>
        <tr>
            <td class="denomination">S/ 10.00</td>
            <td class="text-center">___________</td>
            <td class="text-right">S/ __________</td>
        </tr>
        <tr>
            <td class="denomination">S/ 5.00</td>
            <td class="text-center">___________</td>
            <td class="text-right">S/ __________</td>
        </tr>
        <tr>
            <td class="denomination">S/ 2.00</td>
            <td class="text-center">___________</td>
            <td class="text-right">S/ __________</td>
        </tr>
        <tr>
            <td class="denomination">S/ 1.00</td>
            <td class="text-center">___________</td>
            <td class="text-right">S/ __________</td>
        </tr>
        <tr>
            <td class="denomination">S/ 0.50</td>
            <td class="text-center">___________</td>
            <td class="text-right">S/ __________</td>
        </tr>
        <tr>
            <td class="denomination">S/ 0.20</td>
            <td class="text-center">___________</td>
            <td class="text-right">S/ __________</td>
        </tr>
        <tr>
            <td class="denomination">S/ 0.10</td>
            <td class="text-center">___________</td>
            <td class="text-right">S/ __________</td>
        </tr>
        <tr class="bg-light">
            <td colspan="2" class="text-right text-bold">TOTAL CONTADO:</td>
            <td class="text-right text-bold">S/ __________</td>
        </tr>
    </tbody>
</table>

{{-- Cuadro de Diferencia --}}
<div class="summary-box mt-15">
    <div class="summary-title">CUADRE DE CAJA</div>
    <div class="summary-grid">
        <div class="summary-row">
            <div class="summary-label">Saldo Esperado (Sistema):</div>
            <div class="summary-value">
                S/ {{ number_format($session->expected_balance ?? $session->calculateExpectedBalance(), 2) }}
            </div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Saldo Contado (Real):</div>
            <div class="summary-value">
                @if($session->actual_balance !== null)
                    S/ {{ number_format($session->actual_balance, 2) }}
                @else
                    S/ __________
                @endif
            </div>
        </div>
        <div class="summary-row border-top">
            <div class="summary-label text-bold">DIFERENCIA:</div>
            <div class="summary-value highlight {{ ($session->difference ?? 0) > 0 ? 'text-success' : (($session->difference ?? 0) < 0 ? 'text-danger' : '') }}">
                @if($session->difference !== null)
                    S/ {{ number_format($session->difference, 2) }}
                    @if($session->difference > 0)
                        <span class="text-small">(Sobrante)</span>
                    @elseif($session->difference < 0)
                        <span class="text-small">(Faltante)</span>
                    @endif
                @else
                    S/ __________
                @endif
            </div>
        </div>
    </div>
</div>

{{-- Observaciones --}}
<div class="mt-15">
    <h3>Observaciones / Notas:</h3>
    <div class="border p-10" style="min-height: 80px; background-color: #f9fafb;">
        @if($session->closing_notes)
            {{ $session->closing_notes }}
        @else
            <span class="text-muted text-small">
                _____________________________________________________________________________<br><br>
                _____________________________________________________________________________<br><br>
                _____________________________________________________________________________
            </span>
        @endif
    </div>
</div>

{{-- Sección de Firmas --}}
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

{{-- Alerta si hay diferencia --}}
@if($session->difference !== null && $session->difference != 0)
<div class="alert {{ $session->difference > 0 ? 'alert-warning' : 'alert-danger' }} no-page-break mt-15">
    <strong>
        @if($session->difference > 0)
            ⚠️ SOBRANTE DETECTADO:
        @else
            ❌ FALTANTE DETECTADO:
        @endif
    </strong>
    Se registró una diferencia de <strong>S/ {{ number_format(abs($session->difference), 2) }}</strong>.
    Se recomienda revisar todos los movimientos y justificar la diferencia.
</div>
@endif

@endsection
