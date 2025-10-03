import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cajas Registradoras', href: '/cash-registers' },
    { title: 'Nueva Caja', href: '/cash-registers/create' },
];

interface Branch {
    id: number;
    name: string;
}

interface Props {
    branches: Branch[];
}

export default function CashRegistersCreate({ branches }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        branch_id: '',
        type: 'secundaria',
        opening_balance: '100',
        description: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/cash-registers');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Caja Registradora" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Nueva Caja Registradora</h1>
                        <p className="text-muted-foreground">
                            Registra una nueva caja para tu sucursal
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/cash-registers">
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
                                {/* Nombre */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Nombre de la Caja <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Ej: Caja Principal, Caja 2"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Código */}
                                    <div className="space-y-2">
                                        <Label htmlFor="code">
                                            Código <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="code"
                                            type="text"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                            placeholder="Ej: CP01, CS01"
                                            required
                                            maxLength={50}
                                        />
                                        {errors.code && (
                                            <p className="text-sm text-red-500">{errors.code}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Código único para identificar la caja
                                        </p>
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
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            required
                                        >
                                            <option value="">Seleccione una sucursal</option>
                                            {branches.map((branch) => (
                                                <option key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.branch_id && (
                                            <p className="text-sm text-red-500">{errors.branch_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Tipo */}
                                    <div className="space-y-2">
                                        <Label htmlFor="type">
                                            Tipo de Caja <span className="text-red-500">*</span>
                                        </Label>
                                        <select
                                            id="type"
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            required
                                        >
                                            <option value="principal">Principal</option>
                                            <option value="secundaria">Secundaria</option>
                                        </select>
                                        {errors.type && (
                                            <p className="text-sm text-red-500">{errors.type}</p>
                                        )}
                                    </div>

                                    {/* Saldo Inicial */}
                                    <div className="space-y-2">
                                        <Label htmlFor="opening_balance">
                                            Saldo Inicial Sugerido (S/) <span className="text-red-500">*</span>
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
                                                placeholder="100.00"
                                                required
                                            />
                                        </div>
                                        {errors.opening_balance && (
                                            <p className="text-sm text-red-500">{errors.opening_balance}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Monto sugerido al abrir esta caja
                                        </p>
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción (Opcional)</Label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Información adicional sobre la caja..."
                                        maxLength={500}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description}</p>
                                    )}
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href="/cash-registers">Cancelar</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Guardando...' : 'Crear Caja'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Panel de Información */}
                    <div className="space-y-4">
                        <Card className="p-6">
                            <h3 className="mb-4 text-lg font-semibold">Tipos de Caja</h3>
                            <div className="space-y-3 text-sm">
                                <div className="rounded-lg border p-3">
                                    <p className="font-medium text-blue-900">Caja Principal</p>
                                    <p className="text-muted-foreground mt-1">
                                        La caja principal de la sucursal. Maneja las operaciones más importantes.
                                    </p>
                                </div>

                                <div className="rounded-lg border p-3">
                                    <p className="font-medium text-purple-900">Caja Secundaria</p>
                                    <p className="text-muted-foreground mt-1">
                                        Cajas adicionales para atender más clientes simultáneamente.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="mb-4 text-lg font-semibold">Consejos</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-green-500">✓</span>
                                    <span>Usa códigos cortos y únicos (Ej: CP01, CS02)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-green-500">✓</span>
                                    <span>Define un saldo inicial adecuado para dar vuelto</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-green-500">✓</span>
                                    <span>Asigna cada caja a una sucursal específica</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-green-500">✓</span>
                                    <span>Puedes crear múltiples cajas por sucursal</span>
                                </li>
                            </ul>
                        </Card>

                        <Card className="p-6">
                            <h3 className="mb-2 text-lg font-semibold">Después de crear</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>Una vez creada la caja:</p>
                                <ol className="list-decimal list-inside space-y-1 mt-2">
                                    <li>Los usuarios podrán abrirla desde "Gestión de Caja"</li>
                                    <li>Al abrir se registra el saldo inicial</li>
                                    <li>Todas las operaciones quedan registradas</li>
                                    <li>Al cerrar se realiza el arqueo automático</li>
                                </ol>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
