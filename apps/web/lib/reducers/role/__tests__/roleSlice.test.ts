import reducer, { roleActions } from '../roleSlice';

describe('roleSlice', () => {
  it('returns correct initial state', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.status).toBe('idle');
    expect(state.data).toBeNull();
    expect(state.error).toBeNull();
  });

  it('sets status to loading on fetchRoleRequest', () => {
    const state = reducer(undefined, roleActions.fetchRoleRequest());
    expect(state.status).toBe('loading');
  });

  it('stores role on fetchRoleSuccess', () => {
    const state = reducer(undefined, roleActions.fetchRoleSuccess('admin'));
    expect(state.status).toBe('succeeded');
    expect(state.data).toBe('admin');
  });

  it('stores error on fetchRoleFailure', () => {
    const state = reducer(undefined, roleActions.fetchRoleFailure('Unauthorized'));
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Unauthorized');
  });
});
