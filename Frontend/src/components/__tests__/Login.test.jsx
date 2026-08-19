import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../Login';

describe('Login Component', () => {
  const mockOnNavigate = vi.fn();
  const mockOnLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders login form elements properly', () => {
    render(<Login onNavigate={mockOnNavigate} onLoginSuccess={mockOnLoginSuccess} />);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/scientist@demo.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
  });

  it('handles user input and successful login via API', async () => {
    const mockUser = { email: 'student@test.com', name: 'Test Student', roleId: 1 };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'mock-jwt-token', user: mockUser }),
    });

    render(<Login onNavigate={mockOnNavigate} onLoginSuccess={mockOnLoginSuccess} />);

    const emailInput = screen.getByPlaceholderText(/scientist@demo.com/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /^sign in$/i });

    await userEvent.type(emailInput, 'student@test.com');
    await userEvent.type(passwordInput, 'secret123');
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'student@test.com', password: 'secret123', roleId: 3 }),
        })
      );
      expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockUser);
    });
  });

  it('displays error message when login API returns error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials provided' }),
    });

    render(<Login onNavigate={mockOnNavigate} onLoginSuccess={mockOnLoginSuccess} />);

    const emailInput = screen.getByPlaceholderText(/scientist@demo.com/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /^sign in$/i });

    await userEvent.type(emailInput, 'wrong@test.com');
    await userEvent.type(passwordInput, 'wrongpass');
    await userEvent.click(submitBtn);

    await waitFor(() => {
      const errorElements = screen.getAllByText(/invalid credentials provided/i);
      expect(errorElements.length).toBeGreaterThan(0);
      expect(errorElements[0]).toBeInTheDocument();
    });
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });
});
