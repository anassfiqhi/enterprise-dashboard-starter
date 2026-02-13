import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { db } from '../db';
import { activitySlot, activityType } from '../db/schema';
import { requirePermission } from '../middleware/rbac';
import { createSuccessEnvelope, createErrorEnvelope } from '@repo/shared';
import { logCreate, logUpdate, logDelete } from '../utils/audit';
import { nanoid } from 'nanoid';

const app = new Hono();

// Validation schemas
const createActivitySlotSchema = z.object({
    activityTypeId: z.string().min(1),
    startTime: z.string().datetime(), // ISO datetime
    endTime: z.string().datetime(),
    availableSpots: z.number().min(1),
    price: z.string().optional().nullable(), // Override price
});

const updateActivitySlotSchema = z.object({
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    availableSpots: z.number().min(1).optional(),
    price: z.string().optional().nullable(),
});

const listActivitySlotsQuerySchema = z.object({
    activityTypeId: z.string().optional(),
    startFrom: z.string().optional(), // ISO datetime
    startTo: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
});

/**
 * GET /activity-slots
 * List activity slots for the active hotel
 */
app.get(
    '/',
    requirePermission({ activitySlots: ['read'] }),
    zValidator('query', listActivitySlotsQuerySchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const { activityTypeId, startFrom, startTo, limit, offset } = c.req.valid('query');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required'), 400);
        }

        const conditions = [eq(activitySlot.hotelId, hotelId)];
        if (activityTypeId) {
            conditions.push(eq(activitySlot.activityTypeId, activityTypeId));
        }
        if (startFrom) {
            conditions.push(gte(activitySlot.startTime, new Date(startFrom)));
        }
        if (startTo) {
            conditions.push(lte(activitySlot.startTime, new Date(startTo)));
        }

        const slots = await db
            .select({
                slot: activitySlot,
                activityType: {
                    id: activityType.id,
                    name: activityType.name,
                    basePrice: activityType.basePrice,
                },
            })
            .from(activitySlot)
            .leftJoin(activityType, eq(activitySlot.activityTypeId, activityType.id))
            .where(and(...conditions))
            .orderBy(activitySlot.startTime)
            .limit(limit)
            .offset(offset);

        return c.json(createSuccessEnvelope({ slots, limit, offset }));
    }
);

/**
 * GET /activity-slots/:id
 * Get activity slot details
 */
app.get(
    '/:id',
    requirePermission({ activitySlots: ['read'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const slotId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(activitySlot.id, slotId)
            : and(eq(activitySlot.id, slotId), eq(activitySlot.hotelId, hotelId));

        const [result] = await db
            .select({
                slot: activitySlot,
                activityType: activityType,
            })
            .from(activitySlot)
            .leftJoin(activityType, eq(activitySlot.activityTypeId, activityType.id))
            .where(conditions);

        if (!result) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Activity slot not found'), 404);
        }

        return c.json(createSuccessEnvelope(result));
    }
);

/**
 * POST /activity-slots
 * Create a new activity slot
 */
app.post(
    '/',
    requirePermission({ activitySlots: ['create'] }),
    zValidator('json', createActivitySlotSchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const data = c.req.valid('json');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required'), 400);
        }

        // Verify activity type exists and belongs to hotel
        const [foundActivityType] = await db
            .select()
            .from(activityType)
            .where(and(eq(activityType.id, data.activityTypeId), eq(activityType.hotelId, hotelId)));

        if (!foundActivityType) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Activity type not found'), 404);
        }

        const newSlot = {
            id: nanoid(),
            hotelId,
            activityTypeId: data.activityTypeId,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            availableSpots: data.availableSpots,
            bookedSpots: 0,
            price: data.price ?? null,
        };

        const [created] = await db.insert(activitySlot).values(newSlot).returning();

        await logCreate(c, 'activity_slot', created.id, created);

        return c.json(createSuccessEnvelope({ slot: created }), 201);
    }
);

/**
 * POST /activity-slots/bulk
 * Create multiple activity slots
 */
app.post(
    '/bulk',
    requirePermission({ activitySlots: ['create'] }),
    zValidator('json', z.object({
        activityTypeId: z.string().min(1),
        slots: z.array(z.object({
            startTime: z.string().datetime(),
            endTime: z.string().datetime(),
            availableSpots: z.number().min(1),
            price: z.string().optional().nullable(),
        })).min(1).max(50),
    })),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const data = c.req.valid('json');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required'), 400);
        }

        // Verify activity type exists and belongs to hotel
        const [foundActivityType] = await db
            .select()
            .from(activityType)
            .where(and(eq(activityType.id, data.activityTypeId), eq(activityType.hotelId, hotelId)));

        if (!foundActivityType) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Activity type not found'), 404);
        }

        const newSlots = data.slots.map((slot) => ({
            id: nanoid(),
            hotelId,
            activityTypeId: data.activityTypeId,
            startTime: new Date(slot.startTime),
            endTime: new Date(slot.endTime),
            availableSpots: slot.availableSpots,
            bookedSpots: 0,
            price: slot.price ?? null,
        }));

        const created = await db.insert(activitySlot).values(newSlots).returning();

        return c.json(createSuccessEnvelope({ slots: created, count: created.length }), 201);
    }
);

/**
 * PATCH /activity-slots/:id
 * Update an activity slot
 */
app.patch(
    '/:id',
    requirePermission({ activitySlots: ['update'] }),
    zValidator('json', updateActivitySlotSchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const slotId = c.req.param('id');
        const data = c.req.valid('json');

        const conditions = isSuperAdmin && !hotelId
            ? eq(activitySlot.id, slotId)
            : and(eq(activitySlot.id, slotId), eq(activitySlot.hotelId, hotelId));

        const [existing] = await db.select().from(activitySlot).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Activity slot not found'), 404);
        }

        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (data.startTime !== undefined) updateData.startTime = new Date(data.startTime);
        if (data.endTime !== undefined) updateData.endTime = new Date(data.endTime);
        if (data.availableSpots !== undefined) updateData.availableSpots = data.availableSpots;
        if (data.price !== undefined) updateData.price = data.price;

        const [updated] = await db
            .update(activitySlot)
            .set(updateData)
            .where(eq(activitySlot.id, slotId))
            .returning();

        await logUpdate(c, 'activity_slot', slotId, existing, updated);

        return c.json(createSuccessEnvelope({ slot: updated }));
    }
);

/**
 * DELETE /activity-slots/:id
 * Delete an activity slot (only if no bookings)
 */
app.delete(
    '/:id',
    requirePermission({ activitySlots: ['delete'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const slotId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(activitySlot.id, slotId)
            : and(eq(activitySlot.id, slotId), eq(activitySlot.hotelId, hotelId));

        const [existing] = await db.select().from(activitySlot).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Activity slot not found'), 404);
        }

        if (existing.bookedSpots > 0) {
            return c.json(
                createErrorEnvelope('CONFLICT', 'Cannot delete slot with existing bookings'),
                409
            );
        }

        await db.delete(activitySlot).where(eq(activitySlot.id, slotId));
        await logDelete(c, 'activity_slot', slotId, existing);

        return c.json(createSuccessEnvelope({ deleted: true }));
    }
);

export default app;
