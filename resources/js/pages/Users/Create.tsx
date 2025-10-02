import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';

interface Role {
    id: number;
    name: string;
}

interface Branch {
    id: number;
    name: string;
}

interface UsersCreateProps {
    roles: Role[];
    branches: Branch[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Usuarios', href: '/users' },
    { title: 'Crear Usuario', href: '/users/create' },
];

export default function UsersCreate({ roles, branches }: UsersCreateProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        branch_id: '',
        roles: [] as number[],
        is_active: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        router.post('/users', formData, {
            onSuccess: () => {
                showSuccess('¡Usuario creado!', 'El usuario ha sido creado exitosamente.');
            },
            onError: (errors) => {
                setErrors(errors);
                showError('Error al crear usuario', 'Por favor, revisa los campos y vuelve a intentar.');
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

    const handleRoleToggle = (roleId: number) => {
        setFormData(prev => ({
            ...prev,
            roles: prev.roles.includes(roleId)
                ? prev.roles.filter(id => id !== roleId)
                : [...prev.roles, roleId]
        }));
        if (errors.roles) {
            setErrors(prev => ({ ...prev, roles: '' }));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Usuario" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/users">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Crear Usuario</h1>
                        <p className="text-muted-foreground">
                            Completa el formulario para crear un nuevo usuario
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Usuario</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Información básica */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Nombre Completo <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="Ej: Juan Pérez García"
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="usuario@ejemplo.com"
                                        className={errors.email ? 'border-destructive' : ''}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            {/* Contraseñas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Contraseña <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        placeholder="Mínimo 8 caracteres"
                                        className={errors.password ? 'border-destructive' : ''}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-destructive">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirmar Contraseña <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={formData.password_confirmation}
                                        onChange={(e) => handleChange('password_confirmation', e.target.value)}
                                        placeholder="Repite la contraseña"
                                        className={errors.password_confirmation ? 'border-destructive' : ''}
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>

                            {/* Sucursal y Estado */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="branch_id">Sucursal</Label>
                                    <Select
                                        value={formData.branch_id}
                                        onValueChange={(value) => handleChange('branch_id', value)}
                                    >
                                        <SelectTrigger className={errors.branch_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Selecciona una sucursal (opcional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.branch_id && (
                                        <p className="text-sm text-destructive">{errors.branch_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="is_active">Estado del Usuario</Label>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Switch
                                            id="is_active"
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                        />
                                        <Label htmlFor="is_active" className="font-normal cursor-pointer">
                                            {formData.is_active ? (
                                                <span className="text-green-600 font-medium">Activo</span>
                                            ) : (
                                                <span className="text-red-600 font-medium">Inactivo</span>
                                            )}
                                        </Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {formData.is_active
                                            ? 'El usuario puede iniciar sesión en el sistema'
                                            : 'El usuario no podrá iniciar sesión'
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Roles */}
                            <div className="space-y-2">
                                <Label>
                                    Roles <span className="text-destructive">*</span>
                                </Label>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Selecciona al menos un rol para el usuario
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                                    {roles.map((role) => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={formData.roles.includes(role.id)}
                                                onCheckedChange={() => handleRoleToggle(role.id)}
                                            />
                                            <label
                                                htmlFor={`role-${role.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {role.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {errors.roles && (
                                    <p className="text-sm text-destructive">{errors.roles}</p>
                                )}
                            </div>

                            {/* Botones */}
                            <div className="flex justify-end gap-4 pt-4">
                                <Link href="/users">
                                    <Button type="button" variant="outline">
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Creando...' : 'Crear Usuario'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
