"use client";

import { useQuery } from "@tanstack/react-query";
import { config } from "@/lib/config";

interface AdminOrganization {
    id: string;
    name: string;
    slug: string;
}

/**
 * List all organizations (super admin only)
 * Used for "add to org" dropdown
 */
export function useAdminOrganizations() {
    return useQuery({
        queryKey: ["admin-organizations"],
        queryFn: async () => {
            const response = await fetch(
                `${config.apiUrl}/api/v1/admin/organizations`,
                { credentials: "include" }
            );
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || "Failed to fetch organizations");
            }
            const envelope = await response.json();
            return envelope.data.organizations as AdminOrganization[];
        },
    });
}
