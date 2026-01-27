'use client';

import { useMemo } from 'react';
import type { RoomAvailability, ActivitySlotAvailability } from '@repo/shared';
import { useAvailability } from '@/hooks/useAvailability';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

function getAvailabilityColor(available: number, total: number, closed: boolean): string {
    if (closed) return 'bg-gray-400 dark:bg-gray-600';
    const ratio = available / total;
    if (ratio === 0) return 'bg-red-500 dark:bg-red-600';
    if (ratio < 0.5) return 'bg-yellow-500 dark:bg-yellow-600';
    return 'bg-green-500 dark:bg-green-600';
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

function isRoomAvailability(item: RoomAvailability | ActivitySlotAvailability): item is RoomAvailability {
    return 'roomTypeId' in item;
}

export function AvailabilityCalendar() {
    const { viewType } = useSelector((state: RootState) => state.availabilityFilters);
    const { data, isLoading, isError, error } = useAvailability();

    const { dates, itemNames, itemIds, availabilityMap } = useMemo(() => {
        if (!data?.data || data.data.length === 0) {
            return { dates: [], itemNames: [], itemIds: [], availabilityMap: new Map() };
        }

        const items = data.data;
        const datesSet = new Set<string>();
        const itemsMap = new Map<string, string>();
        const availMap = new Map<string, RoomAvailability | ActivitySlotAvailability>();

        items.forEach((item) => {
            datesSet.add(item.date);
            if (isRoomAvailability(item)) {
                itemsMap.set(item.roomTypeId, item.roomTypeName);
                availMap.set(`${item.date}-${item.roomTypeId}`, item);
            } else {
                itemsMap.set(item.activityTypeId, item.activityTypeName);
                availMap.set(`${item.date}-${item.activityTypeId}`, item);
            }
        });

        const sortedDates = Array.from(datesSet).sort();
        const ids = Array.from(itemsMap.keys());
        const names = ids.map((id) => itemsMap.get(id) || id);

        return {
            dates: sortedDates,
            itemNames: names,
            itemIds: ids,
            availabilityMap: availMap,
        };
    }, [data]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                Error loading availability: {error?.message || 'Unknown error'}
            </div>
        );
    }

    if (dates.length === 0) {
        return (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
                Select a hotel to view availability
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                    {/* Header row with dates */}
                    <div
                        className="grid gap-1 mb-1"
                        style={{
                            gridTemplateColumns: `150px repeat(${dates.length}, minmax(40px, 1fr))`,
                        }}
                    >
                        <div className="text-sm font-medium text-muted-foreground p-2">
                            {viewType === 'rooms' ? 'Room Type' : 'Activity'}
                        </div>
                        {dates.map((date) => (
                            <div
                                key={date}
                                className="text-xs text-center text-muted-foreground p-1"
                            >
                                <div>{new Date(date).getDate()}</div>
                                <div className="text-[10px]">
                                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Data rows */}
                    {itemIds.map((itemId, rowIndex) => (
                        <div
                            key={itemId}
                            className="grid gap-1 mb-1"
                            style={{
                                gridTemplateColumns: `150px repeat(${dates.length}, minmax(40px, 1fr))`,
                            }}
                        >
                            <div className="text-sm font-medium p-2 truncate" title={itemNames[rowIndex]}>
                                {itemNames[rowIndex]}
                            </div>
                            {dates.map((date) => {
                                const key = `${date}-${itemId}`;
                                const availability = availabilityMap.get(key);

                                if (!availability) {
                                    return (
                                        <div
                                            key={key}
                                            className="h-8 rounded bg-gray-200 dark:bg-gray-800"
                                        />
                                    );
                                }

                                const isRoom = isRoomAvailability(availability);
                                const available = isRoom
                                    ? availability.availableRooms
                                    : availability.availableCapacity;
                                const total = isRoom
                                    ? availability.totalRooms
                                    : availability.totalCapacity;
                                const booked = isRoom
                                    ? availability.bookedRooms
                                    : availability.bookedCount;
                                const closed = availability.closed;

                                return (
                                    <Tooltip key={key}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={cn(
                                                    'h-8 rounded cursor-pointer transition-opacity hover:opacity-80 flex items-center justify-center text-xs font-medium text-white',
                                                    getAvailabilityColor(available, total, closed)
                                                )}
                                            >
                                                {closed ? 'X' : available}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="text-sm">
                                                <p className="font-medium">{itemNames[rowIndex]}</p>
                                                <p className="text-muted-foreground">{formatDate(date)}</p>
                                                {closed ? (
                                                    <p className="text-red-500">Closed</p>
                                                ) : (
                                                    <>
                                                        <p>Available: {available} / {total}</p>
                                                        <p>Booked: {booked}</p>
                                                    </>
                                                )}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </TooltipProvider>
    );
}
