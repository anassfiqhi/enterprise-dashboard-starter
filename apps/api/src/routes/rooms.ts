import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { room, roomType } from '../db/schema';
import { requirePermission } from '../middleware/rbac';
import { createSuccessEnvelope, createErrorEnvelope } from '@repo/shared';
import { logCreate, logUpdate, logDelete } from '../utils/audit';
import { nanoid } from 'nanoid';

const app = new Hono();

// Validation schemas
const createRoomSchema = z.object({
    roomTypeId: z.string().min(1),
    roomNumber: z.string().min(1).max(50),
    floor: z.string().max(20).optional().nullable(),
    status: z.enum(['available', 'occupied', 'maintenance', 'out_of_order']).default('available'),
    notes: z.string().max(1000).optional().nullable(),
});

const updateRoomSchema = createRoomSchema.partial().omit({ roomTypeId: true });

const listRoomsQuerySchema = z.object({
    roomTypeId: z.string().optional(),
    status: z.enum(['available', 'occupied', 'maintenance', 'out_of_order']).optional(),
    floor: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
});

/**
 * GET /rooms
 * List rooms for the active hotel
 */
app.get(
    '/',
    requirePermission({ rooms: ['read'] }),
    zValidator('query', listRoomsQuerySchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const { roomTypeId, status, floor, limit, offset } = c.req.valid('query');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required'), 400);
        }

        const conditions = [eq(room.hotelId, hotelId)];
        if (roomTypeId) conditions.push(eq(room.roomTypeId, roomTypeId));
        if (status) conditions.push(eq(room.status, status));
        if (floor) conditions.push(eq(room.floor, floor));

        const rooms = await db
            .select({
                room: room,
                roomType: {
                    id: roomType.id,
                    name: roomType.name,
                },
            })
            .from(room)
            .leftJoin(roomType, eq(room.roomTypeId, roomType.id))
            .where(and(...conditions))
            .orderBy(room.roomNumber)
            .limit(limit)
            .offset(offset);

        return c.json(createSuccessEnvelope({ rooms, limit, offset }));
    }
);

/**
 * GET /rooms/:id
 * Get room details
 */
app.get(
    '/:id',
    requirePermission({ rooms: ['read'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const roomId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(room.id, roomId)
            : and(eq(room.id, roomId), eq(room.hotelId, hotelId));

        const [result] = await db
            .select({
                room: room,
                roomType: roomType,
            })
            .from(room)
            .leftJoin(roomType, eq(room.roomTypeId, roomType.id))
            .where(conditions);

        if (!result) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Room not found'), 404);
        }

        return c.json(createSuccessEnvelope(result));
    }
);

/**
 * POST /rooms
 * Create a new room
 */
app.post(
    '/',
    requirePermission({ rooms: ['create'] }),
    zValidator('json', createRoomSchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const data = c.req.valid('json');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required'), 400);
        }

        // Verify room type exists and belongs to hotel
        const [foundRoomType] = await db
            .select()
            .from(roomType)
            .where(and(eq(roomType.id, data.roomTypeId), eq(roomType.hotelId, hotelId)));

        if (!foundRoomType) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Room type not found'), 404);
        }

        // Check for duplicate room number
        const [existingRoom] = await db
            .select()
            .from(room)
            .where(and(eq(room.hotelId, hotelId), eq(room.roomNumber, data.roomNumber)));

        if (existingRoom) {
            return c.json(createErrorEnvelope('CONFLICT', 'Room number already exists'), 409);
        }

        const newRoom = {
            id: nanoid(),
            hotelId,
            roomTypeId: data.roomTypeId,
            roomNumber: data.roomNumber,
            floor: data.floor ?? null,
            status: data.status,
            notes: data.notes ?? null,
        };

        const [created] = await db.insert(room).values(newRoom).returning();

        await logCreate(c, 'room', created.id, created);

        return c.json(createSuccessEnvelope({ room: created }), 201);
    }
);

/**
 * PATCH /rooms/:id
 * Update a room
 */
app.patch(
    '/:id',
    requirePermission({ rooms: ['update'] }),
    zValidator('json', updateRoomSchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const roomId = c.req.param('id');
        const data = c.req.valid('json');

        const conditions = isSuperAdmin && !hotelId
            ? eq(room.id, roomId)
            : and(eq(room.id, roomId), eq(room.hotelId, hotelId));

        const [existing] = await db.select().from(room).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Room not found'), 404);
        }

        // Check for duplicate room number if changing
        if (data.roomNumber && data.roomNumber !== existing.roomNumber) {
            const [duplicate] = await db
                .select()
                .from(room)
                .where(and(eq(room.hotelId, existing.hotelId), eq(room.roomNumber, data.roomNumber)));

            if (duplicate) {
                return c.json(createErrorEnvelope('CONFLICT', 'Room number already exists'), 409);
            }
        }

        const [updated] = await db
            .update(room)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(room.id, roomId))
            .returning();

        await logUpdate(c, 'room', roomId, existing, updated);

        return c.json(createSuccessEnvelope({ room: updated }));
    }
);

/**
 * DELETE /rooms/:id
 * Delete a room (only if no reservations)
 */
app.delete(
    '/:id',
    requirePermission({ rooms: ['delete'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const roomId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(room.id, roomId)
            : and(eq(room.id, roomId), eq(room.hotelId, hotelId));

        const [existing] = await db.select().from(room).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Room not found'), 404);
        }

        try {
            await db.delete(room).where(eq(room.id, roomId));
            await logDelete(c, 'room', roomId, existing);
            return c.json(createSuccessEnvelope({ deleted: true }));
        } catch (error) {
            return c.json(
                createErrorEnvelope('CONFLICT', 'Cannot delete room with existing reservations'),
                409
            );
        }
    }
);

export default app;
