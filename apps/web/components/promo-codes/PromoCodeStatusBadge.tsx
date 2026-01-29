'use client';

import type { PromoCode } from '@repo/shared';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface PromoCodeStatusBadgeProps {
    promoCode: PromoCode;
}

type ComputedStatus = 'ACTIVE' | 'EXPIRED' | 'EXHAUSTED' | 'INACTIVE';

function getComputedStatus(promoCode: PromoCode): ComputedStatus {
    if (!promoCode.isActive) {
        return 'INACTIVE';
    }

    const today = new Date().toISOString().split('T')[0];

    if (promoCode.validTo && promoCode.validTo < today) {
        return 'EXPIRED';
    }

    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
        return 'EXHAUSTED';
    }

    return 'ACTIVE';
}

const statusConfig: Record<ComputedStatus, {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: typeof CheckCircle2;
}> = {
    ACTIVE: {
        label: 'Active',
        variant: 'default',
        icon: CheckCircle2,
    },
    EXPIRED: {
        label: 'Expired',
        variant: 'secondary',
        icon: Clock,
    },
    EXHAUSTED: {
        label: 'Exhausted',
        variant: 'outline',
        icon: AlertTriangle,
    },
    INACTIVE: {
        label: 'Inactive',
        variant: 'destructive',
        icon: XCircle,
    },
};

export function PromoCodeStatusBadge({ promoCode }: PromoCodeStatusBadgeProps) {
    const status = getComputedStatus(promoCode);
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge variant={config.variant} className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
}
