import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User, AlertCircle, ArrowRight, Check } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useToast } from '../components/ui/Toast';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Load the Google Identity Services script once, shared across pages
let gsiScriptPromise = null;
const loadGsiScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiScriptPromise) {
    gsiScriptPromise = new Promise((resolve, reject) => {
      const fail = () => {
        gsiScriptPromise = null;
        reject(new Error('Failed to load Google Sign-In'));
      };
      const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
      if (existing) {
        if (window.google?.accounts?.id) return resolve();
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', fail);
        return;
      }
      const script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = fail;
      document.head.appendChild(script);
    });
  }
  return gsiScriptPromise;
};

const GoogleGIcon = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const LoginPage = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'
  const [gisReady, setGisReady] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const googleWrapRef = useRef(null);
  const googleBtnRef = useRef(null);

  // Get requested path to redirect after authentication
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false
    }
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    loadGsiScript().then(() => {
      setGisReady(true);
      if (window.google?.accounts?.id && googleWrapRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback
        });
        window.google.accounts.id.renderButton(
          googleWrapRef.current,
          {
            theme: 'outline',
            size: 'large',
            width: googleBtnRef.current?.offsetWidth || 360,
            text: 'continue_with',
            shape: 'rectangular'
          }
        );
      }
    }).catch(err => {
      console.error('Google Sign-In load error:', err);
    });
  }, []);

  const handleGoogleCallback = async (response) => {
    if (googleBusy) return;
    setGoogleBusy(true);
    setErrorMsg('');
    try {
      await loginWithGoogle(response.credential);
      toast.success('Signed in with Google');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed');
      setGoogleBusy(false);
    }
  };

  const onSubmit = async (data) => {
    setErrorMsg('');
    setStatus('loading');
    try {
      await login(data.username, data.password, data.rememberMe);
      setStatus('success');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
      setStatus('idle');
    }
  };

  return (
    <PageTransition>
      <div className="w-full">
        {/* Title */}
        <div className="text-center lg:text-left mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-0 font-heading">
            Sign In
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Access your university lab console and analytics dashboard.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Authentication failed</p>
              <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
            </div>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                {...register('username', { 
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' }
                })}
                placeholder="e.g. admin or student"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.username
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary/10'
                }`}
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-[10px] font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:text-secondary dark:text-blue-400 font-semibold transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-[10px] font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me Toggle */}
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 text-primary focus:ring-primary/20 bg-white/50 cursor-pointer"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-xs text-slate-500 dark:text-slate-400 font-medium select-none cursor-pointer"
            >
              Remember my session
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status !== 'idle'}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 cursor-pointer"
          >
            {status === 'loading' && (
              <span className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Loading...
              </span>
            )}
            {status === 'success' && (
              <span className="flex items-center gap-1.5 text-green-200">
                <Check className="h-5 w-5" /> Success
              </span>
            )}
            {status === 'idle' && (
              <span className="flex items-center gap-1.5">
                Sign In <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </button>
        </form>

        {/* OR Divider */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">or</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
        </div>

        {/* Continue with Google */}
        <div className="mt-5" ref={googleBtnRef}>
          {/* GIS-rendered official button (when configured + script loaded) */}
          <div
            ref={googleWrapRef}
            className={GOOGLE_CLIENT_ID && gisReady && !googleBusy ? 'flex justify-center' : 'hidden'}
          ></div>

          {/* Fallback button — unconfigured, script still loading, or busy */}
          {(!GOOGLE_CLIENT_ID || !gisReady || googleBusy) && (
            <button
              type="button"
              disabled={googleBusy}
              onClick={() => {
                if (!GOOGLE_CLIENT_ID) {
                  toast.error('Google Sign-In is not configured. Set VITE_GOOGLE_CLIENT_ID in frontend/.env');
                } else if (!gisReady) {
                  toast.info('Google Sign-In is still loading. Please try again in a moment.');
                }
              }}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 cursor-pointer"
            >
              {googleBusy ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
                  Signing in with Google...
                </>
              ) : (
                <>
                  <GoogleGIcon />
                  Continue with Google
                </>
              )}
            </button>
          )}
        </div>

        {/* Demo Accounts Tip Card */}
        <div className="mt-6 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">💡 Demo Accounts:</span>
          Admin: <code className="bg-slate-200/50 dark:bg-slate-800 px-1 rounded">admin</code> / <code className="bg-slate-200/50 dark:bg-slate-800 px-1 rounded">admin123</code> <br />
          Student: <code className="bg-slate-200/50 dark:bg-slate-800 px-1 rounded">student</code> / <code className="bg-slate-200/50 dark:bg-slate-800 px-1 rounded">student123</code>
        </div>

        {/* Link to Register */}
        <div className="mt-8 text-center text-xs">
          <span className="text-slate-500 dark:text-slate-400">Don't have an account? </span>
          <Link
            to="/register"
            className="text-primary hover:text-secondary dark:text-blue-400 font-bold transition-colors"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;
