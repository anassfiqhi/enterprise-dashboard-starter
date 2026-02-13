import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { Guest, ResponseEnvelope } from '@repo/shared';
import type { RootState } from '@/lib/store';
import { config } from '@/lib/config';

export interface GuestWithStats extends Guest {
    reservationCount: number;
    totalSpent: number;
    lastStay?: string;
}

interface GuestListResponse {
    data: GuestWithStats[];
    meta: {
        requestId: string;
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}

export interface GuestsFilters {
    search?: string;
    page?: number;
    pageSize?: number;
}

/**
 * TanStack Query hook for guests list with search and pagination
 * Automatically scopes to the current active hotel
 */
export function useGuests(filters: GuestsFilters = {}) {
    const { search = '', page = 1, pageSize = 20 } = filters;
    const hotelId = useSelector((state: RootState) => state.session.activeHotel?.id);

    return useQuery({
        queryKey: ['guests', hotelId, { search, page, pageSize }] as const,
        queryFn: async () => {
            if (!hotelId) throw new Error('No hotel selected');

            const params = new URLSearchParams();
            params.append('hotelId', hotelId);
            params.append('page', String(page));
            params.append('pageSize', String(pageSize));
            if (search) params.append('search', search);

            const response = await fetch(
                `${config.apiUrl}/api/v1/guests?${params.toString()}`,
                {
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to fetch guests');
            }

            const envelope: GuestListResponse = await response.json();

            if ((envelope as any).error) {
                throw new Error((envelope as any).error.message);
            }

            return {
                data: envelope.data || [],
                meta: envelope.meta,
            };
        },
        enabled: !!hotelId,
    });
}
