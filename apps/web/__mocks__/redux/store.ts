import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { authReducer } from '@/lib/reducers/auth';
import { filtersReducer } from '@/lib/reducers/filters';
import { preferencesReducer } from '@/lib/reducers/preferences';
import { organizationReducer } from '@/lib/reducers/organization';
import metricsReducer from '@/lib/reducers/metrics/metricsSlice';
import roleReducer from '@/lib/reducers/role/roleSlice';
import availabilityDataReducer from '@/lib/reducers/availabilityData/availabilityDataSlice';
import inventoryReducer from '@/lib/reducers/inventory/inventorySlice';
import guestsReducer from '@/lib/reducers/guests/guestsSlice';
import promoCodesReducer from '@/lib/reducers/promoCodes/promoCodesSlice';
import pricingRulesReducer from '@/lib/reducers/pricingRules/pricingRulesSlice';
import physicalRoomsReducer from '@/lib/reducers/physicalRooms/physicalRoomsSlice';
import reservationsDataReducer from '@/lib/reducers/reservations/reservationsDataSlice';
import hotelsReducer from '@/lib/reducers/hotels/hotelsSlice';
import membersReducer from '@/lib/reducers/members/membersSlice';
import invitationsReducer from '@/lib/reducers/invitations/invitationsSlice';
import adminReducer from '@/lib/reducers/admin/adminSlice';
import type { RootState } from '@/lib/store';

type DeepPartial<T> =
  T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends object
      ? { [P in keyof T]?: DeepPartial<T[P]> }
      : T;

const rootReducer = combineReducers({
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

export function createTestStore(preloadedState?: DeepPartial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as unknown as Partial<RootState>,
  });
}

export type TestStore = ReturnType<typeof createTestStore>;
