import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { formatCurrency } from '@/lib/format-currency';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    Minus,
    LogIn,
    LogOut
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Caja', href: '/cash' },
];

interface CashSession {
    id: number;
    cash_register: {
        id: number;
        name: string;
        code: string;
        branch?: {
            id: number;
            name: string;
        };
    };
    user: {
        id: number;
        name: string;
    };
    opened_at: string;
    closed_at: string | null;
    opening_balance: number;
    expected_balance: number | null;
    actual_balance: number | null;
    difference: number | null;
    status: 'abierta' | 'cerrada';
    movements?: CashMovement[];
}

interface CashMovement {
    id: number;
    type: string;
    amount: number;
    payment_method: string;
    description: string;
    created_at: string;
    user: {
        name: string;
    };
}

interface Props {
    sessions: {
        data: CashSession[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    currentSession: CashSession | null;
    stats: {
        active_sessions: number;
        today_sessions: number;
        today_sales: number;
        today_income: number;
    };
    branches: Array<{ id: number; name: string }>;
    cashRegisters: Array<{
        id: number;
        name: string;
        code: string;
        branch: { id: number; name: string };
    }>;
}

export default function CashIndex({
    sessions,
    currentSession,
    stats,
    branches,
    cashRegisters,
}: Props) {
    const getMovementTypeLabel = (type: string) => {
        const types: Record<string, { label: string; color: string }> = {
            venta: { label: 'Venta', color: 'bg-green-100 text-green-800' },
            pago_credito: { label: 'Pago Crédito', color: 'bg-blue-100 text-blue-800' },
            ingreso: { label: 'Ingreso', color: 'bg-emerald-100 text-emerald-800' },
            egreso: { label: 'Egreso', color: 'bg-red-100 text-red-800' },
            gasto: { label: 'Gasto', color: 'bg-orange-100 text-orange-800' },
            transferencia_entrada: { label: 'Transfer. Entrada', color: 'bg-cyan-100 text-cyan-800' },
            transferencia_salida: { label: 'Transfer. Salida', color: 'bg-purple-100 text-purple-800' },
        };
        return types[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Caja" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Gestión de Caja</h1>
                        <p className="text-muted-foreground">
                            Control de sesiones, ingresos y egresos
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {currentSession ? (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href="/cash/close">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Cerrar Caja
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <Button asChild>
                                <Link href="/cash/open">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Abrir Caja
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Sesiones Activas</p>
                                <p className="text-3xl font-bold">{stats.active_sessions}</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Sesiones Hoy</p>
                                <p className="text-3xl font-bold">{stats.today_sessions}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Ventas Hoy</p>
                                <p className="text-2xl font-bold">{formatCurrency(stats.today_sales)}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-emerald-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                                <p className="text-2xl font-bold">{formatCurrency(stats.today_income)}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-yellow-500" />
                        </div>
                    </Card>
                </div>

                {/* Sesión Actual */}
                {currentSession && (
                    <Card className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Sesión Actual</h2>
                                <p className="text-sm text-muted-foreground">
                                    {currentSession.cash_register.name}
                                    {currentSession.cash_register.branch && ` - ${currentSession.cash_register.branch.name}`}
                                </p>
                            </div>
                            <Badge variant="default" className="bg-green-500">
                                Abierta
                            </Badge>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3 mb-6">
                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                                <p className="text-2xl font-bold">{formatCurrency(currentSession.opening_balance)}</p>
                            </div>
                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">Hora de Apertura</p>
                                <p className="text-lg font-semibold">
                                    {format(new Date(currentSession.opened_at), "HH:mm", { locale: es })}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(currentSession.opened_at), "dd/MM/yyyy", { locale: es })}
                                </p>
                            </div>
                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">Cajero</p>
                                <p className="text-lg font-semibold">{currentSession.user.name}</p>
                            </div>
                        </div>

                        {/* Últimos Movimientos */}
                        {currentSession.movements && currentSession.movements.length > 0 && (
                            <div>
                                <h3 className="mb-3 text-lg font-semibold">Últimos Movimientos</h3>
                                <div className="space-y-2">
                                    {currentSession.movements.slice(0, 5).map((movement) => {
                                        const typeInfo = getMovementTypeLabel(movement.type);
                                        const isIncome = ['venta', 'pago_credito', 'ingreso', 'transferencia_entrada'].includes(movement.type);

                                        return (
                                            <div key={movement.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="flex items-center gap-3">
                                                    {isIncome ? (
                                                        <TrendingUp className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <TrendingDown className="h-5 w-5 text-red-500" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{movement.description}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className={`text-xs ${typeInfo.color}`}>
                                                                {typeInfo.label}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                {movement.payment_method}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {format(new Date(movement.created_at), "HH:mm")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                                                    {isIncome ? '+' : '-'} {formatCurrency(movement.amount)}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 flex justify-center gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/cash/${currentSession.id}`}>
                                            Ver Todos los Movimientos
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {/* Historial de Sesiones */}
                <Card className="p-6">
                    <h2 className="mb-4 text-xl font-bold">Historial de Sesiones</h2>

                    {sessions.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <XCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-lg font-medium">No hay sesiones registradas</p>
                            <p className="text-muted-foreground">Abre una caja para comenzar</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-left text-sm font-medium">Caja</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Usuario</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Apertura</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Cierre</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Saldo Inicial</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Diferencia</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.data.map((session) => (
                                        <tr key={session.id} className="border-b hover:bg-muted/50">
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{session.cash_register.name}</p>
                                                <p className="text-xs text-muted-foreground">{session.branch.name}</p>
                                            </td>
                                            <td className="px-4 py-3">{session.user.name}</td>
                                            <td className="px-4 py-3">
                                                {format(new Date(session.opened_at), "dd/MM/yyyy HH:mm", { locale: es })}
                                            </td>
                                            <td className="px-4 py-3">
                                                {session.closed_at
                                                    ? format(new Date(session.closed_at), "dd/MM/yyyy HH:mm", { locale: es })
                                                    : '-'
                                                }
                                            </td>
                                            <td className="px-4 py-3">{formatCurrency(session.opening_balance)}</td>
                                            <td className="px-4 py-3">
                                                {session.difference !== null && session.difference !== undefined ? (
                                                    <span className={session.difference === 0 ? 'text-green-600' : session.difference > 0 ? 'text-blue-600' : 'text-red-600'}>
                                                        {formatCurrency(session.difference)}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {session.status === 'abierta' ? (
                                                    <Badge variant="default" className="bg-green-500">Abierta</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Cerrada</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/cash/${session.id}`}>Ver Detalles</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
