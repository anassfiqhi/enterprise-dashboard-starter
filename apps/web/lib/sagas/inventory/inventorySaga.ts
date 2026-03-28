import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RoomInventory } from '@repo/shared';
import { toast } from 'sonner';
import { inventoryActions } from '@/lib/reducers/inventory/inventorySlice';
import { apiRequest } from '@/lib/api/apiClient';
import { FETCH_AVAILABILITY } from '@/lib/sagas/availability/availabilitySaga';

export const FETCH_INVENTORY = 'inventory/saga/fetch';
export const UPDATE_INVENTORY = 'inventory/saga/update';

interface FetchInventoryPayload {
    hotelId: string;
    startDate?: string;
    endDate?: string;
    roomTypeId?: string;
}

interface UpdateInventoryPayload {
    hotelId: string;
    updates: unknown[];
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

async function fetchInventory(payload: FetchInventoryPayload): Promise<RoomInventory[]> {
    const { hotelId, startDate, endDate, roomTypeId } = payload;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (roomTypeId) params.append('roomTypeId', roomTypeId);

    const url = `/api/v1/hotels/${hotelId}/inventory?${params.toString()}`;
    return apiRequest<RoomInventory[]>(url);
}

async function updateInventoryApi(hotelId: string, updates: unknown[]): Promise<{ data: RoomInventory[]; updatedCount: number }> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/hotels/${hotelId}/inventory`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updates),
        }
    );
    if (!response.ok) {
        throw new Error('Failed to update inventory');
    }
    const json = await response.json();
    return { data: json.data, updatedCount: json.meta.updatedCount };
}

function* fetchInventoryWorker(action: PayloadAction<FetchInventoryPayload>) {
    try {
        yield put(inventoryActions.fetchRequest());
        const data: RoomInventory[] = yield call(fetchInventory, action.payload);
        yield put(inventoryActions.fetchSuccess(data));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch inventory';
        yield put(inventoryActions.fetchFailure(message));
    }
}

function* updateInventoryWorker(action: PayloadAction<UpdateInventoryPayload>) {
    const { hotelId, updates, resolve, reject } = action.payload;
    try {
        yield put(inventoryActions.updateRequest());
        const result: { data: RoomInventory[]; updatedCount: number } = yield call(
            updateInventoryApi, hotelId, updates
        );
        yield put(inventoryActions.updateSuccess());
        toast.success(`${result.updatedCount} inventory records updated`);

        // Re-fetch inventory and availability (cache invalidation)
        yield put({ type: FETCH_INVENTORY, payload: { hotelId } });
        yield put({ type: FETCH_AVAILABILITY, payload: { hotelId } });

        resolve?.(result);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to update inventory');
        yield put(inventoryActions.updateFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

export function* inventorySaga() {
    yield takeLatest(FETCH_INVENTORY, fetchInventoryWorker);
    yield takeEvery(UPDATE_INVENTORY, updateInventoryWorker);
}
