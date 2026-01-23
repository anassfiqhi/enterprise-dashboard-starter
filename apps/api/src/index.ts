import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './auth';
import { errorHandler } from './middleware/error';
import sse from './sse';
import orders from './orders';
import metrics from './metrics';
import session from './session';

const app = new Hono().basePath('/api');

// Global error handler
app.use('/*', errorHandler);

// CORS
app.use('/*', cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'Hono API is running' });
});

// Auth routes
app.on(['POST', 'GET'], '/auth/**', (c) => {
  return auth.handler(c.req.raw);
});

// v1 API routes
app.route('/v1/stream', sse);
app.route('/v1/orders', orders);
app.route('/v1/metrics', metrics);
app.route('/v1/session', session);

const port = Number(process.env.PORT!) || 3001;

if (process.env.NODE_ENV === 'development') {
  console.table({
    'Port': port,
    'Database URL': process.env.DATABASE_URL,
    'Auth URL': process.env.BETTER_AUTH_URL,
  });
}

serve({
  fetch: app.fetch,
  port
});
