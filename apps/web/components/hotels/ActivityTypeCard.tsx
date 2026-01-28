'use client';

import type { ActivityType } from '@repo/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, DollarSign, Clock, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActivityTypeCardProps {
    activityType: ActivityType;
    onEdit?: (activityType: ActivityType) => void;
    onDelete?: (activityType: ActivityType) => void;
}

function formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function ActivityTypeCard({ activityType, onEdit, onDelete }: ActivityTypeCardProps) {
    return (
        <Card className="group hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        {activityType.name}
                    </CardTitle>
                    {activityType.description && (
                        <CardDescription className="text-sm line-clamp-2">
                            {activityType.description}
                        </CardDescription>
                    )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(activityType)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete?.(activityType)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(activityType.duration)}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {activityType.capacityPerSlot} / slot
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(activityType.basePrice, activityType.currency)}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
