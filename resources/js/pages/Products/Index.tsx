import { useState, Fragment } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
    ChevronUp,
    ChevronDown,
    Minus,
    AlertTriangle,
    CheckCircle,
    XCircle
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
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [sortField, setSortField] = useState(filters.sort_field || 'name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>((filters.sort_direction as 'asc' | 'desc') || 'asc');

    const [filterData, setFilterData] = useState({
        category_id: filters.category_id || '',
        brand_id: filters.brand_id || '',
        is_active: filters.is_active || '',
        per_page: filters.per_page || 15,
    });

    const toggleRowExpansion = (id: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const debouncedSearch = useDebouncedCallback((value: string) => {
        router.get('/products', {
            ...filterData,
            search: value,
            sort_field: sortField,
            sort_direction: sortDirection,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, 500);

    const handleFilterChange = (key: string, value: any) => {
        const newFilters = { ...filterData, [key]: value };
        setFilterData(newFilters);
        router.get('/products', {
            ...newFilters,
            search: filters.search,
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
        router.get('/products', {
            ...filterData,
            search: filters.search,
            sort_field: field,
            sort_direction: newDirection,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setFilterData({
            category_id: '',
            brand_id: '',
            is_active: '',
            per_page: 15,
        });
        router.get('/products');
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />

            <div className="space-y-4 p-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">Productos</h1>
                        <p className="text-xs text-muted-foreground">Gestiona el catálogo de productos</p>
                    </div>
                    <Link href="/products/create">
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Producto
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Total Productos</p>
                                    <p className="text-base font-bold mt-0.5">{stats.total_products}</p>
                                </div>
                                <Package className="h-5 w-5 text-blue-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Activos</p>
                                    <p className="text-base font-bold mt-0.5 text-green-600">{stats.active_products}</p>
                                </div>
                                <CheckCircle className="h-5 w-5 text-green-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Stock Bajo</p>
                                    <p className="text-base font-bold mt-0.5 text-amber-600">{stats.low_stock}</p>
                                </div>
                                <AlertTriangle className="h-5 w-5 text-amber-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Sin Stock</p>
                                    <p className="text-base font-bold mt-0.5 text-red-600">{stats.out_of_stock}</p>
                                </div>
                                <XCircle className="h-5 w-5 text-red-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="py-3">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                            <div className="md:col-span-2">
                                <Input
                                    placeholder="Buscar..."
                                    defaultValue={filters.search}
                                    onChange={(e) => debouncedSearch(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            <Select value={filterData.category_id || "all"} onValueChange={(value) => handleFilterChange('category_id', value === "all" ? '' : value)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Categoría" />
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
                            <Select value={filterData.brand_id || "all"} onValueChange={(value) => handleFilterChange('brand_id', value === "all" ? '' : value)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Marca" />
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
                            <Select value={filterData.is_active || "all"} onValueChange={(value) => handleFilterChange('is_active', value === "all" ? '' : value)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="1">Activos</SelectItem>
                                    <SelectItem value="0">Inactivos</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" onClick={clearFilters} className="h-9">
                                Limpiar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="md:hidden w-10"></TableHead>
                                <TableHead className="text-xs cursor-pointer" onClick={() => handleSort('code')}>
                                    <div className="flex items-center gap-1">
                                        Código <SortIcon field="code" />
                                    </div>
                                </TableHead>
                                <TableHead className="text-xs cursor-pointer" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-1">
                                        Producto <SortIcon field="name" />
                                    </div>
                                </TableHead>
                                <TableHead className="hidden md:table-cell text-xs cursor-pointer" onClick={() => handleSort('category')}>
                                    <div className="flex items-center gap-1">
                                        Categoría <SortIcon field="category" />
                                    </div>
                                </TableHead>
                                <TableHead className="hidden md:table-cell text-xs cursor-pointer" onClick={() => handleSort('brand')}>
                                    <div className="flex items-center gap-1">
                                        Marca <SortIcon field="brand" />
                                    </div>
                                </TableHead>
                                <TableHead className="hidden lg:table-cell text-xs cursor-pointer" onClick={() => handleSort('purchase_price')}>
                                    <div className="flex items-center gap-1">
                                        P. Compra <SortIcon field="purchase_price" />
                                    </div>
                                </TableHead>
                                <TableHead className="hidden md:table-cell text-xs cursor-pointer" onClick={() => handleSort('sale_price')}>
                                    <div className="flex items-center gap-1">
                                        P. Venta <SortIcon field="sale_price" />
                                    </div>
                                </TableHead>
                                <TableHead className="hidden lg:table-cell text-xs text-center">Stock</TableHead>
                                <TableHead className="text-xs">Estado</TableHead>
                                <TableHead className="w-24 text-xs">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.length > 0 ? (
                                products.data.map((product) => {
                                    const isExpanded = expandedRows.has(product.id);
                                    return (
                                        <Fragment key={product.id}>
                                            <TableRow>
                                                <TableCell className="md:hidden w-10 p-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleRowExpansion(product.id)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{product.code}</TableCell>
                                                <TableCell className="font-medium text-sm">{product.name}</TableCell>
                                                <TableCell className="hidden md:table-cell text-xs">{product.category.name}</TableCell>
                                                <TableCell className="hidden md:table-cell text-xs">{product.brand.name}</TableCell>
                                                <TableCell className="hidden lg:table-cell font-semibold text-sm">{formatCurrency(product.purchase_price)}</TableCell>
                                                <TableCell className="hidden md:table-cell font-semibold text-sm text-green-600">{formatCurrency(product.sale_price)}</TableCell>
                                                <TableCell className="hidden lg:table-cell text-center">
                                                    <span className="font-mono font-semibold">{(product as any).inventory_sum_current_stock || 0}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={product.is_active ? 'bg-green-100 text-green-800 border-green-300 text-xs' : 'bg-red-100 text-red-800 border-red-300 text-xs'}>
                                                        {product.is_active ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <div className="flex gap-1">
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
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleDelete(product)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {isExpanded && (
                                                <TableRow className="md:hidden bg-muted/50">
                                                    <TableCell colSpan={5} className="p-4">
                                                        <div className="space-y-2 text-xs">
                                                            <div>
                                                                <span className="text-muted-foreground">Categoría:</span>
                                                                <p className="font-medium">{product.category.name}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">Marca:</span>
                                                                <p className="font-medium">{product.brand.name}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">Precio de Venta:</span>
                                                                <p className="font-semibold">{formatCurrency(product.sale_price)}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">Unidad:</span>
                                                                <p className="font-medium">{product.unit_of_measure}</p>
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
                                    <TableCell colSpan={8} className="text-center py-6 text-sm text-muted-foreground">
                                        No se encontraron productos.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <p>Mostrando {products.data.length} de {products.total} productos</p>
                    <div className="flex gap-2">
                        {products.links.map((link, index) => (
                            link.url ? (
                                <Link key={index} href={link.url} preserveState preserveScroll>
                                    <Button
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        className="h-8"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                </Link>
                            ) : (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                    disabled
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
