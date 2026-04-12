import reducer, {
  setPage,
  setPageSize,
  setSearch,
  setStatus,
  setCheckInFrom,
  setCheckInTo,
  setDateRange,
  setSort,
  resetFilters,
} from '../reservationsSlice';

describe('reservationsSlice (filters)', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('returns correct initial state', () => {
    expect(initialState).toMatchObject({
      page: 1,
      pageSize: 10,
      search: '',
      status: '',
      checkInFrom: '',
      checkInTo: '',
      sort: '-createdAt',
    });
  });

  it('setPage updates page', () => {
    const state = reducer(initialState, setPage(3));
    expect(state.page).toBe(3);
  });

  it('setPageSize updates pageSize and resets page to 1', () => {
    let state = reducer(initialState, setPage(5));
    state = reducer(state, setPageSize(25));
    expect(state.pageSize).toBe(25);
    expect(state.page).toBe(1);
  });

  it('setSearch updates search and resets page to 1', () => {
    let state = reducer(initialState, setPage(3));
    state = reducer(state, setSearch('Alice'));
    expect(state.search).toBe('Alice');
    expect(state.page).toBe(1);
  });

  it('setStatus updates status and resets page to 1', () => {
    let state = reducer(initialState, setPage(2));
    state = reducer(state, setStatus('CONFIRMED'));
    expect(state.status).toBe('CONFIRMED');
    expect(state.page).toBe(1);
  });

  it('setCheckInFrom updates checkInFrom and resets page', () => {
    let state = reducer(initialState, setPage(2));
    state = reducer(state, setCheckInFrom('2026-05-01'));
    expect(state.checkInFrom).toBe('2026-05-01');
    expect(state.page).toBe(1);
  });

  it('setCheckInTo updates checkInTo and resets page', () => {
    let state = reducer(initialState, setPage(2));
    state = reducer(state, setCheckInTo('2026-05-31'));
    expect(state.checkInTo).toBe('2026-05-31');
    expect(state.page).toBe(1);
  });

  it('setDateRange sets both check-in dates and resets page', () => {
    let state = reducer(initialState, setPage(3));
    state = reducer(state, setDateRange({ from: '2026-05-01', to: '2026-05-31' }));
    expect(state.checkInFrom).toBe('2026-05-01');
    expect(state.checkInTo).toBe('2026-05-31');
    expect(state.page).toBe(1);
  });

  it('setSort updates sort field', () => {
    const state = reducer(initialState, setSort('checkIn'));
    expect(state.sort).toBe('checkIn');
  });

  it('resetFilters returns to initial state', () => {
    let state = reducer(initialState, setSearch('Alice'));
    state = reducer(state, setStatus('CONFIRMED'));
    state = reducer(state, setPage(4));
    state = reducer(state, resetFilters());
    expect(state).toEqual(initialState);
  });
});
