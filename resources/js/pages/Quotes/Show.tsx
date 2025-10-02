import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Pencil,
    Trash2,
    FileText,
    Copy,
    Download,
    Printer,
    ArrowLeft,
    Calendar,
    User,
    Building2,
    UserCircle
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';
import { useState } from 'react';

interface QuoteDetail {
    id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    discount: number;
    product: {
        id: number;
        name: string;
        code: string;
        unit_of_measure: string;
        category?: { name: string };
        brand?: { name: string };
    };
}

interface Quote {
    id: number;
    quote_number: string;
    quote_date: string;
    expiration_date: string;
    status: string;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    notes: string;
    customer: {
        id: number;
        name: string;
        document_number: string;
        document_type: string;
    } | null;
    branch: {
        id: number;
        name: string;
        location: string;
    };
    user: {
        id: number;
        name: string;
        email: string;
    };
    details: QuoteDetail[];
    converted_sale?: {
        id: number;
        sale_number: string;
    };
}

interface QuoteShowProps {
    quote: Quote;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cotizaciones', href: '/quotes' },
    { title: 'Detalles', href: '#' },
];

export default function QuoteShow({ quote }: QuoteShowProps) {
    const [selectedPrintSize, setSelectedPrintSize] = useState<string>('');
    const [showPrintSizeModal, setShowPrintSizeModal] = useState(false);

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            pendiente: { label: 'Pendiente', variant: 'secondary' },
            aprobada: { label: 'Aprobada', variant: 'default' },
            rechazada: { label: 'Rechazada', variant: 'destructive' },
            convertida: { label: 'Convertida', variant: 'default' },
            vencida: { label: 'Vencida', variant: 'destructive' },
        };

        const config = statusConfig[status] || { label: status, variant: 'outline' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleDelete = () => {
        if (quote.status === 'convertida') {
            Swal.fire({
                title: 'No se puede eliminar',
                text: 'No se pueden eliminar cotizaciones convertidas a venta.',
                icon: 'error',
            });
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la cotización ${quote.quote_number}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/quotes/${quote.id}`, {
                    onSuccess: () => {
                        Swal.fire(
                            'Eliminada!',
                            'La cotización ha sido eliminada.',
                            'success'
                        );
                        router.get('/quotes');
                    }
                });
            }
        });
    };

    const handleDuplicate = () => {
        Swal.fire({
            title: '¿Duplicar cotización?',
            text: 'Se creará una nueva cotización con los mismos datos',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, duplicar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/quotes/${quote.id}/duplicate`, {}, {
                    onSuccess: () => {
                        Swal.fire(
                            'Duplicada!',
                            'La cotización ha sido duplicada exitosamente.',
                            'success'
                        );
                    }
                });
            }
        });
    };

    const handlePrintSizeSelected = (size: string) => {
        setSelectedPrintSize(size);
        setShowPrintSizeModal(false);

        // Abrir PDF en nueva pestaña
        window.open(`/quotes/${quote.id}/pdf?size=${size}&action=print`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Cotización ${quote.quote_number}`} />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Cotización {quote.quote_number}</h1>
                        <p className="text-muted-foreground">
                            Creada el {formatDate(quote.quote_date)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/quotes">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>

                        {(quote.status === 'pendiente' || quote.status === 'aprobada') && (
                            <Link href={`/quotes/${quote.id}/edit`}>
                                <Button variant="outline">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                </Button>
                            </Link>
                        )}

                        <Button variant="outline" onClick={handleDuplicate}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                        </Button>

                        <Button onClick={() => setShowPrintSizeModal(true)}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </Button>

                        {quote.status !== 'convertida' && (
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Estado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {getStatusBadge(quote.status)}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(quote.total)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Válida hasta</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium">{formatDate(quote.expiration_date)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sucursal</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium">{quote.branch.name}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Cliente Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información del Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {quote.customer ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nombre</p>
                                    <p className="font-medium">{quote.customer.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Documento</p>
                                    <p className="font-medium">{quote.customer.document_type}: {quote.customer.document_number}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Sin cliente asignado</p>
                        )}
                    </CardContent>
                </Card>

                {/* Detalles de productos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Productos Cotizados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="text-center">Cantidad</TableHead>
                                        <TableHead className="text-right">Precio Unit.</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quote.details.map((detail) => (
                                        <TableRow key={detail.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{detail.product.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Código: {detail.product.code}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {detail.quantity} {detail.product.unit_of_measure}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(detail.unit_price)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(detail.subtotal)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Totales */}
                        <div className="mt-4 space-y-2 border-t pt-4">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
                            </div>
                            {quote.tax > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>IGV (18%):</span>
                                    <span className="font-medium">{formatCurrency(quote.tax)}</span>
                                </div>
                            )}
                            {quote.discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>Descuento:</span>
                                    <span className="font-medium text-destructive">-{formatCurrency(quote.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span>TOTAL:</span>
                                <span>{formatCurrency(quote.total)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notas */}
                {quote.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notas / Observaciones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Info adicional */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información Adicional</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Vendedor</p>
                                <p className="font-medium flex items-center gap-2">
                                    <UserCircle className="h-4 w-4" />
                                    {quote.user.name}
                                </p>
                            </div>
                            {quote.converted_sale && (
                                <div>
                                    <p className="text-muted-foreground">Venta generada</p>
                                    <Link href={`/sales/${quote.converted_sale.id}`}>
                                        <p className="font-medium text-primary hover:underline">
                                            {quote.converted_sale.sale_number}
                                        </p>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal de selección de tamaño de impresión */}
            {showPrintSizeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 max-w-sm w-full">
                        <div className="text-center mb-4">
                            <h2 className="text-lg font-bold mb-1">Seleccionar Formato</h2>
                            <p className="text-xs text-muted-foreground">Elige el tamaño del documento</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <button
                                onClick={() => handlePrintSizeSelected('a4')}
                                className="group relative p-2 border-2 rounded-md hover:border-primary hover:shadow-md transition-all text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 hover:scale-105"
                            >
                                <div className="mb-2 flex justify-center">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 transition-colors">
                                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
                                    </div>
                                </div>
                                <div className="font-extrabold text-sm mb-1">A4</div>
                                <div className="text-xs text-muted-foreground font-medium">21 x 29.7 cm</div>
                            </button>

                            <button
                                onClick={() => handlePrintSizeSelected('a5')}
                                className="group relative p-2 border-2 rounded-md hover:border-primary hover:shadow-md transition-all text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 hover:scale-105"
                            >
                                <div className="mb-2 flex justify-center">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded group-hover:bg-green-200 dark:group-hover:bg-green-800/60 transition-colors">
                                        <FileText className="h-6 w-6 text-green-600 dark:text-green-400 stroke-[2.5]" />
                                    </div>
                                </div>
                                <div className="font-extrabold text-sm mb-1">A5</div>
                                <div className="text-xs text-muted-foreground font-medium">14.8 x 21 cm</div>
                            </button>

                            <button
                                onClick={() => handlePrintSizeSelected('80mm')}
                                className="group relative p-2 border-2 rounded-md hover:border-primary hover:shadow-md transition-all text-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 hover:scale-105"
                            >
                                <div className="mb-2 flex justify-center">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded group-hover:bg-orange-200 dark:group-hover:bg-orange-800/60 transition-colors">
                                        <Printer className="h-6 w-6 text-orange-600 dark:text-orange-400 stroke-[2.5]" />
                                    </div>
                                </div>
                                <div className="font-extrabold text-sm mb-1">80mm</div>
                                <div className="text-xs text-muted-foreground font-medium">Ticket</div>
                            </button>

                            <button
                                onClick={() => handlePrintSizeSelected('50mm')}
                                className="group relative p-2 border-2 rounded-md hover:border-primary hover:shadow-md transition-all text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 hover:scale-105"
                            >
                                <div className="mb-2 flex justify-center">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60 transition-colors">
                                        <Printer className="h-6 w-6 text-purple-600 dark:text-purple-400 stroke-[2.5]" />
                                    </div>
                                </div>
                                <div className="font-extrabold text-sm mb-1">50mm</div>
                                <div className="text-xs text-muted-foreground font-medium">Mini Ticket</div>
                            </button>
                        </div>

                        <Button
                            onClick={() => setShowPrintSizeModal(false)}
                            variant="outline"
                            className="w-full"
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
