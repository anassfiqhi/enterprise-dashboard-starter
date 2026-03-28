import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PhysicalRoom } from '@repo/shared';
import { toast } from 'sonner';
import { physicalRoomsActions } from '@/lib/reducers/physicalRooms/physicalRoomsSlice';
import { apiRequest } from '@/lib/api/apiClient';

export const FETCH_PHYSICAL_ROOMS = 'physicalRooms/saga/fetchPhysicalRooms';
export const CREATE_PHYSICAL_ROOM = 'physicalRooms/saga/createPhysicalRoom';
export const UPDATE_PHYSICAL_ROOM = 'physicalRooms/saga/updatePhysicalRoom';
export const DELETE_PHYSICAL_ROOM = 'physicalRooms/saga/deletePhysicalRoom';

const FETCH_HOTEL = 'hotels/saga/fetchHotel';

interface FetchPhysicalRoomsPayload {
    hotelId: string;
    roomTypeId: string;
}

interface CreatePhysicalRoomPayload {
    hotelId: string;
    roomTypeId: string;
    body: Partial<PhysicalRoom>;
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

interface UpdatePhysicalRoomPayload {
    hotelId: string;
    roomTypeId: string;
    id: string;
    body: Partial<PhysicalRoom>;
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

interface DeletePhysicalRoomPayload {
    hotelId: string;
    roomTypeId: string;
    id: string;
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

async function fetchPhysicalRoomsApi(hotelId: string, roomTypeId: string): Promise<PhysicalRoom[]> {
    return apiRequest<PhysicalRoom[]>(`/api/v1/hotels/${hotelId}/room-types/${roomTypeId}/rooms`);
}

async function createPhysicalRoomApi(hotelId: string, roomTypeId: string, body: Partial<PhysicalRoom>): Promise<PhysicalRoom> {
    return apiRequest<PhysicalRoom>(`/api/v1/hotels/${hotelId}/room-types/${roomTypeId}/rooms`, {
        method: 'POST',
        body,
    });
}

async function updatePhysicalRoomApi(hotelId: string, roomTypeId: string, id: string, body: Partial<PhysicalRoom>): Promise<PhysicalRoom> {
    return apiRequest<PhysicalRoom>(`/api/v1/hotels/${hotelId}/room-types/${roomTypeId}/rooms/${id}`, {
        method: 'PATCH',
        body,
    });
}

async function deletePhysicalRoomApi(hotelId: string, roomTypeId: string, id: string): Promise<void> {
    return apiRequest<void>(`/api/v1/hotels/${hotelId}/room-types/${roomTypeId}/rooms/${id}`, {
        method: 'DELETE',
    });
}

function* fetchPhysicalRoomsWorker(action: PayloadAction<FetchPhysicalRoomsPayload>) {
    const { hotelId, roomTypeId } = action.payload;
    try {
        yield put(physicalRoomsActions.fetchRequest());
        const data: PhysicalRoom[] = yield call(fetchPhysicalRoomsApi, hotelId, roomTypeId);
        yield put(physicalRoomsActions.fetchSuccess(data));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch physical rooms';
        yield put(physicalRoomsActions.fetchFailure(message));
    }
}

function* createPhysicalRoomWorker(action: PayloadAction<CreatePhysicalRoomPayload>) {
    const { hotelId, roomTypeId, body, resolve, reject } = action.payload;
    try {
        yield put(physicalRoomsActions.createRequest());
        const result: PhysicalRoom = yield call(createPhysicalRoomApi, hotelId, roomTypeId, body);
        yield put(physicalRoomsActions.createSuccess());
        toast.success(`Room ${result.code} has been created`);

        yield put({ type: FETCH_PHYSICAL_ROOMS, payload: { hotelId, roomTypeId } });
        yield put({ type: FETCH_HOTEL, payload: { hotelId } });

        resolve?.(result);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to create physical room');
        yield put(physicalRoomsActions.createFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* updatePhysicalRoomWorker(action: PayloadAction<UpdatePhysicalRoomPayload>) {
    const { hotelId, roomTypeId, id, body, resolve, reject } = action.payload;
    try {
        yield put(physicalRoomsActions.updateRequest());
        const result: PhysicalRoom = yield call(updatePhysicalRoomApi, hotelId, roomTypeId, id, body);
        yield put(physicalRoomsActions.updateSuccess());
        toast.success('Room has been updated');

        yield put({ type: FETCH_PHYSICAL_ROOMS, payload: { hotelId, roomTypeId } });

        resolve?.(result);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to update physical room');
        yield put(physicalRoomsActions.updateFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* deletePhysicalRoomWorker(action: PayloadAction<DeletePhysicalRoomPayload>) {
    const { hotelId, roomTypeId, id, resolve, reject } = action.payload;
    try {
        yield put(physicalRoomsActions.deleteRequest());
        yield call(deletePhysicalRoomApi, hotelId, roomTypeId, id);
        yield put(physicalRoomsActions.deleteSuccess());
        toast.success('Room has been deleted');

        yield put({ type: FETCH_PHYSICAL_ROOMS, payload: { hotelId, roomTypeId } });
        yield put({ type: FETCH_HOTEL, payload: { hotelId } });

        resolve?.(undefined);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to delete physical room');
        yield put(physicalRoomsActions.deleteFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

export function* physicalRoomsSaga() {
    yield takeLatest(FETCH_PHYSICAL_ROOMS, fetchPhysicalRoomsWorker);
    yield takeEvery(CREATE_PHYSICAL_ROOM, createPhysicalRoomWorker);
    yield takeEvery(UPDATE_PHYSICAL_ROOM, updatePhysicalRoomWorker);
    yield takeEvery(DELETE_PHYSICAL_ROOM, deletePhysicalRoomWorker);
}
