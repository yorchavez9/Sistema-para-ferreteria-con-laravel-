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
            font-size: {{ $config['fontSize'] }};
            line-height: 1.4;
            color: #333;
        }

        .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 15px;
        }

        .header {
            display: table;
            width: 100%;
            margin-bottom: 15px;
            border-bottom: 2px solid #333;
            padding-bottom: 12px;
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

        .company-logo {
            max-width: 120px;
            max-height: 80px;
            margin-bottom: 8px;
        }

        .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 4px;
            color: #2563eb;
        }

        .company-info {
            font-size: 9px;
            color: #666;
            margin-bottom: 2px;
        }

        .document-box {
            border: 2px solid #333;
            padding: 8px;
            text-align: center;
            display: inline-block;
            min-width: 140px;
        }

        .document-type {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 4px;
        }

        .document-number {
            font-size: 14px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            color: #2563eb;
        }

        .info-section {
            display: table;
            width: 100%;
            margin-bottom: 12px;
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
            padding-left: 12px;
        }

        .info-block {
            margin-bottom: 12px;
        }

        .info-title {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 6px;
            color: #2563eb;
            border-bottom: 1px solid #ddd;
            padding-bottom: 2px;
        }

        .info-row {
            margin-bottom: 3px;
        }

        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 110px;
        }

        .info-value {
            display: inline-block;
        }

        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }

        .products-table thead {
            background-color: #2563eb;
            color: white;
        }

        .products-table th {
            padding: 6px;
            text-align: left;
            font-size: 10px;
            font-weight: bold;
        }

        .products-table td {
            padding: 5px 6px;
            border-bottom: 1px solid #ddd;
            font-size: 9px;
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
            width: 280px;
            margin-top: 8px;
        }

        .totals-row {
            display: table;
            width: 100%;
            margin-bottom: 4px;
        }

        .totals-label {
            display: table-cell;
            text-align: right;
            padding-right: 12px;
            font-weight: bold;
        }

        .totals-value {
            display: table-cell;
            text-align: right;
            width: 110px;
        }

        .total-final {
            border-top: 2px solid #333;
            padding-top: 6px;
            margin-top: 6px;
            font-size: 12px;
        }

        .total-final .totals-label,
        .total-final .totals-value {
            font-size: 12px;
            color: #2563eb;
        }

        .payment-info {
            clear: both;
            margin-top: 15px;
            padding-top: 12px;
            border-top: 1px solid #ddd;
        }

        .notes-section {
            margin-top: 15px;
            padding: 8px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 3px;
            font-size: 9px;
        }

        .footer {
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1px solid #ddd;
            font-size: 8px;
            color: #666;
            text-align: center;
        }

        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
        }

        .status-pagado { background-color: #22c55e; color: white; }
        .status-pendiente { background-color: #f59e0b; color: white; }
        .status-anulado { background-color: #ef4444; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                @if($settings->company_logo)
                    <img src="{{ public_path('storage/' . $settings->company_logo) }}" alt="Logo" class="company-logo">
                @endif
                <div class="company-name">{{ strtoupper($settings->company_name ?? config('app.name')) }}</div>
                <div class="company-info">RUC: {{ $settings->company_ruc ?? 'N/A' }}</div>
                <div class="company-info">{{ $settings->company_address ?? 'Dirección no configurada' }}</div>
                <div class="company-info">Tel: {{ $settings->company_phone ?? 'N/A' }} | Email: {{ $settings->company_email ?? 'N/A' }}</div>
                <div class="company-info" style="margin-top: 6px;">
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
                        <span class="info-label">{{ $sale->document_type === 'factura' ? 'Razón Social:' : 'Nombres:' }}</span>
                        <span class="info-value">{{ $sale->customer->name }}</span>
                    </div>
                    @if($sale->customer->address)
                    <div class="info-row">
                        <span class="info-label">Dirección:</span>
                        <span class="info-value">{{ $sale->customer->address }}</span>
                    </div>
                    @endif
                </div>
            </div>
            <div class="info-right">
                <div class="info-block">
                    <div class="info-title">DATOS DE LA VENTA</div>
                    <div class="info-row">
                        <span class="info-label">Fecha:</span>
                        <span class="info-value">{{ \Carbon\Carbon::parse($sale->sale_date)->format($settings->date_format ?? 'd/m/Y') }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tipo de Pago:</span>
                        <span class="info-value" style="font-weight: bold; color: {{ $sale->payment_type === 'credito' ? '#f97316' : '#2563eb' }};">
                            {{ $sale->payment_type === 'credito' ? 'A CRÉDITO' : 'AL CONTADO' }}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Vendedor:</span>
                        <span class="info-value">{{ $sale->user->name }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Estado:</span>
                        <span class="status-badge status-{{ $sale->status }}">{{ strtoupper($sale->status) }}</span>
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
                    <th style="width: 10%;" class="text-center">CANT.</th>
                    <th style="width: 15%;" class="text-right">P. UNIT.</th>
                    <th style="width: 15%;" class="text-right">SUBTOTAL</th>
                </tr>
            </thead>
            <tbody>
                @foreach($sale->details as $detail)
                <tr>
                    <td>{{ $detail->product->code }}</td>
                    <td>{{ $detail->product->name }}</td>
                    <td class="text-center">{{ number_format($detail->quantity, 0) }}</td>
                    <td class="text-right">{{ $settings->currency_symbol }} {{ number_format($detail->unit_price, $settings->price_decimals ?? 2) }}</td>
                    <td class="text-right">{{ $settings->currency_symbol }} {{ number_format($detail->subtotal, $settings->price_decimals ?? 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section">
            <div class="totals-row">
                <div class="totals-label">SUBTOTAL:</div>
                <div class="totals-value">{{ $settings->currency_symbol }} {{ number_format($sale->subtotal, $settings->price_decimals ?? 2) }}</div>
            </div>

            @if($sale->tax > 0)
            <div class="totals-row">
                <div class="totals-label">IGV ({{ $settings->igv_percentage ?? 18 }}%):</div>
                <div class="totals-value">{{ $settings->currency_symbol }} {{ number_format($sale->tax, $settings->price_decimals ?? 2) }}</div>
            </div>
            @endif

            @if($sale->discount > 0)
            <div class="totals-row">
                <div class="totals-label">DESCUENTO:</div>
                <div class="totals-value" style="color: #ef4444;">- {{ $settings->currency_symbol }} {{ number_format($sale->discount, $settings->price_decimals ?? 2) }}</div>
            </div>
            @endif

            <div class="totals-row total-final">
                <div class="totals-label">TOTAL:</div>
                <div class="totals-value">{{ $settings->currency_symbol }} {{ number_format($sale->total, $settings->price_decimals ?? 2) }}</div>
            </div>
        </div>

        <div style="clear: both;"></div>

        <!-- Notes -->
        @if($sale->notes)
        <div class="notes-section">
            <strong>OBSERVACIONES:</strong> {{ $sale->notes }}
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            @if($settings->invoice_footer)
                <p>{{ $settings->invoice_footer }}</p>
            @endif
            @if($settings->invoice_notes)
                <p style="margin-top: 5px;">{{ $settings->invoice_notes }}</p>
            @endif
            <p style="margin-top: 8px;">Documento generado el {{ \Carbon\Carbon::now()->format(($settings->date_format ?? 'd/m/Y') . ' ' . ($settings->time_format ?? 'H:i')) }}</p>
        </div>
    </div>
</body>
</html>
