# Scaling Documentation

## Current Architecture

This application is built as a **monorepo optimized for future scaling** while remaining simple for development.

### Today (Development/Small Teams)

- Single repository with all code
- Shared types and validation schemas
- Can deploy together or separately
- Simple local development (`pnpm dev`)

### Tomorrow (Enterprise Scale)

The architecture is "open for upgrade" - designed to scale without major refactoring.

## Scaling Paths

### 1. Redis Integration

**Use Cases**:
- Session storage (Better Auth sessions)
- API response caching
- Rate limiting
- Distributed locks
- SSE pub/sub for multi-server

**Implementation**:

```typescript
// Session storage
import { betterAuth } from "better-auth";
import { redisAdapter } from "better-auth/adapters/redis";

export const auth = betterAuth({
  session: {
    adapter: redisAdapter(redisClient),
  },
});

// Caching
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

app.get('/v1/orders', async (c) => {
  const cacheKey = `orders:${page}:${filters}`;
  const cached = await redis.get(cacheKey);
  if (cached) return c.json(JSON.parse(cached));

  const orders = await fetchOrders();
  await redis.setex(cacheKey, 300, JSON.stringify(orders)); // 5min TTL
  return c.json(orders);
});
```

**When to Add**: When deploying multiple API servers or reaching 1000+ active sessions.

### 2. Background Jobs & Queues

**Use Cases**:
- CSV/Excel export generation
- Report processing
- Email/notification sending
- Webhook retries
- Batch data imports

**Recommended**: **BullMQ** (Redis-based, TypeScript-first)

```typescript
import { Queue, Worker } from 'bullmq';

const exportQueue = new Queue('exports', {
  connection: redisConnection,
});

// Enqueue job
app.post('/v1/exports', async (c) => {
  const job = await exportQueue.add('generate-csv', {
    userId: c.get('user').id,
    filters: c.req.query(),
  });

  return c.json({ jobId: job.id });
});

// Worker process
const worker = new Worker('exports', async (job) => {
  const csv = await generateOrdersCSV(job.data.filters);
  await uploadToS3(csv);
  await emailUser(job.data.userId, csvUrl);
}, { connection: redisConnection });
```

**When to Add**: When API requests start timing out due to long-running operations.

**Alternatives**: RabbitMQ (complex setups), AWS SQS (cloud-native).

### 3. Database Optimization

#### Read Replicas

Split read/write traffic for analytics and reporting:

```
Master (writes) → Replica 1 (reads)
                → Replica 2 (reads)
```

```typescript
const writeDB = new Pool({ host: 'master.db' });
const readDB = new Pool({ host: 'replica.db' });

// Heavy analytics query
app.get('/v1/reports', async (c) => {
  const result = await readDB.query('SELECT ...');
  return c.json(result.rows);
});
```

**When to Add**: When long-running reports slow down transactional queries.

#### Sharding by Tenant

For multi-tenant SaaS:

```
Shard 1: tenants 1-1000
Shard 2: tenants 1001-2000
Shard 3: tenants 2001-3000
```

```typescript
function getShardForTenant(tenantId: number) {
  const shardIndex = Math.floor(tenantId / 1000) % NUM_SHARDS;
  return dbShards[shardIndex];
}

const db = getShardForTenant(session.user.tenantId);
const orders = await db.query('SELECT * FROM orders WHERE tenant_id = $1', [tenantId]);
```

**When to Add**: When reaching 100GB+ database size or 10K+ tenants.

#### Partitioning by Time

For event/metrics tables:

```
orders_2024_01
orders_2024_02
orders_2024_03
```

Postgres automatically routes queries to correct partition.

**When to Add**: When tables exceed 10M rows and queries slow down.

#### Indexing Strategy

Critical indexes for current schema:

```sql
-- Orders table
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_tenant_id ON orders(tenant_id); -- if multi-tenant

-- Composite index for common filters
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
```

**Monitor**: Use `EXPLAIN ANALYZE` to identify slow queries.

