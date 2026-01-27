import { configureStore } from '@reduxjs/toolkit';

import ordersFiltersReducer from './features/ui/ordersFiltersSlice';
import tablePreferencesReducer from './features/ui/tablePreferencesSlice';
import sessionReducer from './features/ui/sessionSlice';
import reservationsFiltersReducer from './features/ui/reservationsFiltersSlice';
import availabilityFiltersReducer from './features/ui/availabilityFiltersSlice';

/**
 * Redux store configured per SPEC Section 8
 * UI state only - no server data (TanStack Query owns that)
 */
export const store = configureStore({
    reducer: {
        ordersFilters: ordersFiltersReducer,
        tablePreferences: tablePreferencesReducer,
        session: sessionReducer,
        reservationsFilters: reservationsFiltersReducer,
        availabilityFilters: availabilityFiltersReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
