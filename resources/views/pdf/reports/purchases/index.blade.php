@extends('pdf.layouts.base')

@section('content')

{{-- Resumen Ejecutivo --}}
<div class="summary-box">
    <div class="summary-title">RESUMEN EJECUTIVO</div>
    <div class="summary-grid">
        <div class="summary-row">
            <div class="summary-label">Total de Compras:</div>
            <div class="summary-value highlight">{{ $totals['total_purchases'] }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Subtotal:</div>
            <div class="summary-value">S/ {{ number_format($totals['total_subtotal'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">IGV:</div>
            <div class="summary-value">S/ {{ number_format($totals['total_tax'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Total General:</div>
            <div class="summary-value highlight text-primary">S/ {{ number_format($totals['total_amount'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Órdenes Pendientes:</div>
            <div class="summary-value text-warning">{{ $totals['pending_count'] }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Órdenes Recibidas:</div>
            <div class="summary-value text-success">{{ $totals['received_count'] }}</div>
        </div>
    </div>
</div>

{{-- Totales por Proveedor y Método de Pago --}}
<div class="grid-2 mb-15">
    @if(isset($totalsBySupplier) && count($totalsBySupplier) > 0)
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Total por Proveedor</div>
            <div class="info-box-content">
                <table class="table-clean text-small">
                    <thead>
                        <tr>
                            <th class="text-left">Proveedor</th>
                            <th class="text-center">Compras</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($totalsBySupplier as $item)
                        <tr>
                            <td class="text-small">{{ $item['supplier'] }}</td>
                            <td class="text-center">{{ $item['count'] }}</td>
                            <td class="text-right text-bold text-small">S/ {{ number_format($item['total'], 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    @endif

    @if(isset($totalsByPaymentMethod) && count($totalsByPaymentMethod) > 0)
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Total por Método de Pago</div>
            <div class="info-box-content">
                <table class="table-clean text-small">
                    <thead>
                        <tr>
                            <th class="text-left">Método</th>
                            <th class="text-center">Compras</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($totalsByPaymentMethod as $item)
                        <tr>
                            <td class="text-small">{{ ucfirst($item['method']) }}</td>
                            <td class="text-center">{{ $item['count'] }}</td>
                            <td class="text-right text-bold text-small">S/ {{ number_format($item['total'], 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    @endif
</div>

{{-- Alertas --}}
@if($totals['pending_count'] > 0)
<div class="alert alert-warning">
    <strong>⚠️ Atención:</strong> Hay {{ $totals['pending_count'] }} orden(es) de compra pendiente(s) de recepción. Se recomienda realizar seguimiento con los proveedores.
</div>
@endif

{{-- Tabla de Compras --}}
<h2>Detalle de Órdenes de Compra</h2>

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
    <strong>No hay resultados:</strong> No se encontraron órdenes de compra con los filtros aplicados.
</div>
@endif

{{-- Análisis Detallado --}}
@if(count($purchases) > 0)
<div class="page-break-before"></div>

<h2>Análisis de Compras</h2>

<div class="grid-2 mb-15">
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Estado de Recepciones</div>
            <div class="info-box-content">
                <div class="info-row">
                    <span class="info-label">Pendientes de Recibir:</span>
                    <span class="info-value text-warning">{{ $totals['pending_count'] }} órdenes</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Recepción Parcial:</span>
                    <span class="info-value text-info">{{ $totals['partial_count'] }} órdenes</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Totalmente Recibidas:</span>
                    <span class="info-value text-success">{{ $totals['received_count'] }} órdenes</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tasa de Recepción:</span>
                    <span class="info-value text-bold">
                        @php
                            $receptionRate = $totals['total_purchases'] > 0
                                ? ($totals['received_count'] / $totals['total_purchases']) * 100
                                : 0;
                        @endphp
                        {{ number_format($receptionRate, 1) }}%
                    </span>
                </div>
            </div>
        </div>
    </div>

    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Análisis de Montos</div>
            <div class="info-box-content">
                @php
                    $avgPurchase = $totals['total_purchases'] > 0
                        ? $totals['total_amount'] / $totals['total_purchases']
                        : 0;
                    $taxPercentage = $totals['total_subtotal'] > 0
                        ? ($totals['total_tax'] / $totals['total_subtotal']) * 100
                        : 0;
                @endphp
                <div class="info-row">
                    <span class="info-label">Compra Promedio:</span>
                    <span class="info-value">S/ {{ number_format($avgPurchase, 2) }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Porcentaje IGV:</span>
                    <span class="info-value">{{ number_format($taxPercentage, 1) }}%</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Mayor Compra:</span>
                    <span class="info-value text-bold">
                        S/ {{ number_format(collect($purchases)->max('purchase.total'), 2) }}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Menor Compra:</span>
                    <span class="info-value">
                        S/ {{ number_format(collect($purchases)->min('purchase.total'), 2) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="grid-2">
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Proveedores Principales (Top 10)</div>
            <div class="info-box-content">
                @php
                    $topSuppliers = collect($purchases)
                        ->groupBy('purchase.supplier.name')
                        ->map(function ($items, $supplier) {
                            return [
                                'supplier' => $supplier,
                                'total' => $items->sum('purchase.total'),
                                'count' => $items->count(),
                            ];
                        })
                        ->sortByDesc('total')
                        ->take(10);
                @endphp
                @if($topSuppliers->count() > 0)
                    <table class="table-clean text-small">
                        <thead>
                            <tr>
                                <th class="text-left">Proveedor</th>
                                <th class="text-center">Compras</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($topSuppliers as $supplier)
                            <tr>
                                <td class="text-small">{{ $supplier['supplier'] }}</td>
                                <td class="text-center">{{ $supplier['count'] }}</td>
                                <td class="text-right text-primary text-bold text-small">
                                    S/ {{ number_format($supplier['total'], 2) }}
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                @endif
            </div>
        </div>
    </div>

    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Órdenes Pendientes de Recepción</div>
            <div class="info-box-content">
                @php
                    $pendingOrders = collect($purchases)
                        ->where('purchase.status', 'pendiente')
                        ->sortBy('purchase.order_date')
                        ->take(10);
                @endphp
                @if($pendingOrders->count() > 0)
                    <table class="table-clean text-small">
                        <thead>
                            <tr>
                                <th class="text-left">N° Orden</th>
                                <th class="text-left">Proveedor</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($pendingOrders as $order)
                            <tr>
                                <td class="text-small text-bold">{{ $order['purchase']->order_number }}</td>
                                <td class="text-small">{{ $order['purchase']->supplier->name }}</td>
                                <td class="text-right text-warning text-bold text-small">
                                    S/ {{ number_format($order['purchase']->total, 2) }}
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                    @if(collect($purchases)->where('purchase.status', 'pendiente')->count() > 10)
                        <p class="text-small text-muted mt-10">
                            ... y {{ collect($purchases)->where('purchase.status', 'pendiente')->count() - 10 }} orden(es) más
                        </p>
                    @endif
                @else
                    <p class="text-small text-muted">✓ No hay órdenes pendientes</p>
                @endif
            </div>
        </div>
    </div>
</div>

{{-- Compras Más Grandes --}}
<div class="info-box mt-15">
    <div class="info-box-header">Top 10 - Compras de Mayor Valor</div>
    <div class="info-box-content">
        @php
            $largestPurchases = collect($purchases)->sortByDesc('purchase.total')->take(10);
        @endphp
        <table class="table-clean text-small">
            <thead>
                <tr>
                    <th class="text-left">N° Orden</th>
                    <th class="text-left">Fecha</th>
                    <th class="text-left">Proveedor</th>
                    <th class="text-center">Items</th>
                    <th class="text-right">Total</th>
                    <th class="text-center">Estado</th>
                </tr>
            </thead>
            <tbody>
                @foreach($largestPurchases as $purchase)
                <tr>
                    <td class="text-small text-bold">{{ $purchase['purchase']->order_number }}</td>
                    <td class="text-small">{{ \Carbon\Carbon::parse($purchase['purchase']->order_date)->format('d/m/Y') }}</td>
                    <td class="text-small">{{ $purchase['purchase']->supplier->name }}</td>
                    <td class="text-center">{{ $purchase['total_items'] }}</td>
                    <td class="text-right text-primary text-bold text-small">
                        S/ {{ number_format($purchase['purchase']->total, 2) }}
                    </td>
                    <td class="text-center">
                        @if($purchase['purchase']->status === 'recibido')
                            <span class="badge badge-success text-small">Recibido</span>
                        @elseif($purchase['purchase']->status === 'pendiente')
                            <span class="badge badge-warning text-small">Pendiente</span>
                        @else
                            <span class="badge badge-info text-small">{{ ucfirst($purchase['purchase']->status) }}</span>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>

{{-- Recomendaciones --}}
<div class="alert alert-info mt-15 no-page-break">
    <strong>💡 Recomendaciones de Gestión de Compras:</strong>
    <ul class="text-small" style="margin-top: 5px; padding-left: 20px;">
        @if($totals['pending_count'] > 0)
            <li>Realizar seguimiento a {{ $totals['pending_count'] }} orden(es) pendiente(s) de recepción</li>
        @endif
        @if($totals['partial_count'] > 0)
            <li>Completar recepción de {{ $totals['partial_count'] }} orden(es) parcialmente recibida(s)</li>
        @endif
        @if($receptionRate < 80)
            <li>Mejorar tasa de recepción actual ({{ number_format($receptionRate, 1) }}%) mediante mejor coordinación con proveedores</li>
        @endif
        <li>Inversión total en compras del período: S/ {{ number_format($totals['total_amount'], 2) }}</li>
        <li>Compra promedio: S/ {{ number_format($avgPurchase, 2) }}</li>
        @php
            $topSupplier = collect($purchases)
                ->groupBy('purchase.supplier.name')
                ->map(fn($items) => ['name' => $items->first()['purchase']->supplier->name, 'total' => $items->sum('purchase.total')])
                ->sortByDesc('total')
                ->first();
        @endphp
        @if($topSupplier)
            <li>Principal proveedor: {{ $topSupplier['name'] }} (S/ {{ number_format($topSupplier['total'], 2) }})</li>
        @endif
    </ul>
</div>
@endif

@endsection
