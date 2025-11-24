import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { formatCurrency } from '@/lib/format-currency';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, FormEvent } from 'react';
import { FileDown, Search, RefreshCw, Receipt, TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: '/reports' },
    { title: 'Gastos', href: '/reports/expenses' },
];

interface ExpenseItem {
    id: number;
    date: string;
    description: string;
    amount: number;
    payment_method: string;
    category: {
        id: number;
        name: string;
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

interface Props {
    expenses: ExpenseItem[];
    totals: {
        total_expenses: number;
        total_amount: number;
    };
    categories: Array<{ id: number; name: string }>;
    branches: Array<{ id: number; name: string }>;
    users: Array<{ id: number; name: string }>;
    filters: Record<string, string>;
    totalsByCategory?: Array<{ category: string; total: number; count: number; percentage: number }>;
    totalsByPaymentMethod?: Array<{ method: string; total: number; count: number }>;
}

export default function ExpensesReport({
    expenses = [],
    totals,
    categories = [],
    branches = [],
    users = [],
    filters: initialFilters = {},
    totalsByCategory = [],
    totalsByPaymentMethod = [],
}: Props) {
    const [filters, setFilters] = useState({
        date_from: '',
        date_to: '',
        category_id: '',
        branch_id: '',
        user_id: '',
        payment_method: '',
        min_amount: '',
        max_amount: '',
    });

    const [isGenerating, setIsGenerating] = useState(false);

    const handleFilterChange = (name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        router.get('/reports/expenses', filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setFilters({
            date_from: '',
            date_to: '',
            category_id: '',
            branch_id: '',
            user_id: '',
            payment_method: '',
            min_amount: '',
            max_amount: '',
        });
        router.get('/reports/expenses');
    };

    const handleGeneratePdf = () => {
        setIsGenerating(true);
        const queryString = new URLSearchParams(
            Object.entries(filters).filter(([_, value]) => value !== '')
        ).toString();
        window.open(`/reports/expenses/pdf?${queryString}`, '_blank');
        setTimeout(() => setIsGenerating(false), 1000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reporte de Gastos" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Reporte de Gastos</h1>
                        <p className="text-muted-foreground">
                            Análisis detallado de gastos operativos por categoría
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
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
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

                            {/* Categoría */}
                            <div className="space-y-2">
                                <Label htmlFor="category_id">Categoría</Label>
                                <select
                                    id="category_id"
                                    value={filters.category_id}
                                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Todas</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
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

                            {/* Usuario */}
                            <div className="space-y-2">
                                <Label htmlFor="user_id">Usuario</Label>
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

                            {/* Método de Pago */}
                            <div className="space-y-2">
                                <Label htmlFor="payment_method">Método de Pago</Label>
                                <select
                                    id="payment_method"
                                    value={filters.payment_method}
                                    onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Todos</option>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="tarjeta">Tarjeta</option>
                                    <option value="transferencia">Transferencia</option>
                                </select>
                            </div>

                            {/* Monto Mínimo */}
                            <div className="space-y-2">
                                <Label htmlFor="min_amount">Monto Mínimo</Label>
                                <Input
                                    id="min_amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={filters.min_amount}
                                    onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                                />
                            </div>

                            {/* Monto Máximo */}
                            <div className="space-y-2">
                                <Label htmlFor="max_amount">Monto Máximo</Label>
                                <Input
                                    id="max_amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={filters.max_amount}
                                    onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                                />
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
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Total de Gastos</div>
                            <div className="text-2xl font-bold">{totals.total_expenses}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Monto Total</div>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(totals.total_amount)}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Tabla de Gastos */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 font-medium">Fecha</th>
                                    <th className="text-left p-4 font-medium">Descripción</th>
                                    <th className="text-left p-4 font-medium">Categoría</th>
                                    <th className="text-left p-4 font-medium">Sucursal</th>
                                    <th className="text-left p-4 font-medium">Usuario</th>
                                    <th className="text-right p-4 font-medium">Monto</th>
                                    <th className="text-center p-4 font-medium">Método Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.length > 0 ? (
                                    expenses.map((expense) => (
                                        <tr key={expense.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 text-sm">
                                                {new Date(expense.date).toLocaleDateString('es-PE')}
                                            </td>
                                            <td className="p-4">{expense.description}</td>
                                            <td className="p-4 text-sm">
                                                <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                                                    {expense.category.name}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm">{expense.branch.name}</td>
                                            <td className="p-4 text-sm">{expense.user.name}</td>
                                            <td className="p-4 text-right font-bold text-red-600">
                                                {formatCurrency(expense.amount)}
                                            </td>
                                            <td className="p-4 text-center text-sm">
                                                {expense.payment_method
                                                    ? expense.payment_method.charAt(0).toUpperCase() +
                                                      expense.payment_method.slice(1)
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            <Receipt className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                            No se encontraron gastos con los filtros aplicados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Análisis por Categoría y Método de Pago */}
                {(totalsByCategory.length > 0 || totalsByPaymentMethod.length > 0) && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {totalsByCategory.length > 0 && (
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Gastos por Categoría
                                </h3>
                                <div className="space-y-3">
                                    {totalsByCategory.map((item, index) => (
                                        <div key={index} className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <div className="font-medium">{item.category}</div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-muted-foreground">
                                                        {item.count} gasto(s)
                                                    </span>
                                                    <span className="font-bold">
                                                        {formatCurrency(item.total)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-red-600 h-2 rounded-full"
                                                        style={{ width: `${item.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-red-600">
                                                    {item.percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {totalsByPaymentMethod.length > 0 && (
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Gastos por Método de Pago</h3>
                                <div className="space-y-2">
                                    {totalsByPaymentMethod.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-2 bg-muted/50 rounded"
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {item.method.charAt(0).toUpperCase() + item.method.slice(1)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.count} gasto(s)
                                                </div>
                                            </div>
                                            <div className="font-bold">{formatCurrency(item.total)}</div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
