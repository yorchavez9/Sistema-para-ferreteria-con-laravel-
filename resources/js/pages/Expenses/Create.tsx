import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gastos', href: '/expenses' },
    { title: 'Nuevo Gasto', href: '/expenses/create' },
];

interface Category {
    id: number;
    name: string;
    color: string;
}

interface Branch {
    id: number;
    name: string;
}

interface CashSession {
    id: number;
    cash_register: {
        name: string;
    };
}

interface Props {
    categories: Category[];
    branches: Branch[];
    currentSession: CashSession | null;
}

export default function ExpensesCreate({ categories, branches, currentSession }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        expense_category_id: '',
        branch_id: '',
        expense_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_method: 'efectivo',
        supplier_name: '',
        document_type: '',
        document_number: '',
        description: '',
        notes: '',
        receipt_file: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/expenses');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Gasto" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Registrar Nuevo Gasto</h1>
                        <p className="text-muted-foreground">
                            Complete el formulario para registrar un gasto
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/expenses">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Formulario */}
                    <div className="lg:col-span-2">
                        <Card className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Categoría */}
                                    <div className="space-y-2">
                                        <Label htmlFor="expense_category_id">
                                            Categoría <span className="text-red-500">*</span>
                                        </Label>
                                        <select
                                            id="expense_category_id"
                                            value={data.expense_category_id}
                                            onChange={(e) => setData('expense_category_id', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="">Seleccione una categoría</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        {errors.expense_category_id && (
                                            <p className="text-sm text-red-500">{errors.expense_category_id}</p>
                                        )}
                                    </div>

                                    {/* Sucursal */}
                                    <div className="space-y-2">
                                        <Label htmlFor="branch_id">
                                            Sucursal <span className="text-red-500">*</span>
                                        </Label>
                                        <select
                                            id="branch_id"
                                            value={data.branch_id}
                                            onChange={(e) => setData('branch_id', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="">Seleccione una sucursal</option>
                                            {branches.map((branch) => (
                                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                                            ))}
                                        </select>
                                        {errors.branch_id && (
                                            <p className="text-sm text-red-500">{errors.branch_id}</p>
                                        )}
                                    </div>

                                    {/* Fecha */}
                                    <div className="space-y-2">
                                        <Label htmlFor="expense_date">
                                            Fecha del Gasto <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="expense_date"
                                            type="date"
                                            value={data.expense_date}
                                            onChange={(e) => setData('expense_date', e.target.value)}
                                            required
                                        />
                                        {errors.expense_date && (
                                            <p className="text-sm text-red-500">{errors.expense_date}</p>
                                        )}
                                    </div>

                                    {/* Monto */}
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">
                                            Monto (S/) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            placeholder="0.00"
                                            required
                                        />
                                        {errors.amount && (
                                            <p className="text-sm text-red-500">{errors.amount}</p>
                                        )}
                                    </div>

                                    {/* Método de Pago */}
                                    <div className="space-y-2">
                                        <Label htmlFor="payment_method">
                                            Método de Pago <span className="text-red-500">*</span>
                                        </Label>
                                        <select
                                            id="payment_method"
                                            value={data.payment_method}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="efectivo">Efectivo</option>
                                            <option value="tarjeta">Tarjeta</option>
                                            <option value="transferencia">Transferencia</option>
                                        </select>
                                        {errors.payment_method && (
                                            <p className="text-sm text-red-500">{errors.payment_method}</p>
                                        )}
                                    </div>

                                    {/* Proveedor */}
                                    <div className="space-y-2">
                                        <Label htmlFor="supplier_name">Proveedor (Opcional)</Label>
                                        <Input
                                            id="supplier_name"
                                            type="text"
                                            value={data.supplier_name}
                                            onChange={(e) => setData('supplier_name', e.target.value)}
                                            placeholder="Nombre del proveedor"
                                        />
                                        {errors.supplier_name && (
                                            <p className="text-sm text-red-500">{errors.supplier_name}</p>
                                        )}
                                    </div>

                                    {/* Tipo de Documento */}
                                    <div className="space-y-2">
                                        <Label htmlFor="document_type">Tipo de Documento</Label>
                                        <select
                                            id="document_type"
                                            value={data.document_type}
                                            onChange={(e) => setData('document_type', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="">Sin documento</option>
                                            <option value="boleta">Boleta</option>
                                            <option value="factura">Factura</option>
                                            <option value="recibo">Recibo</option>
                                        </select>
                                        {errors.document_type && (
                                            <p className="text-sm text-red-500">{errors.document_type}</p>
                                        )}
                                    </div>

                                    {/* Número de Documento */}
                                    <div className="space-y-2">
                                        <Label htmlFor="document_number">Número de Documento</Label>
                                        <Input
                                            id="document_number"
                                            type="text"
                                            value={data.document_number}
                                            onChange={(e) => setData('document_number', e.target.value)}
                                            placeholder="Ej: 001-123456"
                                        />
                                        {errors.document_number && (
                                            <p className="text-sm text-red-500">{errors.document_number}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Descripción <span className="text-red-500">*</span>
                                    </Label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        placeholder="Detalle del gasto..."
                                        required
                                        maxLength={500}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description}</p>
                                    )}
                                </div>

                                {/* Notas */}
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        placeholder="Observaciones adicionales..."
                                        maxLength={500}
                                    />
                                    {errors.notes && (
                                        <p className="text-sm text-red-500">{errors.notes}</p>
                                    )}
                                </div>

                                {/* Upload de Comprobante */}
                                <div className="space-y-2">
                                    <Label htmlFor="receipt_file">Comprobante (Opcional)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="receipt_file"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => setData('receipt_file', e.target.files?.[0] || null)}
                                            className="flex-1"
                                        />
                                        <Upload className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Formatos permitidos: PDF, JPG, PNG (Máx. 2MB)
                                    </p>
                                    {errors.receipt_file && (
                                        <p className="text-sm text-red-500">{errors.receipt_file}</p>
                                    )}
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href="/expenses">Cancelar</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Guardando...' : 'Registrar Gasto'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Panel Lateral */}
                    <div className="space-y-4">
                        {currentSession && currentSession.cash_register && (
                            <Card className="p-6 bg-green-50">
                                <h3 className="mb-2 text-lg font-semibold text-green-900">✓ Caja Abierta</h3>
                                <p className="text-sm text-green-700">
                                    {currentSession.cash_register.name}
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    Los gastos en efectivo se registrarán automáticamente en esta sesión
                                </p>
                            </Card>
                        )}

                        <Card className="p-6">
                            <h3 className="mb-4 text-lg font-semibold">Información</h3>
                            <div className="space-y-3 text-sm">
                                <div className="rounded-lg bg-blue-50 p-3">
                                    <p className="font-medium text-blue-900">💡 Consejos</p>
                                    <ul className="mt-2 space-y-1 text-blue-700">
                                        <li>• Registra todos los gastos del día</li>
                                        <li>• Guarda los comprobantes físicos</li>
                                        <li>• Sube fotos de los recibos</li>
                                        <li>• Describe detalladamente el gasto</li>
                                    </ul>
                                </div>

                                <div className="rounded-lg border p-3">
                                    <p className="font-medium mb-2">Flujo de Aprobación</p>
                                    <ol className="space-y-1 text-muted-foreground text-xs list-decimal list-inside">
                                        <li>Registrar el gasto</li>
                                        <li>Esperar aprobación del gerente</li>
                                        <li>Una vez aprobado, se registra en caja</li>
                                    </ol>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="mb-2 text-lg font-semibold">Métodos de Pago</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p><strong>Efectivo:</strong> Se descuenta de caja automáticamente</p>
                                <p><strong>Tarjeta/Transferencia:</strong> Solo registro contable</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
