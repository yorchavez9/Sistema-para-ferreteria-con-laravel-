import {
    AreaChart as RechartsAreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface AreaChartProps {
    data: Array<{
        name: string;
        [key: string]: string | number;
    }>;
    dataKeys: Array<{
        key: string;
        name: string;
        color?: string;
    }>;
    title?: string;
    height?: number;
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AreaChart({ data, dataKeys, title, height = 300 }: AreaChartProps) {
    return (
        <div className="w-full">
            {title && <h3 className="font-semibold text-lg mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height={height}>
                <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                        {dataKeys.map((item, index) => {
                            const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                            return (
                                <linearGradient key={item.key} id={`color${item.key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            );
                        })}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        stroke="hsl(var(--border))"
                    />
                    <YAxis
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        stroke="hsl(var(--border))"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem',
                            color: 'hsl(var(--foreground))',
                        }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '14px' }}
                        iconType="circle"
                    />
                    {dataKeys.map((item, index) => {
                        const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                        return (
                            <Area
                                key={item.key}
                                type="monotone"
                                dataKey={item.key}
                                name={item.name}
                                stroke={color}
                                strokeWidth={2}
                                fill={`url(#color${item.key})`}
                            />
                        );
                    })}
                </RechartsAreaChart>
            </ResponsiveContainer>
        </div>
    );
}
