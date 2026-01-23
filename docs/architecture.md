# Architecture Documentation

## Monorepo Structure

This enterprise dashboard follows the specified architecture from SPEC.md, implementing a scalable monorepo pattern with clear separation of concerns.

```
enterprise-dashboard-starter/
├── apps/
│   ├── web/          # Next.js frontend (+ optional BFF routes)
│   └── api/          # Hono (Node) backend API
├── packages/
│   └── shared/       # Shared types, schemas, constants
└── docs/            # Documentation
```

## Component Responsibilities

### apps/web - Next.js Frontend
- **Framework**: Next.js 16 with App Router
- **UI State**: Redux Toolkit (filters, preferences, session)
- **Server State**: TanStack Query v5 (all API data)
- **UI Components**: Tailwind CSS + shadcn/ui
- **Data Visualization**: TanStack Table + TanStack Virtual

**Key Pattern**: Strict separation - Redux owns UI state only, TanStack Query owns ALL server data.

### apps/api - Hono Backend
- **Framework**: Hono on Node.js runtime
- **Auth**: Better Auth (OIDC/OAuth2)
- **RBAC**: Permission-based middleware
- **Streaming**: SSE for real-time updates
- **API Versioning**: `/api/v1/*` routes

**Endpoints**:
- `GET /api/v1/orders` - Paginated, filtered, sorted orders
- `GET /api/v1/metrics` - Dashboard summary metrics
- `GET /api/v1/stream/events` - SSE event stream
- `POST /api/auth/**` - Better Auth handlers

### packages/shared
- Type definitions (`Order`, `User`, `Metrics`)
- Zod validation schemas
- Response envelope helpers
- RBAC types and role definitions
- SSE event types

## Data Flow

### Request Flow
```
User Action → Redux Dispatch → Query Key Update → TanStack Query → API Request → Response Envelope → Cache Update → UI Render
```

### SSE Flow
```
Backend Event → Broadcast to Clients → EventSource Receive → Parse Event → Patch Query Cache → UI Auto-Update
```

## BFF Pattern (Optional)

Currently implementing **Setup A** (Backend owns auth):
- Backend API hosts Better Auth at `/api/auth/*`
- Frontend calls API directly with `credentials: 'include'`
- No BFF layer for auth (simpler, better for independent scaling)

Optional BFF can be added via Next.js route handlers for:
- Aggregating multiple API calls
- Hiding internal service URLs
- Same-origin auth redirects

## Scaling Considerations

**Current State**: Single-server monorepo suitable for development and small deployments.

**Future Paths**:
- Deploy `apps/api` and `apps/web` independently
- Add Redis for caching and session storage
- Implement queues (BullMQ) for background jobs
- Horizontal scaling of API servers behind load balancer
- Read replicas for analytics queries

See [scaling.md](./scaling.md) for detailed upgrade paths.
