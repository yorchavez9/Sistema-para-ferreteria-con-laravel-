@extends('pdf.layouts.base')

@section('content')

{{-- Resumen Ejecutivo --}}
<div class="summary-box">
    <div class="summary-title">RESUMEN EJECUTIVO</div>
    <div class="summary-grid">
        <div class="summary-row">
            <div class="summary-label">Total de Ventas:</div>
            <div class="summary-value highlight">{{ $totals['count'] }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Subtotal (Sin IGV):</div>
            <div class="summary-value">S/ {{ number_format($totals['subtotal'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">IGV (18%):</div>
            <div class="summary-value">S/ {{ number_format($totals['tax'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Descuentos:</div>
            <div class="summary-value">S/ {{ number_format($totals['discount'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">TOTAL GENERAL:</div>
            <div class="summary-value highlight text-primary">S/ {{ number_format($totals['total'], 2) }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Ticket Promedio:</div>
            <div class="summary-value">S/ {{ number_format($totals['avg_ticket'], 2) }}</div>
        </div>
    </div>
</div>

{{-- Totales por Método de Pago y Tipo de Documento --}}
@if(count($totalsByPaymentMethod) > 0 || count($totalsByDocumentType) > 0)
<div class="grid-2 mb-15">
    @if(count($totalsByPaymentMethod) > 0)
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Totales por Método de Pago</div>
            <div class="info-box-content">
                @foreach($totalsByPaymentMethod as $method => $data)
                <div class="info-row">
                    <span class="info-label">{{ ucfirst($method) }}:</span>
                    <span class="info-value">
                        S/ {{ number_format($data['total'], 2) }}
                        <span class="text-small text-muted">({{ $data['count'] }} ventas)</span>
                    </span>
                </div>
                @endforeach
            </div>
        </div>
    </div>
    @endif

    @if(count($totalsByDocumentType) > 0)
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Totales por Tipo de Documento</div>
            <div class="info-box-content">
                @foreach($totalsByDocumentType as $type => $data)
                <div class="info-row">
                    <span class="info-label">{{ ucfirst(str_replace('_', ' ', $type)) }}:</span>
                    <span class="info-value">
                        S/ {{ number_format($data['total'], 2) }}
                        <span class="text-small text-muted">({{ $data['count'] }} ventas)</span>
                    </span>
                </div>
                @endforeach
            </div>
        </div>
    </div>
    @endif
</div>
@endif

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

{{-- Notas adicionales --}}
@if(count($sales) > 0)
<div class="mt-20">
    <div class="grid-2">
        <div class="col">
            <div class="info-box">
                <div class="info-box-header">Estadísticas</div>
                <div class="info-box-content">
                    <div class="info-row">
                        <span class="info-label">Ventas Pagadas:</span>
                        <span class="info-value">
                            {{ $sales->where('status', 'pagado')->count() }}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Ventas Pendientes:</span>
                        <span class="info-value">
                            {{ $sales->where('status', 'pendiente')->count() }}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Ventas Anuladas:</span>
                        <span class="info-value">
                            {{ $sales->where('status', 'anulado')->count() }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="info-box">
                <div class="info-box-header">Formas de Pago</div>
                <div class="info-box-content">
                    <div class="info-row">
                        <span class="info-label">Contado:</span>
                        <span class="info-value">
                            {{ $sales->where('payment_type', 'contado')->count() }}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Crédito:</span>
                        <span class="info-value">
                            {{ $sales->where('payment_type', 'credito')->count() }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endif

@endsection
