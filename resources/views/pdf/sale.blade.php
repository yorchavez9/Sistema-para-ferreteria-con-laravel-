<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $sale->document_type === 'factura' ? 'FACTURA' : ($sale->document_type === 'boleta' ? 'BOLETA DE VENTA' : 'NOTA DE VENTA') }} {{ $sale->sale_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            display: table;
            width: 100%;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }

        .header-left {
            display: table-cell;
            width: 60%;
            vertical-align: top;
        }

        .header-right {
            display: table-cell;
            width: 40%;
            vertical-align: top;
            text-align: right;
        }

        .company-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #2563eb;
        }

        .company-info {
            font-size: 10px;
            color: #666;
            margin-bottom: 3px;
        }

        .document-box {
            border: 2px solid #333;
            padding: 10px;
            text-align: center;
            display: inline-block;
            min-width: 150px;
        }

        .document-type {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .document-number {
            font-size: 16px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            color: #2563eb;
        }

        .info-section {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }

        .info-left {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .info-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding-left: 15px;
        }

        .info-block {
            margin-bottom: 15px;
        }

        .info-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #2563eb;
            border-bottom: 1px solid #ddd;
            padding-bottom: 3px;
        }

        .info-row {
            margin-bottom: 4px;
        }

        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }

        .info-value {
            display: inline-block;
        }

        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        .products-table thead {
            background-color: #2563eb;
            color: white;
        }

        .products-table th {
            padding: 8px;
            text-align: left;
            font-size: 11px;
            font-weight: bold;
        }

        .products-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #ddd;
        }

        .products-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .totals-section {
            float: right;
            width: 300px;
            margin-top: 10px;
        }

        .totals-row {
            display: table;
            width: 100%;
            margin-bottom: 5px;
        }

        .totals-label {
            display: table-cell;
            text-align: right;
            padding-right: 15px;
            font-weight: bold;
        }

        .totals-value {
            display: table-cell;
            text-align: right;
            width: 120px;
        }

        .total-final {
            border-top: 2px solid #333;
            padding-top: 8px;
            margin-top: 8px;
            font-size: 14px;
        }

        .total-final .totals-label,
        .total-final .totals-value {
            font-size: 14px;
            color: #2563eb;
        }

        .payment-info {
            clear: both;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
        }

        .payment-row {
            margin-bottom: 5px;
        }

        .payment-label {
            font-weight: bold;
            display: inline-block;
            width: 150px;
        }

        .notes-section {
            margin-top: 20px;
            padding: 10px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .notes-title {
            font-weight: bold;
            margin-bottom: 5px;
        }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 9px;
            color: #666;
            text-align: center;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            margin-left: 10px;
        }

        .status-pagado {
            background-color: #22c55e;
            color: white;
        }

        .status-pendiente {
            background-color: #f59e0b;
            color: white;
        }

        .status-anulado {
            background-color: #ef4444;
            color: white;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            .container {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                <div class="company-name">FERRETERÍA {{ strtoupper(config('app.name', 'Sistema')) }}</div>
                <div class="company-info">RUC: 20123456789</div>
                <div class="company-info">Dirección: Av. Principal 123, Lima - Perú</div>
                <div class="company-info">Teléfono: (01) 234-5678 | Email: ventas@ferreteria.com</div>
                <div class="company-info" style="margin-top: 8px;">
                    <strong>Sucursal:</strong> {{ $sale->branch->name }}
                </div>
            </div>
            <div class="header-right">
                <div class="document-box">
                    <div class="document-type">
                        {{ $sale->document_type === 'factura' ? 'FACTURA ELECTRÓNICA' : ($sale->document_type === 'boleta' ? 'BOLETA DE VENTA' : 'NOTA DE VENTA') }}
                    </div>
                    <div class="document-number">{{ $sale->sale_number }}</div>
                </div>
            </div>
        </div>

        <!-- Customer and Sale Info -->
        <div class="info-section">
            <div class="info-left">
                <div class="info-block">
                    <div class="info-title">DATOS DEL CLIENTE</div>
                    <div class="info-row">
                        <span class="info-label">{{ $sale->customer->document_type }}:</span>
                        <span class="info-value">{{ $sale->customer->document_number }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">
                            {{ $sale->document_type === 'factura' ? 'Razón Social:' : 'Nombres:' }}
                        </span>
                        <span class="info-value">{{ $sale->customer->name }}</span>
                    </div>
                    @if($sale->customer->address)
                    <div class="info-row">
                        <span class="info-label">Dirección:</span>
                        <span class="info-value">{{ $sale->customer->address }}</span>
                    </div>
                    @endif
                    @if($sale->customer->phone)
                    <div class="info-row">
                        <span class="info-label">Teléfono:</span>
                        <span class="info-value">{{ $sale->customer->phone }}</span>
                    </div>
                    @endif
                    @if($sale->customer->email)
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">{{ $sale->customer->email }}</span>
                    </div>
                    @endif
                </div>
            </div>
            <div class="info-right">
                <div class="info-block">
                    <div class="info-title">DATOS DE LA VENTA</div>
                    <div class="info-row">
                        <span class="info-label">Fecha Emisión:</span>
                        <span class="info-value">{{ \Carbon\Carbon::parse($sale->sale_date)->format('d/m/Y') }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tipo de Pago:</span>
                        <span class="info-value" style="font-weight: bold; color: {{ $sale->payment_type === 'credito' ? '#f97316' : '#2563eb' }};">
                            {{ $sale->payment_type === 'credito' ? 'A CRÉDITO' : 'AL CONTADO' }}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Método de Pago:</span>
                        <span class="info-value">
                            @switch($sale->payment_method)
                                @case('efectivo') Efectivo @break
                                @case('tarjeta') Tarjeta @break
                                @case('transferencia') Transferencia @break
                                @case('yape') Yape @break
                                @case('plin') Plin @break
                                @case('credito') Crédito @break
                                @default {{ $sale->payment_method }}
                            @endswitch
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Vendedor:</span>
                        <span class="info-value">{{ $sale->user->name }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Estado:</span>
                        <span class="status-badge status-{{ $sale->status }}">
                            {{ strtoupper($sale->status) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Products Table -->
        <table class="products-table">
            <thead>
                <tr>
                    <th style="width: 10%;">CÓDIGO</th>
                    <th style="width: 40%;">DESCRIPCIÓN</th>
                    <th style="width: 10%;" class="text-center">UNIDAD</th>
                    <th style="width: 10%;" class="text-center">CANTIDAD</th>
                    <th style="width: 15%;" class="text-right">P. UNIT.</th>
                    <th style="width: 15%;" class="text-right">SUBTOTAL</th>
                </tr>
            </thead>
            <tbody>
                @foreach($sale->details as $detail)
                <tr>
                    <td>{{ $detail->product->code }}</td>
                    <td>{{ $detail->product->name }}</td>
                    <td class="text-center">{{ $detail->product->unit }}</td>
                    <td class="text-center">{{ number_format($detail->quantity, 0) }}</td>
                    <td class="text-right">S/ {{ number_format($detail->unit_price, 2) }}</td>
                    <td class="text-right">S/ {{ number_format($detail->subtotal, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section">
            <div class="totals-row">
                <div class="totals-label">SUBTOTAL:</div>
                <div class="totals-value">S/ {{ number_format($sale->subtotal, 2) }}</div>
            </div>

            @if($sale->tax > 0)
            <div class="totals-row">
                <div class="totals-label">IGV (18%):</div>
                <div class="totals-value">S/ {{ number_format($sale->tax, 2) }}</div>
            </div>
            @endif

            @if($sale->discount > 0)
            <div class="totals-row">
                <div class="totals-label">DESCUENTO:</div>
                <div class="totals-value" style="color: #ef4444;">- S/ {{ number_format($sale->discount, 2) }}</div>
            </div>
            @endif

            <div class="totals-row total-final">
                <div class="totals-label">TOTAL:</div>
                <div class="totals-value">S/ {{ number_format($sale->total, 2) }}</div>
            </div>
        </div>

        <!-- Payment Info -->
        <div class="payment-info">
            @if($sale->payment_type === 'contado')
                <div class="payment-row">
                    <span class="payment-label">Monto Pagado:</span>
                    <span>S/ {{ number_format($sale->amount_paid, 2) }}</span>
                </div>
                @if($sale->change_amount > 0)
                <div class="payment-row">
                    <span class="payment-label">Vuelto:</span>
                    <span style="color: #22c55e; font-weight: bold;">S/ {{ number_format($sale->change_amount, 2) }}</span>
                </div>
                @endif
            @else
                <!-- Información de Crédito -->
                <div style="background-color: #fff7ed; border: 2px solid #f97316; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                    <div style="font-weight: bold; font-size: 13px; color: #f97316; margin-bottom: 10px; border-bottom: 2px solid #f97316; padding-bottom: 5px;">
                        📋 INFORMACIÓN DE CRÉDITO
                    </div>
                    <div style="display: table; width: 100%;">
                        <div style="display: table-row;">
                            <div style="display: table-cell; width: 50%; padding: 3px 0;">
                                <strong>Plazo:</strong> {{ $sale->credit_days }} días
                            </div>
                            <div style="display: table-cell; width: 50%; padding: 3px 0;">
                                <strong>Número de Cuotas:</strong> {{ $sale->installments }}
                            </div>
                        </div>
                        <div style="display: table-row;">
                            <div style="display: table-cell; width: 50%; padding: 3px 0;">
                                <strong>Pago Inicial:</strong> S/ {{ number_format($sale->initial_payment ?? 0, 2) }}
                            </div>
                            <div style="display: table-cell; width: 50%; padding: 3px 0;">
                                <strong>Saldo Pendiente:</strong> <span style="color: #f97316; font-weight: bold;">S/ {{ number_format($sale->remaining_balance ?? 0, 2) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabla de Cuotas -->
                @if($sale->payments && count($sale->payments) > 0)
                <div style="margin-top: 15px;">
                    <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px; color: #2563eb; border-bottom: 1px solid #ddd; padding-bottom: 3px;">
                        PLAN DE PAGOS - CUOTAS
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                        <thead>
                            <tr style="background-color: #f3f4f6;">
                                <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">Cuota</th>
                                <th style="border: 1px solid #ddd; padding: 6px; text-align: right;">Monto</th>
                                <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">Vencimiento</th>
                                <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($sale->payments as $payment)
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 5px; text-align: center;">
                                    <strong>Cuota {{ $payment->payment_number }}</strong>
                                </td>
                                <td style="border: 1px solid #ddd; padding: 5px; text-align: right;">
                                    <strong>S/ {{ number_format($payment->amount, 2) }}</strong>
                                </td>
                                <td style="border: 1px solid #ddd; padding: 5px; text-align: center;">
                                    {{ \Carbon\Carbon::parse($payment->due_date)->format('d/m/Y') }}
                                </td>
                                <td style="border: 1px solid #ddd; padding: 5px; text-align: center;">
                                    @if($payment->status === 'pagado')
                                        <span style="background-color: #22c55e; color: white; padding: 2px 8px; border-radius: 3px; font-size: 9px;">✓ PAGADO</span>
                                    @elseif($payment->status === 'vencido')
                                        <span style="background-color: #ef4444; color: white; padding: 2px 8px; border-radius: 3px; font-size: 9px;">⚠ VENCIDO</span>
                                    @else
                                        <span style="background-color: #f59e0b; color: white; padding: 2px 8px; border-radius: 3px; font-size: 9px;">⏱ PENDIENTE</span>
                                    @endif
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                @endif
            @endif
        </div>

        <!-- Notes -->
        @if($sale->notes)
        <div class="notes-section">
            <div class="notes-title">OBSERVACIONES:</div>
            <div>{{ $sale->notes }}</div>
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <p><strong>TÉRMINOS Y CONDICIONES:</strong></p>
            <p>Este documento es una representación impresa de un comprobante electrónico generado por el sistema.</p>
            <p>Para consultas o reclamos, comunicarse al teléfono (01) 234-5678 o al correo ventas@ferreteria.com</p>
            <p style="margin-top: 10px;">Gracias por su compra - {{ config('app.name') }}</p>
            <p style="margin-top: 5px; font-size: 8px;">
                Documento generado el {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}
            </p>
        </div>
    </div>
</body>
</html>