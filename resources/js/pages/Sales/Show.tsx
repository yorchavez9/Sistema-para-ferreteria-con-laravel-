import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format-currency';
import { Button } from '@/components/ui/button';
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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ArrowLeft,
    Receipt,
    User,
    Store,
    Calendar,
    CreditCard,
    FileText,
    Pencil,
    Ban,
    Printer,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';
import PdfPreviewModal from '@/components/PdfPreviewModal';

interface SaleDetail {
    id: number;
    product: {
        id: number;
        name: string;
        code: string;
        unit: string;
    };
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Payment {
    id: number;
    payment_number: number;
    amount: number;
    due_date: string;
    paid_date: string | null;
    status: 'pendiente' | 'pagado' | 'vencido';
    payment_method: string | null;
    transaction_reference: string | null;
}

interface Sale {
    id: number;
    sale_number: string;
    series: string;
    correlativo: string;
    document_type: string;
    sale_date: string;
    status: string;
    payment_method: string;
    payment_type: string;
    credit_days?: number;
    installments?: number;
    initial_payment?: number;
    remaining_balance?: number;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    amount_paid: number;
    change_amount: number;
    notes?: string;
    customer: {
        id: number;
        name: string;
        code: string;
        document_type: string;
        document_number: string;
        phone?: string;
        email?: string;
        address?: string;
    };
    branch: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
    };
    details: SaleDetail[];
    payments?: Payment[];
    created_at: string;
    updated_at: string;
}

interface SaleShowProps {
    sale: Sale;
}

const statusLabels: Record<string, string> = {
    'pendiente': 'Pendiente',
    'pagado': 'Pagado',
    'cancelado': 'Cancelado',
    'anulado': 'Anulado',
};

const statusColors: Record<string, string> = {
    'pendiente': 'bg-amber-400 text-gray-800 border-amber-500',
    'pagado': 'bg-green-400 text-white border-green-500',
    'cancelado': 'bg-red-400 text-white border-red-500',
    'anulado': 'bg-gray-400 text-white border-gray-500',
};

const documentTypeLabels: Record<string, string> = {
    'boleta': 'Boleta de Venta',
    'factura': 'Factura',
    'nota_venta': 'Nota de Venta',
};

const paymentMethodLabels: Record<string, string> = {
    'efectivo': 'Efectivo',
    'tarjeta': 'Tarjeta',
    'transferencia': 'Transferencia',
    'yape': 'Yape',
    'plin': 'Plin',
    'credito': 'Crédito',
};

