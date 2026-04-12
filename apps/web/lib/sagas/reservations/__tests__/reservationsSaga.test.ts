import { call, put } from 'redux-saga/effects';
import {
  fetchReservationsWorker,
  fetchReservationWorker,
  createReservationWorker,
  updateReservationStatusWorker,
  cancelReservationWorker,
  refundReservationWorker,
  FETCH_RESERVATIONS,
  fetchReservationsList,
  fetchReservationDetail,
  createReservationApi,
  updateReservationStatusApi,
  cancelReservationApi,
  refundReservationApi,
} from '../reservationsSaga';
import { reservationsDataActions } from '@/lib/reducers/reservations/reservationsDataSlice';
import { mockReservations } from '@/__mocks__/fixtures/reservations';
import { FETCH_GUESTS } from '../../guests/guestsSaga';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/api/apiClient', () => ({
  apiRequest: jest.fn(),
  apiRequestWithMeta: jest.fn(),
}));

describe('fetchReservationsWorker', () => {
  const action = { type: FETCH_RESERVATIONS, payload: { hotelId: 'hotel_1' } };

  it('happy path', () => {
    const gen = fetchReservationsWorker(action as Parameters<typeof fetchReservationsWorker>[0]);
    const mockResult = {
      data: mockReservations,
      meta: { requestId: 'r1', total: 3, page: 1, pageSize: 20, totalPages: 1 },
    };
    expect(gen.next().value).toEqual(put(reservationsDataActions.fetchReservationsRequest()));
    expect(gen.next().value).toEqual(call(fetchReservationsList, action.payload));
    expect(gen.next(mockResult).value).toEqual(
      put(
        reservationsDataActions.fetchReservationsSuccess({
          items: mockResult.data,
          meta: mockResult.meta,
        })
      )
    );
    expect(gen.next().done).toBe(true);
  });

  it('error path', () => {
    const gen = fetchReservationsWorker(action as Parameters<typeof fetchReservationsWorker>[0]);
    gen.next();
    gen.next();
    expect(gen.throw(new Error('Server error')).value).toEqual(
      put(reservationsDataActions.fetchReservationsFailure('Server error'))
    );
  });
});

describe('fetchReservationWorker', () => {
  const action = { type: 'fetch', payload: { id: 'res_1' } };

  it('happy path', () => {
    const gen = fetchReservationWorker(action as Parameters<typeof fetchReservationWorker>[0]);
    expect(gen.next().value).toEqual(put(reservationsDataActions.fetchReservationRequest()));
    expect(gen.next().value).toEqual(call(fetchReservationDetail, 'res_1'));
    expect(gen.next(mockReservations[0]).value).toEqual(
      put(
        reservationsDataActions.fetchReservationSuccess(
          mockReservations[0] as unknown as Parameters<
            typeof reservationsDataActions.fetchReservationSuccess
          >[0]
        )
      )
    );
    expect(gen.next().done).toBe(true);
  });
});

describe('createReservationWorker', () => {
  const resolve = jest.fn();
  const reject = jest.fn();
  const input = { guestId: 'g1', roomTypeId: 'rt1', checkIn: '2026-05-01', checkOut: '2026-05-05' };
  const action = {
    type: 'create',
    payload: { input, hotelId: 'hotel_1', resolve, reject },
  };

  beforeEach(() => jest.clearAllMocks());

  it('happy path: puts success, two cache invalidations, calls resolve', () => {
    const gen = createReservationWorker(action as Parameters<typeof createReservationWorker>[0]);
    const mockRes = mockReservations[0];

    expect(gen.next().value).toEqual(put(reservationsDataActions.createReservationRequest()));
    expect(gen.next().value).toEqual(
      call(createReservationApi, input as Parameters<typeof createReservationApi>[0])
    );
    expect(gen.next(mockRes).value).toEqual(
      put(reservationsDataActions.createReservationSuccess())
    );
    expect(gen.next().value).toEqual(
      put({ type: FETCH_RESERVATIONS, payload: { hotelId: 'hotel_1' } })
    );
    expect(gen.next().value).toEqual(put({ type: FETCH_GUESTS, payload: { hotelId: 'hotel_1' } }));
    gen.next();
    expect(resolve).toHaveBeenCalledWith(mockRes);
  });

  it('error path', () => {
    const gen = createReservationWorker(action as Parameters<typeof createReservationWorker>[0]);
    gen.next();
    gen.next();
    const err = new Error('Room unavailable');
    expect(gen.throw(err).value).toEqual(
      put(reservationsDataActions.createReservationFailure('Room unavailable'))
    );
    gen.next();
    expect(reject).toHaveBeenCalledWith(err);
  });
});

