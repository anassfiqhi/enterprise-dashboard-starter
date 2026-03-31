import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Hotel, RoomType, ActivityType } from '@repo/shared';
import { toast } from 'sonner';
import { hotelsActions } from '@/lib/reducers/hotels/hotelsSlice';
import type { HotelDetail } from '@/lib/reducers/hotels/hotelsSlice';
import { authClient } from '@/lib/auth-client';
import { apiRequest } from '@/lib/api/apiClient';

// ============================================================================
// Action Types
// ============================================================================

export const FETCH_HOTELS = 'hotels/saga/fetchHotels';
export const FETCH_HOTEL = 'hotels/saga/fetchHotel';
export const CREATE_HOTEL = 'hotels/saga/createHotel';
export const UPDATE_HOTEL = 'hotels/saga/updateHotel';
export const DELETE_HOTEL = 'hotels/saga/deleteHotel';
export const CREATE_ROOM_TYPE = 'hotels/saga/createRoomType';
export const UPDATE_ROOM_TYPE = 'hotels/saga/updateRoomType';
export const DELETE_ROOM_TYPE = 'hotels/saga/deleteRoomType';
export const CREATE_ACTIVITY_TYPE = 'hotels/saga/createActivityType';
export const UPDATE_ACTIVITY_TYPE = 'hotels/saga/updateActivityType';
export const DELETE_ACTIVITY_TYPE = 'hotels/saga/deleteActivityType';

// ============================================================================
// Payload Interfaces
// ============================================================================

interface FetchHotelPayload {
    hotelId: string;
}

interface CreateHotelPayload {
    input: {
        name: string;
        timezone: string;
        address?: {
            street?: string;
            city: string;
            state?: string;
            country: string;
            postalCode?: string;
        };
    };
    resolve?: (value: Hotel) => void;
    reject?: (error: Error) => void;
}

interface UpdateHotelPayload {
    id: string;
    input: Partial<CreateHotelPayload['input']>;
    resolve?: (value: Hotel) => void;
    reject?: (error: Error) => void;
}

interface DeleteHotelPayload {
    hotelId: string;
    resolve?: (value: string) => void;
    reject?: (error: Error) => void;
}

interface CreateRoomTypePayload {
    hotelId: string;
    input: {
        name: string;
        capacity: number;
        description?: string;
        basePrice: number;
        currency?: string;
    };
    resolve?: (value: RoomType) => void;
    reject?: (error: Error) => void;
}

interface UpdateRoomTypePayload {
    id: string;
    hotelId: string;
    input: {
        name?: string;
        capacity?: number;
        description?: string;
        basePrice?: number;
        currency?: string;
    };
    resolve?: (value: RoomType) => void;
    reject?: (error: Error) => void;
}

interface DeleteRoomTypePayload {
    id: string;
    hotelId: string;
    resolve?: (value: { id: string; hotelId: string }) => void;
    reject?: (error: Error) => void;
}

interface CreateActivityTypePayload {
    hotelId: string;
    input: {
        name: string;
        capacityPerSlot: number;
        description?: string;
        duration: number;
        basePrice: number;
        currency?: string;
    };
    resolve?: (value: ActivityType) => void;
    reject?: (error: Error) => void;
}

interface UpdateActivityTypePayload {
    id: string;
    hotelId: string;
    input: {
        name?: string;
        capacityPerSlot?: number;
        description?: string;
        duration?: number;
        basePrice?: number;
        currency?: string;
    };
    resolve?: (value: ActivityType) => void;
    reject?: (error: Error) => void;
}

interface DeleteActivityTypePayload {
    id: string;
    hotelId: string;
    resolve?: (value: { id: string; hotelId: string }) => void;
    reject?: (error: Error) => void;
}

// ============================================================================
// Helpers
// ============================================================================

function generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function orgToHotel(org: Record<string, unknown>): Hotel {
    let address: Hotel['address'] | undefined;
    if (org.address && typeof org.address === 'string') {
        try { address = JSON.parse(org.address); } catch { /* ignore */ }
    }
    return {
        id: org.id as string,
        name: org.name as string,
        timezone: (org.timezone as string) || 'UTC',
        address,
    };
}

