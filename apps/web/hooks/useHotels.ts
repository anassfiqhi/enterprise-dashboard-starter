import { useQuery } from '@tanstack/react-query';
import type { Hotel, ResponseEnvelope } from '@repo/shared';
import { config } from '@/lib/config';

/**
 * TanStack Query hook for hotels list
 */
export function useHotels(search?: string) {
    return useQuery({
        queryKey: ['hotels', { search }] as const,
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);

            const response = await fetch(
                `${config.apiUrl}/api/v1/hotels?${params.toString()}`,
                {
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to fetch hotels');
            }

            const envelope: ResponseEnvelope<Hotel[]> = await response.json();

            if (envelope.error) {
                throw new Error(envelope.error.message);
            }

            return envelope.data || [];
        },
    });
}
