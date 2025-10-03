import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cajas Registradoras', href: '/cash-registers' },
];

interface CashRegister {
    id: number;
    name: string;
    code: string;
    type: 'principal' | 'secundaria';
    is_active: boolean;
    opening_balance: number;
    branch: {
        id: number;
        name: string;
    };
    current_session: any | null;
    is_open: boolean;
    current_user: {
        name: string;
    } | null;
}

interface Stats {
    total_registers: number;
    active_registers: number;
    open_registers: number;
}

interface Branch {
    id: number;
    name: string;
}

interface Props {
    cashRegisters: {
        data: CashRegister[];
        current_page: number;
        last_page: number;
        total: number;
    };
    branches: Branch[];
    stats: Stats;
}

export default function CashRegistersIndex({ cashRegisters, branches, stats }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cajas Registradoras" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Cajas Registradoras</h1>
                        <p className="text-muted-foreground">Gestión de cajas por sucursal</p>
                    </div>
                    <Button asChild>
                        <Link href="/cash-registers/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Caja
                        </Link>
                    </Button>
                </div>

                {/* Estadísticas */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Cajas</p>
                                <p className="text-3xl font-bold">{stats.total_registers}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-blue-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Cajas Activas</p>
                                <p className="text-3xl font-bold">{stats.active_registers}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Cajas Abiertas</p>
                                <p className="text-3xl font-bold">{stats.open_registers}</p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-500" />
                        </div>
                    </Card>
                </div>

                {/* Tabla */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Código</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Sucursal</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Saldo Inicial</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Estado Caja</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Usuario Actual</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cashRegisters.data.map((register) => (
                                    <tr key={register.id} className="border-b hover:bg-muted/50">
                                        <td className="px-4 py-3 font-medium">{register.name}</td>
                                        <td className="px-4 py-3">
                                            <code className="rounded bg-muted px-2 py-1 text-xs">
                                                {register.code}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3">{register.branch.name}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={register.type === 'principal' ? 'default' : 'secondary'}>
                                                {register.type === 'principal' ? 'Principal' : 'Secundaria'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">{formatCurrency(register.opening_balance)}</td>
                                        <td className="px-4 py-3">
                                            {register.is_open ? (
                                                <Badge variant="default" className="bg-green-500">
                                                    Abierta
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Cerrada</Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {register.current_user?.name || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {register.is_active ? (
                                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                    Activa
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-red-100 text-red-800">
                                                    <XCircle className="mr-1 h-3 w-3" />
                                                    Inactiva
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/cash-registers/${register.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/cash-registers/${register.id}/edit`}>
                                                        Editar
                                                    </Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {cashRegisters.data.length === 0 && (
                        <div className="py-12 text-center">
                            <XCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-lg font-medium">No hay cajas registradas</p>
                            <p className="text-muted-foreground">Crea una caja para comenzar</p>
                            <Button className="mt-4" asChild>
                                <Link href="/cash-registers/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear Primera Caja
                                </Link>
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
