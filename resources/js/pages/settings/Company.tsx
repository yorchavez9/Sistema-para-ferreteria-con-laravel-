import { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Upload, X, Save } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';
import Swal from 'sweetalert2';

interface Setting {
    id: number;
    company_name: string;
    company_ruc: string;
    company_address: string;
    company_phone: string;
    company_email: string;
    company_website: string;
    company_logo: string | null;
    logo_url: string | null;
}

interface CompanyProps {
    settings: Setting;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Configuración del Sistema', href: '/settings/system/company' },
    { title: 'Datos de la Empresa', href: '/settings/system/company' },
];

export default function Company({ settings }: CompanyProps) {
    const [formData, setFormData] = useState({
        company_name: settings.company_name || '',
        company_ruc: settings.company_ruc || '',
        company_address: settings.company_address || '',
        company_phone: settings.company_phone || '',
        company_email: settings.company_email || '',
        company_website: settings.company_website || '',
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo_url);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });

        if (logoFile) {
            data.append('company_logo', logoFile);
        }

        // Agregar _method para PUT request
        data.append('_method', 'PUT');

        router.post('/settings/system/company', data, {
            onSuccess: () => {
                showSuccess('¡Actualizado!', 'Configuración de empresa actualizada exitosamente.');
                setLogoFile(null);
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

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tamaño (max 2MB)
            if (file.size > 2048000) {
                showError('Archivo muy grande', 'El logo no debe superar los 2MB.');
                return;
            }

            // Validar tipo
            if (!['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
                showError('Formato no válido', 'Solo se permiten imágenes JPG, PNG o SVG.');
                return;
            }

            setLogoFile(file);

            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteLogo = () => {
        Swal.fire({
            title: '¿Eliminar logo?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete('/settings/system/company/logo', {
                    onSuccess: () => {
                        setLogoPreview(null);
                        showSuccess('¡Eliminado!', 'Logo eliminado exitosamente.');
                    },
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de Empresa" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Building2 className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Datos de la Empresa</h1>
                        <p className="text-muted-foreground">
                            Configura la información general de tu empresa
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Logo */}
                        <Card className="md:col-span-1">
                            <CardHeader>
                                <CardTitle>Logo de la Empresa</CardTitle>
                                <CardDescription>
                                    Imagen que se mostrará en documentos y reportes
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {logoPreview ? (
                                    <div className="space-y-3">
                                        <div className="relative border rounded-lg p-4 bg-muted/30 flex items-center justify-center">
                                            <img
                                                src={logoPreview}
                                                alt="Logo"
                                                className="max-h-40 w-auto object-contain"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Cambiar
                                            </Button>
                                            {settings.company_logo && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={handleDeleteLogo}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                            <p className="text-sm text-muted-foreground mb-3">
                                                No hay logo cargado
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Subir Logo
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/svg+xml"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />

                                <p className="text-xs text-muted-foreground">
                                    Formatos: JPG, PNG, SVG. Tamaño máximo: 2MB
                                </p>

                                {errors.company_logo && (
                                    <p className="text-sm text-destructive">{errors.company_logo}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Datos de la empresa */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Información General</CardTitle>
                                <CardDescription>
                                    Datos principales de tu empresa
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="company_name">
                                            Nombre de la Empresa <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="company_name"
                                            type="text"
                                            value={formData.company_name}
                                            onChange={(e) => handleChange('company_name', e.target.value)}
                                            placeholder="Ej: Ferretería El Constructor"
                                            className={errors.company_name ? 'border-destructive' : ''}
                                        />
                                        {errors.company_name && (
                                            <p className="text-sm text-destructive">{errors.company_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company_ruc">RUC</Label>
                                        <Input
                                            id="company_ruc"
                                            type="text"
                                            value={formData.company_ruc}
                                            onChange={(e) => handleChange('company_ruc', e.target.value)}
                                            placeholder="20123456789"
                                            maxLength={11}
                                            className={errors.company_ruc ? 'border-destructive' : ''}
                                        />
                                        {errors.company_ruc && (
                                            <p className="text-sm text-destructive">{errors.company_ruc}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company_address">Dirección</Label>
                                    <Textarea
                                        id="company_address"
                                        value={formData.company_address}
                                        onChange={(e) => handleChange('company_address', e.target.value)}
                                        placeholder="Av. Principal 123, Lima, Perú"
                                        rows={3}
                                        className={errors.company_address ? 'border-destructive' : ''}
                                    />
                                    {errors.company_address && (
                                        <p className="text-sm text-destructive">{errors.company_address}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="company_phone">Teléfono</Label>
                                        <Input
                                            id="company_phone"
                                            type="text"
                                            value={formData.company_phone}
                                            onChange={(e) => handleChange('company_phone', e.target.value)}
                                            placeholder="+51 987 654 321"
                                            className={errors.company_phone ? 'border-destructive' : ''}
                                        />
                                        {errors.company_phone && (
                                            <p className="text-sm text-destructive">{errors.company_phone}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company_email">Email</Label>
                                        <Input
                                            id="company_email"
                                            type="email"
                                            value={formData.company_email}
                                            onChange={(e) => handleChange('company_email', e.target.value)}
                                            placeholder="info@ferreteria.com"
                                            className={errors.company_email ? 'border-destructive' : ''}
                                        />
                                        {errors.company_email && (
                                            <p className="text-sm text-destructive">{errors.company_email}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company_website">Sitio Web</Label>
                                    <Input
                                        id="company_website"
                                        type="url"
                                        value={formData.company_website}
                                        onChange={(e) => handleChange('company_website', e.target.value)}
                                        placeholder="https://www.ferreteria.com"
                                        className={errors.company_website ? 'border-destructive' : ''}
                                    />
                                    {errors.company_website && (
                                        <p className="text-sm text-destructive">{errors.company_website}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Botón de guardar */}
                    <div className="flex justify-end mt-6">
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
