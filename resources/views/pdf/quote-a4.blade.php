<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Cotizacion {{ $quote->quote_number }}</title>
    <style>
        @page {
            margin: 10mm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica', Arial, sans-serif;
            font-size: 10px;
            line-height: 1.5;
            color: #222;
        }

        .page-frame {
            border: 1px solid #bbb;
            padding: 20px 22px;
        }

        /* ── Header ── */
        .header {
            padding-bottom: 12px;
            margin-bottom: 14px;
            border-bottom: 2px solid #222;
        }

        .header-tbl {
            width: 100%;
            border-collapse: collapse;
        }

        .header-tbl td {
            border: none;
            padding: 0;
            vertical-align: middle;
        }

        .logo-img {
            max-width: 65px;
            max-height: 55px;
        }

        .brand-name {
            font-size: 16px;
            font-weight: bold;
            color: #111;
            margin-bottom: 2px;
        }

        .brand-detail {
            font-size: 9px;
            color: #555;
            line-height: 1.6;
        }

        .doc-badge {
            border: 2px solid #222;
            padding: 8px 16px;
            text-align: center;
        }

        .doc-label {
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #333;
            margin-bottom: 3px;
        }

        .doc-number {
            font-size: 13px;
            font-weight: bold;
            color: #111;
            font-family: 'Courier New', monospace;
        }

        /* ── Validity ── */
        .validity-strip {
            background-color: #f3f3f3;
            border: 1px solid #ccc;
            padding: 6px 12px;
            margin-bottom: 14px;
            font-size: 10px;
            text-align: center;
        }

        .validity-strip strong {
            color: #111;
        }

        /* ── Info cards ── */
        .info-cols {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }

        .info-cols > tbody > tr > td {
            width: 50%;
            vertical-align: top;
            border: none;
            padding: 0;
        }

        .info-card {
            border: 1px solid #ccc;
            padding: 10px 12px;
            margin: 0 3px;
        }

        .info-card-title {
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 1.5px;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 7px;
        }

        .field-tbl {
            width: 100%;
            border-collapse: collapse;
        }

        .field-tbl td {
            border: none;
            padding: 3px 0;
            font-size: 10px;
        }

        .field-lbl {
            color: #666;
            width: 34%;
        }

        .field-val {
            font-weight: bold;
            color: #222;
        }

        /* ── Products table ── */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }

        .items-table thead th {
            background-color: #222;
            color: #fff;
            padding: 7px 6px;
            font-size: 9px;
            font-weight: bold;
            text-align: left;
            letter-spacing: 0.5px;
            border: 1px solid #111;
        }

        .items-table tbody td {
            padding: 5px 6px;
            font-size: 10px;
            border-bottom: 1px solid #ddd;
            border-left: 1px solid #e8e8e8;
            border-right: 1px solid #e8e8e8;
            vertical-align: middle;
        }

        .items-table tbody tr:nth-child(even) {
            background-color: #f8f8f8;
        }

        .items-table tfoot td {
            padding: 7px 6px;
            font-size: 10px;
            font-weight: bold;
            border-top: 2px solid #222;
        }

        .img-thumb {
            width: 42px;
            height: 42px;
            object-fit: cover;
            border: 1px solid #ddd;
        }

        .img-empty {
            width: 42px;
            height: 42px;
            border: 1px dashed #ccc;
            background: #f5f5f5;
            text-align: center;
            line-height: 42px;
            font-size: 7px;
            color: #aaa;
        }

        .prod-name {
            font-weight: bold;
            color: #222;
        }

        .prod-code {
            font-size: 9px;
            color: #777;
            font-family: 'Courier New', monospace;
        }

        .text-right { text-align: right; }
        .text-center { text-align: center; }

        /* ── Totals & notes ── */
        .bottom-section {
            width: 100%;
            border-collapse: collapse;
        }

        .bottom-section > tbody > tr > td {
            border: none;
            padding: 0;
            vertical-align: top;
        }

        .notes-card {
            border: 1px solid #ccc;
            padding: 10px 12px;
        }

        .notes-heading {
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 1px;
            color: #333;
            margin-bottom: 5px;
        }

        .notes-body {
            font-size: 10px;
            color: #444;
            white-space: pre-wrap;
            line-height: 1.5;
        }

        .summary-tbl {
            width: 100%;
            border-collapse: collapse;
        }

        .summary-tbl td {
            padding: 6px 10px;
            font-size: 10px;
            border: none;
        }

        .summary-tbl .lbl {
            color: #555;
        }

        .summary-tbl .val {
            font-weight: bold;
            text-align: right;
            color: #222;
        }

        .summary-tbl .grand td {
            background-color: #222;
            color: #fff;
            font-weight: bold;
            font-size: 12px;
            padding: 8px 10px;
        }

        /* ── Watermark ── */
        .watermark {
            position: fixed;
            top: 30%;
            left: 50%;
            margin-left: -150px;
            width: 300px;
            text-align: center;
            z-index: -1;
            opacity: 0.04;
        }

        .watermark img {
            width: 280px;
            height: auto;
        }

        .watermark-text {
            position: fixed;
            top: 55%;
            left: 50%;
            margin-left: -200px;
            width: 400px;
            text-align: center;
            z-index: -1;
            font-size: 38px;
            font-weight: bold;
            color: #000;
            opacity: 0.04;
            letter-spacing: 8px;
        }

        /* ── Footer ── */
        .footer-bar {
            margin-top: 18px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 9px;
            color: #888;
            line-height: 1.7;
        }
    </style>
