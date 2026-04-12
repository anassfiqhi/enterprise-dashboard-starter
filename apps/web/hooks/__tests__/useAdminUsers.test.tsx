import { renderHook } from '@testing-library/react';
import { useAdminUsers } from '../useAdminUsers';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { FETCH_ADMIN_USERS } from '@/lib/sagas/admin/adminSaga';
import { mockAdminUsers } from '@/__mocks__/fixtures/admin';

describe('useAdminUsers hook', () => {
  it('dispatches FETCH_ADMIN_USERS', () => {
    const store = createTestStore();
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    renderHook(() => useAdminUsers({ search: 'search', limit: 10, offset: 0 }), { wrapper });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: FETCH_ADMIN_USERS,
      payload: { search: 'search', limit: 10, offset: 0 },
    });
  });

  it('selects data', () => {
    const store = createTestStore({
      admin: {
        organizations: { status: 'idle', data: [], totalData: 0, error: null },
        users: { status: 'succeeded', data: mockAdminUsers, totalData: 2, error: null },
      },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useAdminUsers(), { wrapper });
    expect(result.current.data).toEqual(mockAdminUsers);
  });
});
