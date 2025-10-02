import { useState, Fragment } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useDebouncedCallback } from 'use-debounce';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    TableRow
} from '@/components/ui/table';
import {
    Plus,
    Search,
    Eye,
    Pencil,
    Trash2,
    Building2,
    Phone,
    Mail,
    Users,
    CheckCircle,
    FileText,
    CreditCard,
    ChevronDown,
    ChevronUp,
    ArrowUpDown
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { confirmDelete, showSuccess, showError } from '@/lib/sweet-alert';

interface Supplier {
    id: number;
    name: string;
    code: string;
    document_type: string | null;
    document_number: string | null;
    email: string | null;
    phone: string | null;
    contact_person: string | null;
    payment_terms: string;
    is_active: boolean;
}

interface Stats {
    total_suppliers: number;
    active_suppliers: number;
    with_ruc: number;
    credit_suppliers: number;
}

interface SuppliersIndexProps {
    suppliers: {
        data: Supplier[];
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
        document_type?: string;
        payment_terms?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Proveedores', href: '/suppliers' },
];

const paymentTermsLabels: Record<string, string> = {
    'contado': 'Contado',
    'credito_15': 'Crédito 15 días',
    'credito_30': 'Crédito 30 días',
    'credito_45': 'Crédito 45 días',
    'credito_60': 'Crédito 60 días',
};

export default function SuppliersIndex({ suppliers, stats, filters }: SuppliersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [filterData, setFilterData] = useState({
        is_active: filters.is_active || '',
        document_type: filters.document_type || '',
        payment_terms: filters.payment_terms || '',
        per_page: filters.per_page || 15,
    });
    const [sortField, setSortField] = useState(filters.sort_field || 'name');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'asc');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const debouncedSearch = useDebouncedCallback((value: string) => {
        const params: any = {
            search: value,
            sort_field: sortField,
            sort_direction: sortDirection,
            per_page: filterData.per_page,
        };

        if (filterData.is_active) params.is_active = filterData.is_active;
        if (filterData.document_type) params.document_type = filterData.document_type;
        if (filterData.payment_terms) params.payment_terms = filterData.payment_terms;

        router.get('/suppliers', params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, 500);

    const handleSearch = (value: string) => {
        setSearch(value);
        debouncedSearch(value);
    };

    const handleFilter = () => {
        const params: any = {
            search,
            sort_field: sortField,
            sort_direction: sortDirection,
            per_page: filterData.per_page,
        };

        if (filterData.is_active) params.is_active = filterData.is_active;
        if (filterData.document_type) params.document_type = filterData.document_type;
        if (filterData.payment_terms) params.payment_terms = filterData.payment_terms;

        router.get('/suppliers', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSort = (field: string) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);

        const params: any = {
            search,
            sort_field: field,
            sort_direction: newDirection,
            per_page: filterData.per_page,
        };

        if (filterData.is_active) params.is_active = filterData.is_active;
        if (filterData.document_type) params.document_type = filterData.document_type;
        if (filterData.payment_terms) params.payment_terms = filterData.payment_terms;

        router.get('/suppliers', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePerPageChange = (value: string) => {
        const perPage = parseInt(value);
        setFilterData({ ...filterData, per_page: perPage });

        const params: any = {
            search,
            sort_field: sortField,
            sort_direction: sortDirection,
            per_page: perPage,
        };

        if (filterData.is_active) params.is_active = filterData.is_active;
        if (filterData.document_type) params.document_type = filterData.document_type;
        if (filterData.payment_terms) params.payment_terms = filterData.payment_terms;

        router.get('/suppliers', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (url: string | null) => {
        if (!url) return;
        router.get(url, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setFilterData({
            is_active: '',
            document_type: '',
            payment_terms: '',
            per_page: 15,
        });
        setSortField('name');
        setSortDirection('asc');
        router.get('/suppliers');
    };

    const handleDelete = async (supplier: Supplier) => {
        const result = await confirmDelete(
            `¿Eliminar "${supplier.name}"?`,
            'Esta acción eliminará el proveedor permanentemente.'
        );

        if (result.isConfirmed) {
            router.delete(`/suppliers/${supplier.id}`, {
                onSuccess: () => {
                    showSuccess('¡Eliminado!', 'El proveedor ha sido eliminado correctamente.');
                },
                onError: () => {
                    showError('Error', 'No se pudo eliminar el proveedor.');
                }
            });
        }
    };

    const toggleRowExpansion = (id: number) => {
        setExpandedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        }
        return sortDirection === 'asc' ?
            <ChevronUp className="ml-2 h-4 w-4" /> :
            <ChevronDown className="ml-2 h-4 w-4" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Proveedores" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Proveedores</h1>
                        <p className="text-muted-foreground">
                            Gestiona la información de tus proveedores
                        </p>
                    </div>
                    <Link href="/suppliers/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Proveedor
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, código, documento, email o contacto..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Advanced Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Filtros Avanzados</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                {showFilters ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    {showFilters && (
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Estado</label>
                                    <Select
                                        value={filterData.is_active || 'all'}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, is_active: value === 'all' ? '' : value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="1">Activos</SelectItem>
                                            <SelectItem value="0">Inactivos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Tipo de Documento</label>
                                    <Select
                                        value={filterData.document_type || 'all'}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, document_type: value === 'all' ? '' : value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="RUC">RUC</SelectItem>
                                            <SelectItem value="DNI">DNI</SelectItem>
                                            <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Términos de Pago</label>
                                    <Select
                                        value={filterData.payment_terms || 'all'}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, payment_terms: value === 'all' ? '' : value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar términos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="contado">Contado</SelectItem>
                                            <SelectItem value="credito_15">Crédito 15 días</SelectItem>
                                            <SelectItem value="credito_30">Crédito 30 días</SelectItem>
                                            <SelectItem value="credito_45">Crédito 45 días</SelectItem>
                                            <SelectItem value="credito_60">Crédito 60 días</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleFilter}>Aplicar Filtros</Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Limpiar Filtros
                                </Button>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Suppliers Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Listado de Proveedores</CardTitle>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Mostrar</span>
                                <Select
                                    value={filterData.per_page.toString()}
                                    onValueChange={handlePerPageChange}
                                >
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="15">15</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="md:hidden"></TableHead>
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
                                                Nombre
                                                <SortIcon field="name" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="hidden md:table-cell">Documento</TableHead>
                                        <TableHead className="hidden md:table-cell">Contacto</TableHead>
                                        <TableHead className="hidden md:table-cell">Términos de Pago</TableHead>
                                        <TableHead className="hidden md:table-cell">Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {suppliers.data.length > 0 ? (
                                        suppliers.data.map((supplier) => (
                                            <Fragment key={supplier.id}>
                                                <TableRow>
                                                    <TableCell className="md:hidden">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleRowExpansion(supplier.id)}
                                                        >
                                                            {expandedRows.includes(supplier.id) ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="font-mono">
                                                        {supplier.code}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                                <span className="font-medium">{supplier.name}</span>
                                                            </div>
                                                            {supplier.contact_person && (
                                                                <div className="text-sm text-muted-foreground mt-1">
                                                                    {supplier.contact_person}
                                                                </div>
                                                            )}
                                                            <div className="md:hidden mt-1">
                                                                <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                                                                    {supplier.is_active ? 'Activo' : 'Inactivo'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {supplier.document_type && supplier.document_number ? (
                                                            <div className="text-sm">
                                                                <span className="font-medium">{supplier.document_type}:</span>{' '}
                                                                {supplier.document_number}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <div className="space-y-1 text-sm">
                                                            {supplier.phone && (
                                                                <div className="flex items-center gap-1">
                                                                    <Phone className="h-3 w-3" />
                                                                    {supplier.phone}
                                                                </div>
                                                            )}
                                                            {supplier.email && (
                                                                <div className="flex items-center gap-1">
                                                                    <Mail className="h-3 w-3" />
                                                                    {supplier.email}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <Badge variant="outline">
                                                            {paymentTermsLabels[supplier.payment_terms]}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                                                            {supplier.is_active ? 'Activo' : 'Inactivo'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Link href={`/suppliers/${supplier.id}`}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/suppliers/${supplier.id}/edit`}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(supplier)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                                {expandedRows.includes(supplier.id) && (
                                                    <TableRow className="md:hidden">
                                                        <TableCell colSpan={4} className="bg-muted/50">
                                                            <div className="space-y-2 py-2">
                                                                {(supplier.document_type || supplier.document_number) && (
                                                                    <div>
                                                                        <span className="text-sm font-medium">Documento:</span>
                                                                        <div className="text-sm mt-1">
                                                                            <span className="font-medium">{supplier.document_type}:</span>{' '}
                                                                            {supplier.document_number}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {(supplier.phone || supplier.email) && (
                                                                    <div>
                                                                        <span className="text-sm font-medium">Contacto:</span>
                                                                        <div className="space-y-1 mt-1">
                                                                            {supplier.phone && (
                                                                                <div className="flex items-center gap-1 text-sm">
                                                                                    <Phone className="h-3 w-3" />
                                                                                    <span>{supplier.phone}</span>
                                                                                </div>
                                                                            )}
                                                                            {supplier.email && (
                                                                                <div className="flex items-center gap-1 text-sm">
                                                                                    <Mail className="h-3 w-3" />
                                                                                    <span>{supplier.email}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <span className="text-sm font-medium">Términos de Pago:</span>
                                                                    <div className="mt-1">
                                                                        <Badge variant="outline">
                                                                            {paymentTermsLabels[supplier.payment_terms]}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </Fragment>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-6">
                                                No se encontraron proveedores.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {suppliers.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando {suppliers.from} a {suppliers.to} de {suppliers.total} proveedores
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(suppliers.links[0]?.url)}
                                        disabled={suppliers.current_page === 1}
                                    >
                                        Anterior
                                    </Button>

                                    <div className="hidden md:flex gap-1">
                                        {suppliers.links.slice(1, -1).map((link, index) => (
                                            <Button
                                                key={index}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(link.url)}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>

                                    <div className="md:hidden">
                                        <span className="text-sm">
                                            Página {suppliers.current_page} de {suppliers.last_page}
                                        </span>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(suppliers.links[suppliers.links.length - 1]?.url)}
                                        disabled={suppliers.current_page === suppliers.last_page}
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
