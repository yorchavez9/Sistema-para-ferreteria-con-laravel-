import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, MapPin, Phone, Mail, User, Star, Package, DollarSign } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Branch {
    id: number;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    manager_name: string | null;
    latitude: string | null;
    longitude: string | null;
    is_active: boolean;
    is_main: boolean;
    products?: Array<{
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
    branch: Branch;
}

export default function Show({ branch }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sucursales', href: '/branches' },
        { title: branch.name, href: `/branches/${branch.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Sucursal: ${branch.name}`} />

            <div className="space-y-6 p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/branches">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold">{branch.name}</h1>
                                {branch.is_main && (
                                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                                )}
                            </div>
                            <p className="text-muted-foreground">
                                Código: {branch.code}
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/branches/${branch.id}/edit`}>
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
                                            <Badge variant={branch.is_active ? "default" : "secondary"}>
                                                {branch.is_active ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Tipo
                                        </label>
                                        <div className="mt-1">
                                            <Badge variant={branch.is_main ? "default" : "outline"}>
                                                {branch.is_main ? 'Principal' : 'Sucursal'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">
                                        Ubicación y Contacto
                                    </h4>

                                    {branch.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm">{branch.address}</p>
                                                {branch.latitude && branch.longitude && (
                                                    <a
                                                        href={`https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary hover:underline"
                                                    >
                                                        Ver en Google Maps
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {branch.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={`tel:${branch.phone}`}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                {branch.phone}
                                            </a>
                                        </div>
                                    )}

                                    {branch.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={`mailto:${branch.email}`}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                {branch.email}
                                            </a>
                                        </div>
                                    )}

                                    {branch.manager_name && (
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Gerente: {branch.manager_name}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {branch.products && branch.products.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Productos en Inventario ({branch.products.length})
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
                                            {branch.products.map((product) => (
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

                        {(!branch.products || branch.products.length === 0) && (
                            <Card>
                                <CardContent className="text-center py-8">
                                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-muted-foreground">
                                        Esta sucursal no tiene productos en inventario
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
                                        {branch.products?.length || 0}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Productos en Inventario
                                    </p>
                                </div>

                                {branch.products && branch.products.length > 0 && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4" />
                                                    Valor promedio:
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        branch.products.reduce((sum, p) => sum + p.sale_price, 0) / branch.products.length
                                                    )}
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
                                    <Link href={`/branches/${branch.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar Sucursal
                                    </Link>
                                </Button>
                                <Button className="w-full" variant="outline" asChild>
                                    <Link href="/inventory">
                                        <Package className="mr-2 h-4 w-4" />
                                        Ver Inventario
                                    </Link>
                                </Button>
                                {branch.latitude && branch.longitude && (
                                    <Button className="w-full" variant="outline" asChild>
                                        <a
                                            href={`https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <MapPin className="mr-2 h-4 w-4" />
                                            Ver en Mapa
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