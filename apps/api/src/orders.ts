import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { OrderSchema, OrdersQuerySchema, createSuccessEnvelope, createErrorEnvelope } from '@repo/shared';
import { requirePermission } from './middleware/rbac';
import { broadcastEvent } from './sse';
import { db, orders } from './db/index';
import { eq, and, or, like, desc, asc, sql } from 'drizzle-orm';
import { logger } from './utils/logger';

const app = new Hono();

/**
 * GET /orders - List orders with pagination, filtering, sorting (SPEC Section 6.1)
 * Requires: orders:read permission
 */
app.get(
    '/',
    requirePermission({ orders: ['read'] }),
    zValidator('query', OrdersQuerySchema),
    async (c) => {
        const { page, pageSize, search, status, sort } = c.req.valid('query');

        // Build where conditions
        const conditions = [];

        if (search) {
            conditions.push(
                or(
                    like(orders.id, `%${search}%`),
                    like(orders.customer, `%${search}%`)
                )
            );
        }

        if (status) {
            conditions.push(eq(orders.status, status));
        }

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        // Determine sort order
        let orderBy;
        if (sort) {
            const descending = sort.startsWith('-');
            const field = (descending ? sort.slice(1) : sort) as keyof typeof orders.$inferSelect;

            switch (field) {
                case 'id':
                    orderBy = descending ? desc(orders.id) : asc(orders.id);
                    break;
                case 'customer':
                    orderBy = descending ? desc(orders.customer) : asc(orders.customer);
                    break;
                case 'amount':
                    orderBy = descending ? desc(orders.amount) : asc(orders.amount);
                    break;
                case 'createdAt':
                    orderBy = descending ? desc(orders.createdAt) : asc(orders.createdAt);
                    break;
                default:
                    orderBy = desc(orders.createdAt);
            }
        } else {
            orderBy = desc(orders.createdAt);
        }

        // Get total count
        const [{ count }] = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(orders)
            .where(where);

        // Get paginated results
        const offset = (page - 1) * pageSize;
        const results = await db
            .select()
            .from(orders)
            .where(where)
            .orderBy(orderBy)
            .limit(pageSize)
            .offset(offset);

        // Convert amount from string to number for response
        const formattedResults = results.map((order) => ({
            ...order,
            amount: parseFloat(order.amount),
        }));

        // Return response envelope
        return c.json(
            createSuccessEnvelope(formattedResults, {
                total: count,
                page,
                pageSize,
                totalPages: Math.ceil(count / pageSize),
            })
        );
    }
);

/**
 * GET /orders/:id - Get single order
 * Requires: orders:read permission
 */
app.get('/:id', requirePermission({ orders: ['read'] }), async (c) => {
    const id = c.req.param('id');

    const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .limit(1);

    if (!order) {
        return c.json(createErrorEnvelope('NOT_FOUND', `Order ${id} not found`), 404);
    }

    // Convert amount from string to number
    const formattedOrder = {
        ...order,
        amount: parseFloat(order.amount),
    };

    return c.json(createSuccessEnvelope(formattedOrder));
});

/**
 * POST /orders - Create new order
 * Requires: orders:create permission
 */
app.post('/', requirePermission({ orders: ['create'] }), zValidator('json', OrderSchema), async (c) => {
    const order = c.req.valid('json');

    // Insert order into database
    const [newOrder] = await db
        .insert(orders)
        .values({
            id: order.id,
            status: order.status,
            customer: order.customer,
            amount: order.amount.toString(),
            createdAt: new Date(order.createdAt),
        })
        .returning();

    // Convert amount back to number for response
    const formattedOrder = {
        ...newOrder,
        amount: parseFloat(newOrder.amount),
    };

    return c.json(createSuccessEnvelope(formattedOrder), 201);
});

/**
 * PATCH /orders/:id - Update order
 * Requires: orders:update permission
 */
app.patch(
    '/:id',
    requirePermission({ orders: ['update'] }),
    zValidator('json', OrderSchema.partial()),
    async (c) => {
        const id = c.req.param('id');
        const updates = c.req.valid('json');

        // Check if order exists
        const [existingOrder] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, id))
            .limit(1);

        if (!existingOrder) {
            return c.json(createErrorEnvelope('NOT_FOUND', `Order ${id} not found`), 404);
        }

        // Build update object
        const updateData: any = {};
        if (updates.status) updateData.status = updates.status;
        if (updates.customer) updateData.customer = updates.customer;
        if (updates.amount !== undefined) updateData.amount = updates.amount.toString();
        if (updates.createdAt) updateData.createdAt = new Date(updates.createdAt);
        updateData.updatedAt = new Date();

        // Update order in database
        const [updatedOrder] = await db
            .update(orders)
            .set(updateData)
            .where(eq(orders.id, id))
            .returning();

        // Broadcast SSE event (SPEC Section 7)
        logger.info('Order updated', { id, updates });
        await broadcastEvent({
            type: 'order.updated',
            id,
            patch: updates,
            ts: Date.now(),
        });

        // Convert amount to number for response
        const formattedOrder = {
            ...updatedOrder,
            amount: parseFloat(updatedOrder.amount),
        };

        return c.json(createSuccessEnvelope(formattedOrder));
    }
);

export default app;
