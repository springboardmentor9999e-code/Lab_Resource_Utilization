import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdScience, MdEmail, MdLock, MdVisibility, MdVisibilityOff,
  MdBusiness, MdCheckCircle, MdError, MdInfo, MdHelpOutline
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { institutionService } from '../services/services';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: localStorage.getItem('remember_email') || '',
    password: '',
    rememberMe: Boolean(localStorage.getItem('remember_email'))
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const [institutions, setInstitutions] = useState([]);
  const [detectedInst, setDetectedInst] = useState(null);

  useEffect(() => {
    institutionService.getApproved()
      .then(r => setInstitutions(r.data?.data || []))
      .catch(() => setInstitutions([]));
  }, []);

  useEffect(() => {
    if (form.email && form.email.includes('@')) {
      const domain = form.email.split('@')[1]?.toLowerCase();
      if (domain) {
        const found = institutions.find(i =>
          (i.email && i.email.toLowerCase().includes(domain)) ||
          (i.website && i.website.toLowerCase().includes(domain)) ||
          (i.code && domain.includes(i.code.toLowerCase()))
        );
        setDetectedInst(found || null);
      }
    } else {
      setDetectedInst(null);
    }
  }, [form.email, institutions]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (form.rememberMe) {
      localStorage.setItem('remember_email', form.email);
    } else {
      localStorage.removeItem('remember_email');
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Left panel — Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#090d22] flex-col items-center justify-center p-12 relative overflow-hidden select-none">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 text-center max-w-lg">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30">
            <MdScience className="text-white text-4xl" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">LabHub Platform</h1>
          <p className="text-slate-300 text-base font-medium leading-relaxed">
            Multi-Institution Laboratory Resource Sharing & Utilization Management Platform
          </p>

          {/* Stats Badges */}
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              { label: 'Institutions', value: '15+', desc: 'Andhra Pradesh Network' },
              { label: 'Lab Equipment', value: '150+', desc: 'HPC, AI, Microscopes' },
              { label: 'Active Users', value: '670+', desc: 'Researchers & Techs' },
              { label: 'Resource Sharing', value: '100%', desc: 'Inter-Lab Utilization' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner">
                <div className="text-purple-400 text-2xl font-black">{stat.value}</div>
                <div className="text-white text-sm font-bold">{stat.label}</div>
                <div className="text-slate-400 text-xs">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <MdScience className="text-white text-xl" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-lg">LabHub</div>
              <div className="text-slate-500 text-xs font-semibold">Lab Resource Utilization Platform</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl p-8 sm:p-10 transition-all">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">Welcome Back</h2>
              <p className="text-slate-500 text-sm mt-1">Sign in with your institution credentials</p>
            </div>

            {/* Recognized Institution Preview */}
            {detectedInst && (
              <div className="mb-5 p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-center gap-3 animate-fade-in">
                <div className="w-9 h-9 bg-purple-600 text-white font-bold text-xs rounded-xl flex items-center justify-center flex-shrink-0">
                  {detectedInst.code || 'AP'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-purple-900 truncate">{detectedInst.name}</div>
                  <div className="text-[11px] text-purple-700 font-medium truncate">Recognized Institution Partner</div>
                </div>
                <MdCheckCircle className="text-purple-600 text-lg flex-shrink-0" />
              </div>
            )}

            {error && (
              <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-shake">
                <MdError className="text-rose-600 text-lg flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label">Official Email Address *</label>
                <div className="relative">
                  <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="user@au.edu.in"
                    className="form-input pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="form-label mb-0">Password *</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-bold transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="form-input pl-10 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <MdVisibilityOff className="text-lg" /> : <MdVisibility className="text-lg" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={form.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs text-slate-600 font-semibold">Remember Me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3.5 text-sm font-extrabold rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200/80 pt-6 text-center space-y-3">
              <p className="text-xs text-slate-600 font-medium">
                Don't have a researcher account?{' '}
                <Link to="/register" className="text-purple-600 hover:text-purple-700 font-bold underline">
                  Register User
                </Link>
              </p>

              <div className="p-3 bg-slate-100/70 border border-slate-200/80 rounded-2xl text-xs text-slate-600 flex items-center justify-between">
                <span>Are you an institution onboarding?</span>
                <Link to="/register-institution" className="text-purple-700 font-bold hover:underline">
                  Apply Here →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <h3 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <MdHelpOutline className="text-purple-600" /> Reset Password
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your registered official email address to receive password reset instructions.
            </p>

            {forgotSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold mb-4">
                ✅ Password reset instructions sent to your email!
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  placeholder="name@institution.edu.in"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="form-input"
                  required
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForgotModal(false)} className="btn-secondary text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs">
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
