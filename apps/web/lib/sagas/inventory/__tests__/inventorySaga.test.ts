import { call, put } from 'redux-saga/effects';
import {
  fetchInventoryWorker,
  updateInventoryWorker,
  FETCH_INVENTORY,
  fetchInventory,
  updateInventoryApi,
} from '../inventorySaga';
import { inventoryActions } from '@/lib/reducers/inventory/inventorySlice';
import { mockRoomInventory } from '@/__mocks__/fixtures/inventory';
import { FETCH_AVAILABILITY } from '../../availability/availabilitySaga';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/api/apiClient', () => ({ apiRequest: jest.fn() }));

describe('fetchInventoryWorker', () => {
  const action = {
    type: FETCH_INVENTORY,
    payload: { hotelId: 'hotel_1', startDate: '2026-05-01', endDate: '2026-05-07' },
  } as Parameters<typeof fetchInventoryWorker>[0];

  it('happy path', () => {
    const gen = fetchInventoryWorker(action);
    expect(gen.next().value).toEqual(put(inventoryActions.fetchRequest()));
    expect(gen.next().value).toEqual(call(fetchInventory, action.payload));
    expect(gen.next(mockRoomInventory).value).toEqual(
      put(inventoryActions.fetchSuccess(mockRoomInventory))
    );
    expect(gen.next().done).toBe(true);
  });

  it('error path', () => {
    const gen = fetchInventoryWorker(action);
    gen.next();
    gen.next();
    expect(gen.throw(new Error('err')).value).toEqual(put(inventoryActions.fetchFailure('err')));
  });
});

describe('updateInventoryWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const updates = [{ roomTypeId: 'rt_1', date: '2026-05-01', availableRooms: 5 }];
  const action = {
    type: 'inventory/saga/update',
    payload: { hotelId: 'hotel_1', updates, resolve, reject },
  } as Parameters<typeof updateInventoryWorker>[0];

  beforeEach(() => jest.clearAllMocks());

  it('happy path: calls resolve and invalidates cache', () => {
    const gen = updateInventoryWorker(action);
    expect(gen.next().value).toEqual(put(inventoryActions.updateRequest()));
    expect(gen.next().value).toEqual(call(updateInventoryApi, 'hotel_1', updates));
    const result = { data: mockRoomInventory, updatedCount: 1 };
    expect(gen.next(result).value).toEqual(put(inventoryActions.updateSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_INVENTORY, payload: { hotelId: 'hotel_1' } })
    );
    expect(gen.next().value).toEqual(
      put({ type: FETCH_AVAILABILITY, payload: { hotelId: 'hotel_1' } })
    );
    gen.next();
    expect(resolve).toHaveBeenCalledWith(result);
  });

  it('error path: calls reject', () => {
    const gen = updateInventoryWorker(action);
    gen.next();
    gen.next();
    const err = new Error('update failed');
    gen.throw(err);
    gen.next();
    gen.next();
    expect(reject).toHaveBeenCalledWith(err);
  });
});
