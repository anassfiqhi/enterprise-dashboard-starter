import { renderHook, act } from '@testing-library/react';
import { usePricingRules, usePricingRuleMutations } from '../usePricingRules';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import {
  FETCH_PRICING_RULES,
  CREATE_PRICING_RULE,
} from '@/lib/sagas/pricingRules/pricingRulesSaga';

describe('usePricingRules hooks', () => {
  describe('usePricingRules', () => {
    it('dispatches FETCH_PRICING_RULES', () => {
      const store = createTestStore();
      jest.spyOn(store, 'dispatch');
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );
      renderHook(() => usePricingRules('h1'), { wrapper });
      expect(store.dispatch).toHaveBeenCalledWith({
        type: FETCH_PRICING_RULES,
        payload: { hotelId: 'h1' },
      });
    });
  });

  describe('usePricingRuleMutations', () => {
    it('dispatches CREATE_PRICING_RULE', async () => {
      const store = createTestStore();
      jest.spyOn(store, 'dispatch');
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );
      const { result } = renderHook(() => usePricingRuleMutations(), { wrapper });

      const input = {
        hotelId: 'h1',
        name: 'Rule 1',
        amount: 10,
        amountType: 'FIXED',
        currency: 'USD',
        priority: 1,
        isActive: true,
      };
      await act(async () => {
        result.current.createPricingRule.mutateAsync(
          input as Parameters<(typeof result.current.createPricingRule)['mutateAsync']>[0]
        );
      });

      expect(store.dispatch).toHaveBeenCalledWith({
        type: CREATE_PRICING_RULE,
        payload: {
          hotelId: 'h1',
          body: {
            name: 'Rule 1',
            amount: 10,
            amountType: 'FIXED',
            currency: 'USD',
            priority: 1,
            isActive: true,
          },
          resolve: expect.any(Function),
          reject: expect.any(Function),
        },
      });
    });
  });
});
