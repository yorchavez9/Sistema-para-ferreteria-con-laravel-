import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, FormEvent } from 'react';
import { FileDown, Search, RefreshCw, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: '/reports' },
    { title: 'Caja Diaria', href: '/reports/cash/daily' },
];

interface CashSession {
    id: number;
    opened_at: string;
    closed_at?: string;
    opening_balance: number;
    expected_balance?: number;
    actual_balance?: number;
    difference?: number;
    status: string;
    cash_register: {
        id: number;
        name: string;
        branch?: {
            id: number;
            name: string;
        };
    };
    user: {
        id: number;
        name: string;
    };
    movements: Array<{
        id: number;
        type: string;
        description: string;
        amount: number;
        payment_method: string;
        created_at: string;
    }>;
}

interface Props {
    sessions: CashSession[];
    totals: {
        count: number;
        total_opening_balance: number;
        total_expected_balance: number;
        total_actual_balance: number;
        total_difference: number;
    };
    branches: Array<{ id: number; name: string }>;
    cashRegisters: Array<{ id: number; name: string }>;
    users: Array<{ id: number; name: string }>;
    filters: Record<string, string>;
    dateFrom?: string;
    dateTo?: string;
}

export default function CashDailyReport({
    sessions = [],
    totals,
    branches = [],
    cashRegisters = [],
    users = [],
    filters: initialFilters = {},
    dateFrom,
    dateTo,
}: Props) {
    const [filters, setFilters] = useState({
        date_from: dateFrom || '',
        date_to: dateTo || '',
        branch_id: '',
        cash_register_id: '',
        user_id: '',
        status: '',
    });

    const [isGenerating, setIsGenerating] = useState(false);

    const handleFilterChange = (name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        router.get('/reports/cash/daily', filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setFilters({
            date_from: '',
            date_to: '',
            branch_id: '',
            cash_register_id: '',
            user_id: '',
            status: '',
        });
        router.get('/reports/cash/daily');
    };

    const handleGeneratePdf = () => {
        setIsGenerating(true);
        const queryString = new URLSearchParams(
            Object.entries(filters).filter(([_, value]) => value !== '')
        ).toString();
        window.open(`/reports/cash/daily/pdf?${queryString}`, '_blank');
        setTimeout(() => setIsGenerating(false), 1000);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            abierta: 'bg-blue-100 text-blue-800',
            cerrada: 'bg-green-100 text-green-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getDifferenceBadge = (difference: number) => {
        if (difference > 0) {
            return 'text-green-600'; // Sobrante
        } else if (difference < 0) {
            return 'text-red-600'; // Faltante
        }
        return 'text-gray-600'; // Sin diferencia
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reporte de Caja Diaria" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Reporte de Caja Diaria</h1>
                        <p className="text-muted-foreground">
                            Detalle de sesiones y movimientos de caja
                        </p>
                    </div>
                    <Button
                        onClick={handleGeneratePdf}
                        disabled={isGenerating}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <FileDown className="mr-2 h-4 w-4" />
                        {isGenerating ? 'Generando...' : 'Exportar PDF'}
                    </Button>
                </div>

                {/* Filtros */}
                <Card className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
                            {/* Fecha Desde */}
                            <div className="space-y-2">
                                <Label htmlFor="date_from">Fecha Desde</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={filters.date_from}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                />
                            </div>

                            {/* Fecha Hasta */}
                            <div className="space-y-2">
                                <Label htmlFor="date_to">Fecha Hasta</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={filters.date_to}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                />
                            </div>

                            {/* Sucursal */}
                            <div className="space-y-2">
                                <Label htmlFor="branch_id">Sucursal</Label>
                                <select
                                    id="branch_id"
                                    value={filters.branch_id}
                                    onChange={(e) => handleFilterChange('branch_id', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Todas</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Caja Registradora */}
                            <div className="space-y-2">
                                <Label htmlFor="cash_register_id">Caja Registradora</Label>
                                <select
                                    id="cash_register_id"
                                    value={filters.cash_register_id}
                                    onChange={(e) => handleFilterChange('cash_register_id', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Todas</option>
                                    {cashRegisters.map((register) => (
                                        <option key={register.id} value={register.id}>
                                            {register.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Usuario */}
                            <div className="space-y-2">
                                <Label htmlFor="user_id">Cajero</Label>
                                <select
                                    id="user_id"
                                    value={filters.user_id}
                                    onChange={(e) => handleFilterChange('user_id', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Todos</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Estado */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Estado</Label>
                                <select
                                    id="status"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Todos</option>
                                    <option value="abierta">Abierta</option>
                                    <option value="cerrada">Cerrada</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit">
                                <Search className="mr-2 h-4 w-4" />
                                Buscar
                            </Button>
                            <Button type="button" variant="outline" onClick={handleClearFilters}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Limpiar Filtros
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Resumen */}
                {totals && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Sesiones</div>
                            <div className="text-2xl font-bold">{totals.count}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Saldo Inicial Total</div>
                            <div className="text-2xl font-bold">
                                {formatCurrency(totals.total_opening_balance)}
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Saldo Esperado</div>
                            <div className="text-2xl font-bold">
                                {formatCurrency(totals.total_expected_balance)}
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Saldo Real</div>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(totals.total_actual_balance)}
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Diferencia Total</div>
                            <div className={`text-2xl font-bold ${getDifferenceBadge(totals.total_difference)}`}>
                                {formatCurrency(totals.total_difference)}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Tabla de Sesiones */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 font-medium">ID</th>
                                    <th className="text-left p-4 font-medium">Apertura</th>
                                    <th className="text-left p-4 font-medium">Cierre</th>
                                    <th className="text-left p-4 font-medium">Caja / Sucursal</th>
                                    <th className="text-left p-4 font-medium">Cajero</th>
                                    <th className="text-right p-4 font-medium">Saldo Inicial</th>
                                    <th className="text-right p-4 font-medium">Saldo Esperado</th>
                                    <th className="text-right p-4 font-medium">Saldo Real</th>
                                    <th className="text-right p-4 font-medium">Diferencia</th>
                                    <th className="text-center p-4 font-medium">Estado</th>
                                    <th className="text-center p-4 font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.length > 0 ? (
                                    sessions.map((session) => (
                                        <tr key={session.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 font-medium">#{session.id}</td>
                                            <td className="p-4">
                                                {format(new Date(session.opened_at), 'dd/MM/yyyy HH:mm')}
                                            </td>
                                            <td className="p-4">
                                                {session.closed_at
                                                    ? format(new Date(session.closed_at), 'dd/MM/yyyy HH:mm')
                                                    : '-'}
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">
                                                    <div className="font-medium">{session.cash_register.name}</div>
                                                    {session.cash_register.branch && (
                                                        <div className="text-muted-foreground">
                                                            {session.cash_register.branch.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">{session.user.name}</td>
                                            <td className="p-4 text-right">
                                                {formatCurrency(session.opening_balance)}
                                            </td>
                                            <td className="p-4 text-right">
                                                {session.expected_balance !== undefined
                                                    ? formatCurrency(session.expected_balance)
                                                    : '-'}
                                            </td>
                                            <td className="p-4 text-right">
                                                {session.actual_balance !== undefined
                                                    ? formatCurrency(session.actual_balance)
                                                    : '-'}
                                            </td>
                                            <td className="p-4 text-right">
                                                {session.difference !== undefined ? (
                                                    <span className={`font-bold ${getDifferenceBadge(session.difference)}`}>
                                                        {formatCurrency(session.difference)}
                                                    </span>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(
                                                        session.status
                                                    )}`}
                                                >
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2 justify-center">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/cash/${session.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    {session.status === 'cerrada' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                window.open(
                                                                    `/reports/cash/closing/${session.id}/pdf`,
                                                                    '_blank'
                                                                )
                                                            }
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={11} className="p-8 text-center text-muted-foreground">
                                            No se encontraron sesiones de caja con los filtros aplicados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
