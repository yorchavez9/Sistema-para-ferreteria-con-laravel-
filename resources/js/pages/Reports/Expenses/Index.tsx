import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { formatCurrency } from '@/lib/format-currency';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useState, FormEvent } from 'react';
import { FileDown, Search, RefreshCw, Receipt, TrendingUp, Hash, DollarSign } from 'lucide-react';

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
                    <div className="flex items-center gap-3">
                        <Receipt className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold">Reporte de Gastos</h1>
                            <p className="text-muted-foreground">
                                Analisis detallado de gastos operativos por categoria
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleGeneratePdf}
                        disabled={isGenerating}
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                        <FileDown className="mr-2 h-4 w-4" />
                        {isGenerating ? 'Generando...' : 'Exportar PDF'}
                    </Button>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

                                {/* Categoria */}
                                <div className="space-y-2">
                                    <Label>Categoria</Label>
                                    <Select
                                        value={filters.category_id}
                                        onValueChange={(value) => handleFilterChange('category_id', value === '_all' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_all">Todas</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={String(category.id)}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sucursal */}
                                <div className="space-y-2">
                                    <Label>Sucursal</Label>
                                    <Select
                                        value={filters.branch_id}
                                        onValueChange={(value) => handleFilterChange('branch_id', value === '_all' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_all">Todas</SelectItem>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={String(branch.id)}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Usuario */}
                                <div className="space-y-2">
                                    <Label>Usuario</Label>
                                    <Select
                                        value={filters.user_id}
                                        onValueChange={(value) => handleFilterChange('user_id', value === '_all' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_all">Todos</SelectItem>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={String(user.id)}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Metodo de Pago */}
                                <div className="space-y-2">
                                    <Label>Metodo de Pago</Label>
                                    <Select
                                        value={filters.payment_method}
                                        onValueChange={(value) => handleFilterChange('payment_method', value === '_all' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_all">Todos</SelectItem>
                                            <SelectItem value="efectivo">Efectivo</SelectItem>
                                            <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                            <SelectItem value="transferencia">Transferencia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Monto Minimo */}
                                <div className="space-y-2">
                                    <Label htmlFor="min_amount">Monto Minimo</Label>
                                    <Input
                                        id="min_amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={filters.min_amount}
                                        onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                                    />
                                </div>

                                {/* Monto Maximo */}
                                <div className="space-y-2">
                                    <Label htmlFor="max_amount">Monto Maximo</Label>
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

                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="button" variant="outline" onClick={handleClearFilters}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Limpiar Filtros
                                </Button>
                                <Button type="submit">
                                    <Search className="mr-2 h-4 w-4" />
                                    Buscar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Resumen */}
                {totals && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="border-l-4 border-blue-500">
                            <CardContent className="flex items-center gap-4 py-4">
                                <div className="rounded-full bg-blue-100 p-3">
                                    <Hash className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Total de Gastos</div>
                                    <div className="text-2xl font-bold">{totals.total_expenses}</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-red-500">
                            <CardContent className="flex items-center gap-4 py-4">
                                <div className="rounded-full bg-red-100 p-3">
                                    <DollarSign className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Monto Total</div>
                                    <div className="text-2xl font-bold text-red-600">
                                        {formatCurrency(totals.total_amount)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tabla de Gastos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detalle de Gastos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Descripcion</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Sucursal</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                    <TableHead className="text-center">Metodo Pago</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.length > 0 ? (
                                    expenses.map((expense) => (
                                        <TableRow key={expense.id}>
                                            <TableCell className="text-sm">
                                                {new Date(expense.date).toLocaleDateString('es-PE')}
                                            </TableCell>
                                            <TableCell>{expense.description}</TableCell>
                                            <TableCell className="text-sm">
                                                <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                                                    {expense.category.name}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm">{expense.branch.name}</TableCell>
                                            <TableCell className="text-sm">{expense.user.name}</TableCell>
                                            <TableCell className="text-right font-bold text-red-600">
                                                {formatCurrency(expense.amount)}
                                            </TableCell>
                                            <TableCell className="text-center text-sm">
                                                {expense.payment_method
                                                    ? expense.payment_method.charAt(0).toUpperCase() +
                                                      expense.payment_method.slice(1)
                                                    : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            <Receipt className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                            No se encontraron gastos con los filtros aplicados
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Analisis por Categoria y Metodo de Pago */}
                {(totalsByCategory.length > 0 || totalsByPaymentMethod.length > 0) && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {totalsByCategory.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Gastos por Categoria
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
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
                                </CardContent>
                            </Card>
                        )}

                        {totalsByPaymentMethod.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Gastos por Metodo de Pago</CardTitle>
                                </CardHeader>
                                <CardContent>
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
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
