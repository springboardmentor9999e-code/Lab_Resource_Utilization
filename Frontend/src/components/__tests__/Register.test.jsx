import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Register from '../Register';

describe('Register Component', () => {
  const mockOnNavigate = vi.fn();
  const mockOnRegisterSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders Step 1 (Create Account) initially', () => {
    render(<Register onNavigate={mockOnNavigate} onRegisterSuccess={mockOnRegisterSuccess} />);

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText(/individual user account/i)).toBeInTheDocument();
  });

  it('navigates through multi-step registration flow', async () => {
    render(<Register onNavigate={mockOnNavigate} onRegisterSuccess={mockOnRegisterSuccess} />);

    // Step 1 -> Step 2
    const individualBtn = screen.getByText(/individual user account/i);
    await userEvent.click(individualBtn);

    expect(screen.getByRole('heading', { name: /select your role/i })).toBeInTheDocument();
    expect(screen.getByText(/research\/student/i)).toBeInTheDocument();

    // Step 2 -> Step 3
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    await userEvent.click(continueBtn);

    expect(screen.getByRole('heading', { name: /provide security credentials/i })).toBeInTheDocument();
  });

  it('shows error when password is less than 8 characters in Step 3', async () => {
    render(<Register onNavigate={mockOnNavigate} onRegisterSuccess={mockOnRegisterSuccess} />);

    // Navigate to Step 3
    await userEvent.click(screen.getByText(/individual user account/i));
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    const nameInput = screen.getByPlaceholderText(/akshay singh/i);
    const emailInput = screen.getByPlaceholderText(/scientist@demo.com/i);
    const passwordInput = screen.getByPlaceholderText(/create secure access key/i);
    const phoneInput = screen.getByPlaceholderText(/\+91 768019-2834/i);
    const submitBtn = screen.getByRole('button', { name: /create account/i });

    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'student@test.com');
    await userEvent.type(passwordInput, '12345'); // < 8 chars
    await userEvent.type(phoneInput, '1234567890');
    await userEvent.click(submitBtn);

    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    expect(mockOnRegisterSuccess).not.toHaveBeenCalled();
  });
});
