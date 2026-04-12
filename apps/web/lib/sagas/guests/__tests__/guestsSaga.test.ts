import { call, put } from 'redux-saga/effects';
import {
  fetchGuestsWorker,
  createGuestWorker,
  FETCH_GUESTS,
  fetchGuestsList,
  createGuestApi,
} from '../guestsSaga';
import { guestsActions } from '@/lib/reducers/guests/guestsSlice';
import { mockGuests } from '@/__mocks__/fixtures/guests';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/api/apiClient', () => ({
  apiRequest: jest.fn(),
  apiRequestWithMeta: jest.fn(),
}));

describe('fetchGuestsWorker', () => {
  const action = { type: FETCH_GUESTS, payload: { hotelId: 'hotel_1', page: 1, pageSize: 20 } };

  it('happy path: put request → call fn → put success', () => {
    const gen = fetchGuestsWorker(action as Parameters<typeof fetchGuestsWorker>[0]);
    const mockResult = {
      data: mockGuests,
      meta: { requestId: 'r1', total: 3, page: 1, pageSize: 20, totalPages: 1 },
    };
    expect(gen.next().value).toEqual(put(guestsActions.fetchGuestsRequest()));
    expect(gen.next().value).toEqual(call(fetchGuestsList, 'hotel_1', undefined, 1, 20));
    expect(gen.next(mockResult).value).toEqual(
      put(guestsActions.fetchGuestsSuccess({ items: mockResult.data, meta: mockResult.meta }))
    );
    expect(gen.next().done).toBe(true);
  });

  it('error path: puts failure on throw', () => {
    const gen = fetchGuestsWorker(action as Parameters<typeof fetchGuestsWorker>[0]);
    gen.next();
    gen.next();
    expect(gen.throw(new Error('Forbidden')).value).toEqual(
      put(guestsActions.fetchGuestsFailure('Forbidden'))
    );
  });
});

describe('createGuestWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const input = { firstName: 'Alice', lastName: 'Smith' };
  const action = { type: 'create', payload: { hotelId: 'hotel_1', input, resolve, reject } };

  beforeEach(() => jest.clearAllMocks());

  it('happy path: puts success, dispatches cache invalidation, calls resolve', () => {
    const gen = createGuestWorker(action as Parameters<typeof createGuestWorker>[0]);
    const mockGuest = mockGuests[0];

    expect(gen.next().value).toEqual(put(guestsActions.createGuestRequest()));
    expect(gen.next().value).toEqual(call(createGuestApi, 'hotel_1', input));
    expect(gen.next(mockGuest).value).toEqual(put(guestsActions.createGuestSuccess()));
    expect(gen.next().value).toEqual(put({ type: FETCH_GUESTS, payload: { hotelId: 'hotel_1' } }));
    gen.next();
    expect(resolve).toHaveBeenCalledWith(mockGuest);
  });

  it('error path: puts failure, calls reject', () => {
    const gen = createGuestWorker(action as Parameters<typeof createGuestWorker>[0]);
    gen.next();
    gen.next();
    const err = new Error('Validation error');
    expect(gen.throw(err).value).toEqual(put(guestsActions.createGuestFailure('Validation error')));
    gen.next();
    expect(reject).toHaveBeenCalledWith(err);
  });
});
