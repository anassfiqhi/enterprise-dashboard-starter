'use client';

import { useState } from 'react';
import type { Reservation, ReservationStatus } from '@repo/shared';
import {
    useCancelReservation,
    useRefundReservation,
    useUpdateReservationStatus,
} from '@/hooks/useReservationMutations';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface ReservationActionsProps {
    reservation: Reservation;
}

export function ReservationActions({ reservation }: ReservationActionsProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showRefundDialog, setShowRefundDialog] = useState(false);

    const updateStatus = useUpdateReservationStatus();
    const cancelReservation = useCancelReservation();
    const refundReservation = useRefundReservation();

    const handleConfirm = async () => {
        try {
            await updateStatus.mutateAsync({ id: reservation.id, status: 'CONFIRMED' });
            toast.success('Reservation confirmed');
        } catch (error) {
            toast.error('Failed to confirm reservation');
        }
    };

    const handleCancel = async () => {
        try {
            await cancelReservation.mutateAsync({ id: reservation.id });
            toast.success('Reservation cancelled');
            setShowCancelDialog(false);
        } catch (error) {
            toast.error('Failed to cancel reservation');
        }
    };

    const handleRefund = async () => {
        try {
            await refundReservation.mutateAsync({ id: reservation.id });
            toast.success('Refund processed');
            setShowRefundDialog(false);
        } catch (error) {
            toast.error('Failed to process refund');
        }
    };

    const isConfirmed = reservation.status === 'CONFIRMED';
    const isCancelled = reservation.status === 'CANCELLED';
    const isPending = reservation.status === 'PENDING';

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                        size="icon"
                    >
                        <MoreVertical />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    {isPending && (
                        <DropdownMenuItem onClick={handleConfirm}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm
                        </DropdownMenuItem>
                    )}
                    {!isCancelled && (
                        <DropdownMenuItem
                            onClick={() => setShowCancelDialog(true)}
                            className="text-red-600"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                        </DropdownMenuItem>
                    )}
                    {(isConfirmed || isCancelled) && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowRefundDialog(true)}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Refund
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this reservation for{' '}
                            {reservation.guest?.firstName} {reservation.guest?.lastName}? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Cancel Reservation
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Refund Confirmation Dialog */}
            <AlertDialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Process Refund</AlertDialogTitle>
                        <AlertDialogDescription>
                            Process a full refund of{' '}
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: reservation.currency,
                            }).format(reservation.priceTotal)}{' '}
                            for this reservation?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRefund}>
                            Process Refund
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
