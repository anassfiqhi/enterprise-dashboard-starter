import type { Context, Next } from 'hono';
import { auth, type User, type Session, type Member } from '../auth';
import { createErrorEnvelope, managerRole, staffRole } from '@repo/shared';

export type AuthVariables = {
    user: User;
    session: Session;
    isAdmin: boolean;
    hotelId?: string;
    memberRole?: string;
};

export type HonoEnv = {
    Variables: AuthVariables;
};

/**
 * Hotel Management RBAC Middleware
 * Validates session and checks hotel membership with required permissions
 * Admin users bypass all permission checks
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
 * Admin users bypass all permission checks
 */
export function requirePermission(resourceAction: ResourceAction) {
    return async (c: Context<HonoEnv>, next: Next) => {
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json(createErrorEnvelope('UNAUTHORIZED', 'Bearer token required'), 401);
        }

        // Get session from Better Auth
        const session = await auth.api.getSession({ headers: c.req.raw.headers });

        if (!session) {
            return c.json(createErrorEnvelope('UNAUTHORIZED', 'Authentication required'), 401);
        }

        // Admin bypasses all permission checks
        if (session.user.role === 'admin') {
            c.set('user', session.user);
            c.set('session', session);
            c.set('isAdmin', true);
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



        // Get role permissions based on user's role
        const rolePermissions = activeMember.role === 'manager'
            ? managerRole.statements
            : staffRole.statements;


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
        c.set('isAdmin', false);

        return next();
    };
}

/**
 * Session validation middleware (doesn't check permissions)
 * Just ensures user is authenticated
 */
export async function requireAuth(c: Context<HonoEnv>, next: Next) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json(createErrorEnvelope('UNAUTHORIZED', 'Bearer token required'), 401);
    }

    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
        return c.json(createErrorEnvelope('UNAUTHORIZED', 'Authentication required'), 401);
    }

    c.set('user', session.user);
    c.set('session', session);
    c.set('isAdmin', session.user.role === 'admin');

    return next();
}

/**
 * Admin only middleware
 * Restricts access to Admin users only
 */
export async function requireAdmin(c: Context<HonoEnv>, next: Next) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json(createErrorEnvelope('UNAUTHORIZED', 'Bearer token required'), 401);
    }

    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
        return c.json(createErrorEnvelope('UNAUTHORIZED', 'Authentication required'), 401);
    }

    if (session.user.role !== 'admin') {
        return c.json(
            createErrorEnvelope('FORBIDDEN', 'Admin access required'),
            403
        );
    }

    c.set('user', session.user);
    c.set('session', session);
    c.set('isAdmin', true);

    return next();
}
/**
 * Admin only middleware
 * Restricts access to Admin users only
 */
export async function requireManager(c: Context<HonoEnv>, next: Next) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json(createErrorEnvelope('UNAUTHORIZED', 'Bearer token required'), 401);
    }

    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
        return c.json(createErrorEnvelope('UNAUTHORIZED', 'Authentication required'), 401);
    }

    // Admin bypasses all checks
    if (session.user.role === 'admin') {
        c.set('user', session.user);
        c.set('session', session);
        c.set('isAdmin', true);
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

    if (activeMember.role !== 'manager') {
        return c.json(
            createErrorEnvelope('FORBIDDEN', 'Manager access required'),
            403
        );
    }

    c.set('user', session.user);
    c.set('session', session);
    c.set('hotelId', activeHotelId);
    c.set('memberRole', activeMember.role);
    c.set('isAdmin', false);

    return next();
}

export async function requireStaff(c: Context<HonoEnv>, next: Next) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json(createErrorEnvelope('UNAUTHORIZED', 'Bearer token required'), 401);
    }

    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
        return c.json(createErrorEnvelope('UNAUTHORIZED', 'Authentication required'), 401);
    }

    // Admin bypasses all checks
    if (session.user.role === 'admin') {
        c.set('user', session.user);
        c.set('session', session);
        c.set('isAdmin', true);
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

    // Allow both manager and staff for staff routes
    if (activeMember.role !== 'staff' && activeMember.role !== 'manager') {
        return c.json(
            createErrorEnvelope('FORBIDDEN', 'Staff access required'),
            403
        );
    }

    c.set('user', session.user);
    c.set('session', session);
    c.set('hotelId', activeHotelId);
    c.set('memberRole', activeMember.role);
    c.set('isAdmin', false);

    return next();
}

/**
 * Hotel context middleware
 * Requires user to have an active hotel selected
 * Does not check specific permissions
 */
export async function requireHotelContext(c: Context<HonoEnv>, next: Next) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json(createErrorEnvelope('UNAUTHORIZED', 'Bearer token required'), 401);
    }

    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
        return c.json(createErrorEnvelope('UNAUTHORIZED', 'Authentication required'), 401);
    }

    c.set('user', session.user);
    c.set('session', session);

    // Admin can access without active hotel context
    if (session.user.role === 'admin') {
        c.set('user', session.user);
        c.set('session', session);
        c.set('isAdmin', true);
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
    c.set('isAdmin', false);

    return next();
}
