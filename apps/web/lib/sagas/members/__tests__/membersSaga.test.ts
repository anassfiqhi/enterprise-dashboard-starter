import { call, put } from 'redux-saga/effects';
import {
  fetchMembersWorker,
  updateMemberRoleWorker,
  removeMemberWorker,
  FETCH_MEMBERS,
  fetchMembersList,
  updateMemberRoleApi,
  removeMemberApi,
} from '../membersSaga';
import { membersActions } from '@/lib/reducers/members/membersSlice';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    organization: { listMembers: jest.fn(), removeMember: jest.fn(), updateMemberRole: jest.fn() },
    admin: { getUser: jest.fn() },
  },
}));

const mockMembers = [
  {
    id: 'm1',
    userId: 'u1',
    role: 'manager' as const,
    organizationId: 'org_1',
    createdAt: new Date('2026-01-01'),
    user: { id: 'u1', name: 'Alice', email: 'alice@test.com' },
  },
];

describe('fetchMembersWorker', () => {
  const action = { type: FETCH_MEMBERS, payload: { organizationId: 'org_1' } };

  it('happy path', () => {
    const gen = fetchMembersWorker(action as Parameters<typeof fetchMembersWorker>[0]);
    expect(gen.next().value).toEqual(put(membersActions.fetchMembersRequest()));
    expect(gen.next().value).toEqual(call(fetchMembersList, 'org_1'));
    expect(
      gen.next(mockMembers as unknown as Parameters<typeof membersActions.fetchMembersSuccess>[0])
        .value
    ).toEqual(
      put(
        membersActions.fetchMembersSuccess(
          mockMembers as unknown as Parameters<typeof membersActions.fetchMembersSuccess>[0]
        )
      )
    );
    expect(gen.next().done).toBe(true);
  });

  it('error path', () => {
    const gen = fetchMembersWorker(action as Parameters<typeof fetchMembersWorker>[0]);
    gen.next();
    gen.next();
    expect(gen.throw(new Error('Access denied')).value).toEqual(
      put(membersActions.fetchMembersFailure('Access denied'))
    );
  });
});

describe('updateMemberRoleWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const action = {
    type: 'update',
    payload: { organizationId: 'org_1', memberId: 'm1', role: 'manager', resolve, reject },
  };

  beforeEach(() => jest.clearAllMocks());

  it('happy path: puts success, invalidates cache, calls resolve', () => {
    const gen = updateMemberRoleWorker(action as Parameters<typeof updateMemberRoleWorker>[0]);
    expect(gen.next().value).toEqual(put(membersActions.updateRoleRequest()));
    expect(gen.next().value).toEqual(call(updateMemberRoleApi, 'm1', 'manager', 'org_1'));
    expect(gen.next({}).value).toEqual(put(membersActions.updateRoleSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_MEMBERS, payload: { organizationId: 'org_1' } })
    );
    gen.next();
    expect(resolve).toHaveBeenCalled();
  });

  it('error path: puts failure, calls reject', () => {
    const gen = updateMemberRoleWorker(action as Parameters<typeof updateMemberRoleWorker>[0]);
    gen.next();
    gen.next();
    const err = new Error('Forbidden');
    expect(gen.throw(err).value).toEqual(put(membersActions.updateRoleFailure('Forbidden')));
    gen.next();
    expect(reject).toHaveBeenCalledWith(err);
  });
});

describe('removeMemberWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const action = {
    type: 'remove',
    payload: { organizationId: 'org_1', memberIdOrEmail: 'm1', resolve, reject },
  };

  beforeEach(() => jest.clearAllMocks());

  it('happy path', () => {
    const gen = removeMemberWorker(action as Parameters<typeof removeMemberWorker>[0]);
    expect(gen.next().value).toEqual(put(membersActions.removeRequest()));
    expect(gen.next().value).toEqual(call(removeMemberApi, 'm1', 'org_1'));
    expect(gen.next({}).value).toEqual(put(membersActions.removeSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_MEMBERS, payload: { organizationId: 'org_1' } })
    );
    gen.next();
    expect(resolve).toHaveBeenCalled();
  });
});
