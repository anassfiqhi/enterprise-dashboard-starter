import { renderHook, act } from '@testing-library/react';
import { useGuestMutations } from '../useGuestMutations';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { CREATE_GUEST, UPDATE_GUEST, DELETE_GUEST } from '@/lib/sagas/guests/guestsSaga';

describe('useGuestMutations', () => {
  it('dispatches CREATE_GUEST', async () => {
    const store = createTestStore({
      auth: { activeOrganizationId: 'org_1' },
    });
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useGuestMutations(), { wrapper });

    const input = { firstName: 'John', lastName: 'Doe' };
    await act(async () => {
      result.current.createGuest.mutateAsync(input);
    });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: CREATE_GUEST,
      payload: {
        input,
        hotelId: 'org_1',
        resolve: expect.any(Function),
        reject: expect.any(Function),
      },
    });
  });

  it('dispatches UPDATE_GUEST', async () => {
    const store = createTestStore({
      auth: { activeOrganizationId: 'org_1' },
    });
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useGuestMutations(), { wrapper });

    await act(async () => {
      result.current.updateGuest.mutateAsync({ id: 'g1', firstName: 'Jack' });
    });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: UPDATE_GUEST,
      payload: {
        guestId: 'g1',
        input: { firstName: 'Jack' },
        hotelId: 'org_1',
        resolve: expect.any(Function),
        reject: expect.any(Function),
      },
    });
  });

  it('dispatches DELETE_GUEST', async () => {
    const store = createTestStore({
      auth: { activeOrganizationId: 'org_1' },
    });
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useGuestMutations(), { wrapper });

    await act(async () => {
      result.current.deleteGuest.mutateAsync('g1');
    });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: DELETE_GUEST,
      payload: {
        guestId: 'g1',
        hotelId: 'org_1',
        resolve: expect.any(Function),
        reject: expect.any(Function),
      },
    });
  });
});
