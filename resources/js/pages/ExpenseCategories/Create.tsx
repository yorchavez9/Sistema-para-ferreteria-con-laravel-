import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categorías de Gastos', href: '/expense-categories' },
    { title: 'Nueva Categoría', href: '/expense-categories/create' },
];

export default function ExpenseCategoriesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        description: '',
        color: '#3b82f6',
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/expense-categories');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Categoría de Gasto" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Nueva Categoría de Gasto</h1>
                        <p className="text-muted-foreground">
                            Crea una nueva categoría para clasificar tus gastos
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/expense-categories">
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
                                        Nombre <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Ej: Servicios, Insumos, Mantenimiento"
                                        required
                                        maxLength={255}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

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
                                        placeholder="Ej: SERV, INS, MANT"
                                        required
                                        maxLength={50}
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-500">{errors.code}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Código único para identificar la categoría
                                    </p>
                                </div>

                                {/* Descripción */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción (Opcional)</Label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Describe qué tipo de gastos incluye esta categoría..."
                                        maxLength={500}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description}</p>
                                    )}
                                </div>

                                {/* Color */}
                                <div className="space-y-2">
                                    <Label htmlFor="color">
                                        Color <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            id="color"
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                            className="h-12 w-24 rounded border cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                            className="flex-1 font-mono"
                                            placeholder="#3b82f6"
                                        />
                                    </div>
                                    {errors.color && (
                                        <p className="text-sm text-red-500">{errors.color}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Este color se usará para identificar la categoría
                                    </p>
                                </div>

                                {/* Estado Activo */}
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        Categoría activa (disponible para usar)
                                    </Label>
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href="/expense-categories">Cancelar</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Guardando...' : 'Crear Categoría'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Panel de Información */}
                    <div className="space-y-4">
                        <Card className="p-6">
                            <h3 className="mb-4 text-lg font-semibold">Consejos</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-green-500">✓</span>
                                    <span>Usa nombres descriptivos y cortos</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-green-500">✓</span>
                                    <span>Elige colores distintos para cada categoría</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 text-green-500">✓</span>
                                    <span>Agrupa gastos similares en la misma categoría</span>
                                </li>
                            </ul>
                        </Card>

                        <Card className="p-6">
                            <h3 className="mb-2 text-lg font-semibold">Ejemplos</h3>
                            <div className="space-y-2 text-sm">
                                <div className="rounded-lg border p-2">
                                    <p className="font-medium">Servicios</p>
                                    <p className="text-xs text-muted-foreground">Luz, agua, internet, teléfono</p>
                                </div>
                                <div className="rounded-lg border p-2">
                                    <p className="font-medium">Insumos</p>
                                    <p className="text-xs text-muted-foreground">Materiales de limpieza, papelería</p>
                                </div>
                                <div className="rounded-lg border p-2">
                                    <p className="font-medium">Mantenimiento</p>
                                    <p className="text-xs text-muted-foreground">Reparaciones, servicios técnicos</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
