import { combineReducers, configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import { filtersReducer } from './reducers/filters';
import { preferencesReducer } from './reducers/preferences';
import { authReducer } from './reducers/auth';
import { organizationReducer } from './reducers/organization';
import metricsReducer from './reducers/metrics/metricsSlice';
import roleReducer from './reducers/role/roleSlice';
import availabilityDataReducer from './reducers/availabilityData/availabilityDataSlice';
import inventoryReducer from './reducers/inventory/inventorySlice';
import guestsReducer from './reducers/guests/guestsSlice';
import promoCodesReducer from './reducers/promoCodes/promoCodesSlice';
import pricingRulesReducer from './reducers/pricingRules/pricingRulesSlice';
import physicalRoomsReducer from './reducers/physicalRooms/physicalRoomsSlice';
import reservationsDataReducer from './reducers/reservations/reservationsDataSlice';
import hotelsReducer from './reducers/hotels/hotelsSlice';
import membersReducer from './reducers/members/membersSlice';
import invitationsReducer from './reducers/invitations/invitationsSlice';
import adminReducer from './reducers/admin/adminSlice';
import rootSaga from './sagas/rootSaga';

export const RESET_ALL_SERVER_STATE = 'store/resetAllServerState';

const sagaMiddleware = createSagaMiddleware();

const appReducer = combineReducers({
    auth: authReducer,
    organization: organizationReducer,
    filters: filtersReducer,
    preferences: preferencesReducer,
    metrics: metricsReducer,
    role: roleReducer,
    availabilityData: availabilityDataReducer,
    inventory: inventoryReducer,
    guests: guestsReducer,
    promoCodes: promoCodesReducer,
    pricingRules: pricingRulesReducer,
    physicalRooms: physicalRoomsReducer,
    reservationsData: reservationsDataReducer,
    hotels: hotelsReducer,
    members: membersReducer,
    invitations: invitationsReducer,
    admin: adminReducer,
});

// Server-state slice keys that get reset on RESET_ALL_SERVER_STATE
const SERVER_STATE_KEYS: (keyof ReturnType<typeof appReducer>)[] = [
    'metrics', 'role', 'availabilityData', 'inventory',
    'guests', 'promoCodes', 'pricingRules', 'physicalRooms',
    'reservationsData', 'hotels', 'members', 'invitations', 'admin',
];

const rootReducer: typeof appReducer = (state, action) => {
    if (action.type === RESET_ALL_SERVER_STATE && state) {
        // Reset only server-state slices; preserve UI state (auth, organization, filters, preferences)
        const resetState = { ...state };
        for (const key of SERVER_STATE_KEYS) {
            (resetState as Record<string, undefined>)[key] = undefined;
        }
        return appReducer(resetState as Parameters<typeof appReducer>[0], action);
    }
    return appReducer(state, action);
};

/**
 * Redux store configured with domain-based organization
 * - filters: UI filters grouped by feature (orders, reservations, availability)
 * - preferences: User preferences (table, etc.)
 */
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
