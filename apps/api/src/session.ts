import { Hono } from 'hono';
import { auth } from './auth';
import { createSuccessEnvelope, createErrorEnvelope } from '@repo/shared';

const app = new Hono();

/**
 * GET /session
 * Returns current session user, active organization, and their role/permissions
 * (SPEC Section 5.2 - permissions snapshot endpoint)
 */
app.get('/', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json(createErrorEnvelope('UNAUTHENTICATED', 'Not authenticated'), 401);
  }

  // Get active member using better-auth's organization plugin
  const activeMember = await auth.api.getActiveMember({ headers: c.req.raw.headers });

  if (!activeMember) {
    return c.json(createSuccessEnvelope({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      organization: null,
      role: null,
      permissions: null,
      message: 'No active organization selected',
    }));
  }

  // Get full organization details
  const fullOrg = await auth.api.getFullOrganization({
    headers: c.req.raw.headers,
    query: { organizationId: activeMember.organizationId },
  });

  if (!fullOrg) {
    return c.json(createErrorEnvelope('NOT_FOUND', 'Organization not found'), 404);
  }

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
      rolePermissions = {};
  }

  return c.json(createSuccessEnvelope({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
    organization: {
      id: fullOrg.id,
      name: fullOrg.name,
      slug: fullOrg.slug,
    },
    role: activeMember.role,
    permissions: rolePermissions,
  }));
});

export default app;
