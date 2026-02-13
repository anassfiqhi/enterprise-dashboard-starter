import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import type { AccessControl } from "better-auth/plugins/access";
import { db } from "./src/db/index";
import * as schema from "./src/db/schema";
import { ac, admin, staff } from "@repo/shared";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}
if (!process.env.BETTER_AUTH_URL) {
    throw new Error("BETTER_AUTH_URL is not set");
}

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
    trustedOrigins: [process.env.CORS_ORIGIN || "http://localhost:3000"],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailAndPassword: {
        enabled: true
    },
    user: {
        additionalFields: {
            isSuperAdmin: {
                type: "boolean",
                defaultValue: false,
                input: false,
            },
        },
    },
    plugins: [
        organization({
            ac: ac as AccessControl,
            roles: {
                admin,
                staff,
            },
            creatorRole: "admin",
            allowUserToCreateOrganization: async (user) => {
                if (user.isSuperAdmin) return true;
                return false;
            },
            async sendInvitationEmail(data) {
                const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/accept-invitation/${data.id}`;
                console.log("=== INVITATION EMAIL ===");
                console.log(`To: ${data.email}`);
                console.log(`From: ${data.inviter.user.name || data.inviter.user.email}`);
                console.log(`Organization: ${data.organization.name}`);
                console.log(`Role: ${data.role}`);
                console.log(`Link: ${inviteLink}`);
                console.log("========================");
            },
            schema: {
                organization: {
                    additionalFields: {
                        timezone: {
                            type: "string",
                            defaultValue: "UTC",
                        },
                        checkInTime: {
                            type: "string",
                            defaultValue: "15:00",
                        },
                        checkOutTime: {
                            type: "string",
                            defaultValue: "11:00",
                        },
                        address: {
                            type: "string",
                        },
                        phone: {
                            type: "string",
                        },
                        contactEmail: {
                            type: "string",
                        },
                        currency: {
                            type: "string",
                            defaultValue: "USD",
                        },
                    },
                },
            },
        }),
    ],
});
