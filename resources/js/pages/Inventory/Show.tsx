import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Package, Building2, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface InventoryItem {
    id: number;
    current_stock: number;
    unit_cost: number;
    unit_price: number;
    last_updated: string;
    created_at: string;
    product: {
        id: number;
        name: string;
        code: string;
        barcode: string | null;
        min_stock: number;
        max_stock: number;
        unit_of_measure: string;
        category: {
            id: number;
            name: string;
        };
        brand: {
            id: number;
            name: string;
        };
    };
    branch: {
        id: number;
        name: string;
        location: string;
        phone: string | null;
    };
}

interface Props {
    inventory: InventoryItem;
}

export default function Show({ inventory }: Props) {
    const getStockStatus = () => {
        if (inventory.current_stock <= inventory.product.min_stock) {
            return { status: 'low', label: 'Stock Bajo', variant: 'destructive' as const, icon: '⚠️' };
        }
        if (inventory.current_stock >= inventory.product.max_stock) {
            return { status: 'high', label: 'Stock Alto', variant: 'default' as const, icon: '📈' };
        }
        return { status: 'normal', label: 'Stock Normal', variant: 'secondary' as const, icon: '✅' };
    };

    const stockInfo = getStockStatus();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const stockValue = inventory.current_stock * inventory.unit_cost;
    const potentialSaleValue = inventory.current_stock * inventory.unit_price;
    const potentialProfit = potentialSaleValue - stockValue;
    const profitMargin = stockValue > 0 ? ((potentialProfit / stockValue) * 100) : 0;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inventario', href: '/inventory' },
        { title: `${inventory.product.name} - ${inventory.branch.name}`, href: `/inventory/${inventory.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Inventario: ${inventory.product.name} - ${inventory.branch.name}`} />

            <div className="space-y-6 p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/inventory">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{inventory.product.name}</h1>
                            <p className="text-muted-foreground">
                                Inventario en {inventory.branch.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/products/${inventory.product.id}`}>
                                <Package className="mr-2 h-4 w-4" />
                                Ver Producto
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/inventory/adjustment">
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Ajustar Stock
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Información del Producto
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Código
                                        </label>
                                        <p className="text-sm font-mono">{inventory.product.code}</p>
                                    </div>
                                    {inventory.product.barcode && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Código de Barras
                                            </label>
                                            <p className="text-sm font-mono">{inventory.product.barcode}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Categoría
                                        </label>
                                        <p className="text-sm">{inventory.product.category.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Marca
                                        </label>
                                        <p className="text-sm">{inventory.product.brand.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Unidad de Medida
                                        </label>
                                        <p className="text-sm">{inventory.product.unit_of_measure}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Información de la Sucursal
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Nombre
                                        </label>
                                        <p className="text-sm font-medium">{inventory.branch.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Ubicación
                                        </label>
                                        <p className="text-sm">{inventory.branch.location}</p>
                                    </div>
                                    {inventory.branch.phone && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Teléfono
                                            </label>
                                            <p className="text-sm">{inventory.branch.phone}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Análisis Financiero
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Valor del Stock
                                        </label>
                                        <p className="text-lg font-bold text-blue-600">
                                            {formatCurrency(stockValue)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Valor Potencial de Venta
                                        </label>
                                        <p className="text-lg font-bold text-green-600">
                                            {formatCurrency(potentialSaleValue)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Ganancia Potencial
                                        </label>
                                        <p className="text-lg font-bold text-emerald-600">
                                            {formatCurrency(potentialProfit)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Margen de Ganancia
                                        </label>
                                        <p className="text-lg font-bold text-purple-600">
                                            {profitMargin.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Costo Unitario
                                        </label>
                                        <p className="text-sm font-medium">
                                            {formatCurrency(inventory.unit_cost)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Precio Unitario
                                        </label>
                                        <p className="text-sm font-medium">
                                            {formatCurrency(inventory.unit_price)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Estado del Stock</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">{stockInfo.icon}</div>
                                    <div className="text-3xl font-bold mb-2">
                                        {inventory.current_stock}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {inventory.product.unit_of_measure} disponibles
                                    </p>
                                    <Badge variant={stockInfo.variant} className="text-sm">
                                        {stockInfo.label}
                                    </Badge>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Stock mínimo:</span>
                                        <span className="font-medium">{inventory.product.min_stock}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Stock máximo:</span>
                                        <span className="font-medium">{inventory.product.max_stock}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Diferencia mín:</span>
                                        <span className={`font-medium ${
                                            inventory.current_stock - inventory.product.min_stock < 0
                                                ? 'text-red-600'
                                                : 'text-green-600'
                                        }`}>
                                            {inventory.current_stock - inventory.product.min_stock > 0 ? '+' : ''}
                                            {inventory.current_stock - inventory.product.min_stock}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Diferencia máx:</span>
                                        <span className={`font-medium ${
                                            inventory.current_stock - inventory.product.max_stock > 0
                                                ? 'text-red-600'
                                                : 'text-blue-600'
                                        }`}>
                                            {inventory.current_stock - inventory.product.max_stock > 0 ? '+' : ''}
                                            {inventory.current_stock - inventory.product.max_stock}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Fechas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Última Actualización
                                    </label>
                                    <p className="text-sm">
                                        {formatDate(inventory.last_updated)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Registro Creado
                                    </label>
                                    <p className="text-sm">
                                        {formatDate(inventory.created_at)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Acciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full" asChild>
                                    <Link href="/inventory/adjustment">
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                        Ajustar Stock
                                    </Link>
                                </Button>
                                <Button className="w-full" variant="outline" asChild>
                                    <Link href={`/products/${inventory.product.id}`}>
                                        <Package className="mr-2 h-4 w-4" />
                                        Ver Producto
                                    </Link>
                                </Button>
                                <Button className="w-full" variant="outline" asChild>
                                    <Link href={`/branches/${inventory.branch.id}`}>
                                        <Building2 className="mr-2 h-4 w-4" />
                                        Ver Sucursal
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