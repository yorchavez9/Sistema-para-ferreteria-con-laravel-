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
import {
    Plus,
    Search,
    Eye,
    Pencil,
    Trash2,
    ShoppingCart,
    Package
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
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

interface Supplier {
    id: number;
    name: string;
}

interface Branch {
    id: number;
    name: string;
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
    suppliers: Supplier[];
    branches: Branch[];
    filters: {
        search?: string;
        status?: string;
        supplier_id?: string;
        branch_id?: string;
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

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'pendiente': 'outline',
    'parcial': 'secondary',
    'recibido': 'default',
    'cancelado': 'destructive',
};

export default function PurchaseOrdersIndex({ orders, suppliers, branches, filters }: PurchaseOrdersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || 'all');
    const [branchId, setBranchId] = useState(filters.branch_id || 'all');

    const handleSearch = () => {
        router.get('/purchase-orders', {
            search: search || undefined,
            status: status === 'all' ? undefined : status,
            supplier_id: supplierId === 'all' ? undefined : supplierId,
            branch_id: branchId === 'all' ? undefined : branchId,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setSupplierId('all');
        setBranchId('all');
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
                        Swal.fire(
                            '¡Eliminado!',
                            'La orden ha sido eliminada.',
                            'success'
                        );
                    },
                });
            }
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
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
            <Head title="Órdenes de Compra" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Órdenes de Compra</h1>
                        <p className="text-muted-foreground">
                            Gestiona las órdenes de compra a proveedores
                        </p>
                    </div>
                    <Link href="/purchase-orders/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Orden
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            placeholder="Buscar por número de orden o proveedor..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="w-40">
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
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
                    </div>
                    <div className="w-48">
                        <Select value={supplierId} onValueChange={setSupplierId}>
                            <SelectTrigger>
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
                    </div>
                    <div className="w-48">
                        <Select value={branchId} onValueChange={setBranchId}>
                            <SelectTrigger>
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
                    </div>
                    <Button onClick={handleSearch}>
                        <Search className="mr-2 h-4 w-4" />
                        Buscar
                    </Button>
                    <Button variant="outline" onClick={clearFilters}>
                        Limpiar
                    </Button>
                </div>

                {/* Orders Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Número de Orden</TableHead>
                                <TableHead>Proveedor</TableHead>
                                <TableHead>Sucursal</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Creado por</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.length > 0 ? (
                                orders.data.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium font-mono">{order.order_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{order.supplier.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Package className="h-3 w-3 text-muted-foreground" />
                                                {order.branch.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {formatDate(order.order_date)}
                                            </div>
                                            {order.expected_date && (
                                                <div className="text-xs text-muted-foreground">
                                                    Esperado: {formatDate(order.expected_date)}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariants[order.status]}>
                                                {statusLabels[order.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold">
                                                {formatCurrency(order.total)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-muted-foreground">
                                                {order.user.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/purchase-orders/${order.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                {order.status === 'pendiente' && (
                                                    <>
                                                        <Link href={`/purchase-orders/${order.id}/edit`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(order)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-6">
                                        No se encontraron órdenes de compra.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Info */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {orders.data.length} de {orders.total} órdenes
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}