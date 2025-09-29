import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Search, Edit, Eye, Trash2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { confirmDelete, showSuccess, showError } from '@/lib/sweet-alert';

interface Product {
    id: number;
    name: string;
    code: string;
    barcode: string | null;
    description: string | null;
    unit_of_measure: string;
    purchase_price: string | number;
    sale_price: string | number;
    min_stock: string | number;
    max_stock: string | number;
    is_active: boolean;
    category: {
        id: number;
        name: string;
    };
    brand: {
        id: number;
        name: string;
    };
}

interface Category {
    id: number;
    name: string;
    code: string;
}

interface Brand {
    id: number;
    name: string;
    code: string;
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
    categories: Category[];
    brands: Brand[];
    filters: {
        search?: string;
        category_id?: string;
        brand_id?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Productos', href: '/products' },
];

export default function ProductsIndex({ products, categories, brands, filters }: ProductsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || 'all');
    const [brandId, setBrandId] = useState(filters.brand_id || 'all');

    const handleSearch = () => {
        router.get('/products', {
            search: search || undefined,
            category_id: categoryId === 'all' ? undefined : categoryId,
            brand_id: brandId === 'all' ? undefined : brandId,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryId('all');
        setBrandId('all');
        router.get('/products');
    };

    const deleteProduct = async (product: Product) => {
        const result = await confirmDelete(
            `¿Eliminar "${product.name}"?`,
            'Esta acción eliminará el producto permanentemente.'
        );

        if (result.isConfirmed) {
            router.delete(`/products/${product.id}`, {
                onSuccess: () => {
                    showSuccess('¡Eliminado!', 'El producto ha sido eliminado correctamente.');
                },
                onError: () => {
                    showError('Error', 'No se pudo eliminar el producto.');
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Productos</h1>
                        <p className="text-muted-foreground">
                            Gestiona el catálogo de productos de la ferretería
                        </p>
                    </div>
                    <Link href="/products/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Producto
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <Input
                            placeholder="Buscar por nombre, código o código de barras..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="w-48">
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todas las categorías" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las categorías</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-48">
                        <Select value={brandId} onValueChange={setBrandId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todas las marcas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las marcas</SelectItem>
                                {brands.map((brand) => (
                                    <SelectItem key={brand.id} value={brand.id.toString()}>
                                        {brand.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleSearch}>
                        <Search className="mr-2 h-4 w-4" />
                        Buscar
                    </Button>
                    <Button variant="outline" onClick={clearFilters}>
                        Limpiar
                    </Button>
                </div>

                {/* Products Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Marca</TableHead>
                                <TableHead>Precio Venta</TableHead>
                                <TableHead>Stock Mín.</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.length > 0 ? (
                                products.data.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-mono">{product.code}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {product.barcode && `CB: ${product.barcode}`}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{product.category.name}</TableCell>
                                        <TableCell>{product.brand.name}</TableCell>
                                        <TableCell>S/ {parseFloat(product.sale_price).toFixed(2)}</TableCell>
                                        <TableCell>{parseInt(product.min_stock.toString())}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={product.is_active ? "default" : "secondary"}
                                            >
                                                {product.is_active ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/products/${product.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/products/${product.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteProduct(product)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-6">
                                        No se encontraron productos.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Info */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {products.data.length} de {products.total} productos
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}