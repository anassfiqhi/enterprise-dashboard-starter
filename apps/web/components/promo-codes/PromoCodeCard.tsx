'use client';

import type { PromoCode } from '@repo/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, MoreVertical, Pencil, Trash2, Percent, DollarSign, Calendar, Users } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PromoCodeStatusBadge } from './PromoCodeStatusBadge';

interface PromoCodeCardProps {
    promoCode: PromoCode;
    onEdit?: (promoCode: PromoCode) => void;
    onDelete?: (promoCode: PromoCode) => void;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function PromoCodeCard({ promoCode, onEdit, onDelete }: PromoCodeCardProps) {
    const discountDisplay = promoCode.discountType === 'PERCENTAGE'
        ? `${promoCode.discountValue}% off`
        : `$${promoCode.discountValue} off`;

    const usageDisplay = promoCode.maxUses
        ? `${promoCode.usedCount} / ${promoCode.maxUses} uses`
        : `${promoCode.usedCount} uses`;

    return (
        <Card className="group hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        {promoCode.code}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <PromoCodeStatusBadge promoCode={promoCode} />
                        <Badge variant="outline" className="flex items-center gap-1">
                            {promoCode.discountType === 'PERCENTAGE' ? (
                                <Percent className="h-3 w-3" />
                            ) : (
                                <DollarSign className="h-3 w-3" />
                            )}
                            {discountDisplay}
                        </Badge>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(promoCode)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete?.(promoCode)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {usageDisplay}
                    </span>
                    {promoCode.validFrom && promoCode.validTo && (
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(promoCode.validFrom)} - {formatDate(promoCode.validTo)}
                        </span>
                    )}
                    {promoCode.minBookingAmount && (
                        <span className="text-xs">
                            Min. ${promoCode.minBookingAmount}
                        </span>
                    )}
                    {promoCode.maxDiscountAmount && (
                        <span className="text-xs">
                            Max discount ${promoCode.maxDiscountAmount}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
