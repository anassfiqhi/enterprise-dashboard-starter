'use client';

import type { PricingRule } from '@repo/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    DollarSign,
    MoreVertical,
    Pencil,
    Trash2,
    Calendar,
    Moon,
    Briefcase,
    Clock,
    Percent,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PricingRuleCardProps {
    rule: PricingRule;
    onEdit?: (rule: PricingRule) => void;
    onDelete?: (rule: PricingRule) => void;
    onToggleActive?: (rule: PricingRule, isActive: boolean) => void;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

const daysOfWeekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDaysOfWeek(days: number[]): string {
    if (days.length === 2 && days.includes(5) && days.includes(6)) {
        return 'Weekends';
    }
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) {
        return 'Weekdays';
    }
    return days.map((d) => daysOfWeekNames[d]).join(', ');
}

export function PricingRuleCard({ rule, onEdit, onDelete, onToggleActive }: PricingRuleCardProps) {
    const isDiscount = rule.amount < 0;
    const amountDisplay = rule.amountType === 'OVERRIDE'
        ? `$${Math.abs(rule.amount)}`
        : rule.amountType === 'DELTA_PERCENT'
        ? `${isDiscount ? '' : '+'}${rule.amount}%`
        : `${isDiscount ? '-' : '+'}$${Math.abs(rule.amount)}`;

    const amountTypeLabels: Record<string, string> = {
        OVERRIDE: 'Fixed price',
        DELTA_FIXED: 'Price adjustment',
        DELTA_PERCENT: 'Percentage',
    };

    return (
        <Card className={`group transition-shadow ${!rule.isActive ? 'opacity-60' : 'hover:shadow-sm'}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            {isDiscount ? (
                                <ArrowDown className="h-4 w-4 text-green-600" />
                            ) : (
                                <ArrowUp className="h-4 w-4 text-orange-600" />
                            )}
                            {rule.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={rule.isActive}
                                onCheckedChange={(checked: boolean) => onToggleActive?.(rule, checked)}
                                aria-label="Toggle active"
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit?.(rule)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onDelete?.(rule)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                            variant={isDiscount ? 'default' : 'secondary'}
                            className="flex items-center gap-1"
                        >
                            {rule.amountType === 'DELTA_PERCENT' ? (
                                <Percent className="h-3 w-3" />
                            ) : (
                                <DollarSign className="h-3 w-3" />
                            )}
                            {amountDisplay}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            Priority: {rule.priority}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">
                        {amountTypeLabels[rule.amountType]}
                    </span>

                    {rule.validFrom && rule.validTo && (
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(rule.validFrom)} - {formatDate(rule.validTo)}
                        </span>
                    )}

                    {rule.daysOfWeek && rule.daysOfWeek.length > 0 && (
                        <span className="flex items-center gap-1">
                            <Moon className="h-3 w-3" />
                            {formatDaysOfWeek(rule.daysOfWeek)}
                        </span>
                    )}

                    {rule.channel && (
                        <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {rule.channel}
                        </span>
                    )}

                    {(rule.minNights || rule.maxNights) && (
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {rule.minNights && rule.maxNights
                                ? `${rule.minNights}-${rule.maxNights} nights`
                                : rule.minNights
                                ? `${rule.minNights}+ nights`
                                : `Up to ${rule.maxNights} nights`}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
