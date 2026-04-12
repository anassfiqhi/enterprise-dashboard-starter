import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BookingMetricsCards } from './BookingMetricsCards';

const meta: Meta<typeof BookingMetricsCards> = {
  title: 'Domain/BookingMetricsCards',
  component: BookingMetricsCards,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BookingMetricsCards>;

export const Loading: Story = {
  args: {
    isLoading: true,
    metrics: null,
  },
};

export const NoData: Story = {
  args: {
    isLoading: false,
    metrics: null,
  },
};

export const Populated: Story = {
  args: {
    isLoading: false,
    metrics: {
      totalRevenue: 124500,
      totalBookings: 312,
      confirmedBookings: 278,
      pendingBookings: 21,
      cancelledBookings: 13,
      averageOccupancy: 74.3,
      averageDailyRate: 189,
      revenueByDay: [],
      bookingsByStatus: [],
      occupancyByDay: [],
    },
  },
};
