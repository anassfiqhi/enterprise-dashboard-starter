"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { config } from "@/lib/config";
import { toast } from "sonner";

interface AdminUsersFilters {
    search?: string;
    limit?: number;
    offset?: number;
}

/**
 * List all users via Better Auth admin plugin
 */
export function useAdminUsers(filters: AdminUsersFilters = {}) {
    const { search, limit = 20, offset = 0 } = filters;

    return useQuery({
        queryKey: ["admin-users", { search, limit, offset }],
        queryFn: async () => {
            const query: Record<string, string | number> = { limit, offset };
            if (search) {
                query.searchValue = search;
                query.searchField = "email";
            }
            const response = await authClient.admin.listUsers({ query });
            if (response.error) {
                throw new Error(response.error.message || "Failed to list users");
            }
            return response.data;
        },
    });
}

/**
 * Toggle super admin status for a user
 */
export function useToggleSuperAdmin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            isAdmin,
        }: {
            userId: string;
            isAdmin: boolean;
        }) => {
            // Set isAdmin field
            const updateRes = await authClient.admin.updateUser({
                userId,
                data: { isAdmin },
            });
            if (updateRes.error) {
                throw new Error(updateRes.error.message || "Failed to update user");
            }

            // Set role to "admin" or "user" based on super admin status
            const roleRes = await authClient.admin.setRole({
                userId,
                role: isAdmin ? "admin" : "user",
            });
            if (roleRes.error) {
                throw new Error(roleRes.error.message || "Failed to set role");
            }

            return updateRes.data;
        },
        onSuccess: (_, { isAdmin }) => {
            toast.success(
                isAdmin ? "Super Admin access granted" : "Super Admin access revoked"
            );
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update super admin status");
        },
    });
}

// ─── Membership hooks (custom routes) ────────────────────────────

interface Membership {
    id: string;
    role: string;
    createdAt: string;
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
}

/**
 * Get all org memberships for a specific user
 */
export function useUserMemberships(userId: string | null) {
    return useQuery({
        queryKey: ["admin-user-memberships", userId],
        queryFn: async () => {
            const response = await fetch(
                `${config.apiUrl}/api/v1/admin/users/${userId}/memberships`,
                { credentials: "include" }
            );
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || "Failed to fetch memberships");
            }
            const envelope = await response.json();
            return envelope.data.memberships as Membership[];
        },
        enabled: !!userId,
    });
}

/**
 * Add a user to an organization
 */
export function useAddUserToOrg() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            organizationId,
            role,
        }: {
            userId: string;
            organizationId: string;
            role: "admin" | "staff";
        }) => {
            const response = await fetch(
                `${config.apiUrl}/api/v1/admin/users/${userId}/memberships`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ organizationId, role }),
                }
            );
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || "Failed to add user to organization");
            }
            return response.json();
        },
        onSuccess: (_, { userId }) => {
            toast.success("User added to organization");
            queryClient.invalidateQueries({ queryKey: ["admin-user-memberships", userId] });
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

/**
 * Update a user's role in an organization
 */
export function useUpdateMemberRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            membershipId,
            role,
        }: {
            userId: string;
            membershipId: string;
            role: "admin" | "staff";
        }) => {
            const response = await fetch(
                `${config.apiUrl}/api/v1/admin/users/${userId}/memberships/${membershipId}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role }),
                }
            );
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || "Failed to update role");
            }
            return response.json();
        },
        onSuccess: (_, { userId }) => {
            toast.success("Member role updated");
            queryClient.invalidateQueries({ queryKey: ["admin-user-memberships", userId] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

/**
 * Remove a user from an organization
 */
export function useRemoveUserFromOrg() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            membershipId,
        }: {
            userId: string;
            membershipId: string;
        }) => {
            const response = await fetch(
                `${config.apiUrl}/api/v1/admin/users/${userId}/memberships/${membershipId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || "Failed to remove from organization");
            }
            return response.json();
        },
        onSuccess: (_, { userId }) => {
            toast.success("User removed from organization");
            queryClient.invalidateQueries({ queryKey: ["admin-user-memberships", userId] });
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}
