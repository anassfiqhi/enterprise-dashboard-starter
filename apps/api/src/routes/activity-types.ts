import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { activityType } from '../db/schema';
import { requirePermission } from '../middleware/rbac';
import { createSuccessEnvelope, createErrorEnvelope } from '@repo/shared';
import { logCreate, logUpdate, logDelete } from '../utils/audit';
import { nanoid } from 'nanoid';

const app = new Hono();

// Validation schemas
const createActivityTypeSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional().nullable(),
    basePrice: z.string().min(1),
    durationMinutes: z.number().min(15).max(480).default(60),
    maxParticipants: z.number().min(1).max(100).default(1),
    images: z.array(z.string().url()).optional().nullable(),
    isActive: z.boolean().default(true),
});

const updateActivityTypeSchema = createActivityTypeSchema.partial();

const listActivityTypesQuerySchema = z.object({
    isActive: z.coerce.boolean().optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
});

/**
 * GET /activity-types
 * List activity types for the active hotel
 */
app.get(
    '/',
    requirePermission({ activityTypes: ['read'] }),
    zValidator('query', listActivityTypesQuerySchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const { isActive, limit, offset } = c.req.valid('query');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required'), 400);
        }

        const conditions = [eq(activityType.hotelId, hotelId)];
        if (isActive !== undefined) {
            conditions.push(eq(activityType.isActive, isActive));
        }

        const activityTypes = await db
            .select()
            .from(activityType)
            .where(and(...conditions))
            .orderBy(desc(activityType.createdAt))
            .limit(limit)
            .offset(offset);

        // Parse JSON fields
        const parsed = activityTypes.map((at) => ({
            ...at,
            images: at.images ? JSON.parse(at.images) : [],
        }));

        return c.json(createSuccessEnvelope({ activityTypes: parsed, limit, offset }));
    }
);

/**
 * GET /activity-types/:id
 * Get activity type details
 */
app.get(
    '/:id',
    requirePermission({ activityTypes: ['read'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const activityTypeId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(activityType.id, activityTypeId)
            : and(eq(activityType.id, activityTypeId), eq(activityType.hotelId, hotelId));

        const [found] = await db.select().from(activityType).where(conditions);

        if (!found) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Activity type not found'), 404);
        }

        return c.json(createSuccessEnvelope({
            activityType: {
                ...found,
                images: found.images ? JSON.parse(found.images) : [],
            },
        }));
    }
);

/**
 * POST /activity-types
 * Create a new activity type
 */
app.post(
    '/',
    requirePermission({ activityTypes: ['create'] }),
    zValidator('json', createActivityTypeSchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const data = c.req.valid('json');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required'), 400);
        }

        const newActivityType = {
            id: nanoid(),
            hotelId,
            name: data.name,
            description: data.description ?? null,
            basePrice: data.basePrice,
            durationMinutes: data.durationMinutes,
            maxParticipants: data.maxParticipants,
            images: data.images ? JSON.stringify(data.images) : null,
            isActive: data.isActive,
        };

        const [created] = await db.insert(activityType).values(newActivityType).returning();

        await logCreate(c, 'activity_type', created.id, created);

        return c.json(createSuccessEnvelope({
            activityType: {
                ...created,
                images: data.images ?? [],
            },
        }), 201);
    }
);

/**
 * PATCH /activity-types/:id
 * Update an activity type
 */
app.patch(
    '/:id',
    requirePermission({ activityTypes: ['update'] }),
    zValidator('json', updateActivityTypeSchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const activityTypeId = c.req.param('id');
        const data = c.req.valid('json');

        const conditions = isSuperAdmin && !hotelId
            ? eq(activityType.id, activityTypeId)
            : and(eq(activityType.id, activityTypeId), eq(activityType.hotelId, hotelId));

        const [existing] = await db.select().from(activityType).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Activity type not found'), 404);
        }

        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
        if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
        if (data.maxParticipants !== undefined) updateData.maxParticipants = data.maxParticipants;
        if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const [updated] = await db
            .update(activityType)
            .set(updateData)
            .where(eq(activityType.id, activityTypeId))
            .returning();

        await logUpdate(c, 'activity_type', activityTypeId, existing, updated);

        return c.json(createSuccessEnvelope({
            activityType: {
                ...updated,
                images: updated.images ? JSON.parse(updated.images) : [],
            },
        }));
    }
);

/**
 * DELETE /activity-types/:id
 * Delete an activity type (only if no slots attached)
 */
app.delete(
    '/:id',
    requirePermission({ activityTypes: ['delete'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const activityTypeId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(activityType.id, activityTypeId)
            : and(eq(activityType.id, activityTypeId), eq(activityType.hotelId, hotelId));

        const [existing] = await db.select().from(activityType).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Activity type not found'), 404);
        }

        try {
            await db.delete(activityType).where(eq(activityType.id, activityTypeId));
            await logDelete(c, 'activity_type', activityTypeId, existing);
            return c.json(createSuccessEnvelope({ deleted: true }));
        } catch (error) {
            return c.json(
                createErrorEnvelope('CONFLICT', 'Cannot delete activity type with existing slots'),
                409
            );
        }
    }
);

export default app;
