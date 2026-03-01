import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

function hexToOklch(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    // sRGB to linear RGB
    const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const lr = toLinear(r);
    const lg = toLinear(g);
    const lb = toLinear(b);

    // Linear RGB to XYZ (D65)
    const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
    const y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb;
    const z = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb;

    // XYZ to LMS
    const l_ = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
    const m_ = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
    const s_ = 0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z;

    // LMS to LMS (cube root)
    const l2 = Math.cbrt(l_);
    const m2 = Math.cbrt(m_);
    const s2 = Math.cbrt(s_);

    // Oklab
    const L = 0.2104542553 * l2 + 0.7936177850 * m2 - 0.0040720468 * s2;
    const A = 1.9779984951 * l2 - 2.4285922050 * m2 + 0.4505937099 * s2;
    const B = 0.0259040371 * l2 + 0.7827717662 * m2 - 0.8086757660 * s2;

    // Oklab to Oklch
    const C = Math.sqrt(A * A + B * B);
    let H = (Math.atan2(B, A) * 180) / Math.PI;
    if (H < 0) H += 360;

    return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(2)})`;
}

function isLightColor(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
}

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { props } = usePage<any>();

    const applyPrimaryColor = useCallback(() => {
        const lightHex = props.settings?.primary_color_light || '#4f46e5';
        const darkHex = props.settings?.primary_color_dark || '#6366f1';
        const isDark = document.documentElement.classList.contains('dark');
        const hex = isDark ? darkHex : lightHex;
        const oklch = hexToOklch(hex);
        const fg = isLightColor(hex) ? 'oklch(0 0 0)' : 'oklch(1 0 0)';

        const root = document.documentElement;
        root.style.setProperty('--primary', oklch);
        root.style.setProperty('--ring', oklch);
        root.style.setProperty('--sidebar-primary', oklch);
        root.style.setProperty('--sidebar-ring', oklch);
        root.style.setProperty('--primary-foreground', fg);
        root.style.setProperty('--sidebar-primary-foreground', fg);
    }, [props.settings?.primary_color_light, props.settings?.primary_color_dark]);

    // Apply primary color and observe dark/light mode changes
    useEffect(() => {
        applyPrimaryColor();

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    applyPrimaryColor();
                }
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, [applyPrimaryColor]);

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
