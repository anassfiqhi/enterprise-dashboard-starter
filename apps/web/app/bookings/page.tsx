'use client';

import { useState } from 'react';
import { ReservationsToolbar } from '@/components/bookings/ReservationsToolbar';
import { ReservationsTable } from '@/components/bookings/ReservationsTable';
import { NewReservationDialog } from '@/components/bookings/NewReservationDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function BookingsPage() {
    const [newReservationOpen, setNewReservationOpen] = useState(false);

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="flex items-center justify-between px-4 lg:px-6">
                        <div>
                            <h1 className="text-2xl font-bold">Reservations</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage hotel and activity reservations
                            </p>
                        </div>
                        <Button onClick={() => setNewReservationOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Reservation
                        </Button>
                    </div>

                    {/* Toolbar with filters */}
                    <div className="px-4 lg:px-6">
                        <ReservationsToolbar />
                    </div>

                    {/* Reservations Table */}
                    <div className="px-4 lg:px-6">
                        <ReservationsTable />
                    </div>
                </div>
            </div>

            {/* New Reservation Dialog */}
            <NewReservationDialog
                open={newReservationOpen}
                onOpenChange={setNewReservationOpen}
            />
        </div>
    );
}
