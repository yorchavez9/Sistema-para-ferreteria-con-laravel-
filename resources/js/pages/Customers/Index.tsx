import { useState, Fragment } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    Plus,
    Eye,
    Pencil,
    Trash2,
    User,
    Building2,
    Phone,
    Mail,
    Users,
    CheckCircle,
    UserCircle,
    Search,
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Minus,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import Swal from 'sweetalert2';

interface Customer {
    id: number;
    name: string;
    code: string;
    document_type: string | null;
    document_number: string | null;
    email: string | null;
    phone: string | null;
    customer_type: string;
    payment_terms: string;
    credit_limit: number;
    is_active: boolean;
}

interface Stats {
    total_customers: number;
    active_customers: number;
    personal_customers: number;
    business_customers: number;
}

interface CustomersIndexProps {
    customers: {
        data: Customer[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    stats: Stats;
    filters: {
        search?: string;
        is_active?: string;
        customer_type?: string;
        document_type?: string;
        payment_terms?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Clientes', href: '/customers' },
];

const customerTypeLabels: Record<string, string> = {
    'personal': 'Personal',
    'empresa': 'Empresa',
};

const paymentTermsLabels: Record<string, string> = {
    'contado': 'Contado',
    'credito_15': 'Crédito 15 días',
    'credito_30': 'Crédito 30 días',
    'credito_45': 'Crédito 45 días',
    'credito_60': 'Crédito 60 días',
};

export default function CustomersIndex({ customers, stats, filters }: CustomersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filterData, setFilterData] = useState({
        is_active: filters.is_active || '',
        customer_type: filters.customer_type || '',
        document_type: filters.document_type || '',
        payment_terms: filters.payment_terms || '',
        per_page: filters.per_page?.toString() || '15',
    });
    const [sortField, setSortField] = useState(filters.sort_field || 'name');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'asc');
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

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

        // Solo agregar filtros si tienen valor
        if (filterData.is_active) params.is_active = filterData.is_active;
        if (filterData.customer_type) params.customer_type = filterData.customer_type;
        if (filterData.document_type) params.document_type = filterData.document_type;
        if (filterData.payment_terms) params.payment_terms = filterData.payment_terms;

        router.get('/customers', params, {
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

        // Solo agregar filtros si tienen valor
        if (filterData.is_active) params.is_active = filterData.is_active;
        if (filterData.customer_type) params.customer_type = filterData.customer_type;
        if (filterData.document_type) params.document_type = filterData.document_type;
        if (filterData.payment_terms) params.payment_terms = filterData.payment_terms;

        router.get('/customers', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        const clearedFilters = {
            is_active: '',
            customer_type: '',
            document_type: '',
            payment_terms: '',
            per_page: '15',
        };
        setFilterData(clearedFilters);
        setSearchTerm('');

        router.get('/customers', {
            per_page: '15',
            sort_field: sortField,
            sort_direction: sortDirection,
        }, {
            preserveState: true,
            preserveScroll: true,
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

        // Solo agregar filtros si tienen valor
        if (filterData.is_active) params.is_active = filterData.is_active;
        if (filterData.customer_type) params.customer_type = filterData.customer_type;
        if (filterData.document_type) params.document_type = filterData.document_type;
        if (filterData.payment_terms) params.payment_terms = filterData.payment_terms;

        router.get('/customers', params, {
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

        // Solo agregar filtros si tienen valor
        if (filterData.is_active) params.is_active = filterData.is_active;
        if (filterData.customer_type) params.customer_type = filterData.customer_type;
        if (filterData.document_type) params.document_type = filterData.document_type;
        if (filterData.payment_terms) params.payment_terms = filterData.payment_terms;

        router.get('/customers', params, {
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

        // Solo agregar filtros si tienen valor
        if (filterData.is_active) params.is_active = filterData.is_active;
        if (filterData.customer_type) params.customer_type = filterData.customer_type;
        if (filterData.document_type) params.document_type = filterData.document_type;
        if (filterData.payment_terms) params.payment_terms = filterData.payment_terms;

        router.get('/customers', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleRowExpansion = (customerId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(customerId)) {
            newExpanded.delete(customerId);
        } else {
            newExpanded.add(customerId);
        }
        setExpandedRows(newExpanded);
    };

    const handleDelete = (customer: Customer) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el cliente "${customer.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/customers/${customer.id}`, {
                    onSuccess: () => {
                        Swal.fire('¡Eliminado!', 'El cliente ha sido eliminado.', 'success');
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
            <Head title="Clientes" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Clientes</h1>
                        <p className="text-muted-foreground">Gestiona la información de tus clientes</p>
                    </div>
                    <Link href="/customers/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Cliente
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
                                    placeholder="Buscar por nombre, código, documento, email o teléfono..."
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
                                <div>
                                    <Label htmlFor="status">Estado</Label>
                                    <Select
                                        value={filterData.is_active || 'all'}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, is_active: value === 'all' ? '' : value })
                                        }
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="1">Activos</SelectItem>
                                            <SelectItem value="0">Inactivos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="customer_type">Tipo de Cliente</Label>
                                    <Select
                                        value={filterData.customer_type || 'all'}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, customer_type: value === 'all' ? '' : value })
                                        }
                                    >
                                        <SelectTrigger id="customer_type">
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="personal">Personal</SelectItem>
                                            <SelectItem value="empresa">Empresa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="document_type">Tipo Documento</Label>
                                    <Select
                                        value={filterData.document_type || 'all'}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, document_type: value === 'all' ? '' : value })
                                        }
                                    >
                                        <SelectTrigger id="document_type">
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="RUC">RUC</SelectItem>
                                            <SelectItem value="DNI">DNI</SelectItem>
                                            <SelectItem value="CE">CE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-end gap-2">
                                    <Button onClick={handleFilter} className="flex-1">
                                        Aplicar
                                    </Button>
                                    <Button onClick={clearFilters} variant="outline" className="flex-1">
                                        Limpiar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabla de Clientes */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Lista de Clientes</CardTitle>
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
                                            Cliente
                                            <SortIcon field="name" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">Documento</TableHead>
                                    <TableHead className="hidden md:table-cell">Tipo</TableHead>
                                    <TableHead className="hidden md:table-cell">Contacto</TableHead>
                                    <TableHead
                                        className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('is_active')}
                                    >
                                        <div className="flex items-center">
                                            Estado
                                            <SortIcon field="is_active" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.data.length > 0 ? (
                                    customers.data.map((customer) => {
                                        const isExpanded = expandedRows.has(customer.id);
                                        return (
                                            <Fragment key={customer.id}>
                                                <TableRow>
                                                    {/* Botón expandir (solo móvil) */}
                                                    <TableCell className="md:hidden w-10 p-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleRowExpansion(customer.id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            {isExpanded ? (
                                                                <Minus className="h-4 w-4" />
                                                            ) : (
                                                                <Plus className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </TableCell>

                                                    {/* Código */}
                                                    <TableCell className="font-mono text-sm">{customer.code}</TableCell>

                                                    {/* Cliente */}
                                                    <TableCell>
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                {customer.customer_type === 'empresa' ? (
                                                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                                ) : (
                                                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                                )}
                                                                <p className="text-sm font-medium">{customer.name}</p>
                                                            </div>
                                                            {/* Info móvil condensada */}
                                                            <div className="md:hidden mt-1 space-y-1">
                                                                {customer.document_number && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {customer.document_type}: {customer.document_number}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-2">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                    >
                                                                        {customerTypeLabels[customer.customer_type]}
                                                                    </Badge>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`text-xs ${
                                                                            customer.is_active
                                                                                ? 'bg-green-100 text-green-800 border-green-300'
                                                                                : 'bg-red-100 text-red-800 border-red-300'
                                                                        }`}
                                                                    >
                                                                        {customer.is_active ? 'Activo' : 'Inactivo'}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Documento (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        {customer.document_type && customer.document_number ? (
                                                            <div className="text-sm">
                                                                <span className="font-medium">{customer.document_type}:</span>{' '}
                                                                <span className="font-mono">{customer.document_number}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">-</span>
                                                        )}
                                                    </TableCell>

                                                    {/* Tipo (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <Badge variant="outline" className="text-xs">
                                                            {customerTypeLabels[customer.customer_type]}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Contacto (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <div className="space-y-0.5 text-xs">
                                                            {customer.phone && (
                                                                <div className="flex items-center gap-1">
                                                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                                                    <span>{customer.phone}</span>
                                                                </div>
                                                            )}
                                                            {customer.email && (
                                                                <div className="flex items-center gap-1">
                                                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="truncate max-w-[150px]">{customer.email}</span>
                                                                </div>
                                                            )}
                                                            {!customer.phone && !customer.email && (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    {/* Estado (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${
                                                                customer.is_active
                                                                    ? 'bg-green-100 text-green-800 border-green-300'
                                                                    : 'bg-red-100 text-red-800 border-red-300'
                                                            }`}
                                                        >
                                                            {customer.is_active ? 'Activo' : 'Inactivo'}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Acciones (solo desktop) */}
                                                    <TableCell className="hidden md:table-cell text-center">
                                                        <div className="flex justify-center gap-1">
                                                            <Link href={`/customers/${customer.id}`}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/customers/${customer.id}/edit`}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(customer)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>

                                                {/* Fila expandida (solo móvil) */}
                                                {isExpanded && (
                                                    <TableRow className="md:hidden bg-muted/50">
                                                        <TableCell colSpan={3} className="p-4">
                                                            <div className="space-y-3 text-sm">
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Teléfono
                                                                        </p>
                                                                        <p className="font-medium text-sm">
                                                                            {customer.phone || 'N/A'}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Email
                                                                        </p>
                                                                        <p className="font-medium text-sm truncate">
                                                                            {customer.email || 'N/A'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Términos Pago
                                                                        </p>
                                                                        <p className="font-medium text-sm">
                                                                            {paymentTermsLabels[customer.payment_terms]}
                                                                        </p>
                                                                    </div>

                                                                    {customer.credit_limit > 0 && (
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                                Límite Crédito
                                                                            </p>
                                                                            <p className="font-semibold text-sm text-green-600">
                                                                                {formatCurrency(customer.credit_limit)}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Botones de acción en móvil */}
                                                                <div className="flex gap-2 pt-2 border-t">
                                                                    <Link href={`/customers/${customer.id}`} className="flex-1">
                                                                        <Button variant="outline" size="sm" className="w-full">
                                                                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                                                                            Ver
                                                                        </Button>
                                                                    </Link>
                                                                    <Link href={`/customers/${customer.id}/edit`} className="flex-1">
                                                                        <Button variant="outline" size="sm" className="w-full">
                                                                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                                                            Editar
                                                                        </Button>
                                                                    </Link>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleDelete(customer)}
                                                                        className="flex-1"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5 mr-1.5 text-destructive" />
                                                                        Eliminar
                                                                    </Button>
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
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No se encontraron clientes.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Paginación */}
                        {customers.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium">{customers.from}</span> a{' '}
                                    <span className="font-medium">{customers.to}</span> de{' '}
                                    <span className="font-medium">{customers.total}</span> clientes
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(customers.current_page - 1)}
                                        disabled={customers.current_page === 1}
                                    >
                                        Anterior
                                    </Button>

                                    <div className="hidden md:flex items-center gap-1">
                                        {Array.from({ length: customers.last_page }, (_, i) => i + 1)
                                            .filter((page) => {
                                                const current = customers.current_page;
                                                return page === 1 ||
                                                    page === customers.last_page ||
                                                    (page >= current - 1 && page <= current + 1);
                                            })
                                            .map((page, index, array) => {
                                                const prevPage = array[index - 1];
                                                const showEllipsis = prevPage && page - prevPage > 1;

                                                return (
                                                    <Fragment key={page}>
                                                        {showEllipsis && (
                                                            <span className="px-2 text-muted-foreground">...</span>
                                                        )}
                                                        <Button
                                                            variant={page === customers.current_page ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handlePageChange(page)}
                                                            className="min-w-[32px]"
                                                        >
                                                            {page}
                                                        </Button>
                                                    </Fragment>
                                                );
                                            })}
                                    </div>

                                    <div className="md:hidden text-sm text-muted-foreground">
                                        Página {customers.current_page} de {customers.last_page}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(customers.current_page + 1)}
                                        disabled={customers.current_page === customers.last_page}
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
