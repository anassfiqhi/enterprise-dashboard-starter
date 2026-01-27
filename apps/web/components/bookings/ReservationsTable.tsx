'use client';

import { useState } from 'react';
import type { Reservation } from '@repo/shared';
import { useReservations } from '@/hooks/useReservations';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { setPage } from '@/lib/features/ui/reservationsFiltersSlice';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ReservationStatusBadge } from './ReservationStatusBadge';
import { ReservationActions } from './ReservationActions';
import { ReservationDetailSheet } from './ReservationDetailSheet';
import { ChevronLeft, ChevronRight, Calendar, Users, Building2 } from 'lucide-react';

function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

export function ReservationsTable() {
    const dispatch = useDispatch();
    const { page, pageSize } = useSelector((state: RootState) => state.reservationsFilters);
    const { data, isLoading, isError, error } = useReservations();
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

    if (isError) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                Error loading reservations: {error?.message || 'Unknown error'}
            </div>
        );
    }

    const reservations = data?.data || [];
    const meta = data?.meta;
    const totalPages = meta?.totalPages || 1;
    const total = meta?.total || 0;

    return (
        <>
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">ID</TableHead>
                            <TableHead>Guest</TableHead>
                            <TableHead>Property / Room</TableHead>
                            <TableHead>Check-in</TableHead>
                            <TableHead>Check-out</TableHead>
                            <TableHead className="text-center">Guests</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: pageSize }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                                </TableRow>
                            ))
                        ) : reservations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    No reservations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reservations.map((reservation) => (
                                <TableRow
                                    key={reservation.id}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedReservation(reservation)}
                                >
                                    <TableCell className="font-mono text-sm">
                                        {reservation.id}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {reservation.guest?.firstName} {reservation.guest?.lastName}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {reservation.guest?.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="flex items-center gap-1.5">
                                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                {reservation.hotelName}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {reservation.roomTypeName || reservation.activityTypeName || '-'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                            {formatDate(reservation.checkInDate || reservation.slotStart)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(reservation.checkOutDate || reservation.slotEnd)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="flex items-center justify-center gap-1">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                            {reservation.guests}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(reservation.priceTotal, reservation.currency)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <ReservationStatusBadge status={reservation.status} />
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <ReservationActions reservation={reservation} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                    Showing {reservations.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
                    {Math.min(page * pageSize, total)} of {total} reservations
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dispatch(setPage(page - 1))}
                        disabled={page <= 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dispatch(setPage(page + 1))}
                        disabled={page >= totalPages || isLoading}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Detail Sheet */}
            <ReservationDetailSheet
                reservation={selectedReservation}
                open={!!selectedReservation}
                onOpenChange={(open) => !open && setSelectedReservation(null)}
            />
        </>
    );
}
