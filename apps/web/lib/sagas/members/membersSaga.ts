import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Member } from '@/lib/auth-client';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { membersActions, MemberWithUserWithRole } from '@/lib/reducers/members/membersSlice';
import { UserWithRole } from 'better-auth/plugins';

// ============================================================================
// Action Types
// ============================================================================

export const FETCH_MEMBERS = 'members/saga/fetchMembers';
export const UPDATE_MEMBER_ROLE = 'members/saga/updateMemberRole';
export const REMOVE_MEMBER = 'members/saga/removeMember';

// ============================================================================
// Payload Interfaces
// ============================================================================

interface FetchMembersPayload {
    organizationId: string;
}

interface UpdateMemberRolePayload {
    organizationId: string;
    memberId: string;
    role: string;
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

interface RemoveMemberPayload {
    organizationId: string;
    memberIdOrEmail: string;
    resolve?: (value: unknown) => void;
    reject?: (error: Error) => void;
}

// ============================================================================
// Async Functions
// ============================================================================

async function fetchMembersList(organizationId: string): Promise<MemberWithUserWithRole[]> {
    const request = await authClient.organization.listMembers({
        query: { organizationId },
    });
    if (request.error) {
        throw new Error(request.error.message || 'Failed to fetch members');
    }
    const members = await Promise.all(
        (request.data?.members ?? []).map(async (member) => {
            const user = await authClient.admin.getUser({
                query: { id: member.userId },
            });
            return {
                ...member,
                user: user.data as UserWithRole,
            };
        }),
    );
    // better-auth returns Date objects for createdAt/updatedAt — serialize for Redux
    return JSON.parse(JSON.stringify(members)) as MemberWithUserWithRole[];
}

async function updateMemberRoleApi(
    memberId: string,
    role: string,
    organizationId: string,
): Promise<unknown> {
    const response = await authClient.organization.updateMemberRole({
        memberId,
        role,
        organizationId,
    });
    if (response.error) {
        throw new Error(response.error.message || 'Failed to update role');
    }
    return response.data;
}

async function removeMemberApi(
    memberIdOrEmail: string,
    organizationId: string,
): Promise<unknown> {
    const response = await authClient.organization.removeMember({
        memberIdOrEmail,
        organizationId,
    });
    if (response.error) {
        throw new Error(response.error.message || 'Failed to remove member');
    }
    return response.data;
}

// ============================================================================
// Workers
// ============================================================================

function* fetchMembersWorker(action: PayloadAction<FetchMembersPayload>) {
    const { organizationId } = action.payload;
    try {
        yield put(membersActions.fetchMembersRequest());
        const data: MemberWithUserWithRole[] = yield call(fetchMembersList, organizationId);
        yield put(membersActions.fetchMembersSuccess(data));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch members';
        yield put(membersActions.fetchMembersFailure(message));
    }
}

function* updateMemberRoleWorker(action: PayloadAction<UpdateMemberRolePayload>) {
    const { organizationId, memberId, role, resolve, reject } = action.payload;
    try {
        yield put(membersActions.updateRoleRequest());
        const data: unknown = yield call(updateMemberRoleApi, memberId, role, organizationId);
        yield put(membersActions.updateRoleSuccess());
        toast.success('Member role updated');

        // Cache invalidation
        yield put({ type: FETCH_MEMBERS, payload: { organizationId } });

        resolve?.(data);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to update role');
        yield put(membersActions.updateRoleFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

function* removeMemberWorker(action: PayloadAction<RemoveMemberPayload>) {
    const { organizationId, memberIdOrEmail, resolve, reject } = action.payload;
    try {
        yield put(membersActions.removeRequest());
        const data: unknown = yield call(removeMemberApi, memberIdOrEmail, organizationId);
        yield put(membersActions.removeSuccess());
        toast.success('Member removed successfully');

        // Cache invalidation
        yield put({ type: FETCH_MEMBERS, payload: { organizationId } });

        resolve?.(data);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to remove member');
        yield put(membersActions.removeFailure(err.message));
        toast.error(err.message);
        reject?.(err);
    }
}

// ============================================================================
// Root Saga
// ============================================================================

export function* membersSaga() {
    yield takeLatest(FETCH_MEMBERS, fetchMembersWorker);
    yield takeEvery(UPDATE_MEMBER_ROLE, updateMemberRoleWorker);
    yield takeEvery(REMOVE_MEMBER, removeMemberWorker);
}
