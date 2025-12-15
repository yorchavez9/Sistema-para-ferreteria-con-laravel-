import { useState, useEffect } from 'react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';

export function NavMainNested({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    // Determinar qué menú debe estar abierto basado en la ruta actual
    useEffect(() => {
        const currentOpenMenus: string[] = [];

        items.forEach((item) => {
            if (item.items && item.items.length > 0) {
                // Verificar subitems de segundo nivel
                const hasActiveSubItem = item.items.some((subItem) =>
                    subItem.href && page.url.startsWith(subItem.href as string)
                );

                if (hasActiveSubItem) {
                    currentOpenMenus.push(item.title);
                }

                // Verificar subitems de tercer nivel
                item.items.forEach((subItem) => {
                    if (subItem.items && subItem.items.length > 0) {
                        const hasActiveThirdItem = subItem.items.some((thirdItem) =>
                            thirdItem.href && page.url.startsWith(thirdItem.href as string)
                        );

                        if (hasActiveThirdItem) {
                            currentOpenMenus.push(item.title);
                            currentOpenMenus.push(`${item.title}-${subItem.title}`);
                        }
                    }
                });
            }
        });

        setOpenMenus(currentOpenMenus);
    }, [page.url, items]);

    const toggleMenu = (title: string) => {
        setOpenMenus((prev) =>
            prev.includes(title)
                ? prev.filter((t) => t !== title)
                : [...prev, title]
        );
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Sistema Ferretería</SidebarGroupLabel>
            <SidebarMenu className="space-y-0.5">
                {items.map((item) => {
                    // Si el item tiene subelementos
                    if (item.items && item.items.length > 0) {
                        const isOpen = openMenus.includes(item.title);

                        return (
                            <SidebarMenuItem key={item.title}>
                                <Collapsible
                                    open={isOpen}
                                    onOpenChange={() => toggleMenu(item.title)}
                                >
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={{ children: item.title }}
                                            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        >
                                            {item.icon && <item.icon className="shrink-0" />}
                                            <span>{item.title}</span>
                                            <ChevronRight className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                                            {item.items.map((subItem) => {
                                                // Si el subItem tiene sus propios items (tercer nivel)
                                                if (subItem.items && subItem.items.length > 0) {
                                                    const isSubOpen = openMenus.includes(`${item.title}-${subItem.title}`);

                                                    return (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <Collapsible
                                                                open={isSubOpen}
                                                                onOpenChange={() => toggleMenu(`${item.title}-${subItem.title}`)}
                                                            >
                                                                <CollapsibleTrigger asChild>
                                                                    <SidebarMenuSubButton className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                                                        {subItem.icon && <subItem.icon className="shrink-0" />}
                                                                        <span>{subItem.title}</span>
                                                                        <ChevronRight className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${isSubOpen ? 'rotate-90' : ''}`} />
                                                                    </SidebarMenuSubButton>
                                                                </CollapsibleTrigger>
                                                                <CollapsibleContent>
                                                                    <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                                                                        {subItem.items.map((thirdItem) => (
                                                                            <SidebarMenuSubItem key={thirdItem.title}>
                                                                                <SidebarMenuSubButton
                                                                                    asChild
                                                                                    isActive={thirdItem.href ? page.url.startsWith(thirdItem.href as string) : false}
                                                                                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                                                                >
                                                                                    <Link href={thirdItem.href || '#'}>
                                                                                        {thirdItem.icon && <thirdItem.icon className="shrink-0" />}
                                                                                        <span>{thirdItem.title}</span>
                                                                                    </Link>
                                                                                </SidebarMenuSubButton>
                                                                            </SidebarMenuSubItem>
                                                                        ))}
                                                                    </SidebarMenuSub>
                                                                </CollapsibleContent>
                                                            </Collapsible>
                                                        </SidebarMenuSubItem>
                                                    );
                                                }

                                                // SubItem normal (sin tercer nivel)
                                                return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={subItem.href ? page.url.startsWith(subItem.href as string) : false}
                                                            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                                        >
                                                            <Link href={subItem.href || '#'}>
                                                                {subItem.icon && <subItem.icon className="shrink-0" />}
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>
                            </SidebarMenuItem>
                        );
                    }

                    // Si es un elemento simple sin subelementos
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={item.href ? page.url.startsWith(
                                    typeof item.href === 'string'
                                        ? item.href
                                        : item.href.url || '',
                                ) : false}
                                tooltip={{ children: item.title }}
                                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                <Link href={item.href || '#'}>
                                    {item.icon && <item.icon className="shrink-0" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}