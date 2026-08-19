import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProtectedRoute from '../ProtectedRoute';
import { PermissionsProvider } from '../../context/PermissionsContext';

describe('ProtectedRoute Component', () => {
  it('renders children when user has the required permission', () => {
    const mockUser = {
      permissions: ['create_booking', 'view_equipment'],
    };

    render(
      <PermissionsProvider user={mockUser}>
        <ProtectedRoute requiredPermission="create_booking">
          <div data-testid="protected-content">Secret Booking Panel</div>
        </ProtectedRoute>
      </PermissionsProvider>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Secret Booking Panel')).toBeInTheDocument();
    expect(screen.queryByText(/access denied/i)).not.toBeInTheDocument();
  });

  it('renders Access Denied message when user lacks required permission', () => {
    const mockUser = {
      permissions: ['view_equipment'],
    };

    render(
      <PermissionsProvider user={mockUser}>
        <ProtectedRoute requiredPermission="approve_bookings">
          <div data-testid="protected-content">Manager Dashboard</div>
        </ProtectedRoute>
      </PermissionsProvider>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    expect(screen.getByText(/you do not have permission to view this content/i)).toBeInTheDocument();
  });
});
