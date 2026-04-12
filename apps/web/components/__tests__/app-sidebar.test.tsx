import { render, screen, cleanup } from '@testing-library/react';
import { AppSidebar } from '../app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';
import { usePermissions } from '@/hooks/usePermissions';
import { usePathname } from 'next/navigation';
import { useCollapsibleMode } from '@/hooks/use-collapsible-mode';

// Mock dependencies
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: jest.fn(),
  },
}));

jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(),
}));

jest.mock('@/hooks/use-collapsible-mode', () => ({
  useCollapsibleMode: jest.fn(),
}));

// Mock child components to keep test focused on AppSidebar logic
jest.mock('@/components/sidebar-org-switcher', () => ({
  SidebarOrgSwitcher: () => <div data-testid="org-switcher" />,
}));

interface NavItem {
  title: string;
}

jest.mock('@/components/nav-main', () => ({
  NavMain: ({ items }: { items: NavItem[] }) => (
    <div data-testid="nav-main">
      {items.map((i) => (
        <span key={i.title}>{i.title}</span>
      ))}
    </div>
  ),
  NavMainSkeleton: () => <div data-testid="nav-main-skeleton" />,
}));

jest.mock('@/components/nav-user', () => ({
  NavUser: ({ user }: { user: { name: string } }) => <div data-testid="nav-user">{user.name}</div>,
  NavUserSkeleton: () => <div data-testid="nav-user-skeleton" />,
}));

describe('AppSidebar', () => {
  beforeEach(() => {
    cleanup();
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/');
    (authClient.useSession as jest.Mock).mockReturnValue({ data: { user: { name: 'Test User' } } });
    (usePermissions as jest.Mock).mockReturnValue({
      can: () => true,
      isAdmin: false,
      isLoading: false,
    });
    (useCollapsibleMode as jest.Mock).mockReturnValue('icon');
  });

  const renderSidebar = () =>
    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    );

  it('renders correctly with base permissions', () => {
    renderSidebar();
    expect(screen.getByTestId('org-switcher')).toBeInTheDocument();
    expect(screen.getByTestId('nav-main')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-user')).toHaveTextContent('Test User');
  });

  it('hides system menu for non-admins', () => {
    (usePermissions as jest.Mock).mockReturnValue({
      can: () => true,
      isAdmin: false,
      isLoading: false,
    });
    renderSidebar();
    expect(screen.queryByText('System')).not.toBeInTheDocument();
  });

  it('shows system menu for admins', () => {
    (usePermissions as jest.Mock).mockReturnValue({
      can: () => true,
      isAdmin: true,
      isLoading: false,
    });
    renderSidebar();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('filters menu items based on can() permissions', () => {
    (usePermissions as jest.Mock).mockReturnValue({
      can: (resource: string) => resource === 'roomTypes',
      isAdmin: false,
      isLoading: false,
    });

    renderSidebar();
    expect(screen.getByText('Rooms')).toBeInTheDocument();
    expect(screen.queryByText('Bookings')).not.toBeInTheDocument();
    expect(screen.queryByText('Inventory')).not.toBeInTheDocument();
  });

  it('renders skeleton when permissions are loading', () => {
    (usePermissions as jest.Mock).mockReturnValue({
      can: () => false,
      isAdmin: false,
      isLoading: true,
    });
    renderSidebar();
    expect(screen.getByTestId('nav-main-skeleton')).toBeInTheDocument();
  });
});
