import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Pencil,
    User,
    Building2,
    Mail,
    Phone,
    MapPin,
    FileText,
    CreditCard,
    Calendar,
    Cake
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Customer {
    id: number;
    name: string;
    code: string;
    document_type: string | null;
    document_number: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    birth_date: string | null;
    customer_type: string;
    payment_terms: string;
    credit_limit: number;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface ShowCustomerProps {
    customer: Customer;
}

const customerTypeLabels: Record<string, string> = {
    'personal': 'Personal',
    'empresa': 'Empresa',
};

const paymentTermsLabels: Record<string, string> = {
    'contado': 'Contado',
    'credito_15': 'Crédito 15 días',
    'credito_30': 'Crédito 30 días',
    'credito_45': 'Crédito 45 días',
    'credito_60': 'Crédito 60 días',
};

export default function ShowCustomer({ customer }: ShowCustomerProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Clientes', href: '/customers' },
        { title: customer.name, href: `/customers/${customer.id}` },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={customer.name} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                            {customer.customer_type === 'empresa' ? (
                                <Building2 className="h-8 w-8 text-primary" />
                            ) : (
                                <User className="h-8 w-8 text-primary" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{customer.name}</h1>
                            <p className="text-muted-foreground">Código: {customer.code}</p>
                        </div>
                        <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                            {customer.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge variant="outline">
                            {customerTypeLabels[customer.customer_type]}
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/customers">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <Link href={`/customers/${customer.id}/edit`}>
                            <Button>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* General Information */}
                        <div className="rounded-lg border bg-card p-6">
                            <h2 className="text-xl font-semibold mb-4">Información General</h2>
                            <div className="space-y-4">
                                {customer.document_type && customer.document_number && (
                                    <div className="flex items-start gap-3">
                                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Documento</p>
                                            <p className="font-medium">
                                                {customer.document_type}: {customer.document_number}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {customer.address && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Dirección</p>
                                            <p className="font-medium">{customer.address}</p>
                                        </div>
                                    </div>
                                )}

                                {customer.birth_date && (
                                    <div className="flex items-start gap-3">
                                        <Cake className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                                            <p className="font-medium">{formatDate(customer.birth_date)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="rounded-lg border bg-card p-6">
                            <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>
                            <div className="space-y-4">
                                {customer.phone && (
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Teléfono</p>
                                            <a
                                                href={`tel:${customer.phone}`}
                                                className="font-medium hover:underline"
                                            >
                                                {customer.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {customer.email && (
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <a
                                                href={`mailto:${customer.email}`}
                                                className="font-medium hover:underline"
                                            >
                                                {customer.email}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Commercial Information */}
                        <div className="rounded-lg border bg-card p-6">
                            <h2 className="text-xl font-semibold mb-4">Información Comercial</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Términos de Pago</p>
                                        <p className="font-medium">
                                            {paymentTermsLabels[customer.payment_terms]}
                                        </p>
                                    </div>
                                </div>

                                {customer.credit_limit > 0 && (
                                    <div className="flex items-start gap-3">
                                        <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Límite de Crédito</p>
                                            <p className="font-medium text-lg">
                                                {formatCurrency(customer.credit_limit)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        {customer.notes && (
                            <div className="rounded-lg border bg-card p-6">
                                <h2 className="text-xl font-semibold mb-4">Notas</h2>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {customer.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Metadata */}
                        <div className="rounded-lg border bg-card p-6">
                            <h2 className="text-lg font-semibold mb-4">Información del Sistema</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                                        <p className="text-sm font-medium">
                                            {formatDate(customer.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Última Actualización</p>
                                        <p className="text-sm font-medium">
                                            {formatDate(customer.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="rounded-lg border bg-card p-6">
                            <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
                            <div className="space-y-2">
                                <Button className="w-full justify-start" variant="outline" disabled>
                                    Ver Historial de Compras
                                </Button>
                                <Button className="w-full justify-start" variant="outline" disabled>
                                    Nueva Venta
                                </Button>
                                <Button className="w-full justify-start" variant="outline" disabled>
                                    Estado de Cuenta
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}