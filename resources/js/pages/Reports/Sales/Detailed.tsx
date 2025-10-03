import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, FormEvent } from 'react';
import { FileDown, Search, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: '/reports' },
    { title: 'Ventas Detallado', href: '/reports/sales/detailed' },
];

interface Sale {
    id: number;
    sale_number: string;
    sale_date: string;
    customer?: {
        name: string;
        document_number?: string;
    };
    branch: {
        name: string;
    };
    user: {
        name: string;
    };
    document_type: string;
    payment_method: string;
    payment_type: string;
    status: string;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    notes?: string;
}

interface Props {
    sales: Sale[];
    totals: {
        count: number;
        subtotal: number;
        tax: number;
        discount: number;
        total: number;
        avg_ticket: number;
    };
    totalsByPaymentMethod: Record<string, { count: number; total: number }>;
    totalsByDocumentType: Record<string, { count: number; total: number }>;
    branches: Array<{ id: number; name: string }>;
    users: Array<{ id: number; name: string }>;
    customers: Array<{ id: number; name: string }>;
    filters: Record<string, string>;
    dateFrom?: string;
    dateTo?: string;
}

export default function SalesDetailedReport({
    sales = [],
    totals,
    totalsByPaymentMethod = {},
    totalsByDocumentType = {},
    branches = [],
    users = [],
    customers = [],
    filters: initialFilters = {},
    dateFrom,
    dateTo,
}: Props) {
    const [filters, setFilters] = useState({
        date_from: dateFrom || '',
        date_to: dateTo || '',
        branch_id: '',
        user_id: '',
        customer_id: '',
        document_type: '',
        payment_method: '',
        payment_type: '',
        status: '',
    });

    const [isGenerating, setIsGenerating] = useState(false);

    const handleFilterChange = (name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        router.get('/reports/sales/detailed', filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setFilters({
            date_from: '',
            date_to: '',
            branch_id: '',
            user_id: '',
            customer_id: '',
            document_type: '',
            payment_method: '',
            payment_type: '',
            status: '',
        });
        router.get('/reports/sales/detailed');
    };

    const handleGeneratePdf = () => {
        setIsGenerating(true);
        const queryString = new URLSearchParams(
            Object.entries(filters).filter(([_, value]) => value !== '')
        ).toString();
        window.open(`/reports/sales/detailed/pdf?${queryString}`, '_blank');
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
            pagado: 'bg-green-100 text-green-800',
            pendiente: 'bg-yellow-100 text-yellow-800',
            anulado: 'bg-red-100 text-red-800',
            cancelado: 'bg-gray-100 text-gray-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reporte de Ventas Detallado" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Reporte de Ventas Detallado</h1>
                        <p className="text-muted-foreground">
                            Visualiza y exporta el detalle completo de tus ventas
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
                                <Label htmlFor="user_id">Vendedor</Label>
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

                            {/* Tipo de Documento */}
                            <div className="space-y-2">
                                <Label htmlFor="document_type">Tipo de Documento</Label>
                                <select
                                    id="document_type"
                                    value={filters.document_type}
                                    onChange={(e) => handleFilterChange('document_type', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Todos</option>
                                    <option value="factura">Factura</option>
                                    <option value="boleta">Boleta</option>
                                    <option value="nota_venta">Nota de Venta</option>
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
                                    <option value="transferencia">Transferencia</option>
                                    <option value="tarjeta">Tarjeta</option>
                                    <option value="yape">Yape</option>
                                    <option value="plin">Plin</option>
                                </select>
                            </div>

                            {/* Tipo de Pago */}
                            <div className="space-y-2">
                                <Label htmlFor="payment_type">Tipo de Pago</Label>
                                <select
                                    id="payment_type"
                                    value={filters.payment_type}
                                    onChange={(e) => handleFilterChange('payment_type', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Todos</option>
                                    <option value="contado">Contado</option>
                                    <option value="credito">Crédito</option>
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
                                    <option value="pagado">Pagado</option>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="anulado">Anulado</option>
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Total Ventas</div>
                            <div className="text-2xl font-bold">{totals.count}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Subtotal</div>
                            <div className="text-2xl font-bold">{formatCurrency(totals.subtotal)}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">IGV</div>
                            <div className="text-2xl font-bold">{formatCurrency(totals.tax)}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Total</div>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(totals.total)}
                            </div>
                        </Card>
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
                                    <th className="text-left p-4 font-medium">Documento</th>
                                    <th className="text-left p-4 font-medium">Vendedor</th>
                                    <th className="text-left p-4 font-medium">Método Pago</th>
                                    <th className="text-left p-4 font-medium">Tipo</th>
                                    <th className="text-right p-4 font-medium">Subtotal</th>
                                    <th className="text-right p-4 font-medium">IGV</th>
                                    <th className="text-right p-4 font-medium">Total</th>
                                    <th className="text-center p-4 font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.length > 0 ? (
                                    sales.map((sale) => (
                                        <tr key={sale.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 font-medium">{sale.sale_number}</td>
                                            <td className="p-4">
                                                {format(new Date(sale.sale_date), 'dd/MM/yyyy')}
                                            </td>
                                            <td className="p-4">
                                                {sale.customer?.name || 'Cliente General'}
                                            </td>
                                            <td className="p-4">
                                                <span className="capitalize">
                                                    {sale.document_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4">{sale.user.name}</td>
                                            <td className="p-4">
                                                <span className="capitalize">{sale.payment_method}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="capitalize">{sale.payment_type}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {formatCurrency(sale.subtotal)}
                                            </td>
                                            <td className="p-4 text-right">
                                                {formatCurrency(sale.tax)}
                                            </td>
                                            <td className="p-4 text-right font-bold">
                                                {formatCurrency(sale.total)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(
                                                        sale.status
                                                    )}`}
                                                >
                                                    {sale.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={11} className="p-8 text-center text-muted-foreground">
                                            No se encontraron ventas con los filtros aplicados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Totales por Método de Pago */}
                {Object.keys(totalsByPaymentMethod).length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="p-4">
                            <h3 className="font-semibold mb-3">Totales por Método de Pago</h3>
                            <div className="space-y-2">
                                {Object.entries(totalsByPaymentMethod).map(([method, data]) => (
                                    <div key={method} className="flex justify-between text-sm">
                                        <span className="capitalize">{method}:</span>
                                        <span className="font-medium">
                                            {formatCurrency(data.total)} ({data.count} ventas)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-4">
                            <h3 className="font-semibold mb-3">Totales por Tipo de Documento</h3>
                            <div className="space-y-2">
                                {Object.entries(totalsByDocumentType).map(([type, data]) => (
                                    <div key={type} className="flex justify-between text-sm">
                                        <span className="capitalize">{type.replace('_', ' ')}:</span>
                                        <span className="font-medium">
                                            {formatCurrency(data.total)} ({data.count} ventas)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
