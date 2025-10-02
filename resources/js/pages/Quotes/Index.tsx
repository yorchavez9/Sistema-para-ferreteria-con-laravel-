import { useState, Fragment } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Pencil,
    Trash2,
    Filter,
    Minus,
    Calendar,
    FileText,
    DollarSign,
    Calculator,
    Clock
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import Swal from 'sweetalert2';

interface Quote {
    id: number;
    quote_number: string;
    quote_date: string;
    expiration_date: string;
    status: string;
    total: number;
    customer: {
        id: number;
        name: string;
        document_number: string;
    } | null;
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
    total_quotes: number;
    total_amount: number;
    pending: number;
    approved: number;
    converted: number;
    expired: number;
}

interface Branch {
    id: number;
    name: string;
}

interface QuotesIndexProps {
    quotes: {
        data: Quote[];
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
        branch_id?: string;
        date_from?: string;
        date_to?: string;
        per_page?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cotizaciones', href: '/quotes' },
];

export default function QuotesIndex({ quotes, stats, branches, filters }: QuotesIndexProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [filterData, setFilterData] = useState({
        status: filters.status || '',
        branch_id: filters.branch_id || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        per_page: filters.per_page || '15',
    });
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const debouncedSearch = useDebouncedCallback((value: string) => {
        router.get('/quotes', {
            search: value,
            ...filterData,
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
        router.get('/quotes', {
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
            status: '',
            branch_id: '',
            date_from: '',
            date_to: '',
            per_page: '15',
        });
        router.get('/quotes', {
            per_page: '15',
        });
    };

    const toggleRowExpansion = (quoteId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(quoteId)) {
            newExpanded.delete(quoteId);
        } else {
            newExpanded.add(quoteId);
        }
        setExpandedRows(newExpanded);
    };

    const handleDelete = (quote: Quote) => {
        if (quote.status === 'convertida') {
            Swal.fire({
                title: 'No se puede eliminar',
                text: 'No se pueden eliminar cotizaciones convertidas a venta.',
                icon: 'error',
            });
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la cotización ${quote.quote_number}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/quotes/${quote.id}`, {
                    onSuccess: () => {
                        Swal.fire(
                            'Eliminada!',
                            'La cotización ha sido eliminada.',
                            'success'
                        );
                    }
                });
            }
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            pendiente: { label: 'Pendiente', variant: 'secondary' },
            aprobada: { label: 'Aprobada', variant: 'default' },
            rechazada: { label: 'Rechazada', variant: 'destructive' },
            convertida: { label: 'Convertida', variant: 'default' },
            vencida: { label: 'Vencida', variant: 'destructive' },
        };

        const config = statusConfig[status] || { label: status, variant: 'outline' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
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
            <Head title="Cotizaciones" />

            <div className="p-6 space-y-6">
             

                {/* Barra de búsqueda y filtros */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Buscar por número, cliente..."
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
                                <Link href="/quotes/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nueva Cotización
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Panel de filtros colapsable */}
                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted rounded-lg">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Estado</label>
                                    <Select
                                        value={filterData.status || "all"}
                                        onValueChange={(value) => setFilterData({ ...filterData, status: value === "all" ? "" : value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="pendiente">Pendiente</SelectItem>
                                            <SelectItem value="aprobada">Aprobada</SelectItem>
                                            <SelectItem value="rechazada">Rechazada</SelectItem>
                                            <SelectItem value="convertida">Convertida</SelectItem>
                                            <SelectItem value="vencida">Vencida</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Sucursal</label>
                                    <Select
                                        value={filterData.branch_id || "all"}
                                        onValueChange={(value) => setFilterData({ ...filterData, branch_id: value === "all" ? "" : value })}
                                    >
                                        <SelectTrigger>
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
                                    <label className="text-sm font-medium mb-2 block">Desde</label>
                                    <Input
                                        type="date"
                                        value={filterData.date_from}
                                        onChange={(e) => setFilterData({ ...filterData, date_from: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Hasta</label>
                                    <Input
                                        type="date"
                                        value={filterData.date_to}
                                        onChange={(e) => setFilterData({ ...filterData, date_to: e.target.value })}
                                    />
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

                {/* Tabla de cotizaciones */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="md:hidden w-10"></TableHead>
                                        <TableHead>N° Cotización</TableHead>
                                        <TableHead className="hidden md:table-cell">Cliente</TableHead>
                                        <TableHead className="hidden md:table-cell">Sucursal</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead className="hidden md:table-cell">Vence</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quotes.data.length > 0 ? (
                                        quotes.data.map((quote) => {
                                            const isExpanded = expandedRows.has(quote.id);
                                            return (
                                                <Fragment key={quote.id}>
                                                    <TableRow>
                                                        {/* Botón expandir (móvil) */}
                                                        <TableCell className="md:hidden w-10 p-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(quote.id)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                {isExpanded ? (
                                                                    <Minus className="h-4 w-4" />
                                                                ) : (
                                                                    <Plus className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </TableCell>

                                                        <TableCell className="font-medium">
                                                            {quote.quote_number}
                                                        </TableCell>

                                                        <TableCell className="hidden md:table-cell">
                                                            {quote.customer ? quote.customer.name : 'Sin cliente'}
                                                        </TableCell>

                                                        <TableCell className="hidden md:table-cell">
                                                            {quote.branch.name}
                                                        </TableCell>

                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(quote.quote_date)}
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="hidden md:table-cell">
                                                            {formatDate(quote.expiration_date)}
                                                        </TableCell>

                                                        <TableCell>
                                                            {getStatusBadge(quote.status)}
                                                        </TableCell>

                                                        <TableCell className="font-semibold">
                                                            {formatCurrency(quote.total)}
                                                        </TableCell>

                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Link href={`/quotes/${quote.id}`}>
                                                                    <Button variant="ghost" size="sm">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                                {(quote.status === 'pendiente' || quote.status === 'aprobada') && (
                                                                    <Link href={`/quotes/${quote.id}/edit`}>
                                                                        <Button variant="ghost" size="sm">
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                )}
                                                                {quote.status !== 'convertida' && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDelete(quote)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                )}
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
                                                                            <span className="text-muted-foreground font-medium">Cliente:</span>
                                                                            <p className="font-medium">{quote.customer ? quote.customer.name : 'Sin cliente'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-muted-foreground font-medium">Sucursal:</span>
                                                                            <p className="font-medium">{quote.branch.name}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div>
                                                                            <span className="text-muted-foreground font-medium">Vence:</span>
                                                                            <p className="font-medium">{formatDate(quote.expiration_date)}</p>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-muted-foreground font-medium">Vendedor:</span>
                                                                            <p className="font-medium">{quote.user.name}</p>
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
                                            <TableCell colSpan={9} className="text-center py-6">
                                                No se encontraron cotizaciones.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Paginación */}
                        {quotes.data.length > 0 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando {quotes.from} a {quotes.to} de {quotes.total} cotizaciones
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(`/quotes?page=${quotes.current_page - 1}`, filterData, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        })}
                                        disabled={quotes.current_page === 1}
                                    >
                                        Anterior
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(`/quotes?page=${quotes.current_page + 1}`, filterData, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        })}
                                        disabled={quotes.current_page === quotes.last_page}
                                    >
                                        Siguiente
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
