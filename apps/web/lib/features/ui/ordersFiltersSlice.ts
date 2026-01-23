import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OrdersFiltersState {
    page: number;
    pageSize: number;
    search: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | '';
    sort: string;
}

const initialState: OrdersFiltersState = {
    page: 1,
    pageSize: 10,
    search: '',
    status: '',
    sort: '',
};

/**
 * Redux slice for Orders UI filters (SPEC Section 8.2)
 * UI state only - no server data
 */
const ordersFiltersSlice = createSlice({
    name: 'ui/ordersFilters',
    initialState,
    reducers: {
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
        setPageSize: (state, action: PayloadAction<number>) => {
            state.pageSize = action.payload;
            state.page = 1; // Reset to first page
        },
        setSearch: (state, action: PayloadAction<string>) => {
            state.search = action.payload;
            state.page = 1; // Reset to first page
        },
        setStatus: (state, action: PayloadAction<OrdersFiltersState['status']>) => {
            state.status = action.payload;
            state.page = 1; // Reset to first page
        },
        setSort: (state, action: PayloadAction<string>) => {
            state.sort = action.payload;
        },
        resetFilters: (state) => {
            return initialState;
        },
    },
});

export const { setPage, setPageSize, setSearch, setStatus, setSort, resetFilters } =
    ordersFiltersSlice.actions;

export default ordersFiltersSlice.reducer;