### 4. Horizontal Scaling (API Servers)

Deploy multiple instances of `apps/api` behind a load balancer:

```
Load Balancer (Nginx/HAProxy/ALB)
  ↓
  ├→ API Server 1
  ├→ API Server 2
  ├→ API Server 3
```

**Requirements**:
- **Stateless servers** (no in-memory sessions)
- **Redis for SSE pub/sub** (broadcast events)
- **Shared database** (or connection pooler like PgBouncer)

**Deployment Example** (Docker Compose):

```yaml
services:
  api-1:
    build: ./apps/api
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://db:5432/app

  api-2:
    build: ./apps/api
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://db:5432/app

  nginx:
    image: nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

**When to Add**: When CPU/memory usage consistently > 70% on single server.

### 5. CDN & Edge Caching

For frontend static assets and API responses:

- **Next.js**: Deploy to Vercel (automatic edge caching)
- **API**: Use CloudFlare or Fastly for GET endpoint caching

Cache-Control headers:

```typescript
app.get('/v1/metrics', async (c) => {
  c.header('Cache-Control', 'public, max-age=60'); // Cache 1 minute
  return c.json(metrics);
});
```

**When to Add**: When serving users globally or frontend bundle is large.

### 6. Observability

**Logging**: Structured JSON logs with contextual info

```typescript
import pino from 'pino';
const logger = pino();

logger.info({
  userId: session.user.id,
  requestId: meta.requestId,
  duration: Date.now() - start,
}, 'Request completed');
```

**Tracing**: OpenTelemetry for distributed tracing

**Metrics**: Prometheus + Grafana for monitoring

Key metrics to track:
- Request latency (p50, p95, p99)
- Error rate
- Active SSE connections
- Database query time
- Queue depth

**When to Add**: Before hitting production (observability should be day 1).

## Deployment Strategies

### Option 1: All-in-One (Cheapest)

Deploy both apps on a single VPS (DigitalOcean Droplet, AWS EC2):

```bash
# On server
pnpm install
pnpm run build
pm2 start apps/api/dist/index.js --name api
pm2 start "npm run start" --cwd apps/web --name web
```

**Pros**: Simple, cost-effective
**Cons**: Single point of failure, limited scale

### Option 2: Separate Deployments (Recommended)

- **Frontend**: Vercel, Netlify (Next.js optimized)
- **API**: Railway, Render, Fly.io (Node.js hosting)
- **Database**: Supabase, Neon, managed Postgres

**Pros**: Independent scaling, better DX
**Cons**: Slightly higher cost

### Option 3: Kubernetes (Enterprise)

Full orchestration with Helm charts:

```
Deployment: api (3 replicas)
Deployment: web (2 replicas)
Service: PostgreSQL (StatefulSet)
Service: Redis (StatefulSet)
Ingress: NGINX/Traefik
```

**When**: 10K+ users, need auto-scaling and zero-downtime deploys.

## Cost Optimization Tips

1. **Use connection pooling** (PgBouncer) to reduce database connections
2. **Cache aggressively** (Redis) to reduce DB load
3. **Compress responses** (gzip/brotli)
4. **Paginate everything** - never return unbounded arrays
5. **Lazy load heavy UI** - code-split routes
6. **Optimize images** - Next.js Image component auto-optimizes
7. **Monitor query performance** - add indexes before scaling hardware

## When to Scale (Rules of Thumb)

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU > 70% sustained | Add horizontal scaling |
| DB connections > 80% | Add connection pooler |
| Query latency > 1s | Add indexes or read replicas |
| API latency > 500ms | Add caching layer |
| SSE clients > 1000 | Switch to Redis pub/sub |
| Storage > 100GB | Consider partitioning |

## Summary

✅ Architecture is production-ready from day 1
✅ Can scale incrementally (no big rewrite needed)
✅ Clear upgrade paths for each bottleneck
✅ Monorepo keeps complexity manageable

Start simple, scale when metrics demand it. Premature optimization is the root of all evil.
