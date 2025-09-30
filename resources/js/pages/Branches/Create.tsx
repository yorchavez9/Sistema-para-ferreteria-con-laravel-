import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Sucursales', href: '/branches' },
    { title: 'Crear Sucursal', href: '/branches/create' },
];

export default function Create() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
        manager_name: '',
        latitude: '',
        longitude: '',
        is_active: true,
        is_main: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/branches', {
            onSuccess: () => {
                showSuccess('¡Sucursal creada!', 'La sucursal ha sido creada exitosamente.');
            },
            onError: () => {
                showError('Error al crear sucursal', 'Por favor, revisa los campos y vuelve a intentar.');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Sucursal" />

            <div className="space-y-6 p-6">
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/branches">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Nueva Sucursal</h1>
                        <p className="text-muted-foreground">
                            Crea una nueva sucursal para la ferretería
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Sucursal</CardTitle>
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
                                        placeholder="Ej. Sucursal Norte"
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
                                        placeholder="Ej. SUC-001"
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-500">{errors.code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className={errors.phone ? 'border-red-500' : ''}
                                        placeholder="+57 300 123 4567"
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-500">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'border-red-500' : ''}
                                        placeholder="sucursal@ferreteria.com"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="manager_name">Nombre del Gerente</Label>
                                    <Input
                                        id="manager_name"
                                        value={data.manager_name}
                                        onChange={(e) => setData('manager_name', e.target.value)}
                                        className={errors.manager_name ? 'border-red-500' : ''}
                                        placeholder="Nombre del gerente"
                                    />
                                    {errors.manager_name && (
                                        <p className="text-sm text-red-500">{errors.manager_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked)}
                                            />
                                            <Label htmlFor="is_active">
                                                {data.is_active ? 'Activa' : 'Inactiva'}
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="is_main"
                                                checked={data.is_main}
                                                onCheckedChange={(checked) => setData('is_main', checked)}
                                            />
                                            <Label htmlFor="is_main">
                                                Sucursal Principal
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección *</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    rows={3}
                                    className={errors.address ? 'border-red-500' : ''}
                                    placeholder="Dirección completa de la sucursal"
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-500">{errors.address}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitud</Label>
                                    <Input
                                        id="latitude"
                                        type="number"
                                        step="any"
                                        value={data.latitude}
                                        onChange={(e) => setData('latitude', e.target.value)}
                                        className={errors.latitude ? 'border-red-500' : ''}
                                        placeholder="Ej. 4.7110"
                                    />
                                    {errors.latitude && (
                                        <p className="text-sm text-red-500">{errors.latitude}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitud</Label>
                                    <Input
                                        id="longitude"
                                        type="number"
                                        step="any"
                                        value={data.longitude}
                                        onChange={(e) => setData('longitude', e.target.value)}
                                        className={errors.longitude ? 'border-red-500' : ''}
                                        placeholder="Ej. -74.0721"
                                    />
                                    {errors.longitude && (
                                        <p className="text-sm text-red-500">{errors.longitude}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creando...' : 'Crear Sucursal'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/branches">Cancelar</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}