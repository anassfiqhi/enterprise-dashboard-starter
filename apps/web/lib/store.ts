import { configureStore } from '@reduxjs/toolkit';

import { filtersReducer } from './reducers/filters';
import { preferencesReducer } from './reducers/preferences';

/**
 * Redux store configured with domain-based organization
 * - filters: UI filters grouped by feature (orders, reservations, availability)
 * - preferences: User preferences (table, etc.)
 */
export const store = configureStore({
    reducer: {
        filters: filtersReducer,
        preferences: preferencesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
