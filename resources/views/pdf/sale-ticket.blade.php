<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TICKET {{ $sale->sale_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: {{ $config['fontSize'] }};
            line-height: 1.2;
            color: #000;
            width: 100%;
            max-width: {{ $config['width'] }};
            margin: 0;
            padding: 2mm;
            overflow-x: hidden;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-left {
            text-align: left;
        }

        .bold {
            font-weight: bold;
        }

        .header {
            text-align: center;
            margin-bottom: 8px;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
        }

        .company-name {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 2px;
            word-wrap: break-word;
        }

        .company-info {
            font-size: 8px;
            margin-bottom: 1px;
            word-wrap: break-word;
        }

        .document-type {
            font-size: 11px;
            font-weight: bold;
            margin-top: 5px;
            margin-bottom: 2px;
        }

        .document-number {
            font-size: 10px;
            font-weight: bold;
        }

        .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
        }

        .section {
            margin-bottom: 6px;
        }

        .section-title {
            font-weight: bold;
            font-size: 9px;
            margin-bottom: 2px;
        }

        .info-line {
            font-size: 8px;
            margin-bottom: 1px;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .product-header {
            font-weight: bold;
            font-size: 8px;
            margin-bottom: 2px;
            border-bottom: 1px solid #000;
            padding-bottom: 1px;
        }

        .product-line {
            font-size: 8px;
            margin-bottom: 2px;
            page-break-inside: avoid;
        }

        .product-name {
            margin-bottom: 1px;
            word-wrap: break-word;
            overflow-wrap: break-word;
            max-width: 100%;
        }

        .product-details {
            display: table;
            width: 100%;
        }

        .product-qty {
            display: table-cell;
            width: 25%;
        }

        .product-price {
            display: table-cell;
            width: 35%;
            text-align: right;
        }

        .product-total {
            display: table-cell;
            width: 40%;
            text-align: right;
        }

        .totals {
            margin-top: 6px;
            border-top: 1px dashed #000;
            padding-top: 6px;
        }

        .total-line {
            display: table;
            width: 100%;
            margin-bottom: 2px;
            font-size: 9px;
        }

        .total-label {
            display: table-cell;
            text-align: left;
            font-weight: bold;
            width: 60%;
        }

        .total-value {
            display: table-cell;
            text-align: right;
            width: 40%;
        }

        .total-final {
            font-size: 11px;
            font-weight: bold;
            margin-top: 4px;
            padding-top: 4px;
            border-top: 2px solid #000;
        }

        .footer {
            margin-top: 8px;
            padding-top: 5px;
            border-top: 1px dashed #000;
            text-align: center;
            font-size: 7px;
            word-wrap: break-word;
        }

        .qr-code {
            text-align: center;
            margin: 8px 0;
        }

        .status {
            text-align: center;
            font-weight: bold;
            font-size: 9px;
            margin: 4px 0;
            padding: 3px;
            border: 1px solid #000;
        }

        /* Prevenir desbordamiento */
        table, tr, td, th {
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        /* Ajustar anchos para evitar desbordamiento */
        .product-details {
            font-size: 8px;
        }

        /* Mejorar padding del body */
        body {
            padding: 3mm;
        }

        /* Asegurar que el divider no cause overflow */
        .divider {
            margin: 4px 0;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="company-name">{{ strtoupper($settings->company_name ?? config('app.name')) }}</div>
        <div class="company-info">RUC: {{ $settings->company_ruc ?? 'N/A' }}</div>
        <div class="company-info">{{ $settings->company_address ?? '' }}</div>
        <div class="company-info">Tel: {{ $settings->company_phone ?? '' }}</div>
        @if($settings->company_email)
        <div class="company-info">{{ $settings->company_email }}</div>
        @endif
        <div class="company-info" style="margin-top: 3px;">Sucursal: {{ $sale->branch->name }}</div>

        <div class="document-type">
            {{ $sale->document_type === 'factura' ? 'FACTURA ELECTRONICA' : ($sale->document_type === 'boleta' ? 'BOLETA DE VENTA' : 'NOTA DE VENTA') }}
        </div>
        <div class="document-number">{{ $sale->sale_number }}</div>
    </div>

    <!-- Customer Info -->
    <div class="section">
        <div class="section-title">CLIENTE:</div>
        <div class="info-line">{{ $sale->customer->document_type }}: {{ $sale->customer->document_number }}</div>
        <div class="info-line">{{ $sale->customer->name }}</div>
        @if($sale->customer->address)
        <div class="info-line">{{ $sale->customer->address }}</div>
        @endif
    </div>

    <div class="divider"></div>

    <!-- Sale Info -->
    <div class="section">
        <div class="info-line">Fecha: {{ \Carbon\Carbon::parse($sale->sale_date)->format($settings->date_format ?? 'd/m/Y') }} {{ \Carbon\Carbon::parse($sale->sale_date)->format($settings->time_format ?? 'H:i') }}</div>
        <div class="info-line">Vendedor: {{ $sale->user->name }}</div>
        <div class="info-line">Pago: {{ $sale->payment_type === 'credito' ? 'CREDITO' : 'CONTADO' }} - {{ strtoupper($sale->payment_method) }}</div>
    </div>

    <div class="divider"></div>

    <!-- Products -->
    <div class="section">
        <div class="product-header">
            <div style="display: table; width: 100%;">
                <div style="display: table-cell; width: 50%;">PRODUCTO</div>
                <div style="display: table-cell; width: 20%; text-align: center;">CANT</div>
                <div style="display: table-cell; width: 30%; text-align: right;">TOTAL</div>
            </div>
        </div>

        @foreach($sale->details as $detail)
        <div class="product-line">
            <div class="product-name">{{ $detail->product->name }}</div>
            <div class="product-details">
                <div class="product-qty">{{ number_format($detail->quantity, 0) }} x</div>
                <div class="product-price">{{ $settings->currency_symbol }}{{ number_format($detail->unit_price, 2) }}</div>
                <div class="product-total">{{ $settings->currency_symbol }}{{ number_format($detail->subtotal, 2) }}</div>
            </div>
        </div>
        @endforeach
    </div>

    <!-- Totals -->
    <div class="totals">
        <div class="total-line">
            <div class="total-label">SUBTOTAL:</div>
            <div class="total-value">{{ $settings->currency_symbol }} {{ number_format($sale->subtotal, 2) }}</div>
        </div>

        @if($sale->discount > 0)
        <div class="total-line">
            <div class="total-label">DESCUENTO:</div>
            <div class="total-value">-{{ $settings->currency_symbol }} {{ number_format($sale->discount, 2) }}</div>
        </div>
        @endif

        @if($sale->tax > 0)
        <div class="total-line">
            <div class="total-label">IGV ({{ $settings->igv_percentage ?? 18 }}%):</div>
            <div class="total-value">{{ $settings->currency_symbol }} {{ number_format($sale->tax, 2) }}</div>
        </div>
        @endif

        <div class="total-line total-final">
            <div class="total-label">TOTAL:</div>
            <div class="total-value">{{ $settings->currency_symbol }} {{ number_format($sale->total, 2) }}</div>
        </div>
    </div>

    <!-- Payment Details -->
    @if($sale->payment_type === 'contado')
    <div class="divider"></div>
    <div class="section">
        <div class="total-line">
            <div class="total-label">Efectivo:</div>
            <div class="total-value">{{ $settings->currency_symbol }} {{ number_format($sale->amount_paid, 2) }}</div>
        </div>
        @if($sale->change_amount > 0)
        <div class="total-line">
            <div class="total-label">Vuelto:</div>
            <div class="total-value">{{ $settings->currency_symbol }} {{ number_format($sale->change_amount, 2) }}</div>
        </div>
        @endif
    </div>
    @endif

    @if($sale->payment_type === 'credito')
    <div class="divider"></div>
    <div class="section">
        <div class="section-title">CREDITO:</div>
        <div class="info-line">Plazo: {{ $sale->credit_days }} dias</div>
        <div class="info-line">Cuotas: {{ $sale->installments }}</div>
        <div class="info-line">Pago Inicial: {{ $settings->currency_symbol }}{{ number_format($sale->initial_payment ?? 0, 2) }}</div>
        <div class="info-line">Saldo: {{ $settings->currency_symbol }}{{ number_format($sale->remaining_balance ?? 0, 2) }}</div>
    </div>
    @endif

    <!-- Notes -->
    @if($sale->notes)
    <div class="divider"></div>
    <div class="section">
        <div class="section-title">OBSERVACIONES:</div>
        <div class="info-line">{{ $sale->notes }}</div>
    </div>
    @endif

    <!-- Status -->
    <div class="divider"></div>
    <div class="status">
        ESTADO: {{ strtoupper($sale->status) }}
    </div>

    <!-- Footer -->
    <div class="footer">
        @if($settings->invoice_footer)
        <div style="margin-bottom: 4px;">{{ $settings->invoice_footer }}</div>
        @endif

        @if($settings->invoice_notes)
        <div style="margin-bottom: 4px; font-size: 6px;">{{ $settings->invoice_notes }}</div>
        @endif

        <div style="margin-top: 6px;">
            ================================
        </div>
        <div style="margin-top: 4px;">GRACIAS POR SU COMPRA</div>
        <div style="margin-top: 2px; font-size: 6px;">
            {{ \Carbon\Carbon::now()->format(($settings->date_format ?? 'd/m/Y') . ' ' . ($settings->time_format ?? 'H:i:s')) }}
        </div>
    </div>
</body>
</html>
