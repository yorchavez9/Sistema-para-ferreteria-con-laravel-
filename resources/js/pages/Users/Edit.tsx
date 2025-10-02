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

interface User {
    id: number;
    name: string;
    email: string;
    branch_id: number | null;
    is_active: boolean;
}

interface Role {
    id: number;
    name: string;
}

interface Branch {
    id: number;
    name: string;
}

interface UsersEditProps {
    user: User;
    roles: Role[];
    branches: Branch[];
    userRoles: number[];
}

export default function UsersEdit({ user, roles, branches, userRoles }: UsersEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Usuarios', href: '/users' },
        { title: 'Editar Usuario', href: `/users/${user.id}/edit` },
    ];

    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        branch_id: user.branch_id?.toString() || '',
        roles: userRoles,
        is_active: user.is_active ?? true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        router.put(`/users/${user.id}`, formData, {
            onSuccess: () => {
                showSuccess('¡Usuario actualizado!', 'El usuario ha sido actualizado exitosamente.');
            },
            onError: (errors) => {
                setErrors(errors);
                showError('Error al actualizar usuario', 'Por favor, revisa los campos y vuelve a intentar.');
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
            <Head title={`Editar Usuario: ${user.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/users">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Editar Usuario</h1>
                        <p className="text-muted-foreground">
                            Actualiza la información del usuario
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

                            {/* Contraseñas (opcional) */}
                            <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Cambiar contraseña:</strong> Deja estos campos vacíos si no deseas cambiar la contraseña.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Nueva Contraseña</Label>
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
                                        <Label htmlFor="password_confirmation">Confirmar Nueva Contraseña</Label>
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
                            </div>

                            {/* Sucursal y Estado */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="branch_id">Sucursal</Label>
                                    <Select
                                        value={formData.branch_id || "0"}
                                        onValueChange={(value) => handleChange('branch_id', value === "0" ? "" : value)}
                                    >
                                        <SelectTrigger className={errors.branch_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Selecciona una sucursal (opcional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Sin sucursal</SelectItem>
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
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
