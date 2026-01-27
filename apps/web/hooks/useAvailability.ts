import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import type { RoomAvailability, ActivitySlotAvailability, ResponseEnvelope } from '@repo/shared';
import { config } from '@/lib/config';

type AvailabilityData = RoomAvailability[] | ActivitySlotAvailability[];

/**
 * TanStack Query hook for availability data
 * Query key is derived from Redux UI state
 */
export function useAvailability() {
    const filters = useSelector((state: RootState) => state.availabilityFilters);

    return useQuery({
        queryKey: ['availability', filters] as const,
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.hotelId) params.append('hotelId', filters.hotelId);
            params.append('startDate', filters.startDate);
            params.append('endDate', filters.endDate);
            params.append('viewType', filters.viewType);

            const response = await fetch(
                `${config.apiUrl}/api/v1/availability?${params.toString()}`,
                {
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to fetch availability');
            }

            const envelope: ResponseEnvelope<AvailabilityData> = await response.json();

            if (envelope.error) {
                throw new Error(envelope.error.message);
            }

            return {
                data: envelope.data || [],
                meta: envelope.meta,
            };
        },
        enabled: !!filters.hotelId,
    });
}
