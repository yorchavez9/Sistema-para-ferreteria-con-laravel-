<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>COTIZACIÓN {{ $quote->quote_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Courier New', monospace;
            font-size: {{ $config['fontSize'] }};
            line-height: 1.3;
            color: #000;
            max-width: {{ $config['width'] }};
            margin: 0 auto;
            padding: 5mm;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .bold {
            font-weight: bold;
        }

        .header {
            text-align: center;
            margin-bottom: 8px;
            border-bottom: 1px dashed #000;
            padding-bottom: 6px;
        }

        .company-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 3px;
        }

        .company-info {
            font-size: 10px;
            margin-bottom: 2px;
        }

        .document-type {
            font-size: 12px;
            font-weight: bold;
            margin: 6px 0;
        }

        .document-number {
            font-size: 11px;
            font-weight: bold;
        }

        .validity-section {
            text-align: center;
            background-color: #f0f0f0;
            padding: 4px;
            margin: 6px 0;
            border: 1px solid #000;
        }

        .info-section {
            margin: 8px 0;
            font-size: 10px;
        }

        .info-row {
            margin-bottom: 3px;
        }

        .separator {
            border-top: 1px dashed #000;
            margin: 6px 0;
        }

        table {
            width: 100%;
            margin: 8px 0;
        }

        table th {
            text-align: left;
            border-bottom: 1px solid #000;
            padding: 3px 0;
            font-size: 10px;
        }

        table td {
            padding: 3px 0;
            font-size: 10px;
        }

        .totals {
            margin-top: 8px;
            border-top: 1px solid #000;
            padding-top: 6px;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            font-size: 10px;
        }

        .total-final {
            font-size: 12px;
            font-weight: bold;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 4px 0;
            margin-top: 4px;
        }

        .notes-section {
            margin-top: 8px;
            border: 1px dashed #000;
            padding: 4px;
            font-size: 9px;
        }

        .footer {
            text-align: center;
            margin-top: 10px;
            font-size: 9px;
            border-top: 1px dashed #000;
            padding-top: 6px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="company-name">{{ $settings->company_name }}</div>
        <div class="company-info">RUC: {{ $settings->company_ruc }}</div>
        <div class="company-info">{{ $settings->company_address }}</div>
        <div class="company-info">Tel: {{ $settings->company_phone }}</div>
        <div class="document-type">COTIZACIÓN</div>
        <div class="document-number">{{ $quote->quote_number }}</div>
    </div>

    <!-- Validity -->
    <div class="validity-section">
        <strong>VÁLIDA HASTA:</strong><br>
        {{ \Carbon\Carbon::parse($quote->expiration_date)->format('d/m/Y') }}
    </div>

    <!-- Quote Info -->
    <div class="info-section">
        <div class="info-row"><strong>Fecha:</strong> {{ \Carbon\Carbon::parse($quote->quote_date)->format('d/m/Y H:i') }}</div>
        <div class="info-row"><strong>Sucursal:</strong> {{ $quote->branch->name }}</div>
        <div class="info-row"><strong>Vendedor:</strong> {{ $quote->user->name }}</div>
    </div>

    <div class="separator"></div>

    <!-- Customer Info -->
    <div class="info-section">
        @if($quote->customer)
            <div class="info-row"><strong>Cliente:</strong> {{ $quote->customer->name }}</div>
            <div class="info-row"><strong>{{ strtoupper($quote->customer->document_type) }}:</strong> {{ $quote->customer->document_number }}</div>
        @else
            <div class="info-row"><strong>Cliente:</strong> SIN CLIENTE</div>
        @endif
    </div>

    <div class="separator"></div>

    <!-- Products -->
    <table>
        <thead>
            <tr>
                <th>Cant</th>
                <th>Producto</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($quote->details as $detail)
                <tr>
                    <td>{{ $detail->quantity }}</td>
                    <td>
                        <div>{{ $detail->product->name }}</div>
                        <div style="font-size: 9px;">{{ $detail->product->code }}</div>
                        <div style="font-size: 9px;">S/ {{ number_format($detail->unit_price, 2) }} c/u</div>
                    </td>
                    <td style="text-align: right;">S/ {{ number_format($detail->subtotal, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>S/ {{ number_format($quote->subtotal, 2) }}</span>
        </div>
        @if($quote->tax > 0)
            <div class="total-row">
                <span>IGV (18%):</span>
                <span>S/ {{ number_format($quote->tax, 2) }}</span>
            </div>
        @endif
        @if($quote->discount > 0)
            <div class="total-row">
                <span>Descuento:</span>
                <span>- S/ {{ number_format($quote->discount, 2) }}</span>
            </div>
        @endif
        <div class="total-final">
            <div class="total-row">
                <span>TOTAL:</span>
                <span>S/ {{ number_format($quote->total, 2) }}</span>
            </div>
        </div>
    </div>

    <!-- Notes -->
    @if($quote->notes)
        <div class="notes-section">
            <div style="font-weight: bold; margin-bottom: 3px;">NOTAS:</div>
            <div>{{ $quote->notes }}</div>
        </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <p>ESTO ES UNA COTIZACIÓN</p>
        <p>NO TIENE VALOR FISCAL</p>
        <p style="margin-top: 4px;">{{ $settings->company_email }}</p>
        <p style="margin-top: 6px;">Gracias por su preferencia</p>
    </div>
</body>
</html>
