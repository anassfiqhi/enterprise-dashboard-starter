"use client";

import { useState, useCallback } from "react";
import { useSession } from "@/hooks/useSession";
import {
    useAdminUsers,
    useToggleSuperAdmin,
    useUserMemberships,
    useAddUserToOrg,
    useUpdateMemberRole,
    useRemoveUserFromOrg,
} from "@/hooks/useAdminUsers";
import { useAdminOrganizations } from "@/hooks/useAdminOrganizations";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/ui/role-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ChevronDown,
    ChevronRight,
    Search,
    Plus,
    Trash2,
    Users,
    Building2,
    Shield,
} from "lucide-react";

// ─── Debounce helper ─────────────────────────────────────────────

function useDebounce(callback: (value: string) => void, delay: number) {
    const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    return useCallback(
        (value: string) => {
            if (timer) clearTimeout(timer);
            setTimer(setTimeout(() => callback(value), delay));
        },
        [callback, delay, timer]
    );
}

// ─── User Memberships Row ────────────────────────────────────────

function UserMemberships({ userId }: { userId: string }) {
    const { data: memberships, isLoading } = useUserMemberships(userId);
    const updateRole = useUpdateMemberRole();
    const removeFromOrg = useRemoveUserFromOrg();
    const [pendingRemove, setPendingRemove] = useState<string | null>(null);

    const handleRemove = (membershipId: string) => {
        if (pendingRemove === membershipId) {
            removeFromOrg.mutate({ userId, membershipId });
            setPendingRemove(null);
        } else {
            setPendingRemove(membershipId);
            setTimeout(() => setPendingRemove(null), 3000);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-2 py-2">
                {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                ))}
            </div>
        );
    }

    if (!memberships || memberships.length === 0) {
        return (
            <p className="text-sm text-muted-foreground py-2">
                No organization memberships
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {memberships.map((m) => (
                    <TableRow key={m.id}>
                        <TableCell className="font-medium">
                            {m.organizationName}
                        </TableCell>
                        <TableCell>
                            <Select
                                value={m.role}
                                onValueChange={(role) =>
                                    updateRole.mutate({
                                        userId,
                                        membershipId: m.id,
                                        role: role as "admin" | "staff",
                                    })
                                }
                                disabled={updateRole.isPending}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </TableCell>
                        <TableCell>
                            <Button
                                variant={
                                    pendingRemove === m.id ? "destructive" : "ghost"
                                }
                                size="sm"
                                onClick={() => handleRemove(m.id)}
                                disabled={removeFromOrg.isPending}
                            >
                                {pendingRemove === m.id ? (
                                    "Confirm?"
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

// ─── Add to Organization Dialog ──────────────────────────────────

function AddToOrgDialog({
    userId,
    open,
    onOpenChange,
}: {
    userId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { data: orgs, isLoading } = useAdminOrganizations();
    const addToOrg = useAddUserToOrg();
    const [orgId, setOrgId] = useState("");
    const [role, setRole] = useState<"admin" | "staff">("staff");

    const handleSubmit = () => {
        if (!orgId) return;
        addToOrg.mutate(
            { userId, organizationId: orgId, role },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    setOrgId("");
                    setRole("staff");
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add to Organization</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Organization</label>
                        <Select value={orgId} onValueChange={setOrgId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select organization..." />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoading ? (
                                    <SelectItem value="_loading" disabled>
                                        Loading...
                                    </SelectItem>
                                ) : (
                                    orgs?.map((org) => (
                                        <SelectItem key={org.id} value={org.id}>
                                            {org.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <Select value={role} onValueChange={(v) => setRole(v as "admin" | "staff")}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!orgId || addToOrg.isPending}
                    >
                        {addToOrg.isPending ? "Adding..." : "Add Member"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Expanded User Row ───────────────────────────────────────────

function ExpandedUserRow({
    user,
    isCurrentUser,
}: {
    user: { id: string; isAdmin?: boolean };
    isCurrentUser: boolean;
}) {
    const toggleSuperAdmin = useToggleSuperAdmin();
    const [addOrgOpen, setAddOrgOpen] = useState(false);

    return (
        <div className="space-y-4 p-4">
            {/* Super Admin Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Super Admin Access</span>
                </div>
                <Switch
                    checked={user.isAdmin ?? false}
                    onCheckedChange={(checked) =>
                        toggleSuperAdmin.mutate({
                            userId: user.id,
                            isAdmin: checked,
                        })
                    }
                    disabled={isCurrentUser || toggleSuperAdmin.isPending}
                />
            </div>

            {/* Org Memberships */}
            <div className="rounded-lg border p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Organization Memberships</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setAddOrgOpen(true)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add to Org
                    </Button>
                </div>
                <UserMemberships userId={user.id} />
            </div>

            <AddToOrgDialog
                userId={user.id}
                open={addOrgOpen}
                onOpenChange={setAddOrgOpen}
            />
        </div>
    );
}

// ─── Loading Skeleton ────────────────────────────────────────────

function UsersLoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-24" />
                </div>
            ))}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────

export default function SystemUsersPage() {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(0);
    const limit = 20;

    const debouncedSetSearch = useDebounce((value: string) => {
        setDebouncedSearch(value);
        setPage(0);
    }, 500);

    const { data, isLoading, error } = useAdminUsers({
        search: debouncedSearch || undefined,
        limit,
        offset: page * limit,
    });

    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    const users = data?.users || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        debouncedSetSearch(value);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            All Users
                        </CardTitle>
                        <CardDescription>
                            Manage all users, their roles, and organization memberships
                        </CardDescription>
                    </div>
                    {!isLoading && (
                        <Badge variant="secondary">
                            {total} user{total !== 1 ? "s" : ""}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by email..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Table */}
                {isLoading ? (
                    <UsersLoadingSkeleton />
                ) : error ? (
                    <p className="text-center text-destructive py-8">
                        Failed to load users: {error.message}
                    </p>
                ) : users.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No users found
                    </p>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40px]" />
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user: any) => {
                                    const isExpanded = expandedUser === user.id;
                                    const isCurrentUser = user.id === currentUserId;

                                    return (
                                        <>
                                            <TableRow
                                                key={user.id}
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    setExpandedUser(
                                                        isExpanded ? null : user.id
                                                    )
                                                }
                                            >
                                                <TableCell>
                                                    {isExpanded ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {user.name || "Unnamed"}
                                                    {isCurrentUser && (
                                                        <span className="ml-2 text-xs text-muted-foreground">
                                                            (you)
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    {user.isAdmin && (
                                                        <RoleBadge role="Admin" />
                                                    )}
                                                    {user.banned && (
                                                        <Badge variant="destructive" className="ml-1">
                                                            Banned
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                            {isExpanded && (
                                                <TableRow key={`${user.id}-expanded`}>
                                                    <TableCell colSpan={5} className="bg-muted/30">
                                                        <ExpandedUserRow
                                                            user={user}
                                                            isCurrentUser={isCurrentUser}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of{" "}
                            {total}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
