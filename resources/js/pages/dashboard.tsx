import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import DonutChart from '@/components/charts/DonutChart';
import BarChart from '@/components/charts/BarChart';
import AreaChart from '@/components/charts/AreaChart';
import { Package, ShoppingCart, AlertTriangle, XCircle } from 'lucide-react';

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
        name: string;
        value: number;
        items: number;
    }>;
    productsByCategory: Array<{
        name: string;
        value: number;
    }>;
    inventoryByBrand: Array<{
        name: string;
        stock: number;
    }>;
    stockStatus: Array<{
        name: string;
        value: number;
    }>;
    salesLastWeek: Array<{
        name: string;
        ventas: number;
        monto: number;
    }>;
}

export default function Dashboard({
    stats,
    lowStockProducts,
    inventoryByBranch,
    productsByCategory,
    inventoryByBrand,
    stockStatus,
    salesLastWeek
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Sistema de Ferretería" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Estadísticas principales */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-sm text-muted-foreground">Productos</h3>
                            <Package className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-blue-600">{stats.total_products}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total registrados</p>
                    </div>
                    <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-sm text-muted-foreground">Categorías</h3>
                            <ShoppingCart className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-3xl font-bold text-green-600">{stats.total_categories}</p>
                        <p className="text-xs text-muted-foreground mt-1">Organizadas</p>
                    </div>
                    <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-sm text-muted-foreground">Stock Bajo</h3>
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                        </div>
                        <p className="text-3xl font-bold text-orange-600">{stats.low_stock_items}</p>
                        <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
                    </div>
                    <div className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-sm text-muted-foreground">Sin Stock</h3>
                            <XCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <p className="text-3xl font-bold text-red-600">{stats.out_of_stock_items}</p>
                        <p className="text-xs text-muted-foreground mt-1">Productos agotados</p>
                    </div>
                </div>

                {/* Gráfico de barras - Inventario por marca */}
                {inventoryByBrand && inventoryByBrand.length > 0 && (
                    <div className="rounded-lg border bg-card p-6">
                        <BarChart
                            data={inventoryByBrand}
                            dataKeys={[
                                { key: 'stock', name: 'Stock Total', color: '#3b82f6' }
                            ]}
                            title="Inventario por Marca (Top 10)"
                            height={350}
                        />
                    </div>
                )}

                {/* Gráfico de ventas de la semana */}
                {salesLastWeek && salesLastWeek.length > 0 && (
                    <div className="rounded-lg border bg-card p-6">
                        <AreaChart
                            data={salesLastWeek}
                            dataKeys={[
                                { key: 'ventas', name: 'Cantidad de Ventas', color: '#3b82f6' },
                                { key: 'monto', name: 'Monto Total (S/)', color: '#10b981' }
                            ]}
                            title="Ventas de los Últimos 7 Días"
                            height={350}
                        />
                    </div>
                )}

                {/* Gráficos de donas */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Productos por categoría */}
                    {productsByCategory && productsByCategory.length > 0 && (
                        <div className="rounded-lg border bg-card p-6">
                            <DonutChart
                                data={productsByCategory}
                                title="Productos por Categoría"
                                height={300}
                            />
                        </div>
                    )}

                    {/* Estado del stock */}
                    {stockStatus && stockStatus.length > 0 && (
                        <div className="rounded-lg border bg-card p-6">
                            <DonutChart
                                data={stockStatus.map((item, index) => ({
                                    ...item,
                                    color: index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#ef4444'
                                }))}
                                title="Estado del Stock"
                                height={300}
                            />
                        </div>
                    )}
                </div>

                {/* Tablas de datos */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Productos con stock bajo */}
                    <div className="rounded-lg border bg-card p-6">
                        <h3 className="font-semibold text-lg mb-4">Productos con Stock Bajo</h3>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {lowStockProducts.length > 0 ? (
                                lowStockProducts.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-sm">{item.product.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.product.code} - {item.branch.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-orange-600">
                                                {item.current_stock} / {item.min_stock}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm text-center py-8">No hay productos con stock bajo</p>
                            )}
                        </div>
                    </div>

                    {/* Inventario por sucursal */}
                    <div className="rounded-lg border bg-card p-6">
                        <h3 className="font-semibold text-lg mb-4">Inventario por Sucursal</h3>
                        <div className="space-y-2">
                            {inventoryByBranch.map((branch, index) => (
                                <div key={index} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div>
                                        <p className="font-medium text-sm">{branch.name}</p>
                                        <p className="text-xs text-muted-foreground">{branch.items} productos</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sm">S/ {branch.value.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Estadísticas adicionales */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-6 text-center hover:shadow-md transition-shadow">
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">Sucursales</h3>
                        <p className="text-3xl font-bold text-purple-600">{stats.total_branches}</p>
                        <p className="text-xs text-muted-foreground mt-1">Activas</p>
                    </div>
                    <div className="rounded-lg border bg-card p-6 text-center hover:shadow-md transition-shadow">
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">Clientes</h3>
                        <p className="text-3xl font-bold text-cyan-600">{stats.total_customers}</p>
                        <p className="text-xs text-muted-foreground mt-1">Registrados</p>
                    </div>
                    <div className="rounded-lg border bg-card p-6 text-center hover:shadow-md transition-shadow">
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">Proveedores</h3>
                        <p className="text-3xl font-bold text-indigo-600">{stats.total_suppliers}</p>
                        <p className="text-xs text-muted-foreground mt-1">Activos</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
