import { NavFooter } from '@/components/nav-footer';
import { NavMainNested } from '@/components/nav-main-nested';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    Package,
    Tags,
    Building2,
    Archive,
    Users,
    Truck,
    ShoppingCart,
    Receipt,
    Calculator,
    CreditCard,
    DollarSign,
    Settings,
    UserCog,
    Shield,
    Cloud,
    FileText,
    Percent,
    Wallet,
    TrendingUp,
    BarChart3,
    FileBarChart,
    ShoppingBag,
    PieChart
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    // 1. DASHBOARD
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },

    // 2. VENTAS
    {
        title: 'Ventas',
        icon: CreditCard,
        items: [
            {
                title: 'Nueva Venta',
                href: '/sales/create',
                icon: CreditCard,
            },
            {
                title: 'Lista de Ventas',
                href: '/sales',
                icon: Receipt,
            },
            {
                title: 'Cotizaciones',
                href: '/quotes',
                icon: Calculator,
            },
            {
                title: 'Gestión de Pagos',
                href: '/payments',
                icon: DollarSign,
            },
        ],
    },

    // 3. COMPRAS
    {
        title: 'Compras',
        icon: ShoppingCart,
        items: [
            {
                title: 'Nueva Compra',
                href: '/purchase-orders/create',
                icon: ShoppingCart,
            },
            {
                title: 'Órdenes de Compra',
                href: '/purchase-orders',
                icon: Receipt,
            },
            {
                title: 'Proveedores',
                href: '/suppliers',
                icon: Truck,
            },
        ],
    },

    // 4. INVENTARIO
    {
        title: 'Inventario',
        icon: Package,
        items: [
            {
                title: 'Productos',
                href: '/products',
                icon: Package,
            },
            {
                title: 'Control de Stock',
                href: '/inventory',
                icon: Archive,
            },
            {
                title: 'Categorías',
                href: '/categories',
                icon: Tags,
            },
            {
                title: 'Marcas',
                href: '/brands',
                icon: Tags,
            },
        ],
    },

    // 5. CLIENTES
    {
        title: 'Clientes',
        href: '/customers',
        icon: Users,
    },

    // 6. CAJA
    {
        title: 'Caja',
        icon: Wallet,
        items: [
            {
                title: 'Gestión de Caja',
                href: '/cash',
                icon: Wallet,
            },
            {
                title: 'Cajas Registradoras',
                href: '/cash-registers',
                icon: DollarSign,
            },
            {
                title: 'Gastos',
                href: '/expenses',
                icon: Receipt,
            },
            {
                title: 'Categorías de Gastos',
                href: '/expense-categories',
                icon: Tags,
            },
        ],
    },

    // 7. REPORTES
    {
        title: 'Reportes',
        icon: BarChart3,
        items: [
            {
                title: 'Todos los Reportes',
                href: '/reports',
                icon: FileBarChart,
            },
            {
                title: 'Ventas Detallado',
                href: '/reports/sales/detailed',
                icon: TrendingUp,
            },
            {
                title: 'Caja Diaria',
                href: '/reports/cash/daily',
                icon: Wallet,
            },
            {
                title: 'Inventario Valorizado',
                href: '/reports/inventory/valued',
                icon: Package,
            },
            {
                title: 'Cuentas por Cobrar',
                href: '/reports/receivables',
                icon: DollarSign,
            },
            {
                title: 'Compras',
                href: '/reports/purchases',
                icon: ShoppingBag,
            },
            {
                title: 'Gastos',
                href: '/reports/expenses',
                icon: Receipt,
            },
            {
                title: 'Rentabilidad',
                href: '/reports/profitability/by-product',
                icon: PieChart,
            },
        ],
    },

    // 8. SUCURSALES
    {
        title: 'Sucursales',
        href: '/branches',
        icon: Building2,
    },

    // 9. ADMINISTRACIÓN
    {
        title: 'Administración',
        icon: Settings,
        items: [
            {
                title: 'Usuarios',
                href: '/users',
                icon: UserCog,
            },
            {
                title: 'Roles y Permisos',
                href: '/roles',
                icon: Shield,
            },
        ],
    },

    // 10. CONFIGURACIÓN
    {
        title: 'Configuración',
        icon: Settings,
        items: [
            {
                title: 'Datos de la Empresa',
                href: '/settings/system/company',
                icon: Building2,
            },
            {
                title: 'Configuración Fiscal',
                href: '/settings/system/fiscal',
                icon: Percent,
            },
            {
                title: 'Series de Documentos',
                href: '/settings/system/documents',
                icon: FileText,
            },
            {
                title: 'APIs Externas',
                href: '/settings/system/apis',
                icon: Cloud,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    // Puedes agregar enlaces útiles para tu ferretería aquí
    // Por ejemplo: Manual de usuario, Soporte técnico, etc.
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMainNested items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {footerNavItems.length > 0 && (
                    <NavFooter items={footerNavItems} className="mt-auto" />
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
