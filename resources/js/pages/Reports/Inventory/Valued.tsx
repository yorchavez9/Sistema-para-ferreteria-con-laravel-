import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
    FileDown,
    Search,
    RefreshCw,
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    Package,
    AlertTriangle,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useDebouncedCallback } from 'use-debounce';

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
    inventory: {
        data: InventoryItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
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
    filters: {
        search?: string;
        branch_id?: string;
        category_id?: string;
        brand_id?: string;
        stock_status?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: string;
    };
}

export default function InventoryValuedReport({
    inventory,
    totals,
    branches = [],
    categories = [],
    brands = [],
    filters: initialFilters = {},
}: Props) {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filterData, setFilterData] = useState({
        branch_id: initialFilters.branch_id || '',
        category_id: initialFilters.category_id || '',
        brand_id: initialFilters.brand_id || '',
        stock_status: initialFilters.stock_status || '',
        per_page: initialFilters.per_page || '15',
    });
    const [sortField, setSortField] = useState(initialFilters.sort_field || 'name');
    const [sortDirection, setSortDirection] = useState(initialFilters.sort_direction || 'asc');
    const [isGenerating, setIsGenerating] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    // Búsqueda en tiempo real con debounce
    const debouncedSearch = useDebouncedCallback((value: string) => {
        const params: any = {
            search: value,
            sort_field: sortField,
            sort_direction: sortDirection,
            per_page: filterData.per_page,
        };

        Object.entries(filterData).forEach(([key, val]) => {
            if (val && key !== 'per_page') params[key] = val;
        });

        router.get('/reports/inventory/valued', params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, 500);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleFilter = () => {
        const params: any = {
            search: searchTerm,
            sort_field: sortField,
            sort_direction: sortDirection,
            per_page: filterData.per_page,
        };

        Object.entries(filterData).forEach(([key, val]) => {
            if (val && key !== 'per_page') params[key] = val;
        });

        router.get('/reports/inventory/valued', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        const clearedFilters = {
            branch_id: '',
            category_id: '',
            brand_id: '',
            stock_status: '',
            per_page: '15',
        };
        setFilterData(clearedFilters);
        setSearchTerm('');

        router.get('/reports/inventory/valued', {
            per_page: '15',
            sort_field: sortField,
            sort_direction: sortDirection,
        });
    };

    const handleSort = (field: string) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);

        const params: any = {
            search: searchTerm,
            sort_field: field,
            sort_direction: newDirection,
            per_page: filterData.per_page,
        };

        Object.entries(filterData).forEach(([key, val]) => {
            if (val && key !== 'per_page') params[key] = val;
        });

        router.get('/reports/inventory/valued', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePerPageChange = (value: string) => {
        setFilterData({ ...filterData, per_page: value });

        const params: any = {
            search: searchTerm,
            per_page: value,
            sort_field: sortField,
            sort_direction: sortDirection,
        };

        Object.entries(filterData).forEach(([key, val]) => {
            if (val && key !== 'per_page') params[key] = val;
        });

        router.get('/reports/inventory/valued', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (page: number) => {
        const params: any = {
            page: page,
            search: searchTerm,
            per_page: filterData.per_page,
            sort_field: sortField,
            sort_direction: sortDirection,
        };

        Object.entries(filterData).forEach(([key, val]) => {
            if (val && key !== 'per_page') params[key] = val;
        });

        router.get('/reports/inventory/valued', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleGeneratePdf = () => {
        setIsGenerating(true);
        const params: any = { search: searchTerm, ...filterData };
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, value]) => value !== '')
        ).toString();
        window.open(`/reports/inventory/valued/pdf?${queryString}`, '_blank');
        setTimeout(() => setIsGenerating(false), 1000);
    };

    const getStockBadge = (status: string) => {
        const badges: Record<string, string> = {
            normal: 'default',
            bajo: 'secondary',
            agotado: 'destructive',
        };
        return badges[status] || 'outline';
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
        return sortDirection === 'asc'
            ? <ArrowUp className="h-3 w-3 ml-1" />
            : <ArrowDown className="h-3 w-3 ml-1" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventario Valorizado" />

            <div className="space-y-6 p-6">
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

                {/* Barra de Búsqueda */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por código o nombre de producto..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
                                <Filter className="h-4 w-4 mr-2" />
                                {showFilters ? 'Ocultar Filtros' : 'Filtros Avanzados'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Estadísticas Resumidas */}
                {totals && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                        <Card>
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Total Productos</div>
                                <div className="text-2xl font-bold">{totals.total_products}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Valor en Costo</div>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(totals.total_cost_value)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Valor en Venta</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(totals.total_sale_value)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Ganancia Potencial</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(totals.potential_profit)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-yellow-50">
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-yellow-800">Stock Bajo</div>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {totals.low_stock_count}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-red-50">
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-red-800">Agotados</div>
                                <div className="text-2xl font-bold text-red-600">
                                    {totals.out_stock_count}
                                </div>
                            </CardContent>
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
                                    <strong>Atención:</strong> Hay {totals.low_stock_count} producto(s) con
                                    stock bajo y {totals.out_stock_count} producto(s) agotado(s). Se
                                    recomienda realizar pedidos pronto.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtros Avanzados */}
                {showFilters && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Filtros Avanzados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="branch_id">Sucursal</Label>
                                    <Select
                                        value={filterData.branch_id}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, branch_id: value })
                                        }
                                    >
                                        <SelectTrigger id="branch_id">
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Todas</SelectItem>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category_id">Categoría</Label>
                                    <Select
                                        value={filterData.category_id}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, category_id: value })
                                        }
                                    >
                                        <SelectTrigger id="category_id">
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Todas</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="brand_id">Marca</Label>
                                    <Select
                                        value={filterData.brand_id}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, brand_id: value })
                                        }
                                    >
                                        <SelectTrigger id="brand_id">
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Todas</SelectItem>
                                            {brands.map((brand) => (
                                                <SelectItem key={brand.id} value={brand.id.toString()}>
                                                    {brand.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stock_status">Estado de Stock</Label>
                                    <Select
                                        value={filterData.stock_status}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, stock_status: value })
                                        }
                                    >
                                        <SelectTrigger id="stock_status">
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Todos</SelectItem>
                                            <SelectItem value="normal">Stock Normal</SelectItem>
                                            <SelectItem value="bajo">Stock Bajo</SelectItem>
                                            <SelectItem value="agotado">Agotado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleFilter}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Aplicar Filtros
                                </Button>
                                <Button onClick={clearFilters} variant="outline">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Limpiar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabla de Inventario */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Lista de Inventario</CardTitle>
                        <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Mostrar:</Label>
                            <Select value={filterData.per_page} onValueChange={handlePerPageChange}>
                                <SelectTrigger className="w-[80px] h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="15">15</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('code')}
                                    >
                                        <div className="flex items-center">
                                            Código
                                            <SortIcon field="code" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center">
                                            Producto
                                            <SortIcon field="name" />
                                        </div>
                                    </TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Marca</TableHead>
                                    <TableHead>Sucursal</TableHead>
                                    <TableHead
                                        className="text-center cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('current_stock')}
                                    >
                                        <div className="flex items-center justify-center">
                                            Stock
                                            <SortIcon field="current_stock" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center">Mín/Máx</TableHead>
                                    <TableHead
                                        className="text-right cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('cost_price')}
                                    >
                                        <div className="flex items-center justify-end">
                                            Costo Unit.
                                            <SortIcon field="cost_price" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-right cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('sale_price')}
                                    >
                                        <div className="flex items-center justify-end">
                                            Venta Unit.
                                            <SortIcon field="sale_price" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-right cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('total_cost_value')}
                                    >
                                        <div className="flex items-center justify-end">
                                            Valor Costo
                                            <SortIcon field="total_cost_value" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-right cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('total_sale_value')}
                                    >
                                        <div className="flex items-center justify-end">
                                            Valor Venta
                                            <SortIcon field="total_sale_value" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="text-center cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('profit_margin')}
                                    >
                                        <div className="flex items-center justify-center">
                                            Margen %
                                            <SortIcon field="profit_margin" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventory?.data && inventory.data.length > 0 ? (
                                    inventory.data.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-mono font-medium">
                                                {item.product.code}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {item.product.name}
                                            </TableCell>
                                            <TableCell>{item.product.category?.name || '-'}</TableCell>
                                            <TableCell>{item.product.brand?.name || '-'}</TableCell>
                                            <TableCell>{item.branch.name}</TableCell>
                                            <TableCell className="text-center font-bold">
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
                                            </TableCell>
                                            <TableCell className="text-center text-muted-foreground">
                                                {item.min_stock} / {item.max_stock}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.cost_price)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.sale_price)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(item.total_cost_value)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-blue-600">
                                                {formatCurrency(item.total_sale_value)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-green-600 font-semibold">
                                                    {item.profit_margin.toFixed(1)}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={getStockBadge(item.stock_status) as any}>
                                                    {item.stock_status === 'normal'
                                                        ? 'Normal'
                                                        : item.stock_status === 'bajo'
                                                        ? 'Stock Bajo'
                                                        : 'Agotado'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={13} className="text-center py-8">
                                            <Package className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                                            <p className="mt-2 text-muted-foreground">
                                                No se encontraron productos con los filtros aplicados
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Paginación */}
                        {inventory?.data && inventory.data.length > 0 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium">{inventory.from}</span> a{' '}
                                    <span className="font-medium">{inventory.to}</span> de{' '}
                                    <span className="font-medium">{inventory.total}</span> resultados
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(inventory.current_page - 1)}
                                        disabled={inventory.current_page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Anterior
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {Array.from(
                                            { length: Math.min(5, inventory.last_page) },
                                            (_, i) => {
                                                let pageNum;
                                                if (inventory.last_page <= 5) {
                                                    pageNum = i + 1;
                                                } else if (inventory.current_page <= 3) {
                                                    pageNum = i + 1;
                                                } else if (inventory.current_page >= inventory.last_page - 2) {
                                                    pageNum = inventory.last_page - 4 + i;
                                                } else {
                                                    pageNum = inventory.current_page - 2 + i;
                                                }

                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={
                                                            inventory.current_page === pageNum
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="sm"
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            }
                                        )}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(inventory.current_page + 1)}
                                        disabled={inventory.current_page === inventory.last_page}
                                    >
                                        Siguiente
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
