'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useGuest } from '@/hooks/useGuest';
import { useGuestMutations } from '@/hooks/useGuestMutations';
import { GuestFormDialog } from '@/components/guests';
import { DeleteConfirmDialog } from '@/components/hotels';
import { ReservationStatusBadge } from '@/components/bookings/ReservationStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    TrendingUp,
    Hotel,
    Pencil,
    Trash2,
    ExternalLink,
    Globe,
    CreditCard,
    FileText,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

const ID_TYPE_LABELS: Record<string, string> = {
    passport: 'Passport',
    drivers_license: "Driver's License",
    national_id: 'National ID',
};

export default function GuestDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { data: guest, isLoading, error } = useGuest(id);
    const { deleteGuest } = useGuestMutations();

    const [formOpen, setFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDelete = async () => {
        await deleteGuest.mutateAsync(id);
        router.push('/guests');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 md:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
                <Skeleton className="h-[400px]" />
            </div>
        );
    }

    if (error || !guest) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
                <h2 className="text-lg font-semibold">Guest not found</h2>
                <p className="text-muted-foreground">
                    The guest you&apos;re looking for doesn&apos;t exist or has been deleted.
                </p>
                <Button asChild>
                    <Link href="/guests">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Guests
                    </Link>
                </Button>
            </div>
        );
    }

    const fullName = `${guest.firstName} ${guest.lastName}`;

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-4">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Back Button and Header */}
                    <div className="px-4 lg:px-6">
                        <Button variant="ghost" size="sm" asChild className="mb-4">
                            <Link href="/guests">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Guests
                            </Link>
                        </Button>

                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold flex items-center gap-3">
                                    <User className="h-6 w-6 text-muted-foreground" />
                                    {fullName}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    {guest.email && (
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="h-4 w-4" />
                                            {guest.email}
                                        </span>
                                    )}
                                    {guest.phone && (
                                        <span className="flex items-center gap-1.5">
                                            <Phone className="h-4 w-4" />
                                            {guest.phone}
                                        </span>
                                    )}
                                    {guest.nationality && (
                                        <span className="flex items-center gap-1.5">
                                            <Globe className="h-4 w-4" />
                                            {guest.nationality}
                                        </span>
                                    )}
                                </div>
                                {guest.idType && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        <Badge variant="secondary">
                                            {ID_TYPE_LABELS[guest.idType] || guest.idType}
                                        </Badge>
                                        {guest.idNumber && (
                                            <span className="text-muted-foreground font-mono">
                                                {guest.idNumber}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setFormOpen(true)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="px-4 lg:px-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{guest.stats.totalReservations}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {guest.stats.confirmedReservations} confirmed
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(guest.stats.totalSpent)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Lifetime value</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Average Spend</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(guest.stats.averageSpent)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Per reservation</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
                                    <Hotel className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {guest.stats.totalReservations > 0
                                            ? Math.round(
                                                  (guest.stats.cancelledReservations /
                                                      guest.stats.totalReservations) *
                                                      100
                                              )
                                            : 0}
                                        %
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {guest.stats.cancelledReservations} cancelled
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Notes Section */}
                    {guest.notes && (
                        <div className="px-4 lg:px-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {guest.notes}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Reservation History */}
                    <div className="px-4 lg:px-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reservation History</CardTitle>
                                <CardDescription>
                                    All reservations made by this guest
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {guest.reservations.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No reservations found for this guest
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Reservation ID</TableHead>
                                                <TableHead>Hotel</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {guest.reservations.map((reservation) => (
                                                <TableRow key={reservation.id}>
                                                    <TableCell className="font-mono text-sm">
                                                        {reservation.id}
                                                    </TableCell>
                                                    <TableCell>{reservation.hotelName}</TableCell>
                                                    <TableCell>
                                                        {reservation.roomTypeName ? (
                                                            <Badge variant="secondary">
                                                                {reservation.roomTypeName}
                                                            </Badge>
                                                        ) : reservation.activityTypeName ? (
                                                            <Badge variant="outline">
                                                                {reservation.activityTypeName}
                                                            </Badge>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {reservation.checkInDate ? (
                                                            <span>
                                                                {formatDate(reservation.checkInDate)}
                                                                {reservation.checkOutDate && (
                                                                    <>
                                                                        {' - '}
                                                                        {formatDate(reservation.checkOutDate)}
                                                                    </>
                                                                )}
                                                            </span>
                                                        ) : reservation.slotStart ? (
                                                            formatDate(reservation.slotStart)
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <ReservationStatusBadge status={reservation.status} />
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(reservation.priceTotal)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/bookings?search=${reservation.id}`}>
                                                                <ExternalLink className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Guest Form Dialog */}
            <GuestFormDialog open={formOpen} onOpenChange={setFormOpen} guest={guest} />

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Guest"
                description={`Are you sure you want to delete "${fullName}"? Guests with existing reservations cannot be deleted.`}
                onConfirm={handleDelete}
                isPending={deleteGuest.isPending}
            />
        </div>
    );
}
