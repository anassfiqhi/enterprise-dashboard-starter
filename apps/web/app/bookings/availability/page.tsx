'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { setHotelId, setViewType, navigateMonth } from '@/lib/features/ui/availabilityFiltersSlice';
import { useHotels } from '@/hooks/useHotels';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AvailabilityCalendar } from '@/components/bookings/AvailabilityCalendar';
import { AvailabilityLegend } from '@/components/bookings/AvailabilityLegend';
import { ChevronLeft, ChevronRight, Building2, Bed, Calendar as CalendarIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AvailabilityPage() {
    const dispatch = useDispatch();
    const { hotelId, viewType, startDate, endDate } = useSelector(
        (state: RootState) => state.availabilityFilters
    );
    const { data: hotels, isLoading: hotelsLoading } = useHotels();

    const formatMonthRange = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const startMonth = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const endMonth = end.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (startMonth === endMonth) return startMonth;
        return `${start.toLocaleDateString('en-US', { month: 'short' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    };

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="flex items-center justify-between px-4 lg:px-6">
                        <div>
                            <h1 className="text-2xl font-bold">Availability</h1>
                            <p className="text-sm text-muted-foreground">
                                View room and activity availability by date
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap gap-4 items-center px-4 lg:px-6">
                        {/* Hotel Selector */}
                        <Select
                            value={hotelId || 'select'}
                            onValueChange={(value) => dispatch(setHotelId(value === 'select' ? '' : value))}
                        >
                            <SelectTrigger className="w-[280px]">
                                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                <SelectValue placeholder="Select a hotel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="select" disabled>
                                    Select a hotel
                                </SelectItem>
                                {hotels?.map((hotel) => (
                                    <SelectItem key={hotel.id} value={hotel.id}>
                                        {hotel.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* View Type Toggle */}
                        <ToggleGroup
                            type="single"
                            value={viewType}
                            onValueChange={(value) => value && dispatch(setViewType(value as 'rooms' | 'activities'))}
                        >
                            <ToggleGroupItem value="rooms" aria-label="Room availability">
                                <Bed className="h-4 w-4 mr-2" />
                                Rooms
                            </ToggleGroupItem>
                            <ToggleGroupItem value="activities" aria-label="Activity availability">
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                Activities
                            </ToggleGroupItem>
                        </ToggleGroup>

                        {/* Month Navigation */}
                        <div className="flex items-center gap-2 ml-auto">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => dispatch(navigateMonth('prev'))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium min-w-[160px] text-center">
                                {formatMonthRange()}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => dispatch(navigateMonth('next'))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="px-4 lg:px-6">
                        <AvailabilityLegend />
                    </div>

                    {/* Calendar Grid */}
                    <div className="px-4 lg:px-6">
                        <div className="border rounded-lg p-4">
                            <AvailabilityCalendar />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
