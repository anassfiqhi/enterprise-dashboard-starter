import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { pricingRule, roomType } from '../db/schema';
import { requirePermission } from '../middleware/rbac';
import { createSuccessEnvelope, createErrorEnvelope } from '@repo/shared';
import { logCreate, logUpdate, logDelete } from '../utils/audit';
import { nanoid } from 'nanoid';

const app = new Hono();

// Validation schemas
const createPricingRuleSchema = z.object({
    name: z.string().min(1).max(100),
    type: z.enum(['percentage', 'fixed', 'override']),
    value: z.string().min(1), // Amount or percentage
    roomTypeId: z.string().optional().nullable(), // null = all rooms
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional().nullable(), // 0=Sunday
    priority: z.number().min(0).max(100).default(0),
    isActive: z.boolean().default(true),
});

const updatePricingRuleSchema = createPricingRuleSchema.partial();

const listPricingRulesQuerySchema = z.object({
    roomTypeId: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
});

/**
 * GET /pricing-rules
 * List pricing rules for the active hotel
 */
app.get(
    '/',
    requirePermission({ pricingRules: ['read'] }),
    zValidator('query', listPricingRulesQuerySchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const { roomTypeId, isActive, limit, offset } = c.req.valid('query');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required'), 400);
        }

        const conditions = [eq(pricingRule.hotelId, hotelId)];
        if (roomTypeId) {
            conditions.push(eq(pricingRule.roomTypeId, roomTypeId));
        }
        if (isActive !== undefined) {
            conditions.push(eq(pricingRule.isActive, isActive));
        }

        const rules = await db
            .select({
                rule: pricingRule,
                roomType: {
                    id: roomType.id,
                    name: roomType.name,
                },
            })
            .from(pricingRule)
            .leftJoin(roomType, eq(pricingRule.roomTypeId, roomType.id))
            .where(and(...conditions))
            .orderBy(desc(pricingRule.priority), desc(pricingRule.createdAt))
            .limit(limit)
            .offset(offset);

        // Parse JSON fields
        const parsed = rules.map((r) => ({
            ...r,
            rule: {
                ...r.rule,
                daysOfWeek: r.rule.daysOfWeek ? JSON.parse(r.rule.daysOfWeek) : null,
            },
        }));

        return c.json(createSuccessEnvelope({ rules: parsed, limit, offset }));
    }
);

/**
 * GET /pricing-rules/:id
 * Get pricing rule details
 */
app.get(
    '/:id',
    requirePermission({ pricingRules: ['read'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const ruleId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(pricingRule.id, ruleId)
            : and(eq(pricingRule.id, ruleId), eq(pricingRule.hotelId, hotelId));

        const [result] = await db
            .select({
                rule: pricingRule,
                roomType: roomType,
            })
            .from(pricingRule)
            .leftJoin(roomType, eq(pricingRule.roomTypeId, roomType.id))
            .where(conditions);

        if (!result) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Pricing rule not found'), 404);
        }

        return c.json(createSuccessEnvelope({
            ...result,
            rule: {
                ...result.rule,
                daysOfWeek: result.rule.daysOfWeek ? JSON.parse(result.rule.daysOfWeek) : null,
            },
        }));
    }
);

/**
 * POST /pricing-rules
 * Create a new pricing rule
 */
app.post(
    '/',
    requirePermission({ pricingRules: ['create'] }),
    zValidator('json', createPricingRuleSchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const data = c.req.valid('json');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required'), 400);
        }

        // Verify room type if provided
        if (data.roomTypeId) {
            const [foundRoomType] = await db
                .select()
                .from(roomType)
                .where(and(eq(roomType.id, data.roomTypeId), eq(roomType.hotelId, hotelId)));

            if (!foundRoomType) {
                return c.json(createErrorEnvelope('NOT_FOUND', 'Room type not found'), 404);
            }
        }

        const newRule = {
            id: nanoid(),
            hotelId,
            name: data.name,
            type: data.type,
            value: data.value,
            roomTypeId: data.roomTypeId ?? null,
            startDate: data.startDate ?? null,
            endDate: data.endDate ?? null,
            daysOfWeek: data.daysOfWeek ? JSON.stringify(data.daysOfWeek) : null,
            priority: data.priority,
            isActive: data.isActive,
        };

        const [created] = await db.insert(pricingRule).values(newRule).returning();

        await logCreate(c, 'pricing_rule', created.id, created);

        return c.json(createSuccessEnvelope({
            rule: {
                ...created,
                daysOfWeek: data.daysOfWeek ?? null,
            },
        }), 201);
    }
);

/**
 * PATCH /pricing-rules/:id
 * Update a pricing rule
 */
app.patch(
    '/:id',
    requirePermission({ pricingRules: ['update'] }),
    zValidator('json', updatePricingRuleSchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const ruleId = c.req.param('id');
        const data = c.req.valid('json');

        const conditions = isSuperAdmin && !hotelId
            ? eq(pricingRule.id, ruleId)
            : and(eq(pricingRule.id, ruleId), eq(pricingRule.hotelId, hotelId));

        const [existing] = await db.select().from(pricingRule).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Pricing rule not found'), 404);
        }

        // Verify room type if changing
        if (data.roomTypeId !== undefined && data.roomTypeId !== null) {
            const [foundRoomType] = await db
                .select()
                .from(roomType)
                .where(and(eq(roomType.id, data.roomTypeId), eq(roomType.hotelId, existing.hotelId)));

            if (!foundRoomType) {
                return c.json(createErrorEnvelope('NOT_FOUND', 'Room type not found'), 404);
            }
        }

        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (data.name !== undefined) updateData.name = data.name;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.value !== undefined) updateData.value = data.value;
        if (data.roomTypeId !== undefined) updateData.roomTypeId = data.roomTypeId;
        if (data.startDate !== undefined) updateData.startDate = data.startDate;
        if (data.endDate !== undefined) updateData.endDate = data.endDate;
        if (data.daysOfWeek !== undefined) updateData.daysOfWeek = data.daysOfWeek ? JSON.stringify(data.daysOfWeek) : null;
        if (data.priority !== undefined) updateData.priority = data.priority;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const [updated] = await db
            .update(pricingRule)
            .set(updateData)
            .where(eq(pricingRule.id, ruleId))
            .returning();

        await logUpdate(c, 'pricing_rule', ruleId, existing, updated);

        return c.json(createSuccessEnvelope({
            rule: {
                ...updated,
                daysOfWeek: updated.daysOfWeek ? JSON.parse(updated.daysOfWeek) : null,
            },
        }));
    }
);

/**
 * DELETE /pricing-rules/:id
 * Delete a pricing rule
 */
app.delete(
    '/:id',
    requirePermission({ pricingRules: ['delete'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const ruleId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(pricingRule.id, ruleId)
            : and(eq(pricingRule.id, ruleId), eq(pricingRule.hotelId, hotelId));

        const [existing] = await db.select().from(pricingRule).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Pricing rule not found'), 404);
        }

        await db.delete(pricingRule).where(eq(pricingRule.id, ruleId));
        await logDelete(c, 'pricing_rule', ruleId, existing);

        return c.json(createSuccessEnvelope({ deleted: true }));
    }
);

export default app;
