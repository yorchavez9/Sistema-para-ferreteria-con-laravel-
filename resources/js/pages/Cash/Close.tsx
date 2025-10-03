import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Caja', href: '/cash' },
    { title: 'Cerrar Caja', href: '/cash/close' },
];

interface CashSession {
    id: number;
    cash_register: {
        name: string;
        code: string;
    };
    opened_at: string;
    opening_balance: number;
    movements?: Array<{
        id: number;
        type: string;
        amount: number;
        payment_method: string;
        description: string;
    }>;
}

interface Summary {
    opening_balance: number;
    sales_total: number;
    expenses_total: number;
    incomes_total: number;
    egresses_total: number;
    expected_balance: number;
    movements_by_type: Array<{
        type: string;
        count: number;
        total: number;
    }>;
    movements_by_payment: Array<{
        payment_method: string;
        total: number;
    }>;
}

interface Props {
    session: CashSession;
    summary: Summary;
}

export default function CashClose({ session, summary }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        actual_balance: '',
        closing_notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/cash/close');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const calculateDifference = () => {
        const actual = parseFloat(data.actual_balance) || 0;
        return actual - summary.expected_balance;
    };

    const difference = calculateDifference();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cerrar Caja" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Cerrar Caja</h1>
                        <p className="text-muted-foreground">
                            Arqueo y cierre de sesión de caja
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/cash">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Resumen de la Sesión */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6">
                            <h2 className="mb-4 text-xl font-bold">Información de la Sesión</h2>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Caja</p>
                                    <p className="font-medium">{session.cash_register.name}</p>
                                    <p className="text-xs text-muted-foreground">{session.cash_register.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Apertura</p>
                                    <p className="font-medium">
                                        {format(new Date(session.opened_at), "HH:mm", { locale: es })}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(session.opened_at), "dd/MM/yyyy", { locale: es })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                                    <p className="text-lg font-bold">{formatCurrency(session.opening_balance)}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Resumen de Movimientos */}
                        <Card className="p-6">
                            <h2 className="mb-4 text-xl font-bold">Resumen de Movimientos</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-lg border p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatCurrency(summary.incomes_total)}
                                            </p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-green-500" />
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Egresos Totales</p>
                                            <p className="text-2xl font-bold text-red-600">
                                                {formatCurrency(summary.egresses_total)}
                                            </p>
                                        </div>
                                        <TrendingDown className="h-8 w-8 text-red-500" />
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4 bg-blue-50">
                                    <p className="text-sm text-muted-foreground">Ventas del Día</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {formatCurrency(summary.sales_total)}
                                    </p>
                                </div>

                                <div className="rounded-lg border p-4 bg-orange-50">
                                    <p className="text-sm text-muted-foreground">Gastos del Día</p>
                                    <p className="text-xl font-bold text-orange-600">
                                        {formatCurrency(summary.expenses_total)}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Desglose por Método de Pago */}
                        <Card className="p-6">
                            <h2 className="mb-4 text-xl font-bold">Desglose por Método de Pago</h2>
                            <div className="space-y-2">
                                {summary.movements_by_payment.map((item) => (
                                    <div key={item.payment_method} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">
                                                {item.payment_method.charAt(0).toUpperCase() + item.payment_method.slice(1)}
                                            </Badge>
                                        </div>
                                        <p className="font-semibold">{formatCurrency(item.total)}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Formulario de Cierre */}
                        <Card className="p-6">
                            <h2 className="mb-4 text-xl font-bold">Arqueo de Caja</h2>
                            <form onSubmit={submit} className="space-y-6">
                                {/* Saldo Esperado */}
                                <div className="rounded-lg bg-blue-50 p-4">
                                    <p className="text-sm text-muted-foreground">Saldo Esperado (Sistema)</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {formatCurrency(summary.expected_balance)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Calculado automáticamente según movimientos
                                    </p>
                                </div>

                                {/* Saldo Real */}
                                <div className="space-y-2">
                                    <Label htmlFor="actual_balance">
                                        Saldo Real Contado (S/) <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="actual_balance"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.actual_balance}
                                            onChange={(e) => setData('actual_balance', e.target.value)}
                                            className="pl-10 text-lg font-semibold"
                                            placeholder="0.00"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    {errors.actual_balance && (
                                        <p className="text-sm text-red-500">{errors.actual_balance}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Cuente el efectivo físico en la caja
                                    </p>
                                </div>

                                {/* Diferencia */}
                                {data.actual_balance && (
                                    <div className={`rounded-lg p-4 ${
                                        difference === 0
                                            ? 'bg-green-50 border-green-200'
                                            : difference > 0
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-red-50 border-red-200'
                                    } border`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className={`h-5 w-5 ${
                                                difference === 0
                                                    ? 'text-green-600'
                                                    : difference > 0
                                                    ? 'text-blue-600'
                                                    : 'text-red-600'
                                            }`} />
                                            <p className="font-semibold">
                                                {difference === 0
                                                    ? '¡Perfecto! Caja cuadrada'
                                                    : difference > 0
                                                    ? 'Sobrante en caja'
                                                    : 'Faltante en caja'}
                                            </p>
                                        </div>
                                        <p className={`text-2xl font-bold ${
                                            difference === 0
                                                ? 'text-green-600'
                                                : difference > 0
                                                ? 'text-blue-600'
                                                : 'text-red-600'
                                        }`}>
                                            {difference > 0 ? '+' : ''}{formatCurrency(Math.abs(difference))}
                                        </p>
                                    </div>
                                )}

                                {/* Notas de Cierre */}
                                <div className="space-y-2">
                                    <Label htmlFor="closing_notes">Notas de Cierre (Opcional)</Label>
                                    <textarea
                                        id="closing_notes"
                                        value={data.closing_notes}
                                        onChange={(e) => setData('closing_notes', e.target.value)}
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Observaciones del cierre..."
                                        maxLength={500}
                                    />
                                    {errors.closing_notes && (
                                        <p className="text-sm text-red-500">{errors.closing_notes}</p>
                                    )}
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href="/cash">Cancelar</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Cerrando...' : 'Cerrar Caja'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Panel Lateral */}
                    <div className="space-y-4">
                        <Card className="p-6">
                            <h3 className="mb-4 text-lg font-semibold">Instrucciones</h3>
                            <div className="space-y-3 text-sm">
                                <div className="rounded-lg bg-yellow-50 p-3">
                                    <p className="font-medium text-yellow-900">⚠️ Importante</p>
                                    <ul className="mt-2 space-y-1 text-yellow-700">
                                        <li>• Cuente cuidadosamente el efectivo</li>
                                        <li>• Verifique billetes y monedas</li>
                                        <li>• Separe el dinero por denominación</li>
                                        <li>• No incluya tarjetas o transferencias</li>
                                    </ul>
                                </div>

                                <div className="rounded-lg border p-3">
                                    <p className="font-medium mb-2">Pasos para el Arqueo</p>
                                    <ol className="space-y-1 text-muted-foreground list-decimal list-inside">
                                        <li>Separar billetes por denominación</li>
                                        <li>Contar y anotar cada denominación</li>
                                        <li>Sumar el total de efectivo</li>
                                        <li>Ingresar el monto total aquí</li>
                                        <li>Verificar la diferencia</li>
                                    </ol>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="mb-2 text-lg font-semibold">Acerca de las diferencias</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>
                                    <strong className="text-green-600">Caja Cuadrada:</strong> El efectivo coincide exactamente
                                </p>
                                <p>
                                    <strong className="text-blue-600">Sobrante:</strong> Hay más efectivo del esperado
                                </p>
                                <p>
                                    <strong className="text-red-600">Faltante:</strong> Hay menos efectivo del esperado
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
