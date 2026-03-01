import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Palette, Save, RotateCcw, Sun, Moon, Check } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';

interface Setting {
    id: number;
    primary_color_light: string;
    primary_color_dark: string;
}

interface ThemeProps {
    settings: Setting;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Configuración del Sistema', href: '/settings/system/company' },
    { title: 'Personalización', href: '/settings/system/theme' },
];

const DEFAULT_LIGHT = '#4f46e5';
const DEFAULT_DARK = '#6366f1';

const presetColors = [
    { name: 'Índigo', light: '#4f46e5', dark: '#6366f1' },
    { name: 'Azul', light: '#2563eb', dark: '#3b82f6' },
    { name: 'Violeta', light: '#7c3aed', dark: '#8b5cf6' },
    { name: 'Rosa', light: '#db2777', dark: '#ec4899' },
    { name: 'Rojo', light: '#dc2626', dark: '#ef4444' },
    { name: 'Naranja', light: '#ea580c', dark: '#f97316' },
    { name: 'Ámbar', light: '#d97706', dark: '#f59e0b' },
    { name: 'Verde', light: '#16a34a', dark: '#22c55e' },
    { name: 'Esmeralda', light: '#059669', dark: '#10b981' },
    { name: 'Teal', light: '#0d9488', dark: '#14b8a6' },
    { name: 'Cyan', light: '#0891b2', dark: '#06b6d4' },
    { name: 'Slate', light: '#475569', dark: '#64748b' },
];

function isLightColor(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
}

