"use client";

import { useMembers, useUpdateMemberRole, useRemoveMember } from "@/hooks/useMembers";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { useState } from "react";

function MembersLoadingSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
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
            </CardContent>
        </Card>
    );
}

export default function MembersPage() {
    const { data: members, isLoading, error } = useMembers();
    const { hasPermission } = usePermissions();
    const updateRole = useUpdateMemberRole();
    const removeMember = useRemoveMember();
    const [pendingRemove, setPendingRemove] = useState<string | null>(null);

    const currentUserId = useSelector((state: RootState) => state.session.user?.id);

    const canUpdateMembers = hasPermission("member", "update");
    const canDeleteMembers = hasPermission("member", "delete");

    if (isLoading) {
        return <MembersLoadingSkeleton />;
    }

    if (error) {
        return (
            <Card>
                <CardContent className="py-8">
                    <p className="text-center text-destructive">
                        Failed to load members: {error.message}
                    </p>
                </CardContent>
            </Card>
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
            // Reset confirmation after 3 seconds
            setTimeout(() => setPendingRemove(null), 3000);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Organization Members</CardTitle>
                <CardDescription>
                    Manage members and their roles in your organization
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!members || members.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No members found
                    </p>
                ) : (
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
                )}
            </CardContent>
        </Card>
    );
}
