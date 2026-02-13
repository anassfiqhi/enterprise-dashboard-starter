import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { db } from '../db';
import { roomInventory, roomType } from '../db/schema';
import { requirePermission } from '../middleware/rbac';
import { createSuccessEnvelope, createErrorEnvelope } from '@repo/shared';
import { logCreate, logUpdate } from '../utils/audit';
import { nanoid } from 'nanoid';

const app = new Hono();

// Validation schemas
const upsertInventorySchema = z.object({
    roomTypeId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    totalRooms: z.number().min(0),
    availableRooms: z.number().min(0),
    price: z.string().optional().nullable(),
    minStay: z.number().min(1).optional(),
    maxStay: z.number().min(1).optional().nullable(),
});

const bulkUpsertSchema = z.object({
    roomTypeId: z.string().min(1),
    entries: z.array(z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        totalRooms: z.number().min(0),
        availableRooms: z.number().min(0),
        price: z.string().optional().nullable(),
        minStay: z.number().min(1).optional(),
        maxStay: z.number().min(1).optional().nullable(),
    })).min(1).max(365),
});

const listInventoryQuerySchema = z.object({
    roomTypeId: z.string().optional(),
    dateFrom: z.string().optional(), // YYYY-MM-DD
    dateTo: z.string().optional(),
    limit: z.coerce.number().min(1).max(365).default(90),
    offset: z.coerce.number().min(0).default(0),
});

/**
 * GET /inventory
 * List room inventory for the active hotel
 */
app.get(
    '/',
    requirePermission({ inventory: ['read'] }),
    zValidator('query', listInventoryQuerySchema),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const { roomTypeId, dateFrom, dateTo, limit, offset } = c.req.valid('query');

        if (isSuperAdmin && !hotelId) {
            return c.json(createErrorEnvelope('BAD_REQUEST', 'Hotel context required'), 400);
        }

        const conditions = [eq(roomInventory.hotelId, hotelId)];
        if (roomTypeId) {
            conditions.push(eq(roomInventory.roomTypeId, roomTypeId));
        }
        if (dateFrom) {
            conditions.push(gte(roomInventory.date, dateFrom));
        }
        if (dateTo) {
            conditions.push(lte(roomInventory.date, dateTo));
        }

        const inventory = await db
            .select({
                inventory: roomInventory,
                roomType: {
                    id: roomType.id,
                    name: roomType.name,
                    basePrice: roomType.basePrice,
                },
            })
            .from(roomInventory)
            .leftJoin(roomType, eq(roomInventory.roomTypeId, roomType.id))
            .where(and(...conditions))
            .orderBy(roomInventory.date)
            .limit(limit)
            .offset(offset);

        return c.json(createSuccessEnvelope({ inventory, limit, offset }));
    }
);

/**
 * GET /inventory/:roomTypeId/:date
 * Get specific inventory entry
 */
app.get(
    '/:roomTypeId/:date',
    requirePermission({ inventory: ['read'] }),
    async (c) => {
        const hotelId = c.get('hotelId') as string;
        const isSuperAdmin = c.get('isSuperAdmin') as boolean;
        const roomTypeId = c.req.param('roomTypeId');
        const date = c.req.param('date');

        const baseConditions = [
            eq(roomInventory.roomTypeId, roomTypeId),
            eq(roomInventory.date, date),
        ];

        if (!isSuperAdmin || hotelId) {
            baseConditions.push(eq(roomInventory.hotelId, hotelId));
        }

        const [entry] = await db
            .select({
                inventory: roomInventory,
                roomType: roomType,
            })
            .from(roomInventory)
            .leftJoin(roomType, eq(roomInventory.roomTypeId, roomType.id))
            .where(and(...baseConditions));

        if (!entry) {
            return c.json(createErrorEnvelope('NOT_FOUND', 'Inventory entry not found'), 404);
        }

        return c.json(createSuccessEnvelope(entry));
    }
);

/**
 * PUT /inventory
 * Create or update a single inventory entry
 */
app.put(
    '/',
    requirePermission({ inventory: ['update'] }),
    zValidator('json', upsertInventorySchema),
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

        // Check if entry exists
        const [existing] = await db
            .select()
            .from(roomInventory)
            .where(and(
                eq(roomInventory.roomTypeId, data.roomTypeId),
                eq(roomInventory.date, data.date)
            ));

        if (existing) {
            // Update existing
            const [updated] = await db
                .update(roomInventory)
                .set({
                    totalRooms: data.totalRooms,
                    availableRooms: data.availableRooms,
                    price: data.price ?? null,
                    minStay: data.minStay ?? 1,
                    maxStay: data.maxStay ?? null,
                    updatedAt: new Date(),
                })
                .where(eq(roomInventory.id, existing.id))
                .returning();

            await logUpdate(c, 'inventory', existing.id, existing, updated);
            return c.json(createSuccessEnvelope({ inventory: updated, created: false }));
        } else {
            // Create new
            const newEntry = {
                id: nanoid(),
                hotelId,
                roomTypeId: data.roomTypeId,
                date: data.date,
                totalRooms: data.totalRooms,
                availableRooms: data.availableRooms,
                price: data.price ?? null,
                minStay: data.minStay ?? 1,
                maxStay: data.maxStay ?? null,
            };

            const [created] = await db.insert(roomInventory).values(newEntry).returning();
            await logCreate(c, 'inventory', created.id, created);
            return c.json(createSuccessEnvelope({ inventory: created, created: true }), 201);
        }
    }
);

/**
 * PUT /inventory/bulk
 * Bulk create or update inventory entries
 */
app.put(
    '/bulk',
    requirePermission({ inventory: ['update'] }),
    zValidator('json', bulkUpsertSchema),
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

        const results: { created: number; updated: number } = { created: 0, updated: 0 };

        for (const entry of data.entries) {
            const [existing] = await db
                .select()
                .from(roomInventory)
                .where(and(
                    eq(roomInventory.roomTypeId, data.roomTypeId),
                    eq(roomInventory.date, entry.date)
                ));

            if (existing) {
                await db
                    .update(roomInventory)
                    .set({
                        totalRooms: entry.totalRooms,
                        availableRooms: entry.availableRooms,
                        price: entry.price ?? null,
                        minStay: entry.minStay ?? 1,
                        maxStay: entry.maxStay ?? null,
                        updatedAt: new Date(),
                    })
                    .where(eq(roomInventory.id, existing.id));
                results.updated++;
            } else {
                await db.insert(roomInventory).values({
                    id: nanoid(),
                    hotelId,
                    roomTypeId: data.roomTypeId,
                    date: entry.date,
                    totalRooms: entry.totalRooms,
                    availableRooms: entry.availableRooms,
                    price: entry.price ?? null,
                    minStay: entry.minStay ?? 1,
                    maxStay: entry.maxStay ?? null,
                });
                results.created++;
            }
        }

        return c.json(createSuccessEnvelope({
            message: `Processed ${data.entries.length} entries`,
            ...results,
        }));
    }
);

export default app;
