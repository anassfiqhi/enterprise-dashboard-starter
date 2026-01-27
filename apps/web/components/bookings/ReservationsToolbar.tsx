'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { RootState } from '@/lib/store';
import {
    setSearch,
    setStatus,
    setHotelId,
    setDateRange,
    setSort,
    resetFilters,
} from '@/lib/features/ui/reservationsFiltersSlice';
import { useDebounce } from '@/hooks/useDebounce';
import { useHotels } from '@/hooks/useHotels';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, X, CalendarIcon } from 'lucide-react';

export function ReservationsToolbar() {
    const dispatch = useDispatch();
    const { search, status, hotelId, checkInFrom, checkInTo, sort } = useSelector(
        (state: RootState) => state.reservationsFilters
    );
    const { data: hotels } = useHotels();

    const [searchInput, setSearchInput] = useState(search);
    const debouncedSearch = useDebounce(searchInput, 500);

    useEffect(() => {
        dispatch(setSearch(debouncedSearch));
    }, [debouncedSearch, dispatch]);

    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    return (
        <div className="flex flex-wrap gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search reservations, guests..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Hotel Filter */}
            <Select
                value={hotelId || 'all'}
                onValueChange={(value) => dispatch(setHotelId(value === 'all' ? '' : value))}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Hotels" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Hotels</SelectItem>
                    {hotels?.map((hotel) => (
                        <SelectItem key={hotel.id} value={hotel.id}>
                            {hotel.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
                value={status || 'all'}
                onValueChange={(value) =>
                    dispatch(setStatus(value === 'all' ? '' : (value as typeof status)))
                }
            >
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
            </Select>

            {/* Sort Select */}
            <Select
                value={sort || '-createdAt'}
                onValueChange={(value) => dispatch(setSort(value))}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="-createdAt">Newest First</SelectItem>
                    <SelectItem value="createdAt">Oldest First</SelectItem>
                    <SelectItem value="checkInDate">Check-in (Earliest)</SelectItem>
                    <SelectItem value="-checkInDate">Check-in (Latest)</SelectItem>
                    <SelectItem value="-priceTotal">Price (High-Low)</SelectItem>
                    <SelectItem value="priceTotal">Price (Low-High)</SelectItem>
                </SelectContent>
            </Select>

            {/* Reset Filters Button */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => dispatch(resetFilters())}
                title="Reset filters"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
