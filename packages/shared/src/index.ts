import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['admin', 'user']),
});

export type User = z.infer<typeof UserSchema>;

export const OrderSchema = z.object({
    id: z.string(),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    customer: z.string(),
    amount: z.number(),
    createdAt: z.string(),
});

export type Order = z.infer<typeof OrderSchema>;
