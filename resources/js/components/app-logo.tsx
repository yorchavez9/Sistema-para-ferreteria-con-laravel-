import AppLogoIcon from './app-logo-icon';
import { usePage } from '@inertiajs/react';

interface PageProps {
    settings: {
        company_name?: string;
        company_logo?: string;
    };
}

export default function AppLogo() {
    const { settings } = usePage<PageProps>().props;
    const companyName = settings?.company_name || 'Laravel Starter Kit';
    const companyLogo = settings?.company_logo;
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-md overflow-hidden">
                {companyLogo ? (
                    <img
                        src={companyLogo}
                        alt={companyName}
                        className="size-full object-contain"
                        onError={(e) => {
                            console.error('Error loading logo:', companyLogo);
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="flex aspect-square size-10 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
                        <AppLogoIcon className="size-6 fill-current text-white dark:text-black" />
                    </div>
                )}
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {companyName}
                </span>
            </div>
        </>
    );
}
