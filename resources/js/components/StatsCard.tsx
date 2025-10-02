import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { typography, iconSizes } from '@/lib/design-system';

interface StatsCardProps {
    label: string;
    value: string | number;
    subValue?: string | number;
    icon?: ReactNode;
    iconColor?: string;
    valueColor?: string;
    className?: string;
}

export default function StatsCard({
    label,
    value,
    subValue,
    icon,
    iconColor = 'text-primary',
    valueColor,
    className,
}: StatsCardProps) {
    return (
        <Card className={className}>
            <CardContent className="py-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className={typography.statLabel}>{label}</p>
                        <p className={cn(typography.statValue, valueColor)}>{value}</p>
                        {subValue && (
                            <p className={typography.statSubValue}>{subValue}</p>
                        )}
                    </div>
                    {icon && (
                        <div className={cn(iconSizes.lg, iconColor, 'opacity-80')}>
                            {icon}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
