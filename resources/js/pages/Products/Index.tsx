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
    Package,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Minus,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import Swal from 'sweetalert2';

interface Product {
    id: number;
    code: string;
    barcode: string | null;
    name: string;
    category: {
        id: number;
        name: string;
    };
    brand: {
        id: number;
        name: string;
    };
    unit_of_measure: string;
    purchase_price: number;
    sale_price: number;
    min_stock: number;
    total_stock?: number;
    inventory_sum_current_stock?: number;
    is_active: boolean;
}

interface Stats {
    total_products: number;
    active_products: number;
    low_stock: number;
    out_of_stock: number;
}

interface ProductsIndexProps {
    products: {
        data: Product[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    stats: Stats;
    categories: Array<{ id: number; name: string }>;
    brands: Array<{ id: number; name: string }>;
    filters: {
        search?: string;
        category_id?: string;
        brand_id?: string;
        is_active?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Productos', href: '/products' },
];

export default function ProductsIndex({ products, stats, categories, brands, filters }: ProductsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filterData, setFilterData] = useState({
        category_id: filters.category_id || '',
        brand_id: filters.brand_id || '',
        is_active: filters.is_active || '',
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
        if (filterData.category_id) params.category_id = filterData.category_id;
        if (filterData.brand_id) params.brand_id = filterData.brand_id;
        if (filterData.is_active) params.is_active = filterData.is_active;

        router.get('/products', params, {
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
        if (filterData.category_id) params.category_id = filterData.category_id;
        if (filterData.brand_id) params.brand_id = filterData.brand_id;
        if (filterData.is_active) params.is_active = filterData.is_active;

        router.get('/products', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        const clearedFilters = {
            category_id: '',
            brand_id: '',
            is_active: '',
            per_page: '15',
        };
        setFilterData(clearedFilters);
        setSearchTerm('');

        router.get('/products', {
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
        if (filterData.category_id) params.category_id = filterData.category_id;
        if (filterData.brand_id) params.brand_id = filterData.brand_id;
        if (filterData.is_active) params.is_active = filterData.is_active;

        router.get('/products', params, {
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
        if (filterData.category_id) params.category_id = filterData.category_id;
        if (filterData.brand_id) params.brand_id = filterData.brand_id;
        if (filterData.is_active) params.is_active = filterData.is_active;

        router.get('/products', params, {
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
        if (filterData.category_id) params.category_id = filterData.category_id;
        if (filterData.brand_id) params.brand_id = filterData.brand_id;
        if (filterData.is_active) params.is_active = filterData.is_active;

        router.get('/products', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleRowExpansion = (productId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(productId)) {
            newExpanded.delete(productId);
        } else {
            newExpanded.add(productId);
        }
        setExpandedRows(newExpanded);
    };

    const handleDelete = (product: Product) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el producto "${product.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/products/${product.id}`, {
                    onSuccess: () => {
                        Swal.fire('¡Eliminado!', 'El producto ha sido eliminado.', 'success');
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
            <Head title="Productos" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Productos</h1>
                        <p className="text-muted-foreground">Gestiona el catálogo de productos</p>
                    </div>
                    <Link href="/products/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Producto
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
                                    placeholder="Buscar por nombre, código o código de barras..."
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
                                    <Label htmlFor="category">Categoría</Label>
                                    <Select
                                        value={filterData.category_id || 'all'}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, category_id: value === 'all' ? '' : value })
                                        }
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="brand">Marca</Label>
                                    <Select
                                        value={filterData.brand_id || 'all'}
                                        onValueChange={(value) =>
                                            setFilterData({ ...filterData, brand_id: value === 'all' ? '' : value })
                                        }
                                    >
                                        <SelectTrigger id="brand">
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            {brands.map((brand) => (
                                                <SelectItem key={brand.id} value={brand.id.toString()}>
                                                    {brand.name}
                                                </SelectItem>
                                            ))}
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
                                            <SelectItem value="1">Activos</SelectItem>
                                            <SelectItem value="0">Inactivos</SelectItem>
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

                {/* Tabla de Productos */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Lista de Productos</CardTitle>
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
                                            Producto
                                            <SortIcon field="name" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('category')}
                                    >
                                        <div className="flex items-center">
                                            Categoría
                                            <SortIcon field="category" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('brand')}
                                    >
                                        <div className="flex items-center">
                                            Marca
                                            <SortIcon field="brand" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('sale_price')}
                                    >
                                        <div className="flex items-center">
                                            P. Venta
                                            <SortIcon field="sale_price" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell text-center">Stock</TableHead>
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
                                {products.data.length > 0 ? (
                                    products.data.map((product) => {
                                        const isExpanded = expandedRows.has(product.id);
                                        return (
                                            <Fragment key={product.id}>
                                                <TableRow>
                                                    {/* Botón expandir (solo móvil) */}
                                                    <TableCell className="md:hidden w-10 p-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleRowExpansion(product.id)}
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
                                                    <TableCell className="font-mono text-sm">{product.code}</TableCell>

                                                    {/* Producto */}
                                                    <TableCell>
                                                        <div>
                                                            <p className="text-sm font-medium">{product.name}</p>
                                                            {/* Info móvil condensada */}
                                                            <div className="md:hidden mt-1 space-y-1">
                                                                <p className="text-xs text-muted-foreground">
                                                                    {product.category.name} - {product.brand.name}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-sm text-green-600">
                                                                        {formatCurrency(product.sale_price)}
                                                                    </span>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`text-xs ${
                                                                            product.is_active
                                                                                ? 'bg-green-100 text-green-800 border-green-300'
                                                                                : 'bg-red-100 text-red-800 border-red-300'
                                                                        }`}
                                                                    >
                                                                        {product.is_active ? 'Activo' : 'Inactivo'}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Categoría (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <span className="text-sm">{product.category.name}</span>
                                                    </TableCell>

                                                    {/* Marca (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <span className="text-sm">{product.brand.name}</span>
                                                    </TableCell>

                                                    {/* Precio Venta (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <span className="font-semibold text-sm text-green-600">
                                                            {formatCurrency(product.sale_price)}
                                                        </span>
                                                    </TableCell>

                                                    {/* Stock (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell text-center">
                                                        <span className="font-mono font-semibold">
                                                            {product.inventory_sum_current_stock || 0}
                                                        </span>
                                                    </TableCell>

                                                    {/* Estado (oculto en móvil) */}
                                                    <TableCell className="hidden md:table-cell">
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${
                                                                product.is_active
                                                                    ? 'bg-green-100 text-green-800 border-green-300'
                                                                    : 'bg-red-100 text-red-800 border-red-300'
                                                            }`}
                                                        >
                                                            {product.is_active ? 'Activo' : 'Inactivo'}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Acciones (solo desktop) */}
                                                    <TableCell className="hidden md:table-cell text-center">
                                                        <div className="flex justify-center gap-1">
                                                            <Link href={`/products/${product.id}`}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/products/${product.id}/edit`}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(product)}
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
                                                                            Código Barras
                                                                        </p>
                                                                        <p className="font-medium text-sm font-mono">
                                                                            {product.barcode || 'N/A'}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Unidad
                                                                        </p>
                                                                        <p className="font-medium text-sm">
                                                                            {product.unit_of_measure}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Precio Compra
                                                                        </p>
                                                                        <p className="font-semibold text-sm">
                                                                            {formatCurrency(product.purchase_price)}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">
                                                                            Stock Actual
                                                                        </p>
                                                                        <p className="font-bold text-base">
                                                                            {product.inventory_sum_current_stock || 0}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Acciones en móvil */}
                                                                <div className="pt-2 border-t">
                                                                    <p className="text-xs text-muted-foreground uppercase font-medium mb-2">
                                                                        Acciones
                                                                    </p>
                                                                    <div className="flex gap-2">
                                                                        <Link href={`/products/${product.id}`} className="flex-1">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="w-full h-9"
                                                                            >
                                                                                <Eye className="h-4 w-4 mr-2" />
                                                                                Ver Detalles
                                                                            </Button>
                                                                        </Link>
                                                                        <Link href={`/products/${product.id}/edit`} className="flex-1">
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
                                                                            onClick={() => handleDelete(product)}
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
                                        <TableCell colSpan={9} className="text-center py-8">
                                            <Package className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                                            <p className="mt-2 text-muted-foreground">No se encontraron productos</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Paginación */}
                        {products.data.length > 0 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium">{products.from}</span> a{' '}
                                    <span className="font-medium">{products.to}</span> de{' '}
                                    <span className="font-medium">{products.total}</span> resultados
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(products.current_page - 1)}
                                        disabled={products.current_page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Anterior
                                    </Button>

                                    <div className="hidden sm:flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, products.last_page) }, (_, i) => {
                                            let pageNum;
                                            if (products.last_page <= 5) {
                                                pageNum = i + 1;
                                            } else if (products.current_page <= 3) {
                                                pageNum = i + 1;
                                            } else if (products.current_page >= products.last_page - 2) {
                                                pageNum = products.last_page - 4 + i;
                                            } else {
                                                pageNum = products.current_page - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={products.current_page === pageNum ? 'default' : 'outline'}
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
                                        onClick={() => handlePageChange(products.current_page + 1)}
                                        disabled={products.current_page === products.last_page}
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
