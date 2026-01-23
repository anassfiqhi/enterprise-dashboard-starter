# Enterprise Dashboard Starter

A production-ready monorepo for data-heavy enterprise dashboards, featuring **Next.js**, **Hono**, **TanStack Query**, **Redux Toolkit**, and **Better Auth**.

## 🏗 Architecture

This project follows a strict separation of concerns for scalability and maintainability:

-   **Apps**:
    -   `apps/web`: **Next.js (App Router)** frontend. Owns the UI, client-side routing, and presentation.
    -   `apps/api`: **Hono (Node.js)** backend API. Owns the database connection, authentication, and core business logic.
-   **Packages**:
    -   `packages/shared`: Shared Zod schemas, TypeScript types, and constants used by both frontend and backend.

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   pnpm (v9+)
-   PostgreSQL (Local or hosted)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd enterprise-dashboard-starter
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```

3.  **Environment Setup**:

    **Backend (`apps/api`):**
    ```bash
    cd apps/api
    cp .env.example .env
    ```

    Update the following variables in `apps/api/.env`:
    - `DATABASE_URL`: Your PostgreSQL connection string
    - `BETTER_AUTH_SECRET`: Random secret key (generate with `openssl rand -base64 32`)
    - `BETTER_AUTH_URL`: Your backend URL (default: `http://localhost:3001`)
    - `PORT`: API server port (default: `3001`)
    - `CORS_ORIGIN`: Frontend URL (default: `http://localhost:3000`)

    **Frontend (`apps/web`):**
    ```bash
    cd apps/web
    cp .env.example .env
    ```

    Update the following variables in `apps/web/.env`:
    - `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:3001/api`)
    - `NEXT_PUBLIC_AUTH_URL`: Backend auth URL (default: `http://localhost:3001`)
    - `NEXT_PUBLIC_SSE_URL`: Backend SSE URL (default: `http://localhost:3001`)

4.  **Database Setup**:

    Push the Drizzle schema to your database:
    ```bash
    cd apps/api
    pnpm db:push
    ```

5.  **Seed Database**:

    Create a default admin user and sample orders data:
    ```bash
    cd apps/api
    pnpm seed
    ```

    Default credentials:
    - Email: `admin@example.com`
    - Password: `admin123`

    This will create an admin user and seed 50 sample orders.

6.  **Run Development Server**:

    From the root directory:
    ```bash
    pnpm dev
    ```

    Or run apps individually:
    ```bash
    # Terminal 1 - Backend API
    cd apps/api && pnpm dev

    # Terminal 2 - Frontend
    cd apps/web && pnpm dev
    ```

    Access the application:
    -   Frontend: [http://localhost:3000](http://localhost:3000)
    -   API: [http://localhost:3001/api](http://localhost:3001/api)
    -   SSE Events: [http://localhost:3001/api/v1/stream/events](http://localhost:3001/api/v1/stream/events)

### Building
To build all applications for production:
```bash
pnpm build
```

## 🛠 Technology Stack

### Frontend (`apps/web`)
-   **Framework**: Next.js 15 (App Router)
-   **Styling**: Tailwind CSS + shadcn/ui
-   **Server State**: TanStack Query v5 (Caching, synchronization)
-   **UI State**: Redux Toolkit (Orchestration, complex UI state)
-   **Data Display**: TanStack Table + TanStack Virtual (High-performance tables)

### Backend (`apps/api`)
-   **Runtime**: Node.js
-   **Framework**: Hono (Fast, lightweight web framework)
-   **Auth**: Better Auth (OIDC/OAuth2, Sessions)
-   **ORM**: Drizzle ORM (Type-safe SQL queries)
-   **Validation**: Zod (Shared with frontend)
-   **Database**: PostgreSQL (via `pg` driver)
-   **Realtime**: Server-Sent Events (SSE)

## 📂 Project Structure

```
├── apps
│   ├── api          # Hono backend API
│   └── web          # Next.js frontend
├── packages
│   └── shared       # Shared types and schemas
├── docs             # Architecture documentation
└── README.md        # This file
```

## 🔐 Authentication
Authentication is handled by **Better Auth** mounted in the API. The frontend communicates directly with the API using HTTP-only cookies for session management.

## 📡 Realtime Updates
The API exposes an SSE endpoint (`/v1/stream/events`) for pushing real-time updates to the client. The frontend consumes these events to patch the TanStack Query cache efficiently.

## ✨ Features

- **Authentication & Authorization**: Secure login with Better Auth, role-based permissions (RBAC)
- **Route Protection**: Next.js middleware automatically redirects unauthenticated users
- **Dashboard**: Real-time metrics calculated from live order data
- **Orders Management**: Paginated, filterable, sortable orders table with virtualization
- **Real-time Updates**: Server-Sent Events (SSE) for live order updates
- **Error Handling**: Comprehensive error boundaries and graceful error states
- **Type Safety**: End-to-end type safety with TypeScript and Zod validation
- **Responsive UI**: Modern UI with Tailwind CSS and shadcn/ui components
- **Performance**: Optimized with TanStack Query caching and React Virtual

## 🔧 Available Scripts

### Root Directory
- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm lint` - Lint all packages

### Backend (`apps/api`)
- `pnpm dev` - Start API server in development mode
- `pnpm build` - Build API for production
- `pnpm start` - Start production API server
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Drizzle Studio (database GUI)
- `pnpm db:reset` - Drop all tables (destructive!)
- `pnpm seed` - Seed database with admin user + sample orders
- `pnpm seed:interactive` - Interactive seeding (for custom users)

### Frontend (`apps/web`)
- `pnpm dev` - Start Next.js in development mode
- `pnpm build` - Build Next.js for production
- `pnpm start` - Start production Next.js server
- `pnpm lint` - Lint frontend code

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `psql -U postgres`
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Ensure database exists: `createdb your_database_name`

### CORS Errors
- Verify `CORS_ORIGIN` in `apps/api/.env` matches your frontend URL
- Check that both frontend and backend are running on expected ports

### Authentication Issues
- Clear browser cookies and try logging in again
- Verify `BETTER_AUTH_SECRET` is set in `apps/api/.env`
- Check that database migrations have been run

### Build Errors
- Clear all node_modules: `rm -rf node_modules apps/*/node_modules packages/*/node_modules`
- Reinstall dependencies: `pnpm install`
- Clear Next.js cache: `rm -rf apps/web/.next`

## 📚 Documentation

For detailed architecture and implementation guides, see:
- [SPEC.md](./SPEC.md) - Complete technical specification
- [FIXES_APPLIED.md](./FIXES_APPLIED.md) - Changelog of improvements and fixes
- [docs/](./docs/) - Additional architecture documentation

## 🤝 Contributing

This is a template repository. Feel free to fork and customize for your needs.

## 📄 License

MIT