// ============================================================================
// Async Functions (extracted to avoid TS yield type issues)
// ============================================================================

async function fetchHotelsList(): Promise<Hotel[]> {
    const response = await authClient.organization.list();
    if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch hotels');
    }
    const hotels = (response.data ?? []).map(orgToHotel);
    return JSON.parse(JSON.stringify(hotels)) as Hotel[];
}

async function fetchHotelDetail(hotelId: string): Promise<HotelDetail> {
    const response = await authClient.organization.getFullOrganization({
        query: { organizationId: hotelId },
    });
    if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch hotel');
    }
    const org = response.data;
    const hotel = orgToHotel(org as unknown as Record<string, unknown>);
    const detail: HotelDetail = {
        ...hotel,
        roomTypes: [],
        activityTypes: [],
        totalRooms: 0,
        totalActivities: 0,
    };
    return JSON.parse(JSON.stringify(detail)) as HotelDetail;
}

async function createHotelApi(
    input: CreateHotelPayload['input'],
): Promise<Hotel> {
    const response = await authClient.organization.create({
        name: input.name,
        slug: generateSlug(input.name),
        timezone: input.timezone,
        checkInTime: '15:00',
        checkOutTime: '11:00',
        address: input.address ? JSON.stringify(input.address) : '',
        phone: '',
        contactEmail: '',
        currency: 'USD',
    });
    if (response.error) {
        throw new Error(response.error.message || 'Failed to create hotel');
    }
    const hotel = orgToHotel(response.data as unknown as Record<string, unknown>);
    return JSON.parse(JSON.stringify(hotel)) as Hotel;
}

async function updateHotelApi(
    id: string,
    input: UpdateHotelPayload['input'],
): Promise<Hotel> {
    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.timezone !== undefined) data.timezone = input.timezone;
    if (input.address !== undefined) data.address = JSON.stringify(input.address);
    const response = await authClient.organization.update({
        organizationId: id,
        data: data as { name?: string },
    });
    if (response.error) {
        throw new Error(response.error.message || 'Failed to update hotel');
    }
    const hotel = orgToHotel(response.data as unknown as Record<string, unknown>);
    return JSON.parse(JSON.stringify(hotel)) as Hotel;
}

async function deleteHotelApi(hotelId: string): Promise<void> {
    const response = await authClient.organization.delete({
        organizationId: hotelId,
    });
    if (response.error) {
        throw new Error(response.error.message || 'Failed to delete hotel');
    }
}

async function createRoomTypeApi(
    hotelId: string,
    input: CreateRoomTypePayload['input'],
): Promise<RoomType> {
    return apiRequest<RoomType>(`/api/v1/hotels/${hotelId}/room-types`, {
        method: 'POST',
        body: { ...input, hotelId },
    });
}

async function updateRoomTypeApi(
    hotelId: string,
    id: string,
    input: UpdateRoomTypePayload['input'],
): Promise<RoomType> {
    return apiRequest<RoomType>(`/api/v1/hotels/${hotelId}/room-types/${id}`, {
        method: 'PATCH',
        body: input,
    });
}

async function deleteRoomTypeApi(
    hotelId: string,
    id: string,
): Promise<void> {
    return apiRequest<void>(`/api/v1/hotels/${hotelId}/room-types/${id}`, {
        method: 'DELETE',
    });
}

async function createActivityTypeApi(
    hotelId: string,
    input: CreateActivityTypePayload['input'],
): Promise<ActivityType> {
    return apiRequest<ActivityType>(`/api/v1/hotels/${hotelId}/activity-types`, {
        method: 'POST',
        body: { ...input, hotelId },
    });
}

async function updateActivityTypeApi(
    hotelId: string,
    id: string,
    input: UpdateActivityTypePayload['input'],
): Promise<ActivityType> {
    return apiRequest<ActivityType>(`/api/v1/hotels/${hotelId}/activity-types/${id}`, {
        method: 'PATCH',
        body: input,
    });
}

