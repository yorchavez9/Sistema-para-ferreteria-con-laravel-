import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    DollarSign,
    Building2,
    Calendar,
    User,
    FileText,
    Receipt,
    Edit,
    Download
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gastos', href: '/expenses' },
    { title: 'Detalle de Gasto', href: '#' },
];

interface Category {
    id: number;
    name: string;
    color: string;
}

interface Branch {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
}

interface CashSession {
    id: number;
    cash_register: {
        name: string;
    };
}

interface Expense {
    id: number;
    expense_date: string;
    amount: number;
    payment_method: string;
    supplier_name: string | null;
    document_type: string | null;
    document_number: string | null;
    description: string;
    notes: string | null;
    receipt_path: string | null;
    status: 'pendiente' | 'aprobado' | 'rechazado';
    approved_at: string | null;
    rejected_at: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
    category: Category;
    branch: Branch;
    user: User;
    approvedBy?: User;
    cashSession?: CashSession;
}

interface Props {
    expense: Expense;
}

export default function ExpensesShow({ expense }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const getStatusInfo = (status: string) => {
        const statuses: Record<string, { label: string; color: string }> = {
            pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
            aprobado: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
            rechazado: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
        };
        return statuses[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    };

    const getPaymentMethodLabel = (method: string) => {
        const methods: Record<string, string> = {
            efectivo: 'Efectivo',
            transferencia: 'Transferencia',
            tarjeta: 'Tarjeta',
            cheque: 'Cheque',
        };
        return methods[method] || method;
    };

    const getDocumentTypeLabel = (type: string | null) => {
        if (!type) return '-';
        const types: Record<string, string> = {
            boleta: 'Boleta',
            factura: 'Factura',
            recibo: 'Recibo',
            ticket: 'Ticket',
        };
        return types[type] || type;
    };

    const statusInfo = getStatusInfo(expense.status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Gasto #${expense.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Detalle de Gasto #{expense.id}</h1>
                        <p className="text-muted-foreground">
                            {expense.category.name}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {expense.status === 'aprobado' && (
                            <Button variant="outline" asChild>
                                <Link href={`/expenses/${expense.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href="/expenses">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Información Principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Datos del Gasto */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Información del Gasto</h2>
                                <Badge className={statusInfo.color}>
                                    {statusInfo.label}
                                </Badge>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Monto</p>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(expense.amount)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Fecha del Gasto</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="font-medium">
                                            {format(new Date(expense.expense_date), 'dd/MM/yyyy', { locale: es })}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Categoría</p>
                                    <Badge
                                        className="text-sm"
                                        style={{
                                            backgroundColor: expense.category.color + '20',
                                            color: expense.category.color,
                                            borderColor: expense.category.color
                                        }}
                                    >
                                        {expense.category.name}
                                    </Badge>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Método de Pago</p>
                                    <p className="font-medium">{getPaymentMethodLabel(expense.payment_method)}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Sucursal</p>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <p className="font-medium">{expense.branch.name}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Registrado por</p>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <p className="font-medium">{expense.user.name}</p>
                                    </div>
                                </div>
                            </div>

                            {expense.description && (
                                <div className="mt-6">
                                    <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                                    <p className="text-sm">{expense.description}</p>
                                </div>
                            )}

                            {expense.notes && (
                                <div className="mt-4">
                                    <p className="text-sm text-muted-foreground mb-1">Notas</p>
                                    <p className="text-sm">{expense.notes}</p>
                                </div>
                            )}
                        </Card>

                        {/* Documento */}
                        {(expense.supplier_name || expense.document_type || expense.document_number) && (
                            <Card className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Información del Documento</h2>

                                <div className="grid gap-6 md:grid-cols-2">
                                    {expense.supplier_name && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Proveedor</p>
                                            <p className="font-medium">{expense.supplier_name}</p>
                                        </div>
                                    )}

                                    {expense.document_type && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Tipo de Documento</p>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <p className="font-medium">{getDocumentTypeLabel(expense.document_type)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {expense.document_number && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Número de Documento</p>
                                            <p className="font-mono font-medium">{expense.document_number}</p>
                                        </div>
                                    )}

                                    {expense.receipt_path && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Comprobante</p>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`/storage/${expense.receipt_path}`} target="_blank" rel="noopener noreferrer">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Ver Comprobante
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Información de Aprobación/Rechazo */}
                        {expense.status !== 'pendiente' && (
                            <Card className="p-6">
                                <h2 className="text-xl font-semibold mb-4">
                                    {expense.status === 'aprobado' ? 'Información de Aprobación' : 'Información de Rechazo'}
                                </h2>

                                <div className="grid gap-4">
                                    {expense.approvedBy && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                {expense.status === 'aprobado' ? 'Aprobado por' : 'Rechazado por'}
                                            </p>
                                            <p className="font-medium">{expense.approvedBy.name}</p>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Fecha</p>
                                        <p className="font-medium">
                                            {expense.approved_at && format(new Date(expense.approved_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                            {expense.rejected_at && format(new Date(expense.rejected_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                        </p>
                                    </div>

                                    {expense.rejection_reason && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Motivo del Rechazo</p>
                                            <p className="text-sm text-red-600">{expense.rejection_reason}</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Panel Lateral */}
                    <div className="space-y-4">
                        {expense.cashSession && (
                            <Card className="p-6">
                                <h3 className="mb-4 text-lg font-semibold">Sesión de Caja</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Receipt className="h-4 w-4 text-muted-foreground" />
                                        <p>{expense.cashSession.cash_register.name}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Registrado en sesión #{expense.cashSession.id}
                                    </p>
                                </div>
                            </Card>
                        )}

                        <Card className="p-6">
                            <h3 className="mb-4 text-lg font-semibold">Fechas</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground mb-1">Creado</p>
                                    <p>{format(new Date(expense.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Última Actualización</p>
                                    <p>{format(new Date(expense.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="mb-4 text-lg font-semibold">Acciones</h3>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/expenses">
                                        Ver Todos los Gastos
                                    </Link>
                                </Button>
                                {expense.status === 'aprobado' && (
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href={`/expenses/${expense.id}/edit`}>
                                            Editar Gasto
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
