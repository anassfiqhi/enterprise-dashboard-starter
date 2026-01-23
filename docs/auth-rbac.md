# Authentication & RBAC Documentation

## Better Auth Setup

This project uses **Better Auth** for authentication, implementing Setup A from SPEC.md where the backend API owns all auth endpoints.

### Architecture

- **Auth Endpoints**: `/api/auth/*` hosted on Hono backend
- **Session Storage**: HTTP-only cookies
- **Frontend Integration**: `credentials: 'include'` on all API calls
- **OIDC/OAuth2**: Supports social providers via Better Auth

### Backend Configuration

```typescript
// apps/api/src/auth.ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: /* PostgreSQL adapter */,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  // Add OAuth providers here
});
```

## RBAC Model

### Permissions

Defined in `packages/shared/src/index.ts`:

- `orders:read` - View orders
- `orders:write` - Create/update orders
- `metrics:read` - View dashboard metrics
- `admin:*` - Wildcard for all permissions

### Roles

```typescript
const ROLES = {
  admin: {
    permissions: ['admin:*', 'orders:read', 'orders:write', 'metrics:read'],
  },
  user: {
    permissions: ['orders:read', 'metrics:read'],
  },
};
```

### Backend Enforcement

RBAC middleware (`apps/api/src/middleware/rbac.ts`) protects routes:

```typescript
import { requirePermission } from './middleware/rbac.js';

app.get('/v1/orders', requirePermission('orders:read'), async (c) => {
    // Handler has access to c.get('user') and c.get('session')
});
```

**Key Points**:
- Every protected route uses `requirePermission()` middleware
- Middleware validates session then checks role permissions
- Returns 401 for missing auth, 403 for insufficient permissions
- User/session data stored in Hono context for handlers

### Frontend Gating

UI-level permissions stored in Redux (`ui/sessionSlice`):

```typescript
const { permissions } = useSelector((state) => state.session);

// Hide UI elements user can't access
const canViewOrders = permissions.includes('orders:read');
```

**⚠️ Important**: Frontend gating is for UX only. Backend always enforces permissions.

## Session Flow

1. User logs in via `/api/auth/sign-in`
2. Better Auth creates session, sets HTTP-only cookie
3. Frontend requests include cookie automatically
4. Backend validates session on every request
5. Frontend fetches permissions snapshot and caches in Redux

## Adding OAuth Providers

Edit `apps/api/src/auth.ts` to add providers:

```typescript
export const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

Redirect URI: `http://localhost:3001/api/auth/callback/[provider]`

## Multi-Tenant Readiness

While not currently implemented, the architecture supports multi-tenancy:

1. Add `tenant_id` column to all tables
2. Include `tenant_id` in session data
3. Scope all queries by `tenant_id`
4. Use database-level Row Level Security (RLS) for enforcement

## Security Best Practices

✅ HTTP-only cookies prevent XSS attacks
✅ Session validation on every API request
✅ RBAC enforcement at API layer (not just UI)
✅ Credentials include mode for cross-origin requests
✅ Better Auth handles CSRF protection

❌ Do not store tokens in localStorage
❌ Do not trust frontend permission checks alone
❌ Do not expose session secrets in client code
