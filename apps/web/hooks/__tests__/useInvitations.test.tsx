import { renderHook } from '@testing-library/react';
import { useInvitations, useInviteMember, useCancelInvitation } from '../useInvitations';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import {
  FETCH_INVITATIONS,
  INVITE_MEMBER,
  CANCEL_INVITATION,
} from '@/lib/sagas/invitations/invitationsSaga';

jest.mock('@/lib/auth-client', () => ({
  authClient: {
    useActiveOrganization: () => ({ data: { id: 'org_1' } }),
  },
}));

describe('useInvitations hooks', () => {
  describe('useInvitations', () => {
    it('dispatches FETCH_INVITATIONS', () => {
      const store = createTestStore();
      jest.spyOn(store, 'dispatch');
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );
      renderHook(() => useInvitations(), { wrapper });
      expect(store.dispatch).toHaveBeenCalledWith({
        type: FETCH_INVITATIONS,
        payload: { organizationId: 'org_1' },
      });
    });
  });

  describe('useInviteMember', () => {
    it('dispatches INVITE_MEMBER mutateAsync', () => {
      const store = createTestStore();
      jest.spyOn(store, 'dispatch');
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );
      const { result } = renderHook(() => useInviteMember(), { wrapper });

      result.current.mutateAsync({ email: 'test@test.com', role: 'admin' });
      expect(store.dispatch).toHaveBeenCalledWith({
        type: INVITE_MEMBER,
        payload: {
          organizationId: 'org_1',
          email: 'test@test.com',
          role: 'admin',
          resolve: expect.any(Function),
          reject: expect.any(Function),
        },
      });
    });
  });

  describe('useCancelInvitation', () => {
    it('dispatches CANCEL_INVITATION mutateAsync', () => {
      const store = createTestStore();
      jest.spyOn(store, 'dispatch');
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );
      const { result } = renderHook(() => useCancelInvitation(), { wrapper });

      result.current.mutateAsync({ invitationId: 'inv_1' });
      expect(store.dispatch).toHaveBeenCalledWith({
        type: CANCEL_INVITATION,
        payload: {
          organizationId: 'org_1',
          invitationId: 'inv_1',
          resolve: expect.any(Function),
          reject: expect.any(Function),
        },
      });
    });
  });
});
