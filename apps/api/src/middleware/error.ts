import type { Context, Next } from 'hono';
import { createErrorEnvelope } from '@repo/shared';

/**
 * Global error handler middleware
 * Catches errors and returns consistent error envelopes
 */
export async function errorHandler(c: Context, next: Next) {
    try {
        await next();
    } catch (err: any) {
        console.error('Error:', err);

        // Handle Zod validation errors
        if (err.name === 'ZodError') {
            return c.json(
                createErrorEnvelope('VALIDATION_ERROR', 'Invalid request data', err.errors),
                400
            );
        }

        // Generic error
        return c.json(
            createErrorEnvelope(
                'INTERNAL_ERROR',
                err.message || 'An unexpected error occurred'
            ),
            500
        );
    }
}
