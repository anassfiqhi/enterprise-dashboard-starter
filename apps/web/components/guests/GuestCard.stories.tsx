import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { GuestCard } from './GuestCard';
import type { GuestWithStats } from '@/lib/reducers/guests/guestsSlice';

const meta: Meta<typeof GuestCard> = {
  title: 'Domain/GuestCard',
  component: GuestCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GuestCard>;

const mockGuest: GuestWithStats = {
  id: 'guest_1',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '+1 (555) 012-3456',
  nationality: 'US',
  idType: 'passport',
  idNumber: 'P123456789',
  notes: 'Prefers a high floor. Allergic to feather pillows.',
  reservationCount: 5,
  totalSpent: 3240,
  lastStay: '2026-03-15',
};

export const Default: Story = {
  args: {
    guest: mockGuest,
  },
};

export const MinimalGuest: Story = {
  args: {
    guest: {
      id: 'guest_2',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      reservationCount: 0,
      totalSpent: 0,
    },
  },
};

export const WithActions: Story = {
  args: {
    guest: mockGuest,
    onEdit: fn(),
    onDelete: fn(),
  },
};
