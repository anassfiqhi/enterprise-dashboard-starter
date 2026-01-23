"use client";

import {
    useInvitations,
    useInviteMember,
    useCancelInvitation,
} from "@/hooks/useInvitations";
import { usePermissions } from "@/hooks/usePermissions";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Mail, Clock } from "lucide-react";
import { useState } from "react";

function InvitationsLoadingSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-56" />
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-28" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function InvitationsPage() {
    const { data: invitations, isLoading, error } = useInvitations();
    const { hasPermission } = usePermissions();
    const inviteMember = useInviteMember();
    const cancelInvitation = useCancelInvitation();

    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"member" | "admin" | "owner">("member");
    const [pendingCancel, setPendingCancel] = useState<string | null>(null);

    const canInvite = hasPermission("invitation", "create");
    const canCancel = hasPermission("invitation", "cancel");

    if (isLoading) {
        return <InvitationsLoadingSkeleton />;
    }

    if (error) {
        return (
            <Card>
                <CardContent className="py-8">
                    <p className="text-center text-destructive">
                        Failed to load invitations: {error.message}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        inviteMember.mutate(
            { email, role },
            {
                onSuccess: () => {
                    setEmail("");
                    setRole("member");
                },
            }
        );
    };

    const handleCancel = (invitationId: string) => {
        if (pendingCancel === invitationId) {
            cancelInvitation.mutate(
                { invitationId },
                {
                    onSettled: () => setPendingCancel(null),
                }
            );
        } else {
            setPendingCancel(invitationId);
            setTimeout(() => setPendingCancel(null), 3000);
        }
    };

    const pendingInvitations =
        invitations?.filter((inv) => inv.status === "pending") || [];

    const formatExpiry = (expiresAt: string | Date) => {
        const date = new Date(expiresAt);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return "Expired";
        if (days === 0) return "Today";
        if (days === 1) return "Tomorrow";
        return `${days} days`;
    };

    return (
        <div className="space-y-6">
            {canInvite && (
                <Card>
                    <CardHeader>
                        <CardTitle>Invite New Member</CardTitle>
                        <CardDescription>
                            Send an invitation email to add someone to your organization
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleInvite} className="flex gap-4">
                            <Input
                                type="email"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1"
                                required
                            />
                            <Select value={role} onValueChange={(v) => setRole(v as "member" | "admin" | "owner")}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                type="submit"
                                disabled={inviteMember.isPending || !email}
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                {inviteMember.isPending ? "Sending..." : "Send Invite"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                    <CardDescription>
                        {pendingInvitations.length === 0
                            ? "No pending invitations"
                            : `${pendingInvitations.length} pending invitation${
                                  pendingInvitations.length === 1 ? "" : "s"
                              }`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingInvitations.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No pending invitations. Invite someone to get started!
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Expires</TableHead>
                                    {canCancel && (
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingInvitations.map((invitation) => (
                                    <TableRow key={invitation.id}>
                                        <TableCell className="font-medium">
                                            {invitation.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    invitation.role === "admin"
                                                        ? "secondary"
                                                        : "outline"
                                                }
                                            >
                                                {invitation.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatExpiry(invitation.expiresAt)}
                                            </div>
                                        </TableCell>
                                        {canCancel && (
                                            <TableCell>
                                                <Button
                                                    variant={
                                                        pendingCancel === invitation.id
                                                            ? "destructive"
                                                            : "ghost"
                                                    }
                                                    size="sm"
                                                    onClick={() => handleCancel(invitation.id)}
                                                    disabled={cancelInvitation.isPending}
                                                >
                                                    {pendingCancel === invitation.id ? (
                                                        "Confirm?"
                                                    ) : (
                                                        <X className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
