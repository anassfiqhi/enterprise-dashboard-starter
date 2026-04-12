import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RoleBadge } from './role-badge';

const meta: Meta<typeof RoleBadge> = {
  title: 'UI/RoleBadge',
  component: RoleBadge,
  tags: ['autodocs'],
  argTypes: {
    role: {
      control: 'select',
      options: ['admin', 'owner', 'manager', 'member', 'staff'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showTooltip: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof RoleBadge>;

export const Admin: Story = {
  args: { role: 'admin', size: 'sm', showTooltip: false },
};

export const Manager: Story = {
  args: { role: 'manager', size: 'sm', showTooltip: false },
};

export const Staff: Story = {
  args: { role: 'member', size: 'sm', showTooltip: false },
};

export const AllRolesSizeMd: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <RoleBadge role="admin" size="md" showTooltip={false} />
      <RoleBadge role="owner" size="md" showTooltip={false} />
      <RoleBadge role="member" size="md" showTooltip={false} />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <RoleBadge role="admin" size="sm" showTooltip={false} />
      <RoleBadge role="admin" size="md" showTooltip={false} />
      <RoleBadge role="admin" size="lg" showTooltip={false} />
    </div>
  ),
};
