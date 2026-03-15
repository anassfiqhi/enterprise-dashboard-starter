import { combineReducers } from '@reduxjs/toolkit';
import reservationsReducer from './reservationsSlice';
import availabilityReducer from './availabilitySlice';

/**
 * Combined filters reducer
 * Groups all filter slices under state.filters.*
 */
export const filtersReducer = combineReducers({
    reservations: reservationsReducer,
    availability: availabilityReducer
});
