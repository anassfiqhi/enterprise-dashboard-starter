import { renderHook } from '@testing-library/react';
import { useMembers, useUpdateMemberRole, useRemoveMember } from '../useMembers';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { FETCH_MEMBERS, UPDATE_MEMBER_ROLE, REMOVE_MEMBER } from '@/lib/sagas/members/membersSaga';

jest.mock('@/lib/auth-client', () => ({
  authClient: {
    useActiveOrganization: () => ({ data: { id: 'org_1' } }),
  },
}));

describe('useMembers hooks', () => {
  describe('useMembers', () => {
    it('dispatches FETCH_MEMBERS on mount', () => {
      const store = createTestStore();
      jest.spyOn(store, 'dispatch');
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );
      renderHook(() => useMembers(), { wrapper });
      expect(store.dispatch).toHaveBeenCalledWith({
        type: FETCH_MEMBERS,
        payload: { organizationId: 'org_1' },
      });
    });

    it('returns members from state', () => {
      const store = createTestStore({
        members: {
          list: { status: 'succeeded', data: [{ id: 'm1' }], error: null },
          updateRoleStatus: 'idle',
          removeStatus: 'idle',
          mutationError: null,
        },
      });
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );
      const { result } = renderHook(() => useMembers(), { wrapper });
      expect(result.current.data).toEqual([{ id: 'm1' }]);
    });
  });

  describe('useUpdateMemberRole', () => {
    it('dispatches UPDATE_MEMBER_ROLE mutateAsync', async () => {
      const store = createTestStore();
      jest.spyOn(store, 'dispatch');
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );
      const { result } = renderHook(() => useUpdateMemberRole(), { wrapper });

      result.current.mutateAsync({ memberId: 'm1', role: 'admin' });
      expect(store.dispatch).toHaveBeenCalledWith({
        type: UPDATE_MEMBER_ROLE,
        payload: {
          organizationId: 'org_1',
          memberId: 'm1',
          role: 'admin',
          resolve: expect.any(Function),
          reject: expect.any(Function),
        },
      });
    });
  });

  describe('useRemoveMember', () => {
    it('dispatches REMOVE_MEMBER mutateAsync', () => {
      const store = createTestStore();
      jest.spyOn(store, 'dispatch');
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );
      const { result } = renderHook(() => useRemoveMember(), { wrapper });

      result.current.mutateAsync({ memberIdOrEmail: 'm1' });
      expect(store.dispatch).toHaveBeenCalledWith({
        type: REMOVE_MEMBER,
        payload: {
          organizationId: 'org_1',
          memberIdOrEmail: 'm1',
          resolve: expect.any(Function),
          reject: expect.any(Function),
        },
      });
    });
  });
});
