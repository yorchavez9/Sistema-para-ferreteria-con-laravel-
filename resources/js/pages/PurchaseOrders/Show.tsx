import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Edit, Trash2, Printer, CheckCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

interface Product {
    id: number;
    name: string;
    sku: string;
    category?: {
        name: string;
    };
    brand?: {
        name: string;
    };
}

interface PurchaseOrderDetail {
    id: number;
    product_id: number;
    quantity_ordered: number;
    quantity_received: number;
    unit_price: string;
    subtotal: string;
    product: Product;
}

interface PurchaseOrder {
    id: number;
    series: string;
    correlativo: string;
    order_number: string;
    supplier: {
        id: number;
        business_name: string;
        document_number: string;
    };
    branch: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
    };
    order_date: string;
    expected_date: string | null;
    received_date: string | null;
    status: 'pendiente' | 'parcial' | 'recibido' | 'cancelado';
    subtotal: string;
    tax: string;
    discount: string;
    total: string;
    notes: string | null;
    created_at: string;
    details: PurchaseOrderDetail[];
}

interface Props {
    order: PurchaseOrder;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Órdenes de Compra', href: '/purchase-orders' },
    { title: 'Detalle', href: '#' },
];

export default function Show({ order }: Props) {
    const statusColors = {
        pendiente: 'bg-yellow-500',
        parcial: 'bg-blue-500',
        recibido: 'bg-green-500',
        cancelado: 'bg-red-500',
    };

    const statusLabels = {
        pendiente: 'Pendiente',
        parcial: 'Parcial',
        recibido: 'Recibido',
        cancelado: 'Cancelado',
    };

    const handleDelete = () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/purchase-orders/${order.id}`);
            }
        });
    };

    const handleMarkAsReceived = () => {
        Swal.fire({
            title: '¿Marcar como recibido?',
            text: 'Esto actualizará el inventario',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, marcar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/purchase-orders/${order.id}/receive`);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Orden de Compra #${order.order_number}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Orden de Compra #{order.order_number}</h1>
                        <p className="text-muted-foreground mt-1">
                            Detalles de la orden de compra
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/purchase-orders">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Link>
                        </Button>
                        {order.status === 'pendiente' && (
                            <>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/purchase-orders/${order.id}/edit`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleMarkAsReceived}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Marcar como Recibido
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                </Button>
                            </>
                        )}
                        <Button variant="outline" size="sm">
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir
                        </Button>
                    </div>
                </div>

                {/* Información General */}
                <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Información General</span>
                                <Badge className={statusColors[order.status]}>
                                    {statusLabels[order.status]}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Número de Orden
                                    </p>
                                    <p className="text-lg font-semibold font-mono">
                                        {order.order_number}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Proveedor
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {order.supplier.business_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        RUC: {order.supplier.document_number}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Sucursal
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {order.branch.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Fecha de Orden
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {new Date(order.order_date).toLocaleDateString('es-PE')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Fecha Esperada
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {order.expected_date
                                            ? new Date(order.expected_date).toLocaleDateString('es-PE')
                                            : 'No especificada'}
                                    </p>
                                </div>
                                {order.received_date && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Fecha de Recepción
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {new Date(order.received_date).toLocaleDateString('es-PE')}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Creado por
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {order.user.name}
                                    </p>
                                </div>
                            </div>
                            {order.notes && (
                                <div className="mt-6">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Notas
                                    </p>
                                    <p className="text-base mt-1">{order.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Detalle de Productos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalle de Productos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead>Marca</TableHead>
                                        <TableHead className="text-right">Cantidad</TableHead>
                                        <TableHead className="text-right">Precio Unit.</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.details.map((detail) => (
                                        <TableRow key={detail.id}>
                                            <TableCell className="font-mono">
                                                {detail.product.sku}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {detail.product.name}
                                            </TableCell>
                                            <TableCell>
                                                {detail.product.category?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {detail.product.brand?.name || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {detail.quantity_ordered}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                S/ {parseFloat(detail.unit_price).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                S/ {parseFloat(detail.subtotal).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Totales */}
                            <div className="mt-6 flex justify-end">
                                <div className="w-full max-w-sm space-y-2">
                                    <div className="flex justify-between text-base">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span className="font-semibold">
                                            S/ {parseFloat(order.subtotal).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-base">
                                        <span className="text-muted-foreground">IGV (18%):</span>
                                        <span className="font-semibold">
                                            S/ {parseFloat(order.tax).toFixed(2)}
                                        </span>
                                    </div>
                                    {parseFloat(order.discount) > 0 && (
                                        <div className="flex justify-between text-base">
                                            <span className="text-muted-foreground">Descuento:</span>
                                            <span className="font-semibold text-red-600">
                                                - S/ {parseFloat(order.discount).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xl font-bold border-t pt-2">
                                        <span>Total:</span>
                                        <span>S/ {parseFloat(order.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
            </div>
        </AppLayout>
    );
}