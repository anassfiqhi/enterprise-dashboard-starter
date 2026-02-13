import { z } from 'zod';

// ============================================================================
// User & Role Schemas
// ============================================================================

export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['admin', 'user']),
});

export type User = z.infer<typeof UserSchema>;

// ============================================================================
// Order Schemas
// ============================================================================

export const OrderSchema = z.object({
    id: z.string(),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    customer: z.string(),
    amount: z.number(),
    createdAt: z.string(),
});

export type Order = z.infer<typeof OrderSchema>;

// Query parameters for orders list endpoint
export const OrdersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
    sort: z.enum(['id', 'customer', 'amount', 'createdAt', '-id', '-customer', '-amount', '-createdAt']).optional(),
});

export type OrdersQuery = z.infer<typeof OrdersQuerySchema>;

// ============================================================================
// Response Envelope (SPEC Section 6.2)
// ============================================================================

export interface ResponseEnvelope<T> {
    data: T | null;
    meta: {
        requestId: string;
        [key: string]: any;
    };
    error: {
        code: string;
        message: string;
        details?: any;
    } | null;
}

// Helper to create success envelope
export function createSuccessEnvelope<T>(data: T, meta: Record<string, any> = {}): ResponseEnvelope<T> {
    return {
        data,
        meta: {
            requestId: crypto.randomUUID(),
            ...meta,
        },
        error: null,
    };
}

// Helper to create error envelope
export function createErrorEnvelope(code: string, message: string, details?: any): ResponseEnvelope<null> {
    return {
        data: null,
        meta: {
            requestId: crypto.randomUUID(),
        },
        error: {
            code,
            message,
            details,
        },
    };
}

// Unified helper for both success and error envelopes
export function responseEnvelope<T>(data: T | null, errorCode?: string, errorMessage?: string): ResponseEnvelope<T> {
    if (errorCode || errorMessage) {
        return {
            data: null,
            meta: { requestId: crypto.randomUUID() },
            error: { code: errorCode || 'UNKNOWN_ERROR', message: errorMessage || 'An error occurred' },
        } as ResponseEnvelope<T>;
    }
    return {
        data,
        meta: { requestId: crypto.randomUUID() },
        error: null,
    };
}

// ============================================================================
// Organization-Based Access Control Types (SPEC Section 5)
// Hotel Management Permissions
// ============================================================================

export type OrganizationRole = 'admin' | 'staff';

export interface OrganizationPermissions {
    // Better Auth defaults
    organization?: readonly string[];
    member?: readonly string[];
    invitation?: readonly string[];
    // Hotel configuration
    hotel?: readonly string[];
    roomTypes?: readonly string[];
    rooms?: readonly string[];
    activityTypes?: readonly string[];
    activitySlots?: readonly string[];
    inventory?: readonly string[];
    pricingRules?: readonly string[];
    promoCodes?: readonly string[];
    // Guest & Reservations
    guests?: readonly string[];
    reservations?: readonly string[];
    // Admin features
    analytics?: readonly string[];
    auditLogs?: readonly string[];
}

export interface SessionData {
    user: {
        id: string;
        email: string;
        name: string | null;
        image?: string | null;
        isSuperAdmin: boolean;
    };
    activeHotel: {
        id: string;
        name: string;
        slug: string;
    } | null;
    hotels: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    activeMember: {
        id: string;
        role: OrganizationRole;
    } | null;
    permissions: OrganizationPermissions | null;
    message?: string;
}

// ============================================================================
// SSE Event Types (SPEC Section 7.2)
// ============================================================================

export interface SSEEvent<T = any> {
    type: string;
    id: string;
    patch: T;
    ts: number;
}

// Specific event types
export interface OrderUpdatedEvent extends SSEEvent<Partial<Order>> {
    type: 'order.updated';
}

export interface OrderCreatedEvent extends SSEEvent<Order> {
    type: 'order.created';
}

export type OrderEvent = OrderUpdatedEvent | OrderCreatedEvent;

// Zod schemas for SSE event validation
export const OrderEventSchema = z.object({
    type: z.enum(['order.updated', 'order.created']),
    id: z.string(),
    patch: z.record(z.string(), z.any()), // Flexible patch object (key: string, value: any)
    ts: z.number(),
});

// ============================================================================
// Metrics Schema
// ============================================================================

export const MetricsSchema = z.object({
    totalRevenue: z.number(),
    subscriptions: z.number(),
    sales: z.number(),
    activeNow: z.number(),
});

export type Metrics = z.infer<typeof MetricsSchema>;

// ============================================================================
// Organization Access Control (Better Auth Plugin)
// ============================================================================

export { ac, admin, staff, statement } from './permissions';

// ============================================================================
// Booking Types (from booking-engine integration)
// ============================================================================

export * from './booking';
