import { useQuery } from '@tanstack/react-query';
import type { Metrics, ResponseEnvelope } from '@repo/shared';
import { config } from '@/lib/config';

/**
 * TanStack Query hook for dashboard metrics (SPEC Phase 3)
 * Query key: ["metrics"]
 */
export function useMetrics() {
    return useQuery({
        queryKey: ['metrics'] as const,
        queryFn: async () => {
            const response = await fetch(`${config.apiUrl}/api/v1/metrics`, {
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
    });
}
