import { configureStore } from '@reduxjs/toolkit';

import ordersFiltersReducer from './features/ui/ordersFiltersSlice';
import tablePreferencesReducer from './features/ui/tablePreferencesSlice';
import sessionReducer from './features/ui/sessionSlice';

/**
 * Redux store configured per SPEC Section 8
 * UI state only - no server data (TanStack Query owns that)
 */
export const store = configureStore({
    reducer: {
        ordersFilters: ordersFiltersReducer,
        tablePreferences: tablePreferencesReducer,
        session: sessionReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
