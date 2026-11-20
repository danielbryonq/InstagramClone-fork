import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './login';
import firebase, { mockAuthInstance } from 'firebase';

// firebase is auto-mocked from admin/src/__mocks__/firebase.js

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe('Login component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore the return value cleared by clearAllMocks
    firebase.auth.mockReturnValue(mockAuthInstance);
    // No current user by default → renders the login form
    mockAuthInstance.currentUser = undefined;
  });

  test('renders the Sign In heading', () => {
    renderLogin();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  test('renders email and password inputs', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
  });

  test('renders the Submit button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('updates email input value on change', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText(/enter email/i);
    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    expect(emailInput.value).toBe('admin@test.com');
  });

  test('updates password input value on change', () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });
    expect(passwordInput.value).toBe('secret123');
  });

  test('calls firebase.auth().signInWithEmailAndPassword with email and password on submit', () => {
    mockAuthInstance.signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'test-uid' } });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/enter email/i), {
      target: { value: 'admin@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(mockAuthInstance.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(mockAuthInstance.signInWithEmailAndPassword).toHaveBeenCalledWith(
      'admin@test.com',
      'secret123'
    );
  });

  test('does not throw when signInWithEmailAndPassword rejects (error is caught)', async () => {
    mockAuthInstance.signInWithEmailAndPassword.mockRejectedValue(
      new Error('auth/wrong-password')
    );

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/enter email/i), {
      target: { value: 'bad@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
      target: { value: 'wrongpass' },
    });

    // Should not throw – the component catches the error silently
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    );

    expect(mockAuthInstance.signInWithEmailAndPassword).toHaveBeenCalledWith(
      'bad@test.com',
      'wrongpass'
    );
  });

  test('email input has type email', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText(/enter email/i);
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('password input has type password', () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('renders the auth-inner container', () => {
    renderLogin();
    expect(document.querySelector('.auth-inner')).toBeInTheDocument();
  });

  test('email label is displayed', () => {
    renderLogin();
    expect(screen.getByText(/email address/i)).toBeInTheDocument();
  });

  test('password label is displayed', () => {
    renderLogin();
    expect(screen.getByText(/^password$/i)).toBeInTheDocument();
  });
});
