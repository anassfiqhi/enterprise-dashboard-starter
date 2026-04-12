import { render, screen } from '@testing-library/react';
import { ReservationStatusBadge } from '../ReservationStatusBadge';

describe('ReservationStatusBadge', () => {
  it('renders PENDING status correctly', () => {
    render(<ReservationStatusBadge status="PENDING" />);
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('renders CONFIRMED status correctly', () => {
    render(<ReservationStatusBadge status="CONFIRMED" />);
    expect(screen.getByText('confirmed')).toBeInTheDocument();
  });

  it('renders CANCELLED status correctly', () => {
    render(<ReservationStatusBadge status="CANCELLED" />);
    expect(screen.getByText('cancelled')).toBeInTheDocument();
  });
});
