import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Reservation, ReservationStatus, Payment } from '@repo/shared';
import { toast } from 'sonner';
import { reservationsDataActions } from '@/lib/reducers/reservations/reservationsDataSlice';
import type { ReservationWithPayments } from '@/lib/reducers/reservations/reservationsDataSlice';
import { apiRequest, apiRequestWithMeta } from '@/lib/api/apiClient';
import { FETCH_GUESTS } from '@/lib/sagas/guests/guestsSaga';

// ============================================================================
// Action Types
// ============================================================================

export const FETCH_RESERVATIONS = 'reservationsData/saga/fetchReservations';
export const FETCH_RESERVATION = 'reservationsData/saga/fetchReservation';
export const CREATE_RESERVATION = 'reservationsData/saga/createReservation';
export const UPDATE_RESERVATION_STATUS = 'reservationsData/saga/updateReservationStatus';
export const CANCEL_RESERVATION = 'reservationsData/saga/cancelReservation';
export const REFUND_RESERVATION = 'reservationsData/saga/refundReservation';

// ============================================================================
// Payload Interfaces
// ============================================================================

interface FetchReservationsPayload {
    hotelId: string;
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    checkInFrom?: string;
    checkInTo?: string;
    sort?: string;
}

interface FetchReservationPayload {
    id: string;
}

interface CreateReservationPayload {
    input: {
        guestId: string;
        hotelId: string;
        roomTypeId?: string;
        activityTypeId?: string;
        checkInDate?: string;
        checkOutDate?: string;
        guests: number;
        specialRequests?: string;
    };
    hotelId: string;
    resolve?: (value: Reservation) => void;
    reject?: (error: Error) => void;
}

interface UpdateReservationStatusPayload {
    id: string;
    status: ReservationStatus;
    hotelId: string;
    resolve?: (value: Reservation) => void;
    reject?: (error: Error) => void;
}

interface CancelReservationPayload {
    id: string;
    reason?: string;
    hotelId: string;
    resolve?: (value: Reservation) => void;
    reject?: (error: Error) => void;
}

interface RefundReservationPayload {
    id: string;
    amount?: number;
    reason?: string;
    hotelId: string;
    resolve?: (value: Payment) => void;
    reject?: (error: Error) => void;
}

// ============================================================================
// Async Functions (extracted to avoid TS yield type issues)
// ============================================================================

