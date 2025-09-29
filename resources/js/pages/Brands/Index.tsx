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
import { Plus, Search, Edit, Eye, Trash2, Globe, Mail, Phone } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { confirmDelete, showSuccess, showError } from '@/lib/sweet-alert';

interface Brand {
    id: number;
    name: string;
    code: string;
    description: string | null;
    website: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    is_active: boolean;
    products_count: number;
}

interface BrandsIndexProps {
    brands: {
        data: Brand[];
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
    { title: 'Marcas', href: '/brands' },
];

export default function BrandsIndex({ brands, filters }: BrandsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = () => {
        router.get('/brands', {
            search: search || undefined,
        });
    };

    const clearFilters = () => {
        setSearch('');
        router.get('/brands');
    };

    const deleteBrand = async (brand: Brand) => {
        if (brand.products_count > 0) {
            showError(
                'No se puede eliminar',
                `Esta marca tiene ${brand.products_count} productos asociados.`
            );
            return;
        }

        const result = await confirmDelete(
            `¿Eliminar "${brand.name}"?`,
            'Esta acción eliminará la marca permanentemente.'
        );

        if (result.isConfirmed) {
            router.delete(`/brands/${brand.id}`, {
                onSuccess: () => {
                    showSuccess('¡Eliminado!', 'La marca ha sido eliminada correctamente.');
                },
                onError: () => {
                    showError('Error', 'No se pudo eliminar la marca.');
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Marcas" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Marcas</h1>
                        <p className="text-muted-foreground">
                            Gestiona las marcas de productos de la ferretería
                        </p>
                    </div>
                    <Link href="/brands/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Marca
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <Input
                            placeholder="Buscar por nombre o código..."
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

                {/* Brands Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead>Productos</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {brands.data.length > 0 ? (
                                brands.data.map((brand) => (
                                    <TableRow key={brand.id}>
                                        <TableCell className="font-mono">{brand.code}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{brand.name}</div>
                                                {brand.description && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {brand.description}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {brand.website && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Globe className="h-3 w-3" />
                                                        <a
                                                            href={brand.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:underline"
                                                        >
                                                            Sitio web
                                                        </a>
                                                    </div>
                                                )}
                                                {brand.contact_email && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Mail className="h-3 w-3" />
                                                        <span>{brand.contact_email}</span>
                                                    </div>
                                                )}
                                                {brand.contact_phone && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{brand.contact_phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {brand.products_count} productos
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={brand.is_active ? "default" : "secondary"}
                                            >
                                                {brand.is_active ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/brands/${brand.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/brands/${brand.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteBrand(brand)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6">
                                        No se encontraron marcas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Info */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {brands.data.length} de {brands.total} marcas
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}