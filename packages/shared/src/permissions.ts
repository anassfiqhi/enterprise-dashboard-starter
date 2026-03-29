import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements as adminDefaultStatements, adminAc as adminAcAdminPlugin, userAc as userAcAdminPlugin } from "better-auth/plugins/admin/access";
import { adminAc, memberAc } from "better-auth/plugins/organization/access";

// =============================================================================
// Admin Plugin Access Control (global user management)
// =============================================================================

const adminPluginStatement = {
  ...adminDefaultStatements,
} as const;

export const adminPluginAccessControl = createAccessControl(adminPluginStatement);

export const adminRole = adminPluginAccessControl.newRole({
  ...adminAcAdminPlugin.statements,
  user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password", "get", "update"],
  session: ["list", "revoke", "delete"],
});

export const userRole = adminPluginAccessControl.newRole({
  ...userAcAdminPlugin.statements,
  user: ["get", "list"],
  session: [],
});

// Export adminPluginStatement for client-side permission checking
export { adminPluginStatement };

// =============================================================================
// Organization Plugin Access Control (per-hotel permissions)
// =============================================================================

/**
 * Custom permission statements for hotel management system
 * Organization = Hotel in this context
 *
 * Roles:
 * - Super Admin: isAdmin flag on user, bypasses all permission checks
 * - Manager: Full hotel access (hotel managerRole)
 * - Staff: Limited operational access (front desk)
 */
const organizationPluginStatement = {
  // Hotel configuration
  hotel: ["read", "update"],
  roomTypes: ["read", "create", "update", "delete"],
  rooms: ["read", "create", "update", "delete"],
  activityTypes: ["read", "create", "update", "delete"],
  activitySlots: ["read", "create", "update", "delete"],
  inventory: ["read", "update"],
  pricingRules: ["read", "create", "update", "delete"],
  promoCodes: ["read", "create", "update", "delete"],
  // Guest & Reservations
  guests: ["read", "create", "update", "delete"],
  reservations: ["read", "create", "update", "cancel", "checkin", "checkout"],
  // Admin features
  analytics: ["read"],
  auditLogs: ["read"],
} as const;

/**
 * Create access control instance
 */
export const organizationPluginAccessControl = createAccessControl(organizationPluginStatement);

/**
 * Admin role - Full access to hotel (hotel managerRole)
 * Can manage everything within their hotel
 */
export const managerRole = organizationPluginAccessControl.newRole({
  ...adminAc.statements,
  hotel: ["read", "update"],
  roomTypes: ["read", "create", "update", "delete"],
  rooms: ["read", "create", "update", "delete"],
  activityTypes: ["read", "create", "update", "delete"],
  activitySlots: ["read", "create", "update", "delete"],
  inventory: ["read", "update"],
  pricingRules: ["read", "create", "update", "delete"],
  promoCodes: ["read", "create", "update", "delete"],
  guests: ["read", "create", "update", "delete"],
  reservations: ["read", "create", "update", "cancel", "checkin", "checkout"],
  analytics: ["read"],
  auditLogs: ["read"],
});

/**
 * Staff role - Limited operational access (front desk, etc.)
 * Can view most things but only create reservations/guests
 * Cannot edit/delete, cannot access settings or analytics
 */
export const staffRole = organizationPluginAccessControl.newRole({
  ...memberAc.statements,
  hotel: ["read"],
  roomTypes: ["read"],
  rooms: ["read"],
  activityTypes: ["read"],
  activitySlots: ["read"],
  inventory: ["read"],
  pricingRules: [], // Staff cannot access pricing rules
  promoCodes: ["read"],
  guests: ["read", "create"], // Can view and create guests
  reservations: ["read", "create", "checkin", "checkout"], // No update, cancel
  analytics: [], // Staff cannot access analytics
  auditLogs: [], // Staff cannot access audit logs
});

// Export organizationPluginStatement for client-side permission checking
export { organizationPluginStatement };
