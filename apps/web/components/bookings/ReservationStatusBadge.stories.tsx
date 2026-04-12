import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ReservationStatusBadge } from './ReservationStatusBadge';

const meta: Meta<typeof ReservationStatusBadge> = {
  title: 'Domain/ReservationStatusBadge',
  component: ReservationStatusBadge,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReservationStatusBadge>;

export const Pending: Story = {
  args: {
    status: 'PENDING',
  },
};

export const Confirmed: Story = {
  args: {
    status: 'CONFIRMED',
  },
};

export const Cancelled: Story = {
  args: {
    status: 'CANCELLED',
  },
};
