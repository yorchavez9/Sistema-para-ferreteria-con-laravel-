import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Proveedores', href: '/suppliers' },
    { title: 'Crear', href: '/suppliers/create' },
];

export default function CreateSupplier() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        document_type: 'none',
        document_number: '',
        address: '',
        phone: '',
        email: '',
        contact_person: '',
        contact_phone: '',
        website: '',
        notes: '',
        payment_terms: 'contado',
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/suppliers');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Proveedor" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Crear Proveedor</h1>
                        <p className="text-muted-foreground">
                            Ingresa la información del nuevo proveedor
                        </p>
                    </div>
                    <Link href="/suppliers">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-4">Información General</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nombre <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ej: Distribuidora ABC"
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code">
                                    Código <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    placeholder="Ej: PROV-001"
                                />
                                {errors.code && (
                                    <p className="text-sm text-destructive">{errors.code}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="document_type">Tipo de Documento</Label>
                                <Select
                                    value={data.document_type}
                                    onValueChange={(value) => setData('document_type', value === 'none' ? '' : value)}
                                >
                                    <SelectTrigger id="document_type">
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Sin especificar</SelectItem>
                                        <SelectItem value="RUC">RUC</SelectItem>
                                        <SelectItem value="DNI">DNI</SelectItem>
                                        <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.document_type && (
                                    <p className="text-sm text-destructive">{errors.document_type}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="document_number">Número de Documento</Label>
                                <Input
                                    id="document_number"
                                    value={data.document_number}
                                    onChange={(e) => setData('document_number', e.target.value)}
                                    placeholder="Ej: 900123456-7"
                                />
                                {errors.document_number && (
                                    <p className="text-sm text-destructive">{errors.document_number}</p>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Ej: Calle 123 #45-67"
                                />
                                {errors.address && (
                                    <p className="text-sm text-destructive">{errors.address}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="Ej: +57 300 123 4567"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-destructive">{errors.phone}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Ej: contacto@proveedor.com"
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact_person">Persona de Contacto</Label>
                                <Input
                                    id="contact_person"
                                    value={data.contact_person}
                                    onChange={(e) => setData('contact_person', e.target.value)}
                                    placeholder="Ej: Juan Pérez"
                                />
                                {errors.contact_person && (
                                    <p className="text-sm text-destructive">{errors.contact_person}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
                                <Input
                                    id="contact_phone"
                                    value={data.contact_phone}
                                    onChange={(e) => setData('contact_phone', e.target.value)}
                                    placeholder="Ej: +57 300 987 6543"
                                />
                                {errors.contact_phone && (
                                    <p className="text-sm text-destructive">{errors.contact_phone}</p>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="website">Sitio Web</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    placeholder="Ej: https://www.proveedor.com"
                                />
                                {errors.website && (
                                    <p className="text-sm text-destructive">{errors.website}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-4">Información Comercial</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="payment_terms">
                                    Términos de Pago <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.payment_terms}
                                    onValueChange={(value) => setData('payment_terms', value)}
                                >
                                    <SelectTrigger id="payment_terms">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="contado">Contado</SelectItem>
                                        <SelectItem value="credito_15">Crédito 15 días</SelectItem>
                                        <SelectItem value="credito_30">Crédito 30 días</SelectItem>
                                        <SelectItem value="credito_45">Crédito 45 días</SelectItem>
                                        <SelectItem value="credito_60">Crédito 60 días</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.payment_terms && (
                                    <p className="text-sm text-destructive">{errors.payment_terms}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Información adicional sobre el proveedor..."
                                    rows={4}
                                />
                                {errors.notes && (
                                    <p className="text-sm text-destructive">{errors.notes}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                                <Label htmlFor="is_active">Proveedor Activo</Label>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Link href="/suppliers">
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}