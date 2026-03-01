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
    FileBarChart,
    ArrowRight,
    Info,
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

/**
 * Color mapping for the soft icon backgrounds and text/ring accents.
 * Each key corresponds to the `color` field on a ReportCard.
 */
const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
    'bg-blue-500':   { bg: 'bg-blue-100 dark:bg-blue-900/40',     text: 'text-blue-600 dark:text-blue-400',     ring: 'ring-blue-200 dark:ring-blue-800' },
    'bg-green-500':  { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-800' },
    'bg-purple-500': { bg: 'bg-purple-100 dark:bg-purple-900/40',   text: 'text-purple-600 dark:text-purple-400',   ring: 'ring-purple-200 dark:ring-purple-800' },
    'bg-yellow-500': { bg: 'bg-amber-100 dark:bg-amber-900/40',     text: 'text-amber-600 dark:text-amber-400',     ring: 'ring-amber-200 dark:ring-amber-800' },
    'bg-orange-500': { bg: 'bg-orange-100 dark:bg-orange-900/40',   text: 'text-orange-600 dark:text-orange-400',   ring: 'ring-orange-200 dark:ring-orange-800' },
    'bg-red-500':    { bg: 'bg-red-100 dark:bg-red-900/40',         text: 'text-red-600 dark:text-red-400',         ring: 'ring-red-200 dark:ring-red-800' },
    'bg-indigo-500': { bg: 'bg-indigo-100 dark:bg-indigo-900/40',   text: 'text-indigo-600 dark:text-indigo-400',   ring: 'ring-indigo-200 dark:ring-indigo-800' },
};

/**
 * Category accent colors used for the left-border on section headers.
 */
const categoryAccent: Record<string, string> = {
    'Ventas':     'border-blue-500',
    'Caja':       'border-emerald-500',
    'Inventario': 'border-purple-500',
    'Finanzas':   'border-amber-500',
    'Compras':    'border-orange-500',
    'Gastos':     'border-red-500',
    'Análisis':   'border-indigo-500',
};

