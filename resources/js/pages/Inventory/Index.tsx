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
import { Package, Search, Eye, AlertTriangle, TrendingUp, Settings } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface InventoryItem {
    id: number;
    current_stock: number;
    min_stock: number | null;
    max_stock: number | null;
    cost_price: number;
    sale_price: number;
    last_movement_date: string;
    product: {
        id: number;
        name: string;
        code: string;
        min_stock: number | null;
        max_stock: number | null;
        unit_of_measure: string;
        category: {
            name: string;
        };
        brand: {
            name: string;
        };
    } | null;
    branch: {
        id: number;
        name: string;
        location: string;
    } | null;
}

interface Branch {
    id: number;
    name: string;
}

interface InventoryIndexProps {
    inventory: {
        data: InventoryItem[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    branches: Branch[];
    filters: {
        search?: string;
        branch_id?: string;
        stock_status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventario', href: '/inventory' },
];

export default function InventoryIndex({ inventory, branches, filters }: InventoryIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [branchId, setBranchId] = useState(filters.branch_id || 'all');
    const [stockStatus, setStockStatus] = useState(filters.stock_status || 'all');

    const handleSearch = () => {
        router.get('/inventory', {
            search: search || undefined,
            branch_id: branchId === 'all' ? undefined : branchId,
            stock_status: stockStatus === 'all' ? undefined : stockStatus,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setBranchId('all');
        setStockStatus('all');
        router.get('/inventory');
    };

    const getStockStatus = (item: InventoryItem) => {
        // Si no hay producto asociado, retornar estado por defecto
        if (!item.product) {
            return { status: 'unknown', label: 'Sin Producto', variant: 'secondary' as const };
        }

        // Usar los valores de min/max del inventario primero, si no existen usar los del producto
        const minStock = item.min_stock ?? item.product.min_stock ?? 0;
        const maxStock = item.max_stock ?? item.product.max_stock ?? Infinity;

        if (item.current_stock === 0) {
            return { status: 'out', label: 'Agotado', variant: 'destructive' as const };
        }
        if (item.current_stock <= minStock) {
            return { status: 'low', label: 'Stock Bajo', variant: 'destructive' as const };
        }
        if (maxStock !== Infinity && item.current_stock >= maxStock) {
            return { status: 'high', label: 'Stock Alto', variant: 'default' as const };
        }
        return { status: 'normal', label: 'Normal', variant: 'secondary' as const };
    };

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
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventario" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Inventario</h1>
                        <p className="text-muted-foreground">
                            Monitorea el stock de productos en todas las sucursales
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/inventory/adjustment">
                            <Button variant="outline">
                                <Settings className="mr-2 h-4 w-4" />
                                Ajustar Stock
                            </Button>
                        </Link>
                        <Link href="/inventory/low-stock">
                            <Button>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Stock Bajo
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <Input
                            placeholder="Buscar por producto o código..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="w-48">
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
                    <div className="w-48">
                        <Select value={stockStatus} onValueChange={setStockStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Estado del stock" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="low">Stock Bajo</SelectItem>
                                <SelectItem value="normal">Stock Normal</SelectItem>
                                <SelectItem value="high">Stock Alto</SelectItem>
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

                {/* Inventory Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Sucursal</TableHead>
                                <TableHead>Stock Actual</TableHead>
                                <TableHead>Rango Stock</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Costo Unit.</TableHead>
                                <TableHead>Precio Unit.</TableHead>
                                <TableHead>Última Act.</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventory.data.length > 0 ? (
                                inventory.data.map((item) => {
                                    const stockInfo = getStockStatus(item);

                                    // Si no hay producto, no mostramos el item
                                    if (!item.product) {
                                        return null;
                                    }

                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{item.product.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {item.product.code} • {item.product.category?.name || 'Sin categoría'}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {item.product.brand?.name || 'Sin marca'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{item.branch?.name || 'Sin sucursal'}</div>
                                                    {item.branch?.location && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {item.branch.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4" />
                                                    <span className="font-medium">
                                                        {item.current_stock}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {item.product.unit_of_measure || 'UND'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    Mín: {item.min_stock ?? item.product.min_stock ?? 0} • Máx: {item.max_stock ?? item.product.max_stock ?? '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={stockInfo.variant}>
                                                    {stockInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatCurrency(item.cost_price)}</TableCell>
                                            <TableCell>{formatCurrency(item.sale_price)}</TableCell>
                                            <TableCell className="text-sm">
                                                {formatDate(item.last_movement_date)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/products/${item.product.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/inventory/${item.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <TrendingUp className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-6">
                                        No se encontraron registros de inventario.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Info */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {inventory.data.length} de {inventory.total} registros
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}