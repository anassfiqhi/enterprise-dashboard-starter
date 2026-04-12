import type { SessionData, OrganizationPermissions } from '@repo/shared';

export const mockAdminPermissions: OrganizationPermissions = {
  organization: ['create', 'update', 'delete', 'read'],
  member: ['create', 'update', 'delete', 'read'],
  invitation: ['create', 'delete', 'read'],
  hotel: ['create', 'update', 'delete', 'read'],
  roomTypes: ['create', 'update', 'delete', 'read'],
  rooms: ['create', 'update', 'delete', 'read'],
  activityTypes: ['create', 'update', 'delete', 'read'],
  activitySlots: ['create', 'update', 'delete', 'read'],
  inventory: ['create', 'update', 'delete', 'read'],
  pricingRules: ['create', 'update', 'delete', 'read'],
  promoCodes: ['create', 'update', 'delete', 'read'],
  guests: ['create', 'update', 'delete', 'read'],
  reservations: ['create', 'update', 'delete', 'read'],
  analytics: ['read'],
  auditLogs: ['read'],
};

export const mockStaffPermissions: OrganizationPermissions = {
  organization: ['read'],
  member: ['read'],
  invitation: ['read'],
  hotel: ['read'],
  roomTypes: ['read'],
  rooms: ['read'],
  activityTypes: ['read'],
  activitySlots: ['read'],
  inventory: ['read'],
  pricingRules: ['read'],
  promoCodes: ['read'],
  guests: ['create', 'update', 'read'],
  reservations: ['create', 'update', 'read'],
  analytics: [],
  auditLogs: [],
};

export const mockAdminSession: SessionData = {
  user: {
    id: 'user_admin_1',
    email: 'admin@hotel.com',
    name: 'Admin User',
    image: null,
    isAdmin: false,
  },
  activeHotel: {
    id: 'hotel_1',
    name: 'Grand Hotel',
    slug: 'grand-hotel',
  },
  hotels: [
    { id: 'hotel_1', name: 'Grand Hotel', slug: 'grand-hotel' },
    { id: 'hotel_2', name: 'City Inn', slug: 'city-inn' },
  ],
  activeMember: {
    id: 'member_1',
    role: 'admin',
  },
  permissions: mockAdminPermissions,
};

export const mockStaffSession: SessionData = {
  user: {
    id: 'user_staff_1',
    email: 'staff@hotel.com',
    name: 'Staff User',
    image: null,
    isAdmin: false,
  },
  activeHotel: {
    id: 'hotel_1',
    name: 'Grand Hotel',
    slug: 'grand-hotel',
  },
  hotels: [{ id: 'hotel_1', name: 'Grand Hotel', slug: 'grand-hotel' }],
  activeMember: {
    id: 'member_2',
    role: 'staff',
  },
  permissions: mockStaffPermissions,
};

export const mockOwnerSession: SessionData = {
  ...mockAdminSession,
  user: {
    id: 'user_owner_1',
    email: 'owner@hotel.com',
    name: 'Owner User',
    image: null,
    isAdmin: false,
  },
  activeMember: {
    id: 'member_3',
    role: 'owner',
  },
};

export const mockSuperAdminSession: SessionData = {
  ...mockAdminSession,
  user: {
    id: 'user_superadmin_1',
    email: 'superadmin@system.com',
    name: 'Super Admin',
    image: null,
    isAdmin: true,
  },
  activeMember: null,
  permissions: null,
};

export const mockMetrics = {
  totalRevenue: 125430.5,
  subscriptions: 342,
  sales: 1289,
  activeNow: 47,
};
