import { call, put } from 'redux-saga/effects';
import {
  fetchHotelsWorker,
  createHotelWorker,
  FETCH_HOTELS,
  fetchHotelsList,
  createHotelApi,
} from '../hotelsSaga';
import { hotelsActions } from '@/lib/reducers/hotels/hotelsSlice';
import { mockHotels } from '@/__mocks__/fixtures/hotels';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    organization: {
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getFullOrganization: jest.fn(),
    },
  },
}));

describe('fetchHotelsWorker', () => {
  it('happy path: put request → call fn → put success', () => {
    const gen = fetchHotelsWorker();
    expect(gen.next().value).toEqual(put(hotelsActions.fetchHotelsRequest()));
    expect(gen.next().value).toEqual(call(fetchHotelsList));
    expect(gen.next(mockHotels).value).toEqual(put(hotelsActions.fetchHotelsSuccess(mockHotels)));
    expect(gen.next().done).toBe(true);
  });

  it('error path: put request → call fn → throw → put failure', () => {
    const gen = fetchHotelsWorker();
    gen.next(); // put request
    gen.next(); // call fn
    const result = gen.throw(new Error('Network error'));
    expect(result.value).toEqual(put(hotelsActions.fetchHotelsFailure('Network error')));
    expect(gen.next().done).toBe(true);
  });
});

describe('createHotelWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const input = { name: 'Grand Hotel', timezone: 'UTC' };
  const action = {
    type: FETCH_HOTELS,
    payload: { input, resolve, reject },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('happy path: puts request, calls api, puts success, dispatches cache invalidation, calls resolve', () => {
    const gen = createHotelWorker(action as Parameters<typeof createHotelWorker>[0]);
    const mockHotel = mockHotels[0];

    expect(gen.next().value).toEqual(put(hotelsActions.createHotelRequest()));
    expect(gen.next().value).toEqual(call(createHotelApi, input));
    expect(gen.next(mockHotel).value).toEqual(put(hotelsActions.createHotelSuccess()));
    expect(gen.next().value).toEqual(put({ type: FETCH_HOTELS, payload: {} }));
    gen.next(); // resolve?.(hotel) + done
    expect(resolve).toHaveBeenCalledWith(mockHotel);
  });

  it('error path: puts request, calls api, throws, puts failure, calls reject', () => {
    const gen = createHotelWorker(action as Parameters<typeof createHotelWorker>[0]);
    gen.next(); // put request
    gen.next(); // call api
    const err = new Error('Already exists');
    const result = gen.throw(err);
    expect(result.value).toEqual(put(hotelsActions.createHotelFailure('Already exists')));
    gen.next(); // reject?.(err) + done
    expect(reject).toHaveBeenCalledWith(err);
  });
});
