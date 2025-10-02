<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ORDEN {{ $order->order_number }}</title>
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
            width: 20%;
        }

        .product-received {
            display: table-cell;
            width: 25%;
        }

        .product-price {
            display: table-cell;
            width: 25%;
            text-align: right;
        }

        .product-total {
            display: table-cell;
            width: 30%;
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
        <div class="company-info" style="margin-top: 3px;">Sucursal: {{ $order->branch->name }}</div>

        <div class="document-type">ORDEN DE COMPRA</div>
        <div class="document-number">{{ $order->order_number }}</div>
    </div>

    <!-- Supplier Info -->
    <div class="section">
        <div class="section-title">PROVEEDOR:</div>
        <div class="info-line">RUC: {{ $order->supplier->ruc }}</div>
        <div class="info-line">{{ $order->supplier->name }}</div>
        @if($order->supplier->contact_name)
        <div class="info-line">Contacto: {{ $order->supplier->contact_name }}</div>
        @endif
        @if($order->supplier->phone)
        <div class="info-line">Tel: {{ $order->supplier->phone }}</div>
        @endif
    </div>

    <div class="divider"></div>

    <!-- Order Info -->
    <div class="section">
        <div class="info-line">Fecha: {{ \Carbon\Carbon::parse($order->order_date)->format($settings->date_format ?? 'd/m/Y') }}</div>
        @if($order->expected_date)
        <div class="info-line">Esperado: {{ \Carbon\Carbon::parse($order->expected_date)->format($settings->date_format ?? 'd/m/Y') }}</div>
        @endif
        <div class="info-line">Usuario: {{ $order->user->name }}</div>
    </div>

    <div class="divider"></div>

    <!-- Products -->
    <div class="section">
        <div class="product-header">
            <div style="display: table; width: 100%;">
                <div style="display: table-cell; width: 55%;">PRODUCTO</div>
                <div style="display: table-cell; width: 15%; text-align: center;">PED</div>
                <div style="display: table-cell; width: 30%; text-align: right;">TOTAL</div>
            </div>
        </div>

        @foreach($order->details as $detail)
        <div class="product-line">
            <div class="product-name">{{ $detail->product->name }}</div>
            <div class="product-details">
                <div class="product-qty">{{ number_format($detail->quantity, 0) }} x</div>
                <div class="product-price">{{ $settings->currency_symbol }}{{ number_format($detail->purchase_price, 2) }}</div>
                <div class="product-total">{{ $settings->currency_symbol }}{{ number_format($detail->subtotal, 2) }}</div>
            </div>
            @if($detail->quantity_received > 0)
            <div style="font-size: 6px; margin-left: 10px;">Recibido: {{ $detail->quantity_received }}</div>
            @endif
        </div>
        @endforeach
    </div>

    <!-- Totals -->
    <div class="totals">
        <div class="total-line">
            <div class="total-label">SUBTOTAL:</div>
            <div class="total-value">{{ $settings->currency_symbol }} {{ number_format($order->subtotal, 2) }}</div>
        </div>

        @if($order->tax > 0)
        <div class="total-line">
            <div class="total-label">IGV ({{ $settings->igv_percentage ?? 18 }}%):</div>
            <div class="total-value">{{ $settings->currency_symbol }} {{ number_format($order->tax, 2) }}</div>
        </div>
        @endif

        <div class="total-line total-final">
            <div class="total-label">TOTAL:</div>
            <div class="total-value">{{ $settings->currency_symbol }} {{ number_format($order->total, 2) }}</div>
        </div>
    </div>

    <!-- Notes -->
    @if($order->notes)
    <div class="divider"></div>
    <div class="section">
        <div class="section-title">OBSERVACIONES:</div>
        <div class="info-line">{{ $order->notes }}</div>
    </div>
    @endif

    <!-- Status -->
    <div class="divider"></div>
    <div class="status">
        ESTADO: {{ strtoupper($order->status) }}
    </div>

    <!-- Footer -->
    <div class="footer">
        <div style="margin-top: 6px;">
            ================================
        </div>
        <div style="margin-top: 4px;">{{ $settings->company_name ?? config('app.name') }}</div>
        <div style="margin-top: 2px; font-size: 6px;">
            {{ \Carbon\Carbon::now()->format(($settings->date_format ?? 'd/m/Y') . ' ' . ($settings->time_format ?? 'H:i:s')) }}
        </div>
    </div>
</body>
</html>
