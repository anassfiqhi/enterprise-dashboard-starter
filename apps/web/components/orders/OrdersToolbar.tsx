'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { RootState } from '@/lib/store';
import { setSearch, setStatus, setSort, resetFilters } from '@/lib/features/ui/ordersFiltersSlice';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

/**
 * Orders Toolbar Component (SPEC Section 9.2)
 * Shadcn controls for search, status filter, and sort
 * Dispatches to Redux ordersFilters slice with debounced search
 */
export function OrdersToolbar() {
    const dispatch = useDispatch();
    const { search, status, sort } = useSelector((state: RootState) => state.ordersFilters);

    // Local state for immediate UI updates
    const [searchInput, setSearchInput] = useState(search);

    // Debounce search input (500ms delay)
    const debouncedSearch = useDebounce(searchInput, 500);

    // Update Redux when debounced value changes
    useEffect(() => {
        dispatch(setSearch(debouncedSearch));
    }, [debouncedSearch, dispatch]);

    // Sync local state when Redux value changes externally (e.g., reset)
    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    return (
        <div className="flex flex-wrap gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search orders or customers..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Status Filter */}
            <Select
                value={status || 'all'}
                onValueChange={(value) =>
                    dispatch(setStatus(value === 'all' ? '' : value as typeof status))
                }
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
            </Select>

            {/* Sort Select */}
            <Select value={sort || 'default'} onValueChange={(value) => dispatch(setSort(value === 'default' ? '' : value))}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="id">ID (Ascending)</SelectItem>
                    <SelectItem value="-id">ID (Descending)</SelectItem>
                    <SelectItem value="customer">Customer (A-Z)</SelectItem>
                    <SelectItem value="-customer">Customer (Z-A)</SelectItem>
                    <SelectItem value="amount">Amount (Low-High)</SelectItem>
                    <SelectItem value="-amount">Amount (High-Low)</SelectItem>
                    <SelectItem value="createdAt">Date (Oldest)</SelectItem>
                    <SelectItem value="-createdAt">Date (Newest)</SelectItem>
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
