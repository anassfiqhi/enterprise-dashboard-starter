import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Order } from '@repo/shared';

export function useOrderStream() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const eventSource = new EventSource('http://localhost:3001/api/stream/events');

        eventSource.onmessage = (event) => {
            // Handle generic messages
        };

        eventSource.addEventListener('connected', (e) => {
            console.log('SSE Connected');
        });

        eventSource.addEventListener('order.updated', (e) => {
            const data = JSON.parse(e.data);
            // Patch logic
            queryClient.setQueryData(['orders', 'list'], (oldData: any) => {
                if (!oldData) return oldData;
                // Complex patching logic would go here
                return oldData;
            });
        });

        return () => {
            eventSource.close();
        };
    }, [queryClient]);
}
