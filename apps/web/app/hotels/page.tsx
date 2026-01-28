'use client';

import { useState } from 'react';
import type { Hotel } from '@repo/shared';
import { useHotels } from '@/hooks/useHotels';
import { useHotelMutations } from '@/hooks/useHotelMutations';
import { HotelCard, HotelFormDialog, DeleteConfirmDialog } from '@/components/hotels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Building2 } from 'lucide-react';

export default function HotelsPage() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const { data: hotels, isLoading } = useHotels(debouncedSearch);
    const { deleteHotel } = useHotelMutations();

    const [formOpen, setFormOpen] = useState(false);
    const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [hotelToDelete, setHotelToDelete] = useState<Hotel | null>(null);

    // Simple debounce for search
    const handleSearchChange = (value: string) => {
        setSearch(value);
        const timeoutId = setTimeout(() => setDebouncedSearch(value), 300);
        return () => clearTimeout(timeoutId);
    };

    const handleEdit = (hotel: Hotel) => {
        setEditingHotel(hotel);
        setFormOpen(true);
    };

    const handleDelete = (hotel: Hotel) => {
        setHotelToDelete(hotel);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (hotelToDelete) {
            await deleteHotel.mutateAsync(hotelToDelete.id);
            setDeleteDialogOpen(false);
            setHotelToDelete(null);
        }
    };

    const handleFormClose = (open: boolean) => {
        setFormOpen(open);
        if (!open) {
            setEditingHotel(null);
        }
    };

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Page Header */}
                    <div className="flex items-center justify-between px-4 lg:px-6">
                        <div>
                            <h1 className="text-2xl font-bold">Hotels</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage your properties, room types, and activities
                            </p>
                        </div>
                        <Button onClick={() => setFormOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Hotel
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="px-4 lg:px-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search hotels..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Hotels Grid */}
                    <div className="px-4 lg:px-6">
                        {isLoading ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="h-[200px]" />
                                ))}
                            </div>
                        ) : !hotels || hotels.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">No hotels found</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {search
                                        ? 'Try adjusting your search'
                                        : 'Get started by adding your first hotel'}
                                </p>
                                {!search && (
                                    <Button onClick={() => setFormOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Hotel
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {hotels.map((hotel) => (
                                    <HotelCard
                                        key={hotel.id}
                                        hotel={hotel}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hotel Form Dialog */}
            <HotelFormDialog
                open={formOpen}
                onOpenChange={handleFormClose}
                hotel={editingHotel}
            />

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Hotel"
                description={`Are you sure you want to delete "${hotelToDelete?.name}"? This will also delete all associated room types and activities. This action cannot be undone.`}
                onConfirm={confirmDelete}
                isPending={deleteHotel.isPending}
            />
        </div>
    );
}
