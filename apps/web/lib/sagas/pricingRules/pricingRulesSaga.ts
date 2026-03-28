import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PricingRule } from '@repo/shared';
import { toast } from 'sonner';
import { pricingRulesActions } from '@/lib/reducers/pricingRules/pricingRulesSlice';
import { apiRequest } from '@/lib/api/apiClient';

export const FETCH_PRICING_RULES = 'pricingRules/saga/fetchPricingRules';
export const CREATE_PRICING_RULE = 'pricingRules/saga/createPricingRule';
export const UPDATE_PRICING_RULE = 'pricingRules/saga/updatePricingRule';
export const DELETE_PRICING_RULE = 'pricingRules/saga/deletePricingRule';

interface FetchPricingRulesPayload {
    hotelId: string;
}

interface CreatePricingRulePayload {
    hotelId: string;
    body: Omit<PricingRule, 'hotelId'>;
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

interface UpdatePricingRulePayload {
    hotelId: string;
    id: string;
    body: Partial<PricingRule>;
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

interface DeletePricingRulePayload {
    hotelId: string;
    id: string;
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

async function fetchPricingRulesApi(hotelId: string): Promise<PricingRule[]> {
    return apiRequest<PricingRule[]>(`/api/v1/hotels/${hotelId}/pricing-rules`);
}

async function createPricingRuleApi(hotelId: string, body: Omit<PricingRule, 'hotelId'>): Promise<PricingRule> {
    return apiRequest<PricingRule>(`/api/v1/hotels/${hotelId}/pricing-rules`, {
        method: 'POST',
        body,
    });
}

async function updatePricingRuleApi(hotelId: string, id: string, body: Partial<PricingRule>): Promise<PricingRule> {
    return apiRequest<PricingRule>(`/api/v1/hotels/${hotelId}/pricing-rules/${id}`, {
        method: 'PATCH',
        body,
    });
}

async function deletePricingRuleApi(hotelId: string, id: string): Promise<void> {
    return apiRequest<void>(`/api/v1/hotels/${hotelId}/pricing-rules/${id}`, {
        method: 'DELETE',
    });
}

function* fetchPricingRulesWorker(action: PayloadAction<FetchPricingRulesPayload>) {
    try {
        yield put(pricingRulesActions.fetchRequest());
        const data: PricingRule[] = yield call(fetchPricingRulesApi, action.payload.hotelId);
        yield put(pricingRulesActions.fetchSuccess(data));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch pricing rules';
        yield put(pricingRulesActions.fetchFailure(message));
    }
}

function* createPricingRuleWorker(action: PayloadAction<CreatePricingRulePayload>) {
    const { hotelId, body, resolve, reject } = action.payload;
    try {
        yield put(pricingRulesActions.createRequest());
        const result: PricingRule = yield call(createPricingRuleApi, hotelId, body);
        yield put(pricingRulesActions.createSuccess());
        toast.success(`"${result.name}" has been created`);

        yield put({ type: FETCH_PRICING_RULES, payload: { hotelId } });

        resolve?.(result);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to create pricing rule');
        yield put(pricingRulesActions.createFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* updatePricingRuleWorker(action: PayloadAction<UpdatePricingRulePayload>) {
    const { hotelId, id, body, resolve, reject } = action.payload;
    try {
        yield put(pricingRulesActions.updateRequest());
        const result: PricingRule = yield call(updatePricingRuleApi, hotelId, id, body);
        yield put(pricingRulesActions.updateSuccess());
        toast.success('Pricing rule has been updated');

        yield put({ type: FETCH_PRICING_RULES, payload: { hotelId } });

        resolve?.(result);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to update pricing rule');
        yield put(pricingRulesActions.updateFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* deletePricingRuleWorker(action: PayloadAction<DeletePricingRulePayload>) {
    const { hotelId, id, resolve, reject } = action.payload;
    try {
        yield put(pricingRulesActions.deleteRequest());
        yield call(deletePricingRuleApi, hotelId, id);
        yield put(pricingRulesActions.deleteSuccess());
        toast.success('Pricing rule has been deleted');

        yield put({ type: FETCH_PRICING_RULES, payload: { hotelId } });

        resolve?.(undefined);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to delete pricing rule');
        yield put(pricingRulesActions.deleteFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

export function* pricingRulesSaga() {
    yield takeLatest(FETCH_PRICING_RULES, fetchPricingRulesWorker);
    yield takeEvery(CREATE_PRICING_RULE, createPricingRuleWorker);
    yield takeEvery(UPDATE_PRICING_RULE, updatePricingRuleWorker);
    yield takeEvery(DELETE_PRICING_RULE, deletePricingRuleWorker);
}
