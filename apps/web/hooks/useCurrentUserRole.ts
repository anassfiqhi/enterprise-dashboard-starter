import { authClient } from '@/lib/auth-client';

/**
 * Hook to get the current user's role
 * Returns 'super_admin' if user is a super admin
 * Returns the organization role ('admin' | 'staff') if user has an active member
 * Returns null if user is not authenticated or has no active member
 */
export function useCurrentUserRole(): 'super_admin' | 'admin' | 'staff' | null {
    const { data: session } = authClient.useSession();
    const { data: activeMember } = authClient.useActiveMember();

    const user = session?.user;

    if (user?.isAdmin) return 'super_admin';
    return (activeMember?.role as 'admin' | 'staff' | null) ?? null;
}
