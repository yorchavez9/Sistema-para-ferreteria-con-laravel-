<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Voucher de Pago - Cuota {{ $payment->payment_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Courier New', monospace;
            font-size: {{ $config['fontSize'] ?? '10px' }};
            line-height: 1.3;
            color: #000;
            padding: 10px;
        }

        .voucher-container {
            max-width: {{ $config['width'] ?? '80mm' }};
            margin: 0 auto;
        }

        .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }

        .company-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 3px;
        }

        .company-info {
            font-size: 9px;
            margin-bottom: 2px;
        }

        .voucher-title {
            font-size: 12px;
            font-weight: bold;
            margin-top: 8px;
            margin-bottom: 3px;
            text-align: center;
        }

        .voucher-number {
            font-size: 11px;
            text-align: center;
            margin-bottom: 5px;
        }

        .section {
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
        }

        .section-title {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 5px;
            text-decoration: underline;
        }

        .info-row {
            display: table;
            width: 100%;
            margin-bottom: 3px;
            font-size: 10px;
        }

        .info-label {
            display: table-cell;
            width: 45%;
            font-weight: bold;
        }

        .info-value {
            display: table-cell;
            width: 55%;
            text-align: right;
        }

        .amount-section {
            background-color: #f0f0f0;
            padding: 8px;
            margin: 10px 0;
            border: 2px solid #000;
            text-align: center;
        }

        .amount-label {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 3px;
        }

        .amount-value {
            font-size: 16px;
            font-weight: bold;
        }

        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border: 1px solid #000;
            font-weight: bold;
            font-size: 10px;
        }

        .status-pagado {
            background-color: #d4edda;
        }

        .notes-section {
            margin-top: 10px;
            padding: 8px;
            border: 1px solid #000;
            background-color: #f9f9f9;
        }

        .footer {
            margin-top: 15px;
            text-align: center;
            font-size: 8px;
            border-top: 1px dashed #000;
            padding-top: 8px;
        }

        .signature-line {
            margin-top: 30px;
            border-top: 1px solid #000;
            width: 70%;
            margin-left: auto;
            margin-right: auto;
            text-align: center;
            padding-top: 5px;
            font-size: 9px;
        }

        @media print {
            body {
                padding: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="voucher-container">
        <!-- Header -->
        <div class="header">
            <div class="company-name">{{ strtoupper(config('app.name', 'FERRETERÍA')) }}</div>
            <div class="company-info">RUC: 20123456789</div>
            <div class="company-info">{{ $payment->sale->branch->name }}</div>
            <div class="company-info">Telf: (01) 234-5678</div>
        </div>

        <!-- Voucher Title -->
        <div class="voucher-title">COMPROBANTE DE PAGO</div>
        <div class="voucher-number">Cuota N° {{ $payment->payment_number }}</div>

        <!-- Sale Info -->
        <div class="section">
            <div class="section-title">DATOS DE LA VENTA</div>
            <div class="info-row">
                <span class="info-label">Comprobante:</span>
                <span class="info-value">{{ $payment->sale->sale_number }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Fecha Venta:</span>
                <span class="info-value">{{ \Carbon\Carbon::parse($payment->sale->sale_date)->format('d/m/Y') }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Cliente:</span>
                <span class="info-value">{{ $payment->sale->customer->name }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">{{ $payment->sale->customer->document_type }}:</span>
                <span class="info-value">{{ $payment->sale->customer->document_number }}</span>
            </div>
        </div>

        <!-- Payment Info -->
        <div class="section">
            <div class="section-title">DATOS DEL PAGO</div>
            <div class="info-row">
                <span class="info-label">Fecha de Pago:</span>
                <span class="info-value">{{ \Carbon\Carbon::parse($payment->paid_date)->format('d/m/Y H:i') }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Método:</span>
                <span class="info-value">
                    @switch($payment->payment_method)
                        @case('efectivo') EFECTIVO @break
                        @case('tarjeta') TARJETA @break
                        @case('transferencia') TRANSFERENCIA @break
                        @case('yape') YAPE @break
                        @case('plin') PLIN @break
                        @default {{ strtoupper($payment->payment_method) }}
                    @endswitch
                </span>
            </div>
            @if($payment->transaction_reference)
            <div class="info-row">
                <span class="info-label">N° Operación:</span>
                <span class="info-value">{{ $payment->transaction_reference }}</span>
            </div>
            @endif
            <div class="info-row">
                <span class="info-label">Estado:</span>
                <span class="info-value">
                    <span class="status-badge status-pagado">PAGADO</span>
                </span>
            </div>
        </div>

        <!-- Amount -->
        <div class="amount-section">
            <div class="amount-label">MONTO PAGADO</div>
            <div class="amount-value">S/ {{ number_format($payment->amount, 2) }}</div>
        </div>

        <!-- Credit Info -->
        @if($payment->sale->payment_type === 'credito')
        <div class="section">
            <div class="section-title">INFORMACIÓN DE CRÉDITO</div>
            <div class="info-row">
                <span class="info-label">Total Venta:</span>
                <span class="info-value">S/ {{ number_format($payment->sale->total, 2) }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Saldo Pendiente:</span>
                <span class="info-value">S/ {{ number_format($payment->sale->remaining_balance, 2) }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Cuotas Restantes:</span>
                <span class="info-value">{{ $payment->sale->payments()->where('status', '!=', 'pagado')->count() }}</span>
            </div>
        </div>
        @endif

        <!-- Notes -->
        @if($payment->notes)
        <div class="notes-section">
            <div style="font-weight: bold; margin-bottom: 3px; font-size: 10px;">OBSERVACIONES:</div>
            <div style="font-size: 9px;">{{ $payment->notes }}</div>
        </div>
        @endif

        <!-- Signature -->
        <div class="signature-line">
            Firma del Cliente
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Gracias por su pago</p>
            <p>{{ config('app.name') }}</p>
            <p style="margin-top: 5px;">
                Impreso: {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}
            </p>
            <p>Usuario: {{ $payment->updater->name ?? 'Sistema' }}</p>
        </div>
    </div>
</body>
</html>
