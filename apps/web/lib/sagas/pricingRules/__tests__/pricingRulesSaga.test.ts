import { call, put } from 'redux-saga/effects';
import {
  fetchPricingRulesWorker,
  createPricingRuleWorker,
  updatePricingRuleWorker,
  deletePricingRuleWorker,
  FETCH_PRICING_RULES,
  fetchPricingRulesApi,
  createPricingRuleApi,
  updatePricingRuleApi,
  deletePricingRuleApi,
} from '../pricingRulesSaga';
import { pricingRulesActions } from '@/lib/reducers/pricingRules/pricingRulesSlice';
import { mockPricingRules } from '@/__mocks__/fixtures/pricing';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/api/apiClient', () => ({ apiRequest: jest.fn() }));

describe('fetchPricingRulesWorker', () => {
  const action = {
    type: FETCH_PRICING_RULES,
    payload: { hotelId: 'hotel_1' },
  } as Parameters<typeof fetchPricingRulesWorker>[0];

  it('happy path', () => {
    const gen = fetchPricingRulesWorker(action);
    expect(gen.next().value).toEqual(put(pricingRulesActions.fetchRequest()));
    expect(gen.next().value).toEqual(call(fetchPricingRulesApi, 'hotel_1'));
    expect(gen.next(mockPricingRules).value).toEqual(
      put(pricingRulesActions.fetchSuccess(mockPricingRules))
    );
    expect(gen.next().done).toBe(true);
  });

  it('error path', () => {
    const gen = fetchPricingRulesWorker(action);
    gen.next();
    gen.next();
    expect(gen.throw(new Error('err')).value).toEqual(put(pricingRulesActions.fetchFailure('err')));
  });
});

describe('createPricingRuleWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const body = {
    id: 'pr_new',
    name: 'Holiday Rate',
    amountType: 'DELTA_PERCENT' as const,
    amount: 25,
    currency: 'USD',
    priority: 1,
    isActive: true,
  };
  const action = {
    type: 'pricingRules/saga/createPricingRule',
    payload: { hotelId: 'hotel_1', body, resolve, reject },
  } as Parameters<typeof createPricingRuleWorker>[0];

  beforeEach(() => jest.clearAllMocks());

  it('happy path', () => {
    const gen = createPricingRuleWorker(action);
    expect(gen.next().value).toEqual(put(pricingRulesActions.createRequest()));
    expect(gen.next().value).toEqual(call(createPricingRuleApi, 'hotel_1', body));
    const result = { hotelId: 'hotel_1', ...body };
    expect(gen.next(result).value).toEqual(put(pricingRulesActions.createSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_PRICING_RULES, payload: { hotelId: 'hotel_1' } })
    );
    gen.next();
    expect(resolve).toHaveBeenCalledWith(result);
  });

  it('error path', () => {
    const gen = createPricingRuleWorker(action);
    gen.next();
    gen.next();
    const err = new Error('invalid');
    gen.throw(err);
    gen.next();
    gen.next();
    expect(reject).toHaveBeenCalledWith(err);
  });
});

describe('updatePricingRuleWorker', () => {
  const resolve = jest.fn();
  const action = {
    type: 'pricingRules/saga/updatePricingRule',
    payload: { hotelId: 'hotel_1', id: 'pr_1', body: { amount: 30 }, resolve },
  } as Parameters<typeof updatePricingRuleWorker>[0];

  beforeEach(() => jest.clearAllMocks());

  it('happy path', () => {
    const gen = updatePricingRuleWorker(action);
    expect(gen.next().value).toEqual(put(pricingRulesActions.updateRequest()));
    expect(gen.next().value).toEqual(call(updatePricingRuleApi, 'hotel_1', 'pr_1', { amount: 30 }));
    const result = { ...mockPricingRules[0], amount: 30 };
    expect(gen.next(result).value).toEqual(put(pricingRulesActions.updateSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_PRICING_RULES, payload: { hotelId: 'hotel_1' } })
    );
    gen.next();
    expect(resolve).toHaveBeenCalledWith(result);
  });
});

describe('deletePricingRuleWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const action = {
    type: 'pricingRules/saga/deletePricingRule',
    payload: { hotelId: 'hotel_1', id: 'pr_1', resolve, reject },
  } as Parameters<typeof deletePricingRuleWorker>[0];

  beforeEach(() => jest.clearAllMocks());

  it('happy path', () => {
    const gen = deletePricingRuleWorker(action);
    expect(gen.next().value).toEqual(put(pricingRulesActions.deleteRequest()));
    expect(gen.next().value).toEqual(call(deletePricingRuleApi, 'hotel_1', 'pr_1'));
    expect(gen.next().value).toEqual(put(pricingRulesActions.deleteSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_PRICING_RULES, payload: { hotelId: 'hotel_1' } })
    );
    gen.next();
    expect(resolve).toHaveBeenCalledWith(undefined);
  });

  it('error path', () => {
    const gen = deletePricingRuleWorker(action);
    gen.next();
    gen.next();
    const err = new Error('constraint');
    gen.throw(err);
    gen.next();
    gen.next();
    expect(reject).toHaveBeenCalledWith(err);
  });
});
