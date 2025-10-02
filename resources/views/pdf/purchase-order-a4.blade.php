<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orden de Compra {{ $order->order_number }}</title>
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
            border: 2px solid #2563eb;
            padding: 8px;
            text-align: center;
            display: inline-block;
            min-width: 160px;
            background-color: #eff6ff;
        }

        .document-type {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 4px;
            color: #2563eb;
        }

        .document-number {
            font-size: 14px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            color: #1e40af;
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

        .notes-section {
            clear: both;
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

        .status-pendiente { background-color: #fef3c7; color: #92400e; }
        .status-parcial { background-color: #dbeafe; color: #1e40af; }
        .status-recibido { background-color: #d1fae5; color: #065f46; }
        .status-cancelado { background-color: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
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
                <strong>Sucursal:</strong> {{ $order->branch->name }}
            </div>
        </div>
        <div class="header-right">
            <div class="document-box">
                <div class="document-type">ORDEN DE COMPRA</div>
                <div class="document-number">{{ $order->order_number }}</div>
            </div>
        </div>
    </div>

    <!-- Supplier and Order Info -->
    <div class="info-section">
        <div class="info-left">
            <div class="info-block">
                <div class="info-title">PROVEEDOR</div>
                <div class="info-row">
                    <span class="info-label">RUC:</span>
                    <span class="info-value">{{ $order->supplier->ruc }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Razón Social:</span>
                    <span class="info-value">{{ $order->supplier->name }}</span>
                </div>
                @if($order->supplier->contact_name)
                <div class="info-row">
                    <span class="info-label">Contacto:</span>
                    <span class="info-value">{{ $order->supplier->contact_name }}</span>
                </div>
                @endif
                @if($order->supplier->phone)
                <div class="info-row">
                    <span class="info-label">Teléfono:</span>
                    <span class="info-value">{{ $order->supplier->phone }}</span>
                </div>
                @endif
                @if($order->supplier->email)
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{{ $order->supplier->email }}</span>
                </div>
                @endif
            </div>
        </div>
        <div class="info-right">
            <div class="info-block">
                <div class="info-title">DATOS DE LA ORDEN</div>
                <div class="info-row">
                    <span class="info-label">Fecha Emisión:</span>
                    <span class="info-value">{{ \Carbon\Carbon::parse($order->order_date)->format($settings->date_format ?? 'd/m/Y') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fecha Esperada:</span>
                    <span class="info-value">{{ $order->expected_date ? \Carbon\Carbon::parse($order->expected_date)->format($settings->date_format ?? 'd/m/Y') : 'No especificada' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Usuario:</span>
                    <span class="info-value">{{ $order->user->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Estado:</span>
                    <span class="status-badge status-{{ $order->status }}">
                        {{ strtoupper($order->status) }}
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
                <th style="width: 35%;">DESCRIPCIÓN</th>
                <th style="width: 10%;" class="text-center">CANT. PEDIDA</th>
                <th style="width: 10%;" class="text-center">CANT. RECIBIDA</th>
                <th style="width: 15%;" class="text-right">P. COMPRA</th>
                <th style="width: 20%;" class="text-right">SUBTOTAL</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->details as $detail)
            <tr>
                <td>{{ $detail->product->code }}</td>
                <td>
                    {{ $detail->product->name }}
                    @if($detail->product->brand)
                    <br><small style="color: #666;">{{ $detail->product->brand->name }}</small>
                    @endif
                </td>
                <td class="text-center">{{ number_format($detail->quantity, 0) }}</td>
                <td class="text-center">{{ number_format($detail->quantity_received ?? 0, 0) }}</td>
                <td class="text-right">{{ $settings->currency_symbol }} {{ number_format($detail->purchase_price, $settings->price_decimals ?? 2) }}</td>
                <td class="text-right">{{ $settings->currency_symbol }} {{ number_format($detail->subtotal, $settings->price_decimals ?? 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
        <div class="totals-row">
            <div class="totals-label">SUBTOTAL:</div>
            <div class="totals-value">{{ $settings->currency_symbol }} {{ number_format($order->subtotal, $settings->price_decimals ?? 2) }}</div>
        </div>

        @if($order->tax > 0)
        <div class="totals-row">
            <div class="totals-label">IGV ({{ $settings->igv_percentage ?? 18 }}%):</div>
            <div class="totals-value">{{ $settings->currency_symbol }} {{ number_format($order->tax, $settings->price_decimals ?? 2) }}</div>
        </div>
        @endif

        <div class="totals-row total-final">
            <div class="totals-label">TOTAL:</div>
            <div class="totals-value">{{ $settings->currency_symbol }} {{ number_format($order->total, $settings->price_decimals ?? 2) }}</div>
        </div>
    </div>

    <div style="clear: both;"></div>

    <!-- Notes -->
    @if($order->notes)
    <div class="notes-section">
        <strong>OBSERVACIONES:</strong> {{ $order->notes }}
    </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <p>Documento generado el {{ \Carbon\Carbon::now()->format(($settings->date_format ?? 'd/m/Y') . ' ' . ($settings->time_format ?? 'H:i')) }}</p>
        <p style="margin-top: 5px;">{{ $settings->company_name ?? config('app.name') }}</p>
    </div>
</body>
</html>
