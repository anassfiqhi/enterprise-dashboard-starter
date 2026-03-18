import { configureStore } from '@reduxjs/toolkit';

import { filtersReducer } from './reducers/filters';
import { preferencesReducer } from './reducers/preferences';
import { authReducer } from './reducers/auth';
import { organizationReducer } from './reducers/organization';

/**
 * Redux store configured with domain-based organization
 * - filters: UI filters grouped by feature (orders, reservations, availability)
 * - preferences: User preferences (table, etc.)
 */
export const store = configureStore({
    reducer: {
        auth: authReducer,
        organization: organizationReducer,
        filters: filtersReducer,
        preferences: preferencesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
