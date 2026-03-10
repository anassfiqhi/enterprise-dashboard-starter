import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export function useRole() {
    return useQuery({
        queryKey: ["role"],
        queryFn: async () => {
            const { data, error } = await authClient.getSession();
            const { data: roleData, error: roleError } = await authClient.organization.getActiveMemberRole();
            if (error) {
                throw new Error(error.message);
            }
            if (roleError) {
                throw new Error(roleError.message);
            }
            if (!data) {
                throw new Error("Failed to fetch role");
            }
            if (!roleData) {
                throw new Error("Failed to fetch role");
            }
            if (data.user.role === "admin") {
                return data.user.role;
            }
            if (roleData.role) {
                return roleData.role;
            }
        },
    });
}