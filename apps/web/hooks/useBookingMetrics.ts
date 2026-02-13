import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { BookingMetrics, ResponseEnvelope } from '@repo/shared';
import type { RootState } from '@/lib/store';
import { config } from '@/lib/config';

/**
 * TanStack Query hook for booking metrics
 * Automatically scopes to the current active hotel
 */
export function useBookingMetrics() {
    const hotelId = useSelector((state: RootState) => state.session.activeHotel?.id);

    return useQuery({
        queryKey: ['booking-metrics', hotelId] as const,
        queryFn: async () => {
            if (!hotelId) throw new Error('No hotel selected');

            const params = new URLSearchParams();
            params.append('hotelId', hotelId);

            const response = await fetch(
                `${config.apiUrl}/api/v1/booking-metrics?${params.toString()}`,
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
        enabled: !!hotelId,
    });
}
