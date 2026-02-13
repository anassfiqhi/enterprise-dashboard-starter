# Enterprise Data-Heavy Dashboard — Option A (Updated)
## Next.js Frontend + Optional BFF + Hono(Node) API + Better Auth (OIDC/OAuth2) + SSE + Virtualized Tables

---

## 0) What you asked for (locked decisions)

### Architecture (Option A)
- **Frontend**: Next.js (App Router) + React + TypeScript
- **BFF (optional)**: Next.js Route Handlers for:
  - session / auth callbacks (optional)
  - lightweight aggregation
  - proxying to backend to hide internal services
- **Backend API**: **Node.js + TypeScript + Hono**
- **Auth**: **Better Auth** (OIDC/OAuth2 + sessions)
- **Streaming**: **SSE** endpoint in the backend API
- **Scale**: backend scales independently from frontend

### Data-heavy UI
- **Server state**: TanStack Query v5 (mandatory)
- **UI state**: Redux Toolkit (UI/orchestration only)
- **Tables**: TanStack Table + TanStack Virtual (virtualization)
- **UI kit**: Tailwind CSS + shadcn/ui

### Upgrade readiness later
- Redis (cache, sessions, rate limit)
- Queues/background jobs (exports, reports)
- Sharding/partitioning notes

---

## 1) Enterprise “non-negotiables”

### 1.1 State ownership rules
- ✅ **TanStack Query** owns **ALL server data** (lists/details/metrics).
- ✅ **Redux Toolkit** owns **UI + orchestration only** (filters, table state, layout, permission snapshot, toasts).
- ❌ Never store API responses in Redux.
- ❌ Never “mirror” TanStack Query cache into Redux.

### 1.2 Data-heavy rules
- Server-side pagination/filtering/sorting
- Virtualize large tables (rows, and columns if needed)
- Avoid expensive client-side aggregations

### 1.3 Streaming rules
- One SSE connection per session
- Keep-alives every 10–30 seconds
- Patch Query cache with events (avoid full refetch)
- Support `Last-Event-ID` for recovery

---

## 2) Monorepo layout (GitHub-ready)

Recommended structure:
```
repo/
  apps/
    web/                    # Next.js frontend (+ optional BFF routes)
    api/                    # Hono (Node) backend API (REST + SSE + Better Auth)
  packages/
    shared/                 # shared types + zod schemas + constants
  docs/
    architecture.md
    auth-rbac.md
    streaming.md
    scaling.md
```

Why monorepo:
- shared types & schemas
- consistent rules & tooling
- one CI pipeline

---

## 3) Technology stack

### apps/web (Next.js)
- Next.js App Router
- React + TypeScript strict
- Tailwind CSS
- shadcn/ui
- TanStack Query v5
- Redux Toolkit
- TanStack Table + TanStack Virtual
- Zod (from shared)

Testing:
- Vitest + React Testing Library
- MSW for API mocking
- Playwright for E2E

### apps/api (Hono on Node.js)
- Hono (Node runtime)
- TypeScript strict
- Better Auth mounted for auth endpoints
- REST routes (v1)
- SSE route (`/v1/stream/events`)
- Zod validation with shared schemas

---

## 4) Better Auth (OIDC/OAuth2) — enterprise pattern

### 4.1 Recommended auth model
- **Cookie-based session** (HTTP-only cookies) for browser apps
- OIDC/OAuth2 providers via Better Auth OAuth support

Implementation direction:
- Backend owns sessions and sets cookies
- Frontend requests use `credentials: "include"` (or same-origin)

### 4.2 Auth routing responsibilities
There are two valid enterprise setups:

#### Setup A (recommended): Backend API owns auth endpoints
- `apps/api` mounts Better Auth handlers at: `/api/auth/*` (or `/auth/*`)
- `apps/web` calls the API directly with cookies enabled
- Optional BFF proxies `/auth/*` if you want same-origin only

Pros:
- Backend is source of truth
- Scale backend independently
- Clear security boundaries

#### Setup B (optional): Next BFF hosts auth endpoints
- `apps/web` mounts Better Auth route handlers
- BFF issues cookies, then proxies API calls with session
- Backend trusts BFF (internal network)

Pros:
- Very convenient for frontend-only hosting
Cons:
- BFF becomes more than “thin”
- Harder independent scaling

**Decision for this spec**: **Setup A** (backend owns auth). BFF remains optional and thin.

### 4.3 RBAC with Better Auth
- Use Better Auth session/user identity + your RBAC storage/claims
- Backend enforces permissions per route
- Frontend uses a “permissions snapshot” endpoint to gate UI

---

## 5) RBAC (production-level)

### 5.1 Model
- **Role → permissions**
- Example permissions:
  - `orders:read`
  - `orders:write`
  - `admin:*`

### 5.2 Enforcement
- Backend middleware:
  - validates session
  - checks required permission for route
- Frontend:
  - hides buttons/menus if permission missing
  - **never** relies only on frontend gating

### 5.3 Multi-tenant readiness (optional)
- All data access scoped by `tenant_id`
- Prefer DB constraints (RLS or strict where clauses)

---

## 6) Backend API contract (Hono)

### 6.1 REST endpoints (example: Orders)
- `GET /v1/orders?page=&pageSize=&search=&status=&sort=`
- `GET /v1/orders/:id`
- `POST /v1/orders`
- `PATCH /v1/orders/:id`

