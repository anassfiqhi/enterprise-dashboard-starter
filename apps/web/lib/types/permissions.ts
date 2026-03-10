/**
 * Permission-related type definitions
 * Matches the access control configuration from @repo/shared
 */

/**
 * Organization permissions structure
 * Each key represents a resource, value is array of allowed actions
 */
export interface OrganizationPermissions {
    organization?: string[];
    member?: string[];
    invitation?: string[];
    hotel?: string[];
    roomTypes?: string[];
    rooms?: string[];
    activityTypes?: string[];
    activitySlots?: string[];
    inventory?: string[];
    pricingRules?: string[];
    promoCodes?: string[];
    guests?: string[];
    reservations?: string[];
    analytics?: string[];
    auditLogs?: string[];
}

/**
 * Mutable permissions type for Redux state
 * Avoids readonly conflicts with immer
 */
export type MutablePermissions = {
    [K in keyof OrganizationPermissions]: string[];
};
