import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Plus, Search, Edit, Eye, Trash2, MapPin, Phone, Mail, Star } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { confirmDelete, showSuccess, showError } from '@/lib/sweet-alert';

interface Branch {
    id: number;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    manager_name: string | null;
    is_active: boolean;
    is_main: boolean;
    products_count: number;
    inventories_count: number;
}

interface BranchesIndexProps {
    branches: {
        data: Branch[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Sucursales', href: '/branches' },
];

export default function BranchesIndex({ branches, filters }: BranchesIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = () => {
        router.get('/branches', {
            search: search || undefined,
        });
    };

    const clearFilters = () => {
        setSearch('');
        router.get('/branches');
    };

    const deleteBranch = async (branch: Branch) => {
        if (branch.is_main) {
            showError(
                'No se puede eliminar',
                'No se puede eliminar la sucursal principal.'
            );
            return;
        }

        if (branch.inventories_count > 0) {
            showError(
                'No se puede eliminar',
                `Esta sucursal tiene ${branch.inventories_count} registros de inventario asociados.`
            );
            return;
        }

        const result = await confirmDelete(
            `¿Eliminar "${branch.name}"?`,
            'Esta acción eliminará la sucursal permanentemente.'
        );

        if (result.isConfirmed) {
            router.delete(`/branches/${branch.id}`, {
                onSuccess: () => {
                    showSuccess('¡Eliminado!', 'La sucursal ha sido eliminada correctamente.');
                },
                onError: () => {
                    showError('Error', 'No se pudo eliminar la sucursal.');
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sucursales" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Sucursales</h1>
                        <p className="text-muted-foreground">
                            Gestiona las sucursales de la ferretería
                        </p>
                    </div>
                    <Link href="/branches/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Sucursal
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <Input
                            placeholder="Buscar por nombre, código o dirección..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button onClick={handleSearch}>
                        <Search className="mr-2 h-4 w-4" />
                        Buscar
                    </Button>
                    <Button variant="outline" onClick={clearFilters}>
                        Limpiar
                    </Button>
                </div>

                {/* Branches Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Dirección</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead>Inventario</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {branches.data.length > 0 ? (
                                branches.data.map((branch) => (
                                    <TableRow key={branch.id}>
                                        <TableCell className="font-mono">
                                            <div className="flex items-center gap-2">
                                                {branch.code}
                                                {branch.is_main && (
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{branch.name}</div>
                                                {branch.manager_name && (
                                                    <div className="text-sm text-muted-foreground">
                                                        Gerente: {branch.manager_name}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {branch.address && (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="max-w-xs truncate">{branch.address}</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {branch.phone && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{branch.phone}</span>
                                                    </div>
                                                )}
                                                {branch.email && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Mail className="h-3 w-3" />
                                                        <span>{branch.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {branch.inventories_count} items
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={branch.is_active ? "default" : "secondary"}
                                            >
                                                {branch.is_active ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/branches/${branch.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/branches/${branch.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteBranch(branch)}
                                                    disabled={branch.is_main}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-6">
                                        No se encontraron sucursales.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Info */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {branches.data.length} de {branches.total} sucursales
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}