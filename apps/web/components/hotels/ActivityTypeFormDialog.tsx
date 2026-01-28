'use client';

import { useState, useEffect } from 'react';
import type { ActivityType } from '@repo/shared';
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
import { useHotelMutations, type CreateActivityTypeInput } from '@/hooks/useHotelMutations';

interface ActivityTypeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    hotelId: string;
    activityType?: ActivityType | null;
}

export function ActivityTypeFormDialog({
    open,
    onOpenChange,
    hotelId,
    activityType,
}: ActivityTypeFormDialogProps) {
    const { createActivityType, updateActivityType } = useHotelMutations();
    const isEditing = !!activityType;

    const [formData, setFormData] = useState<Omit<CreateActivityTypeInput, 'hotelId'>>({
        name: '',
        capacityPerSlot: 10,
        description: '',
        duration: 60,
        basePrice: 50,
        currency: 'USD',
    });

    useEffect(() => {
        if (activityType) {
            setFormData({
                name: activityType.name,
                capacityPerSlot: activityType.capacityPerSlot,
                description: activityType.description || '',
                duration: activityType.duration,
                basePrice: activityType.basePrice,
                currency: activityType.currency,
            });
        } else {
            setFormData({
                name: '',
                capacityPerSlot: 10,
                description: '',
                duration: 60,
                basePrice: 50,
                currency: 'USD',
            });
        }
    }, [activityType, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && activityType) {
            await updateActivityType.mutateAsync({ id: activityType.id, hotelId, ...formData });
        } else {
            await createActivityType.mutateAsync({ hotelId, ...formData });
        }

        onOpenChange(false);
    };

    const isPending = createActivityType.isPending || updateActivityType.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit Activity' : 'Add Activity'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Update the activity details.'
                                : 'Create a new activity for this hotel.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Activity Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Spa Treatment"
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
                                placeholder="Relaxing full-body massage..."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Duration (minutes) *</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min={15}
                                    step={15}
                                    value={formData.duration}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            duration: parseInt(e.target.value) || 60,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="capacity">Capacity per Slot *</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    min={1}
                                    value={formData.capacityPerSlot}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            capacityPerSlot: parseInt(e.target.value) || 1,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="basePrice">Price per Person *</Label>
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
                            {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Activity'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
