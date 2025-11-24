import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Package, Store } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { formatCurrency } from '@/lib/format-currency';

interface Product {
    id: number;
    name: string;
    code: string;
    barcode: string | null;
    unit_of_measure: string;
    purchase_price: number;
    sale_price: number;
    min_stock: number;
    max_stock: number;
    description: string | null;
    technical_specifications: string | null;
    category: {
        id: number;
        name: string;
    };
    brand: {
        id: number;
        name: string;
    };
    inventory: Array<{
        id: number;
        current_stock: number;
        unit_cost: number;
        unit_price: number;
        branch: {
            id: number;
            name: string;
            location: string;
        };
    }>;
}

interface Props {
    product: Product;
}

export default function Show({ product }: Props) {
    const totalStock = product.inventory.reduce((total, inv) => total + inv.current_stock, 0);
    const isLowStock = totalStock <= product.min_stock;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Productos', href: '/products' },
        { title: product.name, href: `/products/${product.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Producto: ${product.name}`} />

            <div className="space-y-6 p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/products">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{product.name}</h1>
                            <p className="text-muted-foreground">
                                Código: {product.code}
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/products/${product.id}/edit`}>
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
                                            Categoría
                                        </label>
                                        <p className="text-sm">{product.category.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Marca
                                        </label>
                                        <p className="text-sm">{product.brand.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Unidad de Medida
                                        </label>
                                        <p className="text-sm">{product.unit_of_measure}</p>
                                    </div>
                                    {product.barcode && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Código de Barras
                                            </label>
                                            <p className="text-sm font-mono">{product.barcode}</p>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Precio de Compra
                                        </label>
                                        <p className="text-lg font-semibold">
                                            {formatCurrency(product.purchase_price)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Precio de Venta
                                        </label>
                                        <p className="text-lg font-semibold text-green-600">
                                            {formatCurrency(product.sale_price)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Stock Mínimo
                                        </label>
                                        <p className="text-sm">{product.min_stock}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Stock Máximo
                                        </label>
                                        <p className="text-sm">{product.max_stock}</p>
                                    </div>
                                </div>

                                {product.description && (
                                    <>
                                        <Separator />
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Descripción
                                            </label>
                                            <p className="text-sm mt-1">{product.description}</p>
                                        </div>
                                    </>
                                )}

                                {product.technical_specifications && (
                                    <>
                                        <Separator />
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Especificaciones Técnicas
                                            </label>
                                            <p className="text-sm mt-1 whitespace-pre-wrap">
                                                {product.technical_specifications}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Store className="h-5 w-5" />
                                    Inventario por Sucursal
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {product.inventory.length > 0 ? (
                                    <div className="space-y-4">
                                        {product.inventory.map((inv) => (
                                            <div
                                                key={inv.id}
                                                className="flex items-center justify-between p-4 border rounded-lg"
                                            >
                                                <div>
                                                    <h4 className="font-medium">{inv.branch.name}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {inv.branch.location}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4" />
                                                        <span className="font-medium">
                                                            {inv.current_stock} unidades
                                                        </span>
                                                        {inv.current_stock <= product.min_stock && (
                                                            <Badge variant="destructive">Stock Bajo</Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        Costo: {formatCurrency(inv.unit_cost)} |
                                                        Precio: {formatCurrency(inv.unit_price)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No hay inventario registrado para este producto</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resumen de Stock</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold mb-2">
                                        {totalStock}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Total en inventario
                                    </p>
                                    {isLowStock && (
                                        <Badge variant="destructive" className="mt-2">
                                            Stock Bajo
                                        </Badge>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Stock mínimo:</span>
                                        <span>{product.min_stock}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Stock máximo:</span>
                                        <span>{product.max_stock}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Sucursales:</span>
                                        <span>{product.inventory.length}</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Margen de ganancia:</span>
                                        <span className="text-green-600 font-medium">
                                            {((product.sale_price - product.purchase_price) / product.purchase_price * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Ganancia por unidad:</span>
                                        <span className="text-green-600 font-medium">
                                            {formatCurrency(product.sale_price - product.purchase_price)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Acciones Rápidas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full" variant="outline" asChild>
                                    <Link href={`/products/${product.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar Producto
                                    </Link>
                                </Button>
                                <Button className="w-full" variant="outline" asChild>
                                    <Link href="/inventory/adjustment">
                                        <Package className="mr-2 h-4 w-4" />
                                        Ajustar Inventario
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