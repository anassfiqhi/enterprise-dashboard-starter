import type { Context, Next } from 'hono';
import { auth } from '../auth';
import { createErrorEnvelope } from '@repo/shared';

/**
 * Hotel Management RBAC Middleware
 * Validates session and checks hotel membership with required permissions
 * Super Admin bypasses all permission checks
 */

// Resource types available for permission checking
type Resource =
    | 'organization'
    | 'member'
    | 'invitation'
    | 'hotel'
    | 'roomTypes'
    | 'rooms'
    | 'activityTypes'
    | 'activitySlots'
    | 'inventory'
    | 'pricingRules'
    | 'guests'
    | 'reservations'
    | 'analytics'
    | 'auditLogs';

// Actions available for each resource
type Action = 'read' | 'create' | 'update' | 'delete' | 'cancel' | 'checkin' | 'checkout';

type ResourceAction = {
    [K in Resource]?: Action[];
};

/**
 * Permission middleware that checks if user has required permissions
 * Super Admin users bypass all permission checks
 */
export function requirePermission(resourceAction: ResourceAction) {
    return async (c: Context, next: Next) => {
        // Get session from Better Auth
        const session = await auth.api.getSession({ headers: c.req.raw.headers });

        if (!session) {
            return c.json(createErrorEnvelope('UNAUTHORIZED', 'Authentication required'), 401);
        }

        // Super Admin bypasses all permission checks
        if (session.user.isSuperAdmin) {
            c.set('user', session.user);
            c.set('session', session);
            c.set('isSuperAdmin', true);
            return next();
        }

        // Get active member using better-auth's organization plugin
        const activeMember = await auth.api.getActiveMember({ headers: c.req.raw.headers });

        if (!activeMember) {
            return c.json(
                createErrorEnvelope('FORBIDDEN', 'No active hotel or not a member'),
                403
            );
        }

        const activeHotelId = activeMember.organizationId;

        // Import role permissions
        const { owner, admin, member: memberRole } = await import('@repo/shared');

        // Get role permissions based on user's role
        let rolePermissions;
        switch (activeMember.role) {
            case 'owner':
                rolePermissions = owner.statements;
                break;
            case 'admin':
                rolePermissions = admin.statements;
                break;
            case 'member':
                rolePermissions = memberRole.statements;
                break;
            default:
                return c.json(
                    createErrorEnvelope('FORBIDDEN', 'Invalid role'),
                    403
                );
        }

        // Check if user has required permissions
        for (const [resource, actions] of Object.entries(resourceAction)) {
            const requiredActions = actions as string[];
            const allowedActions = (rolePermissions[resource as keyof typeof rolePermissions] || []) as readonly string[];

            for (const action of requiredActions) {
                if (!(allowedActions as string[]).includes(action)) {
                    return c.json(
                        createErrorEnvelope(
                            'FORBIDDEN',
                            `Missing required permission: ${resource}:${action}`
                        ),
                        403
                    );
                }
            }
        }

        // Store user, session, and hotel info in context for downstream handlers
        c.set('user', session.user);
        c.set('session', session);
        c.set('hotelId', activeHotelId);
        c.set('memberRole', activeMember.role);
        c.set('isSuperAdmin', false);

        return next();
    };
}

/**
 * Session validation middleware (doesn't check permissions)
 * Just ensures user is authenticated
 */
export async function requireAuth(c: Context, next: Next) {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
        return c.json(createErrorEnvelope('UNAUTHORIZED', 'Authentication required'), 401);
    }

    c.set('user', session.user);
    c.set('session', session);
    c.set('isSuperAdmin', session.user.isSuperAdmin ?? false);

    return next();
}

/**
 * Super Admin only middleware
 * Restricts access to Super Admin users only
 */
export async function requireSuperAdmin(c: Context, next: Next) {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
        return c.json(createErrorEnvelope('UNAUTHORIZED', 'Authentication required'), 401);
    }

    if (!session.user.isSuperAdmin) {
        return c.json(
            createErrorEnvelope('FORBIDDEN', 'Super Admin access required'),
            403
        );
    }

    c.set('user', session.user);
    c.set('session', session);
    c.set('isSuperAdmin', true);

    return next();
}

/**
 * Hotel context middleware
 * Requires user to have an active hotel selected
 * Does not check specific permissions
 */
export async function requireHotelContext(c: Context, next: Next) {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
        return c.json(createErrorEnvelope('UNAUTHORIZED', 'Authentication required'), 401);
    }

    c.set('user', session.user);
    c.set('session', session);

    // Super Admin can access without active hotel context
    if (session.user.isSuperAdmin) {
        c.set('isSuperAdmin', true);
        return next();
    }

    // Regular users need an active hotel
    const activeMember = await auth.api.getActiveMember({ headers: c.req.raw.headers });

    if (!activeMember) {
        return c.json(
            createErrorEnvelope('FORBIDDEN', 'No active hotel selected'),
            403
        );
    }

    c.set('hotelId', activeMember.organizationId);
    c.set('memberRole', activeMember.role);
    c.set('isSuperAdmin', false);

    return next();
}
