import React from 'react';
import { render, screen, act } from '@testing-library/react';
import App from './App';
import firebase, { mockAuthInstance } from 'firebase';

// firebase is auto-mocked from admin/src/__mocks__/firebase.js

// Mock child components that use Firebase Firestore directly
jest.mock('./components/Users', () => () => <div data-testid="users-component">Users Page</div>);
jest.mock('./components/User',  () => () => <div data-testid="user-component">User Page</div>);
jest.mock('./components/Post',  () => () => <div data-testid="post-component">Post Page</div>);

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore the return value cleared by clearAllMocks
    firebase.auth.mockReturnValue(mockAuthInstance);
    // Reset currentUser to no user logged in
    mockAuthInstance.currentUser = undefined;
  });

  test('renders login route when no user is authenticated', () => {
    mockAuthInstance.onAuthStateChanged.mockImplementation((callback) => {
      callback(null);
      return jest.fn(); // unsubscribe
    });

    render(<App />);

    // Login component shows "Sign In" heading when not logged in
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  test('renders Home component when user is authenticated', async () => {
    const mockUser = { uid: 'test-uid', email: 'admin@test.com' };
    mockAuthInstance.onAuthStateChanged.mockImplementation((callback) => {
      callback(mockUser);
      return jest.fn();
    });

    await act(async () => {
      render(<App />);
    });

    // Home renders "FreeRide Admin" in the AppBar
    expect(screen.getByText(/freeride admin/i)).toBeInTheDocument();
  });

  test('calls firebase.auth().onAuthStateChanged on mount', () => {
    mockAuthInstance.onAuthStateChanged.mockImplementation((callback) => {
      callback(null);
      return jest.fn();
    });

    render(<App />);

    expect(mockAuthInstance.onAuthStateChanged).toHaveBeenCalledTimes(1);
  });

  test('transitions from logged-out to logged-in state', async () => {
    let authCallback;
    mockAuthInstance.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      callback(null); // start logged out
      return jest.fn();
    });

    render(<App />);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();

    // Simulate user signing in
    const mockUser = { uid: 'test-uid', email: 'admin@test.com' };
    await act(async () => {
      authCallback(mockUser);
    });

    expect(screen.getByText(/freeride admin/i)).toBeInTheDocument();
  });

  test('transitions from logged-in to logged-out state', async () => {
    let authCallback;
    mockAuthInstance.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      callback({ uid: 'test-uid' }); // start logged in
      return jest.fn();
    });

    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/freeride admin/i)).toBeInTheDocument();

    // Simulate user signing out
    await act(async () => {
      authCallback(null);
    });

    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });
});
