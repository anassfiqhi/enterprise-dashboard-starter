import { renderHook } from '@testing-library/react';
import { useGuests } from '../useGuests';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { FETCH_GUESTS } from '@/lib/sagas/guests/guestsSaga';

describe('useGuests hook', () => {
  it('dispatches FETCH_GUESTS on mount with hotelId', () => {
    const store = createTestStore({
      auth: { activeOrganizationId: 'org_1' },
    });
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    renderHook(() => useGuests({ search: 'search', page: 1, pageSize: 20 }), { wrapper });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: FETCH_GUESTS,
      payload: { hotelId: 'org_1', search: 'search', page: 1, pageSize: 20 },
    });
  });

  it('returns data from state', () => {
    const mockGuests = [{ id: 'guest_1', firstName: 'Alice' }];
    const store = createTestStore({
      guests: {
        list: { status: 'succeeded', data: { items: mockGuests, meta: {} }, error: null },
      },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useGuests(), { wrapper });
    expect(result.current.data.data).toEqual(mockGuests);
    expect(result.current.isSuccess).toBe(true);
  });
});
