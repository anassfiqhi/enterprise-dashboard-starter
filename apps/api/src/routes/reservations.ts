import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc, gte, lte, inArray } from 'drizzle-orm';
import { db } from '../db';
import { reservation, guest, roomType, room, activityType, activitySlot } from '../db/schema';
import { requirePermission } from '../middleware/rbac';
import { createSuccessEnvelope, createErrorEnvelope } from '@repo/shared';
import { logCreate, logUpdate, logReservationAction } from '../utils/audit';
import { nanoid } from 'nanoid';

const app = new Hono();

// Validation schemas
const createReservationSchema = z.object({
    guestId: z.string().min(1),
    // Room booking
    roomTypeId: z.string().optional().nullable(),
    roomId: z.string().optional().nullable(),
    checkInDate: z.string().optional().nullable(), // ISO date
    checkOutDate: z.string().optional().nullable(),
    // Activity booking
    activityTypeId: z.string().optional().nullable(),
    activitySlotId: z.string().optional().nullable(),
    // Details
    guestCount: z.number().min(1).default(1),
    specialRequests: z.string().max(2000).optional().nullable(),
    totalPrice: z.string().optional().nullable(),
    currency: z.string().default('USD'),
    channel: z.enum(['direct', 'ota', 'corporate', 'walk_in']).default('direct'),
}).refine(
    (data) => data.roomTypeId || data.activityTypeId,
    { message: 'Either roomTypeId or activityTypeId must be provided' }
);

const updateReservationSchema = z.object({
    roomId: z.string().optional().nullable(),
    guestCount: z.number().min(1).optional(),
    specialRequests: z.string().max(2000).optional().nullable(),
    totalPrice: z.string().optional().nullable(),
});

const listReservationsQuerySchema = z.object({
    status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']).optional(),
    guestId: z.string().optional(),
    roomTypeId: z.string().optional(),
    checkInFrom: z.string().optional(), // ISO date
    checkInTo: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
});

const cancelSchema = z.object({
    reason: z.string().max(500).optional(),
});

/**
 * GET /reservations
 * List reservations for the active hotel
 */
app.get(
    '/',
    requirePermission({ reservations: ['read'] }),
    zValidator('query', listReservationsQuerySchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const { status, guestId, roomTypeId, checkInFrom, checkInTo, limit, offset } = c.req.valid('query');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required'), 400);
        }

        const conditions = [eq(reservation.hotelId, hotelId)];

        if (status) {
            conditions.push(eq(reservation.status, status));
        }
        if (guestId) {
            conditions.push(eq(reservation.guestId, guestId));
        }
        if (roomTypeId) {
            conditions.push(eq(reservation.roomTypeId, roomTypeId));
        }
        if (checkInFrom) {
            conditions.push(gte(reservation.checkInDate, checkInFrom));
        }
        if (checkInTo) {
            conditions.push(lte(reservation.checkInDate, checkInTo));
        }

        const reservations = await db
            .select({
                reservation: reservation,
                guest: {
                    id: guest.id,
                    firstName: guest.firstName,
                    lastName: guest.lastName,
                    email: guest.email,
                },
                roomType: {
                    id: roomType.id,
                    name: roomType.name,
                },
                room: {
                    id: room.id,
                    roomNumber: room.roomNumber,
                },
            })
            .from(reservation)
            .leftJoin(guest, eq(reservation.guestId, guest.id))
            .leftJoin(roomType, eq(reservation.roomTypeId, roomType.id))
            .leftJoin(room, eq(reservation.roomId, room.id))
            .where(and(...conditions))
            .orderBy(desc(reservation.createdAt))
            .limit(limit)
            .offset(offset);

        return c.json(createSuccessEnvelope({ reservations, limit, offset }));
    }
);

/**
 * GET /reservations/:id
 * Get reservation details
 */
