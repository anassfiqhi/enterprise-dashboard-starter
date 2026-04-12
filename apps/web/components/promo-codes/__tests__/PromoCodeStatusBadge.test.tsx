import { render, screen } from '@testing-library/react';
import { PromoCodeStatusBadge } from '../PromoCodeStatusBadge';
import { PromoCode } from '@repo/shared';

const basePromoCode: PromoCode = {
  id: 'promo-1',
  code: 'SAVE50',
  discountType: 'PERCENTAGE',
  discountValue: 50,
  isActive: true,
  usedCount: 0,
  maxUses: 100,
  validFrom: '2020-01-01',
  validTo: '2099-12-31',
  createdAt: new Date().toISOString(),
};

describe('PromoCodeStatusBadge', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('renders Active status when active and within dates', () => {
    render(<PromoCodeStatusBadge promoCode={basePromoCode} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders Inactive status when isActive is false', () => {
    render(<PromoCodeStatusBadge promoCode={{ ...basePromoCode, isActive: false }} />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders Expired status when validTo is in the past', () => {
    render(<PromoCodeStatusBadge promoCode={{ ...basePromoCode, validTo: '2023-12-31' }} />);
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('renders Exhausted status when usedCount equals maxUses', () => {
    render(<PromoCodeStatusBadge promoCode={{ ...basePromoCode, usedCount: 100, maxUses: 100 }} />);
    expect(screen.getByText('Exhausted')).toBeInTheDocument();
  });

  it('prioritizes Inactive over other states', () => {
    render(
      <PromoCodeStatusBadge
        promoCode={{ ...basePromoCode, isActive: false, validTo: '2023-12-31' }}
      />
    );
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
});
