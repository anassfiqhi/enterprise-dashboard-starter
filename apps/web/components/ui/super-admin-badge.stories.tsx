import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SuperAdminBadge } from './super-admin-badge';

const meta: Meta<typeof SuperAdminBadge> = {
  title: 'UI/SuperAdminBadge',
  component: SuperAdminBadge,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showTooltip: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof SuperAdminBadge>;

export const Default: Story = {
  args: { size: 'sm', showTooltip: false },
};

export const Medium: Story = {
  args: { size: 'md', showTooltip: false },
};

export const Large: Story = {
  args: { size: 'lg', showTooltip: false },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <SuperAdminBadge size="sm" showTooltip={false} />
      <SuperAdminBadge size="md" showTooltip={false} />
      <SuperAdminBadge size="lg" showTooltip={false} />
    </div>
  ),
};
