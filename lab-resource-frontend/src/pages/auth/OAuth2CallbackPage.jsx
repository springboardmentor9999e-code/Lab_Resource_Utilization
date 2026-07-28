import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OAuth2CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const setupToken = searchParams.get('setupToken');
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const role = searchParams.get('role');
    const fullName = searchParams.get('fullName');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const institutionId = searchParams.get('institutionId');
    const departmentId = searchParams.get('departmentId');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google login failed. Please try again.');
      navigate('/login');
      return;
    }

    if (setupToken) {
      const params = new URLSearchParams();
      params.set('setupToken', setupToken);
      if (fullName) params.set('fullName', fullName);
      if (email) params.set('email', email);
      if (userId) params.set('userId', userId);
      navigate(`/oauth2/complete-profile?${params.toString()}`, { replace: true });
      return;
    }

    if (token && refreshToken) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      const userData = {
        userId: parseInt(userId),
        email: email,
        role: role,
        fullName: decodeURIComponent(fullName || ''),
        institutionId: institutionId ? parseInt(institutionId) : null,
        departmentId: departmentId ? parseInt(departmentId) : null,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      window.location.href = '/dashboard';
    } else {
      toast.error('Authentication failed. No token received.');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing Google sign-in...</p>
      </div>
    </div>
  );
}
