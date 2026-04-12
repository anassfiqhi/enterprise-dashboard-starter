import type { Hotel, RoomType, ActivityType } from '@repo/shared';

export const mockHotels: Hotel[] = [
  {
    id: 'hotel_1',
    name: 'Grand Hotel',
    timezone: 'America/New_York',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'US',
      postalCode: '10001',
    },
  },
  {
    id: 'hotel_2',
    name: 'City Inn',
    timezone: 'America/Los_Angeles',
    address: { city: 'Los Angeles', state: 'CA', country: 'US' },
  },
  {
    id: 'hotel_3',
    name: 'Seaside Resort',
    timezone: 'America/Chicago',
    address: { city: 'Miami', state: 'FL', country: 'US' },
  },
];

export const mockRoomTypes: RoomType[] = [
  {
    id: 'rt_1',
    hotelId: 'hotel_1',
    name: 'Standard Room',
    capacity: 2,
    description: 'Comfortable standard room with city view',
    basePrice: 120,
    currency: 'USD',
  },
  {
    id: 'rt_2',
    hotelId: 'hotel_1',
    name: 'Deluxe Suite',
    capacity: 4,
    description: 'Spacious suite with living area',
    basePrice: 280,
    currency: 'USD',
  },
  {
    id: 'rt_3',
    hotelId: 'hotel_2',
    name: 'Ocean View Room',
    capacity: 2,
    basePrice: 195,
    currency: 'USD',
  },
];

export const mockActivityTypes: ActivityType[] = [
  {
    id: 'at_1',
    hotelId: 'hotel_1',
    name: 'Yoga Class',
    capacityPerSlot: 15,
    description: 'Morning yoga session',
    duration: 60,
    basePrice: 25,
    currency: 'USD',
  },
  {
    id: 'at_2',
    hotelId: 'hotel_1',
    name: 'Spa Treatment',
    capacityPerSlot: 1,
    description: 'Full body massage',
    duration: 90,
    basePrice: 150,
    currency: 'USD',
  },
];

export const mockHotelDetail = {
  ...mockHotels[0],
  roomTypes: mockRoomTypes.filter((rt) => rt.hotelId === 'hotel_1'),
  activityTypes: mockActivityTypes.filter((at) => at.hotelId === 'hotel_1'),
  totalRooms: 45,
  totalActivities: 12,
};
