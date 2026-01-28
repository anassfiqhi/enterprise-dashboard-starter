'use client';

import { useState, useEffect } from 'react';
import type { Hotel } from '@repo/shared';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useHotelMutations, type CreateHotelInput } from '@/hooks/useHotelMutations';

interface HotelFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    hotel?: Hotel | null;
}

const TIMEZONES = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Singapore',
    'Asia/Dubai',
    'Australia/Sydney',
    'Pacific/Honolulu',
];

export function HotelFormDialog({ open, onOpenChange, hotel }: HotelFormDialogProps) {
    const { createHotel, updateHotel } = useHotelMutations();
    const isEditing = !!hotel;

    const [formData, setFormData] = useState<CreateHotelInput>({
        name: '',
        timezone: 'America/New_York',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
        },
    });

    useEffect(() => {
        if (hotel) {
            setFormData({
                name: hotel.name,
                timezone: hotel.timezone,
                address: hotel.address || {
                    street: '',
                    city: '',
                    state: '',
                    country: '',
                    postalCode: '',
                },
            });
        } else {
            setFormData({
                name: '',
                timezone: 'America/New_York',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    country: '',
                    postalCode: '',
                },
            });
        }
    }, [hotel, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && hotel) {
            await updateHotel.mutateAsync({ id: hotel.id, ...formData });
        } else {
            await createHotel.mutateAsync(formData);
        }

        onOpenChange(false);
    };

    const isPending = createHotel.isPending || updateHotel.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Hotel' : 'Add New Hotel'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Update the hotel information below.'
                                : 'Enter the details for the new hotel.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Hotel Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Grand Seaside Resort"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="timezone">Timezone *</Label>
                            <Select
                                value={formData.timezone}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, timezone: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIMEZONES.map((tz) => (
                                        <SelectItem key={tz} value={tz}>
                                            {tz}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="street">Street Address</Label>
                            <Input
                                id="street"
                                value={formData.address?.street || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        address: { ...formData.address!, street: e.target.value },
                                    })
                                }
                                placeholder="123 Beach Road"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    value={formData.address?.city || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address: { ...formData.address!, city: e.target.value },
                                        })
                                    }
                                    placeholder="Miami"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="state">State/Province</Label>
                                <Input
                                    id="state"
                                    value={formData.address?.state || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address: { ...formData.address!, state: e.target.value },
                                        })
                                    }
                                    placeholder="FL"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="country">Country *</Label>
                                <Input
                                    id="country"
                                    value={formData.address?.country || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address: { ...formData.address!, country: e.target.value },
                                        })
                                    }
                                    placeholder="USA"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="postalCode">Postal Code</Label>
                                <Input
                                    id="postalCode"
                                    value={formData.address?.postalCode || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address: {
                                                ...formData.address!,
                                                postalCode: e.target.value,
                                            },
                                        })
                                    }
                                    placeholder="33139"
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
                            {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Hotel'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
