import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import type { Metrics, ResponseEnvelope } from '@repo/shared';
import { config } from '@/lib/config';

/**
 * TanStack Query hook for dashboard metrics
 * Automatically scopes to the current active hotel
 */
export function useMetrics() {
    const { data: activeOrg } = authClient.useActiveOrganization();
    const hotelId = activeOrg?.id;

    return useQuery({
        queryKey: ['metrics', hotelId] as const,
        queryFn: async () => {
            if (!hotelId) throw new Error('No hotel selected');

            const params = new URLSearchParams();
            params.append('hotelId', hotelId);

            const response = await fetch(`${config.apiUrl}/api/v1/metrics?${params.toString()}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to fetch metrics');
            }

            const envelope: ResponseEnvelope<Metrics> = await response.json();

            if (envelope.error) {
                throw new Error(envelope.error.message);
            }

            return envelope.data;
        },
        enabled: !!hotelId,
    });
}
