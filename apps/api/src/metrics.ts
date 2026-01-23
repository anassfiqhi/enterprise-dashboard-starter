import { Hono } from 'hono';
import type { Metrics } from '@repo/shared';
import { createSuccessEnvelope } from '@repo/shared';
import { requirePermission } from './middleware/rbac';
import { db, orders } from './db/index';
import { eq, or, gte, sql } from 'drizzle-orm';

const app = new Hono();

/**
 * GET /metrics - Dashboard metrics endpoint
 * Requires: metrics:read permission
 * SPEC: Phase 2 requirement for dashboard data
 *
 * Calculates real-time metrics from orders data:
 * - totalRevenue: sum of all delivered order amounts
 * - subscriptions: count of orders with status "processing" or "shipped"
 * - sales: total count of all orders
 * - activeNow: count of orders in the last 24 hours
 */
app.get('/', requirePermission({ metrics: ['read'] }), async (c) => {
    // Calculate total revenue from delivered orders
    const [revenueResult] = await db
        .select({
            total: sql<number>`COALESCE(SUM(CAST(${orders.amount} AS NUMERIC)), 0)`,
        })
        .from(orders)
        .where(eq(orders.status, 'delivered'));

    // Count active subscriptions (processing + shipped orders)
    const [subscriptionsResult] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(orders)
        .where(or(eq(orders.status, 'processing'), eq(orders.status, 'shipped')));

    // Total sales count
    const [salesResult] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(orders);

    // Active orders in last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [activeNowResult] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(orders)
        .where(gte(orders.createdAt, last24Hours));

    const metrics: Metrics = {
        totalRevenue: Math.round(Number(revenueResult.total) * 100) / 100, // Round to 2 decimals
        subscriptions: subscriptionsResult.count,
        sales: salesResult.count,
        activeNow: activeNowResult.count,
    };

    return c.json(createSuccessEnvelope(metrics));
});

export default app;
