import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, memberAc } from "better-auth/plugins/organization/access";

/**
 * Custom permission statements for hotel management system
 * Organization = Hotel in this context
 *
 * Roles:
 * - Super Admin: isSuperAdmin flag on user, bypasses all permission checks
 * - Admin: Full hotel access (hotel manager)
 * - Staff: Limited operational access (front desk)
 */
const statement = {
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
  // Team management
  member: ["read", "create", "update", "delete"],
  invitation: ["read", "create", "delete"],
  // Admin features
  analytics: ["read"],
  auditLogs: ["read"],
} as const;

/**
 * Create access control instance
 */
export const ac = createAccessControl(statement);

/**
 * Admin role - Full access to hotel (hotel manager)
 * Can manage everything within their hotel
 */
export const admin = ac.newRole({
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
  member: ["read", "create", "update", "delete"],
  invitation: ["read", "create", "delete"],
  analytics: ["read"],
  auditLogs: ["read"],
});

/**
 * Staff role - Limited operational access (front desk, etc.)
 * Can view most things but only create reservations/guests
 * Cannot edit/delete, cannot access settings or analytics
 */
export const staff = ac.newRole({
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
  member: ["read"], // Can view team
  invitation: [], // Staff cannot manage invitations
  analytics: [], // Staff cannot access analytics
  auditLogs: [], // Staff cannot access audit logs
});

// Export statement for client-side permission checking
export { statement };
