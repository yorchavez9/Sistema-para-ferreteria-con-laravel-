<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>TICKET {{ $sale->sale_number }}</title>
    <style>
        @page {
            margin: 0;
            padding: 0;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: {{ $config['fontSize'] ?? '9px' }};
            line-height: 1.3;
            color: #000;
            width: {{ $config['width'] ?? '72mm' }};
            margin: 0 auto;
            padding: {{ $config['padding'] ?? '3mm' }};
            background: #fff;
        }

        .ticket-container {
            width: 100%;
            max-width: 100%;
        }

        /* Header Styles */
        .header {
            text-align: center;
            margin-bottom: 5mm;
            padding-bottom: 3mm;
            border-bottom: 1px dashed #000;
        }

        .company-logo {
            text-align: center;
            margin-bottom: 2mm;
        }

        .company-logo img {
            max-width: {{ $config['logoWidth'] ?? '40mm' }};
            max-height: {{ $config['logoHeight'] ?? '15mm' }};
            object-fit: contain;
        }

        .company-name {
            font-size: {{ $config['titleSize'] ?? '11px' }};
            font-weight: bold;
            margin-bottom: 1mm;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .company-info {
            font-size: {{ $config['infoSize'] ?? '8px' }};
            line-height: 1.4;
            margin-bottom: 0.5mm;
        }

        .document-type {
            font-size: {{ $config['docTypeSize'] ?? '10px' }};
            font-weight: bold;
            margin-top: 2mm;
            text-transform: uppercase;
        }

        .document-number {
            font-size: {{ $config['docNumberSize'] ?? '9px' }};
            font-weight: bold;
            margin-top: 1mm;
        }

        /* Divider */
        .divider {
            border-top: 1px dashed #000;
            margin: 3mm 0;
            height: 0;
        }

        .divider-solid {
            border-top: 1px solid #000;
            margin: 2mm 0;
            height: 0;
        }

        /* Section Styles */
        .section {
            margin-bottom: 3mm;
        }

        .section-title {
            font-weight: bold;
            font-size: {{ $config['sectionSize'] ?? '8px' }};
            margin-bottom: 1mm;
            text-transform: uppercase;
        }

        .info-line {
            font-size: {{ $config['textSize'] ?? '8px' }};
            line-height: 1.4;
            margin-bottom: 0.5mm;
            word-wrap: break-word;
        }

        /* Products Table */
        .products-table {
            width: 100%;
            margin: 2mm 0;
        }

        .products-header {
            font-weight: bold;
            font-size: {{ $config['tableHeaderSize'] ?? '8px' }};
            border-bottom: 1px solid #000;
            padding-bottom: 1mm;
            margin-bottom: 2mm;
            display: flex;
            justify-content: space-between;
        }

        .col-product { flex: 1; }
        .col-qty { width: 15mm; text-align: center; }
        .col-price { width: 18mm; text-align: right; }
        .col-total { width: 20mm; text-align: right; }

        .product-item {
            margin-bottom: 2mm;
            font-size: {{ $config['productSize'] ?? '8px' }};
        }

        .product-name {
            font-weight: bold;
            margin-bottom: 0.5mm;
            word-wrap: break-word;
        }

        .product-detail {
            display: flex;
            justify-content: space-between;
            align-items: center;
            line-height: 1.3;
        }

        .product-qty-info { flex: 1; }
        .product-price-info { width: 18mm; text-align: right; }
        .product-total-info { width: 20mm; text-align: right; font-weight: bold; }

        /* Totals */
        .totals-section {
            margin-top: 3mm;
            padding-top: 2mm;
            border-top: 1px dashed #000;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            font-size: {{ $config['totalSize'] ?? '8px' }};
            margin-bottom: 1mm;
            line-height: 1.4;
        }

        .total-label {
            font-weight: bold;
            text-align: left;
        }

        .total-value {
            text-align: right;
            min-width: 25mm;
        }

        .total-final {
            font-size: {{ $config['totalFinalSize'] ?? '10px' }};
            font-weight: bold;
            margin-top: 2mm;
            padding-top: 2mm;
            border-top: 2px solid #000;
        }

        /* Status Badge */
        .status-badge {
            text-align: center;
            font-weight: bold;
            font-size: {{ $config['statusSize'] ?? '8px' }};
            padding: 2mm;
            margin: 3mm 0;
            border: 1px solid #000;
            text-transform: uppercase;
        }

        /* Footer */
        .footer {
            margin-top: 4mm;
            padding-top: 3mm;
            border-top: 1px dashed #000;
            text-align: center;
            font-size: {{ $config['footerSize'] ?? '7px' }};
        }

        .footer-line {
            margin-bottom: 1mm;
        }

        .footer-separator {
            margin: 2mm 0;
            font-size: {{ $config['footerSize'] ?? '7px' }};
        }

        .footer-thanks {
            font-weight: bold;
            font-size: {{ $config['thanksSize'] ?? '8px' }};
            margin: 2mm 0;
            text-transform: uppercase;
        }

        /* QR Code */
        .qr-code {
            text-align: center;
            margin: 3mm 0;
        }

        .qr-code img {
            width: {{ $config['qrSize'] ?? '30mm' }};
            height: {{ $config['qrSize'] ?? '30mm' }};
            margin: 0 auto;
        }

        /* Utility Classes */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }

        /* Prevent page breaks */
        .product-item,
        .total-row,
        .section {
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    <div class="ticket-container">
        <!-- Header -->
        <div class="header">
            @if($settings->company_logo)
            <div class="company-logo">
                <img src="{{ public_path('storage/' . $settings->company_logo) }}" alt="Logo">
            </div>
            @endif
            <div class="company-name">{{ strtoupper($settings->company_name ?? config('app.name')) }}</div>
            <div class="company-info">RUC: {{ $settings->company_ruc ?? 'N/A' }}</div>
            @if($settings->company_address)
            <div class="company-info">{{ $settings->company_address }}</div>
            @endif
            @if($settings->company_phone)
            <div class="company-info">Tel: {{ $settings->company_phone }}</div>
            @endif
            @if($settings->company_email)
            <div class="company-info">{{ $settings->company_email }}</div>
            @endif
            <div class="company-info" style="margin-top: 1mm;">Sucursal: {{ $sale->branch->name }}</div>

            <div class="document-type">
                @if($sale->document_type === 'factura')
                    FACTURA ELECTRONICA
                @elseif($sale->document_type === 'boleta')
                    BOLETA DE VENTA
                @else
                    NOTA DE VENTA
                @endif
            </div>
            <div class="document-number">{{ $sale->sale_number }}</div>
        </div>

        <!-- Customer Info -->
        <div class="section">
            <div class="section-title">Cliente:</div>
            <div class="info-line"><strong>{{ $sale->customer->document_type }}:</strong> {{ $sale->customer->document_number }}</div>
            <div class="info-line"><strong>Nombre:</strong> {{ $sale->customer->name }}</div>
            @if($sale->customer->address)
            <div class="info-line"><strong>Direcc:</strong> {{ $sale->customer->address }}</div>
            @endif
        </div>

        <div class="divider"></div>

        <!-- Sale Info -->
        <div class="section">
            <div class="info-line"><strong>Fecha:</strong> {{ \Carbon\Carbon::parse($sale->sale_date)->format(($settings->date_format ?? 'd/m/Y') . ' ' . ($settings->time_format ?? 'H:i')) }}</div>
            <div class="info-line"><strong>Vendedor:</strong> {{ $sale->user->name }}</div>
            <div class="info-line"><strong>Pago:</strong> {{ $sale->payment_type === 'credito' ? 'CREDITO' : 'CONTADO' }}</div>
            <div class="info-line"><strong>Metodo:</strong> {{ strtoupper($sale->payment_method) }}</div>
        </div>

        <div class="divider"></div>

        <!-- Products -->
        <div class="products-table">
            <div class="products-header">
                <div class="col-product">PRODUCTO</div>
                <div class="col-qty">CANT</div>
                <div class="col-total">TOTAL</div>
            </div>

            @foreach($sale->details as $detail)
            <div class="product-item">
                <div class="product-name">{{ $detail->product->name }}</div>
                <div class="product-detail">
                    <div class="product-qty-info">
                        {{ number_format($detail->quantity, 0) }} x {{ $settings->currency_symbol }}{{ number_format($detail->unit_price, 2) }}
                    </div>
                    <div class="product-total-info">
                        {{ $settings->currency_symbol }}{{ number_format($detail->subtotal, 2) }}
                    </div>
                </div>
            </div>
            @endforeach
        </div>

        <!-- Totals -->
        <div class="totals-section">
            <div class="total-row">
                <div class="total-label">SUBTOTAL:</div>
                <div class="total-value">{{ $settings->currency_symbol }} {{ number_format($sale->subtotal, 2) }}</div>
            </div>

            @if($sale->discount > 0)
            <div class="total-row">
                <div class="total-label">DESCUENTO:</div>
                <div class="total-value">-{{ $settings->currency_symbol }} {{ number_format($sale->discount, 2) }}</div>
            </div>
            @endif

            @if($sale->tax > 0)
            <div class="total-row">
                <div class="total-label">IGV ({{ $settings->igv_percentage ?? 18 }}%):</div>
                <div class="total-value">{{ $settings->currency_symbol }} {{ number_format($sale->tax, 2) }}</div>
            </div>
            @endif

            <div class="total-row total-final">
                <div class="total-label">TOTAL:</div>
                <div class="total-value">{{ $settings->currency_symbol }} {{ number_format($sale->total, 2) }}</div>
            </div>
        </div>

        <!-- Payment Details -->
        @if($sale->payment_type === 'contado')
        <div class="divider"></div>
        <div class="section">
            <div class="total-row">
                <div class="total-label">Efectivo:</div>
                <div class="total-value">{{ $settings->currency_symbol }} {{ number_format($sale->amount_paid, 2) }}</div>
            </div>
            @if($sale->change_amount > 0)
            <div class="total-row">
                <div class="total-label">Vuelto:</div>
                <div class="total-value">{{ $settings->currency_symbol }} {{ number_format($sale->change_amount, 2) }}</div>
            </div>
            @endif
        </div>
        @endif

        <!-- Credit Info -->
        @if($sale->payment_type === 'credito')
        <div class="divider"></div>
        <div class="section">
            <div class="section-title">Informacion de Credito:</div>
            <div class="info-line"><strong>Plazo:</strong> {{ $sale->credit_days }} dias</div>
            <div class="info-line"><strong>Cuotas:</strong> {{ $sale->installments }}</div>
            <div class="info-line"><strong>Inicial:</strong> {{ $settings->currency_symbol }}{{ number_format($sale->initial_payment ?? 0, 2) }}</div>
            <div class="info-line"><strong>Saldo:</strong> {{ $settings->currency_symbol }}{{ number_format($sale->remaining_balance ?? 0, 2) }}</div>
        </div>
        @endif

        <!-- Notes -->
        @if($sale->notes)
        <div class="divider"></div>
        <div class="section">
            <div class="section-title">Observaciones:</div>
            <div class="info-line">{{ $sale->notes }}</div>
        </div>
        @endif

        <!-- Status -->
        <div class="status-badge">
            ESTADO: {{ strtoupper($sale->status) }}
        </div>

        <!-- QR Code -->
        @if(isset($qrCode))
        <div class="qr-code">
            <img src="data:image/png;base64,{{ $qrCode }}" alt="QR Code">
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            @if($settings->invoice_footer)
            <div class="footer-line">{{ $settings->invoice_footer }}</div>
            @endif

            @if($settings->invoice_notes)
            <div class="footer-line" style="font-size: {{ $config['notesSize'] ?? '6px' }};">
                {{ $settings->invoice_notes }}
            </div>
            @endif

            <div class="footer-separator">================================</div>
            <div class="footer-thanks">¡Gracias por su compra!</div>
            <div class="footer-line" style="margin-top: 2mm;">
                {{ \Carbon\Carbon::now()->format(($settings->date_format ?? 'd/m/Y') . ' ' . ($settings->time_format ?? 'H:i:s')) }}
            </div>
        </div>
    </div>
</body>
</html>
