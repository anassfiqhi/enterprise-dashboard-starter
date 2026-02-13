import { useQuery } from '@tanstack/react-query';
import type { Guest, Reservation, ResponseEnvelope } from '@repo/shared';
import { config } from '@/lib/config';

export interface GuestStats {
    totalReservations: number;
    confirmedReservations: number;
    cancelledReservations: number;
    totalSpent: number;
    averageSpent: number;
}

export interface GuestDetail extends Guest {
    reservations: Reservation[];
    stats: GuestStats;
}

/**
 * TanStack Query hook for single guest with reservation history
 */
export function useGuest(guestId: string | undefined) {
    return useQuery({
        queryKey: ['guest', guestId] as const,
        queryFn: async () => {
            if (!guestId) {
                throw new Error('Guest ID is required');
            }

            const response = await fetch(
                `${config.apiUrl}/api/v1/guests/${guestId}`,
                {
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to fetch guest');
            }

            const envelope: ResponseEnvelope<GuestDetail> = await response.json();

            if (envelope.error) {
                throw new Error(envelope.error.message);
            }

            return envelope.data!;
        },
        enabled: !!guestId,
    });
}
