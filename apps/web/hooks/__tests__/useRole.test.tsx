import { renderHook } from '@testing-library/react';
import { useRole } from '../useRole';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { FETCH_ROLE } from '@/lib/sagas/auth/roleSaga';

describe('useRole hook', () => {
  it('dispatches FETCH_ROLE if status is idle', () => {
    const store = createTestStore({
      role: { status: 'idle', data: null, error: null },
    });
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useRole(), { wrapper });

    expect(store.dispatch).toHaveBeenCalledWith({ type: FETCH_ROLE });
  });

  it('returns role data from state', () => {
    const mockRole = { permissions: [] };
    const store = createTestStore({
      role: { status: 'succeeded', data: mockRole, error: null },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useRole(), { wrapper });

    expect(result.current.data).toEqual(mockRole);
    expect(result.current.isSuccess).toBe(true);
  });
});
