"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

/**
 * TanStack Query hook for organization invitations
 * Uses better-auth's organization plugin to fetch invitation data
 */
export function useInvitations() {
    const organizationId = useSelector(
        (state: RootState) => state.session.activeHotel?.id
    );

    return useQuery({
        queryKey: ["invitations", organizationId],
        queryFn: async () => {
            if (!organizationId) return [];
            const response = await authClient.organization.listInvitations({
                query: {
                    organizationId,
                },
            });
            if (response.error) {
                throw new Error(response.error.message || "Failed to fetch invitations");
            }
            return response.data || [];
        },
        enabled: !!organizationId,
    });
}

/**
 * Mutation hook for inviting a new member to the organization
 */
export function useInviteMember() {
    const queryClient = useQueryClient();
    const organizationId = useSelector(
        (state: RootState) => state.session.activeHotel?.id
    );

    return useMutation({
        mutationFn: async ({ email, role }: { email: string; role: "member" | "admin" | "owner" }) => {
            const response = await authClient.organization.inviteMember({
                email,
                role,
                organizationId: organizationId || undefined,
            });
            if (response.error) {
                throw new Error(response.error.message || "Failed to send invitation");
            }
            return response.data;
        },
        onSuccess: () => {
            toast.success("Invitation sent successfully");
            queryClient.invalidateQueries({ queryKey: ["invitations", organizationId] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to send invitation");
        },
    });
}

/**
 * Mutation hook for cancelling a pending invitation
 */
export function useCancelInvitation() {
    const queryClient = useQueryClient();
    const organizationId = useSelector(
        (state: RootState) => state.session.activeHotel?.id
    );

    return useMutation({
        mutationFn: async ({ invitationId }: { invitationId: string }) => {
            const response = await authClient.organization.cancelInvitation({
                invitationId,
            });
            if (response.error) {
                throw new Error(response.error.message || "Failed to cancel invitation");
            }
            return response.data;
        },
        onSuccess: () => {
            toast.success("Invitation cancelled");
            queryClient.invalidateQueries({ queryKey: ["invitations", organizationId] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to cancel invitation");
        },
    });
}
