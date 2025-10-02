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
    MapPin,
    Phone,
    Mail,
    Star,
    Building2,
    CheckCircle,
    Package,
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

interface Branch {
    id: number;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    manager_name: string | null;
    is_active: boolean;
    is_main: boolean;
    products_count: number;
    inventories_count: number;
}

interface Stats {
    total_branches: number;
    active_branches: number;
    main_branches: number;
    with_inventory: number;
}

interface BranchesIndexProps {
    branches: {
        data: Branch[];
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
        is_main?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Sucursales', href: '/branches' },
];

export default function BranchesIndex({ branches, stats, filters }: BranchesIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filterData, setFilterData] = useState({
        is_active: filters.is_active || '',
        is_main: filters.is_main || '',
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

        // Solo agregar filtros si tienen valor
        if (filterData.is_active) params.is_active = filterData.is_active;
        if (filterData.is_main) params.is_main = filterData.is_main;

        router.get('/branches', params, {
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
        if (filterData.is_main) params.is_main = filterData.is_main;

        router.get('/branches', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        const clearedFilters = {
            is_active: '',
            is_main: '',
            per_page: '15',
        };
        setFilterData(clearedFilters);
        setSearchTerm('');

        router.get('/branches', {
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
        if (filterData.is_main) params.is_main = filterData.is_main;

        router.get('/branches', params, {
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
        if (filterData.is_main) params.is_main = filterData.is_main;

        router.get('/branches', params, {
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
        if (filterData.is_main) params.is_main = filterData.is_main;

        router.get('/branches', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleRowExpansion = (branchId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(branchId)) {
            newExpanded.delete(branchId);
        } else {
            newExpanded.add(branchId);
        }
        setExpandedRows(newExpanded);
    };

    const handleDelete = (branch: Branch) => {
        if (branch.is_main) {
            Swal.fire({
                title: 'No permitido',
                text: 'No se puede eliminar la sucursal principal.',
                icon: 'error',
                confirmButtonColor: '#3b82f6',
            });
            return;
        }

        if (branch.inventories_count > 0) {
            Swal.fire({
                title: 'No permitido',
                text: `Esta sucursal tiene ${branch.inventories_count} registros de inventario asociados.`,
                icon: 'error',
                confirmButtonColor: '#3b82f6',
            });
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la sucursal "${branch.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/branches/${branch.id}`, {
                    onSuccess: () => {
                        Swal.fire('¡Eliminado!', 'La sucursal ha sido eliminada.', 'success');
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
            <Head title="Sucursales" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Sucursales</h1>
                        <p className="text-muted-foreground">Gestiona las sucursales de la ferretería</p>
                    </div>
                    <Link href="/branches/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Sucursal
                        </Button>
                    </Link>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Total Sucursales</p>
                                    <p className="text-base font-bold mt-0.5">{stats.total_branches}</p>
                                </div>
                                <Building2 className="h-5 w-5 text-blue-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Activas</p>
                                    <p className="text-base font-bold text-green-600 mt-0.5">{stats.active_branches}</p>
                                </div>
                                <CheckCircle className="h-5 w-5 text-green-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Principales</p>
                                    <p className="text-base font-bold text-amber-600 mt-0.5">{stats.main_branches}</p>
                                </div>
                                <Star className="h-5 w-5 text-amber-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Con Inventario</p>
                                    <p className="text-base font-bold text-purple-600 mt-0.5">{stats.with_inventory}</p>
                                </div>
                                <Package className="h-5 w-5 text-purple-600 opacity-80" />
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
                                    placeholder="Buscar por nombre, código, dirección o gerente..."
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
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            <SelectItem value="1">Activas</SelectItem>
                                            <SelectItem value="0">Inactivas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="type">Tipo</Label>
                                    <Select
                                        value={filterData.is_main || 'all'}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, is_main: value === 'all' ? '' : value })
                                        }
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            <SelectItem value="1">Principales</SelectItem>
                                            <SelectItem value="0">Secundarias</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-end gap-2 md:col-span-2">
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

                {/* Tabla de Sucursales */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Lista de Sucursales</CardTitle>
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
                                            Sucursal
                                            <SortIcon field="name" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">Dirección</TableHead>
                                    <TableHead className="hidden md:table-cell">Contacto</TableHead>
                                    <TableHead className="hidden md:table-cell text-center">Inventario</TableHead>
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
                                {branches.data.length > 0 ? (
                                    branches.data.map((branch) => {
                                        const isExpanded = expandedRows.has(branch.id);
                                        return (
                                            <Fragment key={branch.id}>
                                                <TableRow>
                                                    {/* Botón expandir (solo móvil) */}
                                                    <TableCell className="md:hidden w-10 p-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleRowExpansion(branch.id)}
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
                                                    <TableCell className="font-mono text-sm">
                                                        <div className="flex items-center gap-1.5">
                                                            {branch.code}
                                                            {branch.is_main && (
                                                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    {/* Sucursal */}
                                                    <TableCell>
                                                        <div>
                                                            <p className="text-sm font-medium">{branch.name}</p>
                                                            {/* Info móvil condensada */}
                                                            <div className="md:hidden mt-1 space-y-1">
                                                                {branch.manager_name && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Gerente: {branch.manager_name}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {branch.inventories_count} items
                                                                    </Badge>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`text-xs ${
                                                                            branch.is_active
                                                                                ? 'bg-green-100 text-green-800 border-green-300'
                                                                                : 'bg-red-100 text-red-800 border-red-300'
                                                                        }`}
                                                                    >
                                                                        {branch.is_active ? 'Activa' : 'Inactiva'}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Dirección (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        {branch.address ? (
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                                <span className="max-w-xs truncate">{branch.address}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">-</span>
                                                        )}
                                                    </TableCell>

                                                    {/* Contacto (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <div className="space-y-0.5 text-xs">
                                                            {branch.phone && (
                                                                <div className="flex items-center gap-1">
                                                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                                                    <span>{branch.phone}</span>
                                                                </div>
                                                            )}
                                                            {branch.email && (
                                                                <div className="flex items-center gap-1">
                                                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="truncate max-w-[150px]">{branch.email}</span>
                                                                </div>
                                                            )}
                                                            {!branch.phone && !branch.email && (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    {/* Inventario (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell text-center">
                                                        <Badge variant="outline" className="text-xs">
                                                            {branch.inventories_count} items
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Estado (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${
                                                                branch.is_active
                                                                    ? 'bg-green-100 text-green-800 border-green-300'
                                                                    : 'bg-red-100 text-red-800 border-red-300'
                                                            }`}
                                                        >
                                                            {branch.is_active ? 'Activa' : 'Inactiva'}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Acciones (solo desktop) */}
                                                    <TableCell className="hidden md:table-cell text-center">
                                                        <div className="flex justify-center gap-1">
                                                            <Link href={`/branches/${branch.id}`}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/branches/${branch.id}/edit`}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(branch)}
                                                                className="h-8 w-8 p-0"
                                                                disabled={branch.is_main}
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
                                                                {branch.address && (
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Dirección
                                                                        </p>
                                                                        <div className="flex items-center gap-1">
                                                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                                                            <p className="font-medium text-sm">{branch.address}</p>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Teléfono
                                                                        </p>
                                                                        <p className="font-medium text-sm">
                                                                            {branch.phone || 'N/A'}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Email
                                                                        </p>
                                                                        <p className="font-medium text-sm truncate">
                                                                            {branch.email || 'N/A'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Botones de acción en móvil */}
                                                                <div className="flex gap-2 pt-2 border-t">
                                                                    <Link href={`/branches/${branch.id}`} className="flex-1">
                                                                        <Button variant="outline" size="sm" className="w-full">
                                                                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                                                                            Ver
                                                                        </Button>
                                                                    </Link>
                                                                    <Link href={`/branches/${branch.id}/edit`} className="flex-1">
                                                                        <Button variant="outline" size="sm" className="w-full">
                                                                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                                                            Editar
                                                                        </Button>
                                                                    </Link>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleDelete(branch)}
                                                                        className="flex-1"
                                                                        disabled={branch.is_main}
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
                                            No se encontraron sucursales.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Paginación */}
                        {branches.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium">{branches.from}</span> a{' '}
                                    <span className="font-medium">{branches.to}</span> de{' '}
                                    <span className="font-medium">{branches.total}</span> sucursales
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(branches.current_page - 1)}
                                        disabled={branches.current_page === 1}
                                    >
                                        Anterior
                                    </Button>

                                    <div className="hidden md:flex items-center gap-1">
                                        {Array.from({ length: branches.last_page }, (_, i) => i + 1)
                                            .filter((page) => {
                                                const current = branches.current_page;
                                                return page === 1 ||
                                                    page === branches.last_page ||
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
                                                            variant={page === branches.current_page ? 'default' : 'outline'}
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
                                        Página {branches.current_page} de {branches.last_page}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(branches.current_page + 1)}
                                        disabled={branches.current_page === branches.last_page}
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
