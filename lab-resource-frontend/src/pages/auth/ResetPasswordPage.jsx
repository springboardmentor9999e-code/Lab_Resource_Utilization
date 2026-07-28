import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/api';
import toast from 'react-hot-toast';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-700">LRUP</h1>
          </div>
          <div className="card text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Invalid Link</h2>
            <p className="text-gray-600 mb-6">This password reset link is invalid or missing a token.</p>
            <Link to="/forgot-password" className="btn-primary inline-block">Request New Link</Link>
          </div>
        </div>
      </div>
    );
  }

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Must contain at least one number';
    if (!/[@$!%*?&]/.test(pwd)) return 'Must contain at least one special character';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validatePassword(password);
    if (error) {
      setPasswordError(error);
      toast.error(error);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setPasswordError('');
    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setSuccess(true);
      toast.success('Password reset successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">LRUP</h1>
          <p className="text-gray-600 mt-2">Set your new password</p>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Password Reset</h2>
              <p className="text-gray-600 mb-6">
                Your password has been reset successfully.
              </p>
              <Link to="/login" className="btn-primary inline-block">
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reset Password</h2>
              <p className="text-gray-600 mb-6">Enter your new password below.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                    className="input-field"
                    placeholder="Enter new password"
                    required
                    minLength={8}
                  />
                  {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character (@$!%*?&)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                  />
                </div>

                <button type="submit" disabled={loading} className="w-full btn-primary py-3">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
