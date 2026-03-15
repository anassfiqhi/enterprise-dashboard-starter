/**
 * Organization-related type definitions
 * Matches Better Auth organization plugin schema with custom fields
 */

import type { InvitationStatus, OrganizationRole } from './better-auth';

/**
 * Base Organization type
 * Includes custom fields from auth.ts schema.organization.additionalFields
 */
export interface Organization {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    logo?: string | null;
    metadata?: Record<string, unknown>;
    // Custom fields from auth.ts
    timezone?: string;
    checkInTime?: string;
    checkOutTime?: string;
    address?: string;
    phone?: string;
    contactEmail?: string;
    currency?: string;
}

/**
 * Member type
 * Represents a user's membership in an organization
 */
export interface Member {
    id: string;
    organizationId: string;
    userId: string;
    role: OrganizationRole;
    createdAt: Date;
    user: {
        id: string;
        email: string;
        name: string;
        image?: string;
    };
}

/**
 * Invitation type
 * Represents a pending invitation to join an organization
 */
export interface Invitation {
    id: string;
    organizationId: string;
    email: string;
    role: OrganizationRole;
    status: InvitationStatus;
    inviterId: string;
    expiresAt: Date;
    createdAt: Date;
}

/**
 * Organization with full relations
 * Returned by useActiveOrganization hook
 */
export interface OrganizationWithRelations extends Organization {
    members: Member[];
    invitations: Invitation[];
}

/**
 * Active member type
 * Returned by useActiveMember hook
 */
export type ActiveMember = Member | null;

/**
 * Active organization type
 * Returned by useActiveOrganization hook
 */
export type ActiveOrganization = OrganizationWithRelations | null;
