'use client';

import type { BookingMetrics } from '@repo/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Calendar, Percent, TrendingUp } from 'lucide-react';

interface BookingMetricsCardsProps {
  metrics: BookingMetrics | null | undefined;
  isLoading: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BookingMetricsCards({ metrics, isLoading }: BookingMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-1 h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cardDefs = [
    { title: 'Total Revenue', icon: DollarSign },
    { title: 'Total Bookings', icon: Calendar },
    { title: 'Average Occupancy', icon: Percent },
    { title: 'Average Daily Rate', icon: TrendingUp },
  ];

  if (!metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cardDefs.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-2xl font-bold">—</div>
              <p className="text-muted-foreground text-xs">No data available</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      description: `${metrics.confirmedBookings} confirmed bookings`,
      icon: DollarSign,
    },
    {
      title: 'Total Bookings',
      value: metrics.totalBookings.toString(),
      description: `${metrics.pendingBookings} pending, ${metrics.cancelledBookings} cancelled`,
      icon: Calendar,
    },
    {
      title: 'Average Occupancy',
      value: `${metrics.averageOccupancy.toFixed(1)}%`,
      description: 'Past 30 days',
      icon: Percent,
    },
    {
      title: 'Average Daily Rate',
      value: formatCurrency(metrics.averageDailyRate),
      description: 'Per room night',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-muted-foreground text-xs">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
