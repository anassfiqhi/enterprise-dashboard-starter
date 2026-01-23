import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TablePreferencesState {
    density: 'compact' | 'normal' | 'comfortable';
    visibleColumns: string[];
}

const initialState: TablePreferencesState = {
    density: 'normal',
    visibleColumns: ['id', 'customer', 'status', 'amount'],
};

/**
 * Redux slice for Table UI preferences (SPEC Section 8.2)
 * Stores density, visible columns, etc.
 */
const tablePreferencesSlice = createSlice({
    name: 'ui/tablePreferences',
    initialState,
    reducers: {
        setDensity: (state, action: PayloadAction<TablePreferencesState['density']>) => {
            state.density = action.payload;
        },
        setVisibleColumns: (state, action: PayloadAction<string[]>) => {
            state.visibleColumns = action.payload;
        },
        toggleColumn: (state, action: PayloadAction<string>) => {
            const column = action.payload;
            if (state.visibleColumns.includes(column)) {
                state.visibleColumns = state.visibleColumns.filter((c) => c !== column);
            } else {
                state.visibleColumns.push(column);
            }
        },
    },
});

export const { setDensity, setVisibleColumns, toggleColumn } = tablePreferencesSlice.actions;

export default tablePreferencesSlice.reducer;
