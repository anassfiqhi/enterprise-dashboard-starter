import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import type { AccessControl } from "better-auth/plugins/access";
import { db } from "./db/index";
import * as schema from "./db/schema";
import { ac, owner, admin, member } from "@repo/shared";
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
    plugins: [
        organization({
            ac: ac as AccessControl,
            roles: {
                owner,
                admin,
                member,
            },
            allowUserToCreateOrganization: async (user) => {
                const isAdmin = user.role === "admin";
                return isAdmin;
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
        }),
    ],
});
