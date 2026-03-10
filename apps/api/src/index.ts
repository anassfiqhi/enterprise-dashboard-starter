import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './auth';
import { errorHandler } from './middleware/error';
import { requireAdmin, requireManager, requireStaff } from './middleware/rbac';
// import guests from './routes/guests';
// import reservations from './routes/reservations';
// import roomTypes from './routes/room-types';
// import rooms from './routes/rooms';
// import activityTypes from './routes/activity-types';
// import activitySlots from './routes/activity-slots';
// import inventory from './routes/inventory';
// import pricingRules from './routes/pricing-rules';
// import auditLogs from './routes/audit-logs';
// import adminRoutes from './routes/admin';

const app = new Hono();

// CORS - must be first
app.use('/*', cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Auth routes (Better Auth) - handle at /api/auth/*
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// API routes
app.get('/api', (c) => {
  return c.json({ status: 'ok', message: 'Hotel Management API is running' });
});

// Global error handler for API routes
app.use('/api/v1/*', errorHandler);

// v1 API routes
// app.route('/api/v1/guests', guests);
// app.route('/api/v1/reservations', reservations);
// app.route('/api/v1/room-types', roomTypes);
// app.route('/api/v1/rooms', rooms);
// app.route('/api/v1/activity-types', activityTypes);
// app.route('/api/v1/activity-slots', activitySlots);
// app.route('/api/v1/inventory', inventory);
// app.route('/api/v1/pricing-rules', pricingRules);
// app.route('/api/v1/audit-logs', auditLogs);
// app.route('/api/v1/admin', adminRoutes);

app.get('/api/v1/test/admin', requireAdmin, (c) => {
  return c.json({ message: 'You have permission to update organization' });
});

app.get('/api/v1/test/manager', requireManager, (c) => {
  console.log('[INDEX] /api/v1/test/manager handler hit');
  return c.json({ message: 'You have permission to update organization' });
});

app.get('/api/v1/test/staff', requireStaff, (c) => {
  console.log('[INDEX] /api/v1/test/staff handler hit');
  return c.json({ message: 'You have permission to update organization' });
});

const port = Number(process.env.PORT!) || 3001;

if (process.env.NODE_ENV === 'development') {

  console.log(`
  \x1b[32m🚀 Hotel Management API is running!\x1b[0m

  \x1b[34m➜\x1b[0m \x1b[1mPort:\x1b[0m         ${port}
  \x1b[34m➜\x1b[0m \x1b[1mDatabase URL:\x1b[0m \x1b[90m${process.env.DATABASE_URL}\x1b[0m
  \x1b[34m➜\x1b[0m \x1b[1mAuth URL:\x1b[0m     \x1b[90m${process.env.BETTER_AUTH_URL}\x1b[0m
  `);

}

serve({
  fetch: app.fetch,
  port
});
