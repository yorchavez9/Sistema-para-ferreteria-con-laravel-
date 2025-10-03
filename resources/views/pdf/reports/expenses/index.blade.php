@extends('pdf.layouts.base')

@section('content')

{{-- Resumen Ejecutivo --}}
<div class="summary-box">
    <div class="summary-title">RESUMEN EJECUTIVO</div>
    <div class="summary-grid">
        <div class="summary-row">
            <div class="summary-label">Total de Gastos:</div>
            <div class="summary-value highlight">{{ $totals['total_expenses'] }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Monto Total:</div>
            <div class="summary-value text-danger highlight">S/ {{ number_format($totals['total_amount'], 2) }}</div>
        </div>
        @if(isset($totals['avg_expense']))
        <div class="summary-row">
            <div class="summary-label">Gasto Promedio:</div>
            <div class="summary-value">S/ {{ number_format($totals['avg_expense'], 2) }}</div>
        </div>
        @endif
        @if(isset($totals['max_expense']))
        <div class="summary-row">
            <div class="summary-label">Mayor Gasto:</div>
            <div class="summary-value text-bold">S/ {{ number_format($totals['max_expense'], 2) }}</div>
        </div>
        @endif
    </div>
</div>

{{-- Gráfico de Gastos por Categoría --}}
@if(isset($totalsByCategory) && count($totalsByCategory) > 0)
<div class="mb-15">
    <h2>Distribución de Gastos por Categoría</h2>
    <div class="info-box">
        <div class="info-box-content">
            @foreach($totalsByCategory as $item)
            <div class="mb-10">
                <div class="flex-between mb-5">
                    <div>
                        <span class="text-bold">{{ $item['category'] }}</span>
                        <span class="text-small text-muted ml-5">({{ $item['count'] }} gasto(s))</span>
                    </div>
                    <div class="text-right">
                        <span class="text-bold text-danger">S/ {{ number_format($item['total'], 2) }}</span>
                        <span class="text-small text-muted ml-5">{{ number_format($item['percentage'], 1) }}%</span>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill bg-danger" style="width: {{ $item['percentage'] }}%;"></div>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</div>
@endif

{{-- Totales por Método de Pago --}}
@if(isset($totalsByPaymentMethod) && count($totalsByPaymentMethod) > 0)
<div class="grid-2 mb-15">
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Total por Método de Pago</div>
            <div class="info-box-content">
                <table class="table-clean text-small">
                    <thead>
                        <tr>
                            <th class="text-left">Método</th>
                            <th class="text-center">Gastos</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($totalsByPaymentMethod as $item)
                        <tr>
                            <td class="text-small">{{ ucfirst($item['method']) }}</td>
                            <td class="text-center">{{ $item['count'] }}</td>
                            <td class="text-right text-bold text-danger text-small">S/ {{ number_format($item['total'], 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Estadísticas Generales</div>
            <div class="info-box-content">
                @php
                    $avgExpense = $totals['total_expenses'] > 0
                        ? $totals['total_amount'] / $totals['total_expenses']
                        : 0;
                @endphp
                <div class="info-row">
                    <span class="info-label">Gasto Promedio:</span>
                    <span class="info-value">S/ {{ number_format($avgExpense, 2) }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Mayor Gasto:</span>
                    <span class="info-value text-bold">S/ {{ number_format(collect($expenses)->max('amount'), 2) }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Menor Gasto:</span>
                    <span class="info-value">S/ {{ number_format(collect($expenses)->min('amount'), 2) }}</span>
                </div>
                @if(isset($totalsByCategory) && count($totalsByCategory) > 0)
                <div class="info-row">
                    <span class="info-label">Categoría Principal:</span>
                    <span class="info-value text-small">{{ $totalsByCategory[0]['category'] }}</span>
                </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endif

{{-- Tabla de Gastos --}}
<h2>Detalle de Gastos</h2>

@if(count($expenses) > 0)
<table class="table-bordered table-compact">
    <thead>
        <tr>
            <th style="width: 10%;">Fecha</th>
            <th style="width: 30%;">Descripción</th>
            <th style="width: 15%;">Categoría</th>
            <th style="width: 12%;">Sucursal</th>
            <th style="width: 12%;">Usuario</th>
            <th class="text-right" style="width: 12%;">Monto</th>
            <th class="text-center" style="width: 9%;">Método Pago</th>
        </tr>
    </thead>
    <tbody>
        @foreach($expenses as $expense)
        <tr>
            <td class="text-small">{{ \Carbon\Carbon::parse($expense->date)->format('d/m/Y') }}</td>
            <td class="text-small">{{ $expense->description }}</td>
            <td class="text-center">
                <span class="badge badge-secondary text-small">{{ $expense->category->name }}</span>
            </td>
            <td class="text-small">{{ $expense->branch->name }}</td>
            <td class="text-small">{{ $expense->user->name }}</td>
            <td class="text-right currency text-bold text-danger text-small">S/ {{ number_format($expense->amount, 2) }}</td>
            <td class="text-center text-small">{{ ucfirst($expense->payment_method ?? '-') }}</td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td colspan="5" class="text-right text-bold">TOTAL:</td>
            <td class="text-right currency text-bold text-danger">S/ {{ number_format($totals['total_amount'], 2) }}</td>
            <td></td>
        </tr>
    </tfoot>
</table>
@else
<div class="alert alert-info">
    <strong>No hay resultados:</strong> No se encontraron gastos con los filtros aplicados.
</div>
@endif

{{-- Análisis Detallado --}}
@if(count($expenses) > 0)
<div class="page-break-before"></div>

<h2>Análisis de Gastos</h2>

<div class="grid-2 mb-15">
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Top 10 - Gastos Más Altos</div>
            <div class="info-box-content">
                @php
                    $topExpenses = collect($expenses)->sortByDesc('amount')->take(10);
                @endphp
                <table class="table-clean text-small">
                    <thead>
                        <tr>
                            <th class="text-left">Descripción</th>
                            <th class="text-left">Categoría</th>
                            <th class="text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($topExpenses as $expense)
                        <tr>
                            <td class="text-small">{{ Str::limit($expense->description, 30) }}</td>
                            <td class="text-small">{{ $expense->category->name }}</td>
                            <td class="text-right text-danger text-bold text-small">
                                S/ {{ number_format($expense->amount, 2) }}
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Gastos por Sucursal</div>
            <div class="info-box-content">
                @php
                    $expensesByBranch = collect($expenses)
                        ->groupBy('branch.name')
                        ->map(function ($items, $branch) {
                            return [
                                'branch' => $branch,
                                'total' => $items->sum('amount'),
                                'count' => $items->count(),
                            ];
                        })
                        ->sortByDesc('total');
                @endphp
                <table class="table-clean text-small">
                    <thead>
                        <tr>
                            <th class="text-left">Sucursal</th>
                            <th class="text-center">Gastos</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($expensesByBranch as $item)
                        <tr>
                            <td class="text-small">{{ $item['branch'] }}</td>
                            <td class="text-center">{{ $item['count'] }}</td>
                            <td class="text-right text-bold text-small">S/ {{ number_format($item['total'], 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

{{-- Análisis Temporal --}}
<div class="info-box mb-15">
    <div class="info-box-header">Distribución Temporal de Gastos</div>
    <div class="info-box-content">
        @php
            $expensesByMonth = collect($expenses)
                ->groupBy(function ($expense) {
                    return \Carbon\Carbon::parse($expense->date)->format('Y-m');
                })
                ->map(function ($items, $month) {
                    return [
                        'month' => \Carbon\Carbon::parse($month . '-01')->locale('es')->isoFormat('MMMM YYYY'),
                        'total' => $items->sum('amount'),
                        'count' => $items->count(),
                        'avg' => $items->avg('amount'),
                    ];
                })
                ->sortBy(function ($item, $key) {
                    return $key;
                });
        @endphp
        @if($expensesByMonth->count() > 0)
            <table class="table-clean text-small">
                <thead>
                    <tr>
                        <th class="text-left">Período</th>
                        <th class="text-center">Cantidad</th>
                        <th class="text-right">Promedio</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($expensesByMonth as $item)
                    <tr>
                        <td class="text-small text-bold">{{ ucfirst($item['month']) }}</td>
                        <td class="text-center">{{ $item['count'] }} gasto(s)</td>
                        <td class="text-right text-small">S/ {{ number_format($item['avg'], 2) }}</td>
                        <td class="text-right text-danger text-bold text-small">S/ {{ number_format($item['total'], 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>
</div>

{{-- Categorías con Mayor Impacto --}}
@if(isset($totalsByCategory) && count($totalsByCategory) > 0)
<div class="grid-2 mb-15">
    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Categorías de Mayor Gasto</div>
            <div class="info-box-content">
                @php
                    $topCategories = collect($totalsByCategory)->take(5);
                @endphp
                @foreach($topCategories as $index => $category)
                <div class="info-row">
                    <span class="info-label">{{ $index + 1 }}. {{ $category['category'] }}:</span>
                    <span class="info-value text-danger text-bold">
                        S/ {{ number_format($category['total'], 2) }}
                        <span class="text-small text-muted">({{ number_format($category['percentage'], 1) }}%)</span>
                    </span>
                </div>
                @endforeach
            </div>
        </div>
    </div>

    <div class="col">
        <div class="info-box">
            <div class="info-box-header">Usuarios con Más Gastos</div>
            <div class="info-box-content">
                @php
                    $expensesByUser = collect($expenses)
                        ->groupBy('user.name')
                        ->map(function ($items, $user) {
                            return [
                                'user' => $user,
                                'total' => $items->sum('amount'),
                                'count' => $items->count(),
                            ];
                        })
                        ->sortByDesc('total')
                        ->take(5);
                @endphp
                @foreach($expensesByUser as $index => $item)
                <div class="info-row">
                    <span class="info-label">{{ $index + 1 }}. {{ $item['user'] }}:</span>
                    <span class="info-value">
                        S/ {{ number_format($item['total'], 2) }}
                        <span class="text-small text-muted">({{ $item['count'] }} gasto(s))</span>
                    </span>
                </div>
                @endforeach
            </div>
        </div>
    </div>
</div>
@endif

{{-- Recomendaciones --}}
<div class="alert alert-info no-page-break">
    <strong>💡 Recomendaciones para Optimización de Gastos:</strong>
    <ul class="text-small" style="margin-top: 5px; padding-left: 20px;">
        @if(isset($totalsByCategory) && count($totalsByCategory) > 0)
            @php
                $topCategory = $totalsByCategory[0];
            @endphp
            <li>La categoría "{{ $topCategory['category'] }}" representa el {{ number_format($topCategory['percentage'], 1) }}% del total. Evaluar posibilidades de optimización.</li>
        @endif
        <li>Gasto total del período: S/ {{ number_format($totals['total_amount'], 2) }}</li>
        @if($avgExpense > 0)
            <li>Gasto promedio por transacción: S/ {{ number_format($avgExpense, 2) }}</li>
        @endif
        @if(collect($expenses)->max('amount') > $avgExpense * 3)
            <li>Se detectaron gastos significativamente superiores al promedio. Revisar justificación de gastos mayores a S/ {{ number_format($avgExpense * 3, 2) }}</li>
        @endif
        @php
            $cashExpenses = collect($expenses)->where('payment_method', 'efectivo')->sum('amount');
            $cashPercentage = $totals['total_amount'] > 0 ? ($cashExpenses / $totals['total_amount']) * 100 : 0;
        @endphp
        @if($cashPercentage > 50)
            <li>El {{ number_format($cashPercentage, 1) }}% de los gastos son en efectivo. Considerar incrementar el uso de métodos de pago rastreables.</li>
        @endif
        <li>Implementar políticas de control de gastos para categorías de mayor impacto.</li>
    </ul>
</div>
@endif

@endsection

@section('extra-styles')
<style>
    .progress-bar {
        width: 100%;
        height: 8px;
        background-color: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        transition: width 0.3s ease;
    }

    .bg-danger {
        background-color: #ef4444;
    }

    .flex-between {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>
@endsection
