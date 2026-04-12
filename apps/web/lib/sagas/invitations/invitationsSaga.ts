import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { invitationsActions, type Invitation } from '@/lib/reducers/invitations/invitationsSlice';

// ============================================================================
// Action Types
// ============================================================================

export const FETCH_INVITATIONS = 'invitations/saga/fetchInvitations';
export const INVITE_MEMBER = 'invitations/saga/inviteMember';
export const CANCEL_INVITATION = 'invitations/saga/cancelInvitation';

// ============================================================================
// Payload Interfaces
// ============================================================================

interface FetchInvitationsPayload {
  organizationId: string;
}

interface InviteMemberPayload {
  organizationId: string;
  email: string;
  role: string;
  resolve?: (value: unknown) => void;
  reject?: (error: Error) => void;
}

interface CancelInvitationPayload {
  organizationId: string;
  invitationId: string;
  resolve?: (value: unknown) => void;
  reject?: (error: Error) => void;
}

// ============================================================================
// Async Functions
// ============================================================================

export async function fetchInvitationsList(organizationId: string): Promise<Invitation[]> {
  const response = await authClient.organization.listInvitations({
    query: { organizationId },
  });
  if (response.error) {
    throw new Error(response.error.message || 'Failed to fetch invitations');
  }
  return (response.data || []) as unknown as Invitation[];
}

export async function inviteMemberApi(
  email: string,
  role: string,
  organizationId: string
): Promise<unknown> {
  const response = await authClient.organization.inviteMember({
    email,
    role: role as 'manager' | 'staff',
    organizationId,
  });
  if (response.error) {
    throw new Error(response.error.message || 'Failed to send invitation');
  }
  return response.data;
}

export async function cancelInvitationApi(invitationId: string): Promise<unknown> {
  const response = await authClient.organization.cancelInvitation({
    invitationId,
  });
  if (response.error) {
    throw new Error(response.error.message || 'Failed to cancel invitation');
  }
  return response.data;
}

// ============================================================================
// Workers
// ============================================================================

export function* fetchInvitationsWorker(action: PayloadAction<FetchInvitationsPayload>) {
  const { organizationId } = action.payload;
  try {
    yield put(invitationsActions.fetchInvitationsRequest());
    const data: Invitation[] = yield call(fetchInvitationsList, organizationId);
    yield put(invitationsActions.fetchInvitationsSuccess(data));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch invitations';
    yield put(invitationsActions.fetchInvitationsFailure(message));
  }
}

export function* inviteMemberWorker(action: PayloadAction<InviteMemberPayload>) {
  const { organizationId, email, role, resolve, reject } = action.payload;
  try {
    yield put(invitationsActions.inviteRequest());
    const data: unknown = yield call(inviteMemberApi, email, role, organizationId);
    yield put(invitationsActions.inviteSuccess());
    toast.success('Invitation sent successfully');

    // Cache invalidation
    yield put({ type: FETCH_INVITATIONS, payload: { organizationId } });

    resolve?.(data);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Failed to send invitation');
    yield put(invitationsActions.inviteFailure(err.message));
    toast.error(err.message);
    reject?.(err);
  }
}

export function* cancelInvitationWorker(action: PayloadAction<CancelInvitationPayload>) {
  const { organizationId, invitationId, resolve, reject } = action.payload;
  try {
    yield put(invitationsActions.cancelRequest());
    const data: unknown = yield call(cancelInvitationApi, invitationId);
    yield put(invitationsActions.cancelSuccess());
    toast.success('Invitation cancelled');

    // Cache invalidation
    yield put({ type: FETCH_INVITATIONS, payload: { organizationId } });

    resolve?.(data);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Failed to cancel invitation');
    yield put(invitationsActions.cancelFailure(err.message));
    toast.error(err.message);
    reject?.(err);
  }
}

// ============================================================================
// Root Saga
// ============================================================================

export function* invitationsSaga() {
  yield takeLatest(FETCH_INVITATIONS, fetchInvitationsWorker);
  yield takeEvery(INVITE_MEMBER, inviteMemberWorker);
  yield takeEvery(CANCEL_INVITATION, cancelInvitationWorker);
}
