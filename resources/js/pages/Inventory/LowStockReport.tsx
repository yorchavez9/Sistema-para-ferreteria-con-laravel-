import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
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
import { AlertTriangle, Package, ArrowLeft, Eye } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface InventoryItem {
    id: number;
    current_stock: number;
    min_stock: number;
    max_stock: number;
    cost_price: number;
    sale_price: number;
    product: {
        id: number;
        name: string;
        code: string;
        unit_of_measure: string;
        category: {
            name: string;
        };
        brand: {
            name: string;
        };
    };
    branch: {
        id: number;
        name: string;
    };
}

interface Branch {
    id: number;
    name: string;
}

interface LowStockReportProps {
    lowStockItems: InventoryItem[];
    branches: Branch[];
    filters: {
        branch_id?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventario', href: '/inventory' },
    { title: 'Stock Bajo', href: '/inventory/low-stock' },
];

export default function LowStockReport({ lowStockItems, branches, filters }: LowStockReportProps) {
    const [branchId, setBranchId] = useState(filters.branch_id || 'all');

    const handleFilter = () => {
        router.get('/inventory/low-stock', {
            branch_id: branchId === 'all' ? undefined : branchId,
        });
    };

    const clearFilters = () => {
        setBranchId('all');
        router.get('/inventory/low-stock');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStockPercentage = (current: number, min: number) => {
        if (min === 0) return 0;
        return Math.round((current / min) * 100);
    };

    const getStockColor = (percentage: number) => {
        if (percentage === 0) return 'text-red-600';
        if (percentage <= 50) return 'text-orange-600';
        return 'text-yellow-600';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reporte de Stock Bajo" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/inventory">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <AlertTriangle className="h-8 w-8 text-orange-500" />
                            Reporte de Stock Bajo
                        </h1>
                        <p className="text-muted-foreground">
                            Productos que necesitan reabastecimiento
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Productos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lowStockItems.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Con stock bajo o agotado
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Productos Agotados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {lowStockItems.filter(item => item.current_stock === 0).length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Requieren atención inmediata
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Valor Estimado
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(
                                    lowStockItems.reduce((sum, item) =>
                                        sum + (item.current_stock * item.cost_price), 0
                                    )
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Stock actual a costo
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-end">
                    <div className="w-64">
                        <Select value={branchId} onValueChange={setBranchId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todas las sucursales" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las sucursales</SelectItem>
                                {branches.map((branch) => (
                                    <SelectItem key={branch.id} value={branch.id.toString()}>
                                        {branch.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleFilter}>
                        Filtrar
                    </Button>
                    <Button variant="outline" onClick={clearFilters}>
                        Limpiar
                    </Button>
                </div>

                {/* Low Stock Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Sucursal</TableHead>
                                    <TableHead>Stock Actual</TableHead>
                                    <TableHead>Stock Mínimo</TableHead>
                                    <TableHead>% Stock</TableHead>
                                    <TableHead>Costo Unit.</TableHead>
                                    <TableHead>Precio Venta</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lowStockItems.length > 0 ? (
                                    lowStockItems.map((item) => {
                                        const percentage = getStockPercentage(item.current_stock, item.min_stock);
                                        const colorClass = getStockColor(percentage);

                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{item.product.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {item.product.code} • {item.product.category.name}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {item.product.brand.name}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{item.branch.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {item.current_stock === 0 ? (
                                                            <Badge variant="destructive">
                                                                Agotado
                                                            </Badge>
                                                        ) : (
                                                            <>
                                                                <Package className="h-4 w-4" />
                                                                <span className={`font-medium ${colorClass}`}>
                                                                    {item.current_stock}
                                                                </span>
                                                                <span className="text-sm text-muted-foreground">
                                                                    {item.product.unit_of_measure}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                                                        <span>{item.min_stock}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className={`font-medium ${colorClass}`}>
                                                        {percentage}%
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(item.cost_price)}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(item.sale_price)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/products/${item.product.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/inventory/${item.id}/edit`}>
                                                            <Button variant="ghost" size="sm">
                                                                Ajustar
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <Package className="h-12 w-12 text-muted-foreground opacity-50" />
                                                <p className="text-muted-foreground">
                                                    No hay productos con stock bajo
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    ¡Excelente! Todos los productos tienen stock adecuado.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                {lowStockItems.length > 0 && (
                    <div className="flex gap-4">
                        <Button asChild>
                            <Link href="/inventory/adjustment">
                                Ajustar Inventario
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/inventory">
                                Ver Todo el Inventario
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}