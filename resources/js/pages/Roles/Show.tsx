import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Shield, Users, Lock } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
    users_count: number;
    created_at: string;
    updated_at: string;
}

interface Permission {
    id: number;
    name: string;
}

interface RolesShowProps {
    role: Role;
    rolePermissions: Record<string, Permission[]>;
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

export default function RolesShow({ role, rolePermissions }: RolesShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Roles y Permisos', href: '/roles' },
        { title: role.name, href: `/roles/${role.id}` },
    ];

    const formatDate = (date: string) => {
        return new Intl.DateTimeFormat('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date));
    };

    const getPermissionLabel = (permissionName: string) => {
        const parts = permissionName.split('-');
        const action = parts[parts.length - 1];
        return actionNames[action] || action;
    };

    const totalPermissions = Object.values(rolePermissions).reduce(
        (total, permissions) => total + permissions.length,
        0
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rol: ${role.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/roles">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <Shield className="h-8 w-8 text-primary" />
                                <h1 className="text-3xl font-bold">{role.name}</h1>
                            </div>
                            <p className="text-muted-foreground mt-1">
                                Detalles del rol y sus permisos
                            </p>
                        </div>
                    </div>
                    <Link href={`/roles/${role.id}/edit`}>
                        <Button>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar Rol
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Información básica */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Información del Rol</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">
                                    Nombre del Rol
                                </label>
                                <p className="text-base font-semibold">{role.name}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Usuarios Asignados
                                </label>
                                <Badge variant="secondary" className="text-base">
                                    {role.users_count} usuarios
                                </Badge>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Total Permisos
                                </label>
                                <Badge variant="secondary" className="text-base">
                                    {totalPermissions} permisos
                                </Badge>
                            </div>

                            <div className="pt-4 border-t space-y-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Fecha de Creación
                                    </label>
                                    <p className="text-sm">{formatDate(role.created_at)}</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Última Actualización
                                    </label>
                                    <p className="text-sm">{formatDate(role.updated_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permisos */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Permisos Asignados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(rolePermissions).length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No hay permisos asignados a este rol
                                </p>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(rolePermissions).map(([module, permissions]) => (
                                        <div key={module} className="border rounded-lg p-4">
                                            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-primary" />
                                                {moduleNames[module] || module.charAt(0).toUpperCase() + module.slice(1)}
                                                <Badge variant="secondary" className="ml-2">
                                                    {permissions.length} permisos
                                                </Badge>
                                            </h3>

                                            <div className="flex flex-wrap gap-2">
                                                {permissions.map((permission) => (
                                                    <Badge
                                                        key={permission.id}
                                                        variant="outline"
                                                        className="px-3 py-1"
                                                    >
                                                        {getPermissionLabel(permission.name)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
