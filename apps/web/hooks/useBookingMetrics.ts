import { useQuery } from '@tanstack/react-query';
import type { BookingMetrics, ResponseEnvelope } from '@repo/shared';
import { config } from '@/lib/config';

/**
 * TanStack Query hook for booking metrics
 */
export function useBookingMetrics() {
    return useQuery({
        queryKey: ['booking-metrics'] as const,
        queryFn: async () => {
            const response = await fetch(
                `${config.apiUrl}/api/v1/booking-metrics`,
                {
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to fetch booking metrics');
            }

            const envelope: ResponseEnvelope<BookingMetrics> = await response.json();

            if (envelope.error) {
                throw new Error(envelope.error.message);
            }

            return envelope.data;
        },
    });
}
