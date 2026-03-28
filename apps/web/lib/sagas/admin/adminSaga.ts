import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authClient } from '@/lib/auth-client';
import { apiRequest } from '@/lib/api/apiClient';
import { toast } from 'sonner';
import {
    adminActions,
    type AdminUser,
    type AdminOrganization,
    type Membership,
} from '@/lib/reducers/admin/adminSlice';

// ============================================================================
// Action Types
// ============================================================================

export const FETCH_ADMIN_USERS = 'admin/saga/fetchUsers';
export const FETCH_ADMIN_USER = 'admin/saga/fetchUser';
export const TOGGLE_SUPER_ADMIN = 'admin/saga/toggleSuperAdmin';
export const FETCH_USER_MEMBERSHIPS = 'admin/saga/fetchUserMemberships';
export const ADD_USER_TO_ORG = 'admin/saga/addUserToOrg';
export const UPDATE_ADMIN_MEMBER_ROLE = 'admin/saga/updateMemberRole';
export const REMOVE_USER_FROM_ORG = 'admin/saga/removeUserFromOrg';
export const FETCH_ADMIN_ORGANIZATIONS = 'admin/saga/fetchOrganizations';

// ============================================================================
// Payload Interfaces
// ============================================================================

interface FetchAdminUsersPayload {
    search?: string;
    limit?: number;
    offset?: number;
}

interface FetchAdminUserPayload {
    userId: string;
}

