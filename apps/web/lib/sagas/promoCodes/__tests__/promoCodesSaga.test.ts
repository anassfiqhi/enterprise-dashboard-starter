import { call, put } from 'redux-saga/effects';
import {
  fetchPromoCodesWorker,
  validatePromoCodeWorker,
  createPromoCodeWorker,
  updatePromoCodeWorker,
  deletePromoCodeWorker,
  FETCH_PROMO_CODES,
  fetchPromoCodesApi,
  validatePromoCodeApi,
  createPromoCodeApi,
  updatePromoCodeApi,
  deletePromoCodeApi,
} from '../promoCodesSaga';
import { promoCodesActions } from '@/lib/reducers/promoCodes/promoCodesSlice';
import { mockPromoCodes } from '@/__mocks__/fixtures/pricing';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/api/apiClient', () => ({ apiRequest: jest.fn() }));
jest.mock('@/lib/config', () => ({ config: { apiUrl: 'http://localhost:3001' } }));

describe('fetchPromoCodesWorker', () => {
  const action = { type: FETCH_PROMO_CODES, payload: { hotelId: 'hotel_1' } } as Parameters<
    typeof fetchPromoCodesWorker
  >[0];

  it('happy path', () => {
    const gen = fetchPromoCodesWorker(action);
    expect(gen.next().value).toEqual(put(promoCodesActions.fetchPromoCodesRequest()));
    expect(gen.next().value).toEqual(call(fetchPromoCodesApi, action.payload));
    expect(gen.next(mockPromoCodes).value).toEqual(
      put(promoCodesActions.fetchPromoCodesSuccess(mockPromoCodes))
    );
    expect(gen.next().done).toBe(true);
  });

  it('error path', () => {
    const gen = fetchPromoCodesWorker(action);
    gen.next();
    gen.next();
    expect(gen.throw(new Error('fail')).value).toEqual(
      put(promoCodesActions.fetchPromoCodesFailure('fail'))
    );
  });
});

describe('validatePromoCodeWorker', () => {
  const action = {
    type: 'promoCodes/saga/validatePromoCode',
    payload: { code: 'SUMMER20', amount: 100, hotelId: 'hotel_1' },
  };

  it('happy path', () => {
    const gen = validatePromoCodeWorker(action);
    expect(gen.next().value).toEqual(put(promoCodesActions.validatePromoCodeRequest()));
    expect(gen.next().value).toEqual(call(validatePromoCodeApi, action.payload));
    const result = { valid: true, discountAmount: 20, finalAmount: 80 };
    expect(gen.next(result).value).toEqual(put(promoCodesActions.validatePromoCodeSuccess(result)));
    expect(gen.next().done).toBe(true);
  });

  it('error path', () => {
    const gen = validatePromoCodeWorker(action);
    gen.next();
    gen.next();
    expect(gen.throw(new Error('err')).value).toEqual(
      put(promoCodesActions.validatePromoCodeFailure('err'))
    );
  });
});

describe('createPromoCodeWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const action = {
    type: 'promoCodes/saga/createPromoCode',
    payload: {
      hotelId: 'hotel_1',
      input: {
        code: 'NEW10',
        discountType: 'PERCENTAGE' as const,
        discountValue: 10,
        isActive: true,
      },
      resolve,
      reject,
    },
  };

  beforeEach(() => jest.clearAllMocks());

  it('happy path: calls resolve and invalidates cache', () => {
    const gen = createPromoCodeWorker(action);
    expect(gen.next().value).toEqual(put(promoCodesActions.createPromoCodeRequest()));
    expect(gen.next().value).toEqual(call(createPromoCodeApi, 'hotel_1', action.payload.input));
    const result = { ...mockPromoCodes[0], code: 'NEW10' };
    expect(gen.next(result).value).toEqual(put(promoCodesActions.createPromoCodeSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_PROMO_CODES, payload: { hotelId: 'hotel_1' } })
    );
    gen.next();
    expect(resolve).toHaveBeenCalledWith(result);
  });

  it('error path: calls reject', () => {
    const gen = createPromoCodeWorker(action);
    gen.next();
    gen.next();
    const err = new Error('duplicate');
    gen.throw(err);
    gen.next();
    gen.next();
    expect(reject).toHaveBeenCalledWith(err);
  });
});

describe('updatePromoCodeWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const action = {
    type: 'promoCodes/saga/updatePromoCode',
    payload: { id: 'pc_1', data: { isActive: false }, hotelId: 'hotel_1', resolve, reject },
  };

  beforeEach(() => jest.clearAllMocks());

  it('happy path', () => {
    const gen = updatePromoCodeWorker(action);
    expect(gen.next().value).toEqual(put(promoCodesActions.updatePromoCodeRequest()));
    expect(gen.next().value).toEqual(call(updatePromoCodeApi, 'pc_1', { isActive: false }));
    const result = { ...mockPromoCodes[0], isActive: false };
    expect(gen.next(result).value).toEqual(put(promoCodesActions.updatePromoCodeSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_PROMO_CODES, payload: { hotelId: 'hotel_1' } })
    );
    gen.next();
    expect(resolve).toHaveBeenCalledWith(result);
  });
});

describe('deletePromoCodeWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const action = {
    type: 'promoCodes/saga/deletePromoCode',
    payload: { id: 'pc_1', hotelId: 'hotel_1', resolve, reject },
  };

  beforeEach(() => jest.clearAllMocks());

  it('happy path', () => {
    const gen = deletePromoCodeWorker(action);
    expect(gen.next().value).toEqual(put(promoCodesActions.deletePromoCodeRequest()));
    expect(gen.next().value).toEqual(call(deletePromoCodeApi, 'pc_1'));
    expect(gen.next().value).toEqual(put(promoCodesActions.deletePromoCodeSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_PROMO_CODES, payload: { hotelId: 'hotel_1' } })
    );
    gen.next();
    expect(resolve).toHaveBeenCalledWith(undefined);
  });

  it('error path', () => {
    const gen = deletePromoCodeWorker(action);
    gen.next();
    gen.next();
    const err = new Error('not found');
    gen.throw(err);
    gen.next();
    gen.next();
    expect(reject).toHaveBeenCalledWith(err);
  });
});
