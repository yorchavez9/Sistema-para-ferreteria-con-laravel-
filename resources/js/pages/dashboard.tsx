import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    stats: {
        total_products: number;
        total_categories: number;
        total_brands: number;
        total_branches: number;
        total_customers: number;
        total_suppliers: number;
        low_stock_items: number;
        out_of_stock_items: number;
    };
    lowStockProducts: Array<{
        id: number;
        current_stock: number;
        min_stock: number;
        product: {
            name: string;
            code: string;
        };
        branch: {
            name: string;
        };
    }>;
    inventoryByBranch: Array<{
        branch_name: string;
        total_value: number;
        total_items: number;
    }>;
}

export default function Dashboard({ stats, lowStockProducts, inventoryByBranch }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Sistema de Ferretería" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Estadísticas principales */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <div className="rounded-lg border bg-card p-4">
                        <h3 className="font-semibold text-lg">Productos</h3>
                        <p className="text-2xl font-bold text-blue-600">{stats.total_products}</p>
                        <p className="text-sm text-muted-foreground">Total registrados</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <h3 className="font-semibold text-lg">Categorías</h3>
                        <p className="text-2xl font-bold text-green-600">{stats.total_categories}</p>
                        <p className="text-sm text-muted-foreground">Organizadas</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <h3 className="font-semibold text-lg">Stock Bajo</h3>
                        <p className="text-2xl font-bold text-orange-600">{stats.low_stock_items}</p>
                        <p className="text-sm text-muted-foreground">Requieren atención</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <h3 className="font-semibold text-lg">Sin Stock</h3>
                        <p className="text-2xl font-bold text-red-600">{stats.out_of_stock_items}</p>
                        <p className="text-sm text-muted-foreground">Productos agotados</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Productos con stock bajo */}
                    <div className="rounded-lg border bg-card p-4">
                        <h3 className="font-semibold text-lg mb-4">Productos con Stock Bajo</h3>
                        <div className="space-y-2">
                            {lowStockProducts.length > 0 ? (
                                lowStockProducts.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                                        <div>
                                            <p className="font-medium">{item.product.name}</p>
                                            <p className="text-sm text-muted-foreground">{item.product.code} - {item.branch.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-orange-600">
                                                {item.current_stock} / {item.min_stock}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground">No hay productos con stock bajo</p>
                            )}
                        </div>
                    </div>

                    {/* Inventario por sucursal */}
                    <div className="rounded-lg border bg-card p-4">
                        <h3 className="font-semibold text-lg mb-4">Inventario por Sucursal</h3>
                        <div className="space-y-2">
                            {inventoryByBranch.map((branch, index) => (
                                <div key={index} className="flex justify-between items-center p-2 border rounded">
                                    <div>
                                        <p className="font-medium">{branch.branch_name}</p>
                                        <p className="text-sm text-muted-foreground">{branch.total_items} productos</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">S/ {branch.total_value.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Estadísticas adicionales */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4">
                        <h3 className="font-semibold text-lg">Sucursales</h3>
                        <p className="text-2xl font-bold text-purple-600">{stats.total_branches}</p>
                        <p className="text-sm text-muted-foreground">Activas</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <h3 className="font-semibold text-lg">Clientes</h3>
                        <p className="text-2xl font-bold text-cyan-600">{stats.total_customers}</p>
                        <p className="text-sm text-muted-foreground">Registrados</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <h3 className="font-semibold text-lg">Proveedores</h3>
                        <p className="text-2xl font-bold text-indigo-600">{stats.total_suppliers}</p>
                        <p className="text-sm text-muted-foreground">Activos</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