interface ToggleSuperAdminPayload {
    userId: string;
    isAdmin: boolean;
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

interface FetchUserMembershipsPayload {
    userId: string;
}

interface AddUserToOrgPayload {
    userId: string;
    organizationId: string;
    role: 'admin' | 'staff';
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

interface UpdateAdminMemberRolePayload {
    userId: string;
    membershipId: string;
    role: 'admin' | 'staff';
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

interface RemoveUserFromOrgPayload {
    userId: string;
    membershipId: string;
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

// ============================================================================
// Async Functions
// ============================================================================

async function fetchAdminUsersList(
    search?: string,
    limit = 20,
    offset = 0,
): Promise<{ users: AdminUser[]; total: number }> {
    const query: Record<string, string | number> = { limit, offset };
    if (search) {
        query.searchValue = search;
        query.searchField = 'email';
    }
    const response = await authClient.admin.listUsers({ query });
    if (response.error) {
        throw new Error(response.error.message || 'Failed to list users');
    }
    return response.data as unknown as { users: AdminUser[]; total: number };
}

async function fetchAdminUser(userId: string): Promise<AdminUser> {
    const response = await authClient.admin.getUser({ query: { id: userId } });
    if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch user');
    }
    return response.data as unknown as AdminUser;
}

async function toggleSuperAdminApi(userId: string, isAdmin: boolean): Promise<unknown> {
    const updateRes = await authClient.admin.updateUser({
        userId,
        data: { isAdmin },
    });
    if (updateRes.error) {
        throw new Error(updateRes.error.message || 'Failed to update user');
    }

    const roleRes = await authClient.admin.setRole({
        userId,
        role: isAdmin ? 'admin' : 'user',
    });
    if (roleRes.error) {
        throw new Error(roleRes.error.message || 'Failed to set role');
    }

    return updateRes.data;
}

async function fetchUserMembershipsApi(userId: string): Promise<Membership[]> {
    return apiRequest<{ memberships: Membership[] }>(
        `/api/v1/admin/users/${userId}/memberships`,
    ).then((data) => data.memberships);
}

async function addUserToOrgApi(
    userId: string,
    organizationId: string,
    role: 'admin' | 'staff',
): Promise<unknown> {
    return apiRequest(`/api/v1/admin/users/${userId}/memberships`, {
        method: 'POST',
        body: { organizationId, role },
    });
}

async function updateMemberRoleApi(
    userId: string,
    membershipId: string,
    role: 'admin' | 'staff',
): Promise<unknown> {
    return apiRequest(`/api/v1/admin/users/${userId}/memberships/${membershipId}`, {
        method: 'PATCH',
        body: { role },
    });
}

async function removeUserFromOrgApi(
    userId: string,
    membershipId: string,
): Promise<unknown> {
    return apiRequest(`/api/v1/admin/users/${userId}/memberships/${membershipId}`, {
        method: 'DELETE',
    });
}

async function fetchAdminOrganizationsList(): Promise<AdminOrganization[]> {
    return apiRequest<{ organizations: AdminOrganization[] }>(
        '/api/v1/admin/organizations',
    ).then((data) => data.organizations);
}

// ============================================================================
// Workers
// ============================================================================

function* fetchAdminUsersWorker(action: PayloadAction<FetchAdminUsersPayload>) {
    const { search, limit, offset } = action.payload;
    try {
        yield put(adminActions.fetchUsersRequest());
        const data: { users: AdminUser[]; total: number } = yield call(
            fetchAdminUsersList,
            search,
            limit,
            offset,
        );
        yield put(adminActions.fetchUsersSuccess(data));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to list users';
        yield put(adminActions.fetchUsersFailure(message));
    }
}

function* fetchAdminUserWorker(action: PayloadAction<FetchAdminUserPayload>) {
    const { userId } = action.payload;
    try {
        yield put(adminActions.fetchUserRequest());
        const data: AdminUser = yield call(fetchAdminUser, userId);
        yield put(adminActions.fetchUserSuccess(data));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch user';
        yield put(adminActions.fetchUserFailure(message));
    }
}

function* toggleSuperAdminWorker(action: PayloadAction<ToggleSuperAdminPayload>) {
    const { userId, isAdmin, resolve, reject } = action.payload;
    try {
        yield put(adminActions.toggleSuperAdminRequest());
        const data: unknown = yield call(toggleSuperAdminApi, userId, isAdmin);
        yield put(adminActions.toggleSuperAdminSuccess());
        toast.success(
            isAdmin ? 'Super Admin access granted' : 'Super Admin access revoked',
        );

        // Cache invalidation
        yield put({ type: FETCH_ADMIN_USERS, payload: {} });

        resolve?.(data);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to update super admin status');
        yield put(adminActions.toggleSuperAdminFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* fetchUserMembershipsWorker(action: PayloadAction<FetchUserMembershipsPayload>) {
    const { userId } = action.payload;
    try {
        yield put(adminActions.fetchMembershipsRequest());
        const data: Membership[] = yield call(fetchUserMembershipsApi, userId);
        yield put(adminActions.fetchMembershipsSuccess(data));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch memberships';
        yield put(adminActions.fetchMembershipsFailure(message));
    }
}

function* addUserToOrgWorker(action: PayloadAction<AddUserToOrgPayload>) {
    const { userId, organizationId, role, resolve, reject } = action.payload;
    try {
        yield put(adminActions.addToOrgRequest());
        const data: unknown = yield call(addUserToOrgApi, userId, organizationId, role);
        yield put(adminActions.addToOrgSuccess());
        toast.success('User added to organization');

        // Cache invalidation
        yield put({ type: FETCH_USER_MEMBERSHIPS, payload: { userId } });
        yield put({ type: FETCH_ADMIN_USERS, payload: {} });

        resolve?.(data);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to add user to organization');
        yield put(adminActions.addToOrgFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* updateAdminMemberRoleWorker(action: PayloadAction<UpdateAdminMemberRolePayload>) {
    const { userId, membershipId, role, resolve, reject } = action.payload;
    try {
        yield put(adminActions.updateRoleRequest());
        const data: unknown = yield call(updateMemberRoleApi, userId, membershipId, role);
        yield put(adminActions.updateRoleSuccess());
        toast.success('Member role updated');

        // Cache invalidation
        yield put({ type: FETCH_USER_MEMBERSHIPS, payload: { userId } });

        resolve?.(data);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to update role');
        yield put(adminActions.updateRoleFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* removeUserFromOrgWorker(action: PayloadAction<RemoveUserFromOrgPayload>) {
    const { userId, membershipId, resolve, reject } = action.payload;
    try {
        yield put(adminActions.removeFromOrgRequest());
        const data: unknown = yield call(removeUserFromOrgApi, userId, membershipId);
        yield put(adminActions.removeFromOrgSuccess());
        toast.success('User removed from organization');

        // Cache invalidation
        yield put({ type: FETCH_USER_MEMBERSHIPS, payload: { userId } });
        yield put({ type: FETCH_ADMIN_USERS, payload: {} });

        resolve?.(data);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to remove from organization');
        yield put(adminActions.removeFromOrgFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* fetchAdminOrganizationsWorker() {
    try {
        yield put(adminActions.fetchOrganizationsRequest());
        const data: AdminOrganization[] = yield call(fetchAdminOrganizationsList);
        yield put(adminActions.fetchOrganizationsSuccess(data));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch organizations';
        yield put(adminActions.fetchOrganizationsFailure(message));
    }
}

// ============================================================================
// Root Saga
// ============================================================================

export function* adminSaga() {
    yield takeLatest(FETCH_ADMIN_USERS, fetchAdminUsersWorker);
    yield takeLatest(FETCH_ADMIN_USER, fetchAdminUserWorker);
    yield takeEvery(TOGGLE_SUPER_ADMIN, toggleSuperAdminWorker);
    yield takeLatest(FETCH_USER_MEMBERSHIPS, fetchUserMembershipsWorker);
    yield takeEvery(ADD_USER_TO_ORG, addUserToOrgWorker);
    yield takeEvery(UPDATE_ADMIN_MEMBER_ROLE, updateAdminMemberRoleWorker);
    yield takeEvery(REMOVE_USER_FROM_ORG, removeUserFromOrgWorker);
    yield takeLatest(FETCH_ADMIN_ORGANIZATIONS, fetchAdminOrganizationsWorker);
}
