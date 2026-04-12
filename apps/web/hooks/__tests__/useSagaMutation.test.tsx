import { renderHook, act } from '@testing-library/react';
import { useSagaMutation } from '../useSagaMutation';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { RootState } from '@/lib/store';

describe('useSagaMutation', () => {
  const actionType = 'TEST_ACTION';
  // Use a real slice key that exists in rootReducer
  const statusSelector = (state: RootState) => state.auth.user?.id;
  const buildPayload = (input: string) => ({ value: input });
  const resetAction = () => ({ type: 'RESET_TEST' });

  it('dispatches the correct action with mutate', () => {
    const store = createTestStore();
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(
      () => useSagaMutation({ actionType, statusSelector, buildPayload, resetAction }),
      { wrapper }
    );

    result.current.mutate('hello');

    expect(store.dispatch).toHaveBeenCalledWith({
      type: actionType,
      payload: { value: 'hello' },
    });
  });

  it('dispatches with resolve/reject with mutateAsync', async () => {
    const store = createTestStore();
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(
      () => useSagaMutation({ actionType, statusSelector, buildPayload, resetAction }),
      { wrapper }
    );

    act(() => {
      result.current.mutateAsync('world');
    });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: actionType,
      payload: {
        value: 'world',
        resolve: expect.any(Function),
        reject: expect.any(Function),
      },
    });
  });

  it('derives status correctly from selector', () => {
    // We use inviteStatus from invitations slice as it definitely exists and has 'loading' status
    const invitationsStatusSelector = (state: RootState) => state.invitations.inviteStatus;
    const store = createTestStore({
      invitations: { inviteStatus: 'loading' },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(
      () =>
        useSagaMutation({ actionType, statusSelector: invitationsStatusSelector, buildPayload }),
      { wrapper }
    );

    expect(result.current.isPending).toBe(true);
    expect(result.current.isSuccess).toBe(false);
  });

  it('calls resetAction when reset is called', () => {
    const store = createTestStore();
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(
      () => useSagaMutation({ actionType, statusSelector, buildPayload, resetAction }),
      { wrapper }
    );

    result.current.reset?.();

    expect(store.dispatch).toHaveBeenCalledWith({ type: 'RESET_TEST' });
  });
});
