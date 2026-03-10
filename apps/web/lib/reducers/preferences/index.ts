import { combineReducers } from '@reduxjs/toolkit';
import tableReducer from './tableSlice';

/**
 * Combined preferences reducer
 * Groups all preference slices under state.preferences.*
 */
export const preferencesReducer = combineReducers({
    table: tableReducer,
});
