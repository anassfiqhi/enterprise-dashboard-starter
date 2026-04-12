import type { GuestWithStats } from '@/lib/reducers/guests/guestsSlice';

export const mockGuests: GuestWithStats[] = [
  {
    id: 'guest_1',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1-555-0101',
    nationality: 'US',
    idType: 'PASSPORT',
    idNumber: 'P1234567',
    notes: 'VIP guest, prefers high floor',
    reservationCount: 3,
    totalSpent: 1200,
  },
  {
    id: 'guest_2',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@example.com',
    phone: '+44-20-7946-0958',
    nationality: 'GB',
    reservationCount: 1,
    totalSpent: 450,
  },
  {
    id: 'guest_3',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@example.com',
    nationality: 'ES',
    idType: 'ID_CARD',
    idNumber: 'ES9876543',
    reservationCount: 0,
    totalSpent: 0,
  },
];
