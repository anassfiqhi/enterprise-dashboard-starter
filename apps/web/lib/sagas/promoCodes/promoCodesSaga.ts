import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PromoCode, DiscountType } from '@repo/shared';
import { toast } from 'sonner';
import { promoCodesActions, type ValidatePromoCodeResult } from '@/lib/reducers/promoCodes/promoCodesSlice';
import { apiRequest } from '@/lib/api/apiClient';
import { config } from '@/lib/config';

// --- Action types ---

export const FETCH_PROMO_CODES = 'promoCodes/saga/fetchPromoCodes';
export const VALIDATE_PROMO_CODE = 'promoCodes/saga/validatePromoCode';
export const CREATE_PROMO_CODE = 'promoCodes/saga/createPromoCode';
export const UPDATE_PROMO_CODE = 'promoCodes/saga/updatePromoCode';
export const DELETE_PROMO_CODE = 'promoCodes/saga/deletePromoCode';

// --- Payload interfaces ---

interface FetchPromoCodesPayload {
    hotelId: string;
    search?: string;
    status?: 'ACTIVE' | 'EXPIRED' | 'EXHAUSTED' | 'INACTIVE';
}

interface ValidatePromoCodePayload {
    code: string;
    amount: number;
    hotelId: string;
    roomTypeId?: string;
}

interface CreatePromoCodePayload {
    hotelId: string;
    input: {
        code: string;
        discountType: DiscountType;
        discountValue: number;
        currency?: string;
        minBookingAmount?: number;
        maxDiscountAmount?: number;
        validFrom?: string;
        validTo?: string;
        maxUses?: number;
        maxUsesPerGuest?: number;
        applicableRoomTypeIds?: string[];
        applicableActivityTypeIds?: string[];
        isActive: boolean;
    };
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

interface UpdatePromoCodePayload {
    id: string;
    data: {
        code?: string;
        discountType?: DiscountType;
        discountValue?: number;
        currency?: string;
        minBookingAmount?: number;
        maxDiscountAmount?: number;
        validFrom?: string;
        validTo?: string;
        maxUses?: number;
        maxUsesPerGuest?: number;
        applicableRoomTypeIds?: string[];
        applicableActivityTypeIds?: string[];
        isActive?: boolean;
    };
    hotelId: string;
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

interface DeletePromoCodePayload {
    id: string;
    hotelId: string;
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

// --- Async helper functions (extracted to avoid TypeScript yield issues) ---

async function fetchPromoCodesApi(payload: FetchPromoCodesPayload): Promise<PromoCode[]> {
    const { hotelId, search, status } = payload;
    return apiRequest<PromoCode[]>('/api/v1/promo-codes', {
        params: { hotelId, search, status },
    });
}

async function validatePromoCodeApi(payload: ValidatePromoCodePayload): Promise<ValidatePromoCodeResult> {
    const { code, amount, hotelId, roomTypeId } = payload;
    const params = new URLSearchParams();
    params.append('amount', amount.toString());
    params.append('hotelId', hotelId);
    if (roomTypeId) params.append('roomTypeId', roomTypeId);

    const response = await fetch(
        `${config.apiUrl}/api/v1/promo-codes/${code}/validate?${params.toString()}`,
        { credentials: 'include' }
    );

    if (!response.ok) {
        if (response.status === 404) {
            return { valid: false, reason: 'Promo code not found' };
        }
        throw new Error('Failed to validate promo code');
    }

    const json = await response.json();
    return json.data as ValidatePromoCodeResult;
}

async function createPromoCodeApi(hotelId: string, input: CreatePromoCodePayload['input']): Promise<PromoCode> {
    return apiRequest<PromoCode>('/api/v1/promo-codes', {
        method: 'POST',
        body: { ...input, hotelId },
    });
}

async function updatePromoCodeApi(id: string, data: UpdatePromoCodePayload['data']): Promise<PromoCode> {
    return apiRequest<PromoCode>(`/api/v1/promo-codes/${id}`, {
        method: 'PATCH',
        body: data,
    });
}

async function deletePromoCodeApi(id: string): Promise<void> {
    await apiRequest<void>(`/api/v1/promo-codes/${id}`, {
        method: 'DELETE',
    });
}

// --- Worker sagas ---

function* fetchPromoCodesWorker(action: PayloadAction<FetchPromoCodesPayload>) {
    try {
        yield put(promoCodesActions.fetchPromoCodesRequest());
        const data: PromoCode[] = yield call(fetchPromoCodesApi, action.payload);
        yield put(promoCodesActions.fetchPromoCodesSuccess(data));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch promo codes';
        yield put(promoCodesActions.fetchPromoCodesFailure(message));
    }
}

function* validatePromoCodeWorker(action: PayloadAction<ValidatePromoCodePayload>) {
    try {
        yield put(promoCodesActions.validatePromoCodeRequest());
        const result: ValidatePromoCodeResult = yield call(validatePromoCodeApi, action.payload);
        yield put(promoCodesActions.validatePromoCodeSuccess(result));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to validate promo code';
        yield put(promoCodesActions.validatePromoCodeFailure(message));
    }
}

function* createPromoCodeWorker(action: PayloadAction<CreatePromoCodePayload>) {
    const { hotelId, input, resolve, reject } = action.payload;
    try {
        yield put(promoCodesActions.createPromoCodeRequest());
        const result: PromoCode = yield call(createPromoCodeApi, hotelId, input);
        yield put(promoCodesActions.createPromoCodeSuccess());
        toast.success(`"${input.code}" has been created`);

        // Re-fetch promo codes (cache invalidation)
        yield put({ type: FETCH_PROMO_CODES, payload: { hotelId } });

        resolve?.(result);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to create promo code');
        yield put(promoCodesActions.createPromoCodeFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* updatePromoCodeWorker(action: PayloadAction<UpdatePromoCodePayload>) {
    const { id, data, hotelId, resolve, reject } = action.payload;
    try {
        yield put(promoCodesActions.updatePromoCodeRequest());
        const result: PromoCode = yield call(updatePromoCodeApi, id, data);
        yield put(promoCodesActions.updatePromoCodeSuccess());
        toast.success('Promo code has been updated');

        // Re-fetch promo codes (cache invalidation)
        yield put({ type: FETCH_PROMO_CODES, payload: { hotelId } });

        resolve?.(result);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to update promo code');
        yield put(promoCodesActions.updatePromoCodeFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* deletePromoCodeWorker(action: PayloadAction<DeletePromoCodePayload>) {
    const { id, hotelId, resolve, reject } = action.payload;
    try {
        yield put(promoCodesActions.deletePromoCodeRequest());
        yield call(deletePromoCodeApi, id);
        yield put(promoCodesActions.deletePromoCodeSuccess());
        toast.success('Promo code has been deleted');

        // Re-fetch promo codes (cache invalidation)
        yield put({ type: FETCH_PROMO_CODES, payload: { hotelId } });

        resolve?.(undefined);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to delete promo code');
        yield put(promoCodesActions.deletePromoCodeFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

// --- Root saga ---

export function* promoCodesSaga() {
    yield takeLatest(FETCH_PROMO_CODES, fetchPromoCodesWorker);
    yield takeLatest(VALIDATE_PROMO_CODE, validatePromoCodeWorker);
    yield takeEvery(CREATE_PROMO_CODE, createPromoCodeWorker);
    yield takeEvery(UPDATE_PROMO_CODE, updatePromoCodeWorker);
    yield takeEvery(DELETE_PROMO_CODE, deletePromoCodeWorker);
}
