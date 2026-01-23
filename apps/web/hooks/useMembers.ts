"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

/**
 * TanStack Query hook for organization members
 * Uses better-auth's organization plugin to fetch member data
 */
export function useMembers() {
    const organizationId = useSelector(
        (state: RootState) => state.session.organization?.id
    );

    return useQuery({
        queryKey: ["members", organizationId],
        queryFn: async () => {
            if (!organizationId) return [];
            const response = await authClient.organization.getFullOrganization({
                query: {
                    organizationId,
                },
            });
            if (response.error) {
                throw new Error(response.error.message || "Failed to fetch members");
            }
            return response.data?.members || [];
        },
        enabled: !!organizationId,
    });
}

/**
 * Mutation hook for updating a member's role
 */
export function useUpdateMemberRole() {
    const queryClient = useQueryClient();
    const organizationId = useSelector(
        (state: RootState) => state.session.organization?.id
    );

    return useMutation({
        mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
            const response = await authClient.organization.updateMemberRole({
                memberId,
                role,
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
 * Mutation hook for removing a member from the organization
 */
export function useRemoveMember() {
    const queryClient = useQueryClient();
    const organizationId = useSelector(
        (state: RootState) => state.session.organization?.id
    );

    return useMutation({
        mutationFn: async ({ memberIdOrEmail }: { memberIdOrEmail: string }) => {
            const response = await authClient.organization.removeMember({
                memberIdOrEmail,
                organizationId,
            });
            if (response.error) {
                throw new Error(response.error.message || "Failed to remove member");
            }
            return response.data;
        },
        onSuccess: () => {
            toast.success("Member removed from organization");
            queryClient.invalidateQueries({ queryKey: ["members", organizationId] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to remove member");
        },
    });
}
