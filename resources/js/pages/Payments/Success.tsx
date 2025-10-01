import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Printer, ArrowLeft, FileText, Download } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Payment {
    id: number;
    sale_id: number;
    payment_number: number;
    amount: number;
    due_date: string;
    paid_date: string;
    status: string;
    payment_method: string;
    transaction_reference: string | null;
    sale: {
        sale_number: string;
        series: string;
        correlativo: string;
        customer: {
            name: string;
            document_number: string;
        };
    };
}

interface PaymentSuccessProps {
    payment: Payment;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pagos', href: '/payments' },
    { title: 'Pago Registrado', href: '#' },
];

export default function PaymentSuccess({ payment }: PaymentSuccessProps) {
    // URL del voucher en formato ticket 80mm
    const voucherUrl = `/payments/${payment.id}/voucher?size=80mm&preview=true`;

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
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const getPaymentMethodLabel = (method: string) => {
        const methods: Record<string, string> = {
            efectivo: 'Efectivo',
            tarjeta: 'Tarjeta',
            transferencia: 'Transferencia',
            yape: 'Yape',
            plin: 'Plin',
        };
        return methods[method] || method;
    };

    const handlePrint = () => {
        const iframe = document.getElementById('voucher-iframe') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.print();
        }
    };

    const handleDownload = () => {
        window.location.href = `/payments/${payment.id}/voucher?size=80mm`;
    };

    return (
        <AppLayout
            title="Pago Registrado Exitosamente"
            breadcrumbs={breadcrumbs}
            headerAction={
                <Button variant="outline" asChild>
                    <a href="/payments">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a Pagos
                    </a>
                </Button>
            }
        >
            <Head title="Pago Registrado" />

            <div className="max-w-3xl mx-auto space-y-6 p-6">
                {/* Success Message */}
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-12 w-12 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-green-900 mb-1">
                                    ¡Pago Registrado Exitosamente!
                                </h2>
                                <p className="text-sm text-green-700">
                                    El pago de la cuota ha sido registrado correctamente en el sistema.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Voucher Ticket */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Voucher de Pago - Ticket
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handlePrint}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Imprimir
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleDownload}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Descargar
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-hidden bg-gray-50" style={{ height: '70vh' }}>
                            <iframe
                                id="voucher-iframe"
                                src={voucherUrl}
                                className="w-full h-full"
                                title="Voucher de Pago"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        onClick={handlePrint}
                        className="flex-1"
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir Voucher
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/payments')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a Pagos
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
