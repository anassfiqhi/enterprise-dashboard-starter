import type { User as BetterAuthUser, Session as BetterAuthSession } from 'better-auth';

declare module 'better-auth' {
    interface User extends BetterAuthUser {
        role: string;
    }

    interface Session extends BetterAuthSession {
        user: User;
    }
}
