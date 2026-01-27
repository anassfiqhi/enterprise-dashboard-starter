'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import type { BookingMetrics } from '@repo/shared';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from '@/components/ui/chart';

interface BookingTrendsChartProps {
    data: BookingMetrics['bookingsByStatus'];
}

const chartConfig = {
    CONFIRMED: {
        label: 'Confirmed',
        color: 'hsl(142 76% 36%)', // green
    },
    PENDING: {
        label: 'Pending',
        color: 'hsl(48 96% 53%)', // yellow
    },
    CANCELLED: {
        label: 'Cancelled',
        color: 'hsl(0 84% 60%)', // red
    },
} satisfies ChartConfig;

const statusColors: Record<string, string> = {
    CONFIRMED: 'hsl(142 76% 36%)',
    PENDING: 'hsl(48 96% 53%)',
    CANCELLED: 'hsl(0 84% 60%)',
};

export function BookingTrendsChart({ data }: BookingTrendsChartProps) {
    const chartData = data.map((item) => ({
        status: item.status,
        count: item.count,
        label: chartConfig[item.status as keyof typeof chartConfig]?.label || item.status,
    }));

    return (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                layout="vertical"
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                    type="category"
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={100}
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            formatter={(value, name, item) => (
                                <span className="font-mono">{Number(value)} bookings</span>
                            )}
                        />
                    }
                />
                <Bar dataKey="count" radius={4}>
                    {chartData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={statusColors[entry.status] || 'hsl(var(--chart-1))'}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}