app.get(
    '/:id',
    requirePermission({ reservations: ['read'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const reservationId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(reservation.id, reservationId)
            : and(eq(reservation.id, reservationId), eq(reservation.hotelId, hotelId));

        const [result] = await db
            .select({
                reservation: reservation,
                guest: guest,
                roomType: roomType,
                room: room,
                activityType: activityType,
                activitySlot: activitySlot,
            })
            .from(reservation)
            .leftJoin(guest, eq(reservation.guestId, guest.id))
            .leftJoin(roomType, eq(reservation.roomTypeId, roomType.id))
            .leftJoin(room, eq(reservation.roomId, room.id))
            .leftJoin(activityType, eq(reservation.activityTypeId, activityType.id))
            .leftJoin(activitySlot, eq(reservation.activitySlotId, activitySlot.id))
            .where(conditions);

        if (!result) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Reservation not found'), 404);
        }

        return c.json(createSuccessEnvelope(result));
    }
);

/**
 * POST /reservations
 * Create a new reservation
 */
app.post(
    '/',
    requirePermission({ reservations: ['create'] }),
    zValidator('json', createReservationSchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const user = c.get('user') as { id: string };
        const data = c.req.valid('json');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required'), 400);
        }

        // Verify guest exists and belongs to hotel
        const [foundGuest] = await db
            .select()
            .from(guest)
            .where(and(eq(guest.id, data.guestId), eq(guest.hotelId, hotelId)));

        if (!foundGuest) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Guest not found'), 404);
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

        // Verify room if provided
        if (data.roomId) {
            const [foundRoom] = await db
                .select()
                .from(room)
                .where(and(eq(room.id, data.roomId), eq(room.hotelId, hotelId)));

            if (!foundRoom) {
                return c.json(createErrorEnvelope('NOT_FOUND', 'Room not found'), 404);
            }
        }

        const newReservation = {
            id: nanoid(),
            hotelId,
            guestId: data.guestId,
            roomTypeId: data.roomTypeId ?? null,
            roomId: data.roomId ?? null,
            checkInDate: data.checkInDate ?? null,
            checkOutDate: data.checkOutDate ?? null,
            activityTypeId: data.activityTypeId ?? null,
            activitySlotId: data.activitySlotId ?? null,
            guestCount: data.guestCount,
            specialRequests: data.specialRequests ?? null,
            totalPrice: data.totalPrice ?? null,
            currency: data.currency,
            channel: data.channel,
            status: 'pending' as const,
            createdBy: user.id,
        };

        const [created] = await db.insert(reservation).values(newReservation).returning();

        await logCreate(c, 'reservation', created.id, created);

        return c.json(createSuccessEnvelope({ reservation: created }), 201);
    }
);

/**
 * PATCH /reservations/:id
 * Update a reservation
 */
app.patch(
    '/:id',
    requirePermission({ reservations: ['update'] }),
    zValidator('json', updateReservationSchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const reservationId = c.req.param('id');
        const data = c.req.valid('json');

        const conditions = isSuperAdmin && !hotelId
            ? eq(reservation.id, reservationId)
            : and(eq(reservation.id, reservationId), eq(reservation.hotelId, hotelId));

        const [existing] = await db.select().from(reservation).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Reservation not found'), 404);
        }

        // Can only update pending or confirmed reservations
        if (!['pending', 'confirmed'].includes(existing.status)) {
            return c.json(
                createErrorEnvelope('BAD_REQUEST', `Cannot update ${existing.status} reservation`),
                400
            );
        }

        const [updated] = await db
            .update(reservation)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(reservation.id, reservationId))
            .returning();

        await logUpdate(c, 'reservation', reservationId, existing, updated);

        return c.json(createSuccessEnvelope({ reservation: updated }));
    }
);

/**
 * POST /reservations/:id/confirm
 * Confirm a pending reservation
 */
