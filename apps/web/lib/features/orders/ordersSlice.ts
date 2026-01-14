import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrdersState {
    page: number;
    pageSize: number;
    filters: {
        status: string[];
        search: string;
    };
}

const initialState: OrdersState = {
    page: 1,
    pageSize: 50,
    filters: {
        status: [],
        search: '',
    },
};

export const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
        setFilters: (state, action: PayloadAction<Partial<OrdersState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
            state.page = 1; // Reset to page 1 on filter change
        },
    },
});

export const { setPage, setFilters } = ordersSlice.actions;
export default ordersSlice.reducer;
