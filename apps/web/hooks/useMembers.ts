"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

/**
 * Hook to fetch all members of the currently active organization
 */
export function useMembers() {
    const { data: activeOrg } = authClient.useActiveOrganization();
    const organizationId = activeOrg?.id;

    return useQuery({
        queryKey: ["members", organizationId],
        queryFn: async () => {
            if (!organizationId) return [];
            const response = await authClient.organization.listMembers({
                query: {
                    organizationId,
                },
            });
            if (response.error) {
                throw new Error(response.error.message || "Failed to fetch members");
            }
            return response.data || [];
        },
        enabled: !!organizationId,
    });
}

/**
 * Mutation hook to update a member's role
 */
export function useUpdateMemberRole() {
    const queryClient = useQueryClient();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const organizationId = activeOrg?.id;

    return useMutation({
        mutationFn: async ({
            memberId,
            role,
        }: {
            memberId: string;
            role: string;
        }) => {
            const response = await authClient.organization.updateMemberRole({
                memberId,
                role,
                organizationId: organizationId || undefined,
            });
            if (response.error) {
                throw new Error(response.error.message || "Failed to update role");
            }
            return response.data;
        },
        onSuccess: () => {
            toast.success("Member role updated");
            queryClient.invalidateQueries({ queryKey: ["members", organizationId] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update role");
        },
    });
}

/**
 * Mutation hook to remove a member from the organization
 */
export function useRemoveMember() {
    const queryClient = useQueryClient();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const organizationId = activeOrg?.id;

    return useMutation({
        mutationFn: async ({ memberIdOrEmail }: { memberIdOrEmail: string }) => {
            const response = await authClient.organization.removeMember({
                memberIdOrEmail,
                organizationId: organizationId || undefined,
            });
            if (response.error) {
                throw new Error(response.error.message || "Failed to remove member");
            }
            return response.data;
        },
        onSuccess: () => {
            toast.success("Member removed successfully");
            queryClient.invalidateQueries({ queryKey: ["members", organizationId] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to remove member");
        },
    });
}
