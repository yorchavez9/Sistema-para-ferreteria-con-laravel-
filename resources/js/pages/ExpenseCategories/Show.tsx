import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Category {
    id: number;
    name: string;
    description: string | null;
    color: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    expenses_count: number;
}

interface Props {
    category: Category;
}

export default function ExpenseCategoriesShow({ category }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Categorías de Gastos', href: '/expense-categories' },
        { title: category.name, href: `/expense-categories/${category.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={category.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{category.name}</h1>
                        <p className="text-muted-foreground">Detalles de la categoría</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/expense-categories/${category.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/expense-categories">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Información General</h2>
                            
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Nombre</p>
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4" style={{ color: category.color }} />
                                        <p className="font-medium">{category.name}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Color</p>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-8 w-8 rounded-full border"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <span className="font-mono">{category.color}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Estado</p>
                                    {category.is_active ? (
                                        <Badge className="bg-green-100 text-green-800">Activa</Badge>
                                    ) : (
                                        <Badge variant="outline">Inactiva</Badge>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Total de Gastos</p>
                                    <p className="font-medium text-2xl">{category.expenses_count}</p>
                                </div>
                            </div>

                            {category.description && (
                                <div className="mt-6">
                                    <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                                    <p className="text-sm">{category.description}</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card className="p-6">
                            <h3 className="mb-4 text-lg font-semibold">Fechas</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground mb-1">Creado</p>
                                    <p>{format(new Date(category.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1">Última Actualización</p>
                                    <p>{format(new Date(category.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="mb-4 text-lg font-semibold">Acciones</h3>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/expenses">Ver Gastos</Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href={`/expense-categories/${category.id}/edit`}>Editar Categoría</Link>
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
