import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { authClient } from '@/lib/auth-client';
import type { RoomAvailability, ActivitySlotAvailability, ResponseEnvelope } from '@repo/shared';
import { config } from '@/lib/config';

type AvailabilityData = RoomAvailability[] | ActivitySlotAvailability[];

/**
 * TanStack Query hook for availability data
 * Automatically scopes to the current active hotel
 */
export function useAvailability() {
    const { viewType, startDate, endDate } = useSelector(
        (state: RootState) => state.filters.availability
    );
    const { data: activeOrg } = authClient.useActiveOrganization();
    const hotelId = activeOrg?.id;

    return useQuery({
        queryKey: ['availability', hotelId, { viewType, startDate, endDate }] as const,
        queryFn: async () => {
            if (!hotelId) throw new Error('No hotel selected');

            const params = new URLSearchParams();
            params.append('hotelId', hotelId);
            params.append('startDate', startDate);
            params.append('endDate', endDate);
            params.append('viewType', viewType);

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
        enabled: !!hotelId,
    });
}
