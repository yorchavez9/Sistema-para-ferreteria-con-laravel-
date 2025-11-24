import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { formatCurrency } from '@/lib/format-currency';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, FormEvent } from 'react';
import { FileDown, Search, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: '/reports' },
    { title: 'Rentabilidad por Producto', href: '/reports/profitability/by-product' },
];

interface ProfitabilityItem {
    product: {
        id: number;
        code: string;
        name: string;
        category?: { name: string };
        brand?: { name: string };
    };
    total_sold: number;
    total_cost: number;
    total_revenue: number;
    gross_profit: number;
    profit_margin: number;
    units_sold: number;
    avg_sale_price: number;
    avg_cost_price: number;
}

interface Props {
    profitability: ProfitabilityItem[];
    totals: {
        total_products: number;
        total_units_sold: number;
        total_cost: number;
        total_revenue: number;
        total_profit: number;
        avg_margin: number;
    };
    categories: Array<{ id: number; name: string }>;
    brands: Array<{ id: number; name: string }>;
    filters: Record<string, string>;
}

export default function ProfitabilityByProductReport({
    profitability = [],
    totals,
    categories = [],
    brands = [],
    filters: initialFilters = {},
}: Props) {
    const [filters, setFilters] = useState({
        date_from: '',
        date_to: '',
        category_id: '',
        brand_id: '',
        search: '',
        min_margin: '',
        max_margin: '',
        sort_by: 'profit',
    });

    const [isGenerating, setIsGenerating] = useState(false);

    const handleFilterChange = (name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        router.get('/reports/profitability/by-product', filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setFilters({
            date_from: '',
            date_to: '',
            category_id: '',
            brand_id: '',
            search: '',
            min_margin: '',
            max_margin: '',
            sort_by: 'profit',
        });
        router.get('/reports/profitability/by-product');
    };

    const handleGeneratePdf = () => {
        setIsGenerating(true);
        const queryString = new URLSearchParams(
            Object.entries(filters).filter(([_, value]) => value !== '')
        ).toString();
        window.open(`/reports/profitability/by-product/pdf?${queryString}`, '_blank');
        setTimeout(() => setIsGenerating(false), 1000);
    };

    const getMarginColor = (margin: number) => {
        if (margin >= 30) return 'text-green-600';
        if (margin >= 15) return 'text-blue-600';
        if (margin >= 5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getMarginBgColor = (margin: number) => {
        if (margin >= 30) return 'bg-green-100 text-green-800';
        if (margin >= 15) return 'bg-blue-100 text-blue-800';
        if (margin >= 5) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rentabilidad por Producto" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Rentabilidad por Producto</h1>
                        <p className="text-muted-foreground">
                            Análisis de márgenes de ganancia y rendimiento por producto
                        </p>
                    </div>
                    <Button
                        onClick={handleGeneratePdf}
                        disabled={isGenerating}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <FileDown className="mr-2 h-4 w-4" />
                        {isGenerating ? 'Generando...' : 'Exportar PDF'}
                    </Button>
                </div>

                {/* Filtros */}
                <Card className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                            {/* Fecha Desde */}
                            <div className="space-y-2">
                                <Label htmlFor="date_from">Fecha Desde</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={filters.date_from}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                />
                            </div>

                            {/* Fecha Hasta */}
                            <div className="space-y-2">
                                <Label htmlFor="date_to">Fecha Hasta</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={filters.date_to}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                />
                            </div>

                            {/* Búsqueda */}
                            <div className="space-y-2">
                                <Label htmlFor="search">Buscar Producto</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Código o nombre..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>

                            {/* Categoría */}
                            <div className="space-y-2">
                                <Label htmlFor="category_id">Categoría</Label>
                                <select
                                    id="category_id"
                                    value={filters.category_id}
                                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Todas</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Marca */}
                            <div className="space-y-2">
                                <Label htmlFor="brand_id">Marca</Label>
                                <select
                                    id="brand_id"
                                    value={filters.brand_id}
                                    onChange={(e) => handleFilterChange('brand_id', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Todas</option>
                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Margen Mínimo */}
                            <div className="space-y-2">
                                <Label htmlFor="min_margin">Margen Mínimo (%)</Label>
                                <Input
                                    id="min_margin"
                                    type="number"
                                    step="0.1"
                                    placeholder="0"
                                    value={filters.min_margin}
                                    onChange={(e) => handleFilterChange('min_margin', e.target.value)}
                                />
                            </div>

                            {/* Margen Máximo */}
                            <div className="space-y-2">
                                <Label htmlFor="max_margin">Margen Máximo (%)</Label>
                                <Input
                                    id="max_margin"
                                    type="number"
                                    step="0.1"
                                    placeholder="100"
                                    value={filters.max_margin}
                                    onChange={(e) => handleFilterChange('max_margin', e.target.value)}
                                />
                            </div>

                            {/* Ordenar por */}
                            <div className="space-y-2">
                                <Label htmlFor="sort_by">Ordenar por</Label>
                                <select
                                    id="sort_by"
                                    value={filters.sort_by}
                                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="profit">Mayor Ganancia</option>
                                    <option value="margin">Mayor Margen</option>
                                    <option value="revenue">Mayor Venta</option>
                                    <option value="units">Más Vendidos</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit">
                                <Search className="mr-2 h-4 w-4" />
                                Buscar
                            </Button>
                            <Button type="button" variant="outline" onClick={handleClearFilters}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Limpiar Filtros
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Resumen */}
                {totals && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Productos</div>
                            <div className="text-2xl font-bold">{totals.total_products}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Unidades Vendidas</div>
                            <div className="text-2xl font-bold">{totals.total_units_sold}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Costo Total</div>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(totals.total_cost)}
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Ingresos Totales</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(totals.total_revenue)}
                            </div>
                        </Card>
                        <Card className="p-4 bg-green-50">
                            <div className="text-sm text-green-800">Ganancia Total</div>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(totals.total_profit)}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                                Margen: {totals.avg_margin.toFixed(1)}%
                            </div>
                        </Card>
                    </div>
                )}

                {/* Tabla de Rentabilidad */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 font-medium">Código</th>
                                    <th className="text-left p-4 font-medium">Producto</th>
                                    <th className="text-left p-4 font-medium">Categoría</th>
                                    <th className="text-center p-4 font-medium">Unid. Vendidas</th>
                                    <th className="text-right p-4 font-medium">Precio Prom.</th>
                                    <th className="text-right p-4 font-medium">Costo Prom.</th>
                                    <th className="text-right p-4 font-medium">Ingresos</th>
                                    <th className="text-right p-4 font-medium">Ganancia</th>
                                    <th className="text-center p-4 font-medium">Margen %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profitability.length > 0 ? (
                                    profitability.map((item) => (
                                        <tr key={item.product.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 font-mono text-sm">{item.product.code}</td>
                                            <td className="p-4 font-medium">{item.product.name}</td>
                                            <td className="p-4 text-sm">
                                                {item.product.category?.name || '-'}
                                            </td>
                                            <td className="p-4 text-center font-bold">
                                                {item.units_sold}
                                            </td>
                                            <td className="p-4 text-right">
                                                {formatCurrency(item.avg_sale_price)}
                                            </td>
                                            <td className="p-4 text-right text-red-600">
                                                {formatCurrency(item.avg_cost_price)}
                                            </td>
                                            <td className="p-4 text-right font-medium text-blue-600">
                                                {formatCurrency(item.total_revenue)}
                                            </td>
                                            <td className="p-4 text-right font-bold text-green-600">
                                                {formatCurrency(item.gross_profit)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {item.profit_margin >= 15 ? (
                                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                                    )}
                                                    <span
                                                        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getMarginBgColor(
                                                            item.profit_margin
                                                        )}`}
                                                    >
                                                        {item.profit_margin.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="p-8 text-center text-muted-foreground">
                                            <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                            No se encontraron productos con los filtros aplicados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Análisis de Rentabilidad */}
                {profitability.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Productos Más Rentables */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4 text-green-600">
                                Top 5 - Mayor Ganancia
                            </h3>
                            <div className="space-y-3">
                                {profitability.slice(0, 5).map((item, index) => (
                                    <div key={index} className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{item.product.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.units_sold} unidades
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-green-600 text-sm">
                                                {formatCurrency(item.gross_profit)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.profit_margin.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Productos con Mejor Margen */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4 text-blue-600">
                                Top 5 - Mejor Margen
                            </h3>
                            <div className="space-y-3">
                                {[...profitability]
                                    .sort((a, b) => b.profit_margin - a.profit_margin)
                                    .slice(0, 5)
                                    .map((item, index) => (
                                        <div key={index} className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">
                                                    {item.product.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.units_sold} unidades
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div
                                                    className={`font-bold text-sm ${getMarginColor(
                                                        item.profit_margin
                                                    )}`}
                                                >
                                                    {item.profit_margin.toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatCurrency(item.gross_profit)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </Card>

                        {/* Productos Más Vendidos */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4 text-purple-600">
                                Top 5 - Más Vendidos
                            </h3>
                            <div className="space-y-3">
                                {[...profitability]
                                    .sort((a, b) => b.units_sold - a.units_sold)
                                    .slice(0, 5)
                                    .map((item, index) => (
                                        <div key={index} className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">
                                                    {item.product.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Margen: {item.profit_margin.toFixed(1)}%
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-purple-600 text-sm">
                                                    {item.units_sold} unid.
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatCurrency(item.total_revenue)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
