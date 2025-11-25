import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Package, Tag } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Category {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    products?: Array<{
        id: number;
        name: string;
        code: string;
        sale_price: number;
        brand: {
            name: string;
        };
    }>;
}

interface Props {
    category: Category;
}

export default function Show({ category }: Props) {
    const products = category.products ?? [];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Categorías', href: '/categories' },
        { title: category.name, href: `/categories/${category.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Categoría: ${category.name}`} />

            <div className="space-y-6 p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/categories">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Tag className="h-5 w-5" />
                                <h1 className="text-3xl font-bold">{category.name}</h1>
                            </div>
                            <p className="text-muted-foreground">
                                Código: {category.code}
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/categories/${category.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información General</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Estado
                                        </label>
                                        <div className="mt-1">
                                            <Badge variant={category.is_active ? "default" : "secondary"}>
                                                {category.is_active ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {category.description && (
                                    <>
                                        <Separator />
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Descripción
                                            </label>
                                            <p className="text-sm mt-1">{category.description}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {products.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Productos en esta categoría ({products.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Código</TableHead>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>Marca</TableHead>
                                                <TableHead>Precio</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {products.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell className="font-mono text-sm">
                                                        {product.code}
                                                    </TableCell>
                                                    <TableCell>{product.name}</TableCell>
                                                    <TableCell>{product.brand.name}</TableCell>
                                                    <TableCell className="font-medium">
                                                        {formatCurrency(product.sale_price)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link href={`/products/${product.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                Ver
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                        {products.length === 0 && (
                            <Card>
                                <CardContent className="text-center py-8">
                                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-muted-foreground">
                                        Esta categoría no tiene productos asociados
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Estadísticas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold mb-2">
                                        {products.length}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Productos directos
                                    </p>
                                </div>

                                {products.length > 0 && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Precio promedio:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        products.reduce((sum, p) => sum + p.sale_price, 0) / products.length
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Precio más alto:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(Math.max(...products.map(p => p.sale_price)))}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Precio más bajo:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(Math.min(...products.map(p => p.sale_price)))}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Acciones Rápidas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full" variant="outline" asChild>
                                    <Link href={`/categories/${category.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar Categoría
                                    </Link>
                                </Button>
                                <Button className="w-full" variant="outline" asChild>
                                    <Link href="/products/create">
                                        <Package className="mr-2 h-4 w-4" />
                                        Agregar Producto
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}