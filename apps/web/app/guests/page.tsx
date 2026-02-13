'use client';

import { useState } from 'react';
import type { Guest } from '@repo/shared';
import { useGuests, type GuestWithStats } from '@/hooks/useGuests';
import { useGuestMutations } from '@/hooks/useGuestMutations';
import { GuestCard, GuestFormDialog } from '@/components/guests';
import { DeleteConfirmDialog } from '@/components/hotels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GuestsPage() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 12;

    const { data, isLoading } = useGuests({ search: debouncedSearch, page, pageSize });
    const { deleteGuest } = useGuestMutations();

    const [formOpen, setFormOpen] = useState(false);
    const [editingGuest, setEditingGuest] = useState<GuestWithStats | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [guestToDelete, setGuestToDelete] = useState<GuestWithStats | null>(null);

    // Simple debounce for search
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1); // Reset to first page on search
        const timeoutId = setTimeout(() => setDebouncedSearch(value), 300);
        return () => clearTimeout(timeoutId);
    };

    const handleEdit = (guest: GuestWithStats) => {
        setEditingGuest(guest);
        setFormOpen(true);
    };

    const handleDelete = (guest: GuestWithStats) => {
        setGuestToDelete(guest);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (guestToDelete) {
            await deleteGuest.mutateAsync(guestToDelete.id);
            setDeleteDialogOpen(false);
            setGuestToDelete(null);
        }
    };

    const handleFormClose = (open: boolean) => {
        setFormOpen(open);
        if (!open) {
            setEditingGuest(null);
        }
    };

    const totalPages = data?.meta?.totalPages || 1;
    const total = data?.meta?.total || 0;

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Page Header */}
                    <div className="flex items-center justify-between px-4 lg:px-6">
                        <div>
                            <h1 className="text-2xl font-bold">Guests</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage guest profiles and view reservation history
                            </p>
                        </div>
                        <Button onClick={() => setFormOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Guest
                        </Button>
                    </div>

                    {/* Search and Stats */}
                    <div className="flex items-center justify-between gap-4 px-4 lg:px-6">
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search guests by name, email, or phone..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        {!isLoading && data && (
                            <div className="text-sm text-muted-foreground">
                                {total} guest{total !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>

                    {/* Guests Grid */}
                    <div className="px-4 lg:px-6">
                        {isLoading ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <Skeleton key={i} className="h-[220px]" />
                                ))}
                            </div>
                        ) : !data?.data || data.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">No guests found</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {search
                                        ? 'Try adjusting your search'
                                        : 'Get started by adding your first guest'}
                                </p>
                                {!search && (
                                    <Button onClick={() => setFormOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Guest
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {data.data.map((guest) => (
                                        <GuestCard
                                            key={guest.id}
                                            guest={guest}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-6">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                        <span className="text-sm text-muted-foreground px-4">
                                            Page {page} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Guest Form Dialog */}
            <GuestFormDialog
                open={formOpen}
                onOpenChange={handleFormClose}
                guest={editingGuest}
            />

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Guest"
                description={`Are you sure you want to delete "${guestToDelete?.firstName} ${guestToDelete?.lastName}"? Guests with existing reservations cannot be deleted.`}
                onConfirm={confirmDelete}
                isPending={deleteGuest.isPending}
            />
        </div>
    );
}
