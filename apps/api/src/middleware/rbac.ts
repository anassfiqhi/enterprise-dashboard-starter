import type { Context, Next } from 'hono';
import { auth } from '../auth';
import { createErrorEnvelope } from '@repo/shared';

/**
 * Organization RBAC Middleware
 * Validates session and checks organization membership with required permissions
 */
type ResourceAction = {
    [K in 'orders' | 'metrics' | 'organization' | 'member' | 'invitation']?: Array<'read' | 'create' | 'update' | 'delete' | 'cancel'>;
};

export function requirePermission(resourceAction: ResourceAction) {
    return async (c: Context, next: Next) => {
        // Get session from Better Auth
        const session = await auth.api.getSession({ headers: c.req.raw.headers });

        if (!session) {
            return c.json(createErrorEnvelope('UNAUTHORIZED', 'Authentication required'), 401);
        }

        // Get active member using better-auth's organization plugin
        const activeMember = await auth.api.getActiveMember({ headers: c.req.raw.headers });

        if (!activeMember) {
            return c.json(
                createErrorEnvelope('FORBIDDEN', 'No active organization or not a member'),
                403
            );
        }

        const activeOrgId = activeMember.organizationId;

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

        // Store user, session, and organization in context for downstream handlers
        c.set('user', session.user);
        c.set('session', session);
        c.set('organizationId', activeOrgId);
        c.set('memberRole', activeMember.role);

        return next();
    };
}

/**
 * Session validation middleware (optional - doesn't check permissions)
 * Just ensures user is authenticated
 */
export async function requireAuth(c: Context, next: Next) {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
        return c.json(createErrorEnvelope('UNAUTHORIZED', 'Authentication required'), 401);
    }

    c.set('user', session.user);
    c.set('session', session);

    return next();
}
