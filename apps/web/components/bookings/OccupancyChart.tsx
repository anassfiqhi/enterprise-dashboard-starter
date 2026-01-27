'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts';
import type { BookingMetrics } from '@repo/shared';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';

interface OccupancyChartProps {
    data: BookingMetrics['occupancyByDay'];
}

const chartConfig = {
    occupancy: {
        label: 'Occupancy',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig;

export function OccupancyChart({ data }: OccupancyChartProps) {
    const chartData = data.map((item) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        occupancy: item.occupancy,
    }));

    const averageOccupancy = data.reduce((sum, d) => sum + d.occupancy, 0) / data.length;

    return (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            formatter={(value) => (
                                <span className="font-mono">{Number(value).toFixed(1)}%</span>
                            )}
                        />
                    }
                />
                <ReferenceLine
                    y={averageOccupancy}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    label={{
                        value: `Avg: ${averageOccupancy.toFixed(1)}%`,
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 12,
                        position: 'right',
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="occupancy"
                    stroke="var(--color-occupancy)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                />
            </LineChart>
        </ChartContainer>
    );
}
