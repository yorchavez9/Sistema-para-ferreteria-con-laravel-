import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, DollarSign, Calendar, FileText } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';

interface Payment {
    id: number;
    sale_id: number;
    payment_number: number;
    amount: number;
    due_date: string;
    status: string;
    sale: {
        series: string;
        correlativo: string;
        customer: {
            name: string;
            document_number: string;
        };
    };
}

interface PaymentPayProps {
    payment: Payment;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pagos', href: '/payments' },
    { title: 'Registrar Pago', href: '#' },
];

export default function PaymentPay({ payment }: PaymentPayProps) {
    const [formData, setFormData] = useState({
        payment_method: 'efectivo',
        transaction_reference: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.post(`/payments/${payment.id}/pay`, formData, {
            onSuccess: () => {
                // No mostrar alerta, solo redirigir a la página de éxito
                // La página de éxito abrirá automáticamente el modal del voucher
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);

                // Si el error es que ya está pagado, redirigir
                if (errors.error && typeof errors.error === 'string' && errors.error.includes('ya ha sido pagada')) {
                    showError('Cuota ya pagada', 'Esta cuota ya fue registrada como pagada. Redirigiendo...');
                    setTimeout(() => {
                        router.visit('/payments');
                    }, 2000);
                    return;
                }

                const errorMessages = Object.entries(errors).map(([field, messages]) => {
                    const messageArray = Array.isArray(messages) ? messages : [messages];
                    return `${field}: ${messageArray.join(', ')}`;
                }).join('\n');

                showError('Error al registrar pago', errorMessages || 'Por favor, revisa los campos y vuelve a intentar.');
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    return (
        <AppLayout
            title="Registrar Pago"
            breadcrumbs={breadcrumbs}
            headerAction={
                <Button variant="outline" asChild>
                    <a href="/payments">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </a>
                </Button>
            }
        >
            <Head title="Registrar Pago" />

            <div className="max-w-4xl mx-auto space-y-6 p-6">
                {/* Información de la Cuota */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Información de la Cuota</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-medium">Número de Venta</p>
                                <p className="font-mono font-semibold text-base text-primary mt-1">
                                    {payment.sale.series}-{payment.sale.correlativo}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-medium">Cliente</p>
                                <p className="text-sm font-semibold mt-1">{payment.sale.customer.name}</p>
                                <p className="text-xs text-muted-foreground">{payment.sale.customer.document_number}</p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-medium">Número de Cuota</p>
                                <p className="text-sm font-semibold mt-1">Cuota {payment.payment_number}</p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-medium">Monto a Pagar</p>
                                <p className="font-bold text-xl text-green-600 mt-1">
                                    {formatCurrency(payment.amount)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-medium">Fecha de Vencimiento</p>
                                <p className="text-sm font-semibold flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(payment.due_date)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-medium">Estado</p>
                                <p className={`text-sm font-semibold mt-1 ${payment.status === 'vencido' ? 'text-red-600' : 'text-amber-600'}`}>
                                    {payment.status === 'vencido' ? '⚠ VENCIDO' : '⏱ PENDIENTE'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Formulario de Registro de Pago */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <DollarSign className="h-5 w-5" />
                            Registrar Pago
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="payment_method">Método de Pago *</Label>
                                    <Select
                                        value={formData.payment_method}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, payment_method: value })
                                        }
                                    >
                                        <SelectTrigger id="payment_method">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="efectivo">Efectivo</SelectItem>
                                            <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                            <SelectItem value="transferencia">Transferencia</SelectItem>
                                            <SelectItem value="yape">Yape</SelectItem>
                                            <SelectItem value="plin">Plin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="transaction_reference">Nº de Operación / Voucher</Label>
                                    <Input
                                        id="transaction_reference"
                                        value={formData.transaction_reference}
                                        onChange={(e) =>
                                            setFormData({ ...formData, transaction_reference: e.target.value })
                                        }
                                        placeholder="Ej: 001234567890"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Opcional. Número de referencia.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notas u Observaciones</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                    placeholder="Observaciones adicionales sobre el pago..."
                                    rows={4}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={loading}
                                >
                                    {loading ? 'Procesando...' : 'Registrar Pago'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/payments')}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
