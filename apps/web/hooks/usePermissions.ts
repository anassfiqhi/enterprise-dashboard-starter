import { useMemo } from 'react';
import { authClient } from '@/lib/auth-client';
import { manager, staff } from '@repo/shared';
import type { OrganizationRole, OrganizationPermissions } from '@repo/shared';

/**
 * Hook to check organization-based permissions with Super Admin bypass
 * Super Admin users bypass all permission checks
 * 
 * Uses Better Auth hooks to fetch session and active member data
 */
export function usePermissions() {
  // Use Better Auth hooks
  const { data: session } = authClient.useSession();
  const { data: activeMember } = authClient.useActiveMember();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const user = session?.user ?? null;
  const isAdmin = user?.role === 'admin';

  // Get permissions based on active member role
  const permissions = useMemo((): OrganizationPermissions | null => {
    if (!activeMember) return null;

    switch (activeMember.role) {
      case 'manager':
        return manager.statements as OrganizationPermissions;
      case 'staff':
        return staff.statements as OrganizationPermissions;
      default:
        return null;
    }
  }, [activeMember?.role]);

  /**
   * Check if user has a specific permission for a resource
   * Super Admin always returns true
   * @param resource - The resource (e.g., 'guests', 'reservations')
   * @param action - The action (e.g., 'read', 'create', 'update', 'delete')
   */
  const can = (resource: keyof OrganizationPermissions, action: string): boolean => {
    // Super Admin bypasses all permission checks
    if (isAdmin) return true;

    if (!permissions) return false;
    const resourcePermissions = permissions[resource];
    if (!resourcePermissions) return false;
    return resourcePermissions.includes(action);
  };

  /**
   * Check if user has all specified permissions
   */
  const canAll = (checks: Array<{ resource: keyof OrganizationPermissions; action: string }>): boolean => {
    if (isAdmin) return true;
    return checks.every(({ resource, action }) => can(resource, action));
  };

  /**
   * Check if user has any of the specified permissions
   */
  const canAny = (checks: Array<{ resource: keyof OrganizationPermissions; action: string }>): boolean => {
    if (isAdmin) return true;
    return checks.some(({ resource, action }) => can(resource, action));
  };

  /**
   * Check if user has a specific role in the active organization
   */
  const hasRole = (requiredRole: OrganizationRole): boolean => {
    if (isAdmin) return true;
    return activeMember?.role === requiredRole;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (...roles: OrganizationRole[]): boolean => {
    if (isAdmin) return true;
    return activeMember?.role !== undefined && roles.includes(activeMember.role as OrganizationRole);
  };

  return {
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

    // Convenience helpers for common permission checks
    canManageHotel: can('hotel', 'update'),
    canManageRoomTypes: can('roomTypes', 'create'),
    canManageRooms: can('rooms', 'create'),
    canManageActivities: can('activityTypes', 'create'),
    canManageInventory: can('inventory', 'update'),
    canManagePricing: can('pricingRules', 'create'),
    canManagePromoCodes: can('promoCodes', 'create'),
    canManageGuests: can('guests', 'create'),
    canCreateReservations: can('reservations', 'create'),
    canCancelReservations: can('reservations', 'cancel'),
    canCheckInOut: can('reservations', 'checkin'),
    canViewAnalytics: can('analytics', 'read'),
    canViewAuditLogs: can('auditLogs', 'read'),
    canManageMembers: can('member', 'create'),
    canManageInvitations: can('invitation', 'create'),
  };
}
