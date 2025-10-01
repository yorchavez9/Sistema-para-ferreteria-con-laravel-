import { FormEventHandler, useState } from 'react';
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
import { ArrowLeft, Save, User, Mail, Phone, Calendar, CreditCard, FileText, Search, Loader2 } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';
import axios from 'axios';

interface Customer {
    id: number;
    name: string;
    code: string;
    document_type: string | null;
    document_number: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    birth_date: string | null;
    customer_type: string;
    payment_terms: string;
    credit_limit: number | null;
    notes: string | null;
    is_active: boolean;
}

interface EditCustomerProps {
    customer: Customer;
}

export default function EditCustomer({ customer }: EditCustomerProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Clientes', href: '/customers' },
        { title: customer.name, href: `/customers/${customer.id}` },
        { title: 'Editar', href: `/customers/${customer.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: customer.name || '',
        code: customer.code || '',
        document_type: customer.document_type ?? 'none',
        document_number: customer.document_number || '',
        address: customer.address || '',
        phone: customer.phone || '',
        email: customer.email || '',
        birth_date: customer.birth_date || '',
        customer_type: customer.customer_type || 'personal',
        payment_terms: customer.payment_terms || 'contado',
        credit_limit: customer.credit_limit?.toString() || '',
        notes: customer.notes || '',
        is_active: customer.is_active,
    });

    const [searching, setSearching] = useState(false);

    const handleSearchDocument = async () => {
        const docNumber = data.document_number.trim();

        if (!docNumber) {
            showError('Error', 'Ingresa un número de documento');
            return;
        }

        if (docNumber.length !== 8 && docNumber.length !== 11) {
            showError('Error', 'El documento debe tener 8 dígitos (DNI) o 11 dígitos (RUC)');
            return;
        }

        if (!/^\d+$/.test(docNumber)) {
            showError('Error', 'El documento debe contener solo números');
            return;
        }

        setSearching(true);
        try {
            const response = await axios.post('/customers/consultar-documento', {
                document_number: docNumber
            });

            if (response.data.success) {
                if (response.data.found_in_db) {
                    // Cliente existe, actualizar con datos de la BD
                    const customer = response.data.customer;
                    setData({
                        ...data,
                        name: customer.name || data.name,
                        document_type: customer.document_type || (docNumber.length === 8 ? 'DNI' : 'RUC'),
                        document_number: docNumber,
                        address: customer.address || data.address,
                    });
                    showSuccess('¡Datos encontrados!', 'Se actualizaron los datos desde la base de datos');
                } else {
                    // Actualizar con datos de la API
                    const apiData = response.data.api_data;
                    setData({
                        ...data,
                        name: apiData.name || data.name,
                        document_type: apiData.document_type || (docNumber.length === 8 ? 'DNI' : 'RUC'),
                        document_number: docNumber,
                        address: apiData.direccion || data.address,
                        customer_type: docNumber.length === 11 ? 'empresa' : 'personal',
                    });
                    showSuccess('¡Datos encontrados!', 'Se actualizaron los datos del cliente');
                }
            }
        } catch (error: any) {
            showError('Error', error.response?.data?.message || 'No se pudo consultar el documento');
        } finally {
            setSearching(false);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/customers/${customer.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${customer.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Editar Cliente</h1>
                        <p className="text-muted-foreground">
                            Actualiza la información del cliente
                        </p>
                    </div>
                    <Link href="/customers">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Información General
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nombre <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ej: Juan Pérez"
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
                                    placeholder="Ej: CLI-001"
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
                                <div className="flex gap-2">
                                    <Input
                                        id="document_number"
                                        value={data.document_number}
                                        onChange={(e) => setData('document_number', e.target.value)}
                                        placeholder="DNI (8 dígitos) o RUC (11 dígitos)"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSearchDocument();
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleSearchDocument}
                                        disabled={searching}
                                    >
                                        {searching ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </>
                                        ) : (
                                            <>
                                                <Search className="h-4 w-4 mr-2" />
                                                Buscar
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Busca en RENIEC (DNI) o SUNAT (RUC) para autocompletar
                                </p>
                                {errors.document_number && (
                                    <p className="text-sm text-destructive">{errors.document_number}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customer_type">
                                    Tipo de Cliente <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.customer_type}
                                    onValueChange={(value) => setData('customer_type', value)}
                                >
                                    <SelectTrigger id="customer_type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="personal">Personal</SelectItem>
                                        <SelectItem value="empresa">Empresa</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.customer_type && (
                                    <p className="text-sm text-destructive">{errors.customer_type}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="birth_date" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Fecha de Nacimiento
                                </Label>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    value={data.birth_date}
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                />
                                {errors.birth_date && (
                                    <p className="text-sm text-destructive">{errors.birth_date}</p>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Ej: Av. Principal 123"
                                />
                                {errors.address && (
                                    <p className="text-sm text-destructive">{errors.address}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Phone className="h-5 w-5" />
                            Información de Contacto
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Teléfono
                                </Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="Ej: +51 987 654 321"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-destructive">{errors.phone}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Ej: cliente@example.com"
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Información Comercial
                        </h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <Label htmlFor="credit_limit">Límite de Crédito</Label>
                                    <Input
                                        id="credit_limit"
                                        type="number"
                                        step="0.01"
                                        value={data.credit_limit}
                                        onChange={(e) => setData('credit_limit', e.target.value)}
                                        placeholder="Ej: 5000.00"
                                    />
                                    {errors.credit_limit && (
                                        <p className="text-sm text-destructive">{errors.credit_limit}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Notas
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Información adicional sobre el cliente..."
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
                                <Label htmlFor="is_active">Cliente Activo</Label>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Link href="/customers">
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Actualizar
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}