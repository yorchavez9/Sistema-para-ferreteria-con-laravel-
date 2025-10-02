import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Package, Search, Eye, AlertTriangle, TrendingUp, Settings, Filter, Plus, Minus } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import { Fragment } from 'react';

interface InventoryItem {
    id: number;
    current_stock: number;
    min_stock: number | null;
    max_stock: number | null;
    cost_price: number;
    sale_price: number;
    last_movement_date: string;
    product: {
        id: number;
        name: string;
        code: string;
        min_stock: number | null;
        max_stock: number | null;
        unit_of_measure: string;
        category: {
            name: string;
        };
        brand: {
            name: string;
        };
    } | null;
    branch: {
        id: number;
        name: string;
        location: string;
    } | null;
}

interface Branch {
    id: number;
    name: string;
}

interface InventoryIndexProps {
    inventory: {
        data: InventoryItem[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    branches: Branch[];
    filters: {
        search?: string;
        branch_id?: string;
        stock_status?: string;
        per_page?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventario', href: '/inventory' },
];

export default function InventoryIndex({ inventory, branches, filters }: InventoryIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [filterData, setFilterData] = useState({
        branch_id: filters.branch_id || '',
        stock_status: filters.stock_status || '',
        per_page: filters.per_page || '15',
    });
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    // Búsqueda en tiempo real con debounce
    const debouncedSearch = useDebouncedCallback((value: string) => {
        router.get('/inventory', {
            search: value,
            branch_id: filterData.branch_id,
            stock_status: filterData.stock_status,
            per_page: filterData.per_page,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, 500);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleFilter = () => {
        router.get('/inventory', {
            search: searchTerm,
            ...filterData,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterData({
            branch_id: '',
            stock_status: '',
            per_page: '15',
        });
        router.get('/inventory', {
            per_page: '15',
        });
    };

    const toggleRowExpansion = (itemId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedRows(newExpanded);
    };

    const getStockStatus = (item: InventoryItem) => {
        // Si no hay producto asociado, retornar estado por defecto
        if (!item.product) {
            return { status: 'unknown', label: 'Sin Producto', variant: 'secondary' as const };
        }

        // Usar los valores de min/max del inventario primero, si no existen usar los del producto
        const minStock = item.min_stock ?? item.product.min_stock ?? 0;
        const maxStock = item.max_stock ?? item.product.max_stock ?? Infinity;

        if (item.current_stock === 0) {
            return { status: 'out', label: 'Agotado', variant: 'destructive' as const };
        }
        if (item.current_stock <= minStock) {
            return { status: 'low', label: 'Stock Bajo', variant: 'destructive' as const };
        }
        if (maxStock !== Infinity && item.current_stock >= maxStock) {
            return { status: 'high', label: 'Stock Alto', variant: 'default' as const };
        }
        return { status: 'normal', label: 'Normal', variant: 'secondary' as const };
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventario" />

            <div className="p-6 space-y-6">

                {/* Barra de búsqueda y acciones */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Buscar por producto o código..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filtros
                                </Button>
                                <Link href="/inventory/adjustment">
                                    <Button variant="outline">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Ajustar Stock
                                    </Button>
                                </Link>
                                <Link href="/inventory/low-stock">
                                    <Button>
                                        <AlertTriangle className="mr-2 h-4 w-4" />
                                        Stock Bajo
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Panel de filtros */}
                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Sucursal</label>
                                    <Select
                                        value={filterData.branch_id || "all"}
                                        onValueChange={(value) => setFilterData({ ...filterData, branch_id: value === "all" ? "" : value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todas las sucursales" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas las sucursales</SelectItem>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Estado del Stock</label>
                                    <Select
                                        value={filterData.stock_status || "all"}
                                        onValueChange={(value) => setFilterData({ ...filterData, stock_status: value === "all" ? "" : value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos los estados" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los estados</SelectItem>
                                            <SelectItem value="low">Stock Bajo</SelectItem>
                                            <SelectItem value="normal">Stock Normal</SelectItem>
                                            <SelectItem value="high">Stock Alto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Registros por página</label>
                                    <Select
                                        value={filterData.per_page}
                                        onValueChange={(value) => setFilterData({ ...filterData, per_page: value })}
                                    >
                                        <SelectTrigger>
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

                                <div className="flex items-end gap-2">
                                    <Button onClick={handleFilter} className="flex-1">
                                        Aplicar
                                    </Button>
                                    <Button onClick={handleClearFilters} variant="outline">
                                        Limpiar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Inventory Table Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="md:hidden w-10"></TableHead>
                                <TableHead>Producto</TableHead>
                                <TableHead className="hidden md:table-cell">Sucursal</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="hidden md:table-cell">Rango Stock</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="hidden md:table-cell">Costo Unit.</TableHead>
                                <TableHead className="hidden md:table-cell">Precio Unit.</TableHead>
                                <TableHead className="hidden md:table-cell">Última Act.</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventory.data.length > 0 ? (
                                inventory.data.map((item) => {
                                    const stockInfo = getStockStatus(item);
                                    const isExpanded = expandedRows.has(item.id);

                                    // Si no hay producto, no mostramos el item
                                    if (!item.product) {
                                        return null;
                                    }

                                    return (
                                        <Fragment key={item.id}>
                                        <TableRow>
                                            {/* Botón expandir (móvil) */}
                                            <TableCell className="md:hidden w-10 p-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleRowExpansion(item.id)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    {isExpanded ? (
                                                        <Minus className="h-4 w-4" />
                                                    ) : (
                                                        <Plus className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>

                                            {/* Producto */}
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{item.product.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {item.product.code}
                                                    </div>
                                                    <div className="md:hidden text-xs text-muted-foreground mt-1">
                                                        {item.branch?.name || 'Sin sucursal'}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Sucursal (desktop) */}
                                            <TableCell className="hidden md:table-cell">
                                                <div>
                                                    <div className="font-medium">{item.branch?.name || 'Sin sucursal'}</div>
                                                    {item.branch?.location && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {item.branch.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Stock Actual */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4" />
                                                    <span className="font-medium">
                                                        {item.current_stock}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {item.product.unit_of_measure || 'UND'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Rango Stock (desktop) */}
                                            <TableCell className="hidden md:table-cell">
                                                <div className="text-sm">
                                                    Mín: {item.min_stock ?? item.product.min_stock ?? 0} • Máx: {item.max_stock ?? item.product.max_stock ?? '-'}
                                                </div>
                                            </TableCell>

                                            {/* Estado */}
                                            <TableCell>
                                                <Badge variant={stockInfo.variant}>
                                                    {stockInfo.label}
                                                </Badge>
                                            </TableCell>

                                            {/* Costo (desktop) */}
                                            <TableCell className="hidden md:table-cell">{formatCurrency(item.cost_price)}</TableCell>

                                            {/* Precio (desktop) */}
                                            <TableCell className="hidden md:table-cell">{formatCurrency(item.sale_price)}</TableCell>

                                            {/* Última Act. (desktop) */}
                                            <TableCell className="hidden md:table-cell text-sm">
                                                {formatDate(item.last_movement_date)}
                                            </TableCell>

                                            {/* Acciones */}
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/products/${item.product.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/inventory/${item.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <TrendingUp className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {/* Fila expandida (móvil) */}
                                        {isExpanded && (
                                            <TableRow className="md:hidden bg-muted/50">
                                                <TableCell colSpan={6} className="p-4">
                                                    <div className="space-y-3 text-sm">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <span className="text-muted-foreground font-medium">Categoría:</span>
                                                                <p className="font-medium">{item.product.category?.name || 'Sin categoría'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground font-medium">Marca:</span>
                                                                <p className="font-medium">{item.product.brand?.name || 'Sin marca'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <span className="text-muted-foreground font-medium">Rango Stock:</span>
                                                                <p className="font-medium text-xs">
                                                                    Mín: {item.min_stock ?? item.product.min_stock ?? 0} • Máx: {item.max_stock ?? item.product.max_stock ?? '-'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground font-medium">Última Act.:</span>
                                                                <p className="font-medium">{formatDate(item.last_movement_date)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <span className="text-muted-foreground font-medium">Costo Unit.:</span>
                                                                <p className="font-medium">{formatCurrency(item.cost_price)}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground font-medium">Precio Unit.:</span>
                                                                <p className="font-medium">{formatCurrency(item.sale_price)}</p>
                                                            </div>
                                                        </div>
                                                        {item.branch?.location && (
                                                            <div>
                                                                <span className="text-muted-foreground font-medium">Ubicación:</span>
                                                                <p className="font-medium">{item.branch.location}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        </Fragment>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-6">
                                        No se encontraron registros de inventario.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                        </div>

                        {/* Paginación */}
                        {inventory.data.length > 0 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando {inventory.from} a {inventory.to} de {inventory.total} registros
                                </div>
                                <div className="flex gap-2">
                                    {inventory.links.map((link: any, index: number) => {
                                        if (link.url === null) return null;

                                        let label = link.label;
                                        if (label.includes('Previous')) label = 'Anterior';
                                        if (label.includes('Next')) label = 'Siguiente';

                                        return (
                                            <Button
                                                key={index}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => {
                                                    if (link.url) {
                                                        router.get(link.url, {}, {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                    }
                                                }}
                                                disabled={link.url === null}
                                            >
                                                {label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}