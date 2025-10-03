import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    DollarSign,
    TrendingUp,
    TrendingDown,
    User,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    Building2,
    RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Caja', href: '/cash' },
    { title: 'Detalle de Sesión', href: '#' },
];

interface CashMovement {
    id: number;
    type: string;
    amount: number;
    payment_method: string;
    description: string;
    notes: string | null;
    reference_number: string | null;
    created_at: string;
    user: {
        name: string;
    };
    sale?: {
        sale_number: string;
    };
    payment?: {
        id: number;
    };
    expense?: {
        id: number;
        category: {
            name: string;
        };
    };
}

interface CashSession {
    id: number;
    cash_register: {
        id: number;
        name: string;
        code: string;
        branch: {
            id: number;
            name: string;
        };
    };
    user: {
        id: number;
        name: string;
    };
    branch: {
        id: number;
        name: string;
    };
    opened_at: string;
    closed_at: string | null;
    opening_balance: number;
    expected_balance: number | null;
    actual_balance: number | null;
    difference: number | null;
    opening_notes: string | null;
    closing_notes: string | null;
    status: 'abierta' | 'cerrada';
    movements: CashMovement[];
}

interface Summary {
    sales_total: number;
    expenses_total: number;
    incomes_total: number;
    egresses_total: number;
    movements_by_type: Array<{
        type: string;
        count: number;
        total: number;
    }>;
    movements_by_payment: Array<{
        payment_method: string;
        total: number;
    }>;
}

interface Props {
    session: CashSession;
    summary: Summary;
}

