'use client';

import { useState, useEffect } from 'react';
import type { PricingRule, PriceAmountType, PricingChannel } from '@repo/shared';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePricingRuleMutations, type CreatePricingRuleInput } from '@/hooks/usePricingRules';

interface PricingRuleFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    hotelId: string;
    rule?: PricingRule | null;
}

interface FormData {
    name: string;
    amountType: PriceAmountType;
    amount: number;
    currency: string;
    validFrom: string;
    validTo: string;
    minNights: number | undefined;
    maxNights: number | undefined;
    daysOfWeek: number[];
    channel: PricingChannel | '';
    priority: number;
    isActive: boolean;
}

const daysOfWeekOptions = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
];

export function PricingRuleFormDialog({
    open,
    onOpenChange,
    hotelId,
    rule,
}: PricingRuleFormDialogProps) {
    const { createPricingRule, updatePricingRule } = usePricingRuleMutations();
    const isEditing = !!rule;

    const [formData, setFormData] = useState<FormData>({
        name: '',
        amountType: 'DELTA_PERCENT',
        amount: 10,
        currency: 'USD',
        validFrom: '',
        validTo: '',
        minNights: undefined,
        maxNights: undefined,
        daysOfWeek: [],
        channel: '',
        priority: 10,
        isActive: true,
    });

    useEffect(() => {
        if (rule) {
            setFormData({
                name: rule.name,
                amountType: rule.amountType,
                amount: rule.amount,
                currency: rule.currency,
                validFrom: rule.validFrom || '',
                validTo: rule.validTo || '',
                minNights: rule.minNights,
                maxNights: rule.maxNights,
                daysOfWeek: rule.daysOfWeek || [],
                channel: rule.channel || '',
                priority: rule.priority,
                isActive: rule.isActive,
            });
        } else {
            setFormData({
                name: '',
                amountType: 'DELTA_PERCENT',
                amount: 10,
                currency: 'USD',
                validFrom: '',
                validTo: '',
                minNights: undefined,
                maxNights: undefined,
                daysOfWeek: [],
                channel: '',
                priority: 10,
                isActive: true,
            });
        }
    }, [rule, open]);

    const handleDayToggle = (day: number) => {
        setFormData((prev) => ({
            ...prev,
            daysOfWeek: prev.daysOfWeek.includes(day)
                ? prev.daysOfWeek.filter((d) => d !== day)
                : [...prev.daysOfWeek, day].sort(),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const input: CreatePricingRuleInput = {
            hotelId,
            name: formData.name,
            amountType: formData.amountType,
            amount: formData.amount,
            currency: formData.currency,
            validFrom: formData.validFrom || undefined,
            validTo: formData.validTo || undefined,
            minNights: formData.minNights,
            maxNights: formData.maxNights,
            daysOfWeek: formData.daysOfWeek.length > 0 ? formData.daysOfWeek : undefined,
            channel: formData.channel || undefined,
            priority: formData.priority,
            isActive: formData.isActive,
        };

        if (isEditing && rule) {
            await updatePricingRule.mutateAsync({ id: rule.id, ...input });
        } else {
            await createPricingRule.mutateAsync(input);
        }

        onOpenChange(false);
    };

    const isPending = createPricingRule.isPending || updatePricingRule.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Pricing Rule' : 'Create Pricing Rule'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Update the pricing rule details.'
                                : 'Create a new pricing rule for dynamic pricing.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Rule Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Weekend Surcharge"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amountType">Amount Type *</Label>
                                <Select
                                    value={formData.amountType}
                                    onValueChange={(value: PriceAmountType) =>
                                        setFormData({ ...formData, amountType: value })
                                    }
                                >
                                    <SelectTrigger id="amountType">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DELTA_PERCENT">Percentage (+/-)</SelectItem>
                                        <SelectItem value="DELTA_FIXED">Fixed Amount (+/-)</SelectItem>
                                        <SelectItem value="OVERRIDE">Override Price</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="amount">
                                    {formData.amountType === 'DELTA_PERCENT'
                                        ? 'Percentage'
                                        : formData.amountType === 'OVERRIDE'
                                        ? 'Price'
                                        : 'Amount'}{' '}
                                    *
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step={formData.amountType === 'DELTA_PERCENT' ? 1 : 0.01}
                                    value={formData.amount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                                    }
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    {formData.amountType === 'DELTA_PERCENT'
                                        ? 'Use negative for discounts (e.g., -10 for 10% off)'
                                        : formData.amountType === 'DELTA_FIXED'
                                        ? 'Use negative for discounts (e.g., -20 for $20 off)'
                                        : 'Fixed price override'}
                                </p>
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

                        <div className="grid gap-2">
                            <Label>Days of Week</Label>
                            <div className="flex flex-wrap gap-2">
                                {daysOfWeekOptions.map((day) => (
                                    <div key={day.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`day-${day.value}`}
                                            checked={formData.daysOfWeek.includes(day.value)}
                                            onCheckedChange={() => handleDayToggle(day.value)}
                                        />
                                        <Label
                                            htmlFor={`day-${day.value}`}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {day.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Leave empty to apply to all days
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="minNights">Min. Nights</Label>
                                <Input
                                    id="minNights"
                                    type="number"
                                    min={1}
                                    value={formData.minNights ?? ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            minNights: e.target.value ? parseInt(e.target.value) : undefined,
                                        })
                                    }
                                    placeholder="Any"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="maxNights">Max. Nights</Label>
                                <Input
                                    id="maxNights"
                                    type="number"
                                    min={1}
                                    value={formData.maxNights ?? ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            maxNights: e.target.value ? parseInt(e.target.value) : undefined,
                                        })
                                    }
                                    placeholder="Any"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="channel">Channel</Label>
                                <Select
                                    value={formData.channel}
                                    onValueChange={(value: PricingChannel | '') =>
                                        setFormData({ ...formData, channel: value })
                                    }
                                >
                                    <SelectTrigger id="channel">
                                        <SelectValue placeholder="All channels" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All channels</SelectItem>
                                        <SelectItem value="DIRECT">Direct</SelectItem>
                                        <SelectItem value="OTA">OTA</SelectItem>
                                        <SelectItem value="CORPORATE">Corporate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority *</Label>
                                <Input
                                    id="priority"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={formData.priority}
                                    onChange={(e) =>
                                        setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                                    }
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Higher priority rules are applied later
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="isActive">Active</Label>
                                <p className="text-xs text-muted-foreground">
                                    Inactive rules are not applied to pricing
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
                            {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Rule'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
