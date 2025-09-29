import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';

interface Category {
    id: number;
    name: string;
}

interface Props {
    parentCategories: Category[];
}

export default function Create({ parentCategories }: Props) {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        code: '',
        description: '',
        parent_id: 'none',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = {
            ...data,
            parent_id: data.parent_id === 'none' ? null : data.parent_id
        };
        post('/categories', {
            data: formData,
            onSuccess: () => {
                showSuccess('¡Categoría creada!', 'La categoría ha sido creada exitosamente.');
            },
            onError: () => {
                showError('Error al crear categoría', 'Por favor, revisa los campos y vuelve a intentar.');
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Categorías', href: '/categories' },
        { title: 'Crear Categoría', href: '/categories/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Categoría" />

            <div className="space-y-6 p-6">
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/categories">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Nueva Categoría</h1>
                        <p className="text-muted-foreground">
                            Crea una nueva categoría para organizar tus productos
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-red-500' : ''}
                                        placeholder="Ej. Herramientas Eléctricas"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">Código *</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className={errors.code ? 'border-red-500' : ''}
                                        placeholder="Ej. HE001"
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-500">{errors.code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="parent_id">Categoría Padre</Label>
                                    <Select
                                        value={data.parent_id}
                                        onValueChange={(value) => setData('parent_id', value)}
                                    >
                                        <SelectTrigger className={errors.parent_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecciona una categoría padre (opcional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sin categoría padre</SelectItem>
                                            {parentCategories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.parent_id && (
                                        <p className="text-sm text-red-500">{errors.parent_id}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Opcional: Selecciona una categoría principal para crear una subcategoría
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className={errors.description ? 'border-red-500' : ''}
                                    placeholder="Descripción opcional de la categoría..."
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creando...' : 'Crear Categoría'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/categories">Cancelar</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}