import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Shield } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { showSuccess, showError } from '@/lib/sweet-alert';

interface Role {
    id: number;
    name: string;
}

interface Permission {
    id: number;
    name: string;
}

interface RolesEditProps {
    role: Role;
    permissions: Record<string, Permission[]>;
    rolePermissions: number[];
}

// Mapeo de módulos a nombres en español
const moduleNames: Record<string, string> = {
    'role': 'Roles',
    'user': 'Usuarios',
    'product': 'Productos',
    'category': 'Categorías',
    'brand': 'Marcas',
    'branch': 'Sucursales',
    'inventory': 'Inventario',
    'supplier': 'Proveedores',
    'customer': 'Clientes',
    'purchase': 'Órdenes de Compra',
    'sale': 'Ventas',
    'payment': 'Pagos',
    'quote': 'Cotizaciones',
    'report': 'Reportes',
    'settings': 'Configuración',
};

// Mapeo de acciones a nombres en español
const actionNames: Record<string, string> = {
    'list': 'Listar',
    'create': 'Crear',
    'edit': 'Editar',
    'delete': 'Eliminar',
    'view': 'Ver',
    'sales': 'Ventas',
    'inventory': 'Inventario',
    'purchases': 'Compras',
    'financial': 'Financiero',
};

export default function RolesEdit({ role, permissions, rolePermissions }: RolesEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Roles y Permisos', href: '/roles' },
        { title: 'Editar Rol', href: `/roles/${role.id}/edit` },
    ];

    const [formData, setFormData] = useState({
        name: role.name,
        permissions: rolePermissions,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        router.put(`/roles/${role.id}`, formData, {
            onSuccess: () => {
                showSuccess('¡Rol actualizado!', 'El rol ha sido actualizado exitosamente.');
            },
            onError: (errors) => {
                setErrors(errors);
                showError('Error al actualizar rol', 'Por favor, revisa los campos y vuelve a intentar.');
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

    const handlePermissionToggle = (permissionId: number) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(id => id !== permissionId)
                : [...prev.permissions, permissionId]
        }));
        if (errors.permissions) {
            setErrors(prev => ({ ...prev, permissions: '' }));
        }
    };

    const handleModuleToggle = (modulePermissions: Permission[]) => {
        const modulePermissionIds = modulePermissions.map(p => p.id);
        const allSelected = modulePermissionIds.every(id => formData.permissions.includes(id));

        setFormData(prev => ({
            ...prev,
            permissions: allSelected
                ? prev.permissions.filter(id => !modulePermissionIds.includes(id))
                : [...new Set([...prev.permissions, ...modulePermissionIds])]
        }));
    };

    const isModuleSelected = (modulePermissions: Permission[]) => {
        return modulePermissions.every(p => formData.permissions.includes(p.id));
    };

    const getPermissionLabel = (permissionName: string) => {
        const parts = permissionName.split('-');
        const action = parts[parts.length - 1];
        return actionNames[action] || action;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Rol: ${role.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/roles">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Editar Rol</h1>
                        <p className="text-muted-foreground">
                            Actualiza el rol y sus permisos
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Información básica */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Rol</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Nombre del Rol <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="Ej: Supervisor de Ventas"
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Permisos */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Permisos del Rol <span className="text-destructive">*</span>
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Selecciona los permisos que tendrá este rol
                                </p>
                            </CardHeader>
                            <CardContent>
                                {errors.permissions && (
                                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-lg">
                                        <p className="text-sm text-destructive">{errors.permissions}</p>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {Object.entries(permissions).map(([module, modulePermissions]) => (
                                        <div key={module} className="border rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-3">
                                                <Checkbox
                                                    id={`module-${module}`}
                                                    checked={isModuleSelected(modulePermissions)}
                                                    onCheckedChange={() => handleModuleToggle(modulePermissions)}
                                                />
                                                <label
                                                    htmlFor={`module-${module}`}
                                                    className="text-base font-semibold cursor-pointer"
                                                >
                                                    {moduleNames[module] || module.charAt(0).toUpperCase() + module.slice(1)}
                                                </label>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-6">
                                                {modulePermissions.map((permission) => (
                                                    <div key={permission.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`permission-${permission.id}`}
                                                            checked={formData.permissions.includes(permission.id)}
                                                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                                                        />
                                                        <label
                                                            htmlFor={`permission-${permission.id}`}
                                                            className="text-sm cursor-pointer"
                                                        >
                                                            {getPermissionLabel(permission.name)}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 p-3 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Permisos seleccionados:</strong> {formData.permissions.length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Botones */}
                        <div className="flex justify-end gap-4">
                            <Link href="/roles">
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
