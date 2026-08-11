import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/api';

export default function OAuth2CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth(); // We'll add this to AuthContext
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    let mounted = true;
    const processCallback = async () => {
      const mode = searchParams.get('mode');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Google login failed. Please try again.');
        if (mounted) navigate('/login', { replace: true });
        return;
      }

      // Parse hash fragment since we pass tokens via fragment to avoid logs
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);

      if (mode === 'login') {
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          try {
            await authApi.oauth2Success({ accessToken, refreshToken });
            let currentUser = user;
            if (checkAuth) {
              await checkAuth();
              // After checkAuth, the user state will be updated in the context,
              // but we need the actual user object to check institutionId immediately.
              const meRes = await authApi.getMe();
              currentUser = meRes.data;
            }
            
            if (mounted) {
              if (!currentUser.institutionId) {
                navigate('/oauth2/complete-profile', { replace: true });
              } else {
                window.location.href = '/dashboard';
              }
            }
          } catch (err) {
            toast.error('Failed to complete authentication.');
            if (mounted) navigate('/login', { replace: true });
          }
        } else {
          toast.error('Authentication tokens missing.');
          if (mounted) navigate('/login', { replace: true });
        }
      }
    };

    processCallback();
    return () => { mounted = false; };
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing Google sign-in...</p>
      </div>
    </div>
  );
}
