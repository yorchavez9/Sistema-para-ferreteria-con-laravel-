<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Reporte' }}</title>
    <style>
        {!! file_get_contents(public_path('css/pdf-styles.css')) !!}
    </style>
    @yield('extra-styles')
</head>
<body>
    {{-- Header Corporativo --}}
    @include('pdf.layouts.header')

    {{-- Título del Reporte --}}
    <div class="report-title-section">
        <div class="report-title">{{ $reportTitle ?? 'Reporte' }}</div>
        <div class="report-subtitle">
            @if(isset($period))
                Período: {{ $period }}
            @endif
            @if(isset($dateFrom) && isset($dateTo))
                Período: {{ \Carbon\Carbon::parse($dateFrom)->format('d/m/Y') }} - {{ \Carbon\Carbon::parse($dateTo)->format('d/m/Y') }}
            @endif
            <br>
            Generado: {{ now()->format('d/m/Y H:i') }} | Usuario: {{ auth()->user()->name }}
        </div>
    </div>

    {{-- Filtros Aplicados --}}
    @if(isset($filters) && count($filters) > 0)
        <div class="filters-section">
            <div class="filters-title">FILTROS APLICADOS:</div>
            @foreach($filters as $label => $value)
                @if($value)
                    <div class="filter-item">
                        <span class="filter-label">{{ $label }}:</span>
                        <span class="filter-value">{{ $value }}</span>
                    </div>
                @endif
            @endforeach
        </div>
    @endif

    {{-- Contenido del Reporte --}}
    <div class="report-content">
        @yield('content')
    </div>

    {{-- Footer --}}
    <div class="footer">
        <div class="footer-left">
            Sistema de Gestión - {{ config('app.name') }}
        </div>
        <div class="footer-right">
            Página <span class="pagenum"></span>
        </div>
    </div>

    @yield('extra-scripts')
</body>
</html>
