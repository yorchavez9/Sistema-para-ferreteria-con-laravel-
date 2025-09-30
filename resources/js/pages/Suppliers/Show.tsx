import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Pencil,
    Building2,
    Mail,
    Phone,
    MapPin,
    User,
    Globe,
    FileText,
    CreditCard,
    Calendar
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Supplier {
    id: number;
    name: string;
    code: string;
    document_type: string | null;
    document_number: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    contact_person: string | null;
    contact_phone: string | null;
    website: string | null;
    notes: string | null;
    payment_terms: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface ShowSupplierProps {
    supplier: Supplier;
}

const paymentTermsLabels: Record<string, string> = {
    'contado': 'Contado',
    'credito_15': 'Crédito 15 días',
    'credito_30': 'Crédito 30 días',
    'credito_45': 'Crédito 45 días',
    'credito_60': 'Crédito 60 días',
};

export default function ShowSupplier({ supplier }: ShowSupplierProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Proveedores', href: '/suppliers' },
        { title: supplier.name, href: `/suppliers/${supplier.id}` },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={supplier.name} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{supplier.name}</h1>
                            <p className="text-muted-foreground">Código: {supplier.code}</p>
                        </div>
                        <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                            {supplier.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/suppliers">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <Link href={`/suppliers/${supplier.id}/edit`}>
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
                                {supplier.document_type && supplier.document_number && (
                                    <div className="flex items-start gap-3">
                                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Documento</p>
                                            <p className="font-medium">
                                                {supplier.document_type}: {supplier.document_number}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {supplier.address && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Dirección</p>
                                            <p className="font-medium">{supplier.address}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Términos de Pago</p>
                                        <p className="font-medium">
                                            {paymentTermsLabels[supplier.payment_terms]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="rounded-lg border bg-card p-6">
                            <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>
                            <div className="space-y-4">
                                {supplier.phone && (
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Teléfono Principal</p>
                                            <a
                                                href={`tel:${supplier.phone}`}
                                                className="font-medium hover:underline"
                                            >
                                                {supplier.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {supplier.email && (
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <a
                                                href={`mailto:${supplier.email}`}
                                                className="font-medium hover:underline"
                                            >
                                                {supplier.email}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {supplier.contact_person && (
                                    <div className="flex items-start gap-3">
                                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Persona de Contacto</p>
                                            <p className="font-medium">{supplier.contact_person}</p>
                                            {supplier.contact_phone && (
                                                <a
                                                    href={`tel:${supplier.contact_phone}`}
                                                    className="text-sm text-muted-foreground hover:underline"
                                                >
                                                    {supplier.contact_phone}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {supplier.website && (
                                    <div className="flex items-start gap-3">
                                        <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Sitio Web</p>
                                            <a
                                                href={supplier.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium hover:underline"
                                            >
                                                {supplier.website}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        {supplier.notes && (
                            <div className="rounded-lg border bg-card p-6">
                                <h2 className="text-xl font-semibold mb-4">Notas</h2>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {supplier.notes}
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
                                        <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                                        <p className="text-sm font-medium">
                                            {formatDate(supplier.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Última Actualización</p>
                                        <p className="text-sm font-medium">
                                            {formatDate(supplier.updated_at)}
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
                                    Ver Órdenes de Compra
                                </Button>
                                <Button className="w-full justify-start" variant="outline" disabled>
                                    Nueva Orden de Compra
                                </Button>
                                <Button className="w-full justify-start" variant="outline" disabled>
                                    Historial de Pagos
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}