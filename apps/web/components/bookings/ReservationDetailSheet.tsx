'use client';

import type { Reservation } from '@repo/shared';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ReservationStatusBadge } from './ReservationStatusBadge';
import { ReservationActions } from './ReservationActions';
import {
    User,
    Mail,
    Phone,
    Building2,
    Bed,
    Calendar,
    Users,
    CreditCard,
    Clock,
} from 'lucide-react';

interface ReservationDetailSheetProps {
    reservation: Reservation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatDateTime(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

function DetailRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}

export function ReservationDetailSheet({
    reservation,
    open,
    onOpenChange,
}: ReservationDetailSheetProps) {
    if (!reservation) return null;

    const isRoomBooking = !!reservation.roomTypeId;
    const nights = reservation.priceDetails.nights?.length || 0;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <div className="flex items-center justify-between pr-8">
                        <div>
                            <SheetTitle className="font-mono">{reservation.id}</SheetTitle>
                            <SheetDescription>
                                Created {formatDateTime(reservation.createdAt)}
                            </SheetDescription>
                        </div>
                        <ReservationStatusBadge status={reservation.status} />
                    </div>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Guest Information */}
                    <section>
                        <h3 className="text-sm font-semibold mb-3">Guest Information</h3>
                        <div className="space-y-3">
                            <DetailRow
                                icon={User}
                                label="Name"
                                value={`${reservation.guest?.firstName} ${reservation.guest?.lastName}`}
                            />
                            <DetailRow
                                icon={Mail}
                                label="Email"
                                value={reservation.guest?.email || '-'}
                            />
                            <DetailRow
                                icon={Phone}
                                label="Phone"
                                value={reservation.guest?.phone || '-'}
                            />
                        </div>
                    </section>

                    <Separator />

                    {/* Property & Booking Details */}
                    <section>
                        <h3 className="text-sm font-semibold mb-3">Booking Details</h3>
                        <div className="space-y-3">
                            <DetailRow
                                icon={Building2}
                                label="Property"
                                value={reservation.hotelName || '-'}
                            />
                            <DetailRow
                                icon={Bed}
                                label={isRoomBooking ? 'Room Type' : 'Activity'}
                                value={reservation.roomTypeName || reservation.activityTypeName || '-'}
                            />
                            <DetailRow
                                icon={Calendar}
                                label={isRoomBooking ? 'Check-in' : 'Start Time'}
                                value={formatDate(reservation.checkInDate || reservation.slotStart)}
                            />
                            <DetailRow
                                icon={Calendar}
                                label={isRoomBooking ? 'Check-out' : 'End Time'}
                                value={formatDate(reservation.checkOutDate || reservation.slotEnd)}
                            />
                            {isRoomBooking && nights > 0 && (
                                <DetailRow
                                    icon={Clock}
                                    label="Duration"
                                    value={`${nights} night${nights !== 1 ? 's' : ''}`}
                                />
                            )}
                            <DetailRow
                                icon={Users}
                                label="Guests"
                                value={reservation.guests}
                            />
                        </div>
                    </section>

                    <Separator />

                    {/* Pricing Breakdown */}
                    <section>
                        <h3 className="text-sm font-semibold mb-3">Price Breakdown</h3>
                        <div className="space-y-2 text-sm">
                            {reservation.priceDetails.nights && reservation.priceDetails.nights.length > 0 && (
                                <div className="space-y-1 mb-3">
                                    {reservation.priceDetails.nights.map((night) => (
                                        <div key={night.date} className="flex justify-between text-muted-foreground">
                                            <span>{formatDate(night.date)}</span>
                                            <span>{formatCurrency(night.rate, reservation.currency)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatCurrency(reservation.priceDetails.subtotal, reservation.currency)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Taxes</span>
                                <span>{formatCurrency(reservation.priceDetails.taxes, reservation.currency)}</span>
                            </div>
                            {reservation.priceDetails.fees > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Fees</span>
                                    <span>{formatCurrency(reservation.priceDetails.fees, reservation.currency)}</span>
                                </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(reservation.priceTotal, reservation.currency)}</span>
                            </div>
                        </div>
                    </section>

                    <Separator />

                    {/* Channel & Timestamps */}
                    <section>
                        <h3 className="text-sm font-semibold mb-3">Additional Info</h3>
                        <div className="space-y-3">
                            <DetailRow
                                icon={CreditCard}
                                label="Booking Channel"
                                value={
                                    <span className="capitalize">
                                        {reservation.channel.toLowerCase().replace('_', ' ')}
                                    </span>
                                }
                            />
                            {reservation.updatedAt && (
                                <DetailRow
                                    icon={Clock}
                                    label="Last Updated"
                                    value={formatDateTime(reservation.updatedAt)}
                                />
                            )}
                            {reservation.cancelledAt && (
                                <DetailRow
                                    icon={Clock}
                                    label="Cancelled At"
                                    value={formatDateTime(reservation.cancelledAt)}
                                />
                            )}
                        </div>
                    </section>

                    {/* Special Requests */}
                    {reservation.specialRequests && (
                        <>
                            <Separator />
                            <section>
                                <h3 className="text-sm font-semibold mb-2">Special Requests</h3>
                                <p className="text-sm text-muted-foreground">
                                    {reservation.specialRequests}
                                </p>
                            </section>
                        </>
                    )}

                    {/* Actions */}
                    <Separator />
                    <div className="flex justify-end">
                        <ReservationActions reservation={reservation} />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
