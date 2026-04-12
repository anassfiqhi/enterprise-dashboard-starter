import reducer, { setDensity, setVisibleColumns, toggleColumn } from '../tableSlice';

describe('tableSlice (preferences)', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('returns correct initial state', () => {
    expect(initialState).toMatchObject({
      density: 'normal',
      visibleColumns: ['id', 'customer', 'status', 'amount'],
    });
  });

  it('setDensity updates density', () => {
    expect(reducer(initialState, setDensity('compact')).density).toBe('compact');
    expect(reducer(initialState, setDensity('comfortable')).density).toBe('comfortable');
  });

  it('setVisibleColumns replaces visible columns', () => {
    const state = reducer(initialState, setVisibleColumns(['id', 'status']));
    expect(state.visibleColumns).toEqual(['id', 'status']);
  });

  describe('toggleColumn', () => {
    it('removes a column that is already visible', () => {
      const state = reducer(initialState, toggleColumn('status'));
      expect(state.visibleColumns).not.toContain('status');
      expect(state.visibleColumns).toContain('id');
    });

    it('adds a column that is not yet visible', () => {
      const state = reducer(initialState, toggleColumn('checkIn'));
      expect(state.visibleColumns).toContain('checkIn');
    });

    it('toggling twice restores original column', () => {
      let state = reducer(initialState, toggleColumn('customer'));
      expect(state.visibleColumns).not.toContain('customer');
      state = reducer(state, toggleColumn('customer'));
      expect(state.visibleColumns).toContain('customer');
    });
  });
});
