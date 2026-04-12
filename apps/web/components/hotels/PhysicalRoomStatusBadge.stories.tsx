import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PhysicalRoomStatusBadge } from './PhysicalRoomStatusBadge';

const meta: Meta<typeof PhysicalRoomStatusBadge> = {
  title: 'Domain/PhysicalRoomStatusBadge',
  component: PhysicalRoomStatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof PhysicalRoomStatusBadge>;

export const Available: Story = {
  args: { status: 'AVAILABLE' },
};

export const Maintenance: Story = {
  args: { status: 'MAINTENANCE' },
};

export const OutOfService: Story = {
  args: { status: 'OUT_OF_SERVICE' },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex gap-2">
      <PhysicalRoomStatusBadge status="AVAILABLE" />
      <PhysicalRoomStatusBadge status="MAINTENANCE" />
      <PhysicalRoomStatusBadge status="OUT_OF_SERVICE" />
    </div>
  ),
};
