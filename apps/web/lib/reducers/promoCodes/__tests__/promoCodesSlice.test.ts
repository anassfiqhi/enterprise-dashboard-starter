import reducer, { promoCodesActions } from '../promoCodesSlice';
import { mockPromoCodes } from '@/__mocks__/fixtures/pricing';

describe('promoCodesSlice', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('returns correct initial state', () => {
    expect(initialState).toMatchObject({
      list: { status: 'idle', data: [], error: null },
      validation: { status: 'idle', data: null, error: null },
      createStatus: 'idle',
      updateStatus: 'idle',
      deleteStatus: 'idle',
      mutationError: null,
    });
  });

  describe('fetchPromoCodes', () => {
    it('sets loading', () => {
      expect(reducer(initialState, promoCodesActions.fetchPromoCodesRequest()).list.status).toBe(
        'loading'
      );
    });

    it('stores promo codes on success', () => {
      const state = reducer(initialState, promoCodesActions.fetchPromoCodesSuccess(mockPromoCodes));
      expect(state.list.status).toBe('succeeded');
      expect(state.list.data).toEqual(mockPromoCodes);
    });

    it('stores error on failure', () => {
      const state = reducer(initialState, promoCodesActions.fetchPromoCodesFailure('Error'));
      expect(state.list.status).toBe('failed');
    });
  });

  describe('validatePromoCode', () => {
    it('sets loading', () => {
      expect(
        reducer(initialState, promoCodesActions.validatePromoCodeRequest()).validation.status
      ).toBe('loading');
    });

    it('stores result on success', () => {
      const result = { valid: true, promo: mockPromoCodes[0], discountAmount: 10, finalAmount: 90 };
      const state = reducer(initialState, promoCodesActions.validatePromoCodeSuccess(result));
      expect(state.validation.status).toBe('succeeded');
      expect(state.validation.data).toEqual(result);
    });

    it('stores error on failure', () => {
      const state = reducer(
        initialState,
        promoCodesActions.validatePromoCodeFailure('Invalid code')
      );
      expect(state.validation.status).toBe('failed');
    });
  });

  describe('createPromoCode', () => {
    it('sets loading', () => {
      expect(reducer(initialState, promoCodesActions.createPromoCodeRequest()).createStatus).toBe(
        'loading'
      );
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, promoCodesActions.createPromoCodeSuccess()).createStatus).toBe(
        'succeeded'
      );
    });

    it('sets failed with error', () => {
      const state = reducer(
        initialState,
        promoCodesActions.createPromoCodeFailure('Duplicate code')
      );
      expect(state.createStatus).toBe('failed');
      expect(state.mutationError).toBe('Duplicate code');
    });
  });

  describe('updatePromoCode', () => {
    it('sets loading', () => {
      expect(reducer(initialState, promoCodesActions.updatePromoCodeRequest()).updateStatus).toBe(
        'loading'
      );
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, promoCodesActions.updatePromoCodeSuccess()).updateStatus).toBe(
        'succeeded'
      );
    });

    it('sets failed', () => {
      const state = reducer(initialState, promoCodesActions.updatePromoCodeFailure('Error'));
      expect(state.updateStatus).toBe('failed');
    });
  });

  describe('deletePromoCode', () => {
    it('sets loading', () => {
      expect(reducer(initialState, promoCodesActions.deletePromoCodeRequest()).deleteStatus).toBe(
        'loading'
      );
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, promoCodesActions.deletePromoCodeSuccess()).deleteStatus).toBe(
        'succeeded'
      );
    });
  });

  describe('resetMutationStatus', () => {
    it('resets all mutation statuses', () => {
      let state = reducer(initialState, promoCodesActions.createPromoCodeFailure('Error'));
      state = reducer(state, promoCodesActions.resetMutationStatus());
      expect(state.createStatus).toBe('idle');
      expect(state.updateStatus).toBe('idle');
      expect(state.deleteStatus).toBe('idle');
      expect(state.mutationError).toBeNull();
    });
  });
});
