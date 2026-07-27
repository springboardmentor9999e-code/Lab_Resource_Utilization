import { describe, it, expect, beforeEach } from 'vitest';
import api from '../services/api';

/**
 * Tests for the Axios request interceptor: JWT attachment rules.
 * The interceptor is exercised directly (handlers array) — no HTTP calls.
 */
const runRequestInterceptor = (config) => {
  const handler = api.interceptors.request.handlers[0];
  return handler.fulfilled(config);
};

describe('api request interceptor', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('attaches Bearer token from localStorage on protected endpoints', () => {
    localStorage.setItem('token', 'my-jwt');

    const config = runRequestInterceptor({ url: '/equipment', headers: {} });

    expect(config.headers.Authorization).toBe('Bearer my-jwt');
  });

  it('falls back to sessionStorage token', () => {
    sessionStorage.setItem('token', 'session-jwt');

    const config = runRequestInterceptor({ url: '/bookings', headers: {} });

    expect(config.headers.Authorization).toBe('Bearer session-jwt');
  });

  it('sends no Authorization header when no token exists', () => {
    const config = runRequestInterceptor({ url: '/equipment', headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });

  it.each([
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/verify-otp',
    '/auth/reset-password',
    '/auth/refresh-token',
  ])('strips stale tokens on public auth endpoint %s', (url) => {
    localStorage.setItem('token', 'stale-jwt');

    const config = runRequestInterceptor({
      url,
      headers: { Authorization: 'Bearer stale-jwt' },
    });

    expect(config.headers.Authorization).toBeUndefined();
  });
});
