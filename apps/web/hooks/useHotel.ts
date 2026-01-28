import { useQuery } from '@tanstack/react-query';
import type { Hotel, RoomType, ActivityType, ResponseEnvelope } from '@repo/shared';
import { config } from '@/lib/config';

export interface HotelDetail extends Hotel {
    roomTypes: RoomType[];
    activityTypes: ActivityType[];
    totalRooms: number;
    totalActivities: number;
}

/**
 * TanStack Query hook for fetching a single hotel with room types and activities
 */
export function useHotel(hotelId: string | undefined) {
    return useQuery({
        queryKey: ['hotel', hotelId] as const,
        queryFn: async () => {
            if (!hotelId) throw new Error('Hotel ID is required');

            const response = await fetch(
                `${config.apiUrl}/api/v1/hotels/${hotelId}`,
                {
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to fetch hotel');
            }

            const envelope: ResponseEnvelope<HotelDetail> = await response.json();

            if (envelope.error) {
                throw new Error(envelope.error.message);
            }

            return envelope.data;
        },
        enabled: !!hotelId,
    });
}
