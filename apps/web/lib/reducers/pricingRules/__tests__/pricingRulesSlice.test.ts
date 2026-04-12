import reducer, { pricingRulesActions } from '../pricingRulesSlice';
import { mockPricingRules } from '@/__mocks__/fixtures/pricing';

describe('pricingRulesSlice', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('returns correct initial state', () => {
    expect(initialState).toMatchObject({
      list: { status: 'idle', data: [], error: null },
      createStatus: 'idle',
      updateStatus: 'idle',
      deleteStatus: 'idle',
    });
  });

  describe('fetchPricingRules', () => {
    it('sets loading', () => {
      expect(reducer(initialState, pricingRulesActions.fetchRequest()).list.status).toBe('loading');
    });

    it('stores rules on success', () => {
      const state = reducer(initialState, pricingRulesActions.fetchSuccess(mockPricingRules));
      expect(state.list.status).toBe('succeeded');
      expect(state.list.data).toEqual(mockPricingRules);
    });

    it('stores error on failure', () => {
      const state = reducer(initialState, pricingRulesActions.fetchFailure('Error'));
      expect(state.list.status).toBe('failed');
    });
  });

  describe('createPricingRule', () => {
    it('sets loading', () => {
      expect(reducer(initialState, pricingRulesActions.createRequest()).createStatus).toBe(
        'loading'
      );
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, pricingRulesActions.createSuccess()).createStatus).toBe(
        'succeeded'
      );
    });

    it('sets failed', () => {
      const state = reducer(initialState, pricingRulesActions.createFailure('Error'));
      expect(state.createStatus).toBe('failed');
    });
  });

  describe('deletePricingRule', () => {
    it('sets loading', () => {
      expect(reducer(initialState, pricingRulesActions.deleteRequest()).deleteStatus).toBe(
        'loading'
      );
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, pricingRulesActions.deleteSuccess()).deleteStatus).toBe(
        'succeeded'
      );
    });
  });
});
