import { call, put } from 'redux-saga/effects';
import {
  fetchAdminUsersWorker,
  fetchAdminUserWorker,
  toggleSuperAdminWorker,
  fetchUserMembershipsWorker,
  addUserToOrgWorker,
  updateAdminMemberRoleWorker,
  removeUserFromOrgWorker,
  fetchAdminOrganizationsWorker,
  FETCH_ADMIN_USERS,
  FETCH_USER_MEMBERSHIPS,
  fetchAdminUsersList,
  fetchAdminUser,
  toggleSuperAdminApi,
  fetchUserMembershipsApi,
  addUserToOrgApi,
  updateMemberRoleApi,
  removeUserFromOrgApi,
  fetchAdminOrganizationsList,
} from '../adminSaga';
import { adminActions } from '@/lib/reducers/admin/adminSlice';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    admin: { listUsers: jest.fn(), getUser: jest.fn(), updateUser: jest.fn(), setRole: jest.fn() },
  },
}));
jest.mock('@/lib/api/apiClient', () => ({ apiRequest: jest.fn() }));

describe('fetchAdminUsersWorker', () => {
  const action = {
    type: FETCH_ADMIN_USERS,
    payload: { search: 'test', limit: 20, offset: 0 },
  } as Parameters<typeof fetchAdminUsersWorker>[0];

  it('happy path', () => {
    const gen = fetchAdminUsersWorker(action);
    expect(gen.next().value).toEqual(put(adminActions.fetchUsersRequest()));
    expect(gen.next().value).toEqual(call(fetchAdminUsersList, 'test', 20, 0));
    const mockData = {
      users: [{ id: 'u1', name: 'Test', email: 'test@x.com', createdAt: '' }],
      total: 1,
    };
    expect(gen.next(mockData).value).toEqual(put(adminActions.fetchUsersSuccess(mockData)));
    expect(gen.next().done).toBe(true);
  });

  it('error path', () => {
    const gen = fetchAdminUsersWorker(action);
    gen.next(); // put request
    gen.next(); // call
    const result = gen.throw(new Error('Network error'));
    expect(result.value).toEqual(put(adminActions.fetchUsersFailure('Network error')));
    expect(gen.next().done).toBe(true);
  });
});

describe('fetchAdminUserWorker', () => {
  const action = { type: 'admin/saga/fetchUser', payload: { userId: 'u1' } } as Parameters<
    typeof fetchAdminUserWorker
  >[0];

  it('happy path', () => {
    const gen = fetchAdminUserWorker(action);
    expect(gen.next().value).toEqual(put(adminActions.fetchUserRequest()));
    expect(gen.next().value).toEqual(call(fetchAdminUser, 'u1'));
    const mockUser = { id: 'u1', name: 'Test', email: 'test@x.com', createdAt: '' };
    expect(gen.next(mockUser).value).toEqual(put(adminActions.fetchUserSuccess(mockUser)));
    expect(gen.next().done).toBe(true);
  });

  it('error path', () => {
    const gen = fetchAdminUserWorker(action);
    gen.next();
    gen.next();
    expect(gen.throw(new Error('fail')).value).toEqual(put(adminActions.fetchUserFailure('fail')));
  });
});

describe('toggleSuperAdminWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const action = {
    type: 'admin/saga/toggleSuperAdmin',
    payload: { userId: 'u1', isAdmin: true, resolve, reject },
  } as Parameters<typeof toggleSuperAdminWorker>[0];

  beforeEach(() => jest.clearAllMocks());

  it('happy path: calls resolve', () => {
    const gen = toggleSuperAdminWorker(action);
    expect(gen.next().value).toEqual(put(adminActions.toggleSuperAdminRequest()));
    expect(gen.next().value).toEqual(call(toggleSuperAdminApi, 'u1', true));
    const mockData = {};
    expect(gen.next(mockData).value).toEqual(put(adminActions.toggleSuperAdminSuccess()));
    expect(gen.next().value).toEqual(put({ type: FETCH_ADMIN_USERS, payload: {} }));
    gen.next(); // resolve
    expect(resolve).toHaveBeenCalledWith(mockData);
  });

  it('error path: calls reject', () => {
    const gen = toggleSuperAdminWorker(action);
    gen.next();
    gen.next();
    const err = new Error('Access denied');
    gen.throw(err);
    gen.next(); // toast.error
    gen.next(); // reject
    expect(reject).toHaveBeenCalledWith(err);
  });
});

