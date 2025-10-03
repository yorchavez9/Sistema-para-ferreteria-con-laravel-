import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, FormEvent } from 'react';
import { FileDown, Search, RefreshCw, Package, AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: '/reports' },
    { title: 'Compras', href: '/reports/purchases' },
];

interface PurchaseItem {
    purchase: {
        id: number;
        order_number: string;
        order_date: string;
        reception_date: string | null;
        status: 'pendiente' | 'parcial' | 'recibido' | 'cancelado';
        supplier: {
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
        subtotal: number;
        tax: number;
        total: number;
        payment_method: string;
    };
    total_items: number;
    received_items: number;
    pending_items: number;
}

interface Props {
    purchases: PurchaseItem[];
    totals: {
        total_purchases: number;
        total_subtotal: number;
        total_tax: number;
        total_amount: number;
        pending_count: number;
        received_count: number;
        partial_count: number;
    };
    suppliers: Array<{ id: number; name: string }>;
    branches: Array<{ id: number; name: string }>;
    users: Array<{ id: number; name: string }>;
    filters: Record<string, string>;
    totalsBySupplier?: Array<{ supplier: string; total: number; count: number }>;
    totalsByPaymentMethod?: Array<{ method: string; total: number; count: number }>;
}

export default function PurchasesReport({
    purchases = [],
    totals,
    suppliers = [],
    branches = [],
    users = [],
    filters: initialFilters = {},
    totalsBySupplier = [],
    totalsByPaymentMethod = [],
}: Props) {
    const [filters, setFilters] = useState({
        date_from: '',
        date_to: '',
        supplier_id: '',
        branch_id: '',
        user_id: '',
        status: '',
        payment_method: '',
    });

    const [isGenerating, setIsGenerating] = useState(false);

    const handleFilterChange = (name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        router.get('/reports/purchases', filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setFilters({
            date_from: '',
            date_to: '',
            supplier_id: '',
            branch_id: '',
            user_id: '',
            status: '',
            payment_method: '',
        });
        router.get('/reports/purchases');
    };

    const handleGeneratePdf = () => {
        setIsGenerating(true);
        const queryString = new URLSearchParams(
            Object.entries(filters).filter(([_, value]) => value !== '')
        ).toString();
        window.open(`/reports/purchases/pdf?${queryString}`, '_blank');
        setTimeout(() => setIsGenerating(false), 1000);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { class: string; label: string }> = {
            pendiente: { class: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
            parcial: { class: 'bg-blue-100 text-blue-800', label: 'Parcial' },
            recibido: { class: 'bg-green-100 text-green-800', label: 'Recibido' },
            cancelado: { class: 'bg-red-100 text-red-800', label: 'Cancelado' },
        };
        return badges[status] || badges.pendiente;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reporte de Compras" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Reporte de Compras</h1>
                        <p className="text-muted-foreground">
                            Análisis detallado de órdenes de compra y recepciones
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

                            {/* Proveedor */}
                            <div className="space-y-2">
                                <Label htmlFor="supplier_id">Proveedor</Label>
                                <select
                                    id="supplier_id"
                                    value={filters.supplier_id}
                                    onChange={(e) => handleFilterChange('supplier_id', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Todos</option>
                                    {suppliers.map((supplier) => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
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
                                    <option value="pendiente">Pendiente</option>
                                    <option value="parcial">Parcial</option>
                                    <option value="recibido">Recibido</option>
                                    <option value="cancelado">Cancelado</option>
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
                                    <option value="credito">Crédito</option>
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
                            <div className="text-sm text-muted-foreground">Total Compras</div>
                            <div className="text-2xl font-bold">{totals.total_purchases}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Subtotal</div>
                            <div className="text-2xl font-bold">
                                {formatCurrency(totals.total_subtotal)}
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">IGV</div>
                            <div className="text-2xl font-bold">
                                {formatCurrency(totals.total_tax)}
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Total</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(totals.total_amount)}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Estados */}
                {totals && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Pendientes</div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {totals.pending_count}
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Parciales</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {totals.partial_count}
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">Recibidos</div>
                            <div className="text-2xl font-bold text-green-600">
                                {totals.received_count}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Alerta de pendientes */}
                {totals && totals.pending_count > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-yellow-400" />
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <strong>Atención:</strong> Hay {totals.pending_count} orden(es) de
                                    compra pendiente(s) de recepción.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla de Compras */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 font-medium">N° Orden</th>
                                    <th className="text-left p-4 font-medium">Fecha Orden</th>
                                    <th className="text-left p-4 font-medium">Proveedor</th>
                                    <th className="text-left p-4 font-medium">Sucursal</th>
                                    <th className="text-center p-4 font-medium">Items</th>
                                    <th className="text-right p-4 font-medium">Subtotal</th>
                                    <th className="text-right p-4 font-medium">IGV</th>
                                    <th className="text-right p-4 font-medium">Total</th>
                                    <th className="text-center p-4 font-medium">Método Pago</th>
                                    <th className="text-center p-4 font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.length > 0 ? (
                                    purchases.map((item) => (
                                        <tr key={item.purchase.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4 font-mono text-sm font-medium">
                                                {item.purchase.order_number}
                                            </td>
                                            <td className="p-4 text-sm">
                                                {new Date(item.purchase.order_date).toLocaleDateString('es-PE')}
                                            </td>
                                            <td className="p-4">{item.purchase.supplier.name}</td>
                                            <td className="p-4 text-sm">{item.purchase.branch.name}</td>
                                            <td className="p-4 text-center">
                                                <div className="text-sm">
                                                    <span className="font-bold">{item.total_items}</span>
                                                    {item.purchase.status === 'parcial' && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.received_items} recibidos
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                {formatCurrency(item.purchase.subtotal)}
                                            </td>
                                            <td className="p-4 text-right">
                                                {formatCurrency(item.purchase.tax)}
                                            </td>
                                            <td className="p-4 text-right font-medium">
                                                {formatCurrency(item.purchase.total)}
                                            </td>
                                            <td className="p-4 text-center text-sm">
                                                {item.purchase.payment_method
                                                    ? item.purchase.payment_method.charAt(0).toUpperCase() +
                                                      item.purchase.payment_method.slice(1)
                                                    : '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                                                        getStatusBadge(item.purchase.status).class
                                                    }`}
                                                >
                                                    {getStatusBadge(item.purchase.status).label}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="p-8 text-center text-muted-foreground">
                                            <Package className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                            No se encontraron compras con los filtros aplicados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Análisis adicional */}
                {(totalsBySupplier.length > 0 || totalsByPaymentMethod.length > 0) && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {totalsBySupplier.length > 0 && (
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Total por Proveedor</h3>
                                <div className="space-y-2">
                                    {totalsBySupplier.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                            <div>
                                                <div className="font-medium">{item.supplier}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.count} compra(s)
                                                </div>
                                            </div>
                                            <div className="font-bold">{formatCurrency(item.total)}</div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {totalsByPaymentMethod.length > 0 && (
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Total por Método de Pago</h3>
                                <div className="space-y-2">
                                    {totalsByPaymentMethod.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                            <div>
                                                <div className="font-medium">
                                                    {item.method.charAt(0).toUpperCase() + item.method.slice(1)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.count} compra(s)
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
