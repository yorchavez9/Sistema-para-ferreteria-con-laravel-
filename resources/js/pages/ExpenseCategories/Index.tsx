import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    Tag
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useDebouncedCallback } from 'use-debounce';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categorías de Gastos', href: '/expense-categories' },
];

interface Category {
    id: number;
    name: string;
    description: string | null;
    color: string;
    is_active: boolean;
    expenses_count: number;
}

interface Props {
    categories: {
        data: Category[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function ExpenseCategoriesIndex({ categories, filters = {} }: Props) {
    const handleSearch = useDebouncedCallback((value: string) => {
        router.get('/expense-categories', { search: value }, { preserveState: true, replace: true });
    }, 300);

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: '¿Eliminar categoría?',
            html: `¿Estás seguro que deseas eliminar la categoría <strong>${name}</strong>?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/expense-categories/${id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: 'La categoría ha sido eliminada correctamente.',
                            confirmButtonColor: '#10b981',
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo eliminar la categoría.',
                            confirmButtonColor: '#d33',
                        });
                    },
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorías de Gastos" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Categorías de Gastos</h1>
                        <p className="text-muted-foreground">
                            Gestiona las categorías para clasificar tus gastos
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/expense-categories/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Categoría
                        </Link>
                    </Button>
                </div>

                {/* Búsqueda */}
                <Card className="p-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar categorías..."
                            defaultValue={filters.search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </Card>

                {/* Tabla de Categorías */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 font-medium">Categoría</th>
                                    <th className="text-left p-4 font-medium">Descripción</th>
                                    <th className="text-left p-4 font-medium">Color</th>
                                    <th className="text-left p-4 font-medium">Gastos</th>
                                    <th className="text-left p-4 font-medium">Estado</th>
                                    <th className="text-right p-4 font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.data.length > 0 ? (
                                    categories.data.map((category) => (
                                        <tr key={category.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="h-4 w-4" style={{ color: category.color }} />
                                                    <span className="font-medium">{category.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {category.description || '-'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-6 w-6 rounded-full border"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                    <span className="text-sm font-mono">{category.color}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{category.expenses_count}</span>
                                            </td>
                                            <td className="p-4">
                                                {category.is_active ? (
                                                    <Badge className="bg-green-100 text-green-800">Activa</Badge>
                                                ) : (
                                                    <Badge variant="outline">Inactiva</Badge>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/expense-categories/${category.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/expense-categories/${category.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(category.id, category.name)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Tag className="h-12 w-12 text-muted-foreground" />
                                                <p className="text-muted-foreground">No hay categorías registradas</p>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href="/expense-categories/create">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Crear Primera Categoría
                                                    </Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {categories.last_page > 1 && (
                        <div className="flex items-center justify-between border-t p-4">
                            <p className="text-sm text-muted-foreground">
                                Mostrando {categories.data.length} de {categories.total} categorías
                            </p>
                            <div className="flex gap-2">
                                {Array.from({ length: categories.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={page === categories.current_page ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() =>
                                            router.get('/expense-categories', { ...filters, page })
                                        }
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
