import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import type { Reservation, ResponseEnvelope } from '@repo/shared';
import { config } from '@/lib/config';

/**
 * TanStack Query hook for reservations
 * Query key is derived from Redux UI state
 */
export function useReservations() {
    const filters = useSelector((state: RootState) => state.reservationsFilters);

    return useQuery({
        queryKey: ['reservations', 'list', filters] as const,
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', String(filters.page));
            params.append('pageSize', String(filters.pageSize));
            if (filters.search) params.append('search', filters.search);
            if (filters.status) params.append('status', filters.status);
            if (filters.hotelId) params.append('hotelId', filters.hotelId);
            if (filters.checkInFrom) params.append('checkInFrom', filters.checkInFrom);
            if (filters.checkInTo) params.append('checkInTo', filters.checkInTo);
            if (filters.sort) params.append('sort', filters.sort);

            const response = await fetch(
                `${config.apiUrl}/api/v1/reservations?${params.toString()}`,
                {
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to fetch reservations');
            }

            const envelope: ResponseEnvelope<Reservation[]> = await response.json();

            if (envelope.error) {
                throw new Error(envelope.error.message);
            }

            return {
                data: envelope.data || [],
                meta: envelope.meta,
            };
        },
    });
}
