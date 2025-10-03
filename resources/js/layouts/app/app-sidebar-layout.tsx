import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { props } = usePage<any>();

    useEffect(() => {
        // Mostrar alerta de advertencia si existe
        if (props.flash?.warning) {
            Swal.fire({
                icon: 'warning',
                title: '¡Atención!',
                text: props.flash.warning,
                confirmButtonText: 'Ir a Caja',
                confirmButtonColor: '#f59e0b',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/cash';
                }
            });
        }

        // Mostrar alerta de error si existe
        if (props.flash?.error || props.errors?.error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: props.flash?.error || props.errors?.error,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#d33',
            });
        }

        // Mostrar alerta de éxito si existe
        if (props.flash?.success) {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: props.flash.success,
                confirmButtonText: 'OK',
                confirmButtonColor: '#10b981',
                timer: 3000,
            });
        }
    }, [props.flash, props.errors]);

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
