import { call, put } from 'redux-saga/effects';
import { fetchAvailabilityWorker, FETCH_AVAILABILITY } from '../availabilitySaga';
import { availabilityDataActions } from '@/lib/reducers/availabilityData/availabilityDataSlice';
import { apiRequestWithMeta } from '@/lib/api/apiClient';
import { generateRoomAvailability } from '@/__mocks__/fixtures/inventory';

jest.mock('@/lib/api/apiClient', () => ({
  apiRequestWithMeta: jest.fn(),
}));

describe('fetchAvailabilityWorker', () => {
  const action = {
    type: FETCH_AVAILABILITY,
    payload: {
      hotelId: 'hotel_1',
      viewType: 'rooms',
      startDate: '2026-04-09',
      endDate: '2026-05-09',
    },
  };

  it('happy path', () => {
    const gen = fetchAvailabilityWorker(action as Parameters<typeof fetchAvailabilityWorker>[0]);
    const items = generateRoomAvailability('hotel_1', '2026-04-09');
    const mockResult = { data: items, meta: { total: items.length } };

    expect(gen.next().value).toEqual(put(availabilityDataActions.fetchRequest()));
    expect(gen.next().value).toEqual(
      call(apiRequestWithMeta, '/api/v1/availability', {
        params: {
          hotelId: 'hotel_1',
          viewType: 'rooms',
          startDate: '2026-04-09',
          endDate: '2026-05-09',
        },
      })
    );
    expect(gen.next(mockResult).value).toEqual(
      put(availabilityDataActions.fetchSuccess({ items, meta: mockResult.meta }))
    );
    expect(gen.next().done).toBe(true);
  });

  it('error path', () => {
    const gen = fetchAvailabilityWorker(action as Parameters<typeof fetchAvailabilityWorker>[0]);
    gen.next();
    gen.next();
    expect(gen.throw(new Error('Not found')).value).toEqual(
      put(availabilityDataActions.fetchFailure('Not found'))
    );
  });
});
