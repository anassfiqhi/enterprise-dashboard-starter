import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { OrderEvent, Order } from '@repo/shared';
import { OrderEventSchema } from '@repo/shared';
import { config } from '@/lib/config';

/**
 * Generic SSE hook (SPEC Section 7.3)
 * Implements exponential backoff reconnection
 * Supports Last-Event-ID for recovery
 */
export function useSSE(url: string, onEvent?: (event: OrderEvent) => void) {
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttempts = useRef(0);
    const lastEventId = useRef<string>('0');

    const connect = useCallback(() => {
        // Skip if not in browser (SSR)
        if (typeof window === 'undefined') {
            return;
        }

        if (eventSourceRef.current) {
            return; // Already connected
        }

        // Build URL with Last-Event-ID if available
        const fullUrl = `${url}`;
        const eventSource = new EventSource(fullUrl, { withCredentials: true });

        eventSource.onopen = () => {
            console.log('SSE connected');
            reconnectAttempts.current = 0; // Reset attempts on successful connection
        };

        eventSource.addEventListener('connected', (e) => {
            console.log('SSE connection established:', e.data);
        });

        eventSource.addEventListener('ping', (e) => {
            // Keep-alive ping, update last event ID
            if (e.lastEventId) {
                lastEventId.current = e.lastEventId;
            }
        });

        // Listen for order.updated events
        eventSource.addEventListener('order.updated', (e) => {
            if (e.lastEventId) {
                lastEventId.current = e.lastEventId;
            }

            try {
                const parsed = JSON.parse(e.data);
                // Validate event with Zod (SPEC - type-safe event parsing)
                const validationResult = OrderEventSchema.safeParse(parsed);

                if (!validationResult.success) {
                    console.error('SSE event validation failed:', validationResult.error);
                    return;
                }

                const event: OrderEvent = validationResult.data as OrderEvent;
                onEvent?.(event);
            } catch (err) {
                console.error('Failed to parse SSE event:', err);
            }
        });

        eventSource.onerror = (err) => {
            console.error('SSE error:', err);
            eventSource.close();
            eventSourceRef.current = null;

            // Exponential backoff reconnection (SPEC Section 7.3)
            const backoffMs = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            reconnectAttempts.current += 1;

            console.log(`Reconnecting in ${backoffMs}ms (attempt ${reconnectAttempts.current})...`);

            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, backoffMs);
        };

        eventSourceRef.current = eventSource;
    }, [url, onEvent]);

    useEffect(() => {
        connect();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]);

    return {
        isConnected: typeof window !== 'undefined' && eventSourceRef.current?.readyState === EventSource.OPEN,
    };
}

/**
 * Hook that connects to SSE and patches TanStack Query cache on events
 * (SPEC Section 7.3)
 */
export function useOrderStream() {
    const queryClient = useQueryClient();

    const handleEvent = useCallback(
        (event: OrderEvent) => {
            if (event.type === 'order.updated') {
                console.log('Order updated via SSE:', event);

                // Patch detail cache if it exists
                queryClient.setQueryData<Order>(['orders', 'detail', event.id], (old) => {
                    if (old) {
                        return { ...old, ...event.patch };
                    }
                    return old;
                });

                // Invalidate list queries to refetch with updated data
                // (SPEC: "patch relevant list caches carefully OR invalidate selectively")
                queryClient.invalidateQueries({
                    queryKey: ['orders', 'list'],
                });
            }
        },
        [queryClient]
    );

    return useSSE(config.sseUrl, handleEvent);
}
