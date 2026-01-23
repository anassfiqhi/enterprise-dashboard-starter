import { Hono } from 'hono';
import type { OrganizationRole } from '@repo/shared';

// Helper to create mock session for testing
export function createMockSession(overrides: {
  userId?: string;
  email?: string;
  name?: string;
  sessionId?: string;
  activeOrganizationId?: string | null;
} = {}) {
  return {
    user: {
      id: overrides.userId ?? 'user_1',
      email: overrides.email ?? 'admin@example.com',
      name: overrides.name ?? 'Admin User',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    session: {
      id: overrides.sessionId ?? 'session_1',
      userId: overrides.userId ?? 'user_1',
      expiresAt: new Date(Date.now() + 86400000),
      token: 'test-token',
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
      activeOrganizationId: overrides.activeOrganizationId ?? 'org_1',
    },
  };
}

// Helper to create mock membership
export function createMockMembership(options: {
  role?: OrganizationRole;
  userId?: string;
  organizationId?: string;
  organizationName?: string;
  organizationSlug?: string;
} = {}) {
  const role = options.role ?? 'admin';
  return {
    id: 'member_1',
    userId: options.userId ?? 'user_1',
    organizationId: options.organizationId ?? 'org_1',
    role,
    createdAt: new Date(),
    organization: {
      id: options.organizationId ?? 'org_1',
      name: options.organizationName ?? 'Test Organization',
      slug: options.organizationSlug ?? 'test-org',
      logo: null,
      metadata: null,
      createdAt: new Date(),
    },
  };
}

// Test fixtures for orders
export function createMockOrders(count = 10) {
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
  return Array.from({ length: count }, (_, i) => ({
    id: `ORD-${String(i + 1).padStart(5, '0')}`,
    status: statuses[i % 5],
    customer: `Customer ${i + 1}`,
    amount: String(Math.round((100 + Math.random() * 900) * 100) / 100),
    createdAt: new Date(Date.now() - i * 86400000),
    updatedAt: new Date(),
  }));
}

// Helper to make test requests to Hono app
export async function testRequest(
  app: Hono,
  method: string,
  path: string,
  options: {
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
) {
  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (options.body) {
    init.body = JSON.stringify(options.body);
  }

  const request = new Request(`http://localhost:3001${path}`, init);
  return app.fetch(request);
}

// Helper to parse JSON response
export async function parseJsonResponse<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

// Create a mock ResponseEnvelope for testing
export function createMockEnvelope<T>(data: T, meta: Record<string, unknown> = {}) {
  return {
    data,
    meta: {
      requestId: 'test-request-id',
      ...meta,
    },
    error: null,
  };
}

export function createMockErrorEnvelope(code: string, message: string) {
  return {
    data: null,
    meta: {
      requestId: 'test-request-id',
    },
    error: {
      code,
      message,
    },
  };
}

// Permission sets for different roles
export const rolePermissions = {
  owner: {
    organization: ['update', 'delete'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    orders: ['read', 'create', 'update', 'delete'],
    metrics: ['read'],
  },
  admin: {
    organization: ['update'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    orders: ['read', 'create', 'update', 'delete'],
    metrics: ['read'],
  },
  member: {
    orders: ['read'],
    metrics: ['read'],
  },
} as const;
