import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { typography, spacing } from '@/lib/design-system';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: {
        label: string;
        href: string;
        icon?: ReactNode;
    };
    children?: ReactNode;
    className?: string;
}

export default function PageHeader({
    title,
    subtitle,
    action,
    children,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4', className)}>
            <div>
                <h1 className={typography.pageTitle}>{title}</h1>
                {subtitle && <p className={cn(typography.pageSubtitle, 'mt-1')}>{subtitle}</p>}
            </div>

            {action && (
                <Link href={action.href}>
                    <Button>
                        {action.icon && <span className="mr-2">{action.icon}</span>}
                        {action.label}
                    </Button>
                </Link>
            )}

            {children}
        </div>
    );
}
