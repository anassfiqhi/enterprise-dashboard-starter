import type { Order, SessionData, Metrics } from '@repo/shared';
import type { MutableOrganizationPermissions } from '@/lib/features/ui/sessionSlice';

// Generate mock orders
export const mockOrders: Order[] = Array.from({ length: 50 }, (_, i) => ({
  id: `ORD-${String(i + 1).padStart(5, '0')}`,
  status: (['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const)[i % 5],
  customer: `Customer ${i + 1}`,
  amount: Math.round((100 + Math.random() * 900) * 100) / 100,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

// Admin session with full permissions
export const mockAdminSession: SessionData = {
  user: {
    id: 'user_1',
    email: 'admin@example.com',
    name: 'Admin User',
  },
  organization: {
    id: 'org_1',
    name: 'Test Organization',
    slug: 'test-org',
  },
  role: 'admin',
  permissions: {
    organization: ['update'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    orders: ['read', 'create', 'update', 'delete'],
    metrics: ['read'],
    reservations: ['read', 'update'],
    hotels: ['read'],
  },
};

// Mutable version for Redux store
export const mockAdminPermissions: MutableOrganizationPermissions = {
  organization: ['update'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
  orders: ['read', 'create', 'update', 'delete'],
  metrics: ['read'],
  reservations: ['read', 'update'],
  hotels: ['read'],
};

// Member session with limited permissions
export const mockMemberSession: SessionData = {
  user: {
    id: 'user_2',
    email: 'member@example.com',
    name: 'Member User',
  },
  organization: {
    id: 'org_1',
    name: 'Test Organization',
    slug: 'test-org',
  },
  role: 'member',
  permissions: {
    orders: ['read'],
    metrics: ['read'],
    reservations: ['read'],
    hotels: ['read'],
  },
};

export const mockMemberPermissions: MutableOrganizationPermissions = {
  orders: ['read'],
  metrics: ['read'],
  reservations: ['read'],
  hotels: ['read'],
};

// Owner session with all permissions
export const mockOwnerSession: SessionData = {
  user: {
    id: 'user_3',
    email: 'owner@example.com',
    name: 'Owner User',
  },
  organization: {
    id: 'org_1',
    name: 'Test Organization',
    slug: 'test-org',
  },
  role: 'owner',
  permissions: {
    organization: ['update', 'delete'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    orders: ['read', 'create', 'update', 'delete'],
    metrics: ['read'],
    reservations: ['read', 'update', 'delete'],
    hotels: ['read'],
  },
};

// Dashboard metrics
export const mockMetrics: Metrics = {
  totalRevenue: 45231.89,
  subscriptions: 2350,
  sales: 12234,
  activeNow: 573,
};

// SSE event fixtures
export const mockOrderUpdatedEvent = {
  type: 'order.updated' as const,
  id: 'ORD-00001',
  patch: { status: 'shipped' as const },
  ts: Date.now(),
};

export const mockOrderCreatedEvent = {
  type: 'order.created' as const,
  id: 'ORD-00051',
  patch: {
    id: 'ORD-00051',
    status: 'pending' as const,
    customer: 'New Customer',
    amount: 199.99,
    createdAt: new Date().toISOString(),
  },
  ts: Date.now(),
};
