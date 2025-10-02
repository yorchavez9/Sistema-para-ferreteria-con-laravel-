<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>COTIZACIÓN {{ $quote->quote_number }}</title>
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

        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            font-weight: bold;
            color: rgba(0, 0, 0, 0.05);
            z-index: -1;
        }

        .header {
            display: table;
            width: 100%;
            margin-bottom: 15px;
            border-bottom: 2px solid #2563eb;
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
            min-width: 140px;
            background-color: #eff6ff;
        }

        .document-type {
            font-size: 12px;
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
        }

        .info-block {
            background-color: #f9fafb;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 8px;
        }

        .info-title {
            font-size: 10px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 6px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
        }

        .info-row {
            display: table;
            width: 100%;
            margin-bottom: 4px;
        }

        .info-label {
            display: table-cell;
            font-size: 9px;
            color: #666;
            width: 40%;
        }

        .info-value {
            display: table-cell;
            font-size: 9px;
            font-weight: bold;
            width: 60%;
        }

        .validity-alert {
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
            padding: 8px;
            border-radius: 4px;
            text-align: center;
            margin-bottom: 12px;
        }

        .validity-alert strong {
            color: #92400e;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }

        thead th {
            background-color: #2563eb;
            color: white;
            padding: 8px 6px;
            font-size: 9px;
            font-weight: bold;
            text-align: left;
            border: 1px solid #1e40af;
        }

        tbody td {
            padding: 6px;
            font-size: 9px;
            border: 1px solid #e5e7eb;
        }

        tbody tr:nth-child(even) {
            background-color: #f9fafb;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .totals-section {
            display: table;
            width: 100%;
            margin-top: 15px;
        }

        .totals-left {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .totals-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals-table td {
            padding: 6px 10px;
            font-size: 10px;
        }

        .totals-table .total-row td {
            background-color: #2563eb;
            color: white;
            font-weight: bold;
            font-size: 12px;
            padding: 10px;
        }

        .notes-box {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 10px;
            min-height: 80px;
        }

        .notes-title {
            font-size: 10px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 6px;
        }

        .notes-content {
            font-size: 9px;
            color: #666;
            white-space: pre-wrap;
        }

        .footer {
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 8px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="watermark">COTIZACIÓN</div>

    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-left">
                @if($settings->company_logo)
                    <img src="{{ public_path($settings->company_logo) }}" alt="Logo" class="company-logo">
                @endif
                <div class="company-name">{{ $settings->company_name }}</div>
                <div class="company-info">RUC: {{ $settings->company_ruc }}</div>
                <div class="company-info">{{ $settings->company_address }}</div>
                <div class="company-info">Tel: {{ $settings->company_phone }} | Email: {{ $settings->company_email }}</div>
            </div>
            <div class="header-right">
                <div class="document-box">
                    <div class="document-type">COTIZACIÓN</div>
                    <div class="document-number">{{ $quote->quote_number }}</div>
                </div>
            </div>
        </div>

        <!-- Validity Alert -->
        <div class="validity-alert">
            <strong>Válida hasta:</strong> {{ \Carbon\Carbon::parse($quote->expiration_date)->format('d/m/Y') }}
        </div>

        <!-- Info Section -->
        <div class="info-section">
            <div class="info-left">
                <div class="info-block">
                    <div class="info-title">DATOS DEL CLIENTE</div>
                    @if($quote->customer)
                        <div class="info-row">
                            <div class="info-label">Cliente:</div>
                            <div class="info-value">{{ $quote->customer->name }}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">{{ strtoupper($quote->customer->document_type) }}:</div>
                            <div class="info-value">{{ $quote->customer->document_number }}</div>
                        </div>
                    @else
                        <div class="info-row">
                            <div class="info-label">Cliente:</div>
                            <div class="info-value">SIN CLIENTE</div>
                        </div>
                    @endif
                </div>
            </div>
            <div class="info-right">
                <div class="info-block">
                    <div class="info-title">DATOS DE LA COTIZACIÓN</div>
                    <div class="info-row">
                        <div class="info-label">Fecha:</div>
                        <div class="info-value">{{ \Carbon\Carbon::parse($quote->quote_date)->format('d/m/Y') }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Sucursal:</div>
                        <div class="info-value">{{ $quote->branch->name }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Vendedor:</div>
                        <div class="info-value">{{ $quote->user->name }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Products Table -->
        <table>
            <thead>
                <tr>
                    <th style="width: 8%;">Cant.</th>
                    <th style="width: 12%;">Código</th>
                    <th style="width: 50%;">Descripción</th>
                    <th style="width: 15%;" class="text-right">P. Unit.</th>
                    <th style="width: 15%;" class="text-right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($quote->details as $detail)
                    <tr>
                        <td class="text-center">{{ $detail->quantity }}</td>
                        <td>{{ $detail->product->code }}</td>
                        <td>{{ $detail->product->name }}</td>
                        <td class="text-right">S/ {{ number_format($detail->unit_price, 2) }}</td>
                        <td class="text-right">S/ {{ number_format($detail->subtotal, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals and Notes Section -->
        <div class="totals-section">
            <div class="totals-left">
                @if($quote->notes)
                    <div class="notes-box">
                        <div class="notes-title">NOTAS / OBSERVACIONES</div>
                        <div class="notes-content">{{ $quote->notes }}</div>
                    </div>
                @endif
            </div>
            <div class="totals-right">
                <table class="totals-table">
                    <tr>
                        <td>Subtotal:</td>
                        <td class="text-right">S/ {{ number_format($quote->subtotal, 2) }}</td>
                    </tr>
                    @if($quote->tax > 0)
                        <tr>
                            <td>IGV (18%):</td>
                            <td class="text-right">S/ {{ number_format($quote->tax, 2) }}</td>
                        </tr>
                    @endif
                    @if($quote->discount > 0)
                        <tr>
                            <td>Descuento:</td>
                            <td class="text-right">- S/ {{ number_format($quote->discount, 2) }}</td>
                        </tr>
                    @endif
                    <tr class="total-row">
                        <td>TOTAL:</td>
                        <td class="text-right">S/ {{ number_format($quote->total, 2) }}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Este documento es una cotización y no tiene valor fiscal.</p>
            <p>Para convertir en compra, contactar a {{ $settings->company_phone }} | {{ $settings->company_email }}</p>
            <p style="margin-top: 8px;">Gracias por su preferencia</p>
        </div>
    </div>
</body>
</html>
