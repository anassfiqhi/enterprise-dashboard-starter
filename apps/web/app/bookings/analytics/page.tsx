'use client';

import { useBookingMetrics } from '@/hooks/useBookingMetrics';
import { BookingMetricsCards } from '@/components/bookings/BookingMetricsCards';
import { RevenueChart } from '@/components/bookings/RevenueChart';
import { OccupancyChart } from '@/components/bookings/OccupancyChart';
import { BookingTrendsChart } from '@/components/bookings/BookingTrendsChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

export default function BookingAnalyticsPage() {
    const { data: metrics, isLoading, isError, error } = useBookingMetrics();

    if (isError) {
        return (
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 items-center justify-center">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        Error loading analytics: {error?.message || 'Unknown error'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="flex items-center justify-between px-4 lg:px-6">
                        <div>
                            <h1 className="text-2xl font-bold">Booking Analytics</h1>
                            <p className="text-sm text-muted-foreground">
                                Revenue, occupancy, and booking trends
                            </p>
                        </div>
                    </div>

                    {/* Metrics Cards */}
                    <div className="px-4 lg:px-6">
                        <BookingMetricsCards metrics={metrics} isLoading={isLoading} />
                    </div>

                    {/* Charts Section */}
                    <div className="px-4 lg:px-6">
                        <Tabs defaultValue="revenue" className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                                <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
                                <TabsTrigger value="trends">Booking Trends</TabsTrigger>
                            </TabsList>

                            <TabsContent value="revenue">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Revenue Trend</CardTitle>
                                        <CardDescription>
                                            Daily revenue from confirmed bookings over the past 30 days
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <Skeleton className="h-[300px] w-full" />
                                        ) : metrics?.revenueByDay ? (
                                            <RevenueChart data={metrics.revenueByDay} />
                                        ) : (
                                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                                No revenue data available
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="occupancy">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Occupancy Rate</CardTitle>
                                        <CardDescription>
                                            Room occupancy percentage over the past 30 days
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <Skeleton className="h-[300px] w-full" />
                                        ) : metrics?.occupancyByDay ? (
                                            <OccupancyChart data={metrics.occupancyByDay} />
                                        ) : (
                                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                                No occupancy data available
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="trends">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Bookings by Status</CardTitle>
                                        <CardDescription>
                                            Distribution of bookings across different statuses
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <Skeleton className="h-[300px] w-full" />
                                        ) : metrics?.bookingsByStatus ? (
                                            <BookingTrendsChart data={metrics.bookingsByStatus} />
                                        ) : (
                                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                                No booking status data available
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
