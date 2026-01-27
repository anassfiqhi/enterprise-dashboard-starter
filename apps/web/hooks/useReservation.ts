import { useQuery } from '@tanstack/react-query';
import type { Reservation, Payment, ResponseEnvelope } from '@repo/shared';
import { config } from '@/lib/config';

interface ReservationWithPayments extends Reservation {
    payments?: Payment[];
}

/**
 * TanStack Query hook for single reservation
 */
export function useReservation(id: string | null) {
    return useQuery({
        queryKey: ['reservations', 'detail', id] as const,
        queryFn: async () => {
            if (!id) throw new Error('Reservation ID is required');

            const response = await fetch(
                `${config.apiUrl}/api/v1/reservations/${id}`,
                {
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to fetch reservation');
            }

            const envelope: ResponseEnvelope<ReservationWithPayments> = await response.json();

            if (envelope.error) {
                throw new Error(envelope.error.message);
            }

            return envelope.data;
        },
        enabled: !!id,
    });
}
