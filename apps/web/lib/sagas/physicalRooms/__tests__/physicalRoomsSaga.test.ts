import { call, put } from 'redux-saga/effects';
import {
  fetchPhysicalRoomsWorker,
  createPhysicalRoomWorker,
  updatePhysicalRoomWorker,
  deletePhysicalRoomWorker,
  FETCH_PHYSICAL_ROOMS,
  fetchPhysicalRoomsApi,
  createPhysicalRoomApi,
  updatePhysicalRoomApi,
  deletePhysicalRoomApi,
} from '../physicalRoomsSaga';
import { physicalRoomsActions } from '@/lib/reducers/physicalRooms/physicalRoomsSlice';
import { mockPhysicalRooms } from '@/__mocks__/fixtures/inventory';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/api/apiClient', () => ({ apiRequest: jest.fn() }));

describe('fetchPhysicalRoomsWorker', () => {
  const action = {
    type: FETCH_PHYSICAL_ROOMS,
    payload: { hotelId: 'hotel_1', roomTypeId: 'rt_1' },
  } as Parameters<typeof fetchPhysicalRoomsWorker>[0];

  it('happy path', () => {
    const gen = fetchPhysicalRoomsWorker(action);
    expect(gen.next().value).toEqual(put(physicalRoomsActions.fetchRequest()));
    expect(gen.next().value).toEqual(call(fetchPhysicalRoomsApi, 'hotel_1', 'rt_1'));
    expect(gen.next(mockPhysicalRooms).value).toEqual(
      put(physicalRoomsActions.fetchSuccess(mockPhysicalRooms))
    );
    expect(gen.next().done).toBe(true);
  });

  it('error path', () => {
    const gen = fetchPhysicalRoomsWorker(action);
    gen.next();
    gen.next();
    expect(gen.throw(new Error('err')).value).toEqual(
      put(physicalRoomsActions.fetchFailure('err'))
    );
  });
});

describe('createPhysicalRoomWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const action = {
    type: 'physicalRooms/saga/createPhysicalRoom',
    payload: {
      hotelId: 'hotel_1',
      roomTypeId: 'rt_1',
      body: { code: '103', floor: 1, status: 'AVAILABLE' },
      resolve,
      reject,
    },
  } as Parameters<typeof createPhysicalRoomWorker>[0];

  beforeEach(() => jest.clearAllMocks());

  it('happy path', () => {
    const gen = createPhysicalRoomWorker(action);
    expect(gen.next().value).toEqual(put(physicalRoomsActions.createRequest()));
    expect(gen.next().value).toEqual(
      call(createPhysicalRoomApi, 'hotel_1', 'rt_1', { code: '103', floor: 1, status: 'AVAILABLE' })
    );
    const result = {
      id: 'room_new',
      code: '103',
      floor: 1,
      status: 'AVAILABLE' as const,
      hotelId: 'hotel_1',
      roomTypeId: 'rt_1',
    };
    expect(gen.next(result).value).toEqual(put(physicalRoomsActions.createSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_PHYSICAL_ROOMS, payload: { hotelId: 'hotel_1', roomTypeId: 'rt_1' } })
    );
    gen.next(); // FETCH_HOTEL
    gen.next(); // resolve
    expect(resolve).toHaveBeenCalledWith(result);
  });

  it('error path', () => {
    const gen = createPhysicalRoomWorker(action);
    gen.next();
    gen.next();
    const err = new Error('duplicate code');
    gen.throw(err);
    gen.next();
    gen.next();
    expect(reject).toHaveBeenCalledWith(err);
  });
});

describe('updatePhysicalRoomWorker', () => {
  const resolve = jest.fn();
  const action = {
    type: 'physicalRooms/saga/updatePhysicalRoom',
    payload: {
      hotelId: 'hotel_1',
      roomTypeId: 'rt_1',
      id: 'room_101',
      body: { status: 'MAINTENANCE' },
      resolve,
    },
  } as Parameters<typeof updatePhysicalRoomWorker>[0];

  beforeEach(() => jest.clearAllMocks());

  it('happy path', () => {
    const gen = updatePhysicalRoomWorker(action);
    expect(gen.next().value).toEqual(put(physicalRoomsActions.updateRequest()));
    expect(gen.next().value).toEqual(
      call(updatePhysicalRoomApi, 'hotel_1', 'rt_1', 'room_101', { status: 'MAINTENANCE' })
    );
    const result = { ...mockPhysicalRooms[0], status: 'MAINTENANCE' as const };
    expect(gen.next(result).value).toEqual(put(physicalRoomsActions.updateSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_PHYSICAL_ROOMS, payload: { hotelId: 'hotel_1', roomTypeId: 'rt_1' } })
    );
    gen.next();
    expect(resolve).toHaveBeenCalledWith(result);
  });
});

describe('deletePhysicalRoomWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const action = {
    type: 'physicalRooms/saga/deletePhysicalRoom',
    payload: { hotelId: 'hotel_1', roomTypeId: 'rt_1', id: 'room_101', resolve, reject },
  } as Parameters<typeof deletePhysicalRoomWorker>[0];

  beforeEach(() => jest.clearAllMocks());

  it('happy path', () => {
    const gen = deletePhysicalRoomWorker(action);
    expect(gen.next().value).toEqual(put(physicalRoomsActions.deleteRequest()));
    expect(gen.next().value).toEqual(call(deletePhysicalRoomApi, 'hotel_1', 'rt_1', 'room_101'));
    expect(gen.next().value).toEqual(put(physicalRoomsActions.deleteSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_PHYSICAL_ROOMS, payload: { hotelId: 'hotel_1', roomTypeId: 'rt_1' } })
    );
    gen.next(); // FETCH_HOTEL
    gen.next();
    expect(resolve).toHaveBeenCalledWith(undefined);
  });

  it('error path', () => {
    const gen = deletePhysicalRoomWorker(action);
    gen.next();
    gen.next();
    const err = new Error('in use');
    gen.throw(err);
    gen.next();
    gen.next();
    expect(reject).toHaveBeenCalledWith(err);
  });
});
