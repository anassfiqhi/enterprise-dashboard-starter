import type { PhysicalRoom, RoomInventory } from '@repo/shared';

export const mockPhysicalRooms: PhysicalRoom[] = [
  {
    id: 'room_101',
    roomTypeId: 'rt_1',
    hotelId: 'hotel_1',
    code: '101',
    floor: 1,
    status: 'AVAILABLE',
  },
  {
    id: 'room_102',
    roomTypeId: 'rt_1',
    hotelId: 'hotel_1',
    code: '102',
    floor: 1,
    status: 'AVAILABLE',
  },
  {
    id: 'room_201',
    roomTypeId: 'rt_2',
    hotelId: 'hotel_1',
    code: '201',
    floor: 2,
    status: 'MAINTENANCE',
    notes: 'Plumbing repair in progress',
  },
  {
    id: 'room_301',
    roomTypeId: 'rt_3',
    hotelId: 'hotel_2',
    code: '301',
    floor: 3,
    status: 'AVAILABLE',
  },
];

export const mockRoomInventory: RoomInventory[] = [
  {
    id: 'inv_1',
    roomTypeId: 'rt_1',
    hotelId: 'hotel_1',
    date: '2026-05-01',
    totalRooms: 10,
    availableRooms: 7,
    blockedRooms: 1,
    bookedRooms: 2,
  },
  {
    id: 'inv_2',
    roomTypeId: 'rt_1',
    hotelId: 'hotel_1',
    date: '2026-05-02',
    totalRooms: 10,
    availableRooms: 5,
    blockedRooms: 1,
    bookedRooms: 4,
  },
  {
    id: 'inv_3',
    roomTypeId: 'rt_2',
    hotelId: 'hotel_1',
    date: '2026-05-01',
    totalRooms: 5,
    availableRooms: 3,
    blockedRooms: 0,
    bookedRooms: 2,
  },
];

export function generateRoomAvailability(hotelId: string, startDate: string, days = 7) {
  const result = [];
  const start = new Date(startDate);
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      roomTypeId: 'rt_1',
      roomTypeName: 'Standard Room',
      totalRooms: 10,
      availableRooms: Math.floor(Math.random() * 8) + 1,
      bookedRooms: Math.floor(Math.random() * 5),
      closed: false,
    });
  }
  return result;
}