export default function CashShow({ session, summary }: Props) {
    const handleReopen = () => {
        Swal.fire({
            title: '¿Reabrir esta caja?',
            html: `
                <p class="mb-4">¿Estás seguro que deseas reabrir la sesión #${session.id}?</p>
                <p class="text-sm text-gray-600">La caja volverá a estar activa para registrar movimientos.</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, reabrir',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/cash/${session.id}/reopen`, {}, {
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Caja reabierta!',
                            text: 'La sesión ha sido reabierta correctamente.',
                            confirmButtonColor: '#10b981',
                        });
                    },
                    onError: (errors: any) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: errors.error || 'No se pudo reabrir la sesión.',
                            confirmButtonColor: '#d33',
                        });
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

    const getMovementTypeLabel = (type: string) => {
        const types: Record<string, { label: string; color: string }> = {
            venta: { label: 'Venta', color: 'bg-green-100 text-green-800' },
            pago_credito: { label: 'Pago Crédito', color: 'bg-blue-100 text-blue-800' },
            ingreso: { label: 'Ingreso', color: 'bg-emerald-100 text-emerald-800' },
            egreso: { label: 'Egreso', color: 'bg-red-100 text-red-800' },
            gasto: { label: 'Gasto', color: 'bg-orange-100 text-orange-800' },
            compra: { label: 'Compra', color: 'bg-purple-100 text-purple-800' },
            transferencia_entrada: { label: 'Transferencia Entrada', color: 'bg-cyan-100 text-cyan-800' },
            transferencia_salida: { label: 'Transferencia Salida', color: 'bg-pink-100 text-pink-800' },
            ajuste: { label: 'Ajuste', color: 'bg-gray-100 text-gray-800' },
        };
        return types[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    };

    const isIncome = (type: string) => {
        return ['venta', 'pago_credito', 'ingreso', 'transferencia_entrada'].includes(type);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Sesión #${session.id} - ${session.cash_register.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Detalle de Sesión #{session.id}</h1>
                        <p className="text-muted-foreground">
                            {session.cash_register.name} - {session.branch.name}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {session.status === 'cerrada' && (
                            <Button onClick={handleReopen} variant="default" className="bg-green-600 hover:bg-green-700">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reabrir Caja
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href="/cash">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Información General */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">Información</h2>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Caja</p>
                                <p className="font-medium">{session.cash_register.name}</p>
                                <p className="text-xs text-muted-foreground">{session.cash_register.code}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Cajero</p>
                                <p className="font-medium">{session.user.name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Estado</p>
                                {session.status === 'abierta' ? (
                                    <Badge variant="default" className="bg-green-500">Abierta</Badge>
                                ) : (
                                    <Badge variant="secondary">Cerrada</Badge>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">Fechas</h2>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Apertura</p>
                                <p className="font-medium">
                                    {format(new Date(session.opened_at), "dd/MM/yyyy", { locale: es })}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(session.opened_at), "HH:mm:ss", { locale: es })}
                                </p>
                            </div>
                            {session.closed_at && (
                                <div>
                                    <p className="text-muted-foreground">Cierre</p>
                                    <p className="font-medium">
                                        {format(new Date(session.closed_at), "dd/MM/yyyy", { locale: es })}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(session.closed_at), "HH:mm:ss", { locale: es })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">Arqueo</h2>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Saldo Inicial</p>
                                <p className="text-lg font-bold">{formatCurrency(session.opening_balance)}</p>
                            </div>
                            {session.expected_balance !== null && (
                                <div>
                                    <p className="text-muted-foreground">Saldo Esperado</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        {formatCurrency(session.expected_balance)}
                                    </p>
                                </div>
                            )}
                            {session.actual_balance !== null && (
                                <div>
                                    <p className="text-muted-foreground">Saldo Real</p>
                                    <p className="text-lg font-bold text-green-600">
                                        {formatCurrency(session.actual_balance)}
                                    </p>
                                </div>
                            )}
                            {session.difference !== null && (
                                <div>
                                    <p className="text-muted-foreground">Diferencia</p>
                                    <p className={`text-lg font-bold ${
                                        session.difference === 0
                                            ? 'text-green-600'
                                            : session.difference > 0
                                            ? 'text-blue-600'
                                            : 'text-red-600'
                                    }`}>
                                        {session.difference > 0 ? '+' : ''}{formatCurrency(session.difference)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Resumen de Movimientos */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Ingresos</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(summary.incomes_total)}
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Egresos</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {formatCurrency(summary.egresses_total)}
                                </p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-red-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Ventas</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(summary.sales_total)}
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-blue-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Gastos</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {formatCurrency(summary.expenses_total)}
                                </p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-orange-500" />
                        </div>
                    </Card>
                </div>

                {/* Notas */}
                {(session.opening_notes || session.closing_notes) && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {session.opening_notes && (
                            <Card className="p-6">
                                <h3 className="mb-2 font-semibold">Notas de Apertura</h3>
                                <p className="text-sm text-muted-foreground">{session.opening_notes}</p>
                            </Card>
                        )}
                        {session.closing_notes && (
                            <Card className="p-6">
                                <h3 className="mb-2 font-semibold">Notas de Cierre</h3>
                                <p className="text-sm text-muted-foreground">{session.closing_notes}</p>
                            </Card>
                        )}
                    </div>
                )}

                {/* Movimientos Detallados */}
                <Card className="p-6">
                    <h2 className="mb-4 text-xl font-bold">
                        Movimientos ({session.movements.length})
                    </h2>

                    {session.movements.length === 0 ? (
                        <div className="py-12 text-center">
                            <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-lg font-medium">No hay movimientos registrados</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-left text-sm font-medium">Hora</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Descripción</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Método</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Referencia</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Usuario</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {session.movements.map((movement) => {
                                        const typeInfo = getMovementTypeLabel(movement.type);
                                        const income = isIncome(movement.type);

                                        return (
                                            <tr key={movement.id} className="border-b hover:bg-muted/50">
                                                <td className="px-4 py-3 text-sm">
                                                    {format(new Date(movement.created_at), "HH:mm:ss")}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline" className={`text-xs ${typeInfo.color}`}>
                                                        {typeInfo.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-medium">{movement.description}</p>
                                                    {movement.notes && (
                                                        <p className="text-xs text-muted-foreground">{movement.notes}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm capitalize">
                                                    {movement.payment_method}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {movement.reference_number || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm">{movement.user.name}</td>
                                                <td className={`px-4 py-3 text-right text-sm font-bold ${
                                                    income ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {income ? '+' : '-'} {formatCurrency(movement.amount)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
