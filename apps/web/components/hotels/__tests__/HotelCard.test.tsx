import { render, screen, fireEvent } from '@testing-library/react';
import { HotelCard } from '../HotelCard';
import { Hotel } from '@repo/shared';

const mockHotel: Hotel = {
  id: 'hotel-1',
  name: 'Test Hotel',
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
  },
  timezone: 'America/New York',
};

// Mock Radix UI components to render content inline for testing
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <div onClick={onClick}>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

describe('HotelCard', () => {
  it('renders hotel details correctly', () => {
    render(<HotelCard hotel={mockHotel} roomCount={5} activityCount={3} />);

    expect(screen.getByText('Test Hotel')).toBeInTheDocument();
    expect(screen.getByText('New York, NY, USA')).toBeInTheDocument();
    expect(screen.getByText('America/New York')).toBeInTheDocument();
    expect(screen.getByText('5 Room Types')).toBeInTheDocument();
    expect(screen.getByText('3 Activities')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<HotelCard hotel={mockHotel} onEdit={onEdit} />);

    const editItem = screen.getByText('Edit Hotel');
    fireEvent.click(editItem);

    expect(onEdit).toHaveBeenCalledWith(mockHotel);
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = jest.fn();
    render(<HotelCard hotel={mockHotel} onDelete={onDelete} />);

    const deleteItem = screen.getByText('Delete Hotel');
    fireEvent.click(deleteItem);

    expect(onDelete).toHaveBeenCalledWith(mockHotel);
  });
});
