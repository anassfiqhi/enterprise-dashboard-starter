/**
 * Centralized type definitions for Better Auth
 * These types are inferred from the Better Auth client and server configuration
 */

import type { authClient } from '@/lib/auth-client';

/**
 * Session type extended by organization plugin
 * Includes activeOrganizationId for tracking current workspace
 */

export type Session = typeof authClient.$Infer.Session
export type User = typeof authClient.$Infer.Session.user
export type Organization = typeof authClient.$Infer.Organization
export type Member = typeof authClient.$Infer.Member

/**
 * Session data returned by useSession hook
 */
export type SessionData = {
    user: User;
    session: Session;
} | null;

/**
 * Invitation status enum
 */
export enum InvitationStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    EXPIRED = 'expired',
}

/**
 * Organization roles
 */
export type OrganizationRole = 'admin' | 'staff';
