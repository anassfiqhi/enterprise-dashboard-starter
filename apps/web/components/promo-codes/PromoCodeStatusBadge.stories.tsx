import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PromoCodeStatusBadge } from './PromoCodeStatusBadge';
import type { PromoCode } from '@repo/shared';

const meta: Meta<typeof PromoCodeStatusBadge> = {
  title: 'Domain/PromoCodeStatusBadge',
  component: PromoCodeStatusBadge,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PromoCodeStatusBadge>;

const base: PromoCode = {
  id: 'pc_1',
  code: 'SUMMER20',
  hotelId: 'hotel_1',
  discountType: 'PERCENTAGE',
  discountValue: 20,
  isActive: true,
  usedCount: 0,
  validFrom: '2026-01-01',
  validTo: '2027-12-31',
  maxUses: 100,
  createdAt: new Date().toISOString(),
};

export const Active: Story = {
  args: { promoCode: base },
};

export const Expired: Story = {
  args: {
    promoCode: { ...base, validTo: '2025-01-01' },
  },
};

export const Exhausted: Story = {
  args: {
    promoCode: { ...base, maxUses: 100, usedCount: 100 },
  },
};

export const Inactive: Story = {
  args: {
    promoCode: { ...base, isActive: false },
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PromoCodeStatusBadge promoCode={base} />
      <PromoCodeStatusBadge promoCode={{ ...base, validTo: '2025-01-01' }} />
      <PromoCodeStatusBadge promoCode={{ ...base, maxUses: 100, usedCount: 100 }} />
      <PromoCodeStatusBadge promoCode={{ ...base, isActive: false }} />
    </div>
  ),
};
