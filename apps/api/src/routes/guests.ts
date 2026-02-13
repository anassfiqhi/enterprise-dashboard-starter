import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, ilike, or, desc } from 'drizzle-orm';
import { db } from '../db';
import { guest } from '../db/schema';
import { requirePermission } from '../middleware/rbac';
import { createSuccessEnvelope, createErrorEnvelope } from '@repo/shared';
import { logCreate, logUpdate, logDelete } from '../utils/audit';
import { nanoid } from 'nanoid';

const app = new Hono();

// Validation schemas
const createGuestSchema = z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email().optional().nullable(),
    phone: z.string().max(50).optional().nullable(),
    nationality: z.string().max(100).optional().nullable(),
    idType: z.enum(['passport', 'drivers_license', 'national_id']).optional().nullable(),
    idNumber: z.string().max(100).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
});

const updateGuestSchema = createGuestSchema.partial();

const listGuestsQuerySchema = z.object({
    search: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
});

/**
 * GET /guests
 * List guests for the active hotel
 */
app.get(
    '/',
    requirePermission({ guests: ['read'] }),
    zValidator('query', listGuestsQuerySchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const { search, limit, offset } = c.req.valid('query');

        // Super Admin without active hotel can't list guests (need hotel context)
        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required to list guests'), 400);
        }

        let query = db
            .select()
            .from(guest)
            .where(eq(guest.hotelId, hotelId))
            .orderBy(desc(guest.createdAt))
            .limit(limit)
            .offset(offset);

        if (search) {
            query = db
                .select()
                .from(guest)
                .where(
                    and(
                        eq(guest.hotelId, hotelId),
                        or(
                            ilike(guest.firstName, `%${search}%`),
                            ilike(guest.lastName, `%${search}%`),
                            ilike(guest.email, `%${search}%`),
                            ilike(guest.phone, `%${search}%`)
                        )
                    )
                )
                .orderBy(desc(guest.createdAt))
                .limit(limit)
                .offset(offset);
        }

        const guests = await query;

        return c.json(createSuccessEnvelope({ guests, limit, offset }));
    }
);

/**
 * GET /guests/:id
 * Get guest details
 */
app.get(
    '/:id',
    requirePermission({ guests: ['read'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const guestId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(guest.id, guestId)
            : and(eq(guest.id, guestId), eq(guest.hotelId, hotelId));

        const [foundGuest] = await db
            .select()
            .from(guest)
            .where(conditions);

        if (!foundGuest) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Guest not found'), 404);
        }

        return c.json(createSuccessEnvelope({ guest: foundGuest }));
    }
);

/**
 * POST /guests
 * Create a new guest
 */
app.post(
    '/',
    requirePermission({ guests: ['create'] }),
    zValidator('json', createGuestSchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const user = c.get('user') as { id: string };
        const data = c.req.valid('json');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required to create guest'), 400);
        }

        const newGuest = {
            id: nanoid(),
            hotelId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email ?? null,
            phone: data.phone ?? null,
            nationality: data.nationality ?? null,
            idType: data.idType ?? null,
            idNumber: data.idNumber ?? null,
            notes: data.notes ?? null,
            createdBy: user.id,
        };

        const [created] = await db.insert(guest).values(newGuest).returning();

        await logCreate(c, 'guest', created.id, created);

        return c.json(createSuccessEnvelope({ guest: created }), 201);
    }
);

/**
 * PATCH /guests/:id
 * Update a guest
 */
app.patch(
    '/:id',
    requirePermission({ guests: ['update'] }),
    zValidator('json', updateGuestSchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const guestId = c.req.param('id');
        const data = c.req.valid('json');

        const conditions = isSuperAdmin && !hotelId
            ? eq(guest.id, guestId)
            : and(eq(guest.id, guestId), eq(guest.hotelId, hotelId));

        const [existing] = await db.select().from(guest).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Guest not found'), 404);
        }

        const [updated] = await db
            .update(guest)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(guest.id, guestId))
            .returning();

        await logUpdate(c, 'guest', guestId, existing, updated);

        return c.json(createSuccessEnvelope({ guest: updated }));
    }
);

/**
 * DELETE /guests/:id
 * Delete a guest (only if no reservations)
 */
app.delete(
    '/:id',
    requirePermission({ guests: ['delete'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const guestId = c.req.param('id');

        const conditions = isSuperAdmin && !hotelId
            ? eq(guest.id, guestId)
            : and(eq(guest.id, guestId), eq(guest.hotelId, hotelId));

        const [existing] = await db.select().from(guest).where(conditions);

        if (!existing) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Guest not found'), 404);
        }

        try {
            await db.delete(guest).where(eq(guest.id, guestId));
            await logDelete(c, 'guest', guestId, existing);
            return c.json(createSuccessEnvelope({ deleted: true }));
        } catch (error) {
            // Foreign key constraint - guest has reservations
            return c.json(
                createErrorEnvelope('CONFLICT', 'Cannot delete guest with existing reservations'),
                409
            );
        }
    }
);

export default app;
