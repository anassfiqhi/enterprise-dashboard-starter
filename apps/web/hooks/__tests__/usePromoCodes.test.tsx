import { renderHook } from '@testing-library/react';
import { usePromoCodes } from '../usePromoCodes';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { FETCH_PROMO_CODES } from '@/lib/sagas/promoCodes/promoCodesSaga';
import { mockPromoCodes } from '@/__mocks__/fixtures/promoCodes';

describe('usePromoCodes hook', () => {
  it('dispatches FETCH_PROMO_CODES', () => {
    const store = createTestStore({
      auth: { activeOrganizationId: 'org_1' },
    });
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    renderHook(() => usePromoCodes({ search: 'S20', status: 'ACTIVE' }), { wrapper });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: FETCH_PROMO_CODES,
      payload: { hotelId: 'org_1', search: 'S20', status: 'ACTIVE' },
    });
  });

  it('returns data', () => {
    const store = createTestStore({
      promoCodes: {
        list: { status: 'succeeded', data: mockPromoCodes, error: null },
      },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => usePromoCodes(), { wrapper });
    expect(result.current.data).toEqual(mockPromoCodes);
  });
});
