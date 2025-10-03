import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Calendar,
    DollarSign,
    Receipt,
    TrendingDown
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gastos', href: '/expenses' },
];

interface Expense {
    id: number;
    expense_date: string;
    amount: number;
    payment_method: string;
    supplier_name: string | null;
    document_type: string | null;
    document_number: string | null;
    description: string;
    status: 'pendiente' | 'aprobado' | 'rechazado';
    category: {
        id: number;
        name: string;
        color: string;
    };
    branch: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
    };
}

interface Stats {
    total_expenses: number;
    total_amount: number;
    pending_count: number;
    pending_amount: number;
    this_month: number;
    this_year: number;
}

interface Category {
    id: number;
    name: string;
    color: string;
}

interface Branch {
    id: number;
    name: string;
}

interface Props {
    expenses: {
        data: Expense[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
    categories: Category[];
    branches: Branch[];
    filters: {
        search?: string;
        status?: string;
        category_id?: string;
        branch_id?: string;
    };
}

export default function ExpensesIndex({ expenses, stats, categories, branches, filters = {} }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const handleSearch = useDebouncedCallback((value: string) => {
        router.get('/expenses', { search: value }, { preserveState: true, replace: true });
    }, 300);

    const handleApprove = (id: number) => {
        Swal.fire({
            title: '¿Aprobar gasto?',
            text: 'Esta acción aprobará el gasto y lo registrará en caja',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, aprobar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/expenses/${id}/approve`, {}, {
                    onSuccess: () => {
                        Swal.fire('¡Aprobado!', 'El gasto ha sido aprobado', 'success');
                    },
                });
            }
        });
    };

    const handleReject = (id: number) => {
        Swal.fire({
            title: '¿Rechazar gasto?',
            text: 'Esta acción rechazará el gasto',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, rechazar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/expenses/${id}/reject`, {}, {
                    onSuccess: () => {
                        Swal.fire('Rechazado', 'El gasto ha sido rechazado', 'success');
                    },
                });
            }
        });
    };

    const getStatusBadge = (status: string) => {
        const statuses = {
            pendiente: { label: 'Pendiente', class: 'bg-yellow-100 text-yellow-800' },
            aprobado: { label: 'Aprobado', class: 'bg-green-100 text-green-800' },
            rechazado: { label: 'Rechazado', class: 'bg-red-100 text-red-800' },
        };
        const statusInfo = statuses[status as keyof typeof statuses];
        return (
            <Badge variant="outline" className={statusInfo.class}>
                {statusInfo.label}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Gastos" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Gestión de Gastos</h1>
                        <p className="text-muted-foreground">Control de gastos operativos</p>
                    </div>
                    <Button asChild>
                        <Link href="/expenses/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Gasto
                        </Link>
                    </Button>
                </div>

                {/* Estadísticas */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Gastos</p>
                                <p className="text-2xl font-bold">{stats.total_expenses}</p>
                            </div>
                            <Receipt className="h-8 w-8 text-blue-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Monto Total</p>
                                <p className="text-xl font-bold">{formatCurrency(stats.total_amount)}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pendientes</p>
                                <p className="text-2xl font-bold">{stats.pending_count}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatCurrency(stats.pending_amount)}
                                </p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-yellow-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Este Mes</p>
                                <p className="text-xl font-bold">{formatCurrency(stats.this_month)}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-purple-500" />
                        </div>
                    </Card>
                </div>

                {/* Filtros y Búsqueda */}
                <Card className="p-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Buscar gastos..."
                                defaultValue={filters.search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <select
                            defaultValue={filters.status || ''}
                            onChange={(e) => router.get('/expenses', { ...filters, status: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Todos los estados</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="aprobado">Aprobado</option>
                            <option value="rechazado">Rechazado</option>
                        </select>

                        <select
                            defaultValue={filters.category_id || ''}
                            onChange={(e) => router.get('/expenses', { ...filters, category_id: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        <select
                            defaultValue={filters.branch_id || ''}
                            onChange={(e) => router.get('/expenses', { ...filters, branch_id: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Todas las sucursales</option>
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                        </select>
                    </div>
                </Card>

                {/* Tabla */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Categoría</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Descripción</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Proveedor</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Método</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Monto</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.data.map((expense) => (
                                    <tr key={expense.id} className="border-b hover:bg-muted/50">
                                        <td className="px-4 py-3 text-sm">
                                            {format(new Date(expense.expense_date), "dd/MM/yyyy", { locale: es })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                style={{ backgroundColor: expense.category.color + '20', color: expense.category.color }}
                                            >
                                                {expense.category.name}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-sm">{expense.description}</p>
                                            {expense.document_number && (
                                                <p className="text-xs text-muted-foreground">
                                                    {expense.document_type}: {expense.document_number}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{expense.supplier_name || '-'}</td>
                                        <td className="px-4 py-3 text-sm capitalize">{expense.payment_method}</td>
                                        <td className="px-4 py-3 text-sm font-bold">{formatCurrency(expense.amount)}</td>
                                        <td className="px-4 py-3">{getStatusBadge(expense.status)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/expenses/${expense.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {expense.status === 'pendiente' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleApprove(expense.id)}
                                                            className="text-green-600 hover:text-green-700"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleReject(expense.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {expenses.total > expenses.per_page && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-sm text-muted-foreground">
                                Mostrando {expenses.data.length} de {expenses.total} gastos
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={expenses.current_page === 1}
                                    onClick={() => router.get(`/expenses?page=${expenses.current_page - 1}`)}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={expenses.current_page === expenses.last_page}
                                    onClick={() => router.get(`/expenses?page=${expenses.current_page + 1}`)}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
