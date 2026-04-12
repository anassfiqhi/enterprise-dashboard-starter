import { renderHook } from '@testing-library/react';
import { useGuest } from '../useGuest';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { FETCH_GUEST } from '@/lib/sagas/guests/guestsSaga';

describe('useGuest hook', () => {
  it('dispatches FETCH_GUEST with proper args', () => {
    const store = createTestStore();
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    renderHook(() => useGuest('g_1'), { wrapper });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: FETCH_GUEST,
      payload: { guestId: 'g_1' },
    });
  });

  it('returns data from state', () => {
    const mockGuest = { id: 'g_1', firstName: 'John' };
    const store = createTestStore({
      guests: {
        detail: { status: 'succeeded', data: mockGuest, error: null },
      },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useGuest('g_1'), { wrapper });
    expect(result.current.data).toEqual(mockGuest);
    expect(result.current.isSuccess).toBe(true);
  });
});
