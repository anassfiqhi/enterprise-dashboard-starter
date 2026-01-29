'use client';

import type { PhysicalRoomStatus } from '@repo/shared';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Wrench, XCircle } from 'lucide-react';

interface PhysicalRoomStatusBadgeProps {
    status: PhysicalRoomStatus;
}

const statusConfig: Record<PhysicalRoomStatus, {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: typeof CheckCircle2;
}> = {
    AVAILABLE: {
        label: 'Available',
        variant: 'default',
        icon: CheckCircle2,
    },
    MAINTENANCE: {
        label: 'Maintenance',
        variant: 'secondary',
        icon: Wrench,
    },
    OUT_OF_SERVICE: {
        label: 'Out of Service',
        variant: 'destructive',
        icon: XCircle,
    },
};

export function PhysicalRoomStatusBadge({ status }: PhysicalRoomStatusBadgeProps) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge variant={config.variant} className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
}
