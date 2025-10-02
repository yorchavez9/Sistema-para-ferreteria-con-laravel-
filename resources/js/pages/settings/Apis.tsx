import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Cloud, Save, Check, X, AlertCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';

interface Setting {
    id: number;
    // RENIEC
    reniec_api_url: string;
    reniec_api_token: string | null;
    reniec_api_enabled: boolean;
    // SUNAT
    sunat_api_url: string;
    sunat_api_token: string | null;
    sunat_api_ruc: string | null;
    sunat_api_username: string | null;
    sunat_api_password: string | null;
    sunat_api_enabled: boolean;
    sunat_production_mode: boolean;
}

interface ApisProps {
    settings: Setting;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Configuración del Sistema', href: '/settings/system/apis' },
    { title: 'APIs Externas', href: '/settings/system/apis' },
];

export default function Apis({ settings }: ApisProps) {
    const [formData, setFormData] = useState({
        // RENIEC
        reniec_api_url: settings.reniec_api_url || 'https://api.apis.net.pe/v2/reniec/dni',
        reniec_api_token: settings.reniec_api_token || '',
        reniec_api_enabled: settings.reniec_api_enabled || false,
        // SUNAT
        sunat_api_url: settings.sunat_api_url || 'https://api.apis.net.pe/v2/sunat/ruc',
        sunat_api_token: settings.sunat_api_token || '',
        sunat_api_ruc: settings.sunat_api_ruc || '',
        sunat_api_username: settings.sunat_api_username || '',
        sunat_api_password: settings.sunat_api_password || '',
        sunat_api_enabled: settings.sunat_api_enabled || false,
        sunat_production_mode: settings.sunat_production_mode || false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        router.put('/settings/system/apis', formData, {
            onSuccess: () => {
                showSuccess('¡Actualizado!', 'Configuración de APIs actualizada exitosamente.');
            },
            onError: (errors) => {
                setErrors(errors);
                showError('Error al actualizar', 'Por favor, revisa los campos y vuelve a intentar.');
                setLoading(false);
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de APIs" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Cloud className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">APIs Externas</h1>
                        <p className="text-muted-foreground">
                            Configura las integraciones con servicios externos (RENIEC, SUNAT)
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* RENIEC API */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        RENIEC - Consulta de DNI
                                        {formData.reniec_api_enabled ? (
                                            <Badge variant="default" className="bg-green-600">
                                                <Check className="h-3 w-3 mr-1" />
                                                Activo
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                <X className="h-3 w-3 mr-1" />
                                                Inactivo
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        Permite la consulta automática de datos de personas por DNI
                                    </CardDescription>
                                </div>
                                <Switch
                                    checked={formData.reniec_api_enabled}
                                    onCheckedChange={(checked) => handleChange('reniec_api_enabled', checked)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div className="text-sm text-blue-800 dark:text-blue-200">
                                        <p className="font-semibold mb-1">Proveedor Recomendado:</p>
                                        <p>Para obtener un token de API, visita: <a href="https://apis.net.pe" target="_blank" rel="noopener noreferrer" className="underline">apis.net.pe</a></p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reniec_api_url">URL de la API</Label>
                                <Input
                                    id="reniec_api_url"
                                    type="url"
                                    value={formData.reniec_api_url}
                                    onChange={(e) => handleChange('reniec_api_url', e.target.value)}
                                    placeholder="https://api.apis.net.pe/v2/reniec/dni"
                                    className={errors.reniec_api_url ? 'border-destructive' : ''}
                                />
                                {errors.reniec_api_url && (
                                    <p className="text-sm text-destructive">{errors.reniec_api_url}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reniec_api_token">Token de Acceso</Label>
                                <Input
                                    id="reniec_api_token"
                                    type="password"
                                    value={formData.reniec_api_token}
                                    onChange={(e) => handleChange('reniec_api_token', e.target.value)}
                                    placeholder="Tu token de API"
                                    className={errors.reniec_api_token ? 'border-destructive' : ''}
                                />
                                {errors.reniec_api_token && (
                                    <p className="text-sm text-destructive">{errors.reniec_api_token}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Este token se mantendrá encriptado en la base de datos
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SUNAT API */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        SUNAT - Consulta de RUC
                                        {formData.sunat_api_enabled ? (
                                            <Badge variant="default" className="bg-green-600">
                                                <Check className="h-3 w-3 mr-1" />
                                                Activo
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                <X className="h-3 w-3 mr-1" />
                                                Inactivo
                                            </Badge>
                                        )}
                                        {formData.sunat_production_mode && formData.sunat_api_enabled && (
                                            <Badge variant="destructive">Producción</Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        Permite la consulta de datos de empresas por RUC y facturación electrónica
                                    </CardDescription>
                                </div>
                                <Switch
                                    checked={formData.sunat_api_enabled}
                                    onCheckedChange={(checked) => handleChange('sunat_api_enabled', checked)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div className="text-sm text-blue-800 dark:text-blue-200">
                                        <p className="font-semibold mb-1">Proveedores Recomendados:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li><a href="https://apis.net.pe" target="_blank" rel="noopener noreferrer" className="underline">apis.net.pe</a> - Consulta de RUC</li>
                                            <li><a href="https://nubefact.com" target="_blank" rel="noopener noreferrer" className="underline">nubefact.com</a> - Facturación Electrónica</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sunat_api_url">URL de la API</Label>
                                    <Input
                                        id="sunat_api_url"
                                        type="url"
                                        value={formData.sunat_api_url}
                                        onChange={(e) => handleChange('sunat_api_url', e.target.value)}
                                        placeholder="https://api.apis.net.pe/v2/sunat/ruc"
                                        className={errors.sunat_api_url ? 'border-destructive' : ''}
                                    />
                                    {errors.sunat_api_url && (
                                        <p className="text-sm text-destructive">{errors.sunat_api_url}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sunat_api_token">Token de Acceso</Label>
                                    <Input
                                        id="sunat_api_token"
                                        type="password"
                                        value={formData.sunat_api_token}
                                        onChange={(e) => handleChange('sunat_api_token', e.target.value)}
                                        placeholder="Tu token de API"
                                        className={errors.sunat_api_token ? 'border-destructive' : ''}
                                    />
                                    {errors.sunat_api_token && (
                                        <p className="text-sm text-destructive">{errors.sunat_api_token}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sunat_api_ruc">RUC de la Empresa</Label>
                                    <Input
                                        id="sunat_api_ruc"
                                        type="text"
                                        value={formData.sunat_api_ruc}
                                        onChange={(e) => handleChange('sunat_api_ruc', e.target.value)}
                                        placeholder="20123456789"
                                        maxLength={11}
                                        className={errors.sunat_api_ruc ? 'border-destructive' : ''}
                                    />
                                    {errors.sunat_api_ruc && (
                                        <p className="text-sm text-destructive">{errors.sunat_api_ruc}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sunat_api_username">Usuario SOL</Label>
                                    <Input
                                        id="sunat_api_username"
                                        type="text"
                                        value={formData.sunat_api_username}
                                        onChange={(e) => handleChange('sunat_api_username', e.target.value)}
                                        placeholder="Usuario SUNAT"
                                        className={errors.sunat_api_username ? 'border-destructive' : ''}
                                    />
                                    {errors.sunat_api_username && (
                                        <p className="text-sm text-destructive">{errors.sunat_api_username}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sunat_api_password">Contraseña SOL</Label>
                                <Input
                                    id="sunat_api_password"
                                    type="password"
                                    value={formData.sunat_api_password}
                                    onChange={(e) => handleChange('sunat_api_password', e.target.value)}
                                    placeholder="Contraseña SUNAT"
                                    className={errors.sunat_api_password ? 'border-destructive' : ''}
                                />
                                {errors.sunat_api_password && (
                                    <p className="text-sm text-destructive">{errors.sunat_api_password}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg bg-amber-50 dark:bg-amber-950">
                                <div className="flex-1">
                                    <Label htmlFor="sunat_production_mode" className="font-semibold">
                                        Modo Producción
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Activa solo cuando tengas credenciales de producción válidas
                                    </p>
                                </div>
                                <Switch
                                    id="sunat_production_mode"
                                    checked={formData.sunat_production_mode}
                                    onCheckedChange={(checked) => handleChange('sunat_production_mode', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botón de guardar */}
                    <div className="flex justify-end">
                        <Button type="submit" size="lg" disabled={loading}>
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
