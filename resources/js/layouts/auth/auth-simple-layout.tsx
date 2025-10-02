import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

interface PageProps {
    settings: {
        company_name?: string;
        company_logo?: string;
    };
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { settings } = usePage<PageProps>().props;
    const companyName = settings?.company_name || 'Sistema de Ferretería';
    const companyLogo = settings?.company_logo;

    return (
        <div className="relative flex min-h-svh w-full overflow-hidden">
            {/* Fondo con gradiente animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
                {/* Formas decorativas animadas */}
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-pink-400/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-400/10 to-blue-400/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Contenido */}
            <div className="relative z-10 flex flex-1 items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md">
                    {/* Card único con todo el contenido */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="relative rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-8">
                            {/* Brillo superior */}
                            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

                            {/* Logo y nombre de la empresa dentro del card */}
                            <div className="flex flex-col items-center gap-4 mb-8">
                                <Link
                                    href={home()}
                                    className="group flex flex-col items-center gap-3 transition-transform hover:scale-105"
                                >
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 overflow-hidden transition-all group-hover:shadow-lg">
                                        {companyLogo ? (
                                            <img
                                                src={companyLogo}
                                                alt={companyName}
                                                className="h-full w-full object-contain p-2"
                                            />
                                        ) : (
                                            <AppLogoIcon className="size-10 fill-current text-blue-600" />
                                        )}
                                    </div>
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {companyName}
                                    </span>
                                </Link>

                                <div className="space-y-1 text-center">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {title}
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {description}
                                    </p>
                                </div>
                            </div>

                            {/* Formulario */}
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
