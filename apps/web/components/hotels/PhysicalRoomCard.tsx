'use client';

import type { PhysicalRoom } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { DoorOpen, MoreVertical, Pencil, Trash2, Building2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PhysicalRoomStatusBadge } from './PhysicalRoomStatusBadge';

interface PhysicalRoomCardProps {
    room: PhysicalRoom;
    onEdit?: (room: PhysicalRoom) => void;
    onDelete?: (room: PhysicalRoom) => void;
}

export function PhysicalRoomCard({ room, onEdit, onDelete }: PhysicalRoomCardProps) {
    return (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <DoorOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Room {room.code}</span>
                        <PhysicalRoomStatusBadge status={room.status} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {room.floor !== undefined && (
                            <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                Floor {room.floor}
                            </span>
                        )}
                        {room.notes && (
                            <span className="text-xs">• {room.notes}</span>
                        )}
                    </div>
                </div>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(room)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => onDelete?.(room)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
