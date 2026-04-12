import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RoomAvailability, ActivitySlotAvailability } from '@repo/shared';
import { availabilityDataActions } from '@/lib/reducers/availabilityData/availabilityDataSlice';
import { apiRequestWithMeta } from '@/lib/api/apiClient';

export const FETCH_AVAILABILITY = 'availabilityData/saga/fetch';

type AvailabilityData = RoomAvailability[] | ActivitySlotAvailability[];

interface FetchAvailabilityPayload {
  hotelId: string;
  viewType: string;
  startDate: string;
  endDate: string;
}

export function* fetchAvailabilityWorker(action: PayloadAction<FetchAvailabilityPayload>) {
  try {
    yield put(availabilityDataActions.fetchRequest());
    const { hotelId, viewType, startDate, endDate } = action.payload;
    const result: { data: AvailabilityData; meta: Record<string, unknown> } = yield call(
      apiRequestWithMeta<AvailabilityData>,
      '/api/v1/availability',
      { params: { hotelId, viewType, startDate, endDate } }
    );
    yield put(
      availabilityDataActions.fetchSuccess({
        items: result.data || [],
        meta: result.meta,
      })
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch availability';
    yield put(availabilityDataActions.fetchFailure(message));
  }
}

export function* availabilitySaga() {
  yield takeLatest(FETCH_AVAILABILITY, fetchAvailabilityWorker);
}
