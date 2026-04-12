import { renderHook } from '@testing-library/react';
import { useAdminOrganizations } from '../useAdminOrganizations';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { FETCH_ADMIN_ORGANIZATIONS } from '@/lib/sagas/admin/adminSaga';
import { mockAdminOrgs } from '@/__mocks__/fixtures/admin';

describe('useAdminOrganizations hook', () => {
  it('dispatches FETCH_ADMIN_ORGANIZATIONS', () => {
    const store = createTestStore();
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    renderHook(() => useAdminOrganizations(), { wrapper });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: FETCH_ADMIN_ORGANIZATIONS,
    });
  });

  it('selects data', () => {
    const store = createTestStore({
      admin: {
        organizations: { status: 'succeeded', data: mockAdminOrgs, totalData: 2, error: null },
        users: { status: 'idle', data: [], totalData: 0, error: null },
      },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useAdminOrganizations(), { wrapper });
    expect(result.current.data).toEqual(mockAdminOrgs);
  });
});