export default function ReportsIndex() {
    const reports: ReportCard[] = [
        // Reportes de Ventas
        {
            title: 'Ventas Detallado',
            description: 'Reporte completo de ventas con filtros avanzados',
            icon: <ShoppingCart className="h-6 w-6" />,
            href: '/reports/sales/detailed',
            color: 'bg-blue-500',
            category: 'Ventas',
        },
        {
            title: 'Ventas por Cliente',
            description: 'Análisis de ventas agrupadas por cliente',
            icon: <Users className="h-6 w-6" />,
            href: '/reports/sales/by-client',
            color: 'bg-blue-500',
            category: 'Ventas',
        },

        // Reportes de Caja
        {
            title: 'Caja Diaria',
            description: 'Movimientos de caja por sesión',
            icon: <Wallet className="h-6 w-6" />,
            href: '/reports/cash/daily',
            color: 'bg-green-500',
            category: 'Caja',
        },

        // Reportes de Inventario
        {
            title: 'Inventario Valorizado',
            description: 'Stock actual con valorización por sucursal',
            icon: <Package className="h-6 w-6" />,
            href: '/reports/inventory/valued',
            color: 'bg-purple-500',
            category: 'Inventario',
        },
        {
            title: 'Movimientos de Inventario',
            description: 'Trazabilidad de entradas y salidas',
            icon: <FileBarChart className="h-6 w-6" />,
            href: '/reports/inventory/movements',
            color: 'bg-purple-500',
            category: 'Inventario',
        },

        // Reportes de Cuentas por Cobrar
        {
            title: 'Cuentas por Cobrar',
            description: 'Ventas a crédito pendientes de pago',
            icon: <DollarSign className="h-6 w-6" />,
            href: '/reports/receivables',
            color: 'bg-yellow-500',
            category: 'Finanzas',
        },

        // Reportes de Compras
        {
            title: 'Compras a Proveedores',
            description: 'Historial de órdenes de compra',
            icon: <ShoppingBag className="h-6 w-6" />,
            href: '/reports/purchases',
            color: 'bg-orange-500',
            category: 'Compras',
        },

        // Reportes de Gastos
        {
            title: 'Gastos por Categoría',
            description: 'Análisis detallado de gastos operativos',
            icon: <FileText className="h-6 w-6" />,
            href: '/reports/expenses',
            color: 'bg-red-500',
            category: 'Gastos',
        },

        // Reportes de Rentabilidad
        {
            title: 'Rentabilidad por Producto',
            description: 'Productos más y menos rentables',
            icon: <TrendingUp className="h-6 w-6" />,
            href: '/reports/profitability/by-product',
            color: 'bg-indigo-500',
            category: 'Análisis',
        },
    ];

    // Agrupar reportes por categoría
    const categories = Array.from(new Set(reports.map((r) => r.category)));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes" />

            <div className="flex h-full flex-1 flex-col gap-8 p-6">
                {/* ── Header ───────────────────────────────────────── */}
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                        <FileBarChart className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
                        <p className="text-muted-foreground mt-0.5">
                            Genera reportes detallados con filtros avanzados y expórtalos a PDF
                        </p>
                    </div>
                </div>

                {/* ── Report cards grouped by category ─────────────── */}
                <div className="flex flex-col gap-10">
                    {categories.map((category) => (
                        <section key={category}>
                            {/* Category header with left-border accent */}
                            <h2
                                className={`mb-5 border-l-4 pl-3 text-lg font-semibold text-foreground/90 ${
                                    categoryAccent[category] ?? 'border-primary'
                                }`}
                            >
                                {category}
                            </h2>

                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {reports
                                    .filter((report) => report.category === category)
                                    .map((report) => {
                                        const palette = colorMap[report.color] ?? {
                                            bg: 'bg-muted',
                                            text: 'text-foreground',
                                            ring: 'ring-border',
                                        };

                                        return (
                                            <Link key={report.href} href={report.href} className="group">
                                                <Card className="relative h-full overflow-hidden border border-border/60 px-5 py-5 shadow-sm transition-all duration-200 ease-out group-hover:scale-[1.02] group-hover:shadow-md group-hover:border-border">
                                                    <div className="flex items-start gap-4">
                                                        {/* Icon in soft-colored circle */}
                                                        <div
                                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-1 ${palette.bg} ${palette.text} ${palette.ring}`}
                                                        >
                                                            {report.icon}
                                                        </div>

                                                        {/* Text content */}
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="text-[0.95rem] font-semibold leading-snug text-foreground">
                                                                {report.title}
                                                            </h3>
                                                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                                                {report.description}
                                                            </p>
                                                        </div>

                                                        {/* Hover arrow indicator */}
                                                        <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground/0 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-muted-foreground/70" />
                                                    </div>
                                                </Card>
                                            </Link>
                                        );
                                    })}
                            </div>
                        </section>
                    ))}
                </div>

                {/* ── Info card ─────────────────────────────────────── */}
                <Card className="border-blue-200/60 bg-blue-50/50 px-5 py-5 shadow-none dark:border-blue-800/40 dark:bg-blue-950/30">
                    <div className="flex items-start gap-3.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 ring-1 ring-blue-200 dark:bg-blue-900/50 dark:ring-blue-800">
                            <Info className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                Información sobre los reportes
                            </h4>
                            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-blue-800/90 dark:text-blue-200/80">
                                <li className="flex items-baseline gap-2">
                                    <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-blue-400 dark:bg-blue-500" />
                                    Todos los reportes incluyen filtros avanzados para personalizar la información
                                </li>
                                <li className="flex items-baseline gap-2">
                                    <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-blue-400 dark:bg-blue-500" />
                                    Puedes exportar cualquier reporte a PDF con diseño profesional
                                </li>
                                <li className="flex items-baseline gap-2">
                                    <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-blue-400 dark:bg-blue-500" />
                                    Los datos se generan en tiempo real desde la base de datos
                                </li>
                                <li className="flex items-baseline gap-2">
                                    <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-blue-400 dark:bg-blue-500" />
                                    Algunos reportes pueden tardar unos segundos si contienen muchos datos
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
