import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"
import type { AccessControl } from "better-auth/plugins/access"
import { config } from "./config"
import { ac, admin, staff } from "@repo/shared"

export const authClient = createAuthClient({
    baseURL: config.authUrl,
    plugins: [
        organizationClient({
            ac: ac as AccessControl,
            roles: {
                admin,
                staff,
            },
        }),
    ],
})

// Typed hooks for convenience
export const {
    useSession,
    useActiveOrganization,
    useListOrganizations,
    signIn,
    signOut,
    signUp,
} = authClient
