@extends('pdf.layouts.base')

@section('content')

{{-- Resumen Ejecutivo --}}
<div class="summary-box">
    <div class="summary-title">RESUMEN EJECUTIVO</div>
    <div class="summary-grid">
        <div class="summary-row">
            <div class="summary-label">Total Ventas a Crédito:</div>
            <div class="summary-value highlight">{{ $totals['total_sales'] }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Monto Total Vendido:</div>
            <div class="summary-value">S/ {{ number_format($totals['total_amount'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Total Cobrado:</div>
            <div class="summary-value text-success">S/ {{ number_format($totals['total_paid'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Total Pendiente:</div>
            <div class="summary-value text-warning">S/ {{ number_format($totals['total_pending'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Total Vencido:</div>
            <div class="summary-value text-danger highlight">S/ {{ number_format($totals['total_overdue'], 2) }}</div>
        </div>
    </div>
</div>

{{-- Alertas --}}
@if($totals['total_overdue'] > 0)
<div class="alert alert-danger">
    <strong>⚠️ Atención:</strong> Hay S/ {{ number_format($totals['total_overdue'], 2) }} en cuentas vencidas que requieren gestión de cobranza inmediata.
</div>
@endif

{{-- Tabla de Cuentas por Cobrar --}}
<h2>Detalle de Cuentas por Cobrar</h2>

@if(count($receivables) > 0)
<table class="table-bordered table-compact">
    <thead>
        <tr>
            <th style="width: 8%;">N° Venta</th>
            <th style="width: 10%;">Fecha</th>
            <th style="width: 15%;">Cliente</th>
            <th style="width: 10%;">Sucursal</th>
            <th class="text-right" style="width: 10%;">Total</th>
            <th class="text-right" style="width: 10%;">Inicial</th>
            <th class="text-right" style="width: 10%;">Saldo</th>
            <th class="text-center" style="width: 9%;">Cuotas</th>
            <th class="text-center" style="width: 9%;">Días Atraso</th>
            <th class="text-center" style="width: 9%;">Estado</th>
        </tr>
    </thead>
    <tbody>
        @foreach($receivables as $item)
        <tr>
            <td class="text-bold text-small">{{ $item['sale']->document_series }}-{{ str_pad($item['sale']->document_number, 8, '0', STR_PAD_LEFT) }}</td>
            <td class="text-small">{{ \Carbon\Carbon::parse($item['sale']->sale_date)->format('d/m/Y') }}</td>
            <td class="text-small">{{ $item['sale']->customer->name ?? 'Cliente General' }}</td>
            <td class="text-small">{{ $item['sale']->branch->name ?? 'N/A' }}</td>
            <td class="text-right currency text-small">S/ {{ number_format($item['sale']->total, 2) }}</td>
            <td class="text-right currency text-small">S/ {{ number_format($item['initial_payment'], 2) }}</td>
            <td class="text-right currency text-bold text-small text-warning">S/ {{ number_format($item['remaining_balance'], 2) }}</td>
            <td class="text-center text-small">
                <span class="{{ $item['paid_installments'] == $item['total_installments'] ? 'text-success' : 'text-warning' }} text-bold">
                    {{ $item['paid_installments'] }}/{{ $item['total_installments'] }}
                </span>
            </td>
            <td class="text-center">
                @if($item['days_overdue'] > 0)
                    <span class="badge {{ $item['days_overdue'] > 30 ? 'badge-danger' : ($item['days_overdue'] > 15 ? 'badge-warning' : 'badge-info') }} text-small">
                        {{ $item['days_overdue'] }} días
                    </span>
                @else
                    <span class="text-muted text-small">-</span>
                @endif
            </td>
            <td class="text-center">
                @if($item['remaining_balance'] <= 0)
                    <span class="badge badge-success text-small">Pagado</span>
                @elseif($item['days_overdue'] > 0)
                    <span class="badge badge-danger text-small">Vencido</span>
                @else
                    <span class="badge badge-info text-small">Al día</span>
                @endif
            </td>
        </tr>

        {{-- Detalle de Cuotas --}}
        @if($item['sale']->payments && $item['sale']->payments->count() > 0)
        <tr class="no-border">
            <td colspan="10" class="p-0">
                <table class="table-clean text-small" style="margin: 5px 0 10px 20px; width: 98%;">
                    <thead class="bg-light">
                        <tr>
                            <th class="text-left" style="width: 10%;">Cuota</th>
                            <th class="text-right" style="width: 15%;">Monto</th>
                            <th class="text-center" style="width: 15%;">Vencimiento</th>
                            <th class="text-center" style="width: 15%;">Fecha Pago</th>
                            <th class="text-right" style="width: 15%;">Monto Pagado</th>
                            <th class="text-center" style="width: 15%;">Método</th>
                            <th class="text-center" style="width: 15%;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($item['sale']->payments as $payment)
                        <tr>
                            <td class="text-small">Cuota {{ $payment->installment_number }}</td>
                            <td class="text-right text-small">S/ {{ number_format($payment->installment_amount, 2) }}</td>
                            <td class="text-center text-small">{{ \Carbon\Carbon::parse($payment->due_date)->format('d/m/Y') }}</td>
                            <td class="text-center text-small">
                                @if($payment->paid_date)
                                    {{ \Carbon\Carbon::parse($payment->paid_date)->format('d/m/Y') }}
                                @else
                                    <span class="text-muted">-</span>
                                @endif
                            </td>
                            <td class="text-right text-small">
                                @if($payment->paid_amount)
                                    S/ {{ number_format($payment->paid_amount, 2) }}
                                @else
                                    <span class="text-muted">-</span>
                                @endif
                            </td>
                            <td class="text-center text-small">{{ $payment->payment_method ? ucfirst($payment->payment_method) : '-' }}</td>
                            <td class="text-center">
                                @if($payment->status === 'pagado')
                                    <span class="badge badge-success text-small">Pagado</span>
                                @elseif($payment->status === 'pendiente')
                                    @php
                                        $dueDate = \Carbon\Carbon::parse($payment->due_date);
                                        $today = \Carbon\Carbon::now();
                                        $isOverdue = $dueDate->lt($today);
                                    @endphp
                                    @if($isOverdue)
                                        <span class="badge badge-danger text-small">Vencido</span>
                                    @else
                                        <span class="badge badge-info text-small">Pendiente</span>
                                    @endif
                                @else
                                    <span class="badge badge-secondary text-small">{{ ucfirst($payment->status) }}</span>
                                @endif
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </td>
        </tr>
        @endif
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
    <strong>No hay resultados:</strong> No se encontraron cuentas por cobrar con los filtros aplicados.
</div>
@endif

{{-- Análisis Adicional --}}
@if(count($receivables) > 0)
<div class="page-break-before"></div>

<h2>Análisis de Cobranza</h2>

<div class="grid-2 mb-15">
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Clientes con Mayor Deuda</div>
            <div class="info-box-content">
                @php
                    $topDebtors = collect($receivables)->groupBy('sale.customer.name')
                        ->map(function ($items, $customer) {
                            return [
                                'customer' => $customer ?: 'Cliente General',
                                'total_debt' => $items->sum('remaining_balance'),
                                'sales_count' => $items->count(),
                            ];
                        })
                        ->sortByDesc('total_debt')
                        ->take(10);
                @endphp
                @if($topDebtors->count() > 0)
                    <table class="table-clean text-small">
                        <thead>
                            <tr>
                                <th class="text-left">Cliente</th>
                                <th class="text-center">Ventas</th>
                                <th class="text-right">Deuda Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($topDebtors as $debtor)
                            <tr>
                                <td class="text-small">{{ $debtor['customer'] }}</td>
                                <td class="text-center text-bold">{{ $debtor['sales_count'] }}</td>
                                <td class="text-right text-danger text-bold text-small">
                                    S/ {{ number_format($debtor['total_debt'], 2) }}
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                @else
                    <p class="text-small text-muted">No hay clientes con deuda</p>
                @endif
            </div>
        </div>
    </div>

    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Cuentas Más Vencidas</div>
            <div class="info-box-content">
                @php
                    $mostOverdue = collect($receivables)
                        ->where('days_overdue', '>', 0)
                        ->sortByDesc('days_overdue')
                        ->take(10);
                @endphp
                @if($mostOverdue->count() > 0)
                    <table class="table-clean text-small">
                        <thead>
                            <tr>
                                <th class="text-left">Cliente</th>
                                <th class="text-center">Días Atraso</th>
                                <th class="text-right">Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($mostOverdue as $item)
                            <tr>
                                <td class="text-small">{{ $item['sale']->customer->name ?? 'Cliente General' }}</td>
                                <td class="text-center text-danger text-bold">{{ $item['days_overdue'] }} días</td>
                                <td class="text-right text-small">
                                    S/ {{ number_format($item['remaining_balance'], 2) }}
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                @else
                    <p class="text-small text-muted">✓ No hay cuentas vencidas</p>
                @endif
            </div>
        </div>
    </div>
</div>

<div class="grid-2">
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Estado de Cobranza</div>
            <div class="info-box-content">
                <div class="info-row">
                    <span class="info-label">Al Día:</span>
                    <span class="info-value text-success">
                        {{ collect($receivables)->where('days_overdue', 0)->count() }} ventas
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Vencidas (1-15 días):</span>
                    <span class="info-value text-warning">
                        {{ collect($receivables)->whereBetween('days_overdue', [1, 15])->count() }} ventas
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Vencidas (16-30 días):</span>
                    <span class="info-value text-warning">
                        {{ collect($receivables)->whereBetween('days_overdue', [16, 30])->count() }} ventas
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Vencidas (+30 días):</span>
                    <span class="info-value text-danger">
                        {{ collect($receivables)->where('days_overdue', '>', 30)->count() }} ventas
                    </span>
                </div>
            </div>
        </div>
    </div>

    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Análisis de Cuotas</div>
            <div class="info-box-content">
                @php
                    $totalInstallments = collect($receivables)->sum('total_installments');
                    $paidInstallments = collect($receivables)->sum('paid_installments');
                    $pendingInstallments = $totalInstallments - $paidInstallments;
                    $paymentRate = $totalInstallments > 0 ? ($paidInstallments / $totalInstallments) * 100 : 0;
                @endphp
                <div class="info-row">
                    <span class="info-label">Total Cuotas:</span>
                    <span class="info-value">{{ $totalInstallments }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Cuotas Pagadas:</span>
                    <span class="info-value text-success">{{ $paidInstallments }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Cuotas Pendientes:</span>
                    <span class="info-value text-warning">{{ $pendingInstallments }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tasa de Pago:</span>
                    <span class="info-value text-bold {{ $paymentRate >= 80 ? 'text-success' : ($paymentRate >= 50 ? 'text-warning' : 'text-danger') }}">
                        {{ number_format($paymentRate, 1) }}%
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- Recomendaciones --}}
<div class="alert alert-info mt-15 no-page-break">
    <strong>💡 Recomendaciones de Gestión de Cobranza:</strong>
    <ul class="text-small" style="margin-top: 5px; padding-left: 20px;">
        @if(collect($receivables)->where('days_overdue', '>', 30)->count() > 0)
            <li>Contactar urgentemente a {{ collect($receivables)->where('days_overdue', '>', 30)->count() }} cliente(s) con más de 30 días de atraso</li>
        @endif
        @if(collect($receivables)->whereBetween('days_overdue', [1, 30])->count() > 0)
            <li>Enviar recordatorios a {{ collect($receivables)->whereBetween('days_overdue', [1, 30])->count() }} cliente(s) con pagos vencidos</li>
        @endif
        @if($totals['total_overdue'] > 0)
            <li>Monto total en riesgo por vencimiento: S/ {{ number_format($totals['total_overdue'], 2) }}</li>
        @endif
        @php
            $nextDue = collect($receivables)
                ->flatMap(fn($r) => $r['sale']->payments)
                ->where('status', 'pendiente')
                ->sortBy('due_date')
                ->first();
        @endphp
        @if($nextDue)
            <li>Próximo vencimiento: {{ \Carbon\Carbon::parse($nextDue->due_date)->format('d/m/Y') }} - S/ {{ number_format($nextDue->installment_amount, 2) }}</li>
        @endif
        @if($paymentRate < 70)
            <li>Mejorar tasa de cobro actual ({{ number_format($paymentRate, 1) }}%) mediante seguimiento más frecuente</li>
        @endif
    </ul>
</div>
@endif

@endsection
