import {
  ArrowLeft,
  Eye,
  EyeOff,
  FlaskConical,
  Lock,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { resolvePermittedPath } from '../auth/permissions.js';
import { getStoredUser, getToken } from '../auth/session.js';
import { getApiErrorMessage } from '../services/apiError.js';
import { register } from '../services/authService.js';

const trustItems = [
  'Role-based access',
  'Shared equipment queue',
  'Maintenance visibility',
];

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(values) {
  const errors = {};
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const email = values.email.trim();

  if (!firstName) {
    errors.firstName = 'First name is required.';
  }

  if (!lastName) {
    errors.lastName = 'Last name is required.';
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!validateEmail(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (!/[A-Z]/.test(values.password)) {
    errors.password = 'Password must contain an uppercase letter.';
  } else if (!/[a-z]/.test(values.password)) {
    errors.password = 'Password must contain a lowercase letter.';
  } else if (!/\d/.test(values.password)) {
    errors.password = 'Password must contain a number.';
  } else if (!/[^A-Za-z0-9]/.test(values.password)) {
    errors.password = 'Password must contain a special character.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords must match.';
  }

  return errors;
}

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm font-medium text-rose-700">{message}</p>;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const storedUser = useMemo(() => getStoredUser(), []);
  const alreadyAuthenticated = useMemo(() => Boolean(getToken() && storedUser), [storedUser]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [navigate, successMessage]);

  if (alreadyAuthenticated) {
    return <Navigate to={resolvePermittedPath(storedUser, '/')} replace />;
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
    setSuccessMessage('');
    setFieldErrors((current) => ({ ...current, [field]: '' }));
  }

  async function submitRegistration(event) {
    event.preventDefault();

    const errors = validateForm(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setSuccessMessage('Account created successfully. Please sign in.');
      setForm(initialForm);
      setFieldErrors({});
    } catch (requestError) {
      const validationErrors = requestError?.response?.data?.validationErrors;

      if (validationErrors) {
        setFieldErrors(validationErrors);
      }

      setError(getApiErrorMessage(requestError, 'Unable to create the account.'));
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
                Create a student account for lab bookings and equipment access.
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
              <h2 className="mt-5 text-2xl font-bold tracking-normal text-slate-950">
                Create account
              </h2>
              <p className="mt-2 text-sm text-slate-500">Use your student details to get started.</p>
            </div>

            <form className="mt-7 space-y-5" onSubmit={submitRegistration}>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">First Name</span>
                <span className="relative mt-2 block">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    autoComplete="given-name"
                    className="focus-ring h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
                    onChange={(event) => updateField('firstName', event.target.value)}
                    placeholder="John"
                    type="text"
                    value={form.firstName}
                  />
                </span>
                <FieldError message={fieldErrors.firstName} />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Last Name</span>
                <span className="relative mt-2 block">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    autoComplete="family-name"
                    className="focus-ring h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
                    onChange={(event) => updateField('lastName', event.target.value)}
                    placeholder="Doe"
                    type="text"
                    value={form.lastName}
                  />
                </span>
                <FieldError message={fieldErrors.lastName} />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <span className="relative mt-2 block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    autoComplete="email"
                    className="focus-ring h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="name@lab.edu"
                    type="email"
                    value={form.email}
                  />
                </span>
                <FieldError message={fieldErrors.email} />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <span className="relative mt-2 block">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    autoComplete="new-password"
                    className="focus-ring h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400"
                    onChange={(event) => updateField('password', event.target.value)}
                    placeholder="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
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
                <FieldError message={fieldErrors.password} />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Confirm Password</span>
                <span className="relative mt-2 block">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    autoComplete="new-password"
                    className="focus-ring h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400"
                    onChange={(event) => updateField('confirmPassword', event.target.value)}
                    placeholder="Confirm password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                  />
                  <button
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="focus-ring absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    type="button"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </span>
                <FieldError message={fieldErrors.confirmPassword} />
              </label>

              {error ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                  {error}
                </p>
              ) : null}

              {successMessage ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  {successMessage}
                </p>
              ) : null}

              <button
                className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={isSubmitting || Boolean(successMessage)}
                type="submit"
              >
                <UserPlus className="h-4 w-4" />
                {isSubmitting ? 'Creating account' : 'Create Account'}
              </button>

              <Link
                className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                to="/login"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
