import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AvailabilityFiltersState {
    hotelId: string;
    viewType: 'rooms' | 'activities';
    startDate: string;
    endDate: string;
}

const today = new Date();
const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

const initialState: AvailabilityFiltersState = {
    hotelId: '',
    viewType: 'rooms',
    startDate: today.toISOString().split('T')[0],
    endDate: thirtyDaysLater.toISOString().split('T')[0],
};

/**
 * Redux slice for Availability calendar UI filters
 * UI state only - no server data
 */
const availabilityFiltersSlice = createSlice({
    name: 'ui/availabilityFilters',
    initialState,
    reducers: {
        setHotelId: (state, action: PayloadAction<string>) => {
            state.hotelId = action.payload;
        },
        setViewType: (state, action: PayloadAction<'rooms' | 'activities'>) => {
            state.viewType = action.payload;
        },
        setStartDate: (state, action: PayloadAction<string>) => {
            state.startDate = action.payload;
        },
        setEndDate: (state, action: PayloadAction<string>) => {
            state.endDate = action.payload;
        },
        setDateRange: (state, action: PayloadAction<{ start: string; end: string }>) => {
            state.startDate = action.payload.start;
            state.endDate = action.payload.end;
        },
        navigateMonth: (state, action: PayloadAction<'prev' | 'next'>) => {
            const currentStart = new Date(state.startDate);
            const currentEnd = new Date(state.endDate);
            const monthDiff = action.payload === 'next' ? 1 : -1;

            currentStart.setMonth(currentStart.getMonth() + monthDiff);
            currentEnd.setMonth(currentEnd.getMonth() + monthDiff);

            state.startDate = currentStart.toISOString().split('T')[0];
            state.endDate = currentEnd.toISOString().split('T')[0];
        },
        resetFilters: () => {
            return initialState;
        },
    },
});

export const {
    setHotelId,
    setViewType,
    setStartDate,
    setEndDate,
    setDateRange,
    navigateMonth,
    resetFilters,
} = availabilityFiltersSlice.actions;

export default availabilityFiltersSlice.reducer;