describe('updateReservationStatusWorker', () => {
  const resolve = jest.fn();
  const action = {
    type: 'update',
    payload: {
      id: 'res_1',
      status: 'confirmed' as const,
      hotelId: 'hotel_1',
      resolve,
      reject: jest.fn(),
    },
  };

  it('happy path', () => {
    const gen = updateReservationStatusWorker(
      action as Parameters<typeof updateReservationStatusWorker>[0]
    );
    expect(gen.next().value).toEqual(put(reservationsDataActions.updateReservationStatusRequest()));
    expect(gen.next().value).toEqual(
      call(
        updateReservationStatusApi,
        'res_1',
        'confirmed' as Parameters<typeof updateReservationStatusApi>[1]
      )
    );
    expect(gen.next(mockReservations[1]).value).toEqual(
      put(reservationsDataActions.updateReservationStatusSuccess())
    );
    expect(gen.next().value).toEqual(
      put({ type: FETCH_RESERVATIONS, payload: { hotelId: 'hotel_1' } })
    );
    gen.next();
    expect(resolve).toHaveBeenCalledWith(mockReservations[1]);
  });
});

describe('cancelReservationWorker', () => {
  const resolve = jest.fn();
  const action = {
    type: 'cancel',
    payload: {
      id: 'res_1',
      reason: 'guest request',
      hotelId: 'hotel_1',
      resolve,
      reject: jest.fn(),
    },
  };

  it('happy path', () => {
    const gen = cancelReservationWorker(action as Parameters<typeof cancelReservationWorker>[0]);
    expect(gen.next().value).toEqual(put(reservationsDataActions.cancelReservationRequest()));
    expect(gen.next().value).toEqual(call(cancelReservationApi, 'res_1', 'guest request'));
    expect(gen.next(mockReservations[2]).value).toEqual(
      put(reservationsDataActions.cancelReservationSuccess())
    );
    expect(gen.next().value).toEqual(
      put({ type: FETCH_RESERVATIONS, payload: { hotelId: 'hotel_1' } })
    );
    gen.next();
    expect(resolve).toHaveBeenCalledWith(mockReservations[2]);
  });
});

describe('refundReservationWorker', () => {
  const resolve = jest.fn();
  const action = {
    type: 'refund',
    payload: {
      id: 'res_1',
      amount: 100,
      reason: 'overcharged',
      hotelId: 'hotel_1',
      resolve,
      reject: jest.fn(),
    },
  };

  it('happy path', () => {
    const gen = refundReservationWorker(action as Parameters<typeof refundReservationWorker>[0]);
    expect(gen.next().value).toEqual(put(reservationsDataActions.refundReservationRequest()));
    expect(gen.next().value).toEqual(call(refundReservationApi, 'res_1', 100, 'overcharged'));
    const mockPayment = { id: 'pay_1' };
    expect(gen.next(mockPayment).value).toEqual(
      put(reservationsDataActions.refundReservationSuccess())
    );
    expect(gen.next().value).toEqual(
      put({ type: FETCH_RESERVATIONS, payload: { hotelId: 'hotel_1' } })
    );
    gen.next();
    expect(resolve).toHaveBeenCalledWith(mockPayment);
  });
});
