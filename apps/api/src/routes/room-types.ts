import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { roomType } from '../db/schema';
import { requirePermission } from '../middleware/rbac';
import { createSuccessEnvelope, createErrorEnvelope } from '@repo/shared';
import { logCreate, logUpdate, logDelete } from '../utils/audit';
import { nanoid } from 'nanoid';

const app = new Hono();

// Validation schemas
const createRoomTypeSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional().nullable(),
    basePrice: z.string().min(1), // Price as string to avoid precision issues
    maxOccupancy: z.number().min(1).max(20).default(2),
    amenities: z.array(z.string()).optional().nullable(),
    images: z.array(z.string().url()).optional().nullable(),
    isActive: z.boolean().default(true),
});

const updateRoomTypeSchema = createRoomTypeSchema.partial();

const listRoomTypesQuerySchema = z.object({
    isActive: z.coerce.boolean().optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
});

/**
 * GET /room-types
 * List room types for the active hotel
 */
app.get(
    '/',
    requirePermission({ roomTypes: ['read'] }),
    zValidator('query', listRoomTypesQuerySchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const { isActive, limit, offset } = c.req.valid('query');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required'), 400);
        }

        const conditions = [eq(roomType.hotelId, hotelId)];
        if (isActive !== undefined) {
            conditions.push(eq(roomType.isActive, isActive));
        }

        const roomTypes = await db
            .select()
            .from(roomType)
            .where(and(...conditions))
            .orderBy(desc(roomType.createdAt))
            .limit(limit)
            .offset(offset);

        // Parse JSON fields
        const parsed = roomTypes.map((rt) => ({
            ...rt,
            amenities: rt.amenities ? JSON.parse(rt.amenities) : [],
            images: rt.images ? JSON.parse(rt.images) : [],
        }));

        return c.json(createSuccessEnvelope({ roomTypes: parsed, limit, offset }));
    }
);

/**
 * GET /room-types/:id
 * Get room type details
 */
app.get(
    '/:id',
    requirePermission({ roomTypes: ['read'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const roomTypeId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(roomType.id, roomTypeId)
            : and(eq(roomType.id, roomTypeId), eq(roomType.hotelId, hotelId));

        const [found] = await db.select().from(roomType).where(conditions);

        if (!found) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Room type not found'), 404);
        }

        return c.json(createSuccessEnvelope({
            roomType: {
                ...found,
                amenities: found.amenities ? JSON.parse(found.amenities) : [],
                images: found.images ? JSON.parse(found.images) : [],
            },
        }));
    }
);

/**
 * POST /room-types
 * Create a new room type
 */
app.post(
    '/',
    requirePermission({ roomTypes: ['create'] }),
    zValidator('json', createRoomTypeSchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const data = c.req.valid('json');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required'), 400);
        }

        const newRoomType = {
            id: nanoid(),
            hotelId,
            name: data.name,
            description: data.description ?? null,
            basePrice: data.basePrice,
            maxOccupancy: data.maxOccupancy,
            amenities: data.amenities ? JSON.stringify(data.amenities) : null,
            images: data.images ? JSON.stringify(data.images) : null,
            isActive: data.isActive,
        };

        const [created] = await db.insert(roomType).values(newRoomType).returning();

        await logCreate(c, 'room_type', created.id, created);

        return c.json(createSuccessEnvelope({
            roomType: {
                ...created,
                amenities: data.amenities ?? [],
                images: data.images ?? [],
            },
        }), 201);
    }
);

/**
 * PATCH /room-types/:id
 * Update a room type
 */
app.patch(
    '/:id',
    requirePermission({ roomTypes: ['update'] }),
    zValidator('json', updateRoomTypeSchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const roomTypeId = c.req.param('id');
        const data = c.req.valid('json');

        const conditions = isSuperAdmin && !hotelId
            ? eq(roomType.id, roomTypeId)
            : and(eq(roomType.id, roomTypeId), eq(roomType.hotelId, hotelId));

        const [existing] = await db.select().from(roomType).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Room type not found'), 404);
        }

        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
        if (data.maxOccupancy !== undefined) updateData.maxOccupancy = data.maxOccupancy;
        if (data.amenities !== undefined) updateData.amenities = JSON.stringify(data.amenities);
        if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const [updated] = await db
            .update(roomType)
            .set(updateData)
            .where(eq(roomType.id, roomTypeId))
            .returning();

        await logUpdate(c, 'room_type', roomTypeId, existing, updated);

        return c.json(createSuccessEnvelope({
            roomType: {
                ...updated,
                amenities: updated.amenities ? JSON.parse(updated.amenities) : [],
                images: updated.images ? JSON.parse(updated.images) : [],
            },
        }));
    }
);

/**
 * DELETE /room-types/:id
 * Delete a room type (only if no rooms attached)
 */
app.delete(
    '/:id',
    requirePermission({ roomTypes: ['delete'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const roomTypeId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(roomType.id, roomTypeId)
            : and(eq(roomType.id, roomTypeId), eq(roomType.hotelId, hotelId));

        const [existing] = await db.select().from(roomType).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Room type not found'), 404);
        }

        try {
            await db.delete(roomType).where(eq(roomType.id, roomTypeId));
            await logDelete(c, 'room_type', roomTypeId, existing);
            return c.json(createSuccessEnvelope({ deleted: true }));
        } catch (error) {
            return c.json(
                createErrorEnvelope('CONFLICT', 'Cannot delete room type with existing rooms'),
                409
            );
        }
    }
);

export default app;
