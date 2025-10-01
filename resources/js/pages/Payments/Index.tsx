import { useState, Fragment } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    DollarSign,
    AlertTriangle,
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    Filter,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    Printer,
    Plus,
    Minus,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useDebouncedCallback } from 'use-debounce';

interface Customer {
    id: number;
    name: string;
    document_number: string;
}

interface Branch {
    id: number;
    name: string;
}

interface Sale {
    id: number;
    series: string;
    correlativo: string;
    customer: Customer;
    branch: Branch;
    total: number;
    remaining_balance: number;
}

interface Payment {
    id: number;
    sale_id: number;
    sale: Sale;
    payment_number: number;
    amount: number;
    due_date: string;
    paid_date: string | null;
    status: 'pendiente' | 'pagado' | 'vencido';
    payment_method: string | null;
    transaction_reference: string | null;
    notes: string | null;
}

interface Stats {
    overdue: number;
    due_soon: number;
    pending: number;
    overdue_amount: number;
    pending_amount: number;
}

interface PaymentsIndexProps {
    payments: {
        data: Payment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    stats: Stats;
    branches: { id: number; name: string }[];
    filters: {
        search?: string;
        status?: string;
        branch_id?: string;
        date_from?: string;
        date_to?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Gestión de Pagos', href: '#' },
];

export default function PaymentsIndex({ payments, stats, branches, filters }: PaymentsIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [filterData, setFilterData] = useState({
        status: filters.status || '',
        branch_id: filters.branch_id || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        per_page: filters.per_page || '15',
    });
    const [sortField, setSortField] = useState(filters.sort_field || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    // Búsqueda en tiempo real con debounce
    const debouncedSearch = useDebouncedCallback((value: string) => {
        router.get('/payments', {
            ...filterData,
            search: value,
            sort_field: sortField,
            sort_direction: sortDirection,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, 500);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const getDaysUntilDue = (dueDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const getStatusBadge = (payment: Payment) => {
        if (payment.status === 'pagado') {
            return (
                <Badge variant="default" className="bg-green-600 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Pagado
                </Badge>
            );
        }

        if (payment.status === 'vencido') {
            const daysOverdue = Math.abs(getDaysUntilDue(payment.due_date));
            return (
                <Badge variant="destructive" className="text-xs">
                    <XCircle className="h-3 w-3 mr-1" />
                    Vencido ({daysOverdue}d)
                </Badge>
            );
        }

        const daysUntil = getDaysUntilDue(payment.due_date);
        if (daysUntil <= 7 && daysUntil >= 0) {
            return (
                <Badge variant="default" className="bg-amber-500 text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Vence en {daysUntil}d
                </Badge>
            );
        }

        return (
            <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Pendiente
            </Badge>
        );
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleFilter = () => {
        router.get('/payments', {
            ...filterData,
            search: searchTerm,
            sort_field: sortField,
            sort_direction: sortDirection,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        const clearedFilters = {
            status: '',
            branch_id: '',
            date_from: '',
            date_to: '',
            per_page: '15',
        };
        setFilterData(clearedFilters);
        setSearchTerm('');
        router.get('/payments', {
            ...clearedFilters,
            sort_field: sortField,
            sort_direction: sortDirection,
        });
    };

    const handleSort = (field: string) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);

        router.get('/payments', {
            ...filterData,
            search: searchTerm,
            sort_field: field,
            sort_direction: newDirection,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePerPageChange = (value: string) => {
        setFilterData({ ...filterData, per_page: value });
        router.get('/payments', {
            ...filterData,
            per_page: value,
            search: searchTerm,
            sort_field: sortField,
            sort_direction: sortDirection,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get(`/payments?page=${page}`, {
            ...filterData,
            search: searchTerm,
            sort_field: sortField,
            sort_direction: sortDirection,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePay = (paymentId: number) => {
        router.get(`/payments/${paymentId}/pay`);
    };

    const handlePrintVoucher = (paymentId: number) => {
        // Abrir el voucher en una nueva ventana para imprimir
        window.open(`/payments/${paymentId}/voucher?size=80mm&preview=true`, '_blank');
    };

    const toggleRowExpansion = (paymentId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(paymentId)) {
            newExpanded.delete(paymentId);
        } else {
            newExpanded.add(paymentId);
        }
        setExpandedRows(newExpanded);
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
        return sortDirection === 'asc'
            ? <ArrowUp className="h-3 w-3 ml-1" />
            : <ArrowDown className="h-3 w-3 ml-1" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Pagos" />

            <div className="space-y-6 p-6">
                {/* Barra de Búsqueda */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por venta, cliente, documento, cuota..."
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

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Vencidos</p>
                                    <p className="text-xl font-bold text-red-600 mt-1">{stats.overdue}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatCurrency(stats.overdue_amount)}
                                    </p>
                                </div>
                                <XCircle className="h-6 w-6 text-red-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Vencen Pronto</p>
                                    <p className="text-xl font-bold text-amber-600 mt-1">{stats.due_soon}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Próx. 7 días</p>
                                </div>
                                <AlertTriangle className="h-6 w-6 text-amber-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Pendientes</p>
                                    <p className="text-xl font-bold text-blue-600 mt-1">{stats.pending}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatCurrency(stats.pending_amount)}
                                    </p>
                                </div>
                                <Clock className="h-6 w-6 text-blue-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros */}
                {showFilters && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Filtros Avanzados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div>
                                    <Label htmlFor="status">Estado</Label>
                                    <Select
                                        value={filterData.status}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, status: value })
                                        }
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Todos</SelectItem>
                                            <SelectItem value="pendiente">Pendiente</SelectItem>
                                            <SelectItem value="vencido">Vencido</SelectItem>
                                            <SelectItem value="pagado">Pagado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
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

                                <div>
                                    <Label htmlFor="date_from">Desde</Label>
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={filterData.date_from}
                                        onChange={(e) =>
                                            setFilterData({ ...filterData, date_from: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="date_to">Hasta</Label>
                                    <Input
                                        id="date_to"
                                        type="date"
                                        value={filterData.date_to}
                                        onChange={(e) =>
                                            setFilterData({ ...filterData, date_to: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="flex items-end gap-2">
                                    <Button onClick={handleFilter} className="flex-1">
                                        Aplicar
                                    </Button>
                                    <Button onClick={clearFilters} variant="outline">
                                        Limpiar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabla de Pagos */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Lista de Pagos</CardTitle>
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
                                    {/* Columna + (solo móvil) */}
                                    <TableHead className="md:hidden w-10"></TableHead>

                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('sale_number')}
                                    >
                                        <div className="flex items-center">
                                            Venta
                                            <SortIcon field="sale_number" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('customer')}
                                    >
                                        <div className="flex items-center">
                                            Cliente
                                            <SortIcon field="customer" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('payment_number')}
                                    >
                                        <div className="flex items-center">
                                            Cuota
                                            <SortIcon field="payment_number" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="hidden md:table-cell text-right cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('amount')}
                                    >
                                        <div className="flex items-center justify-end">
                                            Monto
                                            <SortIcon field="amount" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('due_date')}
                                    >
                                        <div className="flex items-center">
                                            Vencimiento
                                            <SortIcon field="due_date" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center">
                                            Estado
                                            <SortIcon field="status" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.data.length > 0 ? (
                                    payments.data.map((payment) => {
                                        const isExpanded = expandedRows.has(payment.id);
                                        return (
                                            <Fragment key={payment.id}>
                                                <TableRow>
                                                    {/* Botón expandir (solo móvil) */}
                                                    <TableCell className="md:hidden w-10 p-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleRowExpansion(payment.id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            {isExpanded ? (
                                                                <Minus className="h-4 w-4" />
                                                            ) : (
                                                                <Plus className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </TableCell>

                                                    {/* Venta (visible siempre) */}
                                                    <TableCell>
                                                        <Link
                                                            href={`/payments/sales/${payment.sale_id}`}
                                                            className="font-mono text-sm text-primary hover:underline font-semibold"
                                                        >
                                                            {payment.sale.series}-{payment.sale.correlativo}
                                                        </Link>
                                                        {/* Info móvil condensada */}
                                                        <div className="md:hidden mt-1 space-y-1">
                                                            <p className="text-xs text-muted-foreground">
                                                                {payment.sale.customer.name}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-semibold">Cuota {payment.payment_number}</span>
                                                                <span className="font-semibold text-sm text-green-600">
                                                                    {formatCurrency(payment.amount)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Cliente (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <div>
                                                            <p className="text-sm font-medium">{payment.sale.customer.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {payment.sale.customer.document_number}
                                                            </p>
                                                        </div>
                                                    </TableCell>

                                                    {/* Cuota (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <span className="text-sm font-semibold">Cuota {payment.payment_number}</span>
                                                    </TableCell>

                                                    {/* Monto (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell text-right">
                                                        <span className="font-semibold text-base">
                                                            {formatCurrency(payment.amount)}
                                                        </span>
                                                    </TableCell>

                                                    {/* Vencimiento (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <span className="text-sm">{formatDate(payment.due_date)}</span>
                                                    </TableCell>

                                                    {/* Estado (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        {getStatusBadge(payment)}
                                                    </TableCell>

                                                    {/* Acciones (solo desktop) */}
                                                    <TableCell className="hidden md:table-cell text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {payment.status === 'pendiente' || payment.status === 'vencido' ? (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handlePay(payment.id)}
                                                                    className="text-xs h-8"
                                                                >
                                                                    <DollarSign className="h-3 w-3 mr-1" />
                                                                    Registrar
                                                                </Button>
                                                            ) : (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handlePrintVoucher(payment.id)}
                                                                        className="text-xs h-8"
                                                                        title="Imprimir voucher"
                                                                    >
                                                                        <Printer className="h-3 w-3 mr-1" />
                                                                        Voucher
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>

                                                {/* Fila expandida (solo móvil) */}
                                                {isExpanded && (
                                                    <TableRow className="md:hidden bg-muted/50">
                                                        <TableCell colSpan={2} className="p-4">
                                                            <div className="space-y-3 text-sm">
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Documento Cliente
                                                                        </p>
                                                                        <p className="font-medium text-sm">
                                                                            {payment.sale.customer.document_number}
                                                                        </p>
                                                                    </div>

                                                                    {payment.sale.branch && (
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                                Sucursal
                                                                            </p>
                                                                            <p className="font-medium text-sm">
                                                                                {payment.sale.branch.name}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                        Fecha de Vencimiento
                                                                    </p>
                                                                    <p className="font-medium text-sm flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {formatDate(payment.due_date)}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                        Estado
                                                                    </p>
                                                                    <div className="mt-1">
                                                                        {getStatusBadge(payment)}
                                                                    </div>
                                                                </div>

                                                                {/* Acciones en móvil */}
                                                                <div className="pt-2 border-t">
                                                                    <p className="text-xs text-muted-foreground uppercase font-medium mb-2">
                                                                        Acciones
                                                                    </p>
                                                                    <div className="flex gap-2">
                                                                        {payment.status === 'pendiente' || payment.status === 'vencido' ? (
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() => handlePay(payment.id)}
                                                                                className="flex-1 h-9"
                                                                            >
                                                                                <DollarSign className="h-4 w-4 mr-2" />
                                                                                Registrar Pago
                                                                            </Button>
                                                                        ) : (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => handlePrintVoucher(payment.id)}
                                                                                className="flex-1 h-9"
                                                                            >
                                                                                <Printer className="h-4 w-4 mr-2" />
                                                                                Imprimir Voucher
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                                            <p className="mt-2 text-muted-foreground">No hay pagos registrados</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Paginación */}
                        {payments.data.length > 0 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium">{payments.from}</span> a{' '}
                                    <span className="font-medium">{payments.to}</span> de{' '}
                                    <span className="font-medium">{payments.total}</span> resultados
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(payments.current_page - 1)}
                                        disabled={payments.current_page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Anterior
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, payments.last_page) }, (_, i) => {
                                            let pageNum;
                                            if (payments.last_page <= 5) {
                                                pageNum = i + 1;
                                            } else if (payments.current_page <= 3) {
                                                pageNum = i + 1;
                                            } else if (payments.current_page >= payments.last_page - 2) {
                                                pageNum = payments.last_page - 4 + i;
                                            } else {
                                                pageNum = payments.current_page - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={payments.current_page === pageNum ? 'default' : 'outline'}
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
                                        onClick={() => handlePageChange(payments.current_page + 1)}
                                        disabled={payments.current_page === payments.last_page}
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
