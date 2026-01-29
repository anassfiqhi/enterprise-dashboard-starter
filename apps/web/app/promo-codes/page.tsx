'use client';

import { useState } from 'react';
import type { PromoCode } from '@repo/shared';
import { usePromoCodes, usePromoCodeMutations } from '@/hooks/usePromoCodes';
import { PromoCodeCard } from '@/components/promo-codes/PromoCodeCard';
import { PromoCodeFormDialog } from '@/components/promo-codes/PromoCodeFormDialog';
import { DeleteConfirmDialog } from '@/components/hotels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Tag } from 'lucide-react';

type PromoCodeStatus = 'ACTIVE' | 'EXPIRED' | 'EXHAUSTED' | 'INACTIVE';

export default function PromoCodesPage() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<PromoCodeStatus | 'all'>('all');

    const { data: promoCodes, isLoading } = usePromoCodes({
        search: debouncedSearch || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
    });
    const { deletePromoCode } = usePromoCodeMutations();

    const [formOpen, setFormOpen] = useState(false);
    const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [promoCodeToDelete, setPromoCodeToDelete] = useState<PromoCode | null>(null);

    // Simple debounce for search
    const handleSearchChange = (value: string) => {
        setSearch(value);
        const timeoutId = setTimeout(() => setDebouncedSearch(value), 300);
        return () => clearTimeout(timeoutId);
    };

    const handleEdit = (promoCode: PromoCode) => {
        setEditingPromoCode(promoCode);
        setFormOpen(true);
    };

    const handleDelete = (promoCode: PromoCode) => {
        setPromoCodeToDelete(promoCode);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (promoCodeToDelete) {
            await deletePromoCode.mutateAsync(promoCodeToDelete.id);
            setDeleteDialogOpen(false);
            setPromoCodeToDelete(null);
        }
    };

    const handleFormClose = (open: boolean) => {
        setFormOpen(open);
        if (!open) {
            setEditingPromoCode(null);
        }
    };

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Page Header */}
                    <div className="flex items-center justify-between px-4 lg:px-6">
                        <div>
                            <h1 className="text-2xl font-bold">Promo Codes</h1>
                            <p className="text-sm text-muted-foreground">
                                Create and manage discount codes for your customers
                            </p>
                        </div>
                        <Button onClick={() => setFormOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Code
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="px-4 lg:px-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search codes..."
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => setStatusFilter(value as PromoCodeStatus | 'all')}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="EXPIRED">Expired</SelectItem>
                                    <SelectItem value="EXHAUSTED">Exhausted</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Promo Codes Grid */}
                    <div className="px-4 lg:px-6">
                        {isLoading ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="h-[140px]" />
                                ))}
                            </div>
                        ) : !promoCodes || promoCodes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">No promo codes found</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {search || statusFilter !== 'all'
                                        ? 'Try adjusting your filters'
                                        : 'Create your first promo code to get started'}
                                </p>
                                {!search && statusFilter === 'all' && (
                                    <Button onClick={() => setFormOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Code
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {promoCodes.map((promoCode) => (
                                    <PromoCodeCard
                                        key={promoCode.id}
                                        promoCode={promoCode}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Promo Code Form Dialog */}
            <PromoCodeFormDialog
                open={formOpen}
                onOpenChange={handleFormClose}
                promoCode={editingPromoCode}
            />

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Promo Code"
                description={`Are you sure you want to delete "${promoCodeToDelete?.code}"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                isPending={deletePromoCode.isPending}
            />
        </div>
    );
}
