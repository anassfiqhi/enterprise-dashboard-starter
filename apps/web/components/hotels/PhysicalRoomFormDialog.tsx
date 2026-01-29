'use client';

import { useState, useEffect } from 'react';
import type { PhysicalRoom, PhysicalRoomStatus } from '@repo/shared';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePhysicalRoomMutations, type CreatePhysicalRoomInput } from '@/hooks/usePhysicalRooms';

interface PhysicalRoomFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    hotelId: string;
    roomTypeId: string;
    room?: PhysicalRoom | null;
}

const statusOptions: { value: PhysicalRoomStatus; label: string }[] = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
];

export function PhysicalRoomFormDialog({
    open,
    onOpenChange,
    hotelId,
    roomTypeId,
    room,
}: PhysicalRoomFormDialogProps) {
    const { createPhysicalRoom, updatePhysicalRoom } = usePhysicalRoomMutations();
    const isEditing = !!room;

    const [formData, setFormData] = useState<Omit<CreatePhysicalRoomInput, 'hotelId' | 'roomTypeId'>>({
        code: '',
        floor: undefined,
        status: 'AVAILABLE',
        notes: '',
    });

    useEffect(() => {
        if (room) {
            setFormData({
                code: room.code,
                floor: room.floor,
                status: room.status,
                notes: room.notes || '',
            });
        } else {
            setFormData({
                code: '',
                floor: undefined,
                status: 'AVAILABLE',
                notes: '',
            });
        }
    }, [room, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const input = {
            ...formData,
            hotelId,
            roomTypeId,
            floor: formData.floor ? Number(formData.floor) : undefined,
            notes: formData.notes || undefined,
        };

        if (isEditing && room) {
            await updatePhysicalRoom.mutateAsync({ id: room.id, ...input });
        } else {
            await createPhysicalRoom.mutateAsync(input);
        }

        onOpenChange(false);
    };

    const isPending = createPhysicalRoom.isPending || updatePhysicalRoom.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Room' : 'Add Room'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Update the physical room details.'
                                : 'Add a new physical room to this room type.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Room Code / Number *</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="101"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="floor">Floor</Label>
                                <Input
                                    id="floor"
                                    type="number"
                                    min={-5}
                                    max={200}
                                    value={formData.floor ?? ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            floor: e.target.value ? parseInt(e.target.value) : undefined,
                                        })
                                    }
                                    placeholder="1"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: PhysicalRoomStatus) =>
                                        setFormData({ ...formData, status: value })
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                }
                                placeholder="Recently renovated, corner room..."
                                rows={2}
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
                            {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Room'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
