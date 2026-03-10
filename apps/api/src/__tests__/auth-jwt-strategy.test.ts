import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { requireAuth, requireAdmin, requireHotelContext, type HonoEnv } from '../middleware/rbac';

// Mock the auth module
vi.mock('../auth', () => ({
    auth: {
        api: {
            getSession: vi.fn(),
            getActiveMember: vi.fn(),
        },
    },
}));

// Import mocked modules
import { auth } from '../auth';

describe('Stateless JWT Strategy', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('correctly extracts session from JWT in the Authorization header', async () => {
        const mockUser = { id: 'user_1', email: 'test@example.com', name: 'Test User' };
        const mockSession = { user: mockUser, session: { id: 'sess_1', token: 'fake-jwt-token' } };

        // Mock getSession to simulate what happens when a valid JWT is provided
        vi.mocked(auth.api.getSession).mockImplementation(async (options) => {
            const headers = (options as any)?.headers;
            const authHeader = headers?.get('Authorization');
            if (authHeader === 'Bearer fake-jwt-token') {
                return mockSession as any;
            }
            return null;
        });

        const app = new Hono<HonoEnv>();
        app.get('/api/protected', requireAuth, (c) => {
            return c.json({ user: c.get('user') });
        });

        // Request WITH valid Bearer token
        const res = await app.request('/api/protected', {
            headers: {
                'Authorization': 'Bearer fake-jwt-token',
            },
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.user.id).toBe('user_1');
        expect(auth.api.getSession).toHaveBeenCalled();
    });

    it('fails when no Bearer token is provided', async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue(null);

        const app = new Hono<HonoEnv>();
        app.get('/api/protected', requireAuth, (c) => {
            return c.json({ user: c.get('user') });
        });

        const res = await app.request('/api/protected');

        expect(res.status).toBe(401);
        const body = await res.json();
        expect(body.error.code).toBe('UNAUTHORIZED');
        expect(body.error.message).toBe('Bearer token required');
    });

    it('fails for requireAdmin when no role is admin', async () => {
        const mockUser = { id: 'user_1', email: 'test@example.com', name: 'Test User', role: 'user' };
        const mockSession = { user: mockUser, session: { id: 'sess_1' } };

        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);

        const app = new Hono<HonoEnv>();
        app.get('/api/admin', requireAdmin, (c) => c.json({ ok: true }));

        const res = await app.request('/api/admin', {
            headers: { 'Authorization': 'Bearer some-token' }
        });

        expect(res.status).toBe(403);
        const body = await res.json();
        expect(body.error.code).toBe('FORBIDDEN');
    });

    it('fails when an invalid Bearer token is provided', async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue(null);

        const app = new Hono<HonoEnv>();
        app.get('/api/protected', requireAuth, (c) => {
            return c.json({ user: c.get('user') });
        });

        const res = await app.request('/api/protected', {
            headers: {
                'Authorization': 'Bearer invalid-token',
            },
        });

        expect(res.status).toBe(401);
    });

    it('requires a Bearer token for requireHotelContext', async () => {
        const app = new Hono<HonoEnv>();
        app.get('/api/hotel', requireHotelContext, (c) => c.json({ ok: true }));

        const res = await app.request('/api/hotel');

        expect(res.status).toBe(401);
        const body = await res.json();
        expect(body.error.message).toBe('Bearer token required');
    });

    it('successfully gets hotel context with a valid Bearer token', async () => {
        const mockUser = { id: 'user_1', role: 'user' };
        const mockSession = { user: mockUser, session: { id: 'sess_1' } };
        const mockMember = { organizationId: 'hotel_1', role: 'manager' };

        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
        vi.mocked(auth.api.getActiveMember).mockResolvedValue(mockMember as any);

        const app = new Hono<HonoEnv>();
        app.get('/api/hotel', requireHotelContext, (c) => {
            return c.json({ hotelId: c.get('hotelId'), role: c.get('memberRole') });
        });

        const res = await app.request('/api/hotel', {
            headers: { 'Authorization': 'Bearer valid-token' }
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.hotelId).toBe('hotel_1');
        expect(body.role).toBe('manager');
    });
});
