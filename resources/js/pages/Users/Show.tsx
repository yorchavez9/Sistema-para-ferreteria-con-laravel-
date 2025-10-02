import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Mail, MailCheck, Building2, Shield } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    branch: {
        id: number;
        name: string;
        code: string;
        address: string;
        phone: string;
    } | null;
    roles: Array<{
        id: number;
        name: string;
    }>;
}

interface UsersShowProps {
    user: User;
}

export default function UsersShow({ user }: UsersShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Usuarios', href: '/users' },
        { title: user.name, href: `/users/${user.id}` },
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Usuario: ${user.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/users">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">{user.name}</h1>
                            <p className="text-muted-foreground">
                                Detalles del usuario
                            </p>
                        </div>
                    </div>
                    <Link href={`/users/${user.id}/edit`}>
                        <Button>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar Usuario
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Información básica */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Básica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">
                                    Nombre Completo
                                </label>
                                <p className="text-base">{user.name}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">
                                    Email
                                </label>
                                <div className="flex items-center gap-2">
                                    <p className="text-base">{user.email}</p>
                                    {user.email_verified_at ? (
                                        <Badge variant="default" className="bg-green-600">
                                            <MailCheck className="h-3 w-3 mr-1" />
                                            Verificado
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                            <Mail className="h-3 w-3 mr-1" />
                                            No verificado
                                        </Badge>
                                    )}
                                </div>
                                {user.email_verified_at && (
                                    <p className="text-sm text-muted-foreground">
                                        Verificado el {formatDate(user.email_verified_at)}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Roles y Permisos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Roles Asignados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.roles.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.roles.map((role) => (
                                        <Badge key={role.id} variant="secondary" className="text-base py-1 px-3">
                                            {role.name}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">
                                    No hay roles asignados
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sucursal */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Sucursal Asignada
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {user.branch ? (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Nombre
                                        </label>
                                        <p className="text-base">{user.branch.name}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Código
                                        </label>
                                        <p className="text-base">
                                            <Badge variant="outline">{user.branch.code}</Badge>
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Dirección
                                        </label>
                                        <p className="text-base">{user.branch.address}</p>
                                    </div>

                                    {user.branch.phone && (
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Teléfono
                                            </label>
                                            <p className="text-base">{user.branch.phone}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted-foreground">
                                    No hay sucursal asignada
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Información del sistema */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Sistema</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">
                                    Fecha de Registro
                                </label>
                                <p className="text-base">{formatDate(user.created_at)}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">
                                    Última Actualización
                                </label>
                                <p className="text-base">{formatDate(user.updated_at)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
