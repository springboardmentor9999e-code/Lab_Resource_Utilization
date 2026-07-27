import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const renderAt = (path, permission) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute permission={permission}>
              <div>Secret Dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });

    renderAt('/dashboard');

    expect(screen.getByText('Secret Dashboard')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to /login', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });

    renderAt('/dashboard');

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Dashboard')).not.toBeInTheDocument();
  });

  it('shows the session spinner while auth state is loading', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true });

    renderAt('/dashboard');

    expect(screen.getByText('Verifying Session...')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  describe('permission guard', () => {
    it('renders children when the role grants the permission', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { roles: ['SYSTEM_ADMIN'] },
      });

      renderAt('/dashboard', 'manageUsers');

      expect(screen.getByText('Secret Dashboard')).toBeInTheDocument();
    });

    it('blocks an authenticated user whose role lacks the permission', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { roles: ['RESEARCHER'] },
      });

      renderAt('/dashboard', 'manageUsers');

      expect(screen.getByText('Access Restricted')).toBeInTheDocument();
      expect(screen.queryByText('Secret Dashboard')).not.toBeInTheDocument();
    });

    it('names the blocked role so the user knows why', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { roles: ['LAB_TECHNICIAN'] },
      });

      renderAt('/dashboard', 'manageUsers');

      expect(screen.getByText(/LAB TECHNICIAN/)).toBeInTheDocument();
    });

    it('honours legacy role names', () => {
      // Pre-migration accounts still carry ADMIN rather than SYSTEM_ADMIN
      useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { roles: ['ADMIN'] },
      });

      renderAt('/dashboard', 'manageUsers');

      expect(screen.getByText('Secret Dashboard')).toBeInTheDocument();
    });

    it('still renders children when no permission is required', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { roles: ['STUDENT'] },
      });

      renderAt('/dashboard');

      expect(screen.getByText('Secret Dashboard')).toBeInTheDocument();
    });
  });
});
