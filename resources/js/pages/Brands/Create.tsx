import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Marcas', href: '/brands' },
    { title: 'Crear Marca', href: '/brands/create' },
];

export default function Create() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        code: '',
        description: '',
        website: '',
        contact_email: '',
        contact_phone: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/brands', {
            onSuccess: () => {
                showSuccess('¡Marca creada!', 'La marca ha sido creada exitosamente.');
            },
            onError: () => {
                showError('Error al crear marca', 'Por favor, revisa los campos y vuelve a intentar.');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Marca" />

            <div className="space-y-6 p-6">
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/brands">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Nueva Marca</h1>
                        <p className="text-muted-foreground">
                            Crea una nueva marca para los productos
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Marca</CardTitle>
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
                                        placeholder="Ej. DeWalt"
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
                                        placeholder="Ej. DWT001"
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-500">{errors.code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="website">Sitio Web</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        value={data.website}
                                        onChange={(e) => setData('website', e.target.value)}
                                        className={errors.website ? 'border-red-500' : ''}
                                        placeholder="https://www.ejemplo.com"
                                    />
                                    {errors.website && (
                                        <p className="text-sm text-red-500">{errors.website}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_email">Email de Contacto</Label>
                                    <Input
                                        id="contact_email"
                                        type="email"
                                        value={data.contact_email}
                                        onChange={(e) => setData('contact_email', e.target.value)}
                                        className={errors.contact_email ? 'border-red-500' : ''}
                                        placeholder="contacto@ejemplo.com"
                                    />
                                    {errors.contact_email && (
                                        <p className="text-sm text-red-500">{errors.contact_email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
                                    <Input
                                        id="contact_phone"
                                        value={data.contact_phone}
                                        onChange={(e) => setData('contact_phone', e.target.value)}
                                        className={errors.contact_phone ? 'border-red-500' : ''}
                                        placeholder="+57 300 123 4567"
                                    />
                                    {errors.contact_phone && (
                                        <p className="text-sm text-red-500">{errors.contact_phone}</p>
                                    )}
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
                                    placeholder="Descripción opcional de la marca..."
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creando...' : 'Crear Marca'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/brands">Cancelar</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}