async function fetchReservationsList(
    payload: FetchReservationsPayload,
): Promise<{
    data: Reservation[];
    meta: { requestId: string; total: number; page: number; pageSize: number; totalPages: number };
}> {
    const params: Record<string, string | number | undefined> = {
        hotelId: payload.hotelId,
        page: payload.page ?? 1,
        pageSize: payload.pageSize ?? 10,
    };
    if (payload.search) params.search = payload.search;
    if (payload.status) params.status = payload.status;
    if (payload.checkInFrom) params.checkInFrom = payload.checkInFrom;
    if (payload.checkInTo) params.checkInTo = payload.checkInTo;
    if (payload.sort) params.sort = payload.sort;

    const result = await apiRequestWithMeta<Reservation[]>('/api/v1/reservations', { params });
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

async function fetchReservationDetail(id: string): Promise<ReservationWithPayments> {
    return apiRequest<ReservationWithPayments>(`/api/v1/reservations/${id}`);
}

async function createReservationApi(
    input: CreateReservationPayload['input'],
): Promise<Reservation> {
    return apiRequest<Reservation>('/api/v1/reservations', {
        method: 'POST',
        body: input,
    });
}

async function updateReservationStatusApi(
    id: string,
    status: ReservationStatus,
): Promise<Reservation> {
    return apiRequest<Reservation>(`/api/v1/reservations/${id}`, {
        method: 'PATCH',
        body: { status },
    });
}

async function cancelReservationApi(
    id: string,
    reason?: string,
): Promise<Reservation> {
    return apiRequest<Reservation>(`/api/v1/reservations/${id}/cancel`, {
        method: 'POST',
        body: { reason },
    });
}

async function refundReservationApi(
    id: string,
    amount?: number,
    reason?: string,
): Promise<Payment> {
    return apiRequest<Payment>(`/api/v1/reservations/${id}/refund`, {
        method: 'POST',
        body: { amount, reason },
    });
}

// ============================================================================
// Workers
// ============================================================================

function* fetchReservationsWorker(action: PayloadAction<FetchReservationsPayload>) {
    try {
        yield put(reservationsDataActions.fetchReservationsRequest());
        const result: {
            data: Reservation[];
            meta: { requestId: string; total: number; page: number; pageSize: number; totalPages: number };
        } = yield call(fetchReservationsList, action.payload);
        yield put(
            reservationsDataActions.fetchReservationsSuccess({
                items: result.data,
                meta: result.meta,
            }),
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch reservations';
        yield put(reservationsDataActions.fetchReservationsFailure(message));
    }
}

function* fetchReservationWorker(action: PayloadAction<FetchReservationPayload>) {
    const { id } = action.payload;
    try {
        yield put(reservationsDataActions.fetchReservationRequest());
        const data: ReservationWithPayments = yield call(fetchReservationDetail, id);
        yield put(reservationsDataActions.fetchReservationSuccess(data));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch reservation';
        yield put(reservationsDataActions.fetchReservationFailure(message));
    }
}

function* createReservationWorker(action: PayloadAction<CreateReservationPayload>) {
    const { input, hotelId, resolve, reject } = action.payload;
    try {
        yield put(reservationsDataActions.createReservationRequest());
        const reservation: Reservation = yield call(createReservationApi, input);
        yield put(reservationsDataActions.createReservationSuccess());
        toast.success('Reservation created successfully');

        // Cache invalidation: re-fetch reservations list and guests list
        yield put({ type: FETCH_RESERVATIONS, payload: { hotelId } });
        yield put({ type: FETCH_GUESTS, payload: { hotelId } });

        resolve?.(reservation);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to create reservation');
        yield put(reservationsDataActions.createReservationFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* updateReservationStatusWorker(action: PayloadAction<UpdateReservationStatusPayload>) {
    const { id, status, hotelId, resolve, reject } = action.payload;
    try {
        yield put(reservationsDataActions.updateReservationStatusRequest());
        const reservation: Reservation = yield call(updateReservationStatusApi, id, status);
        yield put(reservationsDataActions.updateReservationStatusSuccess());
        toast.success('Reservation updated');

        // Cache invalidation: re-fetch reservations list
        yield put({ type: FETCH_RESERVATIONS, payload: { hotelId } });

        resolve?.(reservation);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to update reservation');
        yield put(reservationsDataActions.updateReservationStatusFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* cancelReservationWorker(action: PayloadAction<CancelReservationPayload>) {
    const { id, reason, hotelId, resolve, reject } = action.payload;
    try {
        yield put(reservationsDataActions.cancelReservationRequest());
        const reservation: Reservation = yield call(cancelReservationApi, id, reason);
        yield put(reservationsDataActions.cancelReservationSuccess());
        toast.success('Reservation cancelled');

        // Cache invalidation: re-fetch reservations list
        yield put({ type: FETCH_RESERVATIONS, payload: { hotelId } });

        resolve?.(reservation);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to cancel reservation');
        yield put(reservationsDataActions.cancelReservationFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* refundReservationWorker(action: PayloadAction<RefundReservationPayload>) {
    const { id, amount, reason, hotelId, resolve, reject } = action.payload;
    try {
        yield put(reservationsDataActions.refundReservationRequest());
        const payment: Payment = yield call(refundReservationApi, id, amount, reason);
        yield put(reservationsDataActions.refundReservationSuccess());
        toast.success('Refund processed');

        // Cache invalidation: re-fetch reservations list
        yield put({ type: FETCH_RESERVATIONS, payload: { hotelId } });

        resolve?.(payment);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to process refund');
        yield put(reservationsDataActions.refundReservationFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

// ============================================================================
// Root Saga
// ============================================================================

export function* reservationsSaga() {
    yield takeLatest(FETCH_RESERVATIONS, fetchReservationsWorker);
    yield takeLatest(FETCH_RESERVATION, fetchReservationWorker);
    yield takeEvery(CREATE_RESERVATION, createReservationWorker);
    yield takeEvery(UPDATE_RESERVATION_STATUS, updateReservationStatusWorker);
    yield takeEvery(CANCEL_RESERVATION, cancelReservationWorker);
    yield takeEvery(REFUND_RESERVATION, refundReservationWorker);
}
