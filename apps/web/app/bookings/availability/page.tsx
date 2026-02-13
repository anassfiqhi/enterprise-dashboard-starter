'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { setHotelId, setViewType, navigateMonth } from '@/lib/features/ui/availabilityFiltersSlice';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AvailabilityCalendar } from '@/components/bookings/AvailabilityCalendar';
import { AvailabilityLegend } from '@/components/bookings/AvailabilityLegend';
import { ChevronLeft, ChevronRight, Bed, Calendar as CalendarIcon, Building2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AvailabilityPage() {
    const dispatch = useDispatch();
    const { viewType, startDate, endDate } = useSelector(
        (state: RootState) => state.availabilityFilters
    );
    const activeHotel = useSelector((state: RootState) => state.session.activeHotel);

    // Sync hotelId from session to availability filters
    useEffect(() => {
        if (activeHotel?.id) {
            dispatch(setHotelId(activeHotel.id));
        }
    }, [activeHotel?.id, dispatch]);

    const formatMonthRange = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const startMonth = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const endMonth = end.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (startMonth === endMonth) return startMonth;
        return `${start.toLocaleDateString('en-US', { month: 'short' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    };

    if (!activeHotel) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
                <Building2 className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-lg font-semibold">No hotel selected</h2>
                <p className="text-muted-foreground text-center">
                    Please select a hotel from the organization switcher to view availability.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="flex items-center justify-between px-4 lg:px-6">
                        <div>
                            <h1 className="text-2xl font-bold">Availability</h1>
                            <p className="text-sm text-muted-foreground">
                                View room and activity availability for {activeHotel.name}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap gap-4 items-center px-4 lg:px-6">
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
