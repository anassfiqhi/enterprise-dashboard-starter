'use client';

import type { RoomType } from '@repo/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Users, DollarSign, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RoomTypeCardProps {
    roomType: RoomType;
    onEdit?: (roomType: RoomType) => void;
    onDelete?: (roomType: RoomType) => void;
}

function formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

export function RoomTypeCard({ roomType, onEdit, onDelete }: RoomTypeCardProps) {
    return (
        <Card className="group hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                        {roomType.name}
                    </CardTitle>
                    {roomType.description && (
                        <CardDescription className="text-sm line-clamp-2">
                            {roomType.description}
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
                        <DropdownMenuItem onClick={() => onEdit?.(roomType)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete?.(roomType)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {roomType.capacity} guest{roomType.capacity !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(roomType.basePrice, roomType.currency)} / night
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
