import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Caja', href: '/cash' },
    { title: 'Abrir Caja', href: '/cash/open' },
];

interface CashRegister {
    id: number;
    name: string;
    code: string;
    opening_balance: number;
    branch: {
        id: number;
        name: string;
    };
}

interface Props {
    cashRegisters: CashRegister[];
}

export default function CashOpen({ cashRegisters }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        cash_register_id: '',
        opening_balance: '',
        opening_notes: '',
    });

    const selectedRegister = cashRegisters.find(
        (r) => r.id === parseInt(data.cash_register_id)
    );

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/cash/open');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Abrir Caja" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Abrir Caja</h1>
                        <p className="text-muted-foreground">
                            Inicia una nueva sesión de caja
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
                    {/* Formulario */}
                    <div className="lg:col-span-2">
                        <Card className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Seleccionar Caja */}
                                <div className="space-y-2">
                                    <Label htmlFor="cash_register_id">
                                        Caja Registradora <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="cash_register_id"
                                        value={data.cash_register_id}
                                        onChange={(e) => {
                                            setData('cash_register_id', e.target.value);
                                            // Auto-fill opening balance
                                            const register = cashRegisters.find(
                                                (r) => r.id === parseInt(e.target.value)
                                            );
                                            if (register) {
                                                setData('opening_balance', Number(register.opening_balance).toString());
                                            }
                                        }}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        required
                                    >
                                        <option value="">Seleccione una caja</option>
                                        {cashRegisters.map((register) => (
                                            <option key={register.id} value={register.id}>
                                                {register.name} ({register.code}) - {register.branch.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.cash_register_id && (
                                        <p className="text-sm text-red-500">{errors.cash_register_id}</p>
                                    )}
                                </div>

                                {/* Saldo Inicial */}
                                <div className="space-y-2">
                                    <Label htmlFor="opening_balance">
                                        Saldo Inicial (S/) <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="opening_balance"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.opening_balance}
                                            onChange={(e) => setData('opening_balance', e.target.value)}
                                            className="pl-10"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    {errors.opening_balance && (
                                        <p className="text-sm text-red-500">{errors.opening_balance}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Ingrese el efectivo con el que inicia la caja
                                    </p>
                                </div>

                                {/* Notas de Apertura */}
                                <div className="space-y-2">
                                    <Label htmlFor="opening_notes">Notas de Apertura (Opcional)</Label>
                                    <textarea
                                        id="opening_notes"
                                        value={data.opening_notes}
                                        onChange={(e) => setData('opening_notes', e.target.value)}
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Observaciones adicionales..."
                                        maxLength={500}
                                    />
                                    {errors.opening_notes && (
                                        <p className="text-sm text-red-500">{errors.opening_notes}</p>
                                    )}
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href="/cash">Cancelar</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Abriendo...' : 'Abrir Caja'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Panel de Información */}
                    <div className="space-y-4">
                        <Card className="p-6">
                            <h3 className="mb-4 text-lg font-semibold">Información</h3>
                            <div className="space-y-3 text-sm">
                                <div className="rounded-lg bg-blue-50 p-3">
                                    <p className="font-medium text-blue-900">💡 Consejos</p>
                                    <ul className="mt-2 space-y-1 text-blue-700">
                                        <li>• Verifica el efectivo físico antes de abrir</li>
                                        <li>• Registra el saldo inicial exacto</li>
                                        <li>• Mantén la caja abierta solo durante tu turno</li>
                                    </ul>
                                </div>

                                {selectedRegister && (
                                    <div className="rounded-lg border p-3">
                                        <p className="mb-2 font-medium">Caja Seleccionada</p>
                                        <div className="space-y-1 text-muted-foreground">
                                            <p>
                                                <span className="font-medium">Nombre:</span>{' '}
                                                {selectedRegister.name}
                                            </p>
                                            <p>
                                                <span className="font-medium">Código:</span>{' '}
                                                {selectedRegister.code}
                                            </p>
                                            <p>
                                                <span className="font-medium">Sucursal:</span>{' '}
                                                {selectedRegister.branch.name}
                                            </p>
                                            <p>
                                                <span className="font-medium">Saldo sugerido:</span>{' '}
                                                S/ {Number(selectedRegister.opening_balance).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="mb-2 text-lg font-semibold">¿Qué sucede al abrir?</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-green-500">✓</span>
                                    <span>Se inicia una nueva sesión de caja</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-green-500">✓</span>
                                    <span>Los movimientos se registran automáticamente</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-green-500">✓</span>
                                    <span>Solo tú puedes usar esta caja hasta cerrarla</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-green-500">✓</span>
                                    <span>Al cerrar se realizará el arqueo automático</span>
                                </li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
