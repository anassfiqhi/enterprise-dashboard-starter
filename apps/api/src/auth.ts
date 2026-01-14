import { betterAuth } from "better-auth";
import { Pool } from "pg";
import "dotenv/config";

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not Set");

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL,
    }),
    emailAndPassword: {
        enabled: true
    },
    // socialProviders: { ... } // Add OIDC/OAuth2 here
});