</head>
<body>
    <!-- ── Watermark ── -->
    @if($settings->company_logo)
    <div class="watermark">
        <img src="{{ public_path('storage/' . $settings->company_logo) }}" alt="">
    </div>
    @endif
    <div class="watermark-text">COTIZACION</div>

    <div class="page-frame">

        <!-- ── Header ── -->
        <div class="header">
            <table class="header-tbl">
                <tr>
                    @if($settings->company_logo)
                    <td style="width: 75px;">
                        <img src="{{ public_path('storage/' . $settings->company_logo) }}" alt="Logo" class="logo-img">
                    </td>
                    @endif
                    <td style="padding-left: 10px;">
                        <div class="brand-name">{{ $settings->company_name }}</div>
                        <div class="brand-detail">
                            RUC: {{ $settings->company_ruc }}
                            &nbsp;|&nbsp; {{ $settings->company_address }}
                            <br>
                            Tel: {{ $settings->company_phone }}
                            &nbsp;|&nbsp; {{ $settings->company_email }}
                        </div>
                    </td>
                    <td style="text-align: right; width: 160px;">
                        <div class="doc-badge">
                            <div class="doc-label">COTIZACION</div>
                            <div class="doc-number">{{ $quote->quote_number }}</div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- ── Validity ── -->
        <div class="validity-strip">
            <strong>Valida hasta:</strong> {{ \Carbon\Carbon::parse($quote->expiration_date)->format('d/m/Y') }}
            &nbsp;&nbsp;&bull;&nbsp;&nbsp;
            <strong>Estado:</strong> {{ ucfirst($quote->status) }}
        </div>

        <!-- ── Client & Quote info ── -->
        <table class="info-cols">
            <tr>
                <td>
                    <div class="info-card">
                        <div class="info-card-title">CLIENTE</div>
                        <table class="field-tbl">
                            @if($quote->customer)
                                <tr>
                                    <td class="field-lbl">Nombre:</td>
                                    <td class="field-val">{{ $quote->customer->name }}</td>
                                </tr>
                                <tr>
                                    <td class="field-lbl">{{ strtoupper($quote->customer->document_type ?? 'DOC') }}:</td>
                                    <td class="field-val">{{ $quote->customer->document_number }}</td>
                                </tr>
                                @if($quote->customer->phone)
                                <tr>
                                    <td class="field-lbl">Telefono:</td>
                                    <td class="field-val">{{ $quote->customer->phone }}</td>
                                </tr>
                                @endif
                                @if($quote->customer->address)
                                <tr>
                                    <td class="field-lbl">Direccion:</td>
                                    <td class="field-val">{{ $quote->customer->address }}</td>
                                </tr>
                                @endif
                            @else
                                <tr>
                                    <td class="field-lbl">Nombre:</td>
                                    <td class="field-val">CLIENTE GENERAL</td>
                                </tr>
                            @endif
                        </table>
                    </div>
                </td>
                <td>
                    <div class="info-card">
                        <div class="info-card-title">COTIZACION</div>
                        <table class="field-tbl">
                            <tr>
                                <td class="field-lbl">Fecha:</td>
                                <td class="field-val">{{ \Carbon\Carbon::parse($quote->quote_date)->format('d/m/Y') }}</td>
                            </tr>
                            <tr>
                                <td class="field-lbl">Sucursal:</td>
                                <td class="field-val">{{ $quote->branch->name }}</td>
                            </tr>
                            <tr>
                                <td class="field-lbl">Vendedor:</td>
                                <td class="field-val">{{ $quote->user->name }}</td>
                            </tr>
                            <tr>
                                <td class="field-lbl">Vencimiento:</td>
                                <td class="field-val">{{ \Carbon\Carbon::parse($quote->expiration_date)->format('d/m/Y') }}</td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
        </table>

        <!-- ── Products ── -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 5%;" class="text-center">#</th>
                    <th style="width: 9%;" class="text-center">IMAGEN</th>
                    <th style="width: 11%;">CODIGO</th>
                    <th style="width: 40%;">DESCRIPCION</th>
                    <th style="width: 7%;" class="text-center">CANT.</th>
                    <th style="width: 14%;" class="text-right">P. UNIT.</th>
                    <th style="width: 14%;" class="text-right">SUBTOTAL</th>
                </tr>
            </thead>
            <tbody>
                @foreach($quote->details as $index => $detail)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center">
                        @if($detail->product->image)
                            <img src="{{ public_path('storage/' . $detail->product->image) }}"
                                 alt="{{ $detail->product->name }}"
                                 class="img-thumb">
                        @else
                            <div class="img-empty">Sin img</div>
                        @endif
                    </td>
                    <td><span class="prod-code">{{ $detail->product->code }}</span></td>
                    <td><span class="prod-name">{{ $detail->product->name }}</span></td>
                    <td class="text-center" style="font-weight: bold;">{{ $detail->quantity }}</td>
                    <td class="text-right">{{ $settings->currency_symbol ?? 'S/' }} {{ number_format($detail->unit_price, 2) }}</td>
                    <td class="text-right" style="font-weight: bold;">{{ $settings->currency_symbol ?? 'S/' }} {{ number_format($detail->subtotal, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="5"></td>
                    <td class="text-right">TOTAL:</td>
                    <td class="text-right">{{ $settings->currency_symbol ?? 'S/' }} {{ number_format($quote->details->sum('subtotal'), 2) }}</td>
                </tr>
            </tfoot>
        </table>

        <!-- ── Totals & Notes ── -->
        <table class="bottom-section">
            <tr>
                <td style="width: 50%; padding-right: 10px;">
                    @if($quote->notes)
                    <div class="notes-card">
                        <div class="notes-heading">OBSERVACIONES</div>
                        <div class="notes-body">{{ $quote->notes }}</div>
                    </div>
                    @endif
                </td>
                <td style="width: 50%;">
                    <table class="summary-tbl">
                        <tr>
                            <td class="lbl">Subtotal:</td>
                            <td class="val">{{ $settings->currency_symbol ?? 'S/' }} {{ number_format($quote->subtotal, 2) }}</td>
                        </tr>
                        @if($quote->tax > 0)
                        <tr>
                            <td class="lbl">IGV ({{ $settings->igv_percentage ?? 18 }}%):</td>
                            <td class="val">{{ $settings->currency_symbol ?? 'S/' }} {{ number_format($quote->tax, 2) }}</td>
                        </tr>
                        @endif
                        @if($quote->discount > 0)
                        <tr>
                            <td class="lbl">Descuento:</td>
                            <td class="val">- {{ $settings->currency_symbol ?? 'S/' }} {{ number_format($quote->discount, 2) }}</td>
                        </tr>
                        @endif
                        <tr class="grand">
                            <td>TOTAL:</td>
                            <td style="text-align: right;">{{ $settings->currency_symbol ?? 'S/' }} {{ number_format($quote->total, 2) }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- ── Footer ── -->
        <div class="footer-bar">
            Este documento es una cotizacion y no tiene valor fiscal.
            <br>
            Para convertir en compra, contactar a {{ $settings->company_phone }} | {{ $settings->company_email }}
            <br>
            Gracias por su preferencia &nbsp;&bull;&nbsp; Generado: {{ now()->format('d/m/Y H:i') }}
        </div>

    </div>
</body>
</html>
