"use client";

import { useMembers, useUpdateMemberRole, useRemoveMember } from "@/hooks/useMembers";
import {
    useInvitations,
    useInviteMember,
    useCancelInvitation,
} from "@/hooks/useInvitations";
import { usePermissions } from "@/hooks/usePermissions";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Trash2, X, Mail, Clock, Users } from "lucide-react";
import { useState } from "react";

function MembersLoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                </div>
            ))}
        </div>
    );
}

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

function MembersTab() {
    const { data: members, isLoading, error } = useMembers();
    const { can } = usePermissions();
    const updateRole = useUpdateMemberRole();
    const removeMember = useRemoveMember();
    const [pendingRemove, setPendingRemove] = useState<string | null>(null);

    const currentUserId = useSelector((state: RootState) => state.session.user?.id);

    const canUpdateMembers = can("member", "update");
    const canDeleteMembers = can("member", "delete");

    if (isLoading) {
        return <MembersLoadingSkeleton />;
    }

    if (error) {
        return (
            <p className="text-center text-destructive py-8">
                Failed to load members: {error.message}
            </p>
        );
    }

    const handleRemoveMember = (memberId: string, memberIdOrEmail: string) => {
        if (pendingRemove === memberId) {
            removeMember.mutate(
                { memberIdOrEmail },
                {
                    onSettled: () => setPendingRemove(null),
                }
            );
        } else {
            setPendingRemove(memberId);
            setTimeout(() => setPendingRemove(null), 3000);
        }
    };

    if (!members || members.length === 0) {
        return (
            <p className="text-center text-muted-foreground py-8">
                No members found
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    {canDeleteMembers && (
                        <TableHead className="w-[100px]">Actions</TableHead>
                    )}
                </TableRow>
            </TableHeader>
            <TableBody>
                {members.map((member) => {
                    const isOwner = member.role === "owner";
                    const isCurrentUser = member.userId === currentUserId;

                    return (
                        <TableRow key={member.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                            {member.user?.name
                                                ?.slice(0, 2)
                                                .toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">
                                        {member.user?.name || "Unknown"}
                                        {isCurrentUser && (
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                (you)
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {member.user?.email}
                            </TableCell>
                            <TableCell>
                                {canUpdateMembers && !isOwner && !isCurrentUser ? (
                                    <Select
                                        value={member.role}
                                        onValueChange={(role) =>
                                            updateRole.mutate({
                                                memberId: member.id,
                                                role,
                                            })
                                        }
                                        disabled={updateRole.isPending}
                                    >
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="member">Member</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Badge
                                        variant={
                                            isOwner
                                                ? "default"
                                                : member.role === "admin"
                                                ? "secondary"
                                                : "outline"
                                        }
                                    >
                                        {member.role}
                                    </Badge>
                                )}
                            </TableCell>
                            {canDeleteMembers && (
                                <TableCell>
                                    {!isOwner && !isCurrentUser && (
                                        <Button
                                            variant={
                                                pendingRemove === member.id
                                                    ? "destructive"
                                                    : "ghost"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                handleRemoveMember(
                                                    member.id,
                                                    member.id
                                                )
                                            }
                                            disabled={removeMember.isPending}
                                        >
                                            {pendingRemove === member.id ? (
                                                "Confirm?"
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

function InvitationsTab() {
    const { data: invitations, isLoading, error } = useInvitations();
    const { can } = usePermissions();
    const inviteMember = useInviteMember();
    const cancelInvitation = useCancelInvitation();

    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"member" | "admin" | "owner">("member");
    const [pendingCancel, setPendingCancel] = useState<string | null>(null);

    const canInvite = can("invitation", "create");
    const canCancel = can("invitation", "delete");

    if (isLoading) {
        return <InvitationsLoadingSkeleton />;
    }

    if (error) {
        return (
            <p className="text-center text-destructive py-8">
                Failed to load invitations: {error.message}
            </p>
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

export default function MembersPage() {
    const { canAny } = usePermissions();

    const canViewMembers = canAny([
        { resource: "member", action: "update" },
        { resource: "member", action: "delete" },
    ]);
    const canViewInvitations = canAny([
        { resource: "invitation", action: "create" },
        { resource: "invitation", action: "delete" },
    ]);

    const defaultTab = canViewMembers ? "members" : "invitations";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                    Manage members and invitations for your organization
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={defaultTab}>
                    <TabsList>
                        {canViewMembers && (
                            <TabsTrigger value="members">
                                <Users className="h-4 w-4 mr-2" />
                                Members
                            </TabsTrigger>
                        )}
                        {canViewInvitations && (
                            <TabsTrigger value="invitations">
                                <Mail className="h-4 w-4 mr-2" />
                                Invitations
                            </TabsTrigger>
                        )}
                    </TabsList>
                    {canViewMembers && (
                        <TabsContent value="members">
                            <MembersTab />
                        </TabsContent>
                    )}
                    {canViewInvitations && (
                        <TabsContent value="invitations">
                            <InvitationsTab />
                        </TabsContent>
                    )}
                </Tabs>
            </CardContent>
        </Card>
    );
}
