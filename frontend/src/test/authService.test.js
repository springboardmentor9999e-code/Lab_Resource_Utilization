import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../services/authService';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: { post: vi.fn(), get: vi.fn() },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('stores tokens and returns session data on success', async () => {
      api.post.mockResolvedValue({
        data: {
          accessToken: 'jwt-token',
          refreshToken: 'refresh-token',
          username: 'student',
          roles: ['STUDENT'],
        },
      });

      const result = await authService.login('student', 'student123');

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        username: 'student',
        password: 'student123',
      });
      expect(result.token).toBe('jwt-token');
      expect(result.role).toBe('STUDENT');
      expect(localStorage.getItem('token')).toBe('jwt-token');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
    });

    it('surfaces the backend error message on failure', async () => {
      api.post.mockRejectedValue({
        response: { data: { message: 'Invalid username or password' } },
      });

      await expect(authService.login('student', 'wrong')).rejects.toThrow(
        'Invalid username or password'
      );
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('register', () => {
    it('maps frontend role labels to backend role codes', async () => {
      api.post.mockResolvedValue({ data: { success: true, message: 'ok' } });

      await authService.register({
        username: 'newuser',
        email: 'new@test.local',
        password: 'secret123',
        firstName: 'New',
        lastName: 'User',
        phoneNumber: '12345',
        role: 'Lab Manager',
      });

      expect(api.post).toHaveBeenCalledWith(
        '/auth/register',
        expect.objectContaining({ roles: ['LAB_MANAGER'], phone: '12345' })
      );
    });

    it('defaults unknown roles to STUDENT', async () => {
      api.post.mockResolvedValue({ data: { success: true } });

      await authService.register({ username: 'x', email: 'x@y.z', password: 'p', role: 'Wizard' });

      expect(api.post).toHaveBeenCalledWith(
        '/auth/register',
        expect.objectContaining({ roles: ['STUDENT'] })
      );
    });

    it('throws when the ApiResponse reports failure', async () => {
      api.post.mockResolvedValue({
        data: { success: false, message: 'Username already exists' },
      });

      await expect(
        authService.register({ username: 'dup', email: 'd@t.l', password: 'p', role: 'Student' })
      ).rejects.toThrow('Username already exists');
    });
  });
});
