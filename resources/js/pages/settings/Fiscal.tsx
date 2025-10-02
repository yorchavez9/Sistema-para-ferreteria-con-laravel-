import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DollarSign, Save, Percent } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';

interface Setting {
    id: number;
    igv_percentage: number;
    currency: string;
    currency_symbol: string;
}

interface FiscalProps {
    settings: Setting;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Configuración del Sistema', href: '/settings/system/fiscal' },
    { title: 'Configuración Fiscal', href: '/settings/system/fiscal' },
];

const currencies = [
    { code: 'PEN', name: 'Sol Peruano', symbol: 'S/' },
    { code: 'USD', name: 'Dólar Americano', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
];

export default function Fiscal({ settings }: FiscalProps) {
    const [formData, setFormData] = useState({
        igv_percentage: settings.igv_percentage?.toString() || '18.00',
        currency: settings.currency || 'PEN',
        currency_symbol: settings.currency_symbol || 'S/',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        router.put('/settings/system/fiscal', formData, {
            onSuccess: () => {
                showSuccess('¡Actualizado!', 'Configuración fiscal actualizada exitosamente.');
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

    const handleCurrencyChange = (currencyCode: string) => {
        const currency = currencies.find(c => c.code === currencyCode);
        if (currency) {
            setFormData(prev => ({
                ...prev,
                currency: currency.code,
                currency_symbol: currency.symbol,
            }));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración Fiscal" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <DollarSign className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Configuración Fiscal</h1>
                        <p className="text-muted-foreground">
                            Configura los aspectos fiscales y de moneda
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración de Impuestos y Moneda</CardTitle>
                            <CardDescription>
                                Define el IGV y la moneda principal del sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* IGV */}
                            <div className="space-y-2">
                                <Label htmlFor="igv_percentage">
                                    Porcentaje de IGV <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="igv_percentage"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={formData.igv_percentage}
                                        onChange={(e) => handleChange('igv_percentage', e.target.value)}
                                        placeholder="18.00"
                                        className={`pr-10 ${errors.igv_percentage ? 'border-destructive' : ''}`}
                                    />
                                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                                {errors.igv_percentage && (
                                    <p className="text-sm text-destructive">{errors.igv_percentage}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    En Perú, el IGV estándar es 18%
                                </p>
                            </div>

                            {/* Moneda */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="currency">
                                        Moneda Principal <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={formData.currency}
                                        onValueChange={handleCurrencyChange}
                                    >
                                        <SelectTrigger className={errors.currency ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Selecciona una moneda" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map((currency) => (
                                                <SelectItem key={currency.code} value={currency.code}>
                                                    {currency.symbol} - {currency.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.currency && (
                                        <p className="text-sm text-destructive">{errors.currency}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currency_symbol">
                                        Símbolo de Moneda <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="currency_symbol"
                                        type="text"
                                        value={formData.currency_symbol}
                                        onChange={(e) => handleChange('currency_symbol', e.target.value)}
                                        placeholder="S/"
                                        maxLength={5}
                                        className={errors.currency_symbol ? 'border-destructive' : ''}
                                    />
                                    {errors.currency_symbol && (
                                        <p className="text-sm text-destructive">{errors.currency_symbol}</p>
                                    )}
                                </div>
                            </div>

                            {/* Vista previa */}
                            <div className="bg-muted p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Vista Previa:</h4>
                                <div className="space-y-1 text-sm">
                                    <p>Precio sin IGV: {formData.currency_symbol} 100.00</p>
                                    <p>IGV ({formData.igv_percentage}%): {formData.currency_symbol} {(100 * parseFloat(formData.igv_percentage || '0') / 100).toFixed(2)}</p>
                                    <p className="font-semibold text-base">Precio final: {formData.currency_symbol} {(100 + (100 * parseFloat(formData.igv_percentage || '0') / 100)).toFixed(2)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
