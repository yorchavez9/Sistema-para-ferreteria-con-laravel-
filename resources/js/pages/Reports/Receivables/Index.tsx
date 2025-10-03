import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, FormEvent } from 'react';
import { FileDown, Search, RefreshCw, AlertCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: '/reports' },
    { title: 'Cuentas por Cobrar', href: '/reports/receivables' },
];

interface SaleWithPayments {
    sale: {
        id: number;
        sale_number: string;
        sale_date: string;
        customer: {
            id: number;
            name: string;
            document_number?: string;
        };
        branch: {
            name: string;
        };
        user: {
            name: string;
        };
        total: number;
        initial_payment: number;
        remaining_balance: number;
        credit_days: number;
        installments: number;
        payments: Array<{
            id: number;
            payment_number: number;
            amount: number;
            due_date: string;
            paid_date?: string;
            status: string;
        }>;
    };
    total_installments: number;
    paid_installments: number;
    pending_installments: number;
    has_overdue: boolean;
    overdue_count: number;
    max_days_overdue: number;
}

interface Props {
    sales: SaleWithPayments[];
    totals: {
        total_sales: number;
        total_amount: number;
        total_paid: number;
        total_pending: number;
        total_overdue: number;
    };
    customers: Array<{ id: number; name: string }>;
    branches: Array<{ id: number; name: string }>;
    filters: Record<string, string>;
    dateFrom?: string;
    dateTo?: string;
}

