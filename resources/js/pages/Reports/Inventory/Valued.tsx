import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, FormEvent } from 'react';
import { FileDown, Search, RefreshCw, AlertTriangle, Package } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: '/reports' },
    { title: 'Inventario Valorizado', href: '/reports/inventory/valued' },
];

interface InventoryItem {
    product: {
        id: number;
        code: string;
        name: string;
        category?: {
            name: string;
        };
        brand?: {
            name: string;
        };
    };
    branch: {
        id: number;
        name: string;
    };
    current_stock: number;
    min_stock: number;
    max_stock: number;
    cost_price: number;
    sale_price: number;
    total_cost_value: number;
    total_sale_value: number;
    profit_margin: number;
    stock_status: 'normal' | 'bajo' | 'agotado';
}

interface Props {
    inventory: InventoryItem[];
    totals: {
        total_products: number;
        total_cost_value: number;
        total_sale_value: number;
        potential_profit: number;
        low_stock_count: number;
        out_stock_count: number;
    };
    branches: Array<{ id: number; name: string }>;
    categories: Array<{ id: number; name: string }>;
    brands: Array<{ id: number; name: string }>;
    filters: Record<string, string>;
}

export default function InventoryValuedReport({
    inventory = [],
    totals,
    branches = [],
    categories = [],
    brands = [],
    filters: initialFilters = {},
}: Props) {
    const [filters, setFilters] = useState({
        branch_id: '',
        category_id: '',
        brand_id: '',
        stock_status: '',
        search: '',
    });

    const [isGenerating, setIsGenerating] = useState(false);

    const handleFilterChange = (name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        router.get('/reports/inventory/valued', filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setFilters({
            branch_id: '',
            category_id: '',
            brand_id: '',
            stock_status: '',
            search: '',
        });
        router.get('/reports/inventory/valued');
    };

    const handleGeneratePdf = () => {
        setIsGenerating(true);
        const queryString = new URLSearchParams(
            Object.entries(filters).filter(([_, value]) => value !== '')
        ).toString();
        window.open(`/reports/inventory/valued/pdf?${queryString}`, '_blank');
        setTimeout(() => setIsGenerating(false), 1000);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const getStockBadge = (status: string) => {
        const badges: Record<string, { class: string; label: string }> = {
            normal: { class: 'bg-green-100 text-green-800', label: 'Normal' },
            bajo: { class: 'bg-yellow-100 text-yellow-800', label: 'Stock Bajo' },
            agotado: { class: 'bg-red-100 text-red-800', label: 'Agotado' },
        };
        return badges[status] || badges.normal;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventario Valorizado" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Inventario Valorizado</h1>
                        <p className="text-muted-foreground">
                            Stock actual con valorización y análisis de rentabilidad
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
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
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

                            {/* Sucursal */}
                            <div className="space-y-2">
                                <Label htmlFor="branch_id">Sucursal</Label>
                                <select
                                    id="branch_id"
                                    value={filters.branch_id}
                                    onChange={(e) => handleFilterChange('branch_id', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Todas</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
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

                            {/* Estado de Stock */}
                            <div className="space-y-2">
                                <Label htmlFor="stock_status">Estado de Stock</Label>
                                <select
                                    id="stock_status"
                                    value={filters.stock_status}
                                    onChange={(e) => handleFilterChange('stock_status', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Todos</option>
                                    <option value="normal">Stock Normal</option>
                                    <option value="low">Stock Bajo</option>
                                    <option value="out">Agotado</option>
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Total Productos</div>
                            <div className="text-2xl font-bold">{totals.total_products}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Valor en Costo</div>
                            <div className="text-2xl font-bold">
                                {formatCurrency(totals.total_cost_value)}
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Valor en Venta</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(totals.total_sale_value)}
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Ganancia Potencial</div>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(totals.potential_profit)}
                            </div>
                        </Card>
                        <Card className="p-4 bg-yellow-50">
                            <div className="text-sm text-yellow-800">Stock Bajo</div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {totals.low_stock_count}
                            </div>
                        </Card>
                        <Card className="p-4 bg-red-50">
                            <div className="text-sm text-red-800">Agotados</div>
                            <div className="text-2xl font-bold text-red-600">
                                {totals.out_stock_count}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Alertas */}
                {totals && (totals.low_stock_count > 0 || totals.out_stock_count > 0) && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <strong>Atención:</strong> Hay {totals.low_stock_count} producto(s) con stock
                                    bajo y {totals.out_stock_count} producto(s) agotado(s). Se recomienda
                                    realizar pedidos pronto.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla de Inventario */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 font-medium">Código</th>
                                    <th className="text-left p-4 font-medium">Producto</th>
                                    <th className="text-left p-4 font-medium">Categoría</th>
                                    <th className="text-left p-4 font-medium">Marca</th>
                                    <th className="text-left p-4 font-medium">Sucursal</th>
                                    <th className="text-center p-4 font-medium">Stock</th>
                                    <th className="text-center p-4 font-medium">Mín/Máx</th>
                                    <th className="text-right p-4 font-medium">Costo Unit.</th>
                                    <th className="text-right p-4 font-medium">Venta Unit.</th>
                                    <th className="text-right p-4 font-medium">Valor Costo</th>
                                    <th className="text-right p-4 font-medium">Valor Venta</th>
                                    <th className="text-center p-4 font-medium">Margen %</th>
                                    <th className="text-center p-4 font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.length > 0 ? (
                                    inventory.map((item, index) => (
                                        <tr key={index} className="border-b hover:bg-muted/50">
                                            <td className="p-4 font-mono text-sm">{item.product.code}</td>
                                            <td className="p-4 font-medium">{item.product.name}</td>
                                            <td className="p-4 text-sm">
                                                {item.product.category?.name || '-'}
                                            </td>
                                            <td className="p-4 text-sm">{item.product.brand?.name || '-'}</td>
                                            <td className="p-4 text-sm">{item.branch.name}</td>
                                            <td className="p-4 text-center font-bold">
                                                <span
                                                    className={
                                                        item.stock_status === 'agotado'
                                                            ? 'text-red-600'
                                                            : item.stock_status === 'bajo'
                                                            ? 'text-yellow-600'
                                                            : 'text-green-600'
                                                    }
                                                >
                                                    {item.current_stock}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center text-sm text-muted-foreground">
                                                {item.min_stock} / {item.max_stock}
                                            </td>
                                            <td className="p-4 text-right">
                                                {formatCurrency(item.cost_price)}
                                            </td>
                                            <td className="p-4 text-right">
                                                {formatCurrency(item.sale_price)}
                                            </td>
                                            <td className="p-4 text-right font-medium">
                                                {formatCurrency(item.total_cost_value)}
                                            </td>
                                            <td className="p-4 text-right font-medium text-blue-600">
                                                {formatCurrency(item.total_sale_value)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-green-600 font-semibold">
                                                    {item.profit_margin.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                                                        getStockBadge(item.stock_status).class
                                                    }`}
                                                >
                                                    {getStockBadge(item.stock_status).label}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={13} className="p-8 text-center text-muted-foreground">
                                            <Package className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                            No se encontraron productos con los filtros aplicados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
