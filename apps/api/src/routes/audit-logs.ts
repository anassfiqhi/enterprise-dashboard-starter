import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc, gte, lte, ilike } from 'drizzle-orm';
import { db } from '../db';
import { auditLog } from '../db/schema';
import { requirePermission } from '../middleware/rbac';
import { createSuccessEnvelope, createErrorEnvelope } from '@repo/shared';

const app = new Hono();

// Validation schemas
const listAuditLogsQuerySchema = z.object({
    userId: z.string().optional(),
    resource: z.string().optional(),
    action: z.string().optional(),
    resourceId: z.string().optional(),
    dateFrom: z.string().optional(), // ISO datetime
    dateTo: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
});

/**
 * GET /audit-logs
 * List audit logs for the active hotel
 */
app.get(
    '/',
    requirePermission({ auditLogs: ['read'] }),
    zValidator('query', listAuditLogsQuerySchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const { userId, resource, action, resourceId, dateFrom, dateTo, limit, offset } = c.req.valid('query');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required'), 400);
        }

        const conditions = [eq(auditLog.hotelId, hotelId)];

        if (userId) {
            conditions.push(eq(auditLog.userId, userId));
        }
        if (resource) {
            conditions.push(eq(auditLog.resource, resource));
        }
        if (action) {
            conditions.push(eq(auditLog.action, action));
        }
        if (resourceId) {
            conditions.push(eq(auditLog.resourceId, resourceId));
        }
        if (dateFrom) {
            conditions.push(gte(auditLog.createdAt, new Date(dateFrom)));
        }
        if (dateTo) {
            conditions.push(lte(auditLog.createdAt, new Date(dateTo)));
        }

        const logs = await db
            .select()
            .from(auditLog)
            .where(and(...conditions))
            .orderBy(desc(auditLog.createdAt))
            .limit(limit)
            .offset(offset);

        // Parse JSON fields
        const parsed = logs.map((log) => ({
            ...log,
            previousValue: log.previousValue ? JSON.parse(log.previousValue) : null,
            newValue: log.newValue ? JSON.parse(log.newValue) : null,
        }));

        return c.json(createSuccessEnvelope({ logs: parsed, limit, offset }));
    }
);

/**
 * GET /audit-logs/:id
 * Get audit log details
 */
app.get(
    '/:id',
    requirePermission({ auditLogs: ['read'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const logId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(auditLog.id, logId)
            : and(eq(auditLog.id, logId), eq(auditLog.hotelId, hotelId));

        const [log] = await db.select().from(auditLog).where(conditions);

        if (!log) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Audit log not found'), 404);
        }

        return c.json(createSuccessEnvelope({
            log: {
                ...log,
                previousValue: log.previousValue ? JSON.parse(log.previousValue) : null,
                newValue: log.newValue ? JSON.parse(log.newValue) : null,
            },
        }));
    }
);

/**
 * GET /audit-logs/resource/:resource/:resourceId
 * Get audit history for a specific resource
 */
app.get(
    '/resource/:resource/:resourceId',
    requirePermission({ auditLogs: ['read'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const resource = c.req.param('resource');
        const resourceId = c.req.param('resourceId');

        const conditions = [
            eq(auditLog.resource, resource),
            eq(auditLog.resourceId, resourceId),
        ];

        if (!isSuperAdmin || hotelId) {
            conditions.push(eq(auditLog.hotelId, hotelId));
        }

        const logs = await db
            .select()
            .from(auditLog)
            .where(and(...conditions))
            .orderBy(desc(auditLog.createdAt))
            .limit(100);

        const parsed = logs.map((log) => ({
            ...log,
            previousValue: log.previousValue ? JSON.parse(log.previousValue) : null,
            newValue: log.newValue ? JSON.parse(log.newValue) : null,
        }));

        return c.json(createSuccessEnvelope({ logs: parsed }));
    }
);

export default app;