export default function ReceivablesReport({
    sales = [],
    totals,
    customers = [],
    branches = [],
    filters: initialFilters = {},
    dateFrom,
    dateTo,
}: Props) {
    const [filters, setFilters] = useState({
        date_from: dateFrom || '',
        date_to: dateTo || '',
        customer_id: '',
        branch_id: '',
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [expandedSales, setExpandedSales] = useState<Set<number>>(new Set());

    const handleFilterChange = (name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        router.get('/reports/receivables', filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setFilters({
            date_from: '',
            date_to: '',
            customer_id: '',
            branch_id: '',
        });
        router.get('/reports/receivables');
    };

    const handleGeneratePdf = () => {
        setIsGenerating(true);
        const queryString = new URLSearchParams(
            Object.entries(filters).filter(([_, value]) => value !== '')
        ).toString();
        window.open(`/reports/receivables/pdf?${queryString}`, '_blank');
        setTimeout(() => setIsGenerating(false), 1000);
    };

    const toggleExpanded = (saleId: number) => {
        setExpandedSales((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(saleId)) {
                newSet.delete(saleId);
            } else {
                newSet.add(saleId);
            }
            return newSet;
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            pendiente: 'bg-yellow-100 text-yellow-800',
            vencido: 'bg-red-100 text-red-800',
            pagado: 'bg-green-100 text-green-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getDaysOverdueBadge = (days: number) => {
        if (days > 30) return 'bg-red-600 text-white';
        if (days > 15) return 'bg-orange-500 text-white';
        if (days > 0) return 'bg-yellow-500 text-white';
        return 'bg-gray-200 text-gray-700';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cuentas por Cobrar" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Cuentas por Cobrar</h1>
                        <p className="text-muted-foreground">
                            Seguimiento de ventas a crédito y pagos pendientes
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

                            {/* Cliente */}
                            <div className="space-y-2">
                                <Label htmlFor="customer_id">Cliente</Label>
                                <select
                                    id="customer_id"
                                    value={filters.customer_id}
                                    onChange={(e) => handleFilterChange('customer_id', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Todos</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name}
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
                            <div className="text-sm text-muted-foreground">Ventas a Crédito</div>
                            <div className="text-2xl font-bold">{totals.total_sales}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Total Vendido</div>
                            <div className="text-2xl font-bold">
                                {formatCurrency(totals.total_amount)}
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Total Cobrado</div>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(totals.total_paid)}
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Por Cobrar</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(totals.total_pending)}
                            </div>
                        </Card>
                        <Card className="p-4 bg-red-50">
                            <div className="text-sm text-red-800">Vencido</div>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(totals.total_overdue)}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Alerta */}
                {totals && totals.total_overdue > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    <strong>¡Atención!</strong> Hay {formatCurrency(totals.total_overdue)} en
                                    cuentas vencidas. Se recomienda contactar a los clientes para gestionar el
                                    cobro.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla de Ventas */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 font-medium">N° Venta</th>
                                    <th className="text-left p-4 font-medium">Fecha</th>
                                    <th className="text-left p-4 font-medium">Cliente</th>
                                    <th className="text-left p-4 font-medium">Sucursal</th>
                                    <th className="text-right p-4 font-medium">Total</th>
                                    <th className="text-right p-4 font-medium">Inicial</th>
                                    <th className="text-right p-4 font-medium">Saldo</th>
                                    <th className="text-center p-4 font-medium">Cuotas</th>
                                    <th className="text-center p-4 font-medium">Estado</th>
                                    <th className="text-center p-4 font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.length > 0 ? (
                                    sales.map((item) => (
                                        <>
                                            <tr
                                                key={item.sale.id}
                                                className={`border-b hover:bg-muted/50 ${
                                                    item.has_overdue ? 'bg-red-50' : ''
                                                }`}
                                            >
                                                <td className="p-4 font-medium">
                                                    {item.sale.sale_number}
                                                </td>
                                                <td className="p-4">
                                                    {format(new Date(item.sale.sale_date), 'dd/MM/yyyy')}
                                                </td>
                                                <td className="p-4">{item.sale.customer.name}</td>
                                                <td className="p-4">{item.sale.branch.name}</td>
                                                <td className="p-4 text-right font-medium">
                                                    {formatCurrency(item.sale.total)}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {formatCurrency(item.sale.initial_payment)}
                                                </td>
                                                <td className="p-4 text-right font-bold text-blue-600">
                                                    {formatCurrency(item.sale.remaining_balance)}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="text-sm">
                                                        {item.paid_installments} / {item.total_installments}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {item.has_overdue ? (
                                                        <span
                                                            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getDaysOverdueBadge(
                                                                item.max_days_overdue
                                                            )}`}
                                                        >
                                                            {item.max_days_overdue} días atraso
                                                        </span>
                                                    ) : (
                                                        <span className="text-green-600 text-sm font-medium">
                                                            Al día
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2 justify-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleExpanded(item.sale.id)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/payments/sales/${item.sale.id}`}>
                                                                Ver Pagos
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Detalle de cuotas expandible */}
                                            {expandedSales.has(item.sale.id) && (
                                                <tr>
                                                    <td colSpan={10} className="p-4 bg-gray-50">
                                                        <div className="text-sm font-semibold mb-2">
                                                            Detalle de Cuotas:
                                                        </div>
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="p-2 text-left">Cuota</th>
                                                                    <th className="p-2 text-right">Monto</th>
                                                                    <th className="p-2 text-center">
                                                                        Vencimiento
                                                                    </th>
                                                                    <th className="p-2 text-center">
                                                                        Fecha Pago
                                                                    </th>
                                                                    <th className="p-2 text-center">Estado</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {item.sale.payments.map((payment) => (
                                                                    <tr
                                                                        key={payment.id}
                                                                        className="border-b"
                                                                    >
                                                                        <td className="p-2">
                                                                            Cuota #{payment.payment_number}
                                                                        </td>
                                                                        <td className="p-2 text-right">
                                                                            {formatCurrency(payment.amount)}
                                                                        </td>
                                                                        <td className="p-2 text-center">
                                                                            {format(
                                                                                new Date(payment.due_date),
                                                                                'dd/MM/yyyy'
                                                                            )}
                                                                        </td>
                                                                        <td className="p-2 text-center">
                                                                            {payment.paid_date
                                                                                ? format(
                                                                                      new Date(
                                                                                          payment.paid_date
                                                                                      ),
                                                                                      'dd/MM/yyyy'
                                                                                  )
                                                                                : '-'}
                                                                        </td>
                                                                        <td className="p-2 text-center">
                                                                            <span
                                                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(
                                                                                    payment.status
                                                                                )}`}
                                                                            >
                                                                                {payment.status}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="p-8 text-center text-muted-foreground">
                                            No se encontraron cuentas por cobrar con los filtros aplicados
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
