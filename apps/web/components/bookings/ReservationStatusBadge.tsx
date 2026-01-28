'use client';

import type { ReservationStatus } from '@repo/shared';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, LoaderIcon } from 'lucide-react';

interface ReservationStatusBadgeProps {
    status: ReservationStatus;
}

function getStatusIcon(status: ReservationStatus) {
    switch (status) {
        case 'CONFIRMED':
            return <CheckCircle2 className="fill-green-800 dark:fill-green-400 stroke-accent" />;
        case 'CANCELLED':
            return <XCircle className="fill-red-800 dark:fill-red-400 stroke-accent" />;
        case 'PENDING':
        default:
            return <LoaderIcon className="fill-yellow-800 dark:fill-yellow-400" />;
    }
}

function getStatusBadgeClass(status: ReservationStatus) {
    switch (status) {
        case 'CONFIRMED':
            return 'fill-green-800 dark:fill-green-300';
        case 'CANCELLED':
            return 'fill-red-800 dark:fill-red-300';
        case 'PENDING':
        default:
            return 'fill-yellow-800 dark:fill-yellow-300';
    }
}

export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={`flex w-fit gap-1 px-1.5 [&_svg]:size-3 ${getStatusBadgeClass(status)} text-muted-foreground px-1.5`}
        >
            {getStatusIcon(status)}
            <span className="capitalize">{status.toLowerCase()}</span>
        </Badge>
    );
}
