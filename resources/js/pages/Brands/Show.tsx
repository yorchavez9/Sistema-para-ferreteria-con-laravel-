import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Globe, Mail, Phone, Package, ExternalLink } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Brand {
    id: number;
    name: string;
    code: string;
    description: string | null;
    website: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    is_active: boolean;
    products: Array<{
        id: number;
        name: string;
        code: string;
        sale_price: number;
        category: {
            name: string;
        };
    }>;
}

interface Props {
    brand: Brand;
}

export default function Show({ brand }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Marcas', href: '/brands' },
        { title: brand.name, href: `/brands/${brand.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Marca: ${brand.name}`} />

            <div className="space-y-6 p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/brands">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{brand.name}</h1>
                            <p className="text-muted-foreground">
                                Código: {brand.code}
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/brands/${brand.id}/edit`}>
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
                                            <Badge variant={brand.is_active ? "default" : "secondary"}>
                                                {brand.is_active ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {brand.description && (
                                    <>
                                        <Separator />
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Descripción
                                            </label>
                                            <p className="text-sm mt-1">{brand.description}</p>
                                        </div>
                                    </>
                                )}

                                <Separator />

                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">
                                        Información de Contacto
                                    </h4>

                                    {brand.website && (
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={brand.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline flex items-center gap-1"
                                            >
                                                {brand.website}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    )}

                                    {brand.contact_email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={`mailto:${brand.contact_email}`}
                                                className="text-primary hover:underline"
                                            >
                                                {brand.contact_email}
                                            </a>
                                        </div>
                                    )}

                                    {brand.contact_phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={`tel:${brand.contact_phone}`}
                                                className="text-primary hover:underline"
                                            >
                                                {brand.contact_phone}
                                            </a>
                                        </div>
                                    )}

                                    {!brand.website && !brand.contact_email && !brand.contact_phone && (
                                        <p className="text-sm text-muted-foreground">
                                            No hay información de contacto disponible
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {brand.products.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Productos de esta marca ({brand.products.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Código</TableHead>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>Categoría</TableHead>
                                                <TableHead>Precio</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {brand.products.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell className="font-mono text-sm">
                                                        {product.code}
                                                    </TableCell>
                                                    <TableCell>{product.name}</TableCell>
                                                    <TableCell>{product.category.name}</TableCell>
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

                        {brand.products.length === 0 && (
                            <Card>
                                <CardContent className="text-center py-8">
                                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-muted-foreground">
                                        Esta marca no tiene productos asociados
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
                                        {brand.products.length}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Productos
                                    </p>
                                </div>

                                {brand.products.length > 0 && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Precio promedio:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        brand.products.reduce((sum, p) => sum + p.sale_price, 0) / brand.products.length
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Precio más alto:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(Math.max(...brand.products.map(p => p.sale_price)))}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Precio más bajo:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(Math.min(...brand.products.map(p => p.sale_price)))}
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
                                    <Link href={`/brands/${brand.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar Marca
                                    </Link>
                                </Button>
                                <Button className="w-full" variant="outline" asChild>
                                    <Link href="/products/create">
                                        <Package className="mr-2 h-4 w-4" />
                                        Agregar Producto
                                    </Link>
                                </Button>
                                {brand.website && (
                                    <Button className="w-full" variant="outline" asChild>
                                        <a
                                            href={brand.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Globe className="mr-2 h-4 w-4" />
                                            Visitar Sitio Web
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}