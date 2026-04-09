import { useMemo, useCallback } from 'react';
import { authClient } from '@/lib/auth-client';
import { managerRole, staffRole } from '@repo/shared';
import type { OrganizationRole, OrganizationPermissions } from '@repo/shared';

/**
 * Hook to check organization-based permissions with Super Admin bypass
 * Super Admin users bypass all permission checks
 * 
 * Uses Better Auth hooks to fetch session and active member data
 */
export function usePermissions() {
  // Use Better Auth hooks
  const { data: session, isPending: isSessionPending, error: sessionError } = authClient.useSession();
  const { data: activeMember, isPending: isActiveMemberPending, error: activeMemberError } = authClient.useActiveMember();
  const { data: activeOrganization, isPending: isActiveOrganizationPending, error: activeOrganizationError } = authClient.useActiveOrganization();

  const error = sessionError || activeMemberError || activeOrganizationError || null;

  const user = session?.user ?? null;
  const isAdmin = user?.role === 'admin';

  // Admin users are not org members — activeMember/activeOrg will always be null/pending
  // for them. Including those in isLoading causes the sidebar to repeatedly flash skeleton
  // whenever $activeOrgSignal fires (e.g. any /organization proxy action call).
  const isLoading = isSessionPending || (!isAdmin && (isActiveMemberPending || isActiveOrganizationPending));

  // Get permissions based on active member role
  const permissions = useMemo((): OrganizationPermissions | null => {
    if (!activeMember) return null;

    switch (activeMember.role) {
      case 'manager':
        return managerRole.statements as OrganizationPermissions;
      case 'staff':
        return staffRole.statements as OrganizationPermissions;
      default:
        return null;
    }
  }, [activeMember]);

  /**
   * Check if user has a specific permission for a resource
   * Super Admin always returns true
   * @param resource - The resource (e.g., 'guests', 'reservations')
   * @param action - The action (e.g., 'read', 'create', 'update', 'delete')
   */
  const can = useCallback((resource: keyof OrganizationPermissions, action: string): boolean => {
    if (isAdmin) return true;
    if (!permissions) return false;
    const resourcePermissions = permissions[resource];
    if (!resourcePermissions) return false;
    return resourcePermissions.includes(action);
  }, [isAdmin, permissions]);

  const canAll = useCallback((checks: Array<{ resource: keyof OrganizationPermissions; action: string }>): boolean => {
    if (isAdmin) return true;
    return checks.every(({ resource, action }) => can(resource, action));
  }, [isAdmin, can]);

  const canAny = useCallback((checks: Array<{ resource: keyof OrganizationPermissions; action: string }>): boolean => {
    if (isAdmin) return true;
    return checks.some(({ resource, action }) => can(resource, action));
  }, [isAdmin, can]);

  const hasRole = useCallback((requiredRole: OrganizationRole): boolean => {
    if (isAdmin) return true;
    return activeMember?.role === requiredRole;
  }, [isAdmin, activeMember]);

  const hasAnyRole = useCallback((...roles: OrganizationRole[]): boolean => {
    if (isAdmin) return true;
    return activeMember?.role !== undefined && roles.includes(activeMember.role as OrganizationRole);
  }, [isAdmin, activeMember]);

  return {
    isLoading,
    error,

    // User info
    user,
    isAdmin,

    // Organization context
    activeOrganization,
    activeMember,
    role: activeMember?.role ?? null,

    // Permission checking
    permissions,
    can,
    canAll,
    canAny,
    hasRole,
    hasAnyRole,
  };
}
