import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Check
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useToast } from '../components/ui/Toast';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Role mapping for Google signup
const mapRoleToBackend = (frontendRole) => {
  switch (frontendRole) {
    case 'Student': return 'STUDENT';
    case 'Researcher': return 'RESEARCHER';
    case 'Lab Technician': return 'LAB_TECHNICIAN';
    case 'Lab Manager': return 'LAB_MANAGER';
    case 'Department Head': return 'DEPARTMENT_HEAD';
    default: return 'STUDENT';
  }
};

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

const RegisterPage = () => {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const googleWrapRef = useRef(null);
  const googleBtnRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onChange', // Real-time validation
  });

  const passwordVal = watch('password', '');
  const confirmPasswordVal = watch('confirmPassword', '');
  const roleVal = watch('role', '');

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
            text: 'signup_with',
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
      const backendRole = roleVal ? mapRoleToBackend(roleVal) : 'STUDENT';
      await loginWithGoogle(response.credential, backendRole);
      toast.success('Account created with Google');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Google sign-up failed');
      setGoogleBusy(false);
    }
  };

  // Calculate Password Strength Score (0 to 5)
  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 1;
    if (pass.length >= 12) score += 1; // Extra credit for long passwords
    return score;
  };

  const strengthScore = calculatePasswordStrength(passwordVal);

  const getStrengthInfo = (score) => {
    if (score === 0) return { label: 'None', color: 'bg-slate-200 dark:bg-slate-800', textColor: 'text-slate-400' };
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
    if (score <= 4) return { label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-500' };
    return { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-500' };
  };

  const strengthInfo = getStrengthInfo(strengthScore);

  const onSubmit = async (data) => {
    setErrorMsg('');
    setStatus('loading');
    try {
      // Exclude confirmPassword before submitting
      const { confirmPassword, ...submitData } = data;
      await registerUser(submitData);
      setStatus('success');
      
      // Redirect directly to login page after 1.5 seconds so they see "Success" on the button
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
      setStatus('idle');
    }
  };

  return (
    <PageTransition>
      <div className="w-full">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="register-form"
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {/* Heading */}
              <div className="text-center lg:text-left mb-6">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-0 font-heading">
                  Create Account
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5">
                  Register now to access enterprise laboratory infrastructure scheduling.
                </p>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {/* Two Column Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      First Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <User className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="text"
                        {...register('firstName', { required: 'Required' })}
                        placeholder="John"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white text-xs transition-all focus:outline-none focus:ring-2 ${
                          errors.firstName ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary/10'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Last Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <User className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="text"
                        {...register('lastName', { required: 'Required' })}
                        placeholder="Doe"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white text-xs transition-all focus:outline-none focus:ring-2 ${
                          errors.lastName ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary/10'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <User className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="text"
                        {...register('username', { 
                          required: 'Required',
                          minLength: { value: 3, message: 'Min 3 characters' }
                        })}
                        placeholder="johndoe"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white text-xs transition-all focus:outline-none focus:ring-2 ${
                          errors.username ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary/10'
                        }`}
                      />
                    </div>
                    {errors.username && <span className="text-[9px] text-red-500 font-medium mt-1 block">{errors.username.message}</span>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Mail className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="email"
                        {...register('email', { 
                          required: 'Required',
                          pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                        })}
                        placeholder="john.doe@university.edu"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white text-xs transition-all focus:outline-none focus:ring-2 ${
                          errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary/10'
                        }`}
                      />
                    </div>
                    {errors.email && <span className="text-[9px] text-red-500 font-medium mt-1 block">{errors.email.message}</span>}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Phone className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="tel"
                        {...register('phoneNumber', { 
                          required: 'Required',
                          pattern: { value: /^\+?[0-9]{10,15}$/, message: 'Invalid format (10-15 digits)' }
                        })}
                        placeholder="+91 98765 43210"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white text-xs transition-all focus:outline-none focus:ring-2 ${
                          errors.phoneNumber ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary/10'
                        }`}
                      />
                    </div>
                    {errors.phoneNumber && <span className="text-[9px] text-red-500 font-medium mt-1 block">{errors.phoneNumber.message}</span>}
                  </div>

                  {/* Role Dropdown */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Account Role
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                        <Briefcase className="h-3.5 w-3.5" />
                      </span>
                      <select
                        {...register('role', { required: 'Required' })}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-white/50 dark:bg-slate-900/50 dark:text-white text-xs transition-all focus:outline-none focus:ring-2 appearance-none ${
                          errors.role ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary/10'
                        }`}
                      >
                        <option value="" className="dark:bg-slate-950">Select Role...</option>
                        <option value="Student" className="dark:bg-slate-950">Student</option>
                        <option value="Researcher" className="dark:bg-slate-950">Researcher</option>
                        <option value="Lab Technician" className="dark:bg-slate-950">Lab Technician</option>
                        <option value="Lab Manager" className="dark:bg-slate-950">Lab Manager</option>
                        <option value="Department Head" className="dark:bg-slate-950">Department Head</option>
                        <option value="Institution Admin" className="dark:bg-slate-950">Institution Admin</option>
                        <option value="System Admin" className="dark:bg-slate-950">System Admin</option>
                      </select>
                      <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none text-[8px]">▼</span>
                    </div>
                  </div>

                  {/* Institution */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Institution Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Building className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="text"
                        {...register('institution', { required: 'Required' })}
                        placeholder="Infosys Springboard University"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white text-xs transition-all focus:outline-none focus:ring-2 ${
                          errors.institution ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary/10'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Department
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Building className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="text"
                        {...register('department', { required: 'Required' })}
                        placeholder="Computer Science"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white text-xs transition-all focus:outline-none focus:ring-2 ${
                          errors.department ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary/10'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Lock className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="password"
                        {...register('password', { 
                          required: 'Required',
                          minLength: { value: 8, message: 'At least 8 characters required' }
                        })}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white text-xs transition-all focus:outline-none focus:ring-2 ${
                          errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary/10'
                        }`}
                      />
                    </div>
                    {errors.password && <span className="text-[9px] text-red-500 font-medium mt-1 block">{errors.password.message}</span>}
                    
                    {/* Password Strength Meter */}
                    {passwordVal && (
                      <div className="mt-2.5 space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-bold">
                          <span className="text-slate-400 uppercase">Strength:</span>
                          <span className={strengthInfo.textColor}>{strengthInfo.label}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`h-full flex-1 transition-colors duration-300 ${
                                i < strengthScore ? strengthInfo.color : 'bg-slate-200 dark:bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Lock className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="password"
                        {...register('confirmPassword', { 
                          required: 'Required',
                          validate: (value) => value === passwordVal || 'Passwords do not match'
                        })}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white text-xs transition-all focus:outline-none focus:ring-2 ${
                          errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary/10'
                        }`}
                      />
                    </div>
                    {errors.confirmPassword && <span className="text-[9px] text-red-500 font-medium mt-1 block">{errors.confirmPassword.message}</span>}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={status !== 'idle'}
                  className="w-full mt-2 flex items-center justify-center py-2.5 px-4 rounded-xl shadow-lg text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 cursor-pointer"
                >
                  {status === 'loading' && (
                    <span className="flex items-center gap-1.5">
                      <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Loading...
                    </span>
                  )}
                  {status === 'success' && (
                    <span className="flex items-center gap-1 text-green-200">
                      <Check className="h-4.5 w-4.5" /> Success
                    </span>
                  )}
                  {status === 'idle' && (
                    <span className="flex items-center gap-1">
                      Register Account <ArrowRight className="h-3.5 w-3.5" />
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
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 cursor-pointer"
                  >
                    {googleBusy ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
                        Signing up with Google...
                      </>
                    ) : (
                      <>
                        <GoogleGIcon />
                        Sign up with Google
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Login link */}
              <div className="mt-6 text-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Already registered? </span>
                <Link
                  to="/login"
                  className="text-primary hover:text-secondary dark:text-blue-400 font-bold transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </motion.div>
          ) : (
            /* Successful Registration Screen */
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.15 }}
                className="h-16 w-16 bg-green-500/10 text-green-500 border border-green-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/5"
              >
                <CheckCircle2 className="h-10 w-10" />
              </motion.div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white font-heading my-0">
                Registration Successful!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-3 leading-relaxed max-w-sm">
                Your profile has been registered in the database. Redirecting you to the sign-in console to verify credentials.
              </p>
              <div className="mt-8 flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-secondary rounded-full animate-bounce delay-150"></div>
                <div className="h-2 w-2 bg-accent rounded-full animate-bounce delay-300"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default RegisterPage;
