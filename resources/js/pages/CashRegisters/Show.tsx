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
    CheckCircle,
    XCircle,
    Edit,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Branch {
    id: number;
    name: string;
}

interface CashRegister {
    id: number;
    name: string;
    code: string;
    branch: Branch;
    type: string;
    opening_balance: number;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface CashSession {
    id: number;
    user: {
        name: string;
    };
    opened_at: string;
    closed_at: string | null;
    opening_balance: number;
    actual_balance: number | null;
    status: string;
}

interface Props {
    cashRegister: CashRegister;
    recentSessions: CashSession[];
}

export default function CashRegistersShow({ cashRegister, recentSessions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Cajas Registradoras', href: '/cash-registers' },
        { title: cashRegister.name, href: `/cash-registers/${cashRegister.id}` },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const getTypeLabel = (type: string) => {
        const types: Record<string, { label: string; color: string }> = {
            principal: { label: 'Principal', color: 'bg-blue-100 text-blue-800' },
            secundaria: { label: 'Secundaria', color: 'bg-purple-100 text-purple-800' },
        };
        return types[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    };

    const typeInfo = getTypeLabel(cashRegister.type);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${cashRegister.name} - Detalle`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{cashRegister.name}</h1>
                        <p className="text-muted-foreground">
                            Detalles de la caja registradora
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/cash-registers/${cashRegister.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/cash-registers">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Información Principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Datos Generales */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Información General</h2>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Nombre</p>
                                    <p className="font-medium">{cashRegister.name}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Código</p>
                                    <p className="font-mono font-medium">{cashRegister.code}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Sucursal</p>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <p className="font-medium">{cashRegister.branch.name}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Tipo de Caja</p>
                                    <Badge className={typeInfo.color}>
                                        {typeInfo.label}
                                    </Badge>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Saldo Inicial Sugerido</p>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <p className="font-medium">{formatCurrency(cashRegister.opening_balance)}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Estado</p>
                                    {cashRegister.is_active ? (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="font-medium">Activa</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-600">
                                            <XCircle className="h-4 w-4" />
                                            <span className="font-medium">Inactiva</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {cashRegister.description && (
                                <div className="mt-6">
                                    <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                                    <p className="text-sm">{cashRegister.description}</p>
                                </div>
                            )}
                        </Card>

                        {/* Sesiones Recientes */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Sesiones Recientes</h2>

                            {recentSessions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                                                    Usuario
                                                </th>
                                                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                                                    Apertura
                                                </th>
                                                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                                                    Cierre
                                                </th>
                                                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                                                    Saldo Inicial
                                                </th>
                                                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                                                    Estado
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentSessions.map((session) => (
                                                <tr key={session.id} className="border-b hover:bg-muted/50">
                                                    <td className="py-3 px-2">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">{session.user.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-2 text-sm">
                                                        {format(new Date(session.opened_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                                    </td>
                                                    <td className="py-3 px-2 text-sm">
                                                        {session.closed_at
                                                            ? format(new Date(session.closed_at), 'dd/MM/yyyy HH:mm', { locale: es })
                                                            : '-'}
                                                    </td>
                                                    <td className="py-3 px-2 text-sm font-medium">
                                                        {formatCurrency(session.opening_balance)}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        {session.status === 'abierta' ? (
                                                            <Badge className="bg-green-100 text-green-800">
                                                                Abierta
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">
                                                                Cerrada
                                                            </Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground">No hay sesiones registradas aún</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Panel Lateral */}
                    <div className="space-y-4">
                        <Card className="p-6">
                            <h3 className="mb-4 text-lg font-semibold">Fechas</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground mb-1">Creado</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p>{format(new Date(cashRegister.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Última Actualización</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p>{format(new Date(cashRegister.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="mb-4 text-lg font-semibold">Acciones Rápidas</h3>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/cash">
                                        Ver Sesiones de Caja
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href={`/cash-registers/${cashRegister.id}/edit`}>
                                        Editar Caja
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
