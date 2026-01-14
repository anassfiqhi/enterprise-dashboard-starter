import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Order, OrderSchema } from '@repo/shared';
import axios from 'axios';
import { z } from 'zod';

const OrdersResponseSchema = z.object({
    data: z.array(OrderSchema),
    meta: z.object({
        total: z.number(),
        page: z.number(),
        pageSize: z.number(),
    }),
});

export function useOrders() {
    const { page, pageSize, filters } = useSelector((state: RootState) => state.orders);

    return useQuery({
        queryKey: ['orders', 'list', { page, pageSize, ...filters }],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                ...(filters as unknown as Record<string, string>),
            }); // Filter logic to be handled by API

            const { data } = await axios.get(`http://localhost:3001/api/orders?${params.toString()}`, {
                withCredentials: true // Important for cookies
            });

            return OrdersResponseSchema.parse(data);
        },
    });
}
