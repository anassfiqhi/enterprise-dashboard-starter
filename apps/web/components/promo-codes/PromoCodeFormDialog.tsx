'use client';

import { useState, useEffect } from 'react';
import type { PromoCode, DiscountType } from '@repo/shared';
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
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePromoCodeMutations, type CreatePromoCodeInput } from '@/hooks/usePromoCodes';

interface PromoCodeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    promoCode?: PromoCode | null;
}

interface FormData {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    currency: string;
    minBookingAmount: number | undefined;
    maxDiscountAmount: number | undefined;
    validFrom: string;
    validTo: string;
    maxUses: number | undefined;
    maxUsesPerGuest: number | undefined;
    isActive: boolean;
}

export function PromoCodeFormDialog({
    open,
    onOpenChange,
    promoCode,
}: PromoCodeFormDialogProps) {
    const { createPromoCode, updatePromoCode } = usePromoCodeMutations();
    const isEditing = !!promoCode;

    const [formData, setFormData] = useState<FormData>({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        currency: 'USD',
        minBookingAmount: undefined,
        maxDiscountAmount: undefined,
        validFrom: '',
        validTo: '',
        maxUses: undefined,
        maxUsesPerGuest: undefined,
        isActive: true,
    });

    useEffect(() => {
        if (promoCode) {
            setFormData({
                code: promoCode.code,
                discountType: promoCode.discountType,
                discountValue: promoCode.discountValue,
                currency: promoCode.currency || 'USD',
                minBookingAmount: promoCode.minBookingAmount,
                maxDiscountAmount: promoCode.maxDiscountAmount,
                validFrom: promoCode.validFrom || '',
                validTo: promoCode.validTo || '',
                maxUses: promoCode.maxUses,
                maxUsesPerGuest: promoCode.maxUsesPerGuest,
                isActive: promoCode.isActive,
            });
        } else {
            setFormData({
                code: '',
                discountType: 'PERCENTAGE',
                discountValue: 10,
                currency: 'USD',
                minBookingAmount: undefined,
                maxDiscountAmount: undefined,
                validFrom: '',
                validTo: '',
                maxUses: undefined,
                maxUsesPerGuest: undefined,
                isActive: true,
            });
        }
    }, [promoCode, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const input: CreatePromoCodeInput = {
            code: formData.code.toUpperCase().replace(/\s/g, ''),
            discountType: formData.discountType,
            discountValue: formData.discountValue,
            currency: formData.discountType === 'FIXED' ? formData.currency : undefined,
            minBookingAmount: formData.minBookingAmount,
            maxDiscountAmount: formData.discountType === 'PERCENTAGE' ? formData.maxDiscountAmount : undefined,
            validFrom: formData.validFrom || undefined,
            validTo: formData.validTo || undefined,
            maxUses: formData.maxUses,
            maxUsesPerGuest: formData.maxUsesPerGuest,
            isActive: formData.isActive,
        };

        if (isEditing && promoCode) {
            await updatePromoCode.mutateAsync({ id: promoCode.id, ...input });
        } else {
            await createPromoCode.mutateAsync(input);
        }

        onOpenChange(false);
    };

    const isPending = createPromoCode.isPending || updatePromoCode.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Promo Code' : 'Create Promo Code'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Update the promo code details.'
                                : 'Create a new discount code for your customers.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Code *</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="SUMMER25"
                                required
                                className="uppercase"
                            />
                            <p className="text-xs text-muted-foreground">
                                Uppercase letters and numbers only, no spaces
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="discountType">Discount Type *</Label>
                                <Select
                                    value={formData.discountType}
                                    onValueChange={(value: DiscountType) =>
                                        setFormData({ ...formData, discountType: value })
                                    }
                                >
                                    <SelectTrigger id="discountType">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                        <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="discountValue">
                                    {formData.discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount Amount'} *
                                </Label>
                                <Input
                                    id="discountValue"
                                    type="number"
                                    min={0}
                                    max={formData.discountType === 'PERCENTAGE' ? 100 : 10000}
                                    step={formData.discountType === 'PERCENTAGE' ? 1 : 0.01}
                                    value={formData.discountValue}
                                    onChange={(e) =>
                                        setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="validFrom">Valid From</Label>
                                <Input
                                    id="validFrom"
                                    type="date"
                                    value={formData.validFrom}
                                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="validTo">Valid Until</Label>
                                <Input
                                    id="validTo"
                                    type="date"
                                    value={formData.validTo}
                                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="maxUses">Max Total Uses</Label>
                                <Input
                                    id="maxUses"
                                    type="number"
                                    min={1}
                                    value={formData.maxUses ?? ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            maxUses: e.target.value ? parseInt(e.target.value) : undefined,
                                        })
                                    }
                                    placeholder="Unlimited"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="maxUsesPerGuest">Max Uses per Guest</Label>
                                <Input
                                    id="maxUsesPerGuest"
                                    type="number"
                                    min={1}
                                    value={formData.maxUsesPerGuest ?? ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            maxUsesPerGuest: e.target.value ? parseInt(e.target.value) : undefined,
                                        })
                                    }
                                    placeholder="Unlimited"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="minBookingAmount">Min. Booking Amount</Label>
                                <Input
                                    id="minBookingAmount"
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={formData.minBookingAmount ?? ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            minBookingAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                                        })
                                    }
                                    placeholder="No minimum"
                                />
                            </div>
                            {formData.discountType === 'PERCENTAGE' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="maxDiscountAmount">Max Discount Amount</Label>
                                    <Input
                                        id="maxDiscountAmount"
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={formData.maxDiscountAmount ?? ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                                            })
                                        }
                                        placeholder="No cap"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="isActive">Active</Label>
                                <p className="text-xs text-muted-foreground">
                                    Inactive codes cannot be redeemed
                                </p>
                            </div>
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
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
                            {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Code'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
