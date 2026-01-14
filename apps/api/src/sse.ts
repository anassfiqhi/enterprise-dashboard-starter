import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';

const app = new Hono();

const clients = new Set<any>(); // Simple in-memory for starter. Use Redis for scale.

app.get('/events', async (c) => {
    return streamSSE(c, async (stream) => {
        clients.add(stream);

        stream.onAbort(() => {
            clients.delete(stream);
        });

        // Keep-alive or initial event
        await stream.writeSSE({
            event: 'connected',
            data: 'connected',
        });

        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 15000));
            await stream.writeSSE({
                event: 'ping',
                data: 'pong',
            });
        }
    });
});

export const broadcast = (event: string, data: any) => {
    // Implement broadcast logic (needs refactoring to access streams)
    // For now this is a placeholder structure
};

export default app;