app.post(
    '/:id/confirm',
    requirePermission({ reservations: ['update'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const user = c.get('user') as { id: string };
        const reservationId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(reservation.id, reservationId)
            : and(eq(reservation.id, reservationId), eq(reservation.hotelId, hotelId));

        const [existing] = await db.select().from(reservation).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Reservation not found'), 404);
        }

        if (existing.status !== 'pending') {
            return c.json(
                createErrorEnvelope('BAD_REQUEST', `Cannot confirm ${existing.status} reservation`),
                400
            );
        }

        const [updated] = await db
            .update(reservation)
            .set({
                status: 'confirmed',
                confirmedBy: user.id,
                updatedAt: new Date(),
            })
            .where(eq(reservation.id, reservationId))
            .returning();

        await logReservationAction(c, 'CONFIRM', reservationId, existing, updated);

        return c.json(createSuccessEnvelope({ reservation: updated }));
    }
);

/**
 * POST /reservations/:id/check-in
 * Check in a confirmed reservation
 */
app.post(
    '/:id/check-in',
    requirePermission({ reservations: ['checkin'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const reservationId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(reservation.id, reservationId)
            : and(eq(reservation.id, reservationId), eq(reservation.hotelId, hotelId));

        const [existing] = await db.select().from(reservation).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Reservation not found'), 404);
        }

        if (existing.status !== 'confirmed') {
            return c.json(
                createErrorEnvelope('BAD_REQUEST', `Cannot check in ${existing.status} reservation`),
                400
            );
        }

        const [updated] = await db
            .update(reservation)
            .set({
                status: 'checked_in',
                updatedAt: new Date(),
            })
            .where(eq(reservation.id, reservationId))
            .returning();

        // Update room status if assigned
        if (existing.roomId) {
            await db
                .update(room)
                .set({ status: 'occupied', updatedAt: new Date() })
                .where(eq(room.id, existing.roomId));
        }

        await logReservationAction(c, 'CHECK_IN', reservationId, existing, updated);

        return c.json(createSuccessEnvelope({ reservation: updated }));
    }
);

/**
 * POST /reservations/:id/check-out
 * Check out a checked-in reservation
 */
app.post(
    '/:id/check-out',
    requirePermission({ reservations: ['checkout'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const reservationId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(reservation.id, reservationId)
            : and(eq(reservation.id, reservationId), eq(reservation.hotelId, hotelId));

        const [existing] = await db.select().from(reservation).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Reservation not found'), 404);
        }

        if (existing.status !== 'checked_in') {
            return c.json(
                createErrorEnvelope('BAD_REQUEST', `Cannot check out ${existing.status} reservation`),
                400
            );
        }

        const [updated] = await db
            .update(reservation)
            .set({
                status: 'checked_out',
                updatedAt: new Date(),
            })
            .where(eq(reservation.id, reservationId))
            .returning();

        // Update room status if assigned
        if (existing.roomId) {
            await db
                .update(room)
                .set({ status: 'available', updatedAt: new Date() })
                .where(eq(room.id, existing.roomId));
        }

        await logReservationAction(c, 'CHECK_OUT', reservationId, existing, updated);

        return c.json(createSuccessEnvelope({ reservation: updated }));
    }
);

/**
 * POST /reservations/:id/cancel
 * Cancel a reservation
 */
app.post(
    '/:id/cancel',
    requirePermission({ reservations: ['cancel'] }),
    zValidator('json', cancelSchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const user = c.get('user') as { id: string };
        const reservationId = c.req.param('id');
        const { reason } = c.req.valid('json');

        const conditions = isSuperAdmin && !hotelId
            ? eq(reservation.id, reservationId)
            : and(eq(reservation.id, reservationId), eq(reservation.hotelId, hotelId));

        const [existing] = await db.select().from(reservation).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Reservation not found'), 404);
        }

        // Can only cancel pending or confirmed reservations
        if (!['pending', 'confirmed'].includes(existing.status)) {
            return c.json(
                createErrorEnvelope('BAD_REQUEST', `Cannot cancel ${existing.status} reservation`),
                400
            );
        }

        const [updated] = await db
            .update(reservation)
            .set({
                status: 'cancelled',
                cancelledBy: user.id,
                cancelReason: reason ?? null,
                updatedAt: new Date(),
            })
            .where(eq(reservation.id, reservationId))
            .returning();

        await logReservationAction(c, 'CANCEL', reservationId, existing, updated);

        return c.json(createSuccessEnvelope({ reservation: updated }));
    }
);

export default app;
