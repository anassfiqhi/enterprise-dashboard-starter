# Enterprise Dashboard Starter

A production-ready monorepo for data-heavy enterprise dashboards, built with **Next.js 16**, **Hono**, **Redux Toolkit + Redux Saga**, **Better Auth**, and **shadcn/ui**.

## Architecture

This project follows a strict separation of concerns for scalability and maintainability:

- **Apps**:
  - `apps/web`: **Next.js 16 (App Router)** frontend. Owns the UI, client-side routing, and presentation logic.
  - `apps/api`: **Hono (Node.js)** backend API. Owns the database connection, authentication, and core business logic.
- **Packages**:
  - `packages/shared`: Shared Zod schemas, TypeScript types, and constants used by both frontend and backend.

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm v9+
- PostgreSQL (local or hosted)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd enterprise-dashboard-starter
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Environment setup**:

   **Backend (`apps/api`):**
   ```bash
   cd apps/api
   cp .env.example .env
   ```

   | Variable | Description | Default |
   |---|---|---|
   | `DATABASE_URL` | PostgreSQL connection string | — |
   | `BETTER_AUTH_SECRET` | Random secret (`openssl rand -base64 32`) | — |
   | `BETTER_AUTH_URL` | Backend URL | `http://localhost:3001` |
   | `PORT` | API server port | `3001` |
   | `CORS_ORIGIN` | Frontend URL | `http://localhost:3000` |

   **Frontend (`apps/web`):**
   ```bash
   cd apps/web
   cp .env.example .env
   ```

   | Variable | Description | Default |
   |---|---|---|
   | `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/api` |
   | `NEXT_PUBLIC_AUTH_URL` | Backend auth URL | `http://localhost:3001` |
   | `NEXT_PUBLIC_SSE_URL` | Backend SSE URL | `http://localhost:3001` |

4. **Database setup**:
   ```bash
   cd apps/api
   pnpm db:push
   ```

5. **Seed database**:
   ```bash
   cd apps/api
   pnpm seed
   ```

   Default credentials: `admin@example.com` / `admin123`

6. **Run development servers**:
   ```bash
   pnpm dev
   ```

   Or individually:
   ```bash
   # Terminal 1
   cd apps/api && pnpm dev

   # Terminal 2
   cd apps/web && pnpm dev
   ```

   | Service | URL |
   |---|---|
   | Frontend | http://localhost:3000 |
   | API | http://localhost:3001/api |
   | SSE stream | http://localhost:3001/api/v1/stream/events |

## Technology Stack

### Frontend (`apps/web`)

| Concern | Library |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Server state | Redux Toolkit + Redux Saga |
| Data display | TanStack Table + TanStack Virtual |
| Charts | Recharts |
| Auth client | Better Auth |
| HTTP | Axios |
| Forms / validation | Zod |

### Backend (`apps/api`)

| Concern | Library |
|---|---|
| Framework | Hono |
| Auth | Better Auth |
| ORM | Drizzle ORM |
| Database | PostgreSQL (via `pg`) |
| Validation | Zod |
| Realtime | Server-Sent Events (SSE) |

## Features

- **Authentication & authorization**: Email/password login, HTTP-only session cookies, role-based permissions (RBAC)
- **Multi-tenant organizations**: Create orgs, invite members, manage roles and permissions
- **Bookings dashboard**: Metrics cards, availability calendar, analytics charts, reservations table
- **Guests management**: Guest profiles with booking history
- **Hotels management**: Hotel listings and availability
- **Promo codes**: Create and manage promotional codes
- **Real-time updates**: SSE-powered live data patching
- **Route protection**: Next.js middleware redirects unauthenticated users
- **Error handling**: Error boundaries and graceful empty/error states
- **Type safety**: End-to-end TypeScript with Zod schemas shared between frontend and backend

## Project Structure

```
├── apps
│   ├── api                  # Hono backend
│   │   ├── src/
│   │   └── scripts/         # Seed and migration scripts
│   └── web                  # Next.js frontend
│       ├── app/             # App Router routes
│       │   ├── bookings/    # Bookings, availability, analytics
│       │   ├── guests/      # Guest management
│       │   ├── hotels/      # Hotel management
│       │   ├── promo-codes/ # Promo code management
│       │   ├── settings/    # Org settings, members, invitations
│       │   └── system/      # Admin panel
│       ├── components/      # UI components + Storybook stories
│       ├── hooks/           # Custom React hooks
│       └── lib/             # Redux store, sagas, reducers, API client
├── packages
│   └── shared               # Shared Zod schemas and TypeScript types
├── .github/workflows/       # GitHub Actions (CI + Chromatic)
└── .husky/                  # Git hooks (commitlint, lint-staged)
```

## Available Scripts

### Root

| Script | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all test suites |
| `pnpm test:e2e` | Run Playwright end-to-end tests |

### Backend (`apps/api`)

| Script | Description |
|---|---|
| `pnpm dev` | Start API with hot reload |
| `pnpm build` | Compile to `dist/` |
| `pnpm start` | Start production server |
| `pnpm db:push` | Push Drizzle schema to database |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:reset` | Drop all tables (destructive) |
| `pnpm seed` | Seed admin user and sample data |
| `pnpm seed:interactive` | Interactive seeding |

### Frontend (`apps/web`)

| Script | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint (zero warnings) |
| `pnpm format` | Run Prettier |
| `pnpm test` | Run Jest unit tests |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm storybook` | Start Storybook on port 6006 |
| `pnpm build-storybook` | Build static Storybook |

## Testing

Unit tests use **Jest** with **Testing Library**. Mocks and fixtures live in `apps/web/__mocks__/`.

```bash
# Run all unit tests
cd apps/web && pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

End-to-end tests use **Playwright** and run from the repo root:

```bash
pnpm test:e2e
```

Component stories are published to **Chromatic** on every push via the `.github/workflows/chromatic.yml` workflow.

## Code Quality

- **ESLint** with zero-warnings policy enforced in CI
- **Prettier** with Tailwind CSS plugin for consistent formatting
- **Husky** pre-commit hook runs `lint-staged` (format + lint on changed files)
- **commitlint** enforces Conventional Commits on every commit message

## Troubleshooting

**Database connection errors**
- Confirm PostgreSQL is running: `psql -U postgres`
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`

**CORS errors**
- Verify `CORS_ORIGIN` in `apps/api/.env` matches the frontend URL exactly

**Authentication issues**
- Clear browser cookies and log in again
- Confirm `BETTER_AUTH_SECRET` is set in `apps/api/.env`
- Confirm database schema is up to date: `pnpm db:push`

**Build errors**
```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
rm -rf apps/web/.next
```

## License

MIT
