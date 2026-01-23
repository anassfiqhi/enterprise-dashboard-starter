import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import type { Order, ResponseEnvelope } from '@repo/shared';
import { config } from '@/lib/config';

/**
 * TanStack Query hook for orders (SPEC Section 8.1)
 * Query key is derived from Redux UI state:
 * ["orders", "list", { page, pageSize, search, status, sort }]
 */
export function useOrders() {
    const filters = useSelector((state: RootState) => state.ordersFilters);

    return useQuery({
        queryKey: ['orders', 'list', filters] as const,
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', String(filters.page));
            params.append('pageSize', String(filters.pageSize));
            if (filters.search) params.append('search', filters.search);
            if (filters.status) params.append('status', filters.status);
            if (filters.sort) params.append('sort', filters.sort);

            const response = await fetch(
                `${config.apiUrl}/api/v1/orders?${params.toString()}`,
                {
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to fetch orders');
            }

            const envelope: ResponseEnvelope<Order[]> = await response.json();

            if (envelope.error) {
                throw new Error(envelope.error.message);
            }

            // Return data with meta for pagination
            return {
                data: envelope.data || [],
                meta: envelope.meta,
            };
        },
    });
}
