import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { formatCurrency } from '@/lib/format-currency';
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
    Package,
    AlertCircle,
    ShoppingBag,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
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
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: '/reports' },
    { title: 'Compras', href: '/reports/purchases' },
];

interface PurchaseItem {
    purchase: {
        id: number;
        order_number: string;
        order_date: string;
        reception_date: string | null;
        status: 'pendiente' | 'parcial' | 'recibido' | 'cancelado';
        supplier: {
            id: number;
            name: string;
        };
        branch: {
            id: number;
            name: string;
        };
        user: {
            id: number;
            name: string;
        };
        subtotal: number;
        tax: number;
        total: number;
        payment_method: string;
    };
    total_items: number;
    received_items: number;
    pending_items: number;
}

interface Props {
    purchases: {
        data: PurchaseItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    totals: {
        total_purchases: number;
        total_subtotal: number;
        total_tax: number;
        total_amount: number;
        pending_count: number;
        received_count: number;
        partial_count: number;
    };
    suppliers: Array<{ id: number; name: string }>;
    branches: Array<{ id: number; name: string }>;
    users: Array<{ id: number; name: string }>;
    filters: {
        search?: string;
        date_from?: string;
        date_to?: string;
        supplier_id?: string;
        branch_id?: string;
        user_id?: string;
        status?: string;
        payment_method?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: string;
    };
}

export default function PurchasesReport({
    purchases = { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 },
    totals = {
        total_purchases: 0,
        total_subtotal: 0,
        total_tax: 0,
        total_amount: 0,
        pending_count: 0,
        received_count: 0,
        partial_count: 0,
    },
    suppliers = [],
    branches = [],
    users = [],
    filters: initialFilters = {},
}: Props) {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [sortField, setSortField] = useState(initialFilters.sort_field || 'order_date');
    const [sortDirection, setSortDirection] = useState(initialFilters.sort_direction || 'desc');
    const [filterData, setFilterData] = useState({
        date_from: initialFilters.date_from || '',
        date_to: initialFilters.date_to || '',
        supplier_id: initialFilters.supplier_id || '',
        branch_id: initialFilters.branch_id || '',
        user_id: initialFilters.user_id || '',
        status: initialFilters.status || '',
        payment_method: initialFilters.payment_method || '',
        per_page: initialFilters.per_page || '15',
    });

    const [isGenerating, setIsGenerating] = useState(false);

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

        router.get('/reports/purchases', params, {
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

        router.get('/reports/purchases', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        const clearedFilters = {
            date_from: '',
            date_to: '',
            supplier_id: '',
            branch_id: '',
            user_id: '',
            status: '',
            payment_method: '',
            per_page: '15',
        };
        setFilterData(clearedFilters);
        setSearchTerm('');

        router.get('/reports/purchases', {
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

        router.get('/reports/purchases', params, {
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

        router.get('/reports/purchases', params, {
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

        router.get('/reports/purchases', params, {
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
        window.open(`/reports/purchases/pdf?${queryString}`, '_blank');
        setTimeout(() => setIsGenerating(false), 1000);
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            pendiente: 'bg-yellow-100 text-yellow-800',
            parcial: 'bg-blue-100 text-blue-800',
            recibido: 'bg-green-100 text-green-800',
            cancelado: 'bg-red-100 text-red-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pendiente: 'Pendiente',
            parcial: 'Parcial',
            recibido: 'Recibido',
            cancelado: 'Cancelado',
        };
        return labels[status] || status;
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
        return sortDirection === 'asc'
            ? <ArrowUp className="h-3 w-3 ml-1" />
            : <ArrowDown className="h-3 w-3 ml-1" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reporte de Compras" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold">Reporte de Compras</h1>
                            <p className="text-muted-foreground">
                                Análisis detallado de órdenes de compra y recepciones
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

                {/* Filtros - Always visible */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Search bar full-width at top */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Buscar por número de orden, proveedor..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Filters in 4-column grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date_from">Fecha Desde</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={filterData.date_from}
                                    onChange={(e) =>
                                        setFilterData({ ...filterData, date_from: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_to">Fecha Hasta</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={filterData.date_to}
                                    onChange={(e) =>
                                        setFilterData({ ...filterData, date_to: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="supplier_id">Proveedor</Label>
                                <Select
                                    value={filterData.supplier_id || '_all'}
                                    onValueChange={(value) =>
                                        setFilterData({ ...filterData, supplier_id: value === '_all' ? '' : value })
                                    }
                                >
                                    <SelectTrigger id="supplier_id">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">Todos</SelectItem>
                                        {suppliers.map((supplier) => (
                                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="branch_id">Sucursal</Label>
                                <Select
                                    value={filterData.branch_id || '_all'}
                                    onValueChange={(value) =>
                                        setFilterData({ ...filterData, branch_id: value === '_all' ? '' : value })
                                    }
                                >
                                    <SelectTrigger id="branch_id">
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">Todas</SelectItem>
                                        {branches.map((branch) => (
                                            <SelectItem key={branch.id} value={branch.id.toString()}>
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user_id">Usuario</Label>
                                <Select
                                    value={filterData.user_id || '_all'}
                                    onValueChange={(value) =>
                                        setFilterData({ ...filterData, user_id: value === '_all' ? '' : value })
                                    }
                                >
                                    <SelectTrigger id="user_id">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">Todos</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Estado</Label>
                                <Select
                                    value={filterData.status || '_all'}
                                    onValueChange={(value) =>
                                        setFilterData({ ...filterData, status: value === '_all' ? '' : value })
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">Todos</SelectItem>
                                        <SelectItem value="pendiente">Pendiente</SelectItem>
                                        <SelectItem value="parcial">Parcial</SelectItem>
                                        <SelectItem value="recibido">Recibido</SelectItem>
                                        <SelectItem value="cancelado">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment_method">Método de Pago</Label>
                                <Select
                                    value={filterData.payment_method || '_all'}
                                    onValueChange={(value) =>
                                        setFilterData({ ...filterData, payment_method: value === '_all' ? '' : value })
                                    }
                                >
                                    <SelectTrigger id="payment_method">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">Todos</SelectItem>
                                        <SelectItem value="efectivo">Efectivo</SelectItem>
                                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                        <SelectItem value="transferencia">Transferencia</SelectItem>
                                        <SelectItem value="credito">Crédito</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Action buttons right-aligned */}
                        <div className="flex justify-end gap-2 mt-4">
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

                {/* Resumen */}
                {totals && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-l-4 border-blue-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Total Compras</div>
                                <div className="text-2xl font-bold">{totals.total_purchases}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-slate-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Subtotal</div>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(totals.total_subtotal)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-amber-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">IGV</div>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(totals.total_tax)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-indigo-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Total</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(totals.total_amount)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Estados */}
                {totals && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-l-4 border-amber-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Pendientes</div>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {totals.pending_count}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-blue-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Parciales</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {totals.partial_count}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-green-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Recibidos</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {totals.received_count}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Alerta de pendientes */}
                {totals && totals.pending_count > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-yellow-400" />
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <strong>Atención:</strong> Hay {totals.pending_count} orden(es) de
                                    compra pendiente(s) de recepción.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla de Compras */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Listado de Compras</CardTitle>
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
                                        onClick={() => handleSort('order_number')}
                                    >
                                        <div className="flex items-center">
                                            N° Orden
                                            <SortIcon field="order_number" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('order_date')}
                                    >
                                        <div className="flex items-center">
                                            Fecha Orden
                                            <SortIcon field="order_date" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('supplier')}
                                    >
                                        <div className="flex items-center">
                                            Proveedor
                                            <SortIcon field="supplier" />
                                        </div>
                                    </TableHead>
                                    <TableHead>Sucursal</TableHead>
                                    <TableHead className="text-center">Items</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                    <TableHead className="text-right">IGV</TableHead>
                                    <TableHead
                                        className="text-right cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('total')}
                                    >
                                        <div className="flex items-center justify-end">
                                            Total
                                            <SortIcon field="total" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center">Método Pago</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchases?.data && purchases.data.length > 0 ? (
                                    purchases.data.map((item) => (
                                        <TableRow key={item.purchase.id}>
                                            <TableCell className="font-mono font-medium">
                                                {item.purchase.order_number}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(item.purchase.order_date), 'dd/MM/yyyy')}
                                            </TableCell>
                                            <TableCell>{item.purchase.supplier.name}</TableCell>
                                            <TableCell>{item.purchase.branch.name}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="text-sm">
                                                    <span className="font-bold">{item.total_items}</span>
                                                    {item.purchase.status === 'parcial' && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.received_items} recibidos
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.purchase.subtotal)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.purchase.tax)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(item.purchase.total)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-sm capitalize">
                                                    {item.purchase.payment_method || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={getStatusBadge(item.purchase.status)}>
                                                    {getStatusLabel(item.purchase.status)}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8">
                                            <Package className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                                            <p className="mt-2 text-muted-foreground">
                                                No se encontraron compras con los filtros aplicados
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Paginación */}
                        {purchases?.data && purchases.data.length > 0 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium">{purchases.from}</span> a{' '}
                                    <span className="font-medium">{purchases.to}</span> de{' '}
                                    <span className="font-medium">{purchases.total}</span> resultados
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(purchases.current_page - 1)}
                                        disabled={purchases.current_page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Anterior
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, purchases.last_page) }, (_, i) => {
                                            let pageNum;
                                            if (purchases.last_page <= 5) {
                                                pageNum = i + 1;
                                            } else if (purchases.current_page <= 3) {
                                                pageNum = i + 1;
                                            } else if (purchases.current_page >= purchases.last_page - 2) {
                                                pageNum = purchases.last_page - 4 + i;
                                            } else {
                                                pageNum = purchases.current_page - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={
                                                        purchases.current_page === pageNum ? 'default' : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className="w-8 h-8 p-0"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(purchases.current_page + 1)}
                                        disabled={purchases.current_page === purchases.last_page}
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
