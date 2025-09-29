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
import { Plus, Search, Edit, Eye, Trash2, FolderTree } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { confirmDelete, showSuccess, showError } from '@/lib/sweet-alert';

interface Category {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    parent_id: number | null;
    parent?: {
        id: number;
        name: string;
    };
    children_count: number;
    products_count: number;
}

interface CategoriesIndexProps {
    categories: {
        data: Category[];
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
    { title: 'Categorías', href: '/categories' },
];

export default function CategoriesIndex({ categories, filters }: CategoriesIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = () => {
        router.get('/categories', {
            search: search || undefined,
        });
    };

    const clearFilters = () => {
        setSearch('');
        router.get('/categories');
    };

    const deleteCategory = async (category: Category) => {
        const hasChildren = category.children_count > 0;
        const hasProducts = category.products_count > 0;

        if (hasChildren || hasProducts) {
            showError(
                'No se puede eliminar',
                `Esta categoría tiene ${hasChildren ? 'subcategorías' : ''} ${hasChildren && hasProducts ? 'y ' : ''} ${hasProducts ? 'productos asociados' : ''}.`
            );
            return;
        }

        const result = await confirmDelete(
            `¿Eliminar "${category.name}"?`,
            'Esta acción eliminará la categoría permanentemente.'
        );

        if (result.isConfirmed) {
            router.delete(`/categories/${category.id}`, {
                onSuccess: () => {
                    showSuccess('¡Eliminado!', 'La categoría ha sido eliminada correctamente.');
                },
                onError: () => {
                    showError('Error', 'No se pudo eliminar la categoría.');
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorías" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Categorías</h1>
                        <p className="text-muted-foreground">
                            Organiza los productos en categorías para facilitar su gestión
                        </p>
                    </div>
                    <Link href="/categories/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Categoría
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

                {/* Categories Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Categoría Padre</TableHead>
                                <TableHead>Subcategorías</TableHead>
                                <TableHead>Productos</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.data.length > 0 ? (
                                categories.data.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-mono">{category.code}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {category.parent_id && (
                                                    <FolderTree className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <div>
                                                    <div className="font-medium">{category.name}</div>
                                                    {category.description && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {category.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {category.parent ? (
                                                <Badge variant="secondary">
                                                    {category.parent.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{category.children_count}</TableCell>
                                        <TableCell>{category.products_count}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={category.is_active ? "default" : "secondary"}
                                            >
                                                {category.is_active ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/categories/${category.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/categories/${category.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteCategory(category)}
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
                                        No se encontraron categorías.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Info */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {categories.data.length} de {categories.total} categorías
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}