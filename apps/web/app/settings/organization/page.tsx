"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { authClient } from "@/lib/auth-client";
import { usePermissions } from "@/hooks/usePermissions";
import { useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/features/ui/sessionSlice";
import { Building2, AlertTriangle } from "lucide-react";

export default function OrganizationPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const queryClient = useQueryClient();
    const activeHotel = useSelector(
        (state: RootState) => state.session.activeHotel
    );
    const { can } = usePermissions();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const canUpdate = can("organization", "update");
    const canDelete = can("organization", "delete");

    useEffect(() => {
        if (activeHotel) {
            setName(activeHotel.name);
            setSlug(activeHotel.slug || "");
        }
    }, [activeHotel]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeHotel || !canUpdate) return;

        setIsUpdating(true);
        try {
            const response = await authClient.organization.update({
                data: { name, slug },
            });

            if (response.error) {
                throw new Error(response.error.message || "Failed to update organization");
            }

            toast.success("Organization updated successfully");
            // Invalidate session to refresh organization data
            queryClient.invalidateQueries({ queryKey: ["session"] });
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to update organization"
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!activeHotel || !canDelete) return;

        if (!deleteConfirm) {
            setDeleteConfirm(true);
            setTimeout(() => setDeleteConfirm(false), 5000);
            return;
        }

        setIsDeleting(true);
        try {
            const response = await authClient.organization.delete({
                organizationId: activeHotel.id,
            });

            if (response.error) {
                throw new Error(response.error.message || "Failed to delete organization");
            }

            toast.success("Organization deleted");
            // Clear session and redirect
            dispatch(clearSession());
            queryClient.clear();
            router.push("/");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to delete organization"
            );
        } finally {
            setIsDeleting(false);
            setDeleteConfirm(false);
        }
    };

    if (!activeHotel) {
        return (
            <Card>
                <CardContent className="py-8">
                    <p className="text-center text-muted-foreground">
                        No hotel selected
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        <CardTitle>Organization Settings</CardTitle>
                    </div>
                    <CardDescription>
                        Update your organization&apos;s details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={!canUpdate || isUpdating}
                                placeholder="My Organization"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">URL Slug</Label>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) =>
                                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                                }
                                disabled={!canUpdate || isUpdating}
                                placeholder="my-organization"
                            />
                            <p className="text-sm text-muted-foreground">
                                Used in URLs and must be unique across all organizations
                            </p>
                        </div>
                        {canUpdate && (
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </Button>
                        )}
                    </form>
                </CardContent>
            </Card>

            {canDelete && (
                <Card className="border-destructive/50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        </div>
                        <CardDescription>
                            Irreversible actions for this organization
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertDescription>
                                Deleting this organization will permanently remove all members,
                                invitations, and associated data. This action cannot be undone.
                            </AlertDescription>
                        </Alert>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting
                                ? "Deleting..."
                                : deleteConfirm
                                ? "Click again to confirm deletion"
                                : "Delete Organization"}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
