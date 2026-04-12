import { call, put, takeLatest } from 'redux-saga/effects';
import { authClient } from '@/lib/auth-client';
import { roleActions } from '@/lib/reducers/role/roleSlice';

export const FETCH_ROLE = 'role/saga/fetchRole';

export async function fetchRole(): Promise<string> {
  const sessionRes = await authClient.getSession();
  if (sessionRes.error) {
    throw new Error(sessionRes.error.message);
  }
  if (!sessionRes.data) {
    throw new Error('Failed to fetch session');
  }

  if (sessionRes.data.user.role === 'admin') {
    return sessionRes.data.user.role;
  }

  const roleRes = await authClient.organization.getActiveMemberRole();
  if (roleRes.error) {
    throw new Error(roleRes.error.message);
  }
  if (roleRes.data?.role) {
    return roleRes.data.role;
  }

  throw new Error('Failed to fetch role');
}

export function* fetchRoleWorker() {
  try {
    yield put(roleActions.fetchRoleRequest());
    const role: string = yield call(fetchRole);
    yield put(roleActions.fetchRoleSuccess(role));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch role';
    yield put(roleActions.fetchRoleFailure(message));
  }
}

export function* roleSaga() {
  yield takeLatest(FETCH_ROLE, fetchRoleWorker);
}
