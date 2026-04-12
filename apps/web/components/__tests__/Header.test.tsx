import { render, screen } from '@testing-library/react';
import { Header } from '../Header';
import { useSession } from '@/hooks/useSession';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';

// Mock dependencies
jest.mock('@/hooks/useSession', () => ({
  useSession: jest.fn(),
}));

jest.mock('../UserNav', () => ({
  UserNav: ({ user }: { user: { name: string } }) => <div data-testid="user-nav">{user.name}</div>,
}));

jest.mock('../OrganizationSelector', () => ({
  OrganizationSelector: () => <div data-testid="org-selector" />,
}));

describe('Header', () => {
  const renderHeader = () => {
    const store = createTestStore();
    return render(
      <Provider store={store}>
        <Header />
      </Provider>
    );
  };

  it('renders title and navigation links', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null });
    renderHeader();
    expect(screen.getByText('Enterprise Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('shows OrganizationSelector', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null });
    renderHeader();
    expect(screen.getByTestId('org-selector')).toBeInTheDocument();
  });

  it('shows UserNav when session exists', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'John Doe' } },
    });
    renderHeader();
    expect(screen.getByTestId('user-nav')).toHaveTextContent('John Doe');
  });

  it('hides UserNav when no session', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null });
    renderHeader();
    expect(screen.queryByTestId('user-nav')).not.toBeInTheDocument();
  });
});
