import { db } from '../db';
import { auditLog } from '../db/schema';
import { nanoid } from 'nanoid';

/**
 * Audit action types for tracking user actions
 */
export type AuditAction =
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'CANCEL'
    | 'CHECK_IN'
    | 'CHECK_OUT'
    | 'CONFIRM'
    | 'VIEW';

/**
 * Resource types that can be audited
 */
export type AuditResource =
    | 'reservation'
    | 'guest'
    | 'room'
    | 'room_type'
    | 'activity_type'
    | 'activity_slot'
    | 'inventory'
    | 'pricing_rule'
    | 'member'
    | 'invitation'
    | 'hotel';

/**
 * Context for creating an audit log entry
 */
export interface AuditLogContext {
    hotelId: string;
    userId: string;
    userEmail: string;
    userRole?: string | null;
    action: AuditAction;
    resource: AuditResource;
    resourceId?: string;
    previousValue?: unknown;
    newValue?: unknown;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Create an audit log entry
 * Tracks user actions for compliance and debugging
 */
export async function createAuditLog(ctx: AuditLogContext): Promise<void> {
    try {
        await db.insert(auditLog).values({
            id: nanoid(),
            hotelId: ctx.hotelId,
            userId: ctx.userId,
            userEmail: ctx.userEmail,
            userRole: ctx.userRole ?? null,
            action: ctx.action,
            resource: ctx.resource,
            resourceId: ctx.resourceId ?? null,
            previousValue: ctx.previousValue ? JSON.stringify(ctx.previousValue) : null,
            newValue: ctx.newValue ? JSON.stringify(ctx.newValue) : null,
            ipAddress: ctx.ipAddress ?? null,
            userAgent: ctx.userAgent ?? null,
        });
    } catch (error) {
        // Log but don't throw - audit logging shouldn't break the main operation
        console.error('Failed to create audit log:', error);
    }
}

/**
 * Helper to extract audit context from Hono context
 */
export function getAuditContextFromRequest(c: {
    get: (key: string) => unknown;
    req: { raw: Request };
}): Pick<AuditLogContext, 'userId' | 'userEmail' | 'userRole' | 'hotelId' | 'ipAddress' | 'userAgent'> {
    const user = c.get('user') as { id: string; email: string } | undefined;
    const hotelId = c.get('hotelId') as string | undefined;
    const memberRole = c.get('memberRole') as string | undefined;
    const isSuperAdmin = c.get('isSuperAdmin') as boolean | undefined;

    return {
        userId: user?.id ?? 'unknown',
        userEmail: user?.email ?? 'unknown',
        userRole: isSuperAdmin ? 'super_admin' : memberRole ?? null,
        hotelId: hotelId ?? 'system',
        ipAddress: c.req.raw.headers.get('x-forwarded-for') ?? c.req.raw.headers.get('x-real-ip') ?? undefined,
        userAgent: c.req.raw.headers.get('user-agent') ?? undefined,
    };
}

/**
 * Convenience function to log a create action
 */
export async function logCreate(
    c: { get: (key: string) => unknown; req: { raw: Request } },
    resource: AuditResource,
    resourceId: string,
    newValue: unknown
): Promise<void> {
    const ctx = getAuditContextFromRequest(c);
    await createAuditLog({
        ...ctx,
        action: 'CREATE',
        resource,
        resourceId,
        newValue,
    });
}

/**
 * Convenience function to log an update action
 */
export async function logUpdate(
    c: { get: (key: string) => unknown; req: { raw: Request } },
    resource: AuditResource,
    resourceId: string,
    previousValue: unknown,
    newValue: unknown
): Promise<void> {
    const ctx = getAuditContextFromRequest(c);
    await createAuditLog({
        ...ctx,
        action: 'UPDATE',
        resource,
        resourceId,
        previousValue,
        newValue,
    });
}

/**
 * Convenience function to log a delete action
 */
export async function logDelete(
    c: { get: (key: string) => unknown; req: { raw: Request } },
    resource: AuditResource,
    resourceId: string,
    previousValue: unknown
): Promise<void> {
    const ctx = getAuditContextFromRequest(c);
    await createAuditLog({
        ...ctx,
        action: 'DELETE',
        resource,
        resourceId,
        previousValue,
    });
}

/**
 * Convenience function to log a reservation status change
 */
export async function logReservationAction(
    c: { get: (key: string) => unknown; req: { raw: Request } },
    action: 'CANCEL' | 'CHECK_IN' | 'CHECK_OUT' | 'CONFIRM',
    reservationId: string,
    previousValue: unknown,
    newValue: unknown
): Promise<void> {
    const ctx = getAuditContextFromRequest(c);
    await createAuditLog({
        ...ctx,
        action,
        resource: 'reservation',
        resourceId: reservationId,
        previousValue,
        newValue,
    });
}
