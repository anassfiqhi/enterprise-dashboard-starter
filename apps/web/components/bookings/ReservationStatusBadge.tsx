'use client';

import type { ReservationStatus } from '@repo/shared';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface ReservationStatusBadgeProps {
    status: ReservationStatus;
}

function getStatusIcon(status: ReservationStatus) {
    switch (status) {
        case 'CONFIRMED':
            return <CheckCircle2 className="text-green-500 dark:text-green-400" />;
        case 'CANCELLED':
            return <XCircle className="text-red-500 dark:text-red-400" />;
        case 'PENDING':
        default:
            return <Clock className="text-yellow-500 dark:text-yellow-400" />;
    }
}

function getStatusBadgeClass(status: ReservationStatus) {
    switch (status) {
        case 'CONFIRMED':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'CANCELLED':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'PENDING':
        default:
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
}

export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={`flex w-fit gap-1 px-1.5 [&_svg]:size-3 ${getStatusBadgeClass(status)}`}
        >
            {getStatusIcon(status)}
            <span className="capitalize">{status.toLowerCase()}</span>
        </Badge>
    );
}
