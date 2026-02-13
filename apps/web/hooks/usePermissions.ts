import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import type { OrganizationRole, OrganizationPermissions } from '@repo/shared';

/**
 * Hook to check hotel-based permissions with Super Admin bypass
 * Super Admin users bypass all permission checks
 */
export function usePermissions() {
  const user = useSelector((state: RootState) => state.session.user);
  const permissions = useSelector((state: RootState) => state.session.permissions);
  const activeMember = useSelector((state: RootState) => state.session.activeMember);
  const activeHotel = useSelector((state: RootState) => state.session.activeHotel);

  const isSuperAdmin = user?.isSuperAdmin ?? false;

  /**
   * Check if user has a specific permission for a resource
   * Super Admin always returns true
   * @param resource - The resource (e.g., 'guests', 'reservations')
   * @param action - The action (e.g., 'read', 'create', 'update', 'delete')
   */
  const can = (resource: keyof OrganizationPermissions, action: string): boolean => {
    // Super Admin bypasses all permission checks
    if (isSuperAdmin) return true;

    if (!permissions) return false;
    const resourcePermissions = permissions[resource];
    if (!resourcePermissions) return false;
    return resourcePermissions.includes(action);
  };

  /**
   * Check if user has all specified permissions
   */
  const canAll = (checks: Array<{ resource: keyof OrganizationPermissions; action: string }>): boolean => {
    if (isSuperAdmin) return true;
    return checks.every(({ resource, action }) => can(resource, action));
  };

  /**
   * Check if user has any of the specified permissions
   */
  const canAny = (checks: Array<{ resource: keyof OrganizationPermissions; action: string }>): boolean => {
    if (isSuperAdmin) return true;
    return checks.some(({ resource, action }) => can(resource, action));
  };

  /**
   * Check if user has a specific role in the active hotel
   */
  const hasRole = (requiredRole: OrganizationRole): boolean => {
    if (isSuperAdmin) return true;
    return activeMember?.role === requiredRole;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (...roles: OrganizationRole[]): boolean => {
    if (isSuperAdmin) return true;
    return activeMember?.role !== undefined && roles.includes(activeMember.role);
  };

  return {
    // User info
    user,
    isSuperAdmin,

    // Hotel context
    activeHotel,
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
