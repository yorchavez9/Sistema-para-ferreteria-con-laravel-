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
    FolderTree,
    Search,
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Minus,
    ChevronLeft,
    ChevronRight,
    Folder,
    FolderOpen,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import Swal from 'sweetalert2';

interface Category {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    parent_id: number | null;
    parent?: {
        id: number;
        name: string;
    };
    children_count: number;
    products_count: number;
}

interface Stats {
    total_categories: number;
    active_categories: number;
    main_categories: number;
    subcategories: number;
}

interface CategoriesIndexProps {
    categories: {
        data: Category[];
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
        type?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Categorías', href: '/categories' },
];

export default function CategoriesIndex({ categories, stats, filters }: CategoriesIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filterData, setFilterData] = useState({
        is_active: filters.is_active || '',
        type: filters.type || '',
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
        if (filterData.type) params.type = filterData.type;

        router.get('/categories', params, {
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
        if (filterData.type) params.type = filterData.type;

        router.get('/categories', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        const clearedFilters = {
            is_active: '',
            type: '',
            per_page: '15',
        };
        setFilterData(clearedFilters);
        setSearchTerm('');

        router.get('/categories', {
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
        if (filterData.type) params.type = filterData.type;

        router.get('/categories', params, {
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
        if (filterData.type) params.type = filterData.type;

        router.get('/categories', params, {
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
        if (filterData.type) params.type = filterData.type;

        router.get('/categories', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleRowExpansion = (categoryId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedRows(newExpanded);
    };

    const handleDelete = (category: Category) => {
        const hasChildren = category.children_count > 0;
        const hasProducts = category.products_count > 0;

        if (hasChildren || hasProducts) {
            Swal.fire({
                title: 'No se puede eliminar',
                text: `Esta categoría tiene ${hasChildren ? 'subcategorías' : ''} ${hasChildren && hasProducts ? 'y ' : ''} ${hasProducts ? 'productos asociados' : ''}.`,
                icon: 'error',
                confirmButtonText: 'Entendido',
            });
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la categoría "${category.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/categories/${category.id}`, {
                    onSuccess: () => {
                        Swal.fire('¡Eliminado!', 'La categoría ha sido eliminada.', 'success');
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
            <Head title="Categorías" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Categorías</h1>
                        <p className="text-muted-foreground">Organiza los productos en categorías</p>
                    </div>
                    <Link href="/categories/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Categoría
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
                                    <Label htmlFor="type">Tipo</Label>
                                    <Select
                                        value={filterData.type || 'all'}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, type: value === 'all' ? '' : value })
                                        }
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            <SelectItem value="main">Principales</SelectItem>
                                            <SelectItem value="sub">Subcategorías</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

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

                {/* Tabla de Categorías */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Lista de Categorías</CardTitle>
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
                                            Nombre
                                            <SortIcon field="name" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Categoría Padre
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell text-center">
                                        Subcategorías
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
                                {categories.data.length > 0 ? (
                                    categories.data.map((category) => {
                                        const isExpanded = expandedRows.has(category.id);
                                        return (
                                            <Fragment key={category.id}>
                                                <TableRow>
                                                    {/* Botón expandir (solo móvil) */}
                                                    <TableCell className="md:hidden w-10 p-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleRowExpansion(category.id)}
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
                                                    <TableCell className="font-mono text-sm">{category.code}</TableCell>

                                                    {/* Nombre */}
                                                    <TableCell>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                {category.parent_id && (
                                                                    <FolderTree className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                                <p className="text-sm font-medium">{category.name}</p>
                                                            </div>
                                                            {category.description && (
                                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                                    {category.description}
                                                                </p>
                                                            )}
                                                            {/* Info móvil condensada */}
                                                            <div className="md:hidden mt-1 space-y-1">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {category.children_count} sub · {category.products_count} prod
                                                                    </span>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`text-xs ${
                                                                            category.is_active
                                                                                ? 'bg-green-100 text-green-800 border-green-300'
                                                                                : 'bg-red-100 text-red-800 border-red-300'
                                                                        }`}
                                                                    >
                                                                        {category.is_active ? 'Activa' : 'Inactiva'}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Categoría Padre (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        {category.parent ? (
                                                            <Badge variant="secondary">
                                                                {category.parent.name}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">—</span>
                                                        )}
                                                    </TableCell>

                                                    {/* Subcategorías (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell text-center">
                                                        <span className="font-mono font-semibold">
                                                            {category.children_count}
                                                        </span>
                                                    </TableCell>

                                                    {/* Productos (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell text-center">
                                                        <span className="font-mono font-semibold">
                                                            {category.products_count}
                                                        </span>
                                                    </TableCell>

                                                    {/* Estado (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${
                                                                category.is_active
                                                                    ? 'bg-green-100 text-green-800 border-green-300'
                                                                    : 'bg-red-100 text-red-800 border-red-300'
                                                            }`}
                                                        >
                                                            {category.is_active ? 'Activa' : 'Inactiva'}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Acciones (solo desktop) */}
                                                    <TableCell className="hidden md:table-cell text-center">
                                                        <div className="flex justify-center gap-1">
                                                            <Link href={`/categories/${category.id}`}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/categories/${category.id}/edit`}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(category)}
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
                                                                            Categoría Padre
                                                                        </p>
                                                                        <p className="font-medium text-sm">
                                                                            {category.parent ? category.parent.name : 'Principal'}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Orden
                                                                        </p>
                                                                        <p className="font-medium text-sm">
                                                                            {category.code}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Subcategorías
                                                                        </p>
                                                                        <p className="font-bold text-base">
                                                                            {category.children_count}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Productos
                                                                        </p>
                                                                        <p className="font-bold text-base">
                                                                            {category.products_count}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Acciones en móvil */}
                                                                <div className="pt-2 border-t">
                                                                    <p className="text-xs text-muted-foreground uppercase font-medium mb-2">
                                                                        Acciones
                                                                    </p>
                                                                    <div className="flex gap-2">
                                                                        <Link href={`/categories/${category.id}`} className="flex-1">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="w-full h-9"
                                                                            >
                                                                                <Eye className="h-4 w-4 mr-2" />
                                                                                Ver Detalles
                                                                            </Button>
                                                                        </Link>
                                                                        <Link href={`/categories/${category.id}/edit`} className="flex-1">
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
                                                                            onClick={() => handleDelete(category)}
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
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <FolderTree className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                                            <p className="mt-2 text-muted-foreground">No se encontraron categorías</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Paginación */}
                        {categories.data.length > 0 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium">{categories.from}</span> a{' '}
                                    <span className="font-medium">{categories.to}</span> de{' '}
                                    <span className="font-medium">{categories.total}</span> resultados
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(categories.current_page - 1)}
                                        disabled={categories.current_page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Anterior
                                    </Button>

                                    <div className="hidden sm:flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, categories.last_page) }, (_, i) => {
                                            let pageNum;
                                            if (categories.last_page <= 5) {
                                                pageNum = i + 1;
                                            } else if (categories.current_page <= 3) {
                                                pageNum = i + 1;
                                            } else if (categories.current_page >= categories.last_page - 2) {
                                                pageNum = categories.last_page - 4 + i;
                                            } else {
                                                pageNum = categories.current_page - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={categories.current_page === pageNum ? 'default' : 'outline'}
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
                                        onClick={() => handlePageChange(categories.current_page + 1)}
                                        disabled={categories.current_page === categories.last_page}
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
