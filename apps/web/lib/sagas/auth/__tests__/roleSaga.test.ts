import { call, put } from 'redux-saga/effects';
import { fetchRoleWorker, fetchRole } from '../roleSaga';
import { roleActions } from '@/lib/reducers/role/roleSlice';

jest.mock('@/lib/auth-client', () => ({
  authClient: {
    getSession: jest.fn(),
    organization: { getActiveMemberRole: jest.fn() },
  },
}));

describe('fetchRoleWorker', () => {
  it('happy path: put request → call fetchRole fn → put success', () => {
    const gen = fetchRoleWorker();
    expect(gen.next().value).toEqual(put(roleActions.fetchRoleRequest()));
    expect(gen.next().value).toEqual(call(fetchRole));
    expect(gen.next('admin').value).toEqual(put(roleActions.fetchRoleSuccess('admin')));
    expect(gen.next().done).toBe(true);
  });

  it('error path: puts failure', () => {
    const gen = fetchRoleWorker();
    gen.next();
    gen.next();
    expect(gen.throw(new Error('Unauthorized')).value).toEqual(
      put(roleActions.fetchRoleFailure('Unauthorized'))
    );
    expect(gen.next().done).toBe(true);
  });
});
