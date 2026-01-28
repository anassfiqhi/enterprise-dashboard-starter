'use client';

import { useState } from 'react';
import type { Reservation } from '@repo/shared';
import { useBookingMetrics } from '@/hooks/useBookingMetrics';
import { useReservations } from '@/hooks/useReservations';
import { BookingMetricsCards } from '@/components/bookings/BookingMetricsCards';
import { RevenueChart } from '@/components/bookings/RevenueChart';
import { OccupancyChart } from '@/components/bookings/OccupancyChart';
import { BookingTrendsChart } from '@/components/bookings/BookingTrendsChart';
import { ReservationStatusBadge } from '@/components/bookings/ReservationStatusBadge';
import { ReservationDetailSheet } from '@/components/bookings/ReservationDetailSheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Calendar, Building2, CalendarDays, BarChart3 } from 'lucide-react';

function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

function formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function Home() {
    const { data: metrics, isLoading: metricsLoading } = useBookingMetrics();
    const { data: reservationsData, isLoading: reservationsLoading } = useReservations();
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

    const recentReservations = reservationsData?.data?.slice(0, 5) || [];

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Page Header */}
                    <div className="flex items-center justify-between px-4 lg:px-6">
                        <div>
                            <h1 className="text-2xl font-bold">Dashboard</h1>
                            <p className="text-sm text-muted-foreground">
                                Booking engine overview and key metrics
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/bookings/availability">
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    Availability
                                </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/bookings/analytics">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Analytics
                                </Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/bookings">
                                    View All Bookings
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Metrics Cards */}
                    <div className="px-4 lg:px-6">
                        <BookingMetricsCards metrics={metrics} isLoading={metricsLoading} />
                    </div>

                    {/* Revenue & Occupancy Charts - 2 Column */}
                    <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Trend</CardTitle>
                                <CardDescription>
                                    Daily revenue over the past 30 days
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {metricsLoading ? (
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
                        <Card>
                            <CardHeader>
                                <CardTitle>Occupancy Rate</CardTitle>
                                <CardDescription>
                                    Room occupancy percentage over the past 30 days
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {metricsLoading ? (
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
                    </div>

                    {/* Booking Trends */}
                    <div className="px-4 lg:px-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Bookings by Status</CardTitle>
                                <CardDescription>
                                    Distribution of bookings across different statuses
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {metricsLoading ? (
                                    <Skeleton className="h-[200px] w-full" />
                                ) : metrics?.bookingsByStatus ? (
                                    <BookingTrendsChart data={metrics.bookingsByStatus} />
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                                        No booking status data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Reservations */}
                    <div className="px-4 lg:px-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Recent Reservations</CardTitle>
                                    <CardDescription>
                                        Latest booking activity
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/bookings">
                                        View all
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Guest</TableHead>
                                            <TableHead>Property</TableHead>
                                            <TableHead>Check-in</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reservationsLoading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                                    <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : recentReservations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                    No reservations found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            recentReservations.map((reservation) => (
                                                <TableRow
                                                    key={reservation.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => setSelectedReservation(reservation)}
                                                >
                                                    <TableCell>
                                                        <span className="font-medium">
                                                            {reservation.guest?.firstName} {reservation.guest?.lastName}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="flex items-center gap-1.5">
                                                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {reservation.hotelName}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {formatDate(reservation.checkInDate || reservation.slotStart)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(reservation.priceTotal, reservation.currency)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <ReservationStatusBadge status={reservation.status} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Reservation Detail Sheet */}
            <ReservationDetailSheet
                reservation={selectedReservation}
                open={!!selectedReservation}
                onOpenChange={(open) => !open && setSelectedReservation(null)}
            />
        </div>
    );
}
