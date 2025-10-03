import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Card } from '@/components/ui/card';
import {
    FileText,
    ShoppingCart,
    Wallet,
    Package,
    Users,
    ShoppingBag,
    DollarSign,
    TrendingUp,
    FileBarChart
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: '/reports' },
];

interface ReportCard {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    color: string;
    category: string;
}

export default function ReportsIndex() {
    const reports: ReportCard[] = [
        // Reportes de Ventas
        {
            title: 'Ventas Detallado',
            description: 'Reporte completo de ventas con filtros avanzados',
            icon: <ShoppingCart className="h-8 w-8" />,
            href: '/reports/sales/detailed',
            color: 'bg-blue-500',
            category: 'Ventas'
        },
        {
            title: 'Ventas por Cliente',
            description: 'Análisis de ventas agrupadas por cliente',
            icon: <Users className="h-8 w-8" />,
            href: '/reports/sales/by-client',
            color: 'bg-blue-500',
            category: 'Ventas'
        },

        // Reportes de Caja
        {
            title: 'Caja Diaria',
            description: 'Movimientos de caja por sesión',
            icon: <Wallet className="h-8 w-8" />,
            href: '/reports/cash/daily',
            color: 'bg-green-500',
            category: 'Caja'
        },

        // Reportes de Inventario
        {
            title: 'Inventario Valorizado',
            description: 'Stock actual con valorización por sucursal',
            icon: <Package className="h-8 w-8" />,
            href: '/reports/inventory/valued',
            color: 'bg-purple-500',
            category: 'Inventario'
        },
        {
            title: 'Movimientos de Inventario',
            description: 'Trazabilidad de entradas y salidas',
            icon: <FileBarChart className="h-8 w-8" />,
            href: '/reports/inventory/movements',
            color: 'bg-purple-500',
            category: 'Inventario'
        },

        // Reportes de Cuentas por Cobrar
        {
            title: 'Cuentas por Cobrar',
            description: 'Ventas a crédito pendientes de pago',
            icon: <DollarSign className="h-8 w-8" />,
            href: '/reports/receivables',
            color: 'bg-yellow-500',
            category: 'Finanzas'
        },

        // Reportes de Compras
        {
            title: 'Compras a Proveedores',
            description: 'Historial de órdenes de compra',
            icon: <ShoppingBag className="h-8 w-8" />,
            href: '/reports/purchases',
            color: 'bg-orange-500',
            category: 'Compras'
        },

        // Reportes de Gastos
        {
            title: 'Gastos por Categoría',
            description: 'Análisis detallado de gastos operativos',
            icon: <FileText className="h-8 w-8" />,
            href: '/reports/expenses',
            color: 'bg-red-500',
            category: 'Gastos'
        },

        // Reportes de Rentabilidad
        {
            title: 'Rentabilidad por Producto',
            description: 'Productos más y menos rentables',
            icon: <TrendingUp className="h-8 w-8" />,
            href: '/reports/profitability/by-product',
            color: 'bg-indigo-500',
            category: 'Análisis'
        },
    ];

    // Agrupar reportes por categoría
    const categories = Array.from(new Set(reports.map(r => r.category)));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Reportes</h1>
                    <p className="text-muted-foreground">
                        Genera reportes detallados con filtros avanzados y expórtalos a PDF
                    </p>
                </div>

                {/* Reportes agrupados por categoría */}
                {categories.map((category) => (
                    <div key={category}>
                        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
                            {category}
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                            {reports
                                .filter((report) => report.category === category)
                                .map((report) => (
                                    <Link key={report.href} href={report.href}>
                                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                                            <div className="flex items-start gap-4">
                                                <div className={`${report.color} text-white p-3 rounded-lg`}>
                                                    {report.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg mb-1">
                                                        {report.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {report.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                        </div>
                    </div>
                ))}

                {/* Info Card */}
                <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                Información sobre los reportes
                            </h4>
                            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                <li>• Todos los reportes incluyen filtros avanzados para personalizar la información</li>
                                <li>• Puedes exportar cualquier reporte a PDF con diseño profesional</li>
                                <li>• Los datos se generan en tiempo real desde la base de datos</li>
                                <li>• Algunos reportes pueden tardar unos segundos si contienen muchos datos</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
