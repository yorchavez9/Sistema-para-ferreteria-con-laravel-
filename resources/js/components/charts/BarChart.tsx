import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
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

export default function BarChart({ data, dataKeys, title, height = 300 }: BarChartProps) {
    return (
        <div className="w-full">
            {title && <h3 className="font-semibold text-lg mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height={height}>
                <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '14px' }}
                        iconType="circle"
                    />
                    {dataKeys.map((item, index) => (
                        <Bar
                            key={item.key}
                            dataKey={item.key}
                            name={item.name}
                            fill={item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                            radius={[4, 4, 0, 0]}
                        />
                    ))}
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
}
