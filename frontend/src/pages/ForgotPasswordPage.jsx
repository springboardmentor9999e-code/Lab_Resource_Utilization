import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, CheckCircle, AlertCircle, ArrowLeft, Send, Check,
  KeyRound, Lock, Eye, EyeOff, ShieldCheck, RotateCcw
} from 'lucide-react';
import PageTransition from '../components/PageTransition';

// Steps: 'email' -> 'otp' -> 'password' -> 'done'
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Cross-step state
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailForm = useForm();
  const passwordForm = useForm();

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ---------- STEP 1: EMAIL ----------
  const onSubmitEmail = async (data) => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await authService.forgotPassword(data.email);
      setEmail(data.email);
      setInfoMsg(res.message || `An OTP has been sent to ${data.email}`);
      setStep('otp');
      setResendCooldown(30);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setInfoMsg(res.message || `A new OTP has been sent to ${email}`);
      setResendCooldown(30);
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- STEP 2: OTP ----------
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length) {
      e.preventDefault();
      const next = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtpDigits(next);
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await authService.verifyOtp(email, otp);
      setResetToken(res.data); // reset-session token from backend
      setInfoMsg('');
      setStep('password');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- STEP 3: NEW PASSWORD ----------
  const onSubmitPassword = async (data) => {
    setErrorMsg('');
    if (data.newPassword !== data.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(resetToken, data.newPassword, data.confirmPassword);
      setStep('done');
      setTimeout(() => navigate('/login'), 3500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full pl-10 pr-10 py-3 rounded-xl border bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white text-sm transition-all focus:outline-none focus:ring-2 ${
      hasError
        ? 'border-red-500 focus:ring-red-500/20'
        : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary/10'
    }`;

  const StepBadge = ({ index, label, active, done }) => (
    <div className="flex items-center gap-1.5">
      <div
        className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
          done
            ? 'bg-green-500 border-green-500 text-white'
            : active
            ? 'bg-primary border-primary text-white'
            : 'border-slate-300 dark:border-slate-700 text-slate-400'
        }`}
      >
        {done ? <Check className="h-3 w-3" /> : index}
      </div>
      <span
        className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${
          active || done ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'
        }`}
      >
        {label}
      </span>
    </div>
  );

  const stepOrder = ['email', 'otp', 'password', 'done'];
  const currentIdx = stepOrder.indexOf(step);

  return (
    <PageTransition>
      <div className="w-full">
        {/* Step indicator */}
        {step !== 'done' && (
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
            <StepBadge index={1} label="Email" active={step === 'email'} done={currentIdx > 0} />
            <div className={`h-px w-6 ${currentIdx > 0 ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
            <StepBadge index={2} label="Verify OTP" active={step === 'otp'} done={currentIdx > 1} />
            <div className={`h-px w-6 ${currentIdx > 1 ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
            <StepBadge index={3} label="New Password" active={step === 'password'} done={currentIdx > 2} />
          </div>
        )}

        {/* Error / Info boxes */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Request failed</p>
              <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
            </div>
          </motion.div>
        )}
        {infoMsg && step === 'otp' && !errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs flex items-start gap-2.5"
          >
            <Mail className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{infoMsg}</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* ============ STEP 1: EMAIL ============ */}
          {step === 'email' && (
            <motion.div
              key="step-email"
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center lg:text-left mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-0 font-heading">
                  Forgot Password?
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                  Enter your registered email address and we'll send you a 6-digit OTP to verify your identity.
                </p>
              </div>

              <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      {...emailForm.register('email', {
                        required: 'Email address is required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address syntax' }
                      })}
                      placeholder="e.g. researcher@university.edu"
                      className={inputClass(emailForm.formState.errors.email)}
                    />
                  </div>
                  {emailForm.formState.errors.email && (
                    <p className="text-red-500 text-[10px] font-semibold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Sending OTP...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      Send OTP <Send className="h-4 w-4" />
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-medium"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </Link>
              </div>
            </motion.div>
          )}

          {/* ============ STEP 2: OTP ============ */}
          {step === 'otp' && (
            <motion.div
              key="step-otp"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center lg:text-left mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-0 font-heading">
                  Enter OTP
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                  We sent a 6-digit code to <span className="font-bold text-slate-700 dark:text-slate-300">{email}</span>.
                  The code expires in 10 minutes.
                </p>
              </div>

              <form onSubmit={onSubmitOtp} className="space-y-6">
                <div className="flex justify-center lg:justify-start gap-2.5" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      autoFocus={i === 0}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="h-12 w-11 sm:h-14 sm:w-12 text-center text-xl font-extrabold rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/10 transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      Verify OTP <ShieldCheck className="h-4 w-4" />
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="inline-flex items-center gap-1.5 font-bold text-primary hover:text-secondary dark:text-blue-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setErrorMsg(''); setInfoMsg(''); }}
                  className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-medium cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Change Email
                </button>
              </div>
            </motion.div>
          )}

          {/* ============ STEP 3: NEW PASSWORD ============ */}
          {step === 'password' && (
            <motion.div
              key="step-password"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center lg:text-left mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-0 font-heading">
                  Set New Password
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                  Identity verified <CheckCircle className="inline h-3.5 w-3.5 text-green-500" />. Choose a strong new password for your account.
                </p>
              </div>

              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...passwordForm.register('newPassword', {
                        required: 'New password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      placeholder="••••••••"
                      className={inputClass(passwordForm.formState.errors.newPassword)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-red-500 text-[10px] font-semibold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Re-type New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      {...passwordForm.register('confirmPassword', {
                        required: 'Please re-type the new password',
                        validate: (v) =>
                          v === passwordForm.getValues('newPassword') || 'Passwords do not match'
                      })}
                      placeholder="••••••••"
                      className={inputClass(passwordForm.formState.errors.confirmPassword)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-[10px] font-semibold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Updating Password...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      Reset Password <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* ============ STEP 4: DONE ============ */}
          {step === 'done' && (
            <motion.div
              key="step-done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.15 }}
                className="h-16 w-16 bg-green-500/10 text-green-500 border border-green-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
              >
                <CheckCircle className="h-10 w-10" />
              </motion.div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white font-heading my-0">
                Password Reset Successful
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-3 leading-relaxed max-w-sm">
                Your password has been updated. Redirecting you to the login page...
              </p>

              <div className="mt-8">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary dark:text-blue-400 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Go to Login Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default ForgotPasswordPage;
