'use client';

import { useState, useEffect } from 'react';
import type { Guest } from '@repo/shared';
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
import { useGuestMutations, type CreateGuestInput, type IdType } from '@/hooks/useGuestMutations';

interface GuestFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guest?: Guest | null;
}

const ID_TYPES: { value: IdType; label: string }[] = [
    { value: 'passport', label: 'Passport' },
    { value: 'drivers_license', label: "Driver's License" },
    { value: 'national_id', label: 'National ID' },
];

export function GuestFormDialog({ open, onOpenChange, guest }: GuestFormDialogProps) {
    const { createGuest, updateGuest } = useGuestMutations();
    const isEditing = !!guest;

    const [formData, setFormData] = useState<CreateGuestInput>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationality: '',
        idType: undefined,
        idNumber: '',
        notes: '',
    });

    useEffect(() => {
        if (guest) {
            setFormData({
                firstName: guest.firstName,
                lastName: guest.lastName,
                email: guest.email || '',
                phone: guest.phone || '',
                nationality: guest.nationality || '',
                idType: (guest.idType as IdType) || undefined,
                idNumber: guest.idNumber || '',
                notes: guest.notes || '',
            });
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                nationality: '',
                idType: undefined,
                idNumber: '',
                notes: '',
            });
        }
    }, [guest, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data: CreateGuestInput = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            nationality: formData.nationality || undefined,
            idType: formData.idType || undefined,
            idNumber: formData.idNumber || undefined,
            notes: formData.notes || undefined,
        };

        if (isEditing && guest) {
            await updateGuest.mutateAsync({ id: guest.id, ...data });
        } else {
            await createGuest.mutateAsync(data);
        }

        onOpenChange(false);
    };

    const isPending = createGuest.isPending || updateGuest.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Guest' : 'Add New Guest'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Update the guest information below.'
                                : 'Enter the details for the new guest.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Name Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, firstName: e.target.value })
                                    }
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, lastName: e.target.value })
                                    }
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        {/* Contact Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    placeholder="john.doe@example.com"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    placeholder="+1-555-1234"
                                />
                            </div>
                        </div>

                        {/* Nationality */}
                        <div className="grid gap-2">
                            <Label htmlFor="nationality">Nationality</Label>
                            <Input
                                id="nationality"
                                value={formData.nationality}
                                onChange={(e) =>
                                    setFormData({ ...formData, nationality: e.target.value })
                                }
                                placeholder="e.g. United States, France, Japan"
                            />
                        </div>

                        {/* ID Document Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="idType">ID Type</Label>
                                <Select
                                    value={formData.idType || ''}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            idType: value as IdType || undefined,
                                        })
                                    }
                                >
                                    <SelectTrigger id="idType">
                                        <SelectValue placeholder="Select ID type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ID_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="idNumber">ID Number</Label>
                                <Input
                                    id="idNumber"
                                    value={formData.idNumber}
                                    onChange={(e) =>
                                        setFormData({ ...formData, idNumber: e.target.value })
                                    }
                                    placeholder="ID or passport number"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                }
                                placeholder="Any special requests or notes about this guest..."
                                rows={3}
                                maxLength={1000}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {formData.notes?.length || 0}/1000
                            </p>
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
                            {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Guest'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
