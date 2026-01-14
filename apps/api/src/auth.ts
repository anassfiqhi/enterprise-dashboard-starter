import { betterAuth } from "better-auth";

export const auth = betterAuth({
    database: {
        provider: "sqlite", // For starter. Enterprise would use Postgres/etc.
        url: "database.sqlite"
    },
    emailAndPassword: {
        enabled: true
    },
    // socialProviders: { ... } // Add OIDC/OAuth2 here
});