export default function SaleShow({ sale }: SaleShowProps) {
    const [showPdfModal, setShowPdfModal] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Ventas', href: '/sales' },
        { title: sale.sale_number, href: `/sales/${sale.id}` },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getPaymentStatusBadge = (payment: Payment) => {
        if (payment.status === 'pagado') {
            return (
                <Badge className="bg-green-600 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Pagado
                </Badge>
            );
        }

        if (payment.status === 'vencido') {
            return (
                <Badge className="bg-red-600 text-white">
                    <XCircle className="h-3 w-3 mr-1" />
                    Vencido
                </Badge>
            );
        }

        return (
            <Badge className="bg-amber-500 text-white">
                <Clock className="h-3 w-3 mr-1" />
                Pendiente
            </Badge>
        );
    };

    const handleCancel = () => {
        if (sale.status !== 'pendiente' && sale.status !== 'pagado') {
            Swal.fire({
                title: 'No permitido',
                text: 'Solo se pueden anular ventas pendientes o pagadas.',
                icon: 'warning',
            });
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas anular la venta ${sale.sale_number}? Esta acción devolverá el stock al inventario.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, anular',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/sales/${sale.id}/cancel`, {}, {
                    onSuccess: () => {
                        Swal.fire(
                            '¡Anulado!',
                            'La venta ha sido anulada y el stock ha sido devuelto.',
                            'success'
                        );
                    },
                });
            }
        });
    };

    const handleOpenPdfModal = () => {
        setShowPdfModal(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Venta ${sale.sale_number}`} />

            <div className="space-y-4 p-4 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link href="/sales">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-primary" />
                            <div>
                                <h1 className="text-xl font-bold">{sale.sale_number}</h1>
                                <p className="text-xs text-muted-foreground">
                                    {documentTypeLabels[sale.document_type]}
                                </p>
                            </div>
                        </div>
                        <Badge className={statusColors[sale.status]} variant="default">
                            {statusLabels[sale.status]}
                        </Badge>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={handleOpenPdfModal}>
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir
                        </Button>
                        {(sale.status === 'pendiente' || sale.status === 'pagado') && (
                            <Link href={`/sales/${sale.id}/edit`}>
                                <Button size="sm">
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
                            </Link>
                        )}
                        {(sale.status === 'pendiente' || sale.status === 'pagado') && (
                            <Button variant="destructive" size="sm" onClick={handleCancel}>
                                <Ban className="h-4 w-4 mr-2" />
                                Anular
                            </Button>
                        )}
                    </div>
                </div>

                {/* Modal de PDF */}
                <PdfPreviewModal
                    open={showPdfModal}
                    onClose={() => setShowPdfModal(false)}
                    documentId={sale.id}
                    documentNumber={sale.sale_number}
                    documentType="sale"
                    documentLabel="Venta"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="h-4 w-4" />
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>
                                <span className="text-xs text-muted-foreground">Código:</span>
                                <p className="font-medium font-mono text-sm">{sale.customer.code}</p>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground">Nombre:</span>
                                <p className="font-medium text-sm">{sale.customer.name}</p>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground">Documento:</span>
                                <p className="font-mono text-sm">
                                    {sale.customer.document_type}: {sale.customer.document_number}
                                </p>
                            </div>
                            {sale.customer.phone && (
                                <div>
                                    <span className="text-xs text-muted-foreground">Teléfono:</span>
                                    <p className="text-sm">{sale.customer.phone}</p>
                                </div>
                            )}
                            {sale.customer.email && (
                                <div>
                                    <span className="text-xs text-muted-foreground">Email:</span>
                                    <p className="text-sm">{sale.customer.email}</p>
                                </div>
                            )}
                            {sale.customer.address && (
                                <div>
                                    <span className="text-xs text-muted-foreground">Dirección:</span>
                                    <p className="text-sm">{sale.customer.address}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sale Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4" />
                                Detalles de Venta
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>
                                <span className="text-xs text-muted-foreground">Serie - Correlativo:</span>
                                <p className="font-medium font-mono text-sm">{sale.series} - {sale.correlativo}</p>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Fecha:
                                </span>
                                <p className="font-medium text-sm">{formatDate(sale.sale_date)}</p>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Store className="h-3 w-3" />
                                    Sucursal:
                                </span>
                                <p className="font-medium text-sm">{sale.branch.name}</p>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground">Tipo de Pago:</span>
                                <div className="mt-1">
                                    {sale.payment_type === 'credito' ? (
                                        <Badge className="bg-orange-500 text-white text-xs">A Crédito</Badge>
                                    ) : (
                                        <Badge className="bg-blue-500 text-white text-xs">Al Contado</Badge>
                                    )}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <CreditCard className="h-3 w-3" />
                                    Método:
                                </span>
                                <p className="font-medium text-sm">{paymentMethodLabels[sale.payment_method]}</p>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground">Vendedor:</span>
                                <p className="font-medium text-sm">{sale.user.name}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Totals */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Resumen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Subtotal:</span>
                                <span className="font-medium">{formatCurrency(sale.subtotal)}</span>
                            </div>
                            {sale.tax > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-xs text-muted-foreground">IGV (18%):</span>
                                    <span className="font-medium">{formatCurrency(sale.tax)}</span>
                                </div>
                            )}
                            {sale.discount > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span className="text-xs">Descuento:</span>
                                    <span className="font-medium">- {formatCurrency(sale.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-2 border-t">
                                <span className="font-bold text-sm">Total:</span>
                                <span className="font-bold text-primary">{formatCurrency(sale.total)}</span>
                            </div>
                            <div className="pt-2 border-t space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-xs text-muted-foreground">Pagado:</span>
                                    <span className="font-medium text-sm">{formatCurrency(sale.amount_paid)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-muted-foreground">Vuelto:</span>
                                    <span className="font-medium text-sm text-green-600">
                                        {formatCurrency(sale.change_amount)}
                                    </span>
                                </div>
                            </div>
                            {sale.payment_type === 'credito' && (
                                <div className="pt-2 border-t">
                                    <p className="text-xs font-medium text-orange-700 mb-1.5">Crédito:</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Plazo:</span>
                                            <span>{sale.credit_days} días</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Cuotas:</span>
                                            <span>{sale.installments}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Inicial:</span>
                                            <span>{formatCurrency(sale.initial_payment || 0)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Saldo:</span>
                                            <span className="font-bold text-orange-600">
                                                {formatCurrency(sale.remaining_balance || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Products Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Productos</CardTitle>
                        <CardDescription className="text-xs">
                            Detalle de los productos vendidos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs">Código</TableHead>
                                        <TableHead className="text-xs">Producto</TableHead>
                                        <TableHead className="text-xs">Unidad</TableHead>
                                        <TableHead className="text-right text-xs">Cant.</TableHead>
                                        <TableHead className="text-right text-xs">P. Unit.</TableHead>
                                        <TableHead className="text-right text-xs">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sale.details.map((detail) => (
                                        <TableRow key={detail.id}>
                                            <TableCell className="font-mono text-xs">{detail.product.code}</TableCell>
                                            <TableCell className="font-medium text-sm">{detail.product.name}</TableCell>
                                            <TableCell className="text-xs">{detail.product.unit}</TableCell>
                                            <TableCell className="text-right text-sm">{detail.quantity}</TableCell>
                                            <TableCell className="text-right text-sm">
                                                {formatCurrency(detail.unit_price)}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-sm">
                                                {formatCurrency(detail.subtotal)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Installments - Solo para crédito */}
                {sale.payment_type === 'credito' && sale.payments && sale.payments.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <DollarSign className="h-4 w-4" />
                                Plan de Pagos
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Estado de las cuotas programadas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs">Cuota</TableHead>
                                            <TableHead className="text-xs">Monto</TableHead>
                                            <TableHead className="text-xs">Vencimiento</TableHead>
                                            <TableHead className="text-xs">Fecha Pago</TableHead>
                                            <TableHead className="text-xs">Estado</TableHead>
                                            <TableHead className="text-xs">Método</TableHead>
                                            <TableHead className="text-xs">Referencia</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sale.payments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell className="font-medium text-sm">
                                                    Cuota {payment.payment_number}
                                                </TableCell>
                                                <TableCell className="font-bold text-sm">
                                                    {formatCurrency(payment.amount)}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        {formatDate(payment.due_date)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {payment.paid_date ? (
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3 text-green-600" />
                                                            {formatDate(payment.paid_date)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getPaymentStatusBadge(payment)}</TableCell>
                                                <TableCell>
                                                    {payment.payment_method ? (
                                                        <span className="text-xs px-2 py-1 rounded bg-muted">
                                                            {paymentMethodLabels[payment.payment_method]}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {payment.transaction_reference || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Resumen de cuotas */}
                            <div className="mt-3 grid grid-cols-3 gap-3">
                                <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                                    <p className="text-xs text-muted-foreground">Pagadas</p>
                                    <p className="text-lg font-bold text-green-600">
                                        {sale.payments.filter(p => p.status === 'pagado').length}
                                    </p>
                                </div>
                                <div className="text-center p-2 bg-amber-50 rounded border border-amber-200">
                                    <p className="text-xs text-muted-foreground">Pendientes</p>
                                    <p className="text-lg font-bold text-amber-600">
                                        {sale.payments.filter(p => p.status === 'pendiente').length}
                                    </p>
                                </div>
                                <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                                    <p className="text-xs text-muted-foreground">Vencidas</p>
                                    <p className="text-lg font-bold text-red-600">
                                        {sale.payments.filter(p => p.status === 'vencido').length}
                                    </p>
                                </div>
                            </div>

                            {/* Alerta si hay pagos vencidos */}
                            {sale.payments.some(p => p.status === 'vencido') && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-red-800 text-sm">Atención: Pagos Vencidos</p>
                                        <p className="text-xs text-red-700 mt-0.5">
                                            Esta venta tiene cuotas vencidas. Contactar al cliente.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Notes */}
                {sale.notes && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Observaciones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{sale.notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}