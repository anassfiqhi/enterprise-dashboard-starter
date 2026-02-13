import type { SessionData, Metrics } from '@repo/shared';
import type { MutablePermissions } from '@/lib/features/ui/sessionSlice';

// Admin session with full permissions
export const mockAdminSession: SessionData = {
  user: {
    id: 'user_1',
    email: 'admin@example.com',
    name: 'Admin User',
    isSuperAdmin: false,
  },
  activeHotel: {
    id: 'hotel_1',
    name: 'Test Hotel',
    slug: 'test-hotel',
  },
  hotels: [
    {
      id: 'hotel_1',
      name: 'Test Hotel',
      slug: 'test-hotel',
    },
  ],
  activeMember: {
    id: 'member_1',
    role: 'admin',
  },
  permissions: {
    organization: ['update'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    hotel: ['read', 'update'],
    roomTypes: ['read', 'create', 'update', 'delete'],
    rooms: ['read', 'create', 'update', 'delete'],
    activityTypes: ['read', 'create', 'update', 'delete'],
    activitySlots: ['read', 'create', 'update', 'delete'],
    inventory: ['read', 'update'],
    pricingRules: ['read', 'create', 'update', 'delete'],
    guests: ['read', 'create', 'update', 'delete'],
    reservations: ['read', 'create', 'update', 'cancel', 'checkin', 'checkout'],
    analytics: ['read'],
    auditLogs: ['read'],
  },
};

// Mutable version for Redux store
export const mockAdminPermissions: MutablePermissions = {
  organization: ['update'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
  hotel: ['read', 'update'],
  roomTypes: ['read', 'create', 'update', 'delete'],
  rooms: ['read', 'create', 'update', 'delete'],
  guests: ['read', 'create', 'update', 'delete'],
  reservations: ['read', 'create', 'update', 'cancel', 'checkin', 'checkout'],
  analytics: ['read'],
  auditLogs: ['read'],
};

// Member session with limited permissions
export const mockMemberSession: SessionData = {
  user: {
    id: 'user_2',
    email: 'member@example.com',
    name: 'Member User',
    isSuperAdmin: false,
  },
  activeHotel: {
    id: 'hotel_1',
    name: 'Test Hotel',
    slug: 'test-hotel',
  },
  hotels: [
    {
      id: 'hotel_1',
      name: 'Test Hotel',
      slug: 'test-hotel',
    },
  ],
  activeMember: {
    id: 'member_2',
    role: 'member',
  },
  permissions: {
    hotel: ['read'],
    roomTypes: ['read'],
    rooms: ['read'],
    guests: ['read', 'create', 'update'],
    reservations: ['read', 'create', 'update', 'checkin', 'checkout'],
  },
};

export const mockMemberPermissions: MutablePermissions = {
  hotel: ['read'],
  roomTypes: ['read'],
  rooms: ['read'],
  guests: ['read', 'create', 'update'],
  reservations: ['read', 'create', 'update', 'checkin', 'checkout'],
};

// Owner session with all permissions
export const mockOwnerSession: SessionData = {
  user: {
    id: 'user_3',
    email: 'owner@example.com',
    name: 'Owner User',
    isSuperAdmin: false,
  },
  activeHotel: {
    id: 'hotel_1',
    name: 'Test Hotel',
    slug: 'test-hotel',
  },
  hotels: [
    {
      id: 'hotel_1',
      name: 'Test Hotel',
      slug: 'test-hotel',
    },
  ],
  activeMember: {
    id: 'member_3',
    role: 'owner',
  },
  permissions: {
    organization: ['update', 'delete'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    hotel: ['read', 'update'],
    roomTypes: ['read', 'create', 'update', 'delete'],
    rooms: ['read', 'create', 'update', 'delete'],
    activityTypes: ['read', 'create', 'update', 'delete'],
    activitySlots: ['read', 'create', 'update', 'delete'],
    inventory: ['read', 'update'],
    pricingRules: ['read', 'create', 'update', 'delete'],
    guests: ['read', 'create', 'update', 'delete'],
    reservations: ['read', 'create', 'update', 'cancel', 'checkin', 'checkout'],
    analytics: ['read'],
    auditLogs: ['read'],
  },
};

// Super Admin session
export const mockSuperAdminSession: SessionData = {
  user: {
    id: 'user_super',
    email: 'superadmin@example.com',
    name: 'Super Admin',
    isSuperAdmin: true,
  },
  activeHotel: null,
  hotels: [],
  activeMember: null,
  permissions: null,
  message: 'No active hotel selected',
};

// Dashboard metrics
export const mockMetrics: Metrics = {
  totalRevenue: 45231.89,
  subscriptions: 2350,
  sales: 12234,
  activeNow: 573,
};

// SSE event fixtures for reservations
export const mockReservationUpdatedEvent = {
  type: 'reservation.updated' as const,
  id: 'RES-00001',
  patch: { status: 'confirmed' as const },
  ts: Date.now(),
};

export const mockReservationCreatedEvent = {
  type: 'reservation.created' as const,
  id: 'RES-00051',
  patch: {
    id: 'RES-00051',
    status: 'pending' as const,
    guestId: 'guest_1',
    guestName: 'New Guest',
    checkInDate: new Date().toISOString(),
    checkOutDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    totalPrice: '599.99',
    createdAt: new Date().toISOString(),
  },
  ts: Date.now(),
};
