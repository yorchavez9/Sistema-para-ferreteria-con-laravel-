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
    Search,
    Eye,
    Pencil,
    Trash2,
    ShoppingCart,
    Package,
    Minus,
    ChevronUp,
    ChevronDown,
    TrendingUp,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import Swal from 'sweetalert2';

interface PurchaseOrder {
    id: number;
    order_number: string;
    order_date: string;
    expected_date: string | null;
    status: string;
    total: number;
    supplier: {
        id: number;
        name: string;
    };
    branch: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
    };
}

interface Stats {
    total_orders: number;
    total_amount: number;
    pending: number;
    received: number;
    partial: number;
    pending_amount: number;
}

interface PurchaseOrdersIndexProps {
    orders: {
        data: PurchaseOrder[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
    suppliers: Array<{ id: number; name: string }>;
    branches: Array<{ id: number; name: string }>;
    filters: {
        search?: string;
        status?: string;
        supplier_id?: string;
        branch_id?: string;
        date_from?: string;
        date_to?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Órdenes de Compra', href: '/purchase-orders' },
];

const statusLabels: Record<string, string> = {
    'pendiente': 'Pendiente',
    'parcial': 'Parcial',
    'recibido': 'Recibido',
    'cancelado': 'Cancelado',
};

const statusColors: Record<string, string> = {
    'pendiente': 'bg-amber-100 text-amber-800 border-amber-300',
    'parcial': 'bg-blue-100 text-blue-800 border-blue-300',
    'recibido': 'bg-green-100 text-green-800 border-green-300',
    'cancelado': 'bg-red-100 text-red-800 border-red-300',
};

export default function PurchaseOrdersIndex({ orders, stats, suppliers, branches, filters }: PurchaseOrdersIndexProps) {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [sortField, setSortField] = useState(filters.sort_field || 'order_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>((filters.sort_direction as 'asc' | 'desc') || 'desc');

    const [filterData, setFilterData] = useState({
        status: filters.status || '',
        supplier_id: filters.supplier_id || '',
        branch_id: filters.branch_id || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
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
        router.get('/purchase-orders', {
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
        router.get('/purchase-orders', {
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
        router.get('/purchase-orders', {
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
            status: '',
            supplier_id: '',
            branch_id: '',
            date_from: '',
            date_to: '',
            per_page: 15,
        });
        router.get('/purchase-orders');
    };

    const handleDelete = (order: PurchaseOrder) => {
        if (order.status !== 'pendiente') {
            Swal.fire({
                title: 'No permitido',
                text: 'Solo se pueden eliminar órdenes pendientes.',
                icon: 'warning',
            });
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la orden ${order.order_number}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/purchase-orders/${order.id}`, {
                    onSuccess: () => {
                        Swal.fire('¡Eliminado!', 'La orden ha sido eliminada.', 'success');
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Órdenes de Compra" />

            <div className="space-y-4 p-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">Órdenes de Compra</h1>
                        <p className="text-xs text-muted-foreground">Gestiona las órdenes de compra a proveedores</p>
                    </div>
                    <Link href="/purchase-orders/create">
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Orden
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Total Órdenes</p>
                                    <p className="text-base font-bold mt-0.5">{stats.total_orders}</p>
                                    <p className="text-xs text-muted-foreground">{formatCurrency(stats.total_amount)}</p>
                                </div>
                                <ShoppingCart className="h-5 w-5 text-blue-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Pendientes</p>
                                    <p className="text-base font-bold mt-0.5 text-amber-600">{stats.pending}</p>
                                    <p className="text-xs text-muted-foreground">{formatCurrency(stats.pending_amount)}</p>
                                </div>
                                <Clock className="h-5 w-5 text-amber-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Recibidas</p>
                                    <p className="text-base font-bold mt-0.5 text-green-600">{stats.received}</p>
                                </div>
                                <CheckCircle className="h-5 w-5 text-green-600 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Parciales</p>
                                    <p className="text-base font-bold mt-0.5 text-blue-600">{stats.partial}</p>
                                </div>
                                <TrendingUp className="h-5 w-5 text-blue-600 opacity-80" />
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
                            <Select value={filterData.status || "all"} onValueChange={(value) => handleFilterChange('status', value === "all" ? '' : value)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="pendiente">Pendiente</SelectItem>
                                    <SelectItem value="parcial">Parcial</SelectItem>
                                    <SelectItem value="recibido">Recibido</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterData.supplier_id || "all"} onValueChange={(value) => handleFilterChange('supplier_id', value === "all" ? '' : value)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Proveedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {suppliers.map((supplier) => (
                                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                            {supplier.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filterData.branch_id || "all"} onValueChange={(value) => handleFilterChange('branch_id', value === "all" ? '' : value)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Sucursal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    {branches.map((branch) => (
                                        <SelectItem key={branch.id} value={branch.id.toString()}>
                                            {branch.name}
                                        </SelectItem>
                                    ))}
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
                                <TableHead className="text-xs cursor-pointer" onClick={() => handleSort('order_number')}>
                                    <div className="flex items-center gap-1">
                                        Número <SortIcon field="order_number" />
                                    </div>
                                </TableHead>
                                <TableHead className="hidden md:table-cell text-xs cursor-pointer" onClick={() => handleSort('supplier')}>
                                    <div className="flex items-center gap-1">
                                        Proveedor <SortIcon field="supplier" />
                                    </div>
                                </TableHead>
                                <TableHead className="hidden md:table-cell text-xs">Sucursal</TableHead>
                                <TableHead className="hidden md:table-cell text-xs cursor-pointer" onClick={() => handleSort('order_date')}>
                                    <div className="flex items-center gap-1">
                                        Fecha <SortIcon field="order_date" />
                                    </div>
                                </TableHead>
                                <TableHead className="text-xs">Estado</TableHead>
                                <TableHead className="text-xs text-right cursor-pointer" onClick={() => handleSort('total')}>
                                    <div className="flex items-center justify-end gap-1">
                                        Total <SortIcon field="total" />
                                    </div>
                                </TableHead>
                                <TableHead className="w-24 text-xs">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.length > 0 ? (
                                orders.data.map((order) => {
                                    const isExpanded = expandedRows.has(order.id);
                                    return (
                                        <Fragment key={order.id}>
                                            <TableRow>
                                                <TableCell className="md:hidden w-10 p-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleRowExpansion(order.id)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                                                <TableCell className="hidden md:table-cell text-sm">{order.supplier.name}</TableCell>
                                                <TableCell className="hidden md:table-cell text-xs">{order.branch.name}</TableCell>
                                                <TableCell className="hidden md:table-cell text-xs">{formatDate(order.order_date)}</TableCell>
                                                <TableCell>
                                                    <Badge className={`${statusColors[order.status]} text-xs`}>
                                                        {statusLabels[order.status]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-sm">{formatCurrency(order.total)}</TableCell>
                                                <TableCell className="p-2">
                                                    <div className="flex gap-1">
                                                        <Link href={`/purchase-orders/${order.id}`}>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {order.status === 'pendiente' && (
                                                            <>
                                                                <Link href={`/purchase-orders/${order.id}/edit`}>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => handleDelete(order)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {isExpanded && (
                                                <TableRow className="md:hidden bg-muted/50">
                                                    <TableCell colSpan={5} className="p-4">
                                                        <div className="space-y-2 text-xs">
                                                            <div>
                                                                <span className="text-muted-foreground">Proveedor:</span>
                                                                <p className="font-medium">{order.supplier.name}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">Sucursal:</span>
                                                                <p className="font-medium">{order.branch.name}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">Fecha:</span>
                                                                <p className="font-medium">{formatDate(order.order_date)}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">Creado por:</span>
                                                                <p className="font-medium">{order.user.name}</p>
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
                                        No se encontraron órdenes de compra.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <p>Mostrando {orders.data.length} de {orders.total} órdenes</p>
                    <div className="flex gap-2">
                        {orders.links.map((link, index) => (
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
