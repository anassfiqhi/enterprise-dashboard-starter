import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setSession, setLoading, clearSession, MutableOrganizationPermissions } from '@/lib/features/ui/sessionSlice';
import { config } from '@/lib/config';
import type { SessionData, ResponseEnvelope } from '@repo/shared';

/**
 * Convert readonly permissions to mutable for Redux
 */
function toMutablePermissions(permissions: SessionData['permissions']): MutableOrganizationPermissions | null {
  if (!permissions) return null;

  return {
    organization: permissions.organization ? [...permissions.organization] : undefined,
    member: permissions.member ? [...permissions.member] : undefined,
    invitation: permissions.invitation ? [...permissions.invitation] : undefined,
    orders: permissions.orders ? [...permissions.orders] : undefined,
    metrics: permissions.metrics ? [...permissions.metrics] : undefined,
  };
}

/**
 * Hook to fetch current session with organization context
 * (SPEC Section 5.2 - organization-based permissions snapshot)
 */
export function useSession() {
  const dispatch = useDispatch();

  const query = useQuery({
    queryKey: ['session'] as const,
    queryFn: async () => {
      const response = await fetch(`${config.apiUrl}/api/v1/session`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated - this is expected on login page
          return null;
        }
        const errorData: ResponseEnvelope<null> = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch session');
      }

      const envelope: ResponseEnvelope<SessionData> = await response.json();

      if (envelope.error) {
        throw new Error(envelope.error.message);
      }

      return envelope.data;
    },
    retry: false, // Don't retry on 401
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sync query data to Redux
  useEffect(() => {
    dispatch(setLoading(query.isLoading));

    if (query.data) {
      dispatch(setSession({
        user: {
          id: query.data.user.id,
          email: query.data.user.email,
          name: query.data.user.name || 'User',
        },
        organization: query.data.organization,
        role: query.data.role,
        permissions: toMutablePermissions(query.data.permissions),
      }));
    } else if (query.isError || query.data === null) {
      // Clear session if error or not authenticated
      dispatch(clearSession());
    }
  }, [query.data, query.isLoading, query.isError, dispatch]);

  return query;
}
