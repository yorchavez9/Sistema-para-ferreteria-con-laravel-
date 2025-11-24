import { useState, Fragment } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format-currency';
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
    Plus,
    Search,
    Eye,
    SquarePen,
    Trash2,
    Receipt,
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    Minus,
    Calendar,
    ShoppingCart
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import Swal from 'sweetalert2';

interface Sale {
    id: number;
    sale_number: string;
    series: string;
    correlativo: string;
    document_type: string;
    sale_date: string;
    status: string;
    payment_method: string;
    payment_type: string;
    remaining_balance?: number;
    total: number;
    customer: {
        id: number;
        name: string;
        document_number: string;
    };
    branch: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
    };
}

interface Stats {
    total_sales: number;
    total_amount: number;
    pending: number;
    paid: number;
    credit_sales: number;
    credit_balance: number;
}

interface Branch {
    id: number;
    name: string;
}

interface SalesIndexProps {
    sales: {
        data: Sale[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    stats: Stats;
    branches: Branch[];
    filters: {
        search?: string;
        status?: string;
        document_type?: string;
        payment_type?: string;
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
    { title: 'Ventas', href: '/sales' },
];

export default function SalesIndex({ sales, stats, branches, filters }: SalesIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [filterData, setFilterData] = useState({
        status: filters.status || '',
        document_type: filters.document_type || '',
        payment_type: filters.payment_type || '',
        branch_id: filters.branch_id || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        per_page: filters.per_page || '15',
    });
    const [sortField, setSortField] = useState(filters.sort_field || 'sale_date');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    // Búsqueda en tiempo real con debounce
    const debouncedSearch = useDebouncedCallback((value: string) => {
        router.get('/sales', {
            ...filterData,
            search: value,
            sort_field: sortField,
            sort_direction: sortDirection,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, 500);

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; className: string }> = {
            pendiente: { label: 'Pendiente', className: 'bg-amber-500 text-white' },
            pagado: { label: 'Pagado', className: 'bg-green-600 text-white' },
            cancelado: { label: 'Cancelado', className: 'bg-red-600 text-white' },
            anulado: { label: 'Anulado', className: 'bg-gray-500 text-white' },
        };

        const badge = badges[status] || { label: status, className: 'bg-gray-400' };
        return (
            <Badge variant="default" className={`${badge.className} text-xs`}>
                {badge.label}
            </Badge>
        );
    };

    const getDocumentTypeBadge = (type: string) => {
        const types: Record<string, { label: string; className: string }> = {
            boleta: { label: 'Boleta', className: 'bg-blue-100 text-blue-800 border-blue-300' },
            factura: { label: 'Factura', className: 'bg-purple-100 text-purple-800 border-purple-300' },
            nota_venta: { label: 'Nota', className: 'bg-gray-100 text-gray-800 border-gray-300' },
        };

        const badge = types[type] || { label: type, className: 'bg-gray-100' };
        return (
            <Badge variant="outline" className={`${badge.className} text-xs`}>
                {badge.label}
            </Badge>
        );
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleFilter = () => {
        router.get('/sales', {
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
            document_type: '',
            payment_type: '',
            branch_id: '',
            date_from: '',
            date_to: '',
            per_page: '15',
        };
        setFilterData(clearedFilters);
        setSearchTerm('');
        router.get('/sales', {
            ...clearedFilters,
            sort_field: sortField,
            sort_direction: sortDirection,
        });
    };

    const handleSort = (field: string) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);

        router.get('/sales', {
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
        router.get('/sales', {
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
        router.get(`/sales?page=${page}`, {
            ...filterData,
            search: searchTerm,
            sort_field: sortField,
            sort_direction: sortDirection,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleRowExpansion = (saleId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(saleId)) {
            newExpanded.delete(saleId);
        } else {
            newExpanded.add(saleId);
        }
        setExpandedRows(newExpanded);
    };

    const handleDelete = (sale: Sale) => {
        if (sale.status !== 'pendiente') {
            Swal.fire({
                title: 'No permitido',
                text: 'Solo se pueden eliminar ventas pendientes.',
                icon: 'warning',
            });
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la venta ${sale.sale_number}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/sales/${sale.id}`, {
                    onSuccess: () => {
                        Swal.fire('¡Eliminado!', 'La venta ha sido eliminada.', 'success');
                    },
                });
            }
        });
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
        return sortDirection === 'asc'
            ? <ArrowUp className="h-3 w-3 ml-1" />
            : <ArrowDown className="h-3 w-3 ml-1" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ventas" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Ventas</h1>
                        <p className="text-muted-foreground">Gestiona las ventas realizadas</p>
                    </div>
                    <Link href="/sales/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Venta
                        </Button>
                    </Link>
                </div>


                {/* Barra de Búsqueda */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por comprobante, cliente, documento..."
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
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                <div>
                                    <Label htmlFor="status">Estado</Label>
                                    <Select
                                        value={filterData.status || "all"}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, status: value === "all" ? "" : value })
                                        }
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="pendiente">Pendiente</SelectItem>
                                            <SelectItem value="pagado">Pagado</SelectItem>
                                            <SelectItem value="cancelado">Cancelado</SelectItem>
                                            <SelectItem value="anulado">Anulado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="document_type">Tipo Doc.</Label>
                                    <Select
                                        value={filterData.document_type || "all"}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, document_type: value === "all" ? "" : value })
                                        }
                                    >
                                        <SelectTrigger id="document_type">
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="boleta">Boleta</SelectItem>
                                            <SelectItem value="factura">Factura</SelectItem>
                                            <SelectItem value="nota_venta">Nota Venta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="payment_type">Tipo Pago</Label>
                                    <Select
                                        value={filterData.payment_type || "all"}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, payment_type: value === "all" ? "" : value })
                                        }
                                    >
                                        <SelectTrigger id="payment_type">
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="contado">Contado</SelectItem>
                                            <SelectItem value="credito">Crédito</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="branch_id">Sucursal</Label>
                                    <Select
                                        value={filterData.branch_id || "all"}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, branch_id: value === "all" ? "" : value })
                                        }
                                    >
                                        <SelectTrigger id="branch_id">
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
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

                                <div className="flex items-end gap-2 md:col-span-6">
                                    <Button onClick={handleFilter} className="flex-1 md:flex-none">
                                        Aplicar
                                    </Button>
                                    <Button onClick={clearFilters} variant="outline" className="flex-1 md:flex-none">
                                        Limpiar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                                    {/* Columna + (solo móvil) */}
                                    <TableHead className="md:hidden w-10"></TableHead>

                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('sale_number')}
                                    >
                                        <div className="flex items-center">
                                            Comprobante
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
                                        onClick={() => handleSort('sale_date')}
                                    >
                                        <div className="flex items-center">
                                            Fecha
                                            <SortIcon field="sale_date" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">Tipo/Pago</TableHead>
                                    <TableHead
                                        className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center">
                                            Estado
                                            <SortIcon field="status" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="hidden md:table-cell text-right cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('total')}
                                    >
                                        <div className="flex items-center justify-end">
                                            Total
                                            <SortIcon field="total" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.data.length > 0 ? (
                                    sales.data.map((sale) => {
                                        const isExpanded = expandedRows.has(sale.id);
                                        return (
                                            <Fragment key={sale.id}>
                                                <TableRow>
                                                    {/* Botón expandir (solo móvil) */}
                                                    <TableCell className="md:hidden w-10 p-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleRowExpansion(sale.id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            {isExpanded ? (
                                                                <Minus className="h-4 w-4" />
                                                            ) : (
                                                                <Plus className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </TableCell>

                                                    {/* Comprobante */}
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Receipt className="h-4 w-4 text-muted-foreground hidden md:block" />
                                                            <div>
                                                                <Link
                                                                    href={`/sales/${sale.id}`}
                                                                    className="font-mono text-sm text-primary hover:underline font-semibold"
                                                                >
                                                                    {sale.series}-{sale.correlativo}
                                                                </Link>
                                                                <div className="flex items-center gap-1 mt-0.5">
                                                                    {getDocumentTypeBadge(sale.document_type)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Info móvil condensada */}
                                                        <div className="md:hidden mt-2 space-y-1">
                                                            <p className="text-xs text-muted-foreground">
                                                                {sale.customer.name}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-base text-green-600">
                                                                    {formatCurrency(sale.total)}
                                                                </span>
                                                                {getStatusBadge(sale.status)}
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Cliente (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <div>
                                                            <p className="text-sm font-medium">{sale.customer.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {sale.customer.document_number}
                                                            </p>
                                                        </div>
                                                    </TableCell>

                                                    {/* Fecha (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <span className="text-sm">{formatDate(sale.sale_date)}</span>
                                                    </TableCell>

                                                    {/* Tipo/Pago (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <div className="space-y-1">
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-xs ${
                                                                    sale.payment_type === 'credito'
                                                                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                                                                        : 'bg-blue-100 text-blue-800 border-blue-300'
                                                                }`}
                                                            >
                                                                {sale.payment_type === 'credito' ? 'Crédito' : 'Contado'}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>

                                                    {/* Estado (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        {getStatusBadge(sale.status)}
                                                    </TableCell>

                                                    {/* Total (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell text-right">
                                                        <div>
                                                            <span className="font-semibold text-base">
                                                                {formatCurrency(sale.total)}
                                                            </span>
                                                            {sale.payment_type === 'credito' &&
                                                                sale.remaining_balance !== undefined &&
                                                                sale.remaining_balance > 0 && (
                                                                    <div className="text-xs text-orange-600 font-medium">
                                                                        Saldo: {formatCurrency(sale.remaining_balance)}
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </TableCell>

                                                    {/* Acciones (solo desktop) */}
                                                    <TableCell className="hidden md:table-cell text-center">
                                                        <div className="flex justify-center gap-1">
                                                            <Link href={`/sales/${sale.id}`}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            {(sale.status === 'pendiente' || sale.status === 'pagado') && (
                                                                <>
                                                                    <Link href={`/sales/${sale.id}/edit`}>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0"
                                                                        >
                                                                            <SquarePen className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDelete(sale)}
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
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
                                                                            {sale.customer.document_number}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Fecha Venta
                                                                        </p>
                                                                        <p className="font-medium text-sm flex items-center gap-1">
                                                                            <Calendar className="h-3 w-3" />
                                                                            {formatDate(sale.sale_date)}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Tipo de Pago
                                                                        </p>
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={`text-xs ${
                                                                                sale.payment_type === 'credito'
                                                                                    ? 'bg-orange-100 text-orange-800'
                                                                                    : 'bg-blue-100 text-blue-800'
                                                                            }`}
                                                                        >
                                                                            {sale.payment_type === 'credito'
                                                                                ? 'Crédito'
                                                                                : 'Contado'}
                                                                        </Badge>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Sucursal
                                                                        </p>
                                                                        <p className="font-medium text-sm">
                                                                            {sale.branch.name}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {sale.payment_type === 'credito' &&
                                                                    sale.remaining_balance !== undefined &&
                                                                    sale.remaining_balance > 0 && (
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                                Saldo Pendiente
                                                                            </p>
                                                                            <p className="font-bold text-base text-orange-600">
                                                                                {formatCurrency(sale.remaining_balance)}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                <div>
                                                                    <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                        Vendedor
                                                                    </p>
                                                                    <p className="font-medium text-sm">{sale.user.name}</p>
                                                                </div>

                                                                {/* Acciones en móvil */}
                                                                <div className="pt-2 border-t">
                                                                    <p className="text-xs text-muted-foreground uppercase font-medium mb-2">
                                                                        Acciones
                                                                    </p>
                                                                    <div className="flex gap-2">
                                                                        <Link href={`/sales/${sale.id}`} className="flex-1">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="w-full h-9"
                                                                            >
                                                                                <Eye className="h-4 w-4 mr-2" />
                                                                                Ver Detalles
                                                                            </Button>
                                                                        </Link>
                                                                        {(sale.status === 'pendiente' || sale.status === 'pagado') && (
                                                                            <>
                                                                                <Link
                                                                                    href={`/sales/${sale.id}/edit`}
                                                                                    className="flex-1"
                                                                                >
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant="outline"
                                                                                        className="w-full h-9"
                                                                                    >
                                                                                        <SquarePen className="h-4 w-4 mr-2" />
                                                                                        Editar
                                                                                    </Button>
                                                                                </Link>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="destructive"
                                                                                    onClick={() => handleDelete(sale)}
                                                                                    className="h-9"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </>
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
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                                            <p className="mt-2 text-muted-foreground">No se encontraron ventas</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Paginación */}
                        {sales.data.length > 0 && (
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
                                                    variant={sales.current_page === pageNum ? 'default' : 'outline'}
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
