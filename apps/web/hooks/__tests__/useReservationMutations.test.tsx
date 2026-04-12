import { renderHook, act } from '@testing-library/react';
import { useReservationMutations } from '../useReservationMutations';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { CREATE_RESERVATION, CANCEL_RESERVATION } from '@/lib/sagas/reservations/reservationsSaga';

describe('useReservationMutations', () => {
  it('dispatches CREATE_RESERVATION', async () => {
    const store = createTestStore({
      auth: { activeOrganizationId: 'org_1' },
    });
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useReservationMutations(), { wrapper });

    const input = { hotelId: 'h1', guestId: 'g1', guests: 2 };
    await act(async () => {
      result.current.createReservation.mutateAsync(
        input as Parameters<(typeof result.current.createReservation)['mutateAsync']>[0]
      );
    });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: CREATE_RESERVATION,
      payload: {
        input,
        hotelId: 'org_1',
        resolve: expect.any(Function),
        reject: expect.any(Function),
      },
    });
  });

  it('dispatches CANCEL_RESERVATION', async () => {
    const store = createTestStore({
      auth: { activeOrganizationId: 'org_1' },
    });
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useReservationMutations(), { wrapper });

    await act(async () => {
      result.current.cancel.mutateAsync({ id: 'res1', reason: 'User requested' });
    });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: CANCEL_RESERVATION,
      payload: {
        id: 'res1',
        reason: 'User requested',
        hotelId: 'org_1',
        resolve: expect.any(Function),
        reject: expect.any(Function),
      },
    });
  });
});
