import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HotelCard } from './HotelCard';

const meta: Meta<typeof HotelCard> = {
  title: 'Domain/HotelCard',
  component: HotelCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HotelCard>;

const mockHotel = {
  id: '1',
  name: 'Grand Hotel',
  address: {
    city: 'Palm Springs',
    state: 'CA',
    country: 'USA',
  },
  timezone: 'America/Los_Angeles',
};

export const Default: Story = {
  args: {
    hotel: mockHotel,
    roomCount: 12,
    activityCount: 5,
  },
};

export const Empty: Story = {
  args: {
    hotel: { ...mockHotel, name: 'Empty Hotel', address: undefined },
    roomCount: 0,
    activityCount: 0,
  },
};
