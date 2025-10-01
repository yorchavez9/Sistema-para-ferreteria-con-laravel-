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
    BookOpen,
    Folder,
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
    DollarSign
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
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
                title: 'Categorías',
                href: '/categories',
                icon: Tags,
            },
            {
                title: 'Marcas',
                href: '/brands',
                icon: Tags,
            },
            {
                title: 'Stock',
                href: '/inventory',
                icon: Archive,
            },
            {
                title: 'Sucursales',
                href: '/branches',
                icon: Building2,
            },
        ],
    },
    {
        title: 'Compras',
        icon: ShoppingCart,
        items: [
            {
                title: 'Proveedores',
                href: '/suppliers',
                icon: Truck,
            },
            {
                title: 'Órdenes de Compra',
                href: '/purchase-orders',
                icon: Receipt,
            },
        ],
    },
    {
        title: 'Ventas',
        icon: CreditCard,
        items: [
            {
                title: 'Clientes',
                href: '/customers',
                icon: Users,
            },
            {
                title: 'Facturas',
                href: '/sales',
                icon: Receipt,
            },
            {
                title: 'Gestión de Pagos',
                href: '/payments',
                icon: DollarSign,
            },
            {
                title: 'Cotizaciones',
                href: '/quotes',
                icon: Calculator,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
