'use client';

import type { Hotel } from '@repo/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Globe, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface HotelCardProps {
    hotel: Hotel;
    roomCount?: number;
    activityCount?: number;
    onEdit?: (hotel: Hotel) => void;
    onDelete?: (hotel: Hotel) => void;
}

export function HotelCard({ hotel, roomCount = 0, activityCount = 0, onEdit, onDelete }: HotelCardProps) {
    const address = hotel.address;
    const locationString = address
        ? [address.city, address.state, address.country].filter(Boolean).join(', ')
        : 'No address';

    return (
        <Card className="group hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        {hotel.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {locationString}
                    </CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/hotels/${hotel.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(hotel)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Hotel
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete?.(hotel)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Hotel
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Globe className="h-3.5 w-3.5" />
                    <span>{hotel.timezone}</span>
                </div>
                <div className="flex gap-2">
                    <Badge variant="secondary">
                        {roomCount} Room Type{roomCount !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline">
                        {activityCount} Activit{activityCount !== 1 ? 'ies' : 'y'}
                    </Badge>
                </div>
                <div className="mt-4 pt-4 border-t">
                    <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href={`/hotels/${hotel.id}`}>
                            Manage Hotel
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
