import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type { OrderEvent } from '@repo/shared';
import { sseLogger } from './utils/logger';
import { db, orders } from './db/index';
import { eq, sql } from 'drizzle-orm';
import { requirePermission } from './middleware/rbac';

const app = new Hono();

interface SSEClient {
    stream: any;
    lastEventId: number;
}

const clients = new Set<SSEClient>();
let eventIdCounter = 0;

/**
 * GET /events - SSE endpoint (SPEC Section 7)
 * Event format: { type, id, patch, ts }
 * Supports Last-Event-ID for recovery
 * Requires: orders:read permission
 */
app.get('/events', requirePermission({ orders: ['read'] }), async (c) => {
    const lastEventId = c.req.header('Last-Event-ID');
    const startId = lastEventId ? parseInt(lastEventId, 10) : eventIdCounter;

    return streamSSE(c, async (stream) => {
        const client: SSEClient = { stream, lastEventId: startId };
        clients.add(client);
        sseLogger.connected(clients.size);

        stream.onAbort(() => {
            clients.delete(client);
            clearInterval(randomUpdateInterval);
            sseLogger.disconnected(clients.size);
        });

        // Send connected event
        await stream.writeSSE({
            id: String(++eventIdCounter),
            event: 'connected',
            data: JSON.stringify({ message: 'Connected to event stream' }),
        });

        // Start sending random order updates every 5-10 seconds
        const sendRandomUpdate = async () => {
            try {
                // Get a random order from the database
                const [randomOrder] = await db
                    .select()
                    .from(orders)
                    .orderBy(sql`RANDOM()`)
                    .limit(1);

                if (randomOrder) {
                    // Generate random status update
                    const statuses = ['pending', 'processing', 'shipped', 'delivered'] as const;
                    const currentStatusIndex = statuses.indexOf(randomOrder.status as any);
                    const nextStatuses = statuses.slice(currentStatusIndex + 1);

                    if (nextStatuses.length > 0) {
                        const newStatus = nextStatuses[Math.floor(Math.random() * nextStatuses.length)];

                        // Update in database
                        await db
                            .update(orders)
                            .set({
                                status: newStatus,
                                updatedAt: new Date()
                            })
                            .where(eq(orders.id, randomOrder.id));

                        // Broadcast the update
                        const updateEvent: OrderEvent = {
                            type: 'order.updated',
                            id: randomOrder.id,
                            patch: { status: newStatus },
                            ts: Date.now(),
                        };

                        await broadcastEvent(updateEvent);
                        sseLogger.info('Random order update sent', {
                            orderId: randomOrder.id,
                            newStatus
                        });
                    }
                }
            } catch (err) {
                sseLogger.error('Failed to send random update', err);
            }
        };

        // Schedule random updates
        const randomUpdateInterval = setInterval(() => {
            const delay = 5000 + Math.random() * 5000; // 5-10 seconds
            setTimeout(sendRandomUpdate, delay);
        }, 8000); // Check every 8 seconds

        // Keep-alive ping every 15 seconds (SPEC Section 7.3)
        while (true) {
            try {
                await new Promise((resolve) => setTimeout(resolve, 15000));
                await stream.writeSSE({
                    id: String(++eventIdCounter),
                    event: 'ping',
                    data: JSON.stringify({ ts: Date.now() }),
                });
                client.lastEventId = eventIdCounter;
                sseLogger.ping(clients.size);
            } catch (err) {
                sseLogger.error('Write error during ping', err);
                break;
            }
        }
    });
});

/**
 * Broadcast event to all connected clients
 * Used by other endpoints to push updates
 */
export async function broadcastEvent(event: OrderEvent) {
    const eventId = String(++eventIdCounter);

    // Send to all connected clients
    for (const client of clients) {
        try {
            await client.stream.writeSSE({
                id: eventId,
                event: event.type,
                data: JSON.stringify(event),
            });
            client.lastEventId = eventIdCounter;
        } catch (err) {
            sseLogger.error('Failed to broadcast to client', err);
            clients.delete(client);
        }
    }

    sseLogger.broadcast(event.type, clients.size, eventId);
}

export default app;
