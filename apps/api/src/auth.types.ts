// Type extensions for Better Auth
// This file extends Better Auth's default types with custom fields

declare module "better-auth" {
    interface User {
        isSuperAdmin?: boolean;
    }

    interface Organization {
        timezone?: string;
        checkInTime?: string;
        checkOutTime?: string;
        address?: string;
        phone?: string;
        contactEmail?: string;
        currency?: string;
    }
}

export { };
