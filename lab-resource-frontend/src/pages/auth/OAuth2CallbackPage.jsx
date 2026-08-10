import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function OAuth2CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google login failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    if (mode === 'setup') {
      navigate('/oauth2/complete-profile', { replace: true });
      return;
    }

    if (!loading) {
      if (user) {
        window.location.href = '/dashboard';
      } else {
        toast.error('Authentication failed. Please try again.');
        navigate('/login', { replace: true });
      }
    }
  }, [searchParams, navigate, loading, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing Google sign-in...</p>
      </div>
    </div>
  );
}
