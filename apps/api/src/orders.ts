import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { OrderSchema } from '@repo/shared';
import { z } from 'zod';

const app = new Hono();

// Mock database
const orders: z.infer<typeof OrderSchema>[] = Array.from({ length: 50 }).map((_, i) => ({
    id: `ord_${i + 1}`,
    status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][i % 5] as any,
    customer: `Customer ${i + 1}`,
    amount: Math.floor(Math.random() * 1000),
    createdAt: new Date().toISOString()
}));

import { auth } from './auth';

app.get('/', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    const page = Number(c.req.query('page') || '1');
    const pageSize = Number(c.req.query('pageSize') || '10');
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return c.json({
        data: orders.slice(start, end),
        meta: {
            total: orders.length,
            page,
            pageSize
        }
    });
});

app.post('/', zValidator('json', OrderSchema), (c) => {
    const order = c.req.valid('json');
    orders.push(order);
    return c.json(order, 201);
});

export default app;