describe('fetchUserMembershipsWorker', () => {
  const action = {
    type: 'admin/saga/fetchUserMemberships',
    payload: { userId: 'u1' },
  } as Parameters<typeof fetchUserMembershipsWorker>[0];

  it('happy path', () => {
    const gen = fetchUserMembershipsWorker(action);
    expect(gen.next().value).toEqual(put(adminActions.fetchMembershipsRequest()));
    expect(gen.next().value).toEqual(call(fetchUserMembershipsApi, 'u1'));
    const mockMemberships = [
      {
        id: 'm1',
        role: 'admin',
        createdAt: '',
        organizationId: 'org1',
        organizationName: 'Org',
        organizationSlug: 'org',
      },
    ];
    expect(gen.next(mockMemberships).value).toEqual(
      put(adminActions.fetchMembershipsSuccess(mockMemberships))
    );
    expect(gen.next().done).toBe(true);
  });

  it('error path', () => {
    const gen = fetchUserMembershipsWorker(action);
    gen.next();
    gen.next();
    expect(gen.throw(new Error('err')).value).toEqual(
      put(adminActions.fetchMembershipsFailure('err'))
    );
  });
});

describe('addUserToOrgWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const action = {
    type: 'admin/saga/addUserToOrg',
    payload: { userId: 'u1', organizationId: 'org1', role: 'admin' as const, resolve, reject },
  };

  beforeEach(() => jest.clearAllMocks());

  it('happy path', () => {
    const gen = addUserToOrgWorker(action);
    expect(gen.next().value).toEqual(put(adminActions.addToOrgRequest()));
    expect(gen.next().value).toEqual(call(addUserToOrgApi, 'u1', 'org1', 'admin'));
    const data = {};
    expect(gen.next(data).value).toEqual(put(adminActions.addToOrgSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_USER_MEMBERSHIPS, payload: { userId: 'u1' } })
    );
    expect(gen.next().value).toEqual(put({ type: FETCH_ADMIN_USERS, payload: {} }));
    gen.next(); // resolve
    expect(resolve).toHaveBeenCalledWith(data);
  });

  it('error path', () => {
    const gen = addUserToOrgWorker(action);
    gen.next();
    gen.next();
    const err = new Error('fail');
    gen.throw(err);
    gen.next();
    gen.next();
    expect(reject).toHaveBeenCalledWith(err);
  });
});

describe('updateAdminMemberRoleWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const action = {
    type: 'admin/saga/updateMemberRole',
    payload: { userId: 'u1', membershipId: 'm1', role: 'staff' as const, resolve, reject },
  };

  beforeEach(() => jest.clearAllMocks());

  it('happy path', () => {
    const gen = updateAdminMemberRoleWorker(action);
    expect(gen.next().value).toEqual(put(adminActions.updateRoleRequest()));
    expect(gen.next().value).toEqual(call(updateMemberRoleApi, 'u1', 'm1', 'staff'));
    const data = {};
    expect(gen.next(data).value).toEqual(put(adminActions.updateRoleSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_USER_MEMBERSHIPS, payload: { userId: 'u1' } })
    );
    gen.next(); // resolve
    expect(resolve).toHaveBeenCalledWith(data);
  });
});

describe('removeUserFromOrgWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const action = {
    type: 'admin/saga/removeUserFromOrg',
    payload: { userId: 'u1', membershipId: 'm1', resolve, reject },
  };

  beforeEach(() => jest.clearAllMocks());

  it('happy path', () => {
    const gen = removeUserFromOrgWorker(action);
    expect(gen.next().value).toEqual(put(adminActions.removeFromOrgRequest()));
    expect(gen.next().value).toEqual(call(removeUserFromOrgApi, 'u1', 'm1'));
    const data = {};
    expect(gen.next(data).value).toEqual(put(adminActions.removeFromOrgSuccess()));
    expect(gen.next().value).toEqual(
      put({ type: FETCH_USER_MEMBERSHIPS, payload: { userId: 'u1' } })
    );
    expect(gen.next().value).toEqual(put({ type: FETCH_ADMIN_USERS, payload: {} }));
    gen.next();
    expect(resolve).toHaveBeenCalledWith(data);
  });
});

describe('fetchAdminOrganizationsWorker', () => {
  it('happy path', () => {
    const gen = fetchAdminOrganizationsWorker();
    expect(gen.next().value).toEqual(put(adminActions.fetchOrganizationsRequest()));
    expect(gen.next().value).toEqual(call(fetchAdminOrganizationsList));
    const mockOrgs = [{ id: 'org1', name: 'Org', slug: 'org' }];
    expect(gen.next(mockOrgs).value).toEqual(put(adminActions.fetchOrganizationsSuccess(mockOrgs)));
    expect(gen.next().done).toBe(true);
  });

  it('error path', () => {
    const gen = fetchAdminOrganizationsWorker();
    gen.next();
    gen.next();
    expect(gen.throw(new Error('err')).value).toEqual(
      put(adminActions.fetchOrganizationsFailure('err'))
    );
  });
});
