import reducer, { setOrganizations, setSelectedOrganization } from '../organizationSlice';

const mockOrgs = [
  { id: 'hotel_1', name: 'Grand Hotel', slug: 'grand-hotel' },
  { id: 'hotel_2', name: 'City Inn', slug: 'city-inn' },
];

describe('organizationSlice', () => {
  it('returns correct initial state', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.organizations).toEqual([]);
    expect(state.activeOrganization).toBeNull();
  });

  it('stores organizations on setOrganizations', () => {
    const state = reducer(
      undefined,
      setOrganizations(mockOrgs as Parameters<typeof setOrganizations>[0])
    );
    expect(state.organizations).toEqual(mockOrgs);
  });

  it('sets selected organization id on setSelectedOrganization', () => {
    const state = reducer(undefined, setSelectedOrganization('hotel_1'));
    expect(state.activeOrganization).toBe('hotel_1');
  });
});