async function deleteActivityTypeApi(
    hotelId: string,
    id: string,
): Promise<void> {
    return apiRequest<void>(`/api/v1/hotels/${hotelId}/activity-types/${id}`, {
        method: 'DELETE',
    });
}

// ============================================================================
// Workers
// ============================================================================

function* fetchHotelsWorker() {
    try {
        yield put(hotelsActions.fetchHotelsRequest());
        const data: Hotel[] = yield call(fetchHotelsList);
        yield put(hotelsActions.fetchHotelsSuccess(data));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch hotels';
        yield put(hotelsActions.fetchHotelsFailure(message));
    }
}

function* fetchHotelWorker(action: PayloadAction<FetchHotelPayload>) {
    const { hotelId } = action.payload;
    try {
        yield put(hotelsActions.fetchHotelRequest());
        const data: HotelDetail = yield call(fetchHotelDetail, hotelId);
        yield put(hotelsActions.fetchHotelSuccess(data));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch hotel';
        yield put(hotelsActions.fetchHotelFailure(message));
    }
}

function* createHotelWorker(action: PayloadAction<CreateHotelPayload>) {
    const { input, resolve, reject } = action.payload;
    try {
        yield put(hotelsActions.createHotelRequest());
        const hotel: Hotel = yield call(createHotelApi, input);
        yield put(hotelsActions.createHotelSuccess());
        toast.success('Hotel created successfully');

        // Cache invalidation: re-fetch hotels list
        yield put({ type: FETCH_HOTELS, payload: {} });

        resolve?.(hotel);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to create hotel');
        yield put(hotelsActions.createHotelFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* updateHotelWorker(action: PayloadAction<UpdateHotelPayload>) {
    const { id, input, resolve, reject } = action.payload;
    try {
        yield put(hotelsActions.updateHotelRequest());
        const hotel: Hotel = yield call(updateHotelApi, id, input);
        yield put(hotelsActions.updateHotelSuccess());
        toast.success('Hotel updated successfully');

        // Cache invalidation: re-fetch hotels list and hotel detail
        yield put({ type: FETCH_HOTELS, payload: {} });
        yield put({ type: FETCH_HOTEL, payload: { hotelId: id } });

        resolve?.(hotel);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to update hotel');
        yield put(hotelsActions.updateHotelFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* deleteHotelWorker(action: PayloadAction<DeleteHotelPayload>) {
    const { hotelId, resolve, reject } = action.payload;
    try {
        yield put(hotelsActions.deleteHotelRequest());
        yield call(deleteHotelApi, hotelId);
        yield put(hotelsActions.deleteHotelSuccess());
        toast.success('Hotel deleted successfully');

        // Cache invalidation: re-fetch hotels list
        yield put({ type: FETCH_HOTELS, payload: {} });

        resolve?.(hotelId);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to delete hotel');
        yield put(hotelsActions.deleteHotelFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* createRoomTypeWorker(action: PayloadAction<CreateRoomTypePayload>) {
    const { hotelId, input, resolve, reject } = action.payload;
    try {
        yield put(hotelsActions.createRoomTypeRequest());
        const roomType: RoomType = yield call(createRoomTypeApi, hotelId, input);
        yield put(hotelsActions.createRoomTypeSuccess());
        toast.success('Room type created successfully');

        // Cache invalidation: re-fetch hotel detail (roomTypes are nested)
        yield put({ type: FETCH_HOTEL, payload: { hotelId } });

        resolve?.(roomType);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to create room type');
        yield put(hotelsActions.createRoomTypeFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* updateRoomTypeWorker(action: PayloadAction<UpdateRoomTypePayload>) {
    const { id, hotelId, input, resolve, reject } = action.payload;
    try {
        yield put(hotelsActions.updateRoomTypeRequest());
        const roomType: RoomType = yield call(updateRoomTypeApi, hotelId, id, input);
        yield put(hotelsActions.updateRoomTypeSuccess());
        toast.success('Room type updated successfully');

        // Cache invalidation: re-fetch hotel detail (roomTypes are nested)
        yield put({ type: FETCH_HOTEL, payload: { hotelId } });

        resolve?.(roomType);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to update room type');
        yield put(hotelsActions.updateRoomTypeFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* deleteRoomTypeWorker(action: PayloadAction<DeleteRoomTypePayload>) {
    const { id, hotelId, resolve, reject } = action.payload;
    try {
        yield put(hotelsActions.deleteRoomTypeRequest());
        yield call(deleteRoomTypeApi, hotelId, id);
        yield put(hotelsActions.deleteRoomTypeSuccess());
        toast.success('Room type deleted successfully');

        // Cache invalidation: re-fetch hotel detail (roomTypes are nested)
        yield put({ type: FETCH_HOTEL, payload: { hotelId } });

        resolve?.({ id, hotelId });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to delete room type');
        yield put(hotelsActions.deleteRoomTypeFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* createActivityTypeWorker(action: PayloadAction<CreateActivityTypePayload>) {
    const { hotelId, input, resolve, reject } = action.payload;
    try {
        yield put(hotelsActions.createActivityTypeRequest());
        const activityType: ActivityType = yield call(createActivityTypeApi, hotelId, input);
        yield put(hotelsActions.createActivityTypeSuccess());
        toast.success('Activity type created successfully');

        // Cache invalidation: re-fetch hotel detail (activityTypes are nested)
        yield put({ type: FETCH_HOTEL, payload: { hotelId } });

        resolve?.(activityType);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to create activity type');
        yield put(hotelsActions.createActivityTypeFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* updateActivityTypeWorker(action: PayloadAction<UpdateActivityTypePayload>) {
    const { id, hotelId, input, resolve, reject } = action.payload;
    try {
        yield put(hotelsActions.updateActivityTypeRequest());
        const activityType: ActivityType = yield call(updateActivityTypeApi, hotelId, id, input);
        yield put(hotelsActions.updateActivityTypeSuccess());
        toast.success('Activity type updated successfully');

        // Cache invalidation: re-fetch hotel detail (activityTypes are nested)
        yield put({ type: FETCH_HOTEL, payload: { hotelId } });

        resolve?.(activityType);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to update activity type');
        yield put(hotelsActions.updateActivityTypeFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* deleteActivityTypeWorker(action: PayloadAction<DeleteActivityTypePayload>) {
    const { id, hotelId, resolve, reject } = action.payload;
    try {
        yield put(hotelsActions.deleteActivityTypeRequest());
        yield call(deleteActivityTypeApi, hotelId, id);
        yield put(hotelsActions.deleteActivityTypeSuccess());
        toast.success('Activity type deleted successfully');

        // Cache invalidation: re-fetch hotel detail (activityTypes are nested)
        yield put({ type: FETCH_HOTEL, payload: { hotelId } });

        resolve?.({ id, hotelId });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to delete activity type');
        yield put(hotelsActions.deleteActivityTypeFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

// ============================================================================
// Root Saga
// ============================================================================

export function* hotelsSaga() {
    yield takeLatest(FETCH_HOTELS, fetchHotelsWorker);
    yield takeLatest(FETCH_HOTEL, fetchHotelWorker);
    yield takeEvery(CREATE_HOTEL, createHotelWorker);
    yield takeEvery(UPDATE_HOTEL, updateHotelWorker);
    yield takeEvery(DELETE_HOTEL, deleteHotelWorker);
    yield takeEvery(CREATE_ROOM_TYPE, createRoomTypeWorker);
    yield takeEvery(UPDATE_ROOM_TYPE, updateRoomTypeWorker);
    yield takeEvery(DELETE_ROOM_TYPE, deleteRoomTypeWorker);
    yield takeEvery(CREATE_ACTIVITY_TYPE, createActivityTypeWorker);
    yield takeEvery(UPDATE_ACTIVITY_TYPE, updateActivityTypeWorker);
    yield takeEvery(DELETE_ACTIVITY_TYPE, deleteActivityTypeWorker);
}
