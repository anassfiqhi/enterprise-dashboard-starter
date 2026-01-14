import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './auth';
import sse from './sse';
import orders from './orders';

const app = new Hono().basePath('/api');

app.use('/*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'Hono API is running' });
});

app.on(['POST', 'GET'], '/auth/**', (c) => {
  return auth.handler(c.req.raw);
});

app.route('/stream', sse);
app.route('/orders', orders);



const port = Number(process.env.PORT!) || 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
