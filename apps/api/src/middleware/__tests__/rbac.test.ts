import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { requirePermission, requireAuth } from '../rbac';

// Mock the auth module
vi.mock('../../auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      getActiveMember: vi.fn(),
    },
  },
}));

// Import mocked modules
import { auth } from '../../auth';

describe('RBAC Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requirePermission', () => {
    it('returns 401 when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const app = new Hono();
      app.get('/test', requirePermission({ orders: ['read'] }), (c) => c.json({ success: true }));

      const res = await app.request('/test');
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body.error.code).toBe('UNAUTHORIZED');
      expect(body.error.message).toBe('Authentication required');
    });

    it('returns 403 when no active organization or not a member', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user_1', email: 'test@example.com', name: 'Test' },
        session: { id: 'sess_1', activeOrganizationId: null },
      } as any);

      // getActiveMember returns null when no active org or not a member
      vi.mocked(auth.api.getActiveMember).mockResolvedValue(null);

      const app = new Hono();
      app.get('/test', requirePermission({ orders: ['read'] }), (c) => c.json({ success: true }));

      const res = await app.request('/test');
      expect(res.status).toBe(403);

      const body = await res.json();
      expect(body.error.code).toBe('FORBIDDEN');
      expect(body.error.message).toContain('No active organization or not a member');
    });

    it('returns 403 when user lacks required permission', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user_1', email: 'test@example.com', name: 'Test' },
        session: { id: 'sess_1', activeOrganizationId: 'org_1' },
      } as any);

      // Member role only has read permission
      vi.mocked(auth.api.getActiveMember).mockResolvedValue({
        id: 'member_1',
        userId: 'user_1',
        organizationId: 'org_1',
        role: 'member',
      } as any);

      const app = new Hono();
      // Require create permission which member doesn't have
      app.get('/test', requirePermission({ orders: ['create'] }), (c) => c.json({ success: true }));

      const res = await app.request('/test');
      expect(res.status).toBe(403);

      const body = await res.json();
      expect(body.error.code).toBe('FORBIDDEN');
      expect(body.error.message).toContain('Missing required permission');
    });

    it('allows access when user has required permission (admin)', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user_1', email: 'admin@example.com', name: 'Admin' },
        session: { id: 'sess_1', activeOrganizationId: 'org_1' },
      } as any);

      vi.mocked(auth.api.getActiveMember).mockResolvedValue({
        id: 'member_1',
        userId: 'user_1',
        organizationId: 'org_1',
        role: 'admin',
      } as any);

      const app = new Hono();
      app.get('/test', requirePermission({ orders: ['read'] }), (c) => c.json({ success: true }));

      const res = await app.request('/test');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it('allows access when user has required permission (owner)', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user_1', email: 'owner@example.com', name: 'Owner' },
        session: { id: 'sess_1', activeOrganizationId: 'org_1' },
      } as any);

      vi.mocked(auth.api.getActiveMember).mockResolvedValue({
        id: 'member_1',
        userId: 'user_1',
        organizationId: 'org_1',
        role: 'owner',
      } as any);

      const app = new Hono();
      // Owner has all permissions including delete
      app.get('/test', requirePermission({ orders: ['delete'] }), (c) => c.json({ success: true }));

      const res = await app.request('/test');
      expect(res.status).toBe(200);
    });

    it('allows member to read orders but not create', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user_1', email: 'member@example.com', name: 'Member' },
        session: { id: 'sess_1', activeOrganizationId: 'org_1' },
      } as any);

      vi.mocked(auth.api.getActiveMember).mockResolvedValue({
        id: 'member_1',
        userId: 'user_1',
        organizationId: 'org_1',
        role: 'member',
      } as any);

      const app = new Hono();
      app.get('/read', requirePermission({ orders: ['read'] }), (c) => c.json({ success: true }));
      app.post('/create', requirePermission({ orders: ['create'] }), (c) => c.json({ success: true }));

      // Read should succeed
      const readRes = await app.request('/read');
      expect(readRes.status).toBe(200);

      // Create should fail
      const createRes = await app.request('/create', { method: 'POST' });
      expect(createRes.status).toBe(403);
    });

    it('sets user, session, and organization context on success', async () => {
      const mockUser = { id: 'user_1', email: 'admin@example.com', name: 'Admin' };
      const mockSession = { id: 'sess_1', activeOrganizationId: 'org_1' };

      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      } as any);

      vi.mocked(auth.api.getActiveMember).mockResolvedValue({
        id: 'member_1',
        userId: 'user_1',
        organizationId: 'org_1',
        role: 'admin',
      } as any);

      let contextUser: any;
      let contextOrgId: any;
      let contextRole: any;

      const app = new Hono();
      app.get('/test', requirePermission({ orders: ['read'] }), (c) => {
        contextUser = c.get('user');
        contextOrgId = c.get('organizationId');
        contextRole = c.get('memberRole');
        return c.json({ success: true });
      });

      await app.request('/test');

      expect(contextUser).toEqual(mockUser);
      expect(contextOrgId).toBe('org_1');
      expect(contextRole).toBe('admin');
    });
  });

  describe('requireAuth', () => {
    it('returns 401 when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const app = new Hono();
      app.get('/test', requireAuth, (c) => c.json({ success: true }));

      const res = await app.request('/test');
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('allows access when session exists (no permission check)', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user_1', email: 'test@example.com', name: 'Test' },
        session: { id: 'sess_1', activeOrganizationId: null }, // No org, but that's OK for requireAuth
      } as any);

      const app = new Hono();
      app.get('/test', requireAuth, (c) => c.json({ success: true }));

      const res = await app.request('/test');
      expect(res.status).toBe(200);
    });

    it('sets user and session in context', async () => {
      const mockUser = { id: 'user_1', email: 'test@example.com', name: 'Test' };
      const mockSession = { user: mockUser, session: { id: 'sess_1' } };

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);

      let contextUser: any;
      let contextSession: any;

      const app = new Hono();
      app.get('/test', requireAuth, (c) => {
        contextUser = c.get('user');
        contextSession = c.get('session');
        return c.json({ success: true });
      });

      await app.request('/test');

      expect(contextUser).toEqual(mockUser);
      expect(contextSession).toEqual(mockSession);
    });
  });
});
