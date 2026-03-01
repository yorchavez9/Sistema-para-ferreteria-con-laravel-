<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ $title ?? 'Reporte' }}</title>
    <style>
        {!! file_get_contents(public_path('css/pdf-styles.css')) !!}
    </style>
    @yield('extra-styles')
</head>
<body>
    <div class="page-border">

        {{-- Header Corporativo --}}
        @include('pdf.layouts.header')

        {{-- Título del Reporte --}}
        <div class="report-title-section">
            <div class="report-title">{{ $reportTitle ?? 'Reporte' }}</div>
            <div class="report-subtitle">
                @if(isset($period))
                    {{ $period }} &nbsp;&bull;&nbsp;
                @endif
                @if(isset($dateFrom) && isset($dateTo))
                    {{ \Carbon\Carbon::parse($dateFrom)->format('d/m/Y') }} al {{ \Carbon\Carbon::parse($dateTo)->format('d/m/Y') }} &nbsp;&bull;&nbsp;
                @endif
                Generado: {{ now()->format('d/m/Y H:i') }} &nbsp;&bull;&nbsp; {{ auth()->user()->name }}
            </div>
        </div>

        {{-- Filtros Aplicados --}}
        @php
            $hiddenFilters = ['per_page', 'page', 'sort_field', 'sort_direction', 'search'];

            $filterLabels = [
                'date_from' => 'Desde',
                'date_to' => 'Hasta',
                'branch_id' => 'Sucursal',
                'user_id' => 'Usuario',
                'customer_id' => 'Cliente',
                'supplier_id' => 'Proveedor',
                'category_id' => 'Categoría',
                'brand_id' => 'Marca',
                'document_type' => 'Tipo Doc.',
                'payment_method' => 'Método Pago',
                'payment_type' => 'Tipo Pago',
                'status' => 'Estado',
                'stock_status' => 'Estado Stock',
                'cash_register_id' => 'Caja',
                'min_amount' => 'Monto Mín.',
                'max_amount' => 'Monto Máx.',
                'min_margin' => 'Margen Mín.',
                'max_margin' => 'Margen Máx.',
            ];

            $resolvedFilters = [];
            if (isset($filters) && is_array($filters)) {
                foreach ($filters as $key => $value) {
                    if (in_array($key, $hiddenFilters) || empty($value)) continue;

                    $label = $filterLabels[$key] ?? ucfirst(str_replace('_', ' ', $key));
                    $displayValue = $value;

                    if ($key === 'branch_id' && is_numeric($value)) {
                        $branch = \App\Models\Branch::find($value);
                        $displayValue = $branch ? $branch->name : $value;
                    } elseif ($key === 'user_id' && is_numeric($value)) {
                        $user = \App\Models\User::find($value);
                        $displayValue = $user ? $user->name : $value;
                    } elseif ($key === 'customer_id' && is_numeric($value)) {
                        $customer = \App\Models\Customer::find($value);
                        $displayValue = $customer ? $customer->name : $value;
                    } elseif ($key === 'supplier_id' && is_numeric($value)) {
                        $supplier = \App\Models\Supplier::find($value);
                        $displayValue = $supplier ? $supplier->name : $value;
                    } elseif ($key === 'category_id' && is_numeric($value)) {
                        $category = \App\Models\Category::find($value);
                        $displayValue = $category ? $category->name : $value;
                    } elseif ($key === 'brand_id' && is_numeric($value)) {
                        $brand = \App\Models\Brand::find($value);
                        $displayValue = $brand ? $brand->name : $value;
                    } elseif ($key === 'cash_register_id' && is_numeric($value)) {
                        $register = \App\Models\CashRegister::find($value);
                        $displayValue = $register ? $register->name : $value;
                    } elseif (str_contains($key, 'date') && strtotime($value)) {
                        $displayValue = \Carbon\Carbon::parse($value)->format('d/m/Y');
                    } else {
                        $displayValue = ucfirst(str_replace('_', ' ', $value));
                    }

                    $resolvedFilters[$label] = $displayValue;
                }
            }
        @endphp

        @if(count($resolvedFilters) > 0)
            <div class="filters-section">
                <div class="filters-title">Filtros Aplicados</div>
                @foreach($resolvedFilters as $label => $value)
                    <div class="filter-item">
                        <span class="filter-label">{{ $label }}:</span>
                        <span class="filter-value">{{ $value }}</span>
                    </div>
                @endforeach
            </div>
        @endif

        {{-- Contenido del Reporte --}}
        @yield('content')

        {{-- Footer --}}
        <div class="footer">
            {{ config('app.name') }} &bull; Sistema de Gestión
        </div>

    </div>

    @yield('extra-scripts')
</body>
</html>
