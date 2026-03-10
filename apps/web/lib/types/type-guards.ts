/**
 * Type guard utilities for Better Auth types
 */

import type { SessionData, ActiveOrganization, ActiveMember } from './index';

/**
 * Type guard to check if user is authenticated
 */
export function isAuthenticated(
    session: SessionData
): session is NonNullable<SessionData> {
    return session !== null && session.user !== null && session.session !== null;
}

/**
 * Type guard to check if user has an active organization
 */
export function hasActiveOrganization(
    org: ActiveOrganization
): org is NonNullable<ActiveOrganization> {
    return org !== null;
}

/**
 * Type guard to check if user has an active member role
 */
export function hasActiveMember(
    member: ActiveMember
): member is NonNullable<ActiveMember> {
    return member !== null;
}

/**
 * Type guard to check if user is a super admin
 */
export function isAdmin(session: SessionData): boolean {
    return session?.user?.role === 'admin';
}

/**
 * Type guard to check if user is an admin in the active organization
 */
export function isOrganizationAdmin(member: ActiveMember): boolean {
    return member?.role === 'admin';
}

/**
 * Type guard to check if user is staff in the active organization
 */
export function isOrganizationStaff(member: ActiveMember): boolean {
    return member?.role === 'staff';
}
