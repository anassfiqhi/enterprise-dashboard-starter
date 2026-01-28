'use client';

import { useState, useEffect } from 'react';
import type { RoomType } from '@repo/shared';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useHotelMutations, type CreateRoomTypeInput } from '@/hooks/useHotelMutations';

interface RoomTypeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    hotelId: string;
    roomType?: RoomType | null;
}

export function RoomTypeFormDialog({
    open,
    onOpenChange,
    hotelId,
    roomType,
}: RoomTypeFormDialogProps) {
    const { createRoomType, updateRoomType } = useHotelMutations();
    const isEditing = !!roomType;

    const [formData, setFormData] = useState<Omit<CreateRoomTypeInput, 'hotelId'>>({
        name: '',
        capacity: 2,
        description: '',
        basePrice: 100,
        currency: 'USD',
    });

    useEffect(() => {
        if (roomType) {
            setFormData({
                name: roomType.name,
                capacity: roomType.capacity,
                description: roomType.description || '',
                basePrice: roomType.basePrice,
                currency: roomType.currency,
            });
        } else {
            setFormData({
                name: '',
                capacity: 2,
                description: '',
                basePrice: 100,
                currency: 'USD',
            });
        }
    }, [roomType, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && roomType) {
            await updateRoomType.mutateAsync({ id: roomType.id, hotelId, ...formData });
        } else {
            await createRoomType.mutateAsync({ hotelId, ...formData });
        }

        onOpenChange(false);
    };

    const isPending = createRoomType.isPending || updateRoomType.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Room Type' : 'Add Room Type'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Update the room type details.'
                                : 'Create a new room type for this hotel.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Room Type Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Deluxe Ocean View"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Spacious room with stunning ocean views..."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="capacity">Max Guests *</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={formData.capacity}
                                    onChange={(e) =>
                                        setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="basePrice">Base Price (per night) *</Label>
                                <Input
                                    id="basePrice"
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={formData.basePrice}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            basePrice: parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Room Type'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
