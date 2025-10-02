import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Save } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';

interface Setting {
    id: number;
    invoice_terms: string | null;
    invoice_footer: string | null;
    invoice_notes: string | null;
}

interface DocumentsProps {
    settings: Setting;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Configuración del Sistema', href: '/settings/system/documents' },
    { title: 'Configuración de Documentos', href: '/settings/system/documents' },
];

export default function Documents({ settings }: DocumentsProps) {
    const [formData, setFormData] = useState({
        invoice_terms: settings.invoice_terms || '',
        invoice_footer: settings.invoice_footer || '',
        invoice_notes: settings.invoice_notes || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        router.put('/settings/system/documents', formData, {
            onSuccess: () => {
                showSuccess('¡Actualizado!', 'Configuración de documentos actualizada exitosamente.');
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de Documentos" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Configuración de Documentos</h1>
                        <p className="text-muted-foreground">
                            Configura los textos que aparecerán en tus facturas y documentos
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Términos y Condiciones */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Términos y Condiciones</CardTitle>
                            <CardDescription>
                                Texto que aparecerá en la sección de términos y condiciones de tus documentos
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="invoice_terms">Términos y Condiciones</Label>
                                <Textarea
                                    id="invoice_terms"
                                    value={formData.invoice_terms}
                                    onChange={(e) => handleChange('invoice_terms', e.target.value)}
                                    placeholder="Escribe aquí los términos y condiciones de tu empresa..."
                                    rows={8}
                                    className={errors.invoice_terms ? 'border-destructive' : ''}
                                />
                                {errors.invoice_terms && (
                                    <p className="text-sm text-destructive">{errors.invoice_terms}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Ejemplo: Políticas de devolución, garantías, formas de pago, etc.
                                </p>
                            </div>

                            {/* Vista previa */}
                            {formData.invoice_terms && (
                                <div className="bg-muted p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2 text-sm">Vista Previa:</h4>
                                    <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                                        {formData.invoice_terms}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pie de Página */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pie de Página</CardTitle>
                            <CardDescription>
                                Texto que aparecerá al final de todos tus documentos
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="invoice_footer">Pie de Página</Label>
                                <Textarea
                                    id="invoice_footer"
                                    value={formData.invoice_footer}
                                    onChange={(e) => handleChange('invoice_footer', e.target.value)}
                                    placeholder="Gracias por su compra..."
                                    rows={4}
                                    className={errors.invoice_footer ? 'border-destructive' : ''}
                                />
                                {errors.invoice_footer && (
                                    <p className="text-sm text-destructive">{errors.invoice_footer}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Ejemplo: Mensaje de agradecimiento, datos de contacto, redes sociales
                                </p>
                            </div>

                            {/* Vista previa */}
                            {formData.invoice_footer && (
                                <div className="bg-muted p-4 rounded-lg border-t-2 border-primary">
                                    <div className="text-sm text-center text-muted-foreground">
                                        {formData.invoice_footer}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notas Adicionales */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notas Adicionales</CardTitle>
                            <CardDescription>
                                Notas que aparecerán en tus comprobantes electrónicos
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="invoice_notes">Notas Adicionales</Label>
                                <Textarea
                                    id="invoice_notes"
                                    value={formData.invoice_notes}
                                    onChange={(e) => handleChange('invoice_notes', e.target.value)}
                                    placeholder="Representación impresa de la Boleta/Factura Electrónica..."
                                    rows={4}
                                    className={errors.invoice_notes ? 'border-destructive' : ''}
                                />
                                {errors.invoice_notes && (
                                    <p className="text-sm text-destructive">{errors.invoice_notes}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Ejemplo: Referencia a comprobante electrónico, enlace para consulta en SUNAT
                                </p>
                            </div>

                            {/* Vista previa */}
                            {formData.invoice_notes && (
                                <div className="bg-muted p-4 rounded-lg border-l-4 border-blue-500">
                                    <div className="text-xs italic whitespace-pre-wrap text-muted-foreground">
                                        {formData.invoice_notes}
                                    </div>
                                </div>
                            )}
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
