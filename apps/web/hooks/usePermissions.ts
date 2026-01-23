import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import type { OrganizationRole } from '@repo/shared';
import type { MutableOrganizationPermissions } from '@/lib/features/ui/sessionSlice';

/**
 * Hook to check organization-based permissions
 * (SPEC Section 5.2 - frontend permission gating with organization roles)
 */
export function usePermissions() {
  const permissions = useSelector((state: RootState) => state.session.permissions);
  const role = useSelector((state: RootState) => state.session.role);
  const organization = useSelector((state: RootState) => state.session.organization);

  /**
   * Check if user has a specific permission for a resource
   * @param resource - The resource (e.g., 'orders', 'metrics')
   * @param action - The action (e.g., 'read', 'create', 'update', 'delete')
   */
  const hasPermission = (resource: keyof MutableOrganizationPermissions, action: string): boolean => {
    if (!permissions) return false;
    const resourcePermissions = permissions[resource];
    if (!resourcePermissions) return false;
    return resourcePermissions.includes(action);
  };

  /**
   * Check if user has all specified permissions
   */
  const hasAllPermissions = (checks: Array<{ resource: keyof MutableOrganizationPermissions; action: string }>): boolean => {
    return checks.every(({ resource, action }) => hasPermission(resource, action));
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (checks: Array<{ resource: keyof MutableOrganizationPermissions; action: string }>): boolean => {
    return checks.some(({ resource, action }) => hasPermission(resource, action));
  };

  /**
   * Check if user has a specific role in the active organization
   */
  const hasRole = (requiredRole: OrganizationRole): boolean => {
    return role === requiredRole;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (...roles: OrganizationRole[]): boolean => {
    return role !== null && roles.includes(role);
  };

  return {
    permissions,
    role,
    organization,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
  };
}
