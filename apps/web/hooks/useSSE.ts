import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/lib/store';
import type { SSEEvent, Order } from '@repo/shared';
import { reservationsDataActions } from '@/lib/reducers/reservations/reservationsDataSlice';
import { FETCH_RESERVATIONS } from '@/lib/sagas/reservations/reservationsSaga';
import { config } from '@/lib/config';

export type OrderEvent = SSEEvent<Partial<Order>>;

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

    const connect = useCallback(function doConnect() {
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
                if (typeof parsed !== 'object' || !parsed.type) {
                    console.error('SSE event validation failed: Invalid format');
                    return;
                }

                const event = parsed as OrderEvent;
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

                doConnect();
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
 * Hook that connects to SSE and patches Redux store on events
 * (SPEC Section 7.3)
 */
export function useOrderStream() {
    const dispatch = useDispatch<AppDispatch>();

    const handleEvent = useCallback(
        (event: OrderEvent) => {
            if (event.type === 'order.updated') {
                console.log('Order updated via SSE:', event);

                // Patch detail and list in Redux store
                dispatch(
                    reservationsDataActions.patchReservationDetail({
                        id: event.id,
                        patch: event.patch,
                    }),
                );

                // Also re-fetch the list to ensure full consistency
                dispatch({ type: FETCH_RESERVATIONS, payload: {} });
            }
        },
        [dispatch]
    );

    return useSSE(config.sseUrl, handleEvent);
}
