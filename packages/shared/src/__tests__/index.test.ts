import { describe, it, expect } from 'vitest';
import {
  OrderSchema,
  OrdersQuerySchema,
  MetricsSchema,
  OrderEventSchema,
  createSuccessEnvelope,
  createErrorEnvelope,
  responseEnvelope,
  admin,
  staff,
} from '../index';

describe('Order Schemas', () => {
  describe('OrderSchema', () => {
    it('validates a valid order', () => {
      const order = {
        id: 'ORD-00001',
        status: 'pending',
        customer: 'Test Customer',
        amount: 99.99,
        createdAt: '2025-01-15T10:00:00Z',
      };

      const result = OrderSchema.safeParse(order);
      expect(result.success).toBe(true);
    });

    it('rejects invalid status', () => {
      const order = {
        id: 'ORD-00001',
        status: 'invalid_status',
        customer: 'Test Customer',
        amount: 99.99,
        createdAt: '2025-01-15T10:00:00Z',
      };

      const result = OrderSchema.safeParse(order);
      expect(result.success).toBe(false);
    });

    it('accepts all valid statuses', () => {
      const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

      statuses.forEach((status) => {
        const order = {
          id: 'ORD-00001',
          status,
          customer: 'Test Customer',
          amount: 99.99,
          createdAt: '2025-01-15T10:00:00Z',
        };

        const result = OrderSchema.safeParse(order);
        expect(result.success).toBe(true);
      });
    });

    it('rejects missing required fields', () => {
      const order = {
        id: 'ORD-00001',
        status: 'pending',
        // missing customer, amount, createdAt
      };

      const result = OrderSchema.safeParse(order);
      expect(result.success).toBe(false);
    });
  });

  describe('OrdersQuerySchema', () => {
    it('validates and coerces query parameters', () => {
      const query = {
        page: '1',
        pageSize: '10',
      };

      const result = OrdersQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(10);
      }
    });

    it('provides default values', () => {
      const query = {};

      const result = OrdersQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(10);
      }
    });

    it('validates optional search parameter', () => {
      const query = {
        page: '1',
        search: 'customer name',
      };

      const result = OrdersQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search).toBe('customer name');
      }
    });

    it('validates optional status filter', () => {
      const query = {
        status: 'pending',
      };

      const result = OrdersQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('pending');
      }
    });

    it('validates sort parameter', () => {
      const sortOptions = ['id', 'customer', 'amount', 'createdAt', '-id', '-customer', '-amount', '-createdAt'];

      sortOptions.forEach((sort) => {
        const result = OrdersQuerySchema.safeParse({ sort });
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid sort values', () => {
      const result = OrdersQuerySchema.safeParse({ sort: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('enforces page minimum of 1', () => {
      const result = OrdersQuerySchema.safeParse({ page: '0' });
      expect(result.success).toBe(false);
    });

    it('enforces pageSize maximum of 100', () => {
      const result = OrdersQuerySchema.safeParse({ pageSize: '101' });
      expect(result.success).toBe(false);
    });
  });
});

describe('MetricsSchema', () => {
  it('validates valid metrics', () => {
    const metrics = {
      totalRevenue: 45231.89,
      subscriptions: 2350,
      sales: 12234,
      activeNow: 573,
    };

    const result = MetricsSchema.safeParse(metrics);
    expect(result.success).toBe(true);
  });

  it('rejects non-numeric values', () => {
    const metrics = {
      totalRevenue: 'not a number',
      subscriptions: 2350,
      sales: 12234,
      activeNow: 573,
    };

    const result = MetricsSchema.safeParse(metrics);
    expect(result.success).toBe(false);
  });
});

describe('OrderEventSchema', () => {
  it('validates order.updated event', () => {
    const event = {
      type: 'order.updated',
      id: 'ORD-00001',
      patch: { status: 'shipped' },
      ts: Date.now(),
    };

    const result = OrderEventSchema.safeParse(event);
    expect(result.success).toBe(true);
  });

  it('validates order.created event', () => {
    const event = {
      type: 'order.created',
      id: 'ORD-00002',
      patch: {
        id: 'ORD-00002',
        status: 'pending',
        customer: 'New Customer',
        amount: 199.99,
      },
      ts: Date.now(),
    };

    const result = OrderEventSchema.safeParse(event);
    expect(result.success).toBe(true);
  });

  it('rejects invalid event type', () => {
    const event = {
      type: 'order.deleted', // not a valid type
      id: 'ORD-00001',
      patch: {},
      ts: Date.now(),
    };

    const result = OrderEventSchema.safeParse(event);
    expect(result.success).toBe(false);
  });
});

describe('Response Envelope Functions', () => {
  describe('createSuccessEnvelope', () => {
    it('creates success envelope with data', () => {
      const data = { id: 1, name: 'Test' };
      const envelope = createSuccessEnvelope(data);

      expect(envelope.data).toEqual(data);
      expect(envelope.error).toBeNull();
      expect(envelope.meta.requestId).toBeDefined();
    });

    it('includes additional meta fields', () => {
      const data = [1, 2, 3];
      const envelope = createSuccessEnvelope(data, { total: 3, page: 1 });

      expect(envelope.data).toEqual([1, 2, 3]);
      expect(envelope.meta.total).toBe(3);
      expect(envelope.meta.page).toBe(1);
    });
  });

  describe('createErrorEnvelope', () => {
    it('creates error envelope with code and message', () => {
      const envelope = createErrorEnvelope('NOT_FOUND', 'Resource not found');

      expect(envelope.data).toBeNull();
      expect(envelope.error?.code).toBe('NOT_FOUND');
      expect(envelope.error?.message).toBe('Resource not found');
      expect(envelope.meta.requestId).toBeDefined();
    });

    it('includes optional details', () => {
      const envelope = createErrorEnvelope('VALIDATION_ERROR', 'Invalid input', {
        field: 'email',
        reason: 'Invalid format',
      });

      expect(envelope.error?.details).toEqual({
        field: 'email',
        reason: 'Invalid format',
      });
    });
  });

  describe('responseEnvelope', () => {
    it('creates success envelope when no error provided', () => {
      const data = { test: 'value' };
      const envelope = responseEnvelope(data);

      expect(envelope.data).toEqual(data);
      expect(envelope.error).toBeNull();
    });

    it('creates error envelope when error code provided', () => {
      const envelope = responseEnvelope(null, 'ERROR_CODE', 'Error message');

      expect(envelope.data).toBeNull();
      expect(envelope.error?.code).toBe('ERROR_CODE');
      expect(envelope.error?.message).toBe('Error message');
    });
  });
});

describe('Role Permissions', () => {
  describe('admin role', () => {
    it('has hotel update permission but not delete', () => {
      expect(admin.statements.hotel).toContain('read');
      expect(admin.statements.hotel).toContain('update');
      expect(admin.statements.hotel).not.toContain('delete');
    });

    it('has all guest permissions', () => {
      expect(admin.statements.guests).toContain('read');
      expect(admin.statements.guests).toContain('create');
      expect(admin.statements.guests).toContain('update');
      expect(admin.statements.guests).toContain('delete');
    });

    it('has all reservation permissions including cancel', () => {
      expect(admin.statements.reservations).toContain('read');
      expect(admin.statements.reservations).toContain('create');
      expect(admin.statements.reservations).toContain('cancel');
      expect(admin.statements.reservations).toContain('checkin');
      expect(admin.statements.reservations).toContain('checkout');
    });

    it('has analytics read permission', () => {
      expect(admin.statements.analytics).toContain('read');
    });

    it('has audit logs read permission', () => {
      expect(admin.statements.auditLogs).toContain('read');
    });

    it('can manage room types', () => {
      expect(admin.statements.roomTypes).toContain('read');
      expect(admin.statements.roomTypes).toContain('create');
      expect(admin.statements.roomTypes).toContain('update');
      expect(admin.statements.roomTypes).toContain('delete');
    });
  });

  describe('staff role', () => {
    it('has hotel read permission only', () => {
      expect(admin.statements.hotel).toContain('read');
      expect(staff.statements.hotel).not.toContain('update');
      expect(staff.statements.hotel).not.toContain('delete');
    });

    it('can read and create guests but not update or delete', () => {
      expect(staff.statements.guests).toContain('read');
      expect(staff.statements.guests).toContain('create');
      expect(staff.statements.guests).not.toContain('update');
      expect(staff.statements.guests).not.toContain('delete');
    });

    it('can handle reservations but not cancel', () => {
      expect(staff.statements.reservations).toContain('read');
      expect(staff.statements.reservations).toContain('create');
      expect(staff.statements.reservations).toContain('checkin');
      expect(staff.statements.reservations).toContain('checkout');
      expect(staff.statements.reservations).not.toContain('cancel');
      expect(staff.statements.reservations).not.toContain('update');
    });

    it('has no analytics access', () => {
      expect(staff.statements.analytics).toHaveLength(0);
    });

    it('has no audit logs access', () => {
      expect(staff.statements.auditLogs).toHaveLength(0);
    });

    it('has no pricing rules access', () => {
      expect(staff.statements.pricingRules).toHaveLength(0);
    });
  });
});
