import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ReservationStatus } from '@repo/shared';

export interface ReservationsFiltersState {
    page: number;
    pageSize: number;
    search: string;
    status: ReservationStatus | '';
    hotelId: string;
    checkInFrom: string;
    checkInTo: string;
    sort: string;
}

const initialState: ReservationsFiltersState = {
    page: 1,
    pageSize: 10,
    search: '',
    status: '',
    hotelId: '',
    checkInFrom: '',
    checkInTo: '',
    sort: '-createdAt',
};

/**
 * Redux slice for Reservations UI filters
 * UI state only - no server data
 */
const reservationsFiltersSlice = createSlice({
    name: 'ui/reservationsFilters',
    initialState,
    reducers: {
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
        setPageSize: (state, action: PayloadAction<number>) => {
            state.pageSize = action.payload;
            state.page = 1;
        },
        setSearch: (state, action: PayloadAction<string>) => {
            state.search = action.payload;
            state.page = 1;
        },
        setStatus: (state, action: PayloadAction<ReservationsFiltersState['status']>) => {
            state.status = action.payload;
            state.page = 1;
        },
        setHotelId: (state, action: PayloadAction<string>) => {
            state.hotelId = action.payload;
            state.page = 1;
        },
        setCheckInFrom: (state, action: PayloadAction<string>) => {
            state.checkInFrom = action.payload;
            state.page = 1;
        },
        setCheckInTo: (state, action: PayloadAction<string>) => {
            state.checkInTo = action.payload;
            state.page = 1;
        },
        setDateRange: (state, action: PayloadAction<{ from: string; to: string }>) => {
            state.checkInFrom = action.payload.from;
            state.checkInTo = action.payload.to;
            state.page = 1;
        },
        setSort: (state, action: PayloadAction<string>) => {
            state.sort = action.payload;
        },
        resetFilters: () => {
            return initialState;
        },
    },
});

export const {
    setPage,
    setPageSize,
    setSearch,
    setStatus,
    setHotelId,
    setCheckInFrom,
    setCheckInTo,
    setDateRange,
    setSort,
    resetFilters,
} = reservationsFiltersSlice.actions;

export default reservationsFiltersSlice.reducer;
