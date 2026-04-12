import { render, screen } from '@testing-library/react';
import { BookingMetricsCards } from '../BookingMetricsCards';
import { BookingMetrics } from '@repo/shared';

const mockMetrics: BookingMetrics = {
  totalRevenue: 50000,
  totalBookings: 120,
  confirmedBookings: 100,
  pendingBookings: 10,
  cancelledBookings: 10,
  averageOccupancy: 85.5,
  averageDailyRate: 450,
  revenueByDay: [],
  bookingsByStatus: [],
  occupancyByDay: [],
};

describe('BookingMetricsCards', () => {
  it('renders skeleton cards when loading', () => {
    render(<BookingMetricsCards metrics={null} isLoading={true} />);
    // Check for skeleton elements - we can look for the generic card structure
    // Since Skeleton doesn't have text, we use its presence
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders nothing when no metrics and not loading', () => {
    const { container } = render(<BookingMetricsCards metrics={null} isLoading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders metrics data correctly when loaded', () => {
    render(<BookingMetricsCards metrics={mockMetrics} isLoading={false} />);

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('100 confirmed bookings')).toBeInTheDocument();

    expect(screen.getByText('Total Bookings')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('10 pending, 10 cancelled')).toBeInTheDocument();

    expect(screen.getByText('Average Occupancy')).toBeInTheDocument();
    expect(screen.getByText('85.5%')).toBeInTheDocument();

    expect(screen.getByText('Average Daily Rate')).toBeInTheDocument();
    expect(screen.getByText('$450')).toBeInTheDocument();
  });
});