### 6.2 Response envelope (recommended)
Success:
```json
{ "data": { }, "meta": { "requestId": "..." }, "error": null }
```

Error:
```json
{
  "data": null,
  "meta": { "requestId": "..." },
  "error": { "code": "VALIDATION_ERROR", "message": "..." }
}
```

### 6.3 Zod validation
- Input schemas in `packages/shared`
- Validate:
  - query params
  - request bodies
  - response types (optional but ideal)

---

## 7) Streaming (SSE) in backend API

### 7.1 Endpoint
- `GET /v1/stream/events`

### 7.2 Event format (strict)
```json
{
  "type": "order.updated",
  "id": "ord_00042",
  "patch": { "status": "shipped", "updatedAt": "2026-01-12T10:00:00Z" },
  "ts": 1730000000
}
```

### 7.3 Client behavior
- One connection per session
- Reconnect with exponential backoff
- On event:
  - patch TanStack Query detail cache
  - patch relevant list caches carefully OR invalidate selectively

---

## 8) Frontend data layer (TanStack Query + Redux Toolkit)

### 8.1 Query keys
Stable, derived from UI state:
```ts
["orders", "list", { page, pageSize, search, status, sort }]
```

### 8.2 Redux Toolkit UI slices (examples)
- `ui.ordersFilters`
- `ui.tablePreferences` (density, visible columns)
- `session.permissionsSnapshot` (optional)

Rules:
- keep slices synchronous & serializable
- do not store server entities

---

## 9) Virtualized tables (TanStack Table + TanStack Virtual)

### 9.1 Requirements
- server pagination/filter/sort
- row virtualization (mandatory)
- sticky header (recommended)
- column resizing/pinning (optional)

### 9.2 Component structure (recommended)
- `OrdersToolbar` (shadcn inputs/selects) → dispatch Redux actions
- `useOrders()` (TanStack Query) → fetch using filters
- `OrdersTableVirtualized` → TanStack Table model + TanStack Virtual renderer

---

## 10) Tailwind + shadcn/ui (enterprise UI system)

### 10.1 Rules
- consistent spacing/typography tokens
- shared components in `packages/ui` (optional)
- avoid per-page random CSS

### 10.2 Use shadcn for
- Button, Input, Select, Badge
- Dialog, DropdownMenu
- Toast/Sonner (optional)
- Table wrappers (logic stays in TanStack Table)

---

## 11) Optional BFF (Next route handlers)

Use BFF only when needed:
- OAuth/OIDC redirect handling where same-origin matters
- hide internal microservices/service discovery
- lightweight aggregation for a page

BFF stays thin:
- no heavy domain logic
- no large DB work
- no background jobs

---

## 12) Testing strategy (enterprise)

### Unit & integration
- Vitest
- React Testing Library
- MSW (mock API + streaming)

### E2E
- Playwright:
  - login flow
  - RBAC gating
  - orders list paging/filtering
  - SSE live updates

---

## 13) “Open for upgrade” scaling notes

### Redis (later)
Use for:
- caching hot endpoints
- session store (optional)
- rate limiting
- distributed locks

### Queues (later)
Use for:
- CSV exports
- report generation
- notification sending
- webhook retries

Common choices:
- BullMQ + Redis
- RabbitMQ
- SQS

### Sharding/partitioning (later)
- shard by `tenant_id`
- partition by time for event/metrics tables
- read replicas for analytics
- index query patterns

---

## 14) Step-by-step implementation plan (what to build)

### Phase 1 — Monorepo + tooling
- create `apps/web`, `apps/api`, `packages/shared`
- shared TS config, lint, formatting
- env templates

### Phase 2 — Backend (Hono + Better Auth)
- mount Better Auth routes (OIDC/OAuth2)
- create session middleware
- create RBAC middleware
- implement `/v1/orders` with pagination/filter/sort
- implement `/v1/stream/events` SSE
- **[NEW] Implement seed script (`pnpm run seed`) to create default admin user**

### Phase 3 — Frontend foundation
- Next layout shell
- Redux store + UI slices
- TanStack Query provider
- base API client (credentials include)
- **[NEW] Dashboard (Overview) page at `/` with summary metrics**


### Phase 4 — Orders feature (data-heavy)
- toolbar with shadcn controls (filters)
- `useOrders()` query based on Redux filters
- virtualized table using TanStack Table + Virtual

### Phase 5 — Streaming integration
- SSE client hub
- event handler patches query cache
- connection status UI

### Phase 6 — Auth & RBAC UI
- login/logout UI
- permissions snapshot endpoint
- gated routes/components in UI

### Phase 7 — Tests + CI
- Vitest/RTL/MSW tests
- Playwright e2e tests
- GitHub Actions pipeline

---

## 15) Repo generation instruction (for AI)

When the user says **“generate repo”**, produce a GitHub-ready monorepo that includes:
- `apps/api` Hono(Node) backend with:
  - Better Auth mounted
  - RBAC middleware
  - Orders endpoints
  - SSE stream endpoint
- `apps/web` Next.js frontend with:
  - Tailwind + shadcn/ui
  - Redux Toolkit UI state
  - TanStack Query server state
  - TanStack Table + Virtual implementation
  - SSE client patching query cache
- `packages/shared` with shared types + zod schemas
- `docs/` with architecture/auth/streaming/scaling notes
- `.env.example` + README instructions

**END OF SPEC**
