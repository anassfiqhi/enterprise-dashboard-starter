import { call, put } from 'redux-saga/effects';
import {
  fetchInvitationsWorker,
  inviteMemberWorker,
  cancelInvitationWorker,
  FETCH_INVITATIONS,
  fetchInvitationsList,
  inviteMemberApi,
  cancelInvitationApi,
} from '../invitationsSaga';
import { invitationsActions } from '@/lib/reducers/invitations/invitationsSlice';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    organization: {
      listInvitations: jest.fn(),
      inviteMember: jest.fn(),
      cancelInvitation: jest.fn(),
    },
  },
}));

const mockInvitations = [
  {
    id: 'inv_1',
    email: 'new@test.com',
    role: 'staff',
    status: 'pending',
    organizationId: 'org_1',
    inviterId: 'u_1',
    expiresAt: '2027-01-01',
  },
];

describe('fetchInvitationsWorker', () => {
  const action = { type: FETCH_INVITATIONS, payload: { organizationId: 'org_1' } };

  it('happy path', () => {
    const gen = fetchInvitationsWorker(action as Parameters<typeof fetchInvitationsWorker>[0]);
    expect(gen.next().value).toEqual(put(invitationsActions.fetchInvitationsRequest()));
    expect(gen.next().value).toEqual(call(fetchInvitationsList, 'org_1'));
    expect(gen.next(mockInvitations).value).toEqual(
      put(
        invitationsActions.fetchInvitationsSuccess(
          mockInvitations as unknown as Parameters<
            typeof invitationsActions.fetchInvitationsSuccess
          >[0]
        )
      )
    );
    expect(gen.next().done).toBe(true);
  });

  it('error path', () => {
    const gen = fetchInvitationsWorker(action as Parameters<typeof fetchInvitationsWorker>[0]);
    gen.next();
    gen.next();
    expect(gen.throw(new Error('Failed')).value).toEqual(
      put(invitationsActions.fetchInvitationsFailure('Failed'))
    );
  });
});

describe('inviteMemberWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const action = {
    type: 'invite',
    payload: { organizationId: 'org_1', email: 'new@test.com', role: 'staff', resolve, reject },
  };

  beforeEach(() => jest.clearAllMocks());

  it('happy path', () => {
    const gen = inviteMemberWorker(action as Parameters<typeof inviteMemberWorker>[0]);
    expect(gen.next().value).toEqual(put(invitationsActions.inviteRequest()));
    expect(gen.next().value).toEqual(call(inviteMemberApi, 'new@test.com', 'staff', 'org_1'));
    expect(gen.next({}).value).toEqual(put(invitationsActions.inviteSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_INVITATIONS, payload: { organizationId: 'org_1' } })
    );
    gen.next();
    expect(resolve).toHaveBeenCalled();
  });

  it('error path: puts failure with message, calls reject', () => {
    const gen = inviteMemberWorker(action as Parameters<typeof inviteMemberWorker>[0]);
    gen.next();
    gen.next();
    const err = new Error('Already invited');
    expect(gen.throw(err).value).toEqual(put(invitationsActions.inviteFailure('Already invited')));
    gen.next();
    expect(reject).toHaveBeenCalledWith(err);
  });
});

describe('cancelInvitationWorker', () => {
  const resolve = jest.fn();
  const action = {
    type: 'cancel',
    payload: { organizationId: 'org_1', invitationId: 'inv_1', resolve, reject: jest.fn() },
  };

  it('happy path: puts cancelSuccess, dispatches cache invalidation', () => {
    const gen = cancelInvitationWorker(action as Parameters<typeof cancelInvitationWorker>[0]);
    expect(gen.next().value).toEqual(put(invitationsActions.cancelRequest()));
    expect(gen.next().value).toEqual(call(cancelInvitationApi, 'inv_1'));
    expect(gen.next({}).value).toEqual(put(invitationsActions.cancelSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_INVITATIONS, payload: { organizationId: 'org_1' } })
    );
    gen.next();
    expect(resolve).toHaveBeenCalled();
  });
});
