import { Eye, EyeOff, FlaskConical, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import api from '../api/client.js';
import { resolvePermittedPath } from '../auth/permissions.js';
import { getStoredUser, getToken, saveSession } from '../auth/session.js';

const trustItems = [
  'Role-based access',
  'Shared equipment queue',
  'Maintenance visibility',
];

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = location.state?.from?.pathname ?? '/';
  const storedUser = useMemo(() => getStoredUser(), []);
  const alreadyAuthenticated = useMemo(() => Boolean(getToken() && storedUser), [storedUser]);

  useEffect(() => {
    setError('');
  }, [email, password]);

  if (alreadyAuthenticated) {
    return <Navigate to={resolvePermittedPath(storedUser, redirectTo)} replace />;
  }

  async function submitLogin(event) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      saveSession(response.data);
      navigate(resolvePermittedPath(response.data.user, redirectTo), { replace: true });
    } catch (requestError) {
      if (!requestError.response) {
        setError('Backend sign-in is offline. Start the API and try again.');
        return;
      }

      setError(
        requestError.response?.data?.message ??
          'Unable to sign in. Check your credentials or backend connection.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(420px,540px)]">
        <section className="hidden border-r border-slate-200 bg-white px-10 py-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <img src="/lab-mark.svg" alt="" className="h-12 w-12 rounded-lg" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">LRUP</p>
                <h1 className="text-xl font-bold leading-tight">Lab Resources</h1>
              </div>
            </div>

            <div className="mt-16 max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Central Research Lab
              </p>
              <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-950">
                Sign in to manage bookings, equipment, and maintenance.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
                Keep lab utilization decisions close to the people approving requests and maintaining shared assets.
              </p>
            </div>
          </div>

          <div className="grid max-w-xl gap-3">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-3 border-t border-slate-100 py-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3 lg:hidden">
              <img src="/lab-mark.svg" alt="" className="h-11 w-11 rounded-lg" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">LRUP</p>
                <h1 className="text-lg font-bold leading-tight">Lab Resources</h1>
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                <FlaskConical className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-bold tracking-normal text-slate-950">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">Use your lab account to continue.</p>
            </div>

            <form className="mt-7 space-y-5" onSubmit={submitLogin}>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <span className="relative mt-2 block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    autoComplete="email"
                    className="focus-ring h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@lab.edu"
                    type="email"
                    value={email}
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <span className="relative mt-2 block">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    autoComplete="current-password"
                    className="focus-ring h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                  />
                  <button
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="focus-ring absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    onClick={() => setShowPassword((current) => !current)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    type="button"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>

              {error ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                  {error}
                </p>
              ) : null}

              <button
                className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={isSubmitting}
                type="submit"
              >
                <LogIn className="h-4 w-4" />
                {isSubmitting ? 'Signing in' : 'Sign in'}
              </button>

              <p className="text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <Link className="font-semibold text-sky-700 hover:text-sky-800" to="/register">
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
