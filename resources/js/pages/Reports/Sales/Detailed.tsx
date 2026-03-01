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
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    FileText,
    ShoppingCart,
    Receipt,
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
    { title: 'Ventas Detallado', href: '/reports/sales/detailed' },
];

interface Sale {
    id: number;
    sale_number: string;
    sale_date: string;
    customer?: {
        name: string;
        document_number?: string;
    };
    branch: {
        name: string;
    };
    user: {
        name: string;
    };
    document_type: string;
    payment_method: string;
    payment_type: string;
    status: string;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    notes?: string;
}

interface Props {
    sales: {
        data: Sale[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    totals: {
        count: number;
        subtotal: number;
        tax: number;
        discount: number;
        total: number;
        avg_ticket: number;
    };
    totalsByPaymentMethod: Record<string, { count: number; total: number }>;
    totalsByDocumentType: Record<string, { count: number; total: number }>;
    branches: Array<{ id: number; name: string }>;
    users: Array<{ id: number; name: string }>;
    customers: Array<{ id: number; name: string }>;
    filters: {
        search?: string;
        date_from?: string;
        date_to?: string;
        branch_id?: string;
        user_id?: string;
        document_type?: string;
        payment_method?: string;
        payment_type?: string;
        status?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: string;
    };
}

export default function SalesDetailedReport({
    sales = { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 },
    totals = { count: 0, subtotal: 0, tax: 0, discount: 0, total: 0, avg_ticket: 0 },
    totalsByPaymentMethod = {},
    totalsByDocumentType = {},
    branches = [],
    users = [],
    customers = [],
    filters: initialFilters = {},
}: Props) {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [filterData, setFilterData] = useState({
        date_from: initialFilters.date_from || '',
        date_to: initialFilters.date_to || '',
        branch_id: initialFilters.branch_id || '',
        user_id: initialFilters.user_id || '',
        document_type: initialFilters.document_type || '',
        payment_method: initialFilters.payment_method || '',
        payment_type: initialFilters.payment_type || '',
        status: initialFilters.status || '',
        per_page: initialFilters.per_page || '15',
    });
    const [sortField, setSortField] = useState(initialFilters.sort_field || 'sale_date');
    const [sortDirection, setSortDirection] = useState(initialFilters.sort_direction || 'desc');
    const [isGenerating, setIsGenerating] = useState(false);

    // Busqueda en tiempo real con debounce
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

        router.get('/reports/sales/detailed', params, {
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

        router.get('/reports/sales/detailed', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        const clearedFilters = {
            date_from: '',
            date_to: '',
            branch_id: '',
            user_id: '',
            document_type: '',
            payment_method: '',
            payment_type: '',
            status: '',
            per_page: '15',
        };
        setFilterData(clearedFilters);
        setSearchTerm('');

        router.get('/reports/sales/detailed', {
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

        router.get('/reports/sales/detailed', params, {
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

        router.get('/reports/sales/detailed', params, {
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

        router.get('/reports/sales/detailed', params, {
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
        window.open(`/reports/sales/detailed/pdf?${queryString}`, '_blank');
        setTimeout(() => setIsGenerating(false), 1000);
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            pagado: 'default',
            pendiente: 'secondary',
            anulado: 'destructive',
            cancelado: 'outline',
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
            <Head title="Reporte de Ventas Detallado" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold">Reporte de Ventas Detallado</h1>
                            <p className="text-muted-foreground">
                                Visualiza y exporta el detalle completo de tus ventas
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

                {/* Filtros - Always Visible */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Search bar - full width at top */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Buscar por numero de venta, cliente..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Filter fields in 4-column grid */}
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
                                <Label htmlFor="user_id">Vendedor</Label>
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
                                <Label htmlFor="document_type">Tipo de Documento</Label>
                                <Select
                                    value={filterData.document_type || '_all'}
                                    onValueChange={(value) =>
                                        setFilterData({ ...filterData, document_type: value === '_all' ? '' : value })
                                    }
                                >
                                    <SelectTrigger id="document_type">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">Todos</SelectItem>
                                        <SelectItem value="factura">Factura</SelectItem>
                                        <SelectItem value="boleta">Boleta</SelectItem>
                                        <SelectItem value="nota_venta">Nota de Venta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment_method">Metodo de Pago</Label>
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
                                        <SelectItem value="transferencia">Transferencia</SelectItem>
                                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                        <SelectItem value="yape">Yape</SelectItem>
                                        <SelectItem value="plin">Plin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment_type">Tipo de Pago</Label>
                                <Select
                                    value={filterData.payment_type || '_all'}
                                    onValueChange={(value) =>
                                        setFilterData({ ...filterData, payment_type: value === '_all' ? '' : value })
                                    }
                                >
                                    <SelectTrigger id="payment_type">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">Todos</SelectItem>
                                        <SelectItem value="contado">Contado</SelectItem>
                                        <SelectItem value="credito">Credito</SelectItem>
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
                                        <SelectItem value="pagado">Pagado</SelectItem>
                                        <SelectItem value="pendiente">Pendiente</SelectItem>
                                        <SelectItem value="anulado">Anulado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Action buttons aligned right */}
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

                {/* Estadisticas Resumidas */}
                {totals && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-center gap-3">
                                    <Receipt className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Total Ventas</div>
                                        <div className="text-2xl font-bold">{totals.count}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-slate-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-slate-500" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Subtotal</div>
                                        <div className="text-2xl font-bold">{formatCurrency(totals.subtotal)}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-amber-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-center gap-3">
                                    <Receipt className="h-5 w-5 text-amber-500" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">IGV</div>
                                        <div className="text-2xl font-bold">{formatCurrency(totals.tax)}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-center gap-3">
                                    <ShoppingCart className="h-5 w-5 text-green-500" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Total</div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {formatCurrency(totals.total)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tabla de Ventas */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Lista de Ventas</CardTitle>
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
                                        onClick={() => handleSort('sale_number')}
                                    >
                                        <div className="flex items-center">
                                            N. Venta
                                            <SortIcon field="sale_number" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('sale_date')}
                                    >
                                        <div className="flex items-center">
                                            Fecha
                                            <SortIcon field="sale_date" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('customer')}
                                    >
                                        <div className="flex items-center">
                                            Cliente
                                            <SortIcon field="customer" />
                                        </div>
                                    </TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead>Vendedor</TableHead>
                                    <TableHead>Metodo</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead
                                        className="text-right cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('total')}
                                    >
                                        <div className="flex items-center justify-end">
                                            Total
                                            <SortIcon field="total" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales?.data && sales.data.length > 0 ? (
                                    sales.data.map((sale) => (
                                        <TableRow key={sale.id}>
                                            <TableCell className="font-mono font-medium">
                                                {sale.sale_number}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(sale.sale_date), 'dd/MM/yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {sale.customer?.name || 'Cliente General'}
                                                    </p>
                                                    {sale.customer?.document_number && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {sale.customer.document_number}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="capitalize">
                                                    {sale.document_type.replace('_', ' ')}
                                                </span>
                                            </TableCell>
                                            <TableCell>{sale.user.name}</TableCell>
                                            <TableCell>
                                                <span className="capitalize">{sale.payment_method}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="capitalize">{sale.payment_type}</span>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {formatCurrency(sale.total)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={getStatusBadge(sale.status) as any}>
                                                    {sale.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8">
                                            <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                                            <p className="mt-2 text-muted-foreground">
                                                No se encontraron ventas con los filtros aplicados
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Paginacion */}
                        {sales?.data && sales.data.length > 0 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium">{sales.from}</span> a{' '}
                                    <span className="font-medium">{sales.to}</span> de{' '}
                                    <span className="font-medium">{sales.total}</span> resultados
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(sales.current_page - 1)}
                                        disabled={sales.current_page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Anterior
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, sales.last_page) }, (_, i) => {
                                            let pageNum;
                                            if (sales.last_page <= 5) {
                                                pageNum = i + 1;
                                            } else if (sales.current_page <= 3) {
                                                pageNum = i + 1;
                                            } else if (sales.current_page >= sales.last_page - 2) {
                                                pageNum = sales.last_page - 4 + i;
                                            } else {
                                                pageNum = sales.current_page - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={
                                                        sales.current_page === pageNum ? 'default' : 'outline'
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
                                        onClick={() => handlePageChange(sales.current_page + 1)}
                                        disabled={sales.current_page === sales.last_page}
                                    >
                                        Siguiente
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Totales por Metodo de Pago y Documento */}
                {Object.keys(totalsByPaymentMethod).length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Totales por Metodo de Pago</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {Object.entries(totalsByPaymentMethod).map(([method, data]) => (
                                        <div key={method} className="flex justify-between text-sm">
                                            <span className="capitalize">{method}:</span>
                                            <span className="font-medium">
                                                {formatCurrency(data.total)} ({data.count} ventas)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Totales por Tipo de Documento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {Object.entries(totalsByDocumentType).map(([type, data]) => (
                                        <div key={type} className="flex justify-between text-sm">
                                            <span className="capitalize">{type.replace('_', ' ')}:</span>
                                            <span className="font-medium">
                                                {formatCurrency(data.total)} ({data.count} ventas)
                                            </span>
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
