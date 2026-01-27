'use client';

import { ReservationsToolbar } from '@/components/bookings/ReservationsToolbar';
import { ReservationsTable } from '@/components/bookings/ReservationsTable';

export const dynamic = 'force-dynamic';

export default function BookingsPage() {
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
        </div>
    );
}
