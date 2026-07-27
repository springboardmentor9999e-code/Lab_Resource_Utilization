import api from './api';

// Map dropdown user roles to the Spring Boot seeded role codes
const mapRoleToBackend = (frontendRole) => {
  switch (frontendRole) {
    case 'Student':
      return ['STUDENT'];
    case 'Researcher':
      return ['RESEARCHER'];
    case 'Lab Technician':
      return ['LAB_TECHNICIAN'];
    case 'Lab Manager':
      return ['LAB_MANAGER'];
    case 'Department Head':
      return ['DEPARTMENT_HEAD'];
    case 'Institution Admin':
      return ['INSTITUTION_ADMIN'];
    case 'System Admin':
      return ['SYSTEM_ADMIN'];
    default:
      return ['STUDENT'];
  }
};

const extractError = (error, fallback) => {
  const msg = error.response?.data?.message || error.message || fallback;
  return new Error(msg);
};

export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const data = response.data; // AuthResponse DTO

      const role = data.roles && data.roles.length > 0 ? data.roles[0] : 'STUDENT';

      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('role', role);

      return {
        token: data.accessToken,
        refreshToken: data.refreshToken,
        username: data.username,
        role: role
      };
    } catch (error) {
      throw extractError(error, 'Invalid credentials.');
    }
  },

  register: async (userData) => {
    try {
      // Map frontend fields to backend RegisterRequest DTO
      const payload = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phoneNumber,
        roles: mapRoleToBackend(userData.role)
      };

      const response = await api.post('/auth/register', payload);
      const data = response.data; // ApiResponse DTO

      if (data && data.success === false) {
        throw new Error(data.message || 'Registration failed');
      }
      return data;
    } catch (error) {
      throw extractError(error, 'Failed to register account.');
    }
  },

  // Google OAuth2 — exchange a Google ID token for our JWT session
  googleAuth: async (idToken, role) => {
    try {
      const payload = { idToken };
      if (role) payload.role = role;

      const response = await api.post('/auth/google', payload);
      const data = response.data; // AuthResponse DTO

      const userRole = data.roles && data.roles.length > 0 ? data.roles[0] : 'STUDENT';

      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('role', userRole);

      return {
        token: data.accessToken,
        refreshToken: data.refreshToken,
        username: data.username,
        role: userRole
      };
    } catch (error) {
      throw extractError(error, 'Google sign-in failed.');
    }
  },

  getCurrentUser: async (token) => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await api.get('/users/me', config);
      return response.data; // UserResponse DTO
    } catch (error) {
      throw extractError(error, 'Could not load user profile.');
    }
  },

  // Step 1: request an OTP to be emailed
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data; // ApiResponse { success, message }
    } catch (error) {
      throw extractError(error, 'Failed to request password reset.');
    }
  },

  // Step 2: verify the OTP -> returns reset-session token in data
  verifyOtp: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      return response.data; // ApiResponse { success, message, data: resetToken }
    } catch (error) {
      throw extractError(error, 'OTP verification failed.');
    }
  },

  // Step 3: set the new password using the verified reset token
  resetPassword: async (resetToken, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        resetToken,
        newPassword,
        confirmPassword
      });
      return response.data; // ApiResponse { success, message }
    } catch (error) {
      throw extractError(error, 'Password reset failed.');
    }
  },

  refreshToken: async (token) => {
    try {
      const response = await api.post('/auth/refresh-token', { refreshToken: token });
      const data = response.data;
      return {
        token: data.accessToken,
        refreshToken: data.refreshToken
      };
    } catch (error) {
      throw extractError(error, 'Session refresh failed.');
    }
  }
};
