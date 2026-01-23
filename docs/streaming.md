# Streaming (SSE) Documentation

## Overview

This application uses **Server-Sent Events (SSE)** for real-time updates, implementing the pattern specified in SPEC.md Section 7.

### Architecture

- **Backend**: Hono SSE endpoint at `/api/v1/stream/events`
- **Frontend**: EventSource client with exponential backoff reconnection
- **Pattern**: One SSE connection per session
- **Keep-alive**: Ping every 15 seconds

## Backend Implementation

### SSE Endpoint

`apps/api/src/sse.ts` implements the streaming endpoint:

```typescript
app.get('/events', async (c) => {
  return streamSSE(c, async (stream) => {
    const client = { stream, lastEventId: startId };
    clients.add(client);

    // Send initial connected event
    await stream.writeSSE({
      id: String(++eventIdCounter),
      event: 'connected',
      data: JSON.stringify({ message: 'Connected to event stream' }),
    });

    // Keep-alive loop
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 15000));
      await stream.writeSSE({
        id: String(++eventIdCounter),
        event: 'ping',
        data: JSON.stringify({ ts: Date.now() }),
      });
    }
  });
});
```

### Event Format (SPEC Compliant)

All events follow this strict format:

```json
{
  "type": "order.updated",
  "id": "ord_00042",
  "patch": { "status": "shipped", "updatedAt": "2026-01-16T10:00:00Z" },
  "ts": 1737017200000
}
```

**Fields**:
- `type`: Event type identifier (e.g., `order.updated`, `order.created`)
- `id`: Resource ID being updated
- `patch`: Partial update data (only changed fields)
- `ts`: Unix timestamp in milliseconds

### Broadcasting Events

When data changes, broadcast to all connected clients:

```typescript
import { broadcastEvent } from './sse.js';

// After updating an order
await broadcastEvent({
  type: 'order.updated',
  id: orderId,
  patch: updates,
  ts: Date.now(),
});
```

### Last-Event-ID Support

The endpoint supports `Last-Event-ID` header for recovery after disconnection:

```typescript
const lastEventId = c.req.header('Last-Event-ID');
const startId = lastEventId ? parseInt(lastEventId, 10) : eventIdCounter;
```

Clients automatically send this header on reconnection to avoid missing events.

## Frontend Implementation

### SSE Client Hook

`apps/web/hooks/useSSE.ts` provides a reusable hook:

```typescript
export function useSSE(url: string, onEvent?: (event: OrderEvent) => void) {
  // EventSource connection
  // Exponential backoff reconnection
  // Last-Event-ID tracking
  // Event parsing and dispatching
}
```

### Reconnection Strategy

**Exponential Backoff**:
1. First retry: 1 second
2. Second retry: 2 seconds
3. Third retry: 4 seconds
4. ...up to maximum 30 seconds

```typescript
const backoffMs = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
```

### TanStack Query Cache Patching

The `useOrderStream` hook patches the Query cache on events:

```typescript
export function useOrderStream() {
  const queryClient = useQueryClient();

  const handleEvent = useCallback((event: OrderEvent) => {
    if (event.type === 'order.updated') {
      // Patch detail cache
      queryClient.setQueryData(['orders', 'detail', event.id], (old) => {
        if (old) return { ...old, ...event.patch };
        return old;
      });

      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
    }
  }, [queryClient]);

  return useSSE('http://localhost:3001/api/v1/stream/events', handleEvent);
}
```

**Key Points**:
- **Detail cache**: Patch with `setQueryData` (avoid full refetch)
- **List cache**: Invalidate with `invalidateQueries` (trigger refetch)
- **SPEC compliance**: "patch TanStack Query cache with events (avoid full refetch)"

## Event Types

Currently supported events:

- `connected` - Initial connection established
- `ping` - Keep-alive heartbeat
- `order.updated` - Order status or data changed
- `order.created` - New order created

To add new events, define them in `packages/shared/src/index.ts`:

```typescript
export interface MetricUpdatedEvent extends SSEEvent<Partial<Metrics>> {
  type: 'metric.updated';
}
```

## Production Considerations

### Current State: In-Memory Clients Set

```typescript
const clients = new Set<SSEClient>();
```

**Limitations**:
- ✅ Simple, works for single server
- ❌ Won't scale across multiple API servers
- ❌ Events lost on server restart

### Redis Pub/Sub (Recommended for Production)

Replace in-memory set with Redis:

1. **Publisher**: API servers publish events to Redis channel
2. **Subscriber**: Each API server subscribes to channel
3. **Broadcast**: On event received, send to all local SSE clients

```typescript
// Pseudocode
redis.publish('events', JSON.stringify(event));

redis.subscribe('events', (message) => {
  const event = JSON.parse(message);
  broadcastToLocalClients(event);
});
```

### Sticky Sessions

If not using Redis, use sticky sessions (session affinity) at load balancer level to route users to the same API server.

## Testing SSE Locally

1. Start API server: `pnpm --filter api dev`
2. Start web app: `pnpm --filter web dev`
3. Navigate to Orders page
4. Open browser DevTools → Network tab → Filter "event"
5. See EventSource connection with "pending" status  
6. Update an order via API (Postman/curl)
7. Observe event in EventSource response
8. Watch Orders table update in real-time

## Error Handling

- **Connection loss**: Auto-reconnect with exponential backoff
- **Parse errors**: Log and skip malformed events
- **Stale events**: Use timestamps to ignore old updates
- **Missed events**: Last-Event-ID ensures recovery (if server tracks)

## Performance Tips

✅ One connection per session (don't create multiple)
✅ Compress SSE response (gzip)
✅ Filter events server-side (don't broadcast everything)
✅ Debounce rapid updates (batch within time window)
✅ Use selective cache invalidation (not blanket invalidate)

❌ Don't put large payloads in SSE (use IDs + fetch)
❌ Don't parse events in render path (use memoization)
❌ Don't create new EventSource on every render
