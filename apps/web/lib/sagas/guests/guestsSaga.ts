import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Guest } from '@repo/shared';
import { toast } from 'sonner';
import { guestsActions } from '@/lib/reducers/guests/guestsSlice';
import type { GuestWithStats, GuestDetail } from '@/lib/reducers/guests/guestsSlice';
import { apiRequest, apiRequestWithMeta } from '@/lib/api/apiClient';

// ============================================================================
// Action Types
// ============================================================================

export const FETCH_GUESTS = 'guests/saga/fetchGuests';
export const FETCH_GUEST = 'guests/saga/fetchGuest';
export const CREATE_GUEST = 'guests/saga/createGuest';
export const UPDATE_GUEST = 'guests/saga/updateGuest';
export const DELETE_GUEST = 'guests/saga/deleteGuest';

// ============================================================================
// Payload Interfaces
// ============================================================================

interface FetchGuestsPayload {
    hotelId: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

interface FetchGuestPayload {
    guestId: string;
}

interface CreateGuestPayload {
    hotelId: string;
    input: {
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
        nationality?: string;
        idType?: string;
        idNumber?: string;
        notes?: string;
    };
    resolve?: (value: Guest) => void;
    reject?: (error: Error) => void;
}

interface UpdateGuestPayload {
    guestId: string;
    input: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        nationality?: string;
        idType?: string;
        idNumber?: string;
        notes?: string;
    };
    hotelId: string;
    resolve?: (value: Guest) => void;
    reject?: (error: Error) => void;
}

interface DeleteGuestPayload {
    guestId: string;
    hotelId: string;
    resolve?: (value: string) => void;
    reject?: (error: Error) => void;
}

// ============================================================================
// Async Functions (extracted to avoid TS yield type issues)
// ============================================================================

async function fetchGuestsList(
    hotelId: string,
    search?: string,
    page?: number,
    pageSize?: number,
): Promise<{
    data: GuestWithStats[];
    meta: { requestId: string; total: number; page: number; pageSize: number; totalPages: number };
}> {
    const params: Record<string, string | number | undefined> = {
        hotelId,
        page: page ?? 1,
        pageSize: pageSize ?? 20,
    };
    if (search) {
        params.search = search;
    }
    const result = await apiRequestWithMeta<GuestWithStats[]>('/api/v1/guests', { params });
    return {
        data: result.data,
        meta: result.meta as {
            requestId: string;
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        },
    };
}

async function fetchGuestDetail(guestId: string): Promise<GuestDetail> {
    return apiRequest<GuestDetail>(`/api/v1/guests/${guestId}`);
}

async function createGuestApi(
    hotelId: string,
    input: CreateGuestPayload['input'],
): Promise<Guest> {
    return apiRequest<Guest>('/api/v1/guests', {
        method: 'POST',
        body: { ...input, hotelId },
    });
}

async function updateGuestApi(
    guestId: string,
    input: UpdateGuestPayload['input'],
): Promise<Guest> {
    return apiRequest<Guest>(`/api/v1/guests/${guestId}`, {
        method: 'PATCH',
        body: input,
    });
}

async function deleteGuestApi(guestId: string): Promise<void> {
    return apiRequest<void>(`/api/v1/guests/${guestId}`, {
        method: 'DELETE',
    });
}

// ============================================================================
// Workers
// ============================================================================

function* fetchGuestsWorker(action: PayloadAction<FetchGuestsPayload>) {
    const { hotelId, search, page, pageSize } = action.payload;
    try {
        yield put(guestsActions.fetchGuestsRequest());
        const result: {
            data: GuestWithStats[];
            meta: { requestId: string; total: number; page: number; pageSize: number; totalPages: number };
        } = yield call(fetchGuestsList, hotelId, search, page, pageSize);
        yield put(
            guestsActions.fetchGuestsSuccess({
                items: result.data,
                meta: result.meta,
            }),
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch guests';
        yield put(guestsActions.fetchGuestsFailure(message));
    }
}

function* fetchGuestWorker(action: PayloadAction<FetchGuestPayload>) {
    const { guestId } = action.payload;
    try {
        yield put(guestsActions.fetchGuestRequest());
        const data: GuestDetail = yield call(fetchGuestDetail, guestId);
        yield put(guestsActions.fetchGuestSuccess(data));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch guest';
        yield put(guestsActions.fetchGuestFailure(message));
    }
}

function* createGuestWorker(action: PayloadAction<CreateGuestPayload>) {
    const { hotelId, input, resolve, reject } = action.payload;
    try {
        yield put(guestsActions.createGuestRequest());
        const guest: Guest = yield call(createGuestApi, hotelId, input);
        yield put(guestsActions.createGuestSuccess());
        toast.success('Guest created successfully');

        // Cache invalidation: re-fetch guests list
        yield put({ type: FETCH_GUESTS, payload: { hotelId } });

        resolve?.(guest);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to create guest');
        yield put(guestsActions.createGuestFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* updateGuestWorker(action: PayloadAction<UpdateGuestPayload>) {
    const { guestId, input, hotelId, resolve, reject } = action.payload;
    try {
        yield put(guestsActions.updateGuestRequest());
        const guest: Guest = yield call(updateGuestApi, guestId, input);
        yield put(guestsActions.updateGuestSuccess());
        toast.success('Guest updated successfully');

        // Cache invalidation: re-fetch guests list and detail
        yield put({ type: FETCH_GUESTS, payload: { hotelId } });
        yield put({ type: FETCH_GUEST, payload: { guestId } });

        resolve?.(guest);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to update guest');
        yield put(guestsActions.updateGuestFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* deleteGuestWorker(action: PayloadAction<DeleteGuestPayload>) {
    const { guestId, hotelId, resolve, reject } = action.payload;
    try {
        yield put(guestsActions.deleteGuestRequest());
        yield call(deleteGuestApi, guestId);
        yield put(guestsActions.deleteGuestSuccess());
        toast.success('Guest deleted successfully');

        // Cache invalidation: re-fetch guests list
        yield put({ type: FETCH_GUESTS, payload: { hotelId } });

        resolve?.(guestId);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to delete guest');
        yield put(guestsActions.deleteGuestFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

// ============================================================================
// Root Saga
// ============================================================================

export function* guestsSaga() {
    yield takeLatest(FETCH_GUESTS, fetchGuestsWorker);
    yield takeLatest(FETCH_GUEST, fetchGuestWorker);
    yield takeEvery(CREATE_GUEST, createGuestWorker);
    yield takeEvery(UPDATE_GUEST, updateGuestWorker);
    yield takeEvery(DELETE_GUEST, deleteGuestWorker);
}
