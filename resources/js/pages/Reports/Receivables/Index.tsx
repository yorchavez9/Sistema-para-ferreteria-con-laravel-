import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
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
    AlertCircle,
    Eye,
    Filter,
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
    { title: 'Cuentas por Cobrar', href: '/reports/receivables' },
];

interface SaleWithPayments {
    sale: {
        id: number;
        sale_number: string;
        sale_date: string;
        customer: {
            id: number;
            name: string;
            document_number?: string;
        };
        branch: {
            name: string;
        };
        user: {
            name: string;
        };
        total: number;
        initial_payment: number;
        remaining_balance: number;
        credit_days: number;
        installments: number;
        payments: Array<{
            id: number;
            payment_number: number;
            amount: number;
            due_date: string;
            paid_date?: string;
            status: string;
        }>;
    };
    total_installments: number;
    paid_installments: number;
    pending_installments: number;
    has_overdue: boolean;
    overdue_count: number;
    max_days_overdue: number;
}

interface Props {
    sales: {
        data: SaleWithPayments[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    totals: {
        total_sales: number;
        total_amount: number;
        total_paid: number;
        total_pending: number;
        total_overdue: number;
    };
    customers: Array<{ id: number; name: string }>;
    branches: Array<{ id: number; name: string }>;
    filters: {
        search?: string;
        date_from?: string;
        date_to?: string;
        customer_id?: string;
        branch_id?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: string;
    };
}

export default function ReceivablesReport({
    sales = { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 },
    totals = { total_sales: 0, total_amount: 0, total_paid: 0, total_pending: 0, total_overdue: 0 },
    customers = [],
    branches = [],
    filters: initialFilters = {},
}: Props) {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [sortField, setSortField] = useState(initialFilters.sort_field || 'sale_date');
    const [sortDirection, setSortDirection] = useState(initialFilters.sort_direction || 'desc');
    const [filterData, setFilterData] = useState({
        date_from: initialFilters.date_from || '',
        date_to: initialFilters.date_to || '',
        customer_id: initialFilters.customer_id || '',
        branch_id: initialFilters.branch_id || '',
        per_page: initialFilters.per_page || '15',
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [expandedSales, setExpandedSales] = useState<Set<number>>(new Set());

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

        router.get('/reports/receivables', params, {
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

        router.get('/reports/receivables', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        const clearedFilters = {
            date_from: '',
            date_to: '',
            customer_id: '',
            branch_id: '',
            per_page: '15',
        };
        setFilterData(clearedFilters);
        setSearchTerm('');

        router.get('/reports/receivables', {
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

        router.get('/reports/receivables', params, {
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

        router.get('/reports/receivables', params, {
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

        router.get('/reports/receivables', params, {
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
        window.open(`/reports/receivables/pdf?${queryString}`, '_blank');
        setTimeout(() => setIsGenerating(false), 1000);
    };

    const toggleExpanded = (saleId: number) => {
        setExpandedSales((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(saleId)) {
                newSet.delete(saleId);
            } else {
                newSet.add(saleId);
            }
            return newSet;
        });
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            pendiente: 'bg-yellow-100 text-yellow-800',
            vencido: 'bg-red-100 text-red-800',
            pagado: 'bg-green-100 text-green-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getDaysOverdueBadge = (days: number) => {
        if (days > 30) return 'bg-red-600 text-white';
        if (days > 15) return 'bg-orange-500 text-white';
        if (days > 0) return 'bg-yellow-500 text-white';
        return 'bg-gray-200 text-gray-700';
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
        return sortDirection === 'asc'
            ? <ArrowUp className="h-3 w-3 ml-1" />
            : <ArrowDown className="h-3 w-3 ml-1" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cuentas por Cobrar" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Cuentas por Cobrar</h1>
                        <p className="text-muted-foreground">
                            Seguimiento de ventas a crédito y pagos pendientes
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
                                    placeholder="Buscar por número de venta, cliente, documento..."
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

                {/* Filtros Avanzados */}
                {showFilters && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Filtros Avanzados</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                    <Label htmlFor="customer_id">Cliente</Label>
                                    <Select
                                        value={filterData.customer_id}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, customer_id: value })
                                        }
                                    >
                                        <SelectTrigger id="customer_id">
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Todos</SelectItem>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                                    {customer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

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

                {/* Resumen */}
                {totals && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <Card>
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Ventas a Crédito</div>
                                <div className="text-2xl font-bold">{totals.total_sales}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Total Vendido</div>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(totals.total_amount)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Total Cobrado</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(totals.total_paid)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-muted-foreground">Por Cobrar</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(totals.total_pending)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-red-50">
                            <CardContent className="pt-5 pb-4">
                                <div className="text-sm text-red-800">Vencido</div>
                                <div className="text-2xl font-bold text-red-600">
                                    {formatCurrency(totals.total_overdue)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Alerta */}
                {totals && totals.total_overdue > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    <strong>¡Atención!</strong> Hay {formatCurrency(totals.total_overdue)} en
                                    cuentas vencidas. Se recomienda contactar a los clientes para gestionar el
                                    cobro.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla de Ventas */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Cuentas por Cobrar</CardTitle>
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
                                            N° Venta
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
                                    <TableHead>Sucursal</TableHead>
                                    <TableHead
                                        className="text-right cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('total')}
                                    >
                                        <div className="flex items-center justify-end">
                                            Total
                                            <SortIcon field="total" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">Inicial</TableHead>
                                    <TableHead
                                        className="text-right cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('remaining_balance')}
                                    >
                                        <div className="flex items-center justify-end">
                                            Saldo
                                            <SortIcon field="remaining_balance" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center">Cuotas</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                    <TableHead className="text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales?.data && sales.data.length > 0 ? (
                                    sales.data.map((item) => (
                                        <>
                                            <TableRow
                                                key={item.sale.id}
                                                className={item.has_overdue ? 'bg-red-50' : ''}
                                            >
                                                <TableCell className="font-mono font-medium">
                                                    {item.sale.sale_number}
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(item.sale.sale_date), 'dd/MM/yyyy')}
                                                </TableCell>
                                                <TableCell>{item.sale.customer.name}</TableCell>
                                                <TableCell>{item.sale.branch.name}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(item.sale.total)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(item.sale.initial_payment)}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-blue-600">
                                                    {formatCurrency(item.sale.remaining_balance)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-sm">
                                                        {item.paid_installments} / {item.total_installments}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {item.has_overdue ? (
                                                        <Badge
                                                            className={getDaysOverdueBadge(
                                                                item.max_days_overdue
                                                            )}
                                                        >
                                                            {item.max_days_overdue} días atraso
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                                            Al día
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2 justify-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleExpanded(item.sale.id)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/payments/sales/${item.sale.id}`}>
                                                                Ver Pagos
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {/* Detalle de cuotas expandible */}
                                            {expandedSales.has(item.sale.id) && (
                                                <TableRow>
                                                    <TableCell colSpan={10} className="p-4 bg-gray-50">
                                                        <div className="text-sm font-semibold mb-2">
                                                            Detalle de Cuotas:
                                                        </div>
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="p-2 text-left">Cuota</th>
                                                                    <th className="p-2 text-right">Monto</th>
                                                                    <th className="p-2 text-center">
                                                                        Vencimiento
                                                                    </th>
                                                                    <th className="p-2 text-center">
                                                                        Fecha Pago
                                                                    </th>
                                                                    <th className="p-2 text-center">Estado</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {item.sale.payments.map((payment) => (
                                                                    <tr
                                                                        key={payment.id}
                                                                        className="border-b"
                                                                    >
                                                                        <td className="p-2">
                                                                            Cuota #{payment.payment_number}
                                                                        </td>
                                                                        <td className="p-2 text-right">
                                                                            {formatCurrency(payment.amount)}
                                                                        </td>
                                                                        <td className="p-2 text-center">
                                                                            {format(
                                                                                new Date(payment.due_date),
                                                                                'dd/MM/yyyy'
                                                                            )}
                                                                        </td>
                                                                        <td className="p-2 text-center">
                                                                            {payment.paid_date
                                                                                ? format(
                                                                                      new Date(
                                                                                          payment.paid_date
                                                                                      ),
                                                                                      'dd/MM/yyyy'
                                                                                  )
                                                                                : '-'}
                                                                        </td>
                                                                        <td className="p-2 text-center">
                                                                            <span
                                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(
                                                                                    payment.status
                                                                                )}`}
                                                                            >
                                                                                {payment.status}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8">
                                            <p className="text-muted-foreground">
                                                No se encontraron cuentas por cobrar con los filtros aplicados
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Paginación */}
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
            </div>
        </AppLayout>
    );
}
