import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { formatCurrency } from '@/lib/format-currency';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
                    <div className="flex items-center gap-3">
                        <TrendingUp className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold">Rentabilidad por Producto</h1>
                            <p className="text-muted-foreground">
                                Analisis de margenes de ganancia y rendimiento por producto
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleGeneratePdf}
                        disabled={isGenerating}
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                        <FileDown className="mr-2 h-4 w-4" />
                        {isGenerating ? 'Generando...' : 'Exportar PDF'}
                    </Button>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

                                {/* Busqueda */}
                                <div className="space-y-2">
                                    <Label htmlFor="search">Buscar Producto</Label>
                                    <Input
                                        id="search"
                                        type="text"
                                        placeholder="Codigo o nombre..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>

                                {/* Categoria */}
                                <div className="space-y-2">
                                    <Label>Categoria</Label>
                                    <Select
                                        value={filters.category_id}
                                        onValueChange={(value) => handleFilterChange('category_id', value === '_all' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_all">Todas</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={String(category.id)}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Marca */}
                                <div className="space-y-2">
                                    <Label>Marca</Label>
                                    <Select
                                        value={filters.brand_id}
                                        onValueChange={(value) => handleFilterChange('brand_id', value === '_all' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_all">Todas</SelectItem>
                                            {brands.map((brand) => (
                                                <SelectItem key={brand.id} value={String(brand.id)}>
                                                    {brand.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Margen Minimo */}
                                <div className="space-y-2">
                                    <Label htmlFor="min_margin">Margen Minimo (%)</Label>
                                    <Input
                                        id="min_margin"
                                        type="number"
                                        step="0.1"
                                        placeholder="0"
                                        value={filters.min_margin}
                                        onChange={(e) => handleFilterChange('min_margin', e.target.value)}
                                    />
                                </div>

                                {/* Margen Maximo */}
                                <div className="space-y-2">
                                    <Label htmlFor="max_margin">Margen Maximo (%)</Label>
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
                                    <Label>Ordenar por</Label>
                                    <Select
                                        value={filters.sort_by}
                                        onValueChange={(value) => handleFilterChange('sort_by', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Mayor Ganancia" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="profit">Mayor Ganancia</SelectItem>
                                            <SelectItem value="margin">Mayor Margen</SelectItem>
                                            <SelectItem value="revenue">Mayor Venta</SelectItem>
                                            <SelectItem value="units">Mas Vendidos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="button" variant="outline" onClick={handleClearFilters}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Limpiar Filtros
                                </Button>
                                <Button type="submit">
                                    <Search className="mr-2 h-4 w-4" />
                                    Buscar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Resumen */}
                {totals && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <Card className="border-l-4 border-blue-500">
                            <CardContent className="pt-0">
                                <div className="text-sm text-muted-foreground">Productos</div>
                                <div className="text-2xl font-bold">{totals.total_products}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-purple-500">
                            <CardContent className="pt-0">
                                <div className="text-sm text-muted-foreground">Unidades Vendidas</div>
                                <div className="text-2xl font-bold">{totals.total_units_sold}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-red-500">
                            <CardContent className="pt-0">
                                <div className="text-sm text-muted-foreground">Costo Total</div>
                                <div className="text-2xl font-bold text-red-600">
                                    {formatCurrency(totals.total_cost)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-indigo-500">
                            <CardContent className="pt-0">
                                <div className="text-sm text-muted-foreground">Ingresos Totales</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(totals.total_revenue)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-green-500 bg-green-50 dark:bg-green-950">
                            <CardContent className="pt-0">
                                <div className="text-sm text-green-800 dark:text-green-200">Ganancia Total</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(totals.total_profit)}
                                </div>
                                <div className="text-xs text-green-600 mt-1">
                                    Margen: {totals.avg_margin.toFixed(1)}%
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tabla de Rentabilidad */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detalle de Rentabilidad por Producto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Codigo</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead className="text-center">Unid. Vendidas</TableHead>
                                    <TableHead className="text-right">Precio Prom.</TableHead>
                                    <TableHead className="text-right">Costo Prom.</TableHead>
                                    <TableHead className="text-right">Ingresos</TableHead>
                                    <TableHead className="text-right">Ganancia</TableHead>
                                    <TableHead className="text-center">Margen %</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {profitability.length > 0 ? (
                                    profitability.map((item) => (
                                        <TableRow key={item.product.id}>
                                            <TableCell className="font-mono text-sm">{item.product.code}</TableCell>
                                            <TableCell className="font-medium">{item.product.name}</TableCell>
                                            <TableCell className="text-sm">
                                                {item.product.category?.name || '-'}
                                            </TableCell>
                                            <TableCell className="text-center font-bold">
                                                {item.units_sold}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.avg_sale_price)}
                                            </TableCell>
                                            <TableCell className="text-right text-red-600">
                                                {formatCurrency(item.avg_cost_price)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-blue-600">
                                                {formatCurrency(item.total_revenue)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-green-600">
                                                {formatCurrency(item.gross_profit)}
                                            </TableCell>
                                            <TableCell className="text-center">
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
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                            <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                            No se encontraron productos con los filtros aplicados
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Analisis de Rentabilidad */}
                {profitability.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Productos Mas Rentables */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-green-600">
                                    Top 5 - Mayor Ganancia
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
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
                            </CardContent>
                        </Card>

                        {/* Productos con Mejor Margen */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-blue-600">
                                    Top 5 - Mejor Margen
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
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
                            </CardContent>
                        </Card>

                        {/* Productos Mas Vendidos */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-purple-600">
                                    Top 5 - Mas Vendidos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
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
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
