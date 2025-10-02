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
    Tag,
    Search,
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Minus,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Package,
    Globe,
    Mail,
    Phone,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import Swal from 'sweetalert2';

interface Brand {
    id: number;
    name: string;
    code: string;
    description: string | null;
    website: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    is_active: boolean;
    products_count: number;
}

interface Stats {
    total_brands: number;
    active_brands: number;
    with_products: number;
    without_products: number;
}

interface BrandsIndexProps {
    brands: {
        data: Brand[];
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
        sort_field?: string;
        sort_direction?: string;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Marcas', href: '/brands' },
];

export default function BrandsIndex({ brands, stats, filters }: BrandsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filterData, setFilterData] = useState({
        is_active: filters.is_active || '',
        per_page: filters.per_page?.toString() || '15',
    });
    const [sortField, setSortField] = useState(filters.sort_field || 'name');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'asc');
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    // Búsqueda en tiempo real con debounce
    const debouncedSearch = useDebouncedCallback((value: string) => {
        const params: any = {
            search: value,
            sort_field: sortField,
            sort_direction: sortDirection,
            per_page: filterData.per_page,
        };

        if (filterData.is_active) params.is_active = filterData.is_active;

        router.get('/brands', params, {
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

        if (filterData.is_active) params.is_active = filterData.is_active;

        router.get('/brands', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        const clearedFilters = {
            is_active: '',
            per_page: '15',
        };
        setFilterData(clearedFilters);
        setSearchTerm('');

        router.get('/brands', {
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

        if (filterData.is_active) params.is_active = filterData.is_active;

        router.get('/brands', params, {
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

        if (filterData.is_active) params.is_active = filterData.is_active;

        router.get('/brands', params, {
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

        if (filterData.is_active) params.is_active = filterData.is_active;

        router.get('/brands', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleRowExpansion = (brandId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(brandId)) {
            newExpanded.delete(brandId);
        } else {
            newExpanded.add(brandId);
        }
        setExpandedRows(newExpanded);
    };

    const handleDelete = (brand: Brand) => {
        if (brand.products_count > 0) {
            Swal.fire({
                title: 'No se puede eliminar',
                text: `Esta marca tiene ${brand.products_count} productos asociados.`,
                icon: 'error',
                confirmButtonText: 'Entendido',
            });
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la marca "${brand.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/brands/${brand.id}`, {
                    onSuccess: () => {
                        Swal.fire('¡Eliminado!', 'La marca ha sido eliminada.', 'success');
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
            <Head title="Marcas" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Marcas</h1>
                        <p className="text-muted-foreground">Gestiona las marcas de productos</p>
                    </div>
                    <Link href="/brands/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Marca
                        </Button>
                    </Link>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Total Marcas</p>
                                    <p className="text-base font-bold mt-0.5">{stats.total_brands}</p>
                                </div>
                                <Tag className="h-5 w-5 text-blue-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Activas</p>
                                    <p className="text-base font-bold text-green-600 mt-0.5">{stats.active_brands}</p>
                                </div>
                                <CheckCircle className="h-5 w-5 text-green-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Con Productos</p>
                                    <p className="text-base font-bold text-purple-600 mt-0.5">{stats.with_products}</p>
                                </div>
                                <Package className="h-5 w-5 text-purple-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Sin Productos</p>
                                    <p className="text-base font-bold text-orange-600 mt-0.5">{stats.without_products}</p>
                                </div>
                                <XCircle className="h-5 w-5 text-orange-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Barra de Búsqueda */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por nombre, código o descripción..."
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
                                            <SelectItem value="1">Activas</SelectItem>
                                            <SelectItem value="0">Inactivas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-end gap-2 md:col-span-3">
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

                {/* Tabla de Marcas */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Lista de Marcas</CardTitle>
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
                                            Marca
                                            <SortIcon field="name" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Contacto
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell text-center">
                                        Productos
                                    </TableHead>
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
                                {brands.data.length > 0 ? (
                                    brands.data.map((brand) => {
                                        const isExpanded = expandedRows.has(brand.id);
                                        return (
                                            <Fragment key={brand.id}>
                                                <TableRow>
                                                    {/* Botón expandir (solo móvil) */}
                                                    <TableCell className="md:hidden w-10 p-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleRowExpansion(brand.id)}
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
                                                    <TableCell className="font-mono text-sm">{brand.code}</TableCell>

                                                    {/* Marca */}
                                                    <TableCell>
                                                        <div>
                                                            <p className="text-sm font-medium">{brand.name}</p>
                                                            {brand.description && (
                                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                                    {brand.description}
                                                                </p>
                                                            )}
                                                            {/* Info móvil condensada */}
                                                            <div className="md:hidden mt-1 space-y-1">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {brand.products_count} productos
                                                                    </span>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`text-xs ${
                                                                            brand.is_active
                                                                                ? 'bg-green-100 text-green-800 border-green-300'
                                                                                : 'bg-red-100 text-red-800 border-red-300'
                                                                        }`}
                                                                    >
                                                                        {brand.is_active ? 'Activa' : 'Inactiva'}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Contacto (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <div className="space-y-1 text-xs">
                                                            {brand.contact_email && (
                                                                <div className="flex items-center gap-1">
                                                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                                                    <span>{brand.contact_email}</span>
                                                                </div>
                                                            )}
                                                            {brand.contact_phone && (
                                                                <div className="flex items-center gap-1">
                                                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                                                    <span>{brand.contact_phone}</span>
                                                                </div>
                                                            )}
                                                            {brand.website && (
                                                                <div className="flex items-center gap-1">
                                                                    <Globe className="h-3 w-3 text-muted-foreground" />
                                                                    <a
                                                                        href={brand.website}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-primary hover:underline"
                                                                    >
                                                                        Web
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {!brand.contact_email && !brand.contact_phone && !brand.website && (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    {/* Productos (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell text-center">
                                                        <span className="font-mono font-semibold">
                                                            {brand.products_count}
                                                        </span>
                                                    </TableCell>

                                                    {/* Estado (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${
                                                                brand.is_active
                                                                    ? 'bg-green-100 text-green-800 border-green-300'
                                                                    : 'bg-red-100 text-red-800 border-red-300'
                                                            }`}
                                                        >
                                                            {brand.is_active ? 'Activa' : 'Inactiva'}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Acciones (solo desktop) */}
                                                    <TableCell className="hidden md:table-cell text-center">
                                                        <div className="flex justify-center gap-1">
                                                            <Link href={`/brands/${brand.id}`}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/brands/${brand.id}/edit`}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(brand)}
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
                                                                {brand.contact_email && (
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Email
                                                                        </p>
                                                                        <p className="font-medium text-sm flex items-center gap-1">
                                                                            <Mail className="h-3 w-3" />
                                                                            {brand.contact_email}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {brand.contact_phone && (
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Teléfono
                                                                        </p>
                                                                        <p className="font-medium text-sm flex items-center gap-1">
                                                                            <Phone className="h-3 w-3" />
                                                                            {brand.contact_phone}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {brand.website && (
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Sitio Web
                                                                        </p>
                                                                        <a
                                                                            href={brand.website}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="font-medium text-sm text-primary hover:underline flex items-center gap-1"
                                                                        >
                                                                            <Globe className="h-3 w-3" />
                                                                            {brand.website}
                                                                        </a>
                                                                    </div>
                                                                )}

                                                                {/* Acciones en móvil */}
                                                                <div className="pt-2 border-t">
                                                                    <p className="text-xs text-muted-foreground uppercase font-medium mb-2">
                                                                        Acciones
                                                                    </p>
                                                                    <div className="flex gap-2">
                                                                        <Link href={`/brands/${brand.id}`} className="flex-1">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="w-full h-9"
                                                                            >
                                                                                <Eye className="h-4 w-4 mr-2" />
                                                                                Ver Detalles
                                                                            </Button>
                                                                        </Link>
                                                                        <Link href={`/brands/${brand.id}/edit`} className="flex-1">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="w-full h-9"
                                                                            >
                                                                                <Pencil className="h-4 w-4 mr-2" />
                                                                                Editar
                                                                            </Button>
                                                                        </Link>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => handleDelete(brand)}
                                                                            className="h-9"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
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
                                            <Tag className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                                            <p className="mt-2 text-muted-foreground">No se encontraron marcas</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Paginación */}
                        {brands.data.length > 0 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium">{brands.from}</span> a{' '}
                                    <span className="font-medium">{brands.to}</span> de{' '}
                                    <span className="font-medium">{brands.total}</span> resultados
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(brands.current_page - 1)}
                                        disabled={brands.current_page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Anterior
                                    </Button>

                                    <div className="hidden sm:flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, brands.last_page) }, (_, i) => {
                                            let pageNum;
                                            if (brands.last_page <= 5) {
                                                pageNum = i + 1;
                                            } else if (brands.current_page <= 3) {
                                                pageNum = i + 1;
                                            } else if (brands.current_page >= brands.last_page - 2) {
                                                pageNum = brands.last_page - 4 + i;
                                            } else {
                                                pageNum = brands.current_page - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={brands.current_page === pageNum ? 'default' : 'outline'}
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
                                        onClick={() => handlePageChange(brands.current_page + 1)}
                                        disabled={brands.current_page === brands.last_page}
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