export default function Theme({ settings }: ThemeProps) {
    const [formData, setFormData] = useState({
        primary_color_light: settings.primary_color_light || DEFAULT_LIGHT,
        primary_color_dark: settings.primary_color_dark || DEFAULT_DARK,
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.put('/settings/system/theme', formData, {
            onSuccess: () => {
                showSuccess('¡Actualizado!', 'Colores del tema actualizados exitosamente.');
            },
            onError: () => {
                showError('Error al actualizar', 'Por favor, revisa los colores e intenta de nuevo.');
                setLoading(false);
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    const handleReset = () => {
        setFormData({
            primary_color_light: DEFAULT_LIGHT,
            primary_color_dark: DEFAULT_DARK,
        });
    };

    const applyPreset = (preset: typeof presetColors[0]) => {
        setFormData({
            primary_color_light: preset.light,
            primary_color_dark: preset.dark,
        });
    };

    const fgLight = isLightColor(formData.primary_color_light) ? '#000000' : '#ffffff';
    const fgDark = isLightColor(formData.primary_color_dark) ? '#000000' : '#ffffff';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Personalización del Tema" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Palette className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Personalización</h1>
                        <p className="text-muted-foreground">
                            Configura el color primario del sistema para modo claro y oscuro
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Color Pickers */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Colores Predefinidos */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Colores Predefinidos</CardTitle>
                                    <CardDescription>
                                        Selecciona un esquema de color predefinido
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                        {presetColors.map((preset) => {
                                            const isActive =
                                                formData.primary_color_light === preset.light &&
                                                formData.primary_color_dark === preset.dark;
                                            return (
                                                <button
                                                    key={preset.name}
                                                    type="button"
                                                    onClick={() => applyPreset(preset)}
                                                    className={`group relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:scale-105 ${
                                                        isActive
                                                            ? 'border-foreground shadow-md'
                                                            : 'border-transparent hover:border-muted-foreground/30'
                                                    }`}
                                                >
                                                    <div className="flex gap-1">
                                                        <div
                                                            className="h-8 w-8 rounded-l-md"
                                                            style={{ backgroundColor: preset.light }}
                                                        />
                                                        <div
                                                            className="h-8 w-8 rounded-r-md"
                                                            style={{ backgroundColor: preset.dark }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium">{preset.name}</span>
                                                    {isActive && (
                                                        <Check className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-foreground text-background p-0.5" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Color Personalizado */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Color Personalizado</CardTitle>
                                    <CardDescription>
                                        Elige colores específicos para cada modo
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Modo Claro */}
                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2">
                                                <Sun className="h-4 w-4" />
                                                Modo Claro
                                            </Label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={formData.primary_color_light}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            primary_color_light: e.target.value,
                                                        }))
                                                    }
                                                    className="h-12 w-16 cursor-pointer rounded-md border border-input p-1"
                                                />
                                                <Input
                                                    type="text"
                                                    value={formData.primary_color_light}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                primary_color_light: val,
                                                            }));
                                                        }
                                                    }}
                                                    placeholder="#4f46e5"
                                                    maxLength={7}
                                                    className="font-mono"
                                                />
                                            </div>
                                        </div>

                                        {/* Modo Oscuro */}
                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2">
                                                <Moon className="h-4 w-4" />
                                                Modo Oscuro
                                            </Label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={formData.primary_color_dark}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            primary_color_dark: e.target.value,
                                                        }))
                                                    }
                                                    className="h-12 w-16 cursor-pointer rounded-md border border-input p-1"
                                                />
                                                <Input
                                                    type="text"
                                                    value={formData.primary_color_dark}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                primary_color_dark: val,
                                                            }));
                                                        }
                                                    }}
                                                    placeholder="#6366f1"
                                                    maxLength={7}
                                                    className="font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Vista Previa */}
                        <div className="space-y-6">
                            {/* Preview Modo Claro */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Sun className="h-4 w-4" />
                                        Vista Previa - Claro
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="rounded-lg bg-white border p-4 space-y-3">
                                        <button
                                            type="button"
                                            className="w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
                                            style={{
                                                backgroundColor: formData.primary_color_light,
                                                color: fgLight,
                                            }}
                                        >
                                            Botón Primario
                                        </button>
                                        <button
                                            type="button"
                                            className="w-full rounded-md border px-4 py-2 text-sm font-medium"
                                            style={{
                                                borderColor: formData.primary_color_light,
                                                color: formData.primary_color_light,
                                            }}
                                        >
                                            Botón Outline
                                        </button>
                                        <div className="flex gap-2 flex-wrap">
                                            <span
                                                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                                                style={{
                                                    backgroundColor: formData.primary_color_light + '20',
                                                    color: formData.primary_color_light,
                                                }}
                                            >
                                                Badge 1
                                            </span>
                                            <span
                                                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                                                style={{
                                                    backgroundColor: formData.primary_color_light,
                                                    color: fgLight,
                                                }}
                                            >
                                                Badge 2
                                            </span>
                                        </div>
                                        <div
                                            className="h-1 w-full rounded-full"
                                            style={{ backgroundColor: formData.primary_color_light }}
                                        />
                                        <p className="text-xs" style={{ color: formData.primary_color_light }}>
                                            Texto con color primario
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Preview Modo Oscuro */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Moon className="h-4 w-4" />
                                        Vista Previa - Oscuro
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="rounded-lg bg-zinc-900 border border-zinc-700 p-4 space-y-3">
                                        <button
                                            type="button"
                                            className="w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
                                            style={{
                                                backgroundColor: formData.primary_color_dark,
                                                color: fgDark,
                                            }}
                                        >
                                            Botón Primario
                                        </button>
                                        <button
                                            type="button"
                                            className="w-full rounded-md border px-4 py-2 text-sm font-medium"
                                            style={{
                                                borderColor: formData.primary_color_dark,
                                                color: formData.primary_color_dark,
                                            }}
                                        >
                                            Botón Outline
                                        </button>
                                        <div className="flex gap-2 flex-wrap">
                                            <span
                                                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                                                style={{
                                                    backgroundColor: formData.primary_color_dark + '20',
                                                    color: formData.primary_color_dark,
                                                }}
                                            >
                                                Badge 1
                                            </span>
                                            <span
                                                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                                                style={{
                                                    backgroundColor: formData.primary_color_dark,
                                                    color: fgDark,
                                                }}
                                            >
                                                Badge 2
                                            </span>
                                        </div>
                                        <div
                                            className="h-1 w-full rounded-full"
                                            style={{ backgroundColor: formData.primary_color_dark }}
                                        />
                                        <p className="text-xs" style={{ color: formData.primary_color_dark }}>
                                            Texto con color primario
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-between mt-6">
                        <Button type="button" variant="outline" onClick={handleReset}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restaurar Predeterminados
                        </Button>
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
