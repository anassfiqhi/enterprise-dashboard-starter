import { createAuthClient } from "better-auth/react"
import { adminClient, inferOrgAdditionalFields, organizationClient, jwtClient } from "better-auth/client/plugins"
import type { AccessControl } from "better-auth/plugins/access"
import { config } from "./config"
import { organizationPluginAccessControl, managerRole, staffRole, adminPluginAccessControl, adminRole, userRole } from "@repo/shared"


export const authClient = createAuthClient({
    baseURL: config.authUrl,
    plugins: [
        adminClient({
            ac: adminPluginAccessControl as AccessControl,
            roles: {
                admin: adminRole,
                user: userRole,
            },
        }),
        organizationClient({
            ac: organizationPluginAccessControl as AccessControl,
            roles: {
                manager: managerRole,
                staff: staffRole,
            },
            schema: inferOrgAdditionalFields({
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
            }),
        }),
        jwtClient(),
        // inferAdditionalFields({
        //     user: {
        //         isAdmin: {
        //             type: "boolean",
        //             required: false,
        //         },
        //     },
        // }),
    ],
    fetchOptions: {
        onSuccess: (ctx) => {
            if (typeof window !== "undefined") {
                const authToken = ctx.response.headers.get("set-auth-token") // get the token from the response headers
                // Store the token securely (e.g., in localStorage)
                if (authToken) {
                    localStorage.setItem("bearer_token", authToken);
                }
            }
        },
        auth: {
            type: "Bearer",
            token: () => {
                if (typeof window !== "undefined") {
                    return localStorage.getItem("bearer_token") || "";
                }
                return "";
            }
        }
    }
})


export type Session = typeof authClient.$Infer.Session
export type User = typeof authClient.$Infer.Session.user
export type Organization = typeof authClient.$Infer.Organization
export type Member = typeof authClient.$Infer.Member

