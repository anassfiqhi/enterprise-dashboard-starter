import reducer, { setSession, setUser } from '../authSlice';

describe('authSlice', () => {
  it('returns correct initial state', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
  });

  it('stores session on setSession', () => {
    const session = { id: 'sess_1', userId: 'user_1', token: 'tok', expiresAt: new Date() };
    const state = reducer(undefined, setSession(session as Parameters<typeof setSession>[0]));
    expect(state.session).toEqual(session);
  });

  it('stores user on setUser', () => {
    const user = {
      id: 'user_1',
      email: 'test@example.com',
      name: 'Test',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isAdmin: false,
    };
    const state = reducer(undefined, setUser(user as Parameters<typeof setUser>[0]));
    expect(state.user).toEqual(user);
  });
});
