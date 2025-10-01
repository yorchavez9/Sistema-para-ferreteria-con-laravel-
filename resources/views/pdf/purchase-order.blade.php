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
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: {{ $config['fontSize'] }};
            line-height: 1.4;
            color: #333;
            padding: {{ $config['paper'] === 'a4' ? '20px' : ($config['paper'] === 'a5' ? '15px' : '10px') }};
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }

        .header h1 {
            font-size: {{ $config['paper'] === 'a4' ? '24px' : ($config['paper'] === 'a5' ? '18px' : '14px') }};
            margin-bottom: 5px;
            color: #2563eb;
        }

        .header p {
            font-size: {{ $config['paper'] === 'a4' ? '12px' : ($config['paper'] === 'a5' ? '10px' : '8px') }};
            color: #666;
        }

        .info-section {
            margin-bottom: 15px;
        }

        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 10px;
        }

        .info-row {
            display: table-row;
        }

        .info-label {
            display: table-cell;
            font-weight: bold;
            padding: 4px 10px 4px 0;
            width: 30%;
        }

        .info-value {
            display: table-cell;
            padding: 4px 0;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: {{ $config['paper'] === 'a4' ? '11px' : ($config['paper'] === 'a5' ? '9px' : '7px') }};
        }

        .status-pendiente {
            background-color: #fef3c7;
            color: #92400e;
        }

        .status-parcial {
            background-color: #dbeafe;
            color: #1e40af;
        }

        .status-recibido {
            background-color: #d1fae5;
            color: #065f46;
        }

        .status-cancelado {
            background-color: #fee2e2;
            color: #991b1b;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }

        table th {
            background-color: #2563eb;
            color: white;
            padding: 8px 6px;
            text-align: left;
            font-weight: bold;
            font-size: {{ $config['paper'] === 'a4' ? '10px' : ($config['paper'] === 'a5' ? '8px' : '7px') }};
        }

        table td {
            padding: 6px;
            border-bottom: 1px solid #e5e7eb;
            font-size: {{ $config['paper'] === 'a4' ? '9px' : ($config['paper'] === 'a5' ? '8px' : '6px') }};
        }

        table tr:nth-child(even) {
            background-color: #f9fafb;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .totals {
            margin-top: 20px;
            float: right;
            width: {{ $config['paper'] === 'a4' || $config['paper'] === 'a5' ? '40%' : '100%' }};
        }

        .totals table {
            margin: 0;
        }

        .totals table td {
            border: none;
            padding: 6px 10px;
        }

        .totals .total-row {
            font-weight: bold;
            font-size: {{ $config['paper'] === 'a4' ? '12px' : ($config['paper'] === 'a5' ? '10px' : '8px') }};
            background-color: #2563eb;
            color: white;
        }

        .notes {
            clear: both;
            margin-top: 20px;
            padding: 10px;
            background-color: #f9fafb;
            border-left: 4px solid #2563eb;
        }

        .notes strong {
            display: block;
            margin-bottom: 5px;
        }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: {{ $config['paper'] === 'a4' ? '9px' : ($config['paper'] === 'a5' ? '8px' : '6px') }};
            color: #6b7280;
        }

        /* Estilos específicos para tickets pequeños */
        @media print {
            body {
                margin: 0;
                padding: {{ $config['paper'] === 'a4' ? '20px' : ($config['paper'] === 'a5' ? '15px' : '5px') }};
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>ORDEN DE COMPRA</h1>
        <p>{{ $order->order_number }}</p>
    </div>

    <!-- Información General -->
    <div class="info-section">
        <h3 style="margin-bottom: 10px; color: #2563eb;">Información de la Orden</h3>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Estado:</div>
                <div class="info-value">
                    <span class="status-badge status-{{ $order->status }}">
                        {{ ucfirst($order->status) }}
                    </span>
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">Fecha de Orden:</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($order->order_date)->format('d/m/Y') }}</div>
            </div>
            @if($order->expected_date)
            <div class="info-row">
                <div class="info-label">Fecha Esperada:</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($order->expected_date)->format('d/m/Y') }}</div>
            </div>
            @endif
            @if($order->received_date)
            <div class="info-row">
                <div class="info-label">Fecha Recepción:</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($order->received_date)->format('d/m/Y') }}</div>
            </div>
            @endif
        </div>
    </div>

    <!-- Proveedor y Sucursal -->
    <div class="info-section">
        <h3 style="margin-bottom: 10px; color: #2563eb;">Proveedor</h3>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Razón Social:</div>
                <div class="info-value">{{ $order->supplier->business_name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">RUC:</div>
                <div class="info-value">{{ $order->supplier->document_number }}</div>
            </div>
            @if($order->supplier->phone)
            <div class="info-row">
                <div class="info-label">Teléfono:</div>
                <div class="info-value">{{ $order->supplier->phone }}</div>
            </div>
            @endif
        </div>

        <h3 style="margin: 15px 0 10px 0; color: #2563eb;">Sucursal</h3>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Nombre:</div>
                <div class="info-value">{{ $order->branch->name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Generado por:</div>
                <div class="info-value">{{ $order->user->name }}</div>
            </div>
        </div>
    </div>

    <!-- Detalle de Productos -->
    <h3 style="margin: 20px 0 10px 0; color: #2563eb;">Detalle de Productos</h3>
    <table>
        <thead>
            <tr>
                <th style="width: 10%;">Código</th>
                <th style="width: 35%;">Producto</th>
                @if($config['paper'] === 'a4' || $config['paper'] === 'a5')
                <th style="width: 15%;">Categoría</th>
                <th style="width: 15%;">Marca</th>
                @endif
                <th style="width: 10%;" class="text-right">Cant.</th>
                <th style="width: {{ $config['paper'] === 'a4' || $config['paper'] === 'a5' ? '15%' : '20%' }};" class="text-right">P. Unit.</th>
                <th style="width: {{ $config['paper'] === 'a4' || $config['paper'] === 'a5' ? '15%' : '25%' }};" class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->details as $detail)
            <tr>
                <td>{{ $detail->product->code }}</td>
                <td>{{ $detail->product->name }}</td>
                @if($config['paper'] === 'a4' || $config['paper'] === 'a5')
                <td>{{ $detail->product->category->name ?? '-' }}</td>
                <td>{{ $detail->product->brand->name ?? '-' }}</td>
                @endif
                <td class="text-right">{{ $detail->quantity_ordered }}</td>
                <td class="text-right">S/ {{ number_format($detail->unit_price, 2) }}</td>
                <td class="text-right">S/ {{ number_format($detail->subtotal, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Totales -->
    <div class="totals">
        <table>
            <tr>
                <td>Subtotal:</td>
                <td class="text-right">S/ {{ number_format($order->subtotal, 2) }}</td>
            </tr>
            <tr>
                <td>IGV (18%):</td>
                <td class="text-right">S/ {{ number_format($order->tax, 2) }}</td>
            </tr>
            @if($order->discount > 0)
            <tr>
                <td>Descuento:</td>
                <td class="text-right" style="color: #dc2626;">- S/ {{ number_format($order->discount, 2) }}</td>
            </tr>
            @endif
            <tr class="total-row">
                <td>TOTAL:</td>
                <td class="text-right">S/ {{ number_format($order->total, 2) }}</td>
            </tr>
        </table>
    </div>

    <!-- Notas -->
    @if($order->notes)
    <div class="notes">
        <strong>Notas:</strong>
        {{ $order->notes }}
    </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <p>Documento generado el {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</p>
        <p>Sistema de Gestión de Ferretería</p>
    </div>
</body>
</html>