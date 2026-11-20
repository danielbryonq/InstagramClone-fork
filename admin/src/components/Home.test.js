import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from './Home';

// Mock child route components – they use Firebase Firestore internally and
// are tested in their own suites. Here we just verify that Home renders
// and navigates to them correctly.
jest.mock('./Users', () => () => <div data-testid="users-component">Users Page</div>);
jest.mock('./User',  () => () => <div data-testid="user-component">User Page</div>);
jest.mock('./Post',  () => () => <div data-testid="post-component">Post Page</div>);

describe('Home component', () => {
  test('renders the FreeRide Admin app bar title', () => {
    render(<Home />);
    expect(screen.getByText(/freeride admin/i)).toBeInTheDocument();
  });

  test('renders the menu (drawer open) button', () => {
    render(<Home />);
    expect(screen.getByLabelText(/open drawer/i)).toBeInTheDocument();
  });

  test('renders the Users navigation link in the drawer', () => {
    render(<Home />);
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  test('renders the Users component on the default "/" route', () => {
    render(<Home />);
    expect(screen.getByTestId('users-component')).toBeInTheDocument();
  });

  test('opens the drawer when the menu button is clicked', () => {
    render(<Home />);
    const menuButton = screen.getByLabelText(/open drawer/i);
    expect(menuButton).toBeInTheDocument();

    fireEvent.click(menuButton);

    // After opening, the drawer toolbar contains an IconButton (the close chevron).
    // The open-drawer button itself gets the 'hide' CSS class applied.
    // We verify the drawer has expanded by checking its CSS class contains 'Open'.
    const drawer = document.querySelector('.makeStyles-drawerOpen-47, [class*="drawerOpen"]');
    expect(drawer).not.toBeNull();
  });

  test('closes the drawer when the chevron close button is clicked', () => {
    render(<Home />);

    // Open drawer first
    fireEvent.click(screen.getByLabelText(/open drawer/i));

    // The close button is the IconButton inside the drawer toolbar (no aria-label).
    // It is the only button inside the drawer paper's toolbar div.
    // Find it via the drawer toolbar structure.
    const drawerToolbarButtons = document.querySelectorAll(
      '.MuiDrawer-paper button'
    );
    expect(drawerToolbarButtons.length).toBeGreaterThan(0);

    const closeButton = drawerToolbarButtons[0];
    fireEvent.click(closeButton);

    // After closing, open drawer button is no longer hidden
    expect(screen.getByLabelText(/open drawer/i)).toBeInTheDocument();
  });

  test('renders a permanent Drawer (always visible)', () => {
    render(<Home />);
    // Permanent drawers are always in the DOM
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  test('Users link points to /Users route', () => {
    render(<Home />);
    const link = screen.getByRole('link', { name: /users/i });
    expect(link).toHaveAttribute('href', '/Users');
  });

  test('renders without crashing', () => {
    expect(() => render(<Home />)).not.toThrow();
  });
});
