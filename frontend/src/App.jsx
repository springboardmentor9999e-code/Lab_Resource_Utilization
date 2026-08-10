import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import {
  // Core Icons - Authentication
  Mail, Lock, Eye, EyeOff, LogIn, UserPlus, KeyRound, ArrowLeft,
  
  // Core Icons - Navigation & Dashboard
  LayoutDashboard, Calendar, BarChart3, Share2, Clock, GraduationCap,
  ChevronDown, LogOut, User as UserIcon, Search, Bell,
  
  // Equipment Icons
  Microscope, TestTube2, FlaskConical, Dna, Laptop2, Bot,
  Pipette, Cross, Atom, Cpu, Beaker,
  
  // Management Icons
  Wrench, ClipboardList, Building2, Users, ShieldCheck,
  
  // Action Icons
  Camera, Upload, X, Check, AlertCircle, CheckCircle, Sparkles,
  Plus, Minus, Trash, Edit, Printer,
  
  // Analytics & Billing
  DollarSign, Wallet, PieChart, Award, Zap, Target, Activity,
  Download, Settings, Database, LineChart, FileText,
  CreditCard, Receipt, AlertTriangle,
  
  // Sharing & Communication
  MessageCircle, Phone, Mail as MailIcon, Globe,
  
  // Status & Indicators
  Flame, TrendingUp, Calendar as CalendarIcon, Clock as ClockIcon,
  
  // Maintenance
  Thermometer, RefreshCw,
  
  // Misc
  BookOpen, Layers, Package, UserCheck, UserX, Shield,
  Server, HardDrive, Monitor, Cloud,
  Home as HomeIcon, Building, Truck, Briefcase, MapPin, Navigation,
  DownloadCloud, UploadCloud, ArrowUp, ArrowDown,
  ArrowLeft as ArrowLeftIcon, ArrowRight,
  CheckCircle as CheckCircleIcon, XCircle,
  Lock as LockIcon, Unlock,
  ShieldCheck as ShieldCheckIcon,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart as RePieChart,
  Pie, Cell, Line, AreaChart, Area, ComposedChart
} from 'recharts';

// ====== PDF EXPORT LIBRARIES ======
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ==================== CONSTANTS ====================
const API = 'http://localhost:8080/api';

const REQUESTABLE_ROLES = ['LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMINISTRATOR'];
const ALL_ROLES = [
  'RESEARCHER_STUDENT', 'LAB_TECHNICIAN', 'LAB_MANAGER',
  'DEPARTMENT_HEAD', 'INSTITUTION_ADMINISTRATOR', 'SYSTEM_ADMINISTRATOR',
];

const FLOATING_ICONS = [
  { Icon: Microscope, top: '8%', left: '6%', size: 44, duration: 7, delay: 0, rotate: 8, blur: false, opacity: 0.08 },
  { Icon: TestTube2, top: '18%', left: '85%', size: 36, duration: 6, delay: 0.5, rotate: -12, blur: false, opacity: 0.06 },
  { Icon: Dna, top: '65%', left: '90%', size: 52, duration: 9, delay: 1, rotate: 15, blur: true, opacity: 0.06 },
  { Icon: FlaskConical, top: '78%', left: '10%', size: 40, duration: 8, delay: 0.3, rotate: -10, blur: false, opacity: 0.08 },
  { Icon: Laptop2, top: '35%', left: '3%', size: 34, duration: 6.5, delay: 1.2, rotate: 6, blur: true, opacity: 0.06 },
  { Icon: Bot, top: '5%', left: '45%', size: 38, duration: 7.5, delay: 0.8, rotate: -8, blur: false, opacity: 0.06 },
  { Icon: Pipette, top: '50%', left: '92%', size: 30, duration: 6, delay: 0.2, rotate: 20, blur: false, opacity: 0.08 },
  { Icon: Cross, top: '85%', left: '55%', size: 32, duration: 8, delay: 1.5, rotate: 0, blur: true, opacity: 0.06 },
  { Icon: Atom, top: '25%', left: '70%', size: 46, duration: 9.5, delay: 0.6, rotate: 25, blur: false, opacity: 0.08 },
  { Icon: Cpu, top: '60%', left: '20%', size: 34, duration: 7, delay: 1, rotate: -15, blur: true, opacity: 0.06 },
  { Icon: Beaker, top: '12%', left: '25%', size: 30, duration: 6.5, delay: 0.4, rotate: 10, blur: false, opacity: 0.08 },
];

// ==================== UTILITY FUNCTIONS ====================
function statusColor(status) {
  const colors = {
    'PENDING_APPROVAL': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    'CONFIRMED': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    'IN_USE': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    'COMPLETED': 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
    'CANCELLED': 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    'NO_SHOW': 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
  };
  return colors[status] || colors['COMPLETED'];
}

function maintenanceStatusColor(status) {
  const colors = {
    'SCHEDULED': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    'IN_PROGRESS': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    'COMPLETED': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    'OVERDUE': 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
  };
  return colors[status] || colors['SCHEDULED'];
}

function sharingStatusColor(status) {
  const colors = {
    'PENDING': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    'APPROVED': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    'REJECTED': 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
  };
  return colors[status] || colors['PENDING'];
}

function waitlistStatusColor(status) {
  const colors = {
    'WAITING': 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
    'NOTIFIED': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    'FULFILLED': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    'CANCELLED': 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
  };
  return colors[status] || colors['WAITING'];
}

function usageLevelColor(level) {
  const colors = {
    'Idle': 'bg-slate-500/30 text-slate-400 border border-slate-500/30',
    'Low': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    'Moderate': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    'High': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
  };
  return colors[level] || colors['Idle'];
}

function barColor(level) {
  const colors = {
    'Idle': 'bg-slate-500',
    'Low': 'bg-amber-500',
    'Moderate': 'bg-blue-500',
    'High': 'bg-emerald-500'
  };
  return colors[level] || 'bg-slate-500';
}

function roleRequestStatusColor(status) {
  const colors = {
    'PENDING': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    'APPROVED': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    'REJECTED': 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
  };
  return colors[status] || colors['PENDING'];
}

function getNavItems(role) {
  const items = [];
  items.push({ key: 'overview', label: 'Dashboard', icon: LayoutDashboard });
  items.push({ key: 'booking', label: 'Booking', icon: Calendar });
  items.push({ key: 'utilization', label: 'Utilization', icon: BarChart3 });
  items.push({ key: 'heatmap', label: 'Heatmap', icon: Flame });
  items.push({ key: 'demand', label: 'Demand', icon: TrendingUp });
  items.push({ key: 'sharing', label: 'Sharing', icon: Share2 });
  items.push({ key: 'waitlist', label: 'Waitlist', icon: Clock });
  items.push({ key: 'analytics', label: 'Analytics', icon: PieChart });

  if (role === 'LAB_MANAGER' || role === 'INSTITUTION_ADMINISTRATOR' || role === 'DEPARTMENT_HEAD') {
    items.push({ key: 'costBilling', label: 'Cost & Billing', icon: DollarSign });
  }

  if (role === 'LAB_MANAGER' || role === 'LAB_TECHNICIAN') {
    items.push({ key: 'maintenance', label: 'Maintenance', icon: Wrench });
    items.push({ key: 'calibration', label: 'Calibration', icon: Thermometer });
  }

  if (role === 'LAB_MANAGER') {
    items.push({ key: 'equipment', label: 'Equipment', icon: FlaskConical });
  }

  if (role === 'DEPARTMENT_HEAD') {
    items.push({ key: 'requests', label: 'Requests', icon: ClipboardList });
  }

  if (role === 'INSTITUTION_ADMINISTRATOR') {
    items.push({ key: 'institutions', label: 'Institutions', icon: Building2 });
    items.push({ key: 'users', label: 'Users', icon: Users });
  }

  if (role === 'SYSTEM_ADMINISTRATOR') {
    items.push({ key: 'users', label: 'Users', icon: Users });
    items.push({ key: 'roleRequestsAdmin', label: 'Role Requests', icon: ShieldCheck });
    items.push({ key: 'systemSettings', label: 'System Settings', icon: Settings });
  }

  if (role !== 'SYSTEM_ADMINISTRATOR') {
    items.push({ key: 'roleRequest', label: 'My Role', icon: GraduationCap });
  }

  items.push({ key: 'reports', label: 'Reports', icon: FileText });
  items.push({ key: 'myProfile', label: 'Profile', icon: UserIcon });
  return items;
}

// ==================== FLOATING BACKGROUND ====================
function FloatingLabBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
      {FLOATING_ICONS.map(({ Icon, top, left, size, duration, delay, rotate, blur, opacity }, i) => (
        <motion.div
          key={i}
          className="absolute text-white/10"
          style={{ top, left, opacity, filter: blur ? 'blur(2px)' : 'none' }}
          animate={{ y: [0, -18, 0], rotate: [0, rotate, 0] }}
          transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={size} strokeWidth={1.2} />
        </motion.div>
      ))}
    </div>
  );
}

// ==================== AUTH PAGE ====================
function AuthPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerDesiredRole, setRegisterDesiredRole] = useState('RESEARCHER_STUDENT');
  const [registerProfileType, setRegisterProfileType] = useState('STUDENT');
  const [registerInstitutionId, setRegisterInstitutionId] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerFieldErrors, setRegisterFieldErrors] = useState({});
  
  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [devOnlyToken, setDevOnlyToken] = useState('');

  const [publicInstitutions, setPublicInstitutions] = useState([]);

  useEffect(() => {
    axios.get(`${API}/institutions/public`)
      .then((response) => setPublicInstitutions(response.data))
      .catch((error) => console.error('Failed to fetch institutions', error));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    const errors = {};
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email address';
    if (!password) errors.password = 'Password is required';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const token = response.data.token;
      const decoded = jwtDecode(token);
      
      onLogin({
        token,
        email: decoded.sub,
        role: decoded.role,
        name: decoded.name,
        institutionId: decoded.institutionId || null,
        profileType: decoded.profileType || 'STUDENT'
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterMessage('');

    const errors = {};
    if (!registerName.trim()) errors.name = 'Full name is required';
    if (!registerEmail.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(registerEmail)) errors.email = 'Enter a valid email address';
    if (!registerPassword) errors.password = 'Password is required';
    else if (registerPassword.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!agreeTerms) errors.terms = 'Please agree to the terms and conditions';

    setRegisterFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setRegisterLoading(true);
    try {
      await axios.post(`${API}/auth/register`, {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        desiredRole: registerDesiredRole,
        profileType: registerProfileType,
        institutionId: registerInstitutionId ? parseInt(registerInstitutionId) : null,
      });

      setRegisterMessage(
        registerDesiredRole === 'RESEARCHER_STUDENT'
          ? 'Account created! You can now log in.'
          : `Account created! Your request for ${registerDesiredRole.replace('_', ' ')} is pending admin approval.`
      );
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterDesiredRole('RESEARCHER_STUDENT');
      setRegisterProfileType('STUDENT');
      setRegisterInstitutionId('');
      setAgreeTerms(false);
      setTimeout(() => setIsLogin(true), 2000);
    } catch (error) {
      setRegisterMessage(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    setDevOnlyToken('');
    try {
      const response = await axios.post(`${API}/auth/forgot-password`, { email: forgotEmail });
      setForgotMessage(response.data.message);
      if (response.data.devOnlyToken) setDevOnlyToken(response.data.devOnlyToken);
    } catch (error) {
      setForgotMessage(error.response?.data?.message || 'Could not reach the server');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');
    try {
      const response = await axios.post(`${API}/auth/reset-password`, {
        token: resetToken,
        newPassword: resetNewPassword,
      });
      setResetMessage(response.data.message);
      setResetToken('');
      setResetNewPassword('');
      setTimeout(() => {
        setResetMode(false);
        setIsLogin(true);
        setResetMessage('');
      }, 3000);
    } catch (error) {
      setResetMessage(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  // Auth Floating Icons
  const authFloatingIcons = [
    { Icon: Microscope, top: '8%', left: '6%', size: 44, duration: 7, delay: 0, rotate: 8 },
    { Icon: FlaskConical, top: '78%', left: '10%', size: 40, duration: 8, delay: 0.3, rotate: -10 },
    { Icon: Dna, top: '18%', left: '85%', size: 36, duration: 6, delay: 0.5, rotate: -12 },
    { Icon: TestTube2, top: '65%', left: '90%', size: 32, duration: 9, delay: 1, rotate: 15 },
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Floating Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
        {authFloatingIcons.map(({ Icon, top, left, size, duration, delay, rotate }, i) => (
          <motion.div
            key={i}
            className="absolute text-white/10"
            style={{ top, left }}
            animate={{ y: [0, -18, 0], rotate: [0, rotate, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon size={size} strokeWidth={1.2} />
          </motion.div>
        ))}
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[380px]"
      >
        <div className="relative rounded-xl p-[1px] bg-gradient-to-br from-slate-600/30 via-slate-500/10 to-blue-400/20 shadow-xl">
          <div className="bg-slate-800/90 backdrop-blur-2xl rounded-xl p-6 border border-slate-700">

            {/* Logo & Title */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-2xl font-bold mb-3 shadow-lg shadow-blue-500/30"
              >
                <Microscope size={28} strokeWidth={1.8} />
              </motion.div>
              <h1 className="text-xl font-bold text-white tracking-tight">Lab Resource Platform</h1>
              <p className="text-slate-400 text-xs mt-1 font-light">
                {resetMode ? 'Reset your password' :
                 isLogin ? 'Sign in to manage lab equipment and bookings' : 'Create your account to get started'}
              </p>
            </div>

            {/* Toggle Buttons */}
            {!resetMode && (
              <div className="flex mb-5 bg-slate-700/30 rounded-lg p-0.5 border border-slate-600">
                <button
                  onClick={() => { setIsLogin(true); setMessage(''); setRegisterMessage(''); setFieldErrors({}); setRegisterFieldErrors({}); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                    isLogin 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => { setIsLogin(false); setMessage(''); setRegisterMessage(''); setFieldErrors({}); setRegisterFieldErrors({}); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                    !isLogin 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  Register
                </button>
              </div>
            )}

            {/* Reset Password Mode */}
            {resetMode ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <p className="text-xs text-slate-400 mb-4">Enter the reset token and choose a new password.</p>
                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Reset Token</label>
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-300 hover:border-slate-500 font-mono"
                      placeholder="Paste your token"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="password"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-300 hover:border-slate-500"
                        placeholder="New password"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 text-sm"
                  >
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                  </motion.button>
                </form>

                {resetMessage && (
                  <div className={`mt-3 text-xs text-center p-2.5 rounded-lg ${
                    resetMessage.includes('successful') 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {resetMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => { setResetMode(false); setIsLogin(true); setResetMessage(''); }}
                  className="mt-3 text-xs text-slate-400 hover:text-slate-300 w-full text-center flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowLeft size={12} /> Back to Login
                </button>
              </motion.div>
            ) : isLogin ? (
              /* Login Form */
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
                    <div className="relative group">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null }); }}
                        className={`w-full pl-9 pr-3 py-2.5 bg-slate-700/50 border rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 outline-none transition-all duration-300 ${
                          fieldErrors.email 
                            ? 'border-rose-500 focus:ring-rose-500/30' 
                            : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-slate-500'
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {fieldErrors.email && <p className="text-xs text-rose-400 mt-1.5">{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-medium text-slate-300">Password</label>
                      <button 
                        type="button" 
                        onClick={() => { setResetMode(true); setForgotEmail(email); }}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        Forget Password?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null }); }}
                        className={`w-full pl-9 pr-9 py-2.5 bg-slate-700/50 border rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 outline-none transition-all duration-300 ${
                          fieldErrors.password 
                            ? 'border-rose-500 focus:ring-rose-500/30' 
                            : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-slate-500'
                        }`}
                        placeholder="Enter your password"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="text-xs text-rose-400 mt-1.5">{fieldErrors.password}</p>}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-700/50 text-blue-500 focus:ring-blue-500/30 focus:ring-offset-0"
                      />
                      Remember me
                    </label>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <ShieldCheck size={12} />
                      <span>Secure</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn size={15} />
                        Sign In
                      </>
                    )}
                  </motion.button>
                </form>

                {message && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 text-xs text-center p-2.5 rounded-lg ${
                      message.includes('successful') 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {message}
                  </motion.div>
                )}

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-slate-800/90 text-slate-500">or</span>
                  </div>
                </div>

                <p className="text-center text-xs text-slate-500">
                  Don't have an account?{' '}
                  <button
                    onClick={() => { setIsLogin(false); setMessage(''); }}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Register here
                  </button>
                </p>
              </motion.div>
            ) : (
              /* Register Form */
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <form onSubmit={handleRegister} className="space-y-3.5 max-h-[55vh] overflow-y-auto pr-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => { setRegisterName(e.target.value); if (registerFieldErrors.name) setRegisterFieldErrors({ ...registerFieldErrors, name: null }); }}
                      className={`w-full px-3 py-2.5 bg-slate-700/50 border rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 outline-none transition-all duration-300 ${
                        registerFieldErrors.name 
                          ? 'border-rose-500 focus:ring-rose-500/30' 
                          : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-slate-500'
                      }`}
                      placeholder="Your full name"
                    />
                    {registerFieldErrors.name && <p className="text-xs text-rose-400 mt-1.5">{registerFieldErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={registerEmail}
                        onChange={(e) => { setRegisterEmail(e.target.value); if (registerFieldErrors.email) setRegisterFieldErrors({ ...registerFieldErrors, email: null }); }}
                        className={`w-full pl-9 pr-3 py-2.5 bg-slate-700/50 border rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 outline-none transition-all duration-300 ${
                          registerFieldErrors.email 
                            ? 'border-rose-500 focus:ring-rose-500/30' 
                            : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-slate-500'
                        }`}
                        placeholder="you@institution.edu"
                      />
                    </div>
                    {registerFieldErrors.email && <p className="text-xs text-rose-400 mt-1.5">{registerFieldErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        value={registerPassword}
                        onChange={(e) => { setRegisterPassword(e.target.value); if (registerFieldErrors.password) setRegisterFieldErrors({ ...registerFieldErrors, password: null }); }}
                        className={`w-full pl-9 pr-9 py-2.5 bg-slate-700/50 border rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 outline-none transition-all duration-300 ${
                          registerFieldErrors.password 
                            ? 'border-rose-500 focus:ring-rose-500/30' 
                            : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-slate-500'
                        }`}
                        placeholder="Create a password"
                      />
                      <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {registerFieldErrors.password ? (
                      <p className="text-xs text-rose-400 mt-1.5">{registerFieldErrors.password}</p>
                    ) : (
                      <p className="text-[10px] text-slate-500 mt-1.5">Password must be at least 6 characters</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Institution (Optional)</label>
                    <select
                      value={registerInstitutionId}
                      onChange={(e) => setRegisterInstitutionId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-300 hover:border-slate-500 [&>option]:bg-slate-800"
                    >
                      <option value="" className="bg-slate-800">No institution</option>
                      {publicInstitutions.map((inst) => (
                        <option key={inst.id} value={inst.id} className="bg-slate-800">{inst.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Desired Role</label>
                    <select
                      value={registerDesiredRole}
                      onChange={(e) => setRegisterDesiredRole(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-300 hover:border-slate-500 [&>option]:bg-slate-800"
                    >
                      <option value="RESEARCHER_STUDENT" className="bg-slate-800">Researcher / Student</option>
                      <option value="LAB_TECHNICIAN" className="bg-slate-800">Lab Technician</option>
                      <option value="LAB_MANAGER" className="bg-slate-800">Lab Manager</option>
                      <option value="DEPARTMENT_HEAD" className="bg-slate-800">Department Head</option>
                      <option value="INSTITUTION_ADMINISTRATOR" className="bg-slate-800">Institution Admin</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1.5">Other roles require admin approval</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded border-slate-600 bg-slate-700/50 text-blue-500 focus:ring-blue-500/30"
                      required
                    />
                    <label className="text-[10px] text-slate-400">
                      I agree to the{' '}
                      <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Terms</a>
                      {' '}&{' '}
                      <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</a>
                    </label>
                  </div>
                  {registerFieldErrors.terms && <p className="text-xs text-rose-400 mt-1">{registerFieldErrors.terms}</p>}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={registerLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {registerLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus size={15} />
                        Create Account
                      </>
                    )}
                  </motion.button>
                </form>

                {registerMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 text-xs text-center p-2.5 rounded-lg ${
                      registerMessage.includes('created') 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {registerMessage}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Footer - Security Badges */}
            {!resetMode && (
              <div className="mt-5 pt-4 border-t border-slate-700 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-slate-500" />
                  Secure Login
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={12} className="text-slate-500" />
                  SSL Encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-slate-500" />
                  Verified
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== NOTIFICATION CENTER ====================
function NotificationCenter({ token, onNotificationCount }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    setupWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [token]);

  useEffect(() => {
    if (onNotificationCount) {
      onNotificationCount(unreadCount);
    }
  }, [unreadCount]);

  const setupWebSocket = () => {
    try {
      wsRef.current = new WebSocket(`ws://localhost:8080/ws/notifications?token=${token}`);
      wsRef.current.onmessage = (event) => {
        const notif = JSON.parse(event.data);
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
        if (Notification.permission === 'granted') {
          new Notification(notif.title, {
            body: notif.message,
            icon: '/favicon.ico'
          });
        }
      };
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/notifications/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data || []);
      const unread = (response.data || []).filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API}/notifications/mine/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'BOOKING_CONFIRMED': <Check className="text-emerald-400" size={18} />,
      'BOOKING_REMINDER': <CalendarIcon className="text-blue-400" size={18} />,
      'WAITLIST_AVAILABLE': <Bell className="text-purple-400" size={18} />,
      'MAINTENANCE_DUE': <Wrench className="text-amber-400" size={18} />,
      'MAINTENANCE_OVERDUE': <AlertCircle className="text-rose-400" size={18} />,
      'IDLE_EQUIPMENT': <AlertCircle className="text-rose-400" size={18} />,
      'SHARING_REQUESTED': <Share2 className="text-cyan-400" size={18} />,
      'SHARING_APPROVED': <Check className="text-emerald-400" size={18} />,
      'SHARING_REJECTED': <X className="text-rose-400" size={18} />
    };
    return icons[type] || <Bell className="text-slate-400" size={18} />;
  };

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-slate-700 transition-colors"
      >
        <Bell size={20} className="text-slate-400 hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] min-w-[20px] h-5 rounded-full flex items-center justify-center font-bold px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-[420px] max-h-[600px] bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/90">
              <div>
                <h3 className="font-semibold text-white">Notifications</h3>
                <p className="text-xs text-slate-400">{unreadCount} unread</p>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded-lg hover:bg-blue-500/10"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-2 border-b border-slate-700 flex gap-1 overflow-x-auto">
              {['all', 'BOOKING', 'AVAILABILITY', 'MAINTENANCE', 'SHARING'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    filter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto max-h-[420px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications
                  .filter(n => filter === 'all' || n.type.includes(filter.toUpperCase()))
                  .map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer ${
                        !notif.read ? 'bg-blue-500/5 border-l-2 border-blue-500' : ''
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-white">{notif.title}</p>
                            {!notif.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 animate-pulse flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{getTimeAgo(notif.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="p-2 border-t border-slate-700 bg-slate-800/90">
              <button className="w-full text-center text-xs text-slate-400 hover:text-white py-1 transition-colors hover:bg-slate-700/30 rounded-lg">
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== PANEL COMPONENT ====================
function Panel({ children, title, icon: Icon, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-900/50 border border-slate-700 p-6 hover:border-slate-600 transition-all duration-300 ${className}`}
    >
      {title && (
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2.5">
          {Icon && <Icon size={20} className="text-blue-400" strokeWidth={2} />}
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  );
}

// ==================== STAT CARD ====================
function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, trend }) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    purple: 'bg-purple-500/20 text-purple-400',
    amber: 'bg-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/20 text-rose-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
    indigo: 'bg-indigo-500/20 text-indigo-400',
    green: 'bg-green-500/20 text-green-400',
  };

  return (
    <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-sm p-5 hover:border-slate-600 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <span className={`text-xs ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'} mt-1 inline-block`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

// ==================== CAMERA CAPTURE ====================
function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let activeStream;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        activeStream = s;
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setError('Could not access the camera. Check browser permissions, or use "Upload File" instead.'));

    return () => {
      if (activeStream) activeStream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    if (stream) stream.getTracks().forEach((t) => t.stop());
    onCapture(dataUrl);
  };

  const handleClose = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-700"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Take a Photo</h3>
          <button onClick={handleClose} className="p-1 rounded-lg hover:bg-slate-700 transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        {error ? (
          <div className="bg-red-900/20 text-red-400 p-3 rounded-lg text-sm mb-3 border border-red-800/30">
            {error}
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl bg-black mb-4 aspect-video object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-3">
          <button
            onClick={handleCapture}
            disabled={!!error}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            Capture
          </button>
          <button onClick={handleClose} className="px-5 py-2.5 border border-slate-600 rounded-xl text-sm font-medium text-gray-300 hover:bg-slate-700 transition-colors">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== ANALYTICS DASHBOARD ====================
function AnalyticsDashboard({ token, userRole, onExport }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [userRole]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      let endpoint = '';
      if (userRole === 'RESEARCHER_STUDENT') {
        endpoint = '/analytics/researcher';
      } else if (userRole === 'LAB_MANAGER' || userRole === 'DEPARTMENT_HEAD') {
        endpoint = '/analytics/manager';
      } else if (userRole === 'INSTITUTION_ADMINISTRATOR' || userRole === 'SYSTEM_ADMINISTRATOR') {
        endpoint = '/analytics/admin';
      } else {
        throw new Error('Invalid user role');
      }

      const response = await axios.get(`${API}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError(error.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportAnalyticsPDF = () => {
    if (!analytics) {
      alert('No data to export');
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Analytics Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`User Role: ${userRole}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40);
    
    const rows = Object.entries(analytics).map(([key, value]) => [
      key,
      typeof value === 'object' ? JSON.stringify(value) : String(value)
    ]);
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: rows,
      theme: 'striped',
    });
    doc.save('analytics_report.pdf');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/20 text-rose-400 p-4 rounded-xl border border-rose-500/30">
        <AlertCircle size={20} className="inline mr-2" />
        {error}
      </div>
    );
  }

  if (userRole === 'RESEARCHER_STUDENT') {
    return <ResearcherAnalyticsView analytics={analytics} onExport={exportAnalyticsPDF} />;
  } else if (userRole === 'LAB_MANAGER' || userRole === 'DEPARTMENT_HEAD') {
    return <ManagerAnalyticsView analytics={analytics} onExport={exportAnalyticsPDF} />;
  } else if (userRole === 'INSTITUTION_ADMINISTRATOR' || userRole === 'SYSTEM_ADMINISTRATOR') {
    return <AdminAnalyticsView analytics={analytics} onExport={exportAnalyticsPDF} />;
  }
  return <div>No analytics available for your role.</div>;
}

function ResearcherAnalyticsView({ analytics, onExport }) {
  const { upcomingBookings = [], totalBookings = 0, completedBookings = 0, cancelledBookings = 0, totalHoursUsed = 0, recommendedCategories = [] } = analytics || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="text-blue-400" size={24} />
            My Research Analytics
          </h2>
          <p className="text-slate-400 text-sm">Track your personal lab usage and equipment recommendations</p>
        </div>
        <button onClick={onExport} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Download size={16} /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Upcoming Bookings" value={upcomingBookings.length} icon={Calendar} color="blue" />
        <StatCard title="Total Bookings" value={totalBookings} icon={BarChart3} color="emerald" />
        <StatCard title="Completed" value={completedBookings} icon={CheckCircle} color="purple" />
        <StatCard title="Cancelled" value={cancelledBookings} icon={XCircle} color="rose" />
      </div>

      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Total Hours Used</h3>
        <div className="text-4xl font-bold text-white">{totalHoursUsed.toFixed(1)}</div>
        <p className="text-slate-400 text-sm">Hours of confirmed bookings</p>
      </div>

      {recommendedCategories && recommendedCategories.length > 0 && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="text-yellow-400" size={20} />
            Recommended Equipment Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {recommendedCategories.map((cat, i) => (
              <span key={i} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-500/30">
                {cat}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">Based on categories you've used before — try new equipment in these areas.</p>
        </div>
      )}
    </div>
  );
}

function ManagerAnalyticsView({ analytics, onExport }) {
  const { bookingAdoptionRate = 0, noShowRate = 0, highDemandEquipment = [], upcomingMaintenanceCount = 0, overdueMaintenanceCount = 0 } = analytics || {};

  // Prepare data for pie chart
  const categoryData = highDemandEquipment.reduce((acc, eq) => {
    const cat = eq.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + eq.totalBookings;
    return acc;
  }, {});
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-blue-400" size={24} />
            Lab Manager Analytics
          </h2>
          <p className="text-slate-400 text-sm">Key performance indicators for your lab</p>
        </div>
        <button onClick={onExport} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Download size={16} /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Booking Adoption Rate" value={`${bookingAdoptionRate}%`} icon={TrendingUp} color="emerald" />
        <StatCard title="No-Show Rate" value={`${noShowRate}%`} icon={UserX} color="rose" />
        <StatCard title="Upcoming Maintenance" value={upcomingMaintenanceCount} icon={CalendarIcon} color="amber" />
        <StatCard title="Overdue Maintenance" value={overdueMaintenanceCount} icon={AlertCircle} color="rose" />
      </div>

      {highDemandEquipment && highDemandEquipment.length > 0 && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="text-amber-400" size={20} />
            High Demand Equipment (Utilization ≥ 60%)
          </h3>
          <div className="space-y-3">
            {highDemandEquipment.map((eq, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-700/30 px-4 py-3 rounded-lg border border-slate-700">
                <div>
                  <span className="font-medium text-white capitalize">{eq.equipmentName}</span>
                  <span className="text-slate-400 ml-2 text-xs capitalize">{eq.category}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-300">{eq.totalBookings} bookings</span>
                  <span className="text-emerald-400">{eq.utilizationRate}% utilized</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pie Chart – Equipment Usage by Category */}
      {pieData.length > 0 && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Equipment Usage by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'][index % 6]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function AdminAnalyticsView({ analytics, onExport }) {
  const { organizationAvgUtilization = 0, totalSharingRequests = 0, approvedSharingRequests = 0, procurementRecommendations = [], equipmentRoi = [] } = analytics || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="text-blue-400" size={24} />
            Institutional Analytics
          </h2>
          <p className="text-slate-400 text-sm">Organization‑wide performance and ROI</p>
        </div>
        <button onClick={onExport} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Download size={16} /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Avg Utilization" value={`${organizationAvgUtilization}%`} icon={Target} color="blue" />
        <StatCard title="Total Sharing Requests" value={totalSharingRequests} icon={Share2} color="purple" />
        <StatCard title="Approved Sharing" value={approvedSharingRequests} icon={CheckCircle} color="emerald" />
        <StatCard title="ROI Equipments" value={equipmentRoi?.filter(e => e.roiPercent !== null).length || 0} icon={TrendingUp} color="amber" />
      </div>

      {procurementRecommendations && procurementRecommendations.length > 0 && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="text-emerald-400" size={20} />
            Procurement Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {procurementRecommendations.map((rec, idx) => (
              <div key={idx} className="bg-slate-700/30 p-4 rounded-lg border border-slate-700">
                <div className="font-medium text-white">{rec.category}</div>
                <div className="text-sm text-slate-400">Avg Util: {rec.avgUtilizationRate}% · Waitlist: {rec.waitlistCount}</div>
                <div className="text-sm text-blue-400 mt-1">{rec.recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {equipmentRoi && equipmentRoi.length > 0 && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="text-emerald-400" size={20} />
            Equipment ROI (all-time usage value vs purchase cost)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-2 pr-4 font-medium">Equipment</th>
                  <th className="pb-2 pr-4 font-medium">Cost</th>
                  <th className="pb-2 pr-4 font-medium">Usage Value</th>
                  <th className="pb-2 font-medium">ROI %</th>
                </tr>
              </thead>
              <tbody>
                {equipmentRoi.map((eq) => (
                  <tr key={eq.equipmentId} className="border-b border-slate-700/50">
                    <td className="py-2 pr-4 text-white capitalize">{eq.equipmentName}</td>
                    <td className="py-2 pr-4 text-slate-300">{eq.purchaseCost ? `$${eq.purchaseCost.toFixed(2)}` : '—'}</td>
                    <td className="py-2 pr-4 text-slate-300">${eq.totalUsageValue.toFixed(2)}</td>
                    <td className="py-2 text-slate-300">{eq.roiPercent !== null ? `${eq.roiPercent}%` : 'No cost data'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== COST & BILLING DASHBOARD ====================
function CostBillingDashboard({ token, userRole, onExport }) {
  const [costReport, setCostReport] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setLoading(true);
    setError('');
    try {
      const [reportRes, invoicesRes] = await Promise.all([
        axios.get(`${API}/billing/report`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/billing/invoices`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const report = reportRes.data || [];
      const invoicesList = invoicesRes.data || [];

      setCostReport(report);
      setInvoices(invoicesList);

      const totalCost = report.reduce((sum, entry) => sum + entry.totalUsageCost, 0);
      const pendingInvoices = invoicesList.filter(inv => inv.status === 'UNPAID' || inv.status === 'PENDING').length;
      const interInstitutionTotal = report.reduce((sum, entry) => sum + entry.totalSpendAsRequester, 0);

      const departmentCosts = report.map(entry => ({
        department: entry.institutionName,
        cost: entry.totalUsageCost
      }));

      const entriesWithBudget = report.filter(e => e.annualBudget != null && e.annualBudget > 0);
      const avgBudgetUtil = entriesWithBudget.length > 0
        ? Math.round(entriesWithBudget.reduce((sum, e) => sum + e.budgetUsedPercent, 0) / entriesWithBudget.length * 10) / 10
        : 0;

      const internalUsage = totalCost - interInstitutionTotal;
      const costBreakdown = [
        { name: 'Internal Usage', value: Math.round(internalUsage * 100) / 100 },
        { name: 'Cross‑Institution Spend', value: Math.round(interInstitutionTotal * 100) / 100 }
      ];

      setDashboardData({
        totalCost: Math.round(totalCost * 100) / 100,
        budgetUtilization: avgBudgetUtil,
        pendingInvoices,
        interInstitutionTotal: Math.round(interInstitutionTotal * 100) / 100,
        departmentCosts,
        costBreakdown
      });

    } catch (err) {
      console.error('Failed to fetch billing data:', err);
      setError(err.response?.data?.message || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const exportBillingPDF = () => {
    if (!dashboardData) {
      alert('No data to export');
      return;
    }
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Billing Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
    doc.text(`User Role: ${userRole}`, 14, 40);

    doc.setFontSize(14);
    doc.text('Summary', 14, 52);
    const summaryRows = [
      ['Total Cost', `$${dashboardData.totalCost.toFixed(2)}`],
      ['Budget Utilization', `${dashboardData.budgetUtilization}%`],
      ['Pending Invoices', dashboardData.pendingInvoices.toString()],
      ['Inter-Institution Total', `$${dashboardData.interInstitutionTotal.toFixed(2)}`]
    ];
    autoTable(doc, {
      startY: 58,
      head: [['Metric', 'Value']],
      body: summaryRows,
      theme: 'striped',
    });

    const deptRows = dashboardData.departmentCosts.map(d => [d.department, `$${d.cost.toFixed(2)}`]);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Department', 'Cost']],
      body: deptRows,
      theme: 'striped',
    });

    const breakdownRows = dashboardData.costBreakdown.map(b => [b.name, `$${b.value.toFixed(2)}`]);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Category', 'Amount']],
      body: breakdownRows,
      theme: 'striped',
    });

    if (invoices.length > 0) {
      const invoiceRows = invoices.slice(0, 10).map(inv => [
        `#${inv.id}`,
        inv.billedByInstitutionId,
        inv.billedToInstitutionId,
        inv.periodStart,
        inv.periodEnd,
        `$${inv.totalAmount}`,
        inv.status
      ]);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [['ID', 'From', 'To', 'Period Start', 'Period End', 'Amount', 'Status']],
        body: invoiceRows,
        theme: 'grid',
      });
    }

    doc.save('billing_report.pdf');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/20 text-rose-400 p-4 rounded-xl border border-rose-500/30">
        <AlertCircle size={20} className="inline mr-2" />
        {error}
      </div>
    );
  }

  if (!dashboardData) {
    return <p className="text-slate-400">No billing data available.</p>;
  }

  const { totalCost, budgetUtilization, pendingInvoices, interInstitutionTotal, departmentCosts, costBreakdown } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="text-emerald-400" size={24} />
            Cost & Billing Management
          </h2>
          <p className="text-slate-400 text-sm">Track costs, allocate budgets, and manage billing</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportBillingPDF}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Download size={16} />
            Export Billing PDF
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Cost" value={`$${totalCost.toFixed(2)}`} icon={Wallet} color="emerald" />
        <StatCard title="Budget Utilization" value={`${budgetUtilization}%`} icon={PieChart} color="blue" />
        <StatCard title="Pending Invoices" value={pendingInvoices} icon={Receipt} color="amber" />
        <StatCard title="Inter‑Institution Billing" value={`$${interInstitutionTotal.toFixed(2)}`} icon={Share2} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost by Institution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentCosts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="department" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Bar dataKey="cost" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={costBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
              >
                {costBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6'][index % 2]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {invoices.length > 0 && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Invoices</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-2 pr-4 font-medium">Invoice #</th>
                  <th className="pb-2 pr-4 font-medium">From</th>
                  <th className="pb-2 pr-4 font-medium">To</th>
                  <th className="pb-2 pr-4 font-medium">Period</th>
                  <th className="pb-2 pr-4 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-700/50">
                    <td className="py-2 pr-4 text-white">#{inv.id}</td>
                    <td className="py-2 pr-4 text-slate-300">{inv.billedByInstitutionId}</td>
                    <td className="py-2 pr-4 text-slate-300">{inv.billedToInstitutionId}</td>
                    <td className="py-2 pr-4 text-slate-300">{inv.periodStart} – {inv.periodEnd}</td>
                    <td className="py-2 pr-4 text-slate-300">${inv.totalAmount}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${inv.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


// ==================== CALIBRATION PANEL (FIXED – HORIZONTAL & VISIBLE) ====================
function CalibrationPanel({ token }) {
  const [calibrations, setCalibrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [calibrationType, setCalibrationType] = useState('INSTRUMENT');
  const [calibrationDate, setCalibrationDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const modalContentRef = useRef(null);

  useEffect(() => {
    fetchCalibrations();
    fetchEquipment();
  }, []);

  // Scroll to top whenever modal opens
  useEffect(() => {
    if (showAddModal && modalContentRef.current) {
      setTimeout(() => {
        modalContentRef.current.scrollTop = 0;
      }, 100);
    }
  }, [showAddModal]);

  const fetchCalibrations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/calibration/upcoming`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        }
      });
      setCalibrations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch calibrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`${API}/equipment`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipmentList(response.data || []);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  };

  const handleAddCalibration = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post(
        `${API}/calibration`,
        {
          equipmentId: parseInt(selectedEquipment),
          calibrationType,
          calibrationDate,
          expiryDate,
          certificateNumber: certificateNumber || null,
          notes: notes || null,
          status: 'PENDING'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Calibration scheduled successfully!');
      setShowAddModal(false);
      fetchCalibrations();
      resetForm();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to schedule calibration');
    }
  };

  const resetForm = () => {
    setSelectedEquipment('');
    setCalibrationType('INSTRUMENT');
    setCalibrationDate('');
    setExpiryDate('');
    setCertificateNumber('');
    setNotes('');
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-amber-500/20 text-amber-400',
      'IN_PROGRESS': 'bg-blue-500/20 text-blue-400',
      'COMPLETED': 'bg-emerald-500/20 text-emerald-400',
      'EXPIRED': 'bg-rose-500/20 text-rose-400'
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400';
  };

  return (
    <Panel title="Calibration Management" icon={Thermometer}>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-400">Track and manage equipment calibration schedules</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Schedule Calibration
        </button>
      </div>

      {message && (
        <div className={`text-sm p-3 rounded-lg mb-4 ${
          message.includes('successfully') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
        }`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : calibrations.length === 0 ? (
        <p className="text-sm text-slate-400">No calibration records found.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {calibrations.map((cal) => {
            const eq = equipmentList.find(e => e.id === cal.equipmentId);
            return (
              <div key={cal.id} className="bg-slate-700/30 px-4 py-3 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-white capitalize">
                      {eq?.name || `Equipment #${cal.equipmentId}`}
                    </span>
                    <span className="text-slate-400 ml-2 text-xs">{cal.calibrationType}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getStatusColor(cal.status)}`}>
                    {cal.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                  <span>Calibration: {new Date(cal.calibrationDate).toLocaleDateString()}</span>
                  <span>Expires: {new Date(cal.expiryDate).toLocaleDateString()}</span>
                  {cal.certificateNumber && <span className="text-blue-300">Cert: {cal.certificateNumber}</span>}
                  {cal.nextCalibrationDue && <span className="text-amber-300">Next due: {new Date(cal.nextCalibrationDue).toLocaleDateString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- FIXED MODAL – HORIZONTAL LAYOUT, VISIBLE FROM TOP ---------- */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              className="bg-slate-800 rounded-2xl p-6 w-full max-w-3xl shadow-2xl border border-slate-700 mt-8"
            >
              {/* Fixed Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Schedule Calibration</h3>
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="p-1 rounded-lg hover:bg-slate-700"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Horizontal Form – all rows in 2 columns */}
              <div ref={modalContentRef} className="max-h-[70vh] overflow-y-auto pr-1">
                <form onSubmit={handleAddCalibration} className="space-y-4">
                  {/* Row 1: Equipment + Calibration Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Equipment</label>
                      <select
                        value={selectedEquipment}
                        onChange={(e) => setSelectedEquipment(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                        required
                      >
                        <option value="">Select equipment...</option>
                        {equipmentList.map(eq => (
                          <option key={eq.id} value={eq.id}>{eq.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Calibration Type</label>
                      <select
                        value={calibrationType}
                        onChange={(e) => setCalibrationType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                      >
                        <option value="INSTRUMENT">Instrument</option>
                        <option value="SENSOR">Sensor</option>
                        <option value="TEMPERATURE">Temperature</option>
                        <option value="PRESSURE">Pressure</option>
                        <option value="ELECTRICAL">Electrical</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Calibration Date + Expiry Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Calibration Date</label>
                      <input
                        type="date"
                        value={calibrationDate}
                        onChange={(e) => setCalibrationDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none [color-scheme:dark]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none [color-scheme:dark]"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 3: Certificate Number + Notes (side by side) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Certificate Number</label>
                      <input
                        type="text"
                        value={certificateNumber}
                        onChange={(e) => setCertificateNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                        placeholder="e.g. CAL-2024-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                        rows={1}
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>

                  {/* Row 4: Submit button (full width) */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25"
                  >
                    Schedule Calibration
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Panel>
  );
}
// ==================== REPORTS PANEL ====================
function ReportsPanel({ userRole, bookingsList, equipmentList, utilizationList, maintenanceList, sharingRequestsList, userEmail, token, onExport }) {
  const [reportType, setReportType] = useState('utilization');
  const [dateRange, setDateRange] = useState('last30days');

  const exportReport = () => {
    const reportData = {
      reportType: reportType,
      dateRange: dateRange,
      generatedAt: new Date().toISOString(),
      bookings: bookingsList,
      equipment: equipmentList,
      utilization: utilizationList,
      maintenance: maintenanceList,
      sharing: sharingRequestsList,
      userEmail: userEmail,
      userRole: userRole
    };
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
    doc.text(`User: ${userEmail}`, 14, 40);
    
    const rows = Object.entries(reportData).map(([key, value]) => [
      key,
      typeof value === 'object' ? JSON.stringify(value).substring(0, 100) : String(value)
    ]);
    autoTable(doc, {
      startY: 50,
      head: [['Field', 'Value']],
      body: rows,
      theme: 'striped',
    });
    doc.save(`${reportType}_report.pdf`);
  };

  return (
    <Panel title="Reports" icon={FileText}>
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
        >
          <option value="utilization">Utilization Report</option>
          <option value="maintenance">Maintenance Report</option>
          <option value="sharing">Sharing Report</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
        >
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="last90days">Last 90 Days</option>
        </select>
        <button 
          onClick={exportReport}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Download size={16} /> Export PDF
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Printer size={16} /> Print
        </button>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white">{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h4>
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400">Total Equipment: {equipmentList.length}</p>
            <p className="text-xs text-slate-400">Total Bookings: {bookingsList.length}</p>
            <p className="text-xs text-slate-400">Maintenance Records: {maintenanceList.length}</p>
            <p className="text-xs text-slate-400">Sharing Requests: {sharingRequestsList.length}</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ==================== MAIN APP ====================
function App() {
  // ---------- Auth state ----------
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [userInstitutionId, setUserInstitutionId] = useState(null);

  const [activePanel, setActivePanel] = useState('overview');

  // Profile state
  const [myProfileInstitutionId, setMyProfileInstitutionId] = useState('');
  const [myProfileType, setMyProfileType] = useState('STUDENT');
  const [myProfileMessage, setMyProfileMessage] = useState('');
  const [myProfileLoading, setMyProfileLoading] = useState(false);

  // Role request
  const [myRoleRequests, setMyRoleRequests] = useState([]);
  const [desiredRole, setDesiredRole] = useState('LAB_TECHNICIAN');
  const [roleRequestReason, setRoleRequestReason] = useState('');
  const [roleRequestMessage, setRoleRequestMessage] = useState('');

  // Role requests admin
  const [allRoleRequests, setAllRoleRequests] = useState([]);
  const [roleRequestAdminMessage, setRoleRequestAdminMessage] = useState('');

  // Institution management
  const [institutionName, setInstitutionName] = useState('');
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [institutionEmail, setInstitutionEmail] = useState('');
  const [institutionsList, setInstitutionsList] = useState([]);
  const [institutionMessage, setInstitutionMessage] = useState('');
  const [institutionLoading, setInstitutionLoading] = useState(false);

  // Admin user management
  const [usersList, setUsersList] = useState([]);
  const [adminMessage, setAdminMessage] = useState('');

  // Equipment
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentCategory, setEquipmentCategory] = useState('');
  const [equipmentDescription, setEquipmentDescription] = useState('');
  const [equipmentInstitutionId, setEquipmentInstitutionId] = useState('');
  const [equipmentImage, setEquipmentImage] = useState('');
  const [equipmentCost, setEquipmentCost] = useState('');
  const [equipmentHourlyRate, setEquipmentHourlyRate] = useState('');
  const [equipmentList, setEquipmentList] = useState([]);
  const [equipmentMessage, setEquipmentMessage] = useState('');
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [allInstitutionsForDropdown, setAllInstitutionsForDropdown] = useState([]);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  // ---------- NEW: Edit/Delete Equipment States ----------
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTab, setEditTab] = useState('basic'); // 'basic','location','availability','booking','maintenance','calibration','cost','sharing'
  const [editFormData, setEditFormData] = useState({});

  // Booking
  const [bookingEquipmentId, setBookingEquipmentId] = useState('');
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [bookingsList, setBookingsList] = useState([]);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Utilization
  const [utilizationList, setUtilizationList] = useState([]);

  // Heatmap & Demand
  const [heatmapData, setHeatmapData] = useState(null);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [demandData, setDemandData] = useState(null);
  const [demandLoading, setDemandLoading] = useState(false);

  // Maintenance
  const [maintenanceEquipmentId, setMaintenanceEquipmentId] = useState('');
  const [maintenanceDescription, setMaintenanceDescription] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [maintenanceTechnician, setMaintenanceTechnician] = useState('');
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  // Requests
  const [requestsList, setRequestsList] = useState([]);
  const [requestsMessage, setRequestsMessage] = useState('');

  // Sharing
  const [sharingEquipmentId, setSharingEquipmentId] = useState('');
  const [sharingInstitutionId, setSharingInstitutionId] = useState('');
  const [sharingReason, setSharingReason] = useState('');
  const [sharingRequestsList, setSharingRequestsList] = useState([]);
  const [sharableEquipment, setSharableEquipment] = useState([]);
  const [sharingMessage, setSharingMessage] = useState('');
  const [sharingLoading, setSharingLoading] = useState(false);

  // Waitlist
  const [waitlistEquipmentId, setWaitlistEquipmentId] = useState('');
  const [waitlistEquipmentOptions, setWaitlistEquipmentOptions] = useState([]);
  const [myWaitlistEntries, setMyWaitlistEntries] = useState([]);
  const [allWaitlistEntries, setAllWaitlistEntries] = useState([]);
  const [waitlistMessage, setWaitlistMessage] = useState('');
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  // Notification count
  const [notificationCount, setNotificationCount] = useState(0);

  // ---------- PDF Export helper ----------
  const exportPDF = (data, filename, title) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title || 'Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
    doc.text(`User: ${userEmail || 'Unknown'}`, 14, 40);

    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = data.map(row => headers.map(h => row[h] !== undefined ? String(row[h]) : ''));
      autoTable(doc, {
        startY: 50,
        head: [headers],
        body: rows,
        theme: 'striped',
      });
    } else if (typeof data === 'object' && data !== null) {
      const rows = Object.entries(data).map(([key, value]) => [key, typeof value === 'object' ? JSON.stringify(value) : String(value)]);
      autoTable(doc, {
        startY: 50,
        head: [['Field', 'Value']],
        body: rows,
        theme: 'striped',
      });
    } else {
      doc.text('No structured data available.', 14, 50);
    }
    doc.save(`${filename}.pdf`);
  };

  // ---------- Institution helper ----------
  const institutionNameById = (id) => {
    const inst = allInstitutionsForDropdown.find((i) => i.id === id);
    return inst ? inst.name : `Institution #${id}`;
  };

  // ---------- Login Handler ----------
  const handleLogin = (userData) => {
    setToken(userData.token);
    setUserEmail(userData.email);
    setUserRole(userData.role);
    setUserName(userData.name);
    setUserInstitutionId(userData.institutionId);
    setMyProfileInstitutionId(userData.institutionId || '');
    setMyProfileType(userData.profileType || 'STUDENT');
    setActivePanel('overview');
    
    setTimeout(() => {
      fetchBookings();
      fetchAvailableEquipment();
      fetchRequests();
      fetchMyWaitlist();
      fetchUtilization();
      fetchMaintenance();
      fetchSharingRequests();
      fetchMyRoleRequests();
      fetchEquipment();
      fetchAllWaitlist();
      fetchWaitlistEquipmentOptions();
      fetchAllInstitutionsForDropdown();
    }, 100);
  };

  // ---------- API Functions ----------
  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`${API}/equipment`, { headers: { Authorization: `Bearer ${token}` } });
      setEquipmentList(response.data);
    } catch (error) {
      console.error('Failed to fetch equipment', error);
    }
  };

  const fetchAllInstitutionsForDropdown = async () => {
    try {
      const response = await axios.get(`${API}/institutions`, { headers: { Authorization: `Bearer ${token}` } });
      setAllInstitutionsForDropdown(response.data);
    } catch (error) {
      console.error('Failed to fetch institutions', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`, { headers: { Authorization: `Bearer ${token}` } });
      setBookingsList(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    }
  };

  const fetchAvailableEquipment = async () => {
    try {
      const response = await axios.get(`${API}/equipment`, { headers: { Authorization: `Bearer ${token}` } });
      setAvailableEquipment(response.data);
    } catch (error) {
      console.error('Failed to fetch equipment', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API}/requests`, { headers: { Authorization: `Bearer ${token}` } });
      setRequestsList(response.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    }
  };

  const fetchMyWaitlist = async () => {
    try {
      const response = await axios.get(`${API}/waitlist/mine`, { headers: { Authorization: `Bearer ${token}` } });
      setMyWaitlistEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch my waitlist', error);
    }
  };

  const fetchAllWaitlist = async () => {
    try {
      const response = await axios.get(`${API}/waitlist`, { headers: { Authorization: `Bearer ${token}` } });
      setAllWaitlistEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch waitlist', error);
    }
  };

  const fetchWaitlistEquipmentOptions = async () => {
    try {
      const response = await axios.get(`${API}/equipment`, { headers: { Authorization: `Bearer ${token}` } });
      setWaitlistEquipmentOptions(response.data);
    } catch (error) {
      console.error('Failed to fetch equipment', error);
    }
  };

  const fetchUtilization = async () => {
    try {
      const response = await axios.get(`${API}/utilization`, { headers: { Authorization: `Bearer ${token}` } });
      setUtilizationList(response.data);
    } catch (error) {
      console.error('Failed to fetch utilization', error);
    }
  };

  const fetchHeatmap = async () => {
    setHeatmapLoading(true);
    try {
      const response = await axios.get(`${API}/utilization/heatmap`, { headers: { Authorization: `Bearer ${token}` } });
      setHeatmapData(response.data);
    } catch (error) {
      console.error('Failed to fetch heatmap', error);
    } finally {
      setHeatmapLoading(false);
    }
  };

  const fetchDemandAnalysis = async () => {
    setDemandLoading(true);
    try {
      const response = await axios.get(`${API}/utilization/demand-analysis`, { headers: { Authorization: `Bearer ${token}` } });
      setDemandData(response.data);
    } catch (error) {
      console.error('Failed to fetch demand analysis', error);
    } finally {
      setDemandLoading(false);
    }
  };

  const fetchMaintenance = async () => {
    try {
      const response = await axios.get(`${API}/maintenance`, { headers: { Authorization: `Bearer ${token}` } });
      setMaintenanceList(response.data);
    } catch (error) {
      console.error('Failed to fetch maintenance', error);
    }
  };

  const fetchSharingRequests = async () => {
    try {
      const response = await axios.get(`${API}/sharing-requests`, { headers: { Authorization: `Bearer ${token}` } });
      setSharingRequestsList(response.data);
    } catch (error) {
      console.error('Failed to fetch sharing requests', error);
    }
  };

  const fetchSharableEquipment = async () => {
    try {
      const response = await axios.get(`${API}/equipment`, { headers: { Authorization: `Bearer ${token}` } });
      setSharableEquipment(response.data.filter((item) => item.institutionId));
    } catch (error) {
      console.error('Failed to fetch equipment', error);
    }
  };

  const fetchMyRoleRequests = async () => {
    try {
      const response = await axios.get(`${API}/role-requests/mine`, { headers: { Authorization: `Bearer ${token}` } });
      setMyRoleRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch role requests', error);
    }
  };

  const fetchAllRoleRequests = async () => {
    try {
      const response = await axios.get(`${API}/role-requests`, { headers: { Authorization: `Bearer ${token}` } });
      setAllRoleRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch role requests', error);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const response = await axios.get(`${API}/institutions`, { headers: { Authorization: `Bearer ${token}` } });
      setInstitutionsList(response.data);
    } catch (error) {
      console.error('Failed to fetch institutions', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUsersList(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  // ---------- Action Handlers ----------
  const handleEquipmentImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setEquipmentMessage('Image is too large — please use a photo under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setEquipmentImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    setEquipmentLoading(true);
    setEquipmentMessage('');
    try {
      // we'll send all new fields, but for now we send only what the current DTO supports; 
      // we can update DTO later. For now, we'll send the basic fields.
      const response = await axios.post(
        `${API}/equipment`,
        {
          name: equipmentName,
          category: equipmentCategory,
          description: equipmentDescription,
          institutionId: equipmentInstitutionId ? parseInt(equipmentInstitutionId) : null,
          imageBase64: equipmentImage || null,
          cost: equipmentCost ? parseFloat(equipmentCost) : null,
          hourlyRate: equipmentHourlyRate ? parseFloat(equipmentHourlyRate) : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEquipmentMessage(`"${response.data.name}" added successfully!`);
      setEquipmentName('');
      setEquipmentCategory('');
      setEquipmentDescription('');
      setEquipmentInstitutionId('');
      setEquipmentImage('');
      setEquipmentCost('');
      setEquipmentHourlyRate('');
      fetchEquipment();
    } catch (error) {
      setEquipmentMessage(error.response ? error.response.data.message : 'Failed to add equipment');
    } finally {
      setEquipmentLoading(false);
    }
  };

  // ---------- NEW: Open Edit Modal ----------
  const openEditModal = (equipment) => {
    setEditingEquipment(equipment);
    // Initialize editFormData with all fields from equipment
    setEditFormData({
      name: equipment.name || '',
      category: equipment.category || '',
      description: equipment.description || '',
      manufacturer: equipment.manufacturer || '',
      modelNumber: equipment.modelNumber || '',
      serialNumber: equipment.serialNumber || '',
      imageBase64: equipment.imageBase64 || '',
      institutionId: equipment.institutionId || '',
      department: equipment.department || '',
      location: equipment.location || '',
      owner: equipment.owner || '',
      availableForSharing: equipment.availableForSharing || false,
      status: equipment.status || 'AVAILABLE',
      availability: equipment.availability || '',
      operatingHours: equipment.operatingHours || '',
      bookingEnabled: equipment.bookingEnabled !== undefined ? equipment.bookingEnabled : true,
      maxBookingDuration: equipment.maxBookingDuration || '',
      minBookingDuration: equipment.minBookingDuration || '',
      advanceBookingLimit: equipment.advanceBookingLimit || '',
      usageRestrictions: equipment.usageRestrictions || '',
      lastMaintenanceDate: equipment.lastMaintenanceDate || '',
      nextMaintenanceDate: equipment.nextMaintenanceDate || '',
      maintenanceFrequency: equipment.maintenanceFrequency || '',
      maintenanceNotes: equipment.maintenanceNotes || '',
      calibrationRequired: equipment.calibrationRequired || false,
      lastCalibrationDate: equipment.lastCalibrationDate || '',
      nextCalibrationDate: equipment.nextCalibrationDate || '',
      calibrationCertificateNumber: equipment.calibrationCertificateNumber || '',
      certificateUpload: equipment.certificateUpload || '',
      costPerHour: equipment.costPerHour || '',
      maintenanceCost: equipment.maintenanceCost || '',
      usageCost: equipment.usageCost || '',
      interInstitutionFee: equipment.interInstitutionFee || '',
      allowExternalRequests: equipment.allowExternalRequests || false,
      sharingFee: equipment.sharingFee || '',
      sharingApprovalRequired: equipment.sharingApprovalRequired || false,
    });
    setEditTab('basic');
    setShowEditModal(true);
  };

  // ---------- NEW: Handle Edit Form Change ----------
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ---------- NEW: Submit Edit ----------
  const handleUpdateEquipment = async (e) => {
    e.preventDefault();
    try {
      // Convert empty strings to null for numbers
      const payload = { ...editFormData };
      ['institutionId', 'maxBookingDuration', 'minBookingDuration', 'advanceBookingLimit', 
       'costPerHour', 'maintenanceCost', 'usageCost', 'interInstitutionFee', 'sharingFee']
        .forEach(field => {
          if (payload[field] === '') payload[field] = null;
        });
      // For dates, convert to ISO string if needed
      ['lastMaintenanceDate', 'nextMaintenanceDate', 'lastCalibrationDate', 'nextCalibrationDate']
        .forEach(field => {
          if (payload[field] === '') payload[field] = null;
        });
      // booleans
      ['availableForSharing', 'bookingEnabled', 'calibrationRequired', 'allowExternalRequests', 'sharingApprovalRequired']
        .forEach(field => {
          payload[field] = payload[field] === true || payload[field] === 'true' ? true : false;
        });

      await axios.put(`${API}/equipment/${editingEquipment.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipmentMessage('Equipment updated successfully!');
      setShowEditModal(false);
      fetchEquipment();
    } catch (error) {
      setEquipmentMessage(error.response?.data?.message || 'Failed to update equipment');
    }
  };

  // ---------- NEW: Delete Equipment ----------
  const handleDeleteEquipment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) return;
    try {
      await axios.delete(`${API}/equipment/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setEquipmentMessage('Equipment deleted successfully.');
      fetchEquipment();
    } catch (error) {
      setEquipmentMessage('Failed to delete equipment.');
    }
  };

  // ---------- Booking actions ----------
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingMessage('');
    try {
      const response = await axios.post(
        `${API}/bookings`,
        { equipmentId: parseInt(bookingEquipmentId), startTime: bookingStart, endTime: bookingEnd },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookingMessage(`Booking for "${response.data.equipmentName}" submitted — pending approval.`);
      setBookingEquipmentId('');
      setBookingStart('');
      setBookingEnd('');
      fetchBookings();
    } catch (error) {
      setBookingMessage(error.response ? error.response.data.message : 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleApproveBooking = async (id) => {
    setBookingMessage('');
    try {
      await axios.put(`${API}/bookings/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setBookingMessage(`Booking #${id} confirmed.`);
      fetchBookings();
    } catch (error) {
      setBookingMessage(error.response ? error.response.data.message : 'Failed to approve booking');
    }
  };

  const handleCancelBooking = async (id) => {
    setBookingMessage('');
    try {
      await axios.put(`${API}/bookings/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setBookingMessage(`Booking #${id} cancelled.`);
      fetchBookings();
    } catch (error) {
      setBookingMessage(error.response ? error.response.data.message : 'Failed to cancel booking');
    }
  };

  const handleNoShowBooking = async (id) => {
    setBookingMessage('');
    try {
      await axios.put(`${API}/bookings/${id}/no-show`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setBookingMessage(`Booking #${id} marked as NO-SHOW.`);
      fetchBookings();
    } catch (error) {
      setBookingMessage(error.response ? error.response.data.message : 'Failed to mark as no-show');
    }
  };

  const handleApprove = async (id) => {
    setRequestsMessage('');
    try {
      await axios.put(`${API}/requests/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setRequestsMessage(`Request #${id} approved.`);
      fetchRequests();
    } catch (error) {
      setRequestsMessage(error.response ? error.response.data.message : 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    setRequestsMessage('');
    try {
      await axios.put(`${API}/requests/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setRequestsMessage(`Request #${id} rejected.`);
      fetchRequests();
    } catch (error) {
      setRequestsMessage(error.response ? error.response.data.message : 'Failed to reject');
    }
  };

  const handleScheduleMaintenance = async (e) => {
    e.preventDefault();
    setMaintenanceLoading(true);
    setMaintenanceMessage('');
    try {
      const response = await axios.post(
        `${API}/maintenance`,
        {
          equipmentId: parseInt(maintenanceEquipmentId),
          type: 'MAINTENANCE',
          description: maintenanceDescription,
          scheduledDate: maintenanceDate,
          assignedTechnician: maintenanceTechnician,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMaintenanceMessage(`${response.data.type} scheduled.`);
      setMaintenanceEquipmentId('');
      setMaintenanceDescription('');
      setMaintenanceDate('');
      setMaintenanceTechnician('');
      fetchMaintenance();
    } catch (error) {
      setMaintenanceMessage(error.response ? error.response.data.message : 'Failed to schedule maintenance');
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleMaintenanceStatusChange = async (id, newStatus) => {
    setMaintenanceMessage('');
    try {
      const response = await axios.put(`${API}/maintenance/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setMaintenanceMessage(`Marked as ${response.data.status.replace('_', ' ')}.`);
      fetchMaintenance();
    } catch (error) {
      setMaintenanceMessage(error.response ? error.response.data.message : 'Failed to update status');
    }
  };

  const handleCreateSharingRequest = async (e) => {
    e.preventDefault();
    setSharingLoading(true);
    setSharingMessage('');
    try {
      const response = await axios.post(
        `${API}/sharing-requests`,
        {
          equipmentId: parseInt(sharingEquipmentId),
          requestingInstitutionId: parseInt(sharingInstitutionId),
          reason: sharingReason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSharingMessage(`Sharing request for "${response.data.equipmentName}" submitted.`);
      setSharingEquipmentId('');
      setSharingInstitutionId('');
      setSharingReason('');
      fetchSharingRequests();
    } catch (error) {
      setSharingMessage(error.response ? error.response.data.message : 'Failed to submit sharing request');
    } finally {
      setSharingLoading(false);
    }
  };

  const handleApproveSharing = async (id) => {
    setSharingMessage('');
    try {
      await axios.put(`${API}/sharing-requests/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSharingMessage(`Sharing request #${id} approved.`);
      fetchSharingRequests();
    } catch (error) {
      setSharingMessage(error.response ? error.response.data.message : 'Failed to approve');
    }
  };

  const handleRejectSharing = async (id) => {
    setSharingMessage('');
    try {
      await axios.put(`${API}/sharing-requests/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSharingMessage(`Sharing request #${id} rejected.`);
      fetchSharingRequests();
    } catch (error) {
      setSharingMessage(error.response ? error.response.data.message : 'Failed to reject');
    }
  };

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    setWaitlistLoading(true);
    setWaitlistMessage('');
    try {
      const response = await axios.post(`${API}/waitlist`, { equipmentId: parseInt(waitlistEquipmentId) }, { headers: { Authorization: `Bearer ${token}` } });
      setWaitlistMessage(`Joined the waitlist for "${response.data.equipmentName}".`);
      setWaitlistEquipmentId('');
      fetchMyWaitlist();
      fetchAllWaitlist();
    } catch (error) {
      setWaitlistMessage(error.response ? error.response.data.message : 'Failed to join waitlist');
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleLeaveWaitlist = async (id) => {
    setWaitlistMessage('');
    try {
      await axios.delete(`${API}/waitlist/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setWaitlistMessage('Removed from waitlist.');
      fetchMyWaitlist();
      fetchAllWaitlist();
    } catch (error) {
      setWaitlistMessage(error.response ? error.response.data.message : 'Failed to leave waitlist');
    }
  };

  const handleFulfillWaitlistEntry = async (id) => {
    setWaitlistMessage('');
    try {
      await axios.put(`${API}/waitlist/${id}/fulfill`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setWaitlistMessage(`Waitlist entry #${id} marked as fulfilled.`);
      fetchAllWaitlist();
    } catch (error) {
      setWaitlistMessage(error.response ? error.response.data.message : 'Failed to update waitlist entry');
    }
  };

  const handleAddInstitution = async (e) => {
    e.preventDefault();
    setInstitutionLoading(true);
    setInstitutionMessage('');
    try {
      const response = await axios.post(
        `${API}/institutions`,
        { name: institutionName, address: institutionAddress, contactEmail: institutionEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInstitutionMessage(`"${response.data.name}" added successfully!`);
      setInstitutionName('');
      setInstitutionAddress('');
      setInstitutionEmail('');
      fetchInstitutions();
    } catch (error) {
      setInstitutionMessage(error.response ? error.response.data.message : 'Failed to add institution');
    } finally {
      setInstitutionLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setAdminMessage('');
    try {
      const response = await axios.put(`${API}/admin/users/${userId}/role`, { newRole }, { headers: { Authorization: `Bearer ${token}` } });
      setAdminMessage(`${response.data.email} is now ${response.data.role}.`);
      fetchUsers();
    } catch (error) {
      setAdminMessage(error.response ? error.response.data.message : 'Failed to update role');
    }
  };

  const handleRoleRequestSubmit = async (e) => {
    e.preventDefault();
    setRoleRequestMessage('');
    try {
      await axios.post(`${API}/role-requests`, { requestedRole: desiredRole, reason: roleRequestReason }, { headers: { Authorization: `Bearer ${token}` } });
      setRoleRequestMessage('Request submitted — waiting for admin approval.');
      setRoleRequestReason('');
      fetchMyRoleRequests();
    } catch (error) {
      setRoleRequestMessage(error.response ? error.response.data.message : 'Failed to submit request');
    }
  };

  const handleApproveRoleRequest = async (id) => {
    setRoleRequestAdminMessage('');
    try {
      await axios.put(`${API}/role-requests/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setRoleRequestAdminMessage(`Request #${id} approved.`);
      fetchAllRoleRequests();
    } catch (error) {
      setRoleRequestAdminMessage(error.response ? error.response.data.message : 'Failed to approve');
    }
  };

  const handleRejectRoleRequest = async (id) => {
    setRoleRequestAdminMessage('');
    try {
      await axios.put(`${API}/role-requests/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setRoleRequestAdminMessage(`Request #${id} rejected.`);
      fetchAllRoleRequests();
    } catch (error) {
      setRoleRequestAdminMessage(error.response ? error.response.data.message : 'Failed to reject');
    }
  };

  const handleUpdateMyProfile = async (e) => {
    e.preventDefault();
    setMyProfileLoading(true);
    setMyProfileMessage('');
    try {
      await axios.put(
        `${API}/users/me/profile`,
        {
          institutionId: myProfileInstitutionId ? parseInt(myProfileInstitutionId) : null,
          profileType: myProfileType,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyProfileMessage('Profile updated!');
    } catch (error) {
      setMyProfileMessage(error.response ? error.response.data.message : 'Failed to update profile');
    } finally {
      setMyProfileLoading(false);
    }
  };

  // ---------- Navigation ----------
  const selectPanel = (key) => {
    setActivePanel(key);
    window.scrollTo(0, 0);
    if (key === 'overview') {
      fetchBookings(); fetchRequests(); fetchMyWaitlist(); fetchUtilization();
      fetchMaintenance(); fetchSharingRequests(); fetchMyRoleRequests();
    }
    if (key === 'booking') { fetchBookings(); fetchAvailableEquipment(); }
    if (key === 'utilization') { fetchUtilization(); }
    if (key === 'heatmap') { fetchHeatmap(); }
    if (key === 'demand') { fetchDemandAnalysis(); }
    if (key === 'sharing') { fetchSharingRequests(); fetchSharableEquipment(); fetchAllInstitutionsForDropdown(); }
    if (key === 'waitlist') { fetchMyWaitlist(); fetchAllWaitlist(); fetchWaitlistEquipmentOptions(); }
    if (key === 'maintenance') { fetchMaintenance(); fetchAvailableEquipment(); }
    if (key === 'equipment') { fetchEquipment(); fetchAllInstitutionsForDropdown(); }
    if (key === 'requests') { fetchRequests(); }
    if (key === 'institutions') { fetchInstitutions(); }
    if (key === 'users') { fetchUsers(); }
    if (key === 'roleRequestsAdmin') { fetchAllRoleRequests(); }
    if (key === 'roleRequest') { fetchMyRoleRequests(); }
  };

  const handleLogout = () => {
    setToken(null);
    setUserEmail('');
    setUserRole('');
    setUserName('');
    setUserInstitutionId(null);
    setActivePanel('overview');
    setNotificationCount(0);
  };

  // ==================== LOGGED IN ====================
  if (token) {
    const navItems = getNavItems(userRole);

    const myBookingsCount = bookingsList.filter((b) => b.bookedBy === userEmail).length;
    const myRequestsCount = requestsList.filter((r) => r.requestedBy === userEmail).length;
    const myWaitlistCount = myWaitlistEntries.length;
    const pendingApprovalsCount = bookingsList.filter((b) => b.status === 'PENDING_APPROVAL').length;
    const idleAlertCount = utilizationList.filter((s) => s.idleAlert).length;
    const topEquipment = [...utilizationList].sort((a, b) => b.totalBookings - a.totalBookings).slice(0, 3);
    const pendingRoleRequest = myRoleRequests.find((r) => r.status === 'PENDING');

    // Unique categories for filter
    const categories = [...new Set(equipmentList.map(e => e.category).filter(Boolean))];
    const filteredEquipment = categoryFilter
      ? equipmentList.filter(e => e.category === categoryFilter)
      : equipmentList;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700 flex flex-col py-6 px-5 min-h-screen sticky top-0 shadow-2xl shadow-slate-900/50 overflow-y-auto">
          <div className="flex items-center gap-3 mb-8 px-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <FlaskConical size={20} strokeWidth={1.8} />
            </div>
            <div>
              <span className="font-bold text-white text-base leading-tight block">LabResource</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Platform</span>
            </div>
          </div>

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30 ring-4 ring-slate-700">
              {(userName || userEmail || '?').charAt(0).toUpperCase()}
            </div>
            <div className="font-semibold text-white text-sm mt-3">{userName || userEmail}</div>
            <div className="text-xs text-slate-400 mt-0.5 bg-slate-700 px-3 py-0.5 rounded-full">
              {userRole.replace('_', ' ')}
            </div>
            {userInstitutionId && (
              <div className="text-[10px] text-slate-500 mt-1">
                {institutionNameById(userInstitutionId)}
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-0.5">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => selectPanel(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activePanel === key
                    ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon size={18} className={activePanel === key ? 'text-blue-400' : 'text-slate-500'} />
                {label}
                {key === 'overview' && pendingApprovalsCount > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg shadow-rose-500/30">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 mt-4 group"
          >
            <LogOut size={18} className="group-hover:text-rose-400 transition-colors" />
            <span>Log out</span>
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <header className="bg-slate-800/95 backdrop-blur-xl border-b border-slate-700 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
            <div className="hidden md:flex items-center flex-1 max-w-sm relative">
              <Search size={16} className="absolute left-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search equipment, bookings..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none placeholder:text-slate-500 text-white transition-all"
                disabled
              />
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <NotificationCenter token={token} onNotificationCount={setNotificationCount} />
              <div className="w-px h-8 bg-slate-700"></div>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-sm font-semibold shadow-lg shadow-blue-500/20">
                  {(userName || userEmail || '?').charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={16} className="text-slate-400" />
              </button>
            </div>
          </header>

          <main className="p-8 max-w-7xl mx-auto space-y-6">
            {/* ---------- OVERVIEW ---------- */}
            {activePanel === 'overview' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
                    <p className="text-slate-400 text-sm">Welcome back, {userName || userEmail}.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-medium border border-emerald-500/30">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                      Online
                    </span>
                    {notificationCount > 0 && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-medium border border-blue-500/30">
                        {notificationCount} new notification{notificationCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="My Bookings" value={myBookingsCount} icon={Calendar} color="blue" />
                  <StatCard title="Access Requests" value={myRequestsCount} icon={ClipboardList} color="amber" />
                  <StatCard title="Waitlist" value={myWaitlistCount} icon={Clock} color="purple" />
                  <StatCard title="Pending Approvals" value={pendingApprovalsCount} icon={AlertCircle} color="rose" />
                </div>

                {pendingRoleRequest ? (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-blue-500/20">
                    <div>
                      <div className="font-semibold text-lg">Role Request Pending</div>
                      <div className="text-blue-100/80 text-sm">
                        Your request for {pendingRoleRequest.requestedRole.replace('_', ' ')} is awaiting admin approval.
                      </div>
                    </div>
                    <GraduationCap size={32} className="opacity-80" />
                  </div>
                ) : idleAlertCount > 0 ? (
                  <div className="bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-rose-500/20">
                    <div>
                      <div className="font-semibold text-lg">{idleAlertCount} Equipment Idle 14+ Days</div>
                      <div className="text-rose-100/80 text-sm">Check the Utilization tab for details.</div>
                    </div>
                    <BarChart3 size={32} className="opacity-80" />
                  </div>
                ) : (
                  <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-sm p-5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">All Caught Up</div>
                      <div className="text-sm text-slate-400">No pending approvals or alerts right now.</div>
                    </div>
                    <ShieldCheck size={28} className="text-emerald-400" />
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-slate-800/90 rounded-2xl border border-slate-700 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-white">Activity — Bookings by Hour</h3>
                      <button
                        onClick={() => fetchDemandAnalysis()}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        Refresh
                      </button>
                    </div>
                    {!demandData && <p className="text-sm text-slate-400">Loading...</p>}
                    {demandData && (
                      <div className="flex items-end gap-1 h-32">
                        {demandData.hourly.map((h) => {
                          const max = Math.max(...demandData.hourly.map((x) => x.count), 1);
                          return (
                            <div key={h.hour} className="flex-1 flex flex-col items-center justify-end h-full">
                              <div
                                className="w-full bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t transition-all hover:from-blue-400 hover:to-indigo-400"
                                style={{ height: `${(h.count / max) * 100}%`, minHeight: h.count > 0 ? '4px' : '0px' }}
                                title={`${h.hour}:00 — ${h.count} bookings`}
                              ></div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-sm p-6">
                    <h3 className="font-semibold text-white mb-4">Most Booked Equipment</h3>
                    <div className="space-y-3">
                      {topEquipment.length === 0 && <p className="text-sm text-slate-400">No booking data yet.</p>}
                      {topEquipment.map((eq, i) => (
                        <div key={eq.equipmentId} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white capitalize truncate">{eq.equipmentName}</div>
                            <div className="text-xs text-slate-400">{eq.totalBookings} bookings</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ---------- BOOKING ---------- */}
            {activePanel === 'booking' && (
              <Panel title="Equipment Booking" icon={Calendar}>
                <form onSubmit={handleCreateBooking} className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Equipment</label>
                    <select
                      value={bookingEquipmentId}
                      onChange={(e) => setBookingEquipmentId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      required
                    >
                      <option value="" className="bg-slate-800">Select equipment...</option>
                      {availableEquipment.map((item) => (
                        <option key={item.id} value={item.id} className="bg-slate-800">{item.name} ({item.category})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        value={bookingStart}
                        onChange={(e) => setBookingStart(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white [color-scheme:dark]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        value={bookingEnd}
                        onChange={(e) => setBookingEnd(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white [color-scheme:dark]"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
                  >
                    {bookingLoading ? 'Submitting...' : 'Submit Booking'}
                  </button>
                </form>

                {bookingMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    bookingMessage.includes('submitted') || bookingMessage.includes('confirmed') || bookingMessage.includes('cancelled') || bookingMessage.includes('NO-SHOW')
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {bookingMessage}
                  </div>
                )}

                <h4 className="text-sm font-medium text-slate-300 mb-2">All Bookings</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {bookingsList.length === 0 && <p className="text-sm text-slate-400">No bookings yet.</p>}
                  {bookingsList.map((booking) => {
                    const equipment = availableEquipment.find(e => e.id === booking.equipmentId);
                    const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
                    const estimatedCost = equipment?.hourlyRate ? (hours * equipment.hourlyRate).toFixed(2) : null;
                    
                    return (
                      <div key={booking.id} className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                        <div>
                          <span className="font-medium text-white capitalize">{booking.equipmentName}</span>
                          <span className="text-slate-400 ml-2 text-xs">
                            {new Date(booking.startTime).toLocaleString()} → {new Date(booking.endTime).toLocaleString()}
                          </span>
                          <span className="text-slate-400 ml-2 text-xs">by {booking.bookedBy}</span>
                          {estimatedCost !== null && (
                            <span className="text-emerald-400 ml-2 text-xs">Est. cost: ${estimatedCost}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor(booking.status)}`}>{booking.status.replace('_', ' ')}</span>
                          {userRole === 'LAB_MANAGER' && booking.status === 'PENDING_APPROVAL' && (
                            <>
                              <button onClick={() => handleApproveBooking(booking.id)} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Approve</button>
                              <button onClick={() => handleCancelBooking(booking.id)} className="text-xs bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Cancel</button>
                            </>
                          )}
                          {userRole === 'LAB_MANAGER' && booking.status === 'CONFIRMED' && (
                            <button onClick={() => handleNoShowBooking(booking.id)} className="text-xs bg-rose-500/80 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Mark No-Show</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            )}

            {/* ---------- UTILIZATION ---------- */}
            {activePanel === 'utilization' && (
              <Panel title="Equipment Utilization" icon={BarChart3}>
                <p className="text-xs text-slate-400 mb-3">Based on confirmed bookings over the last 30 days</p>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {utilizationList.length === 0 && <p className="text-sm text-slate-400">No equipment found.</p>}
                  {utilizationList.map((stat) => (
                    <div key={stat.equipmentId} className="bg-slate-700/30 px-3 py-3 rounded-lg border border-slate-700">
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <span className="font-medium text-white capitalize text-sm">{stat.equipmentName}</span>
                          <span className="text-slate-400 ml-2 text-xs capitalize">{stat.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {stat.idleAlert && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">Idle Alert · {stat.idleDays}d</span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${usageLevelColor(stat.usageLevel)}`}>{stat.usageLevel}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2 mb-1">
                        <div className={`h-2 rounded-full ${barColor(stat.usageLevel)}`} style={{ width: `${Math.max(stat.utilizationRate, 2)}%` }}></div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {stat.utilizationRate}% utilized · {stat.bookedHours}h booked · {stat.totalBookings} booking{stat.totalBookings !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- HEATMAP ---------- */}
            {activePanel === 'heatmap' && (
              <Panel title="Utilization Heatmap (last 7 days)" icon={Flame}>
                {heatmapLoading && <p className="text-sm text-slate-400">Loading heatmap...</p>}
                {!heatmapLoading && (!heatmapData || heatmapData.rows.length === 0) && (
                  <p className="text-sm text-slate-400">No equipment data available.</p>
                )}
                {!heatmapLoading && heatmapData && heatmapData.rows.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left p-2 text-slate-400 font-medium">Equipment</th>
                          {heatmapData.days.map((d) => (
                            <th key={d} className="p-1 text-center text-slate-500 font-normal">{d.slice(5)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {heatmapData.rows.map((row) => (
                          <tr key={row.equipmentId}>
                            <td className="p-2 font-medium capitalize text-white">{row.equipmentName}</td>
                            {row.dailyHours.map((h, i) => {
                              const intensity = Math.min(1, h / 8);
                              return (
                                <td key={i} className="p-1 text-center">
                                  <div
                                    title={`${h}h booked`}
                                    className="w-8 h-8 rounded mx-auto flex items-center justify-center text-[10px] text-white transition-all hover:scale-110"
                                    style={{ backgroundColor: h === 0 ? '#1e293b' : `rgba(59,130,246,${0.3 + intensity * 0.6})` }}
                                  >
                                    {h > 0 ? h : ''}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            )}

            {/* ---------- DEMAND ---------- */}
            {activePanel === 'demand' && (
              <Panel title="Demand Analysis" icon={TrendingUp}>
                {demandLoading && <p className="text-sm text-slate-400">Loading demand data...</p>}
                {!demandLoading && demandData && (
                  <>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Bookings by Hour of Day</h4>
                    <div className="flex items-end gap-1 h-28 mb-6">
                      {demandData.hourly.map((h) => {
                        const max = Math.max(...demandData.hourly.map((x) => x.count), 1);
                        return (
                          <div key={h.hour} className="flex-1 flex flex-col items-center justify-end h-full">
                            <div
                              className="w-full bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t transition-all hover:from-blue-400 hover:to-indigo-400"
                              style={{ height: `${(h.count / max) * 100}%`, minHeight: h.count > 0 ? '4px' : '0px' }}
                              title={`${h.hour}:00 — ${h.count} bookings`}
                            ></div>
                            {h.hour % 3 === 0 && <span className="text-[9px] text-slate-500 mt-1">{h.hour}h</span>}
                          </div>
                        );
                      })}
                    </div>

                    <h4 className="text-sm font-medium text-slate-300 mb-2">Bookings by Day of Week</h4>
                    <div className="flex items-end gap-2 h-28">
                      {demandData.byDayOfWeek.map((d) => {
                        const max = Math.max(...demandData.byDayOfWeek.map((x) => x.count), 1);
                        return (
                          <div key={d.dayOfWeek} className="flex-1 flex flex-col items-center justify-end h-full">
                            <div
                              className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t transition-all hover:from-purple-400 hover:to-pink-400"
                              style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? '4px' : '0px' }}
                              title={`${d.count} bookings`}
                            ></div>
                            <span className="text-[9px] text-slate-500 mt-1">{d.dayOfWeek.slice(0, 3)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </Panel>
            )}

            {/* ---------- ANALYTICS ---------- */}
            {activePanel === 'analytics' && (
              <AnalyticsDashboard token={token} userRole={userRole} onExport={exportPDF} />
            )}

            {/* ---------- COST & BILLING ---------- */}
            {activePanel === 'costBilling' && (
              <CostBillingDashboard token={token} userRole={userRole} onExport={exportPDF} />
            )}

            {/* ---------- CALIBRATION ---------- */}
            {activePanel === 'calibration' && (
              <CalibrationPanel token={token} />
            )}

            {/* ---------- REPORTS ---------- */}
            {activePanel === 'reports' && (
              <ReportsPanel
                userRole={userRole}
                bookingsList={bookingsList}
                equipmentList={equipmentList}
                utilizationList={utilizationList}
                maintenanceList={maintenanceList}
                sharingRequestsList={sharingRequestsList}
                userEmail={userEmail}
                token={token}
                onExport={exportPDF}
              />
            )}

            {/* ---------- SHARING ---------- */}
            {activePanel === 'sharing' && (
              <Panel title="Inter-Institution Sharing" icon={Share2}>
                <form onSubmit={handleCreateSharingRequest} className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Equipment (from another institution)</label>
                    <select
                      value={sharingEquipmentId}
                      onChange={(e) => setSharingEquipmentId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      required
                    >
                      <option value="" className="bg-slate-800">Select equipment...</option>
                      {sharableEquipment.map((item) => (
                        <option key={item.id} value={item.id} className="bg-slate-800">{item.name} — owned by {institutionNameById(item.institutionId)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Your Institution</label>
                    <select
                      value={sharingInstitutionId}
                      onChange={(e) => setSharingInstitutionId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      required
                    >
                      <option value="" className="bg-slate-800">Select your institution...</option>
                      {allInstitutionsForDropdown.map((inst) => (
                        <option key={inst.id} value={inst.id} className="bg-slate-800">{inst.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Reason</label>
                    <input
                      type="text"
                      value={sharingReason}
                      onChange={(e) => setSharingReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. Need mass spec access for joint research"
                      required
                    />
                  </div>
                  <button type="submit" disabled={sharingLoading} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
                    {sharingLoading ? 'Submitting...' : 'Request Access'}
                  </button>
                </form>

                {sharingMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    sharingMessage.includes('submitted') || sharingMessage.includes('approved') || sharingMessage.includes('rejected')
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {sharingMessage}
                  </div>
                )}

                <h4 className="text-sm font-medium text-slate-300 mb-2">All Sharing Requests</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sharingRequestsList.length === 0 && <p className="text-sm text-slate-400">No sharing requests yet.</p>}
                  {sharingRequestsList.map((req) => (
                    <div key={req.id} className="bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-white capitalize">{req.equipmentName}</span>
                          <span className="text-slate-400 ml-2 text-xs">
                            {institutionNameById(req.requestingInstitutionId)} requesting from {institutionNameById(req.ownerInstitutionId)}
                          </span>
                        </div>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${sharingStatusColor(req.status)}`}>{req.status}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-slate-400">by {req.requestedBy} — {req.reason}</span>
                        {userRole === 'INSTITUTION_ADMINISTRATOR' && req.status === 'PENDING' && (
                          <div className="flex gap-1">
                            <button onClick={() => handleApproveSharing(req.id)} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Approve</button>
                            <button onClick={() => handleRejectSharing(req.id)} className="text-xs bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- WAITLIST ---------- */}
            {activePanel === 'waitlist' && (
              <Panel title="Equipment Waitlist" icon={Clock}>
                <p className="text-xs text-slate-400 mb-3">Join the waitlist for high-demand equipment — you'll be notified in order when a slot frees up.</p>
                <form onSubmit={handleJoinWaitlist} className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Equipment</label>
                    <select
                      value={waitlistEquipmentId}
                      onChange={(e) => setWaitlistEquipmentId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      required
                    >
                      <option value="" className="bg-slate-800">Select equipment...</option>
                      {waitlistEquipmentOptions.map((item) => (
                        <option key={item.id} value={item.id} className="bg-slate-800">{item.name} ({item.category})</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={waitlistLoading} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
                    {waitlistLoading ? 'Joining...' : 'Join Waitlist'}
                  </button>
                </form>

                {waitlistMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    waitlistMessage.includes('Joined') || waitlistMessage.includes('Removed') || waitlistMessage.includes('fulfilled')
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {waitlistMessage}
                  </div>
                )}

                <h4 className="text-sm font-medium text-slate-300 mb-2">My Waitlist Entries</h4>
                <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                  {myWaitlistEntries.length === 0 && <p className="text-sm text-slate-400">You're not on any waitlists yet.</p>}
                  {myWaitlistEntries.map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <span className="font-medium text-white capitalize">{entry.equipmentName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${waitlistStatusColor(entry.status)}`}>
                          {entry.status}{entry.status === 'NOTIFIED' && ' — a slot is free, book now!'}
                        </span>
                        {entry.status === 'WAITING' && (
                          <button onClick={() => handleLeaveWaitlist(entry.id)} className="text-xs bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Leave</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <h4 className="text-sm font-medium text-slate-300 mb-2">All Waitlist Entries</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {allWaitlistEntries.length === 0 && <p className="text-sm text-slate-400">No one is on a waitlist yet.</p>}
                  {allWaitlistEntries.map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div>
                        <span className="font-medium text-white capitalize">{entry.equipmentName}</span>
                        <span className="text-slate-400 ml-2 text-xs">{entry.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${waitlistStatusColor(entry.status)}`}>{entry.status}</span>
                        {userRole === 'LAB_MANAGER' && entry.status !== 'FULFILLED' && entry.status !== 'CANCELLED' && (
                          <button onClick={() => handleFulfillWaitlistEntry(entry.id)} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Mark Fulfilled</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- MAINTENANCE ---------- */}
            {activePanel === 'maintenance' && (userRole === 'LAB_MANAGER' || userRole === 'LAB_TECHNICIAN') && (
              <Panel title="Maintenance Of Equipment" icon={Wrench}>
                {userRole === 'LAB_MANAGER' && (
                  <form onSubmit={handleScheduleMaintenance} className="space-y-3 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Equipment</label>
                      <select
                        value={maintenanceEquipmentId}
                        onChange={(e) => setMaintenanceEquipmentId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                        required
                      >
                        <option value="" className="bg-slate-800">Select equipment...</option>
                        {availableEquipment.map((item) => (
                          <option key={item.id} value={item.id} className="bg-slate-800">{item.name} ({item.category})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Scheduled Date</label>
                      <input
                        type="date"
                        value={maintenanceDate}
                        onChange={(e) => setMaintenanceDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white [color-scheme:dark]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                      <input
                        type="text"
                        value={maintenanceDescription}
                        onChange={(e) => setMaintenanceDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                        placeholder="e.g. Annual calibration check"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Assigned Technician (email)</label>
                      <input
                        type="email"
                        value={maintenanceTechnician}
                        onChange={(e) => setMaintenanceTechnician(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                        placeholder="e.g. john@test.com"
                        required
                      />
                    </div>
                    <button type="submit" disabled={maintenanceLoading} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
                      {maintenanceLoading ? 'Scheduling...' : 'Schedule'}
                    </button>
                  </form>
                )}

                {maintenanceMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    maintenanceMessage.includes('scheduled') || maintenanceMessage.includes('Marked')
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {maintenanceMessage}
                  </div>
                )}

                <h4 className="text-sm font-medium text-slate-300 mb-2">Maintenance Records</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {maintenanceList.length === 0 && <p className="text-sm text-slate-400">No maintenance records yet.</p>}
                  {maintenanceList.map((rec) => (
                    <div key={rec.id} className="bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-white capitalize">{rec.equipmentName}</span>
                          <span className="text-slate-400 ml-2 text-xs">{rec.type} · {rec.description}</span>
                        </div>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${maintenanceStatusColor(rec.status)}`}>{rec.status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-slate-400">
                          Scheduled: {rec.scheduledDate} · Technician: {rec.assignedTechnician}
                          {rec.completedDate && ` · Completed: ${rec.completedDate}`}
                          {rec.certificateNumber && ` · Cert: ${rec.certificateNumber}`}
                          {rec.nextCalibrationDue && ` · Next due: ${rec.nextCalibrationDue}`}
                        </span>
                        {rec.status !== 'COMPLETED' && (
                          <div className="flex gap-1">
                            {rec.status === 'SCHEDULED' && (
                              <button onClick={() => handleMaintenanceStatusChange(rec.id, 'IN_PROGRESS')} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Start</button>
                            )}
                            <button onClick={() => handleMaintenanceStatusChange(rec.id, 'COMPLETED')} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Complete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- EQUIPMENT ---------- */}
            {activePanel === 'equipment' && userRole === 'LAB_MANAGER' && (
              <Panel title="Equipment Inventory" icon={FlaskConical}>
                <form onSubmit={handleAddEquipment} className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Equipment Name</label>
                    <input
                      type="text"
                      value={equipmentName}
                      onChange={(e) => setEquipmentName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. Centrifuge"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={equipmentCategory}
                      onChange={(e) => setEquipmentCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. Lab Equipment"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                    <textarea
                      value={equipmentDescription}
                      onChange={(e) => setEquipmentDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. High-speed benchtop centrifuge, max 15,000 rpm"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Institution (optional)</label>
                    <select
                      value={equipmentInstitutionId}
                      onChange={(e) => setEquipmentInstitutionId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                    >
                      <option value="" className="bg-slate-800">Unassigned</option>
                      {allInstitutionsForDropdown.map((inst) => (
                        <option key={inst.id} value={inst.id} className="bg-slate-800">{inst.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Purchase Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={equipmentCost}
                        onChange={(e) => setEquipmentCost(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                        placeholder="e.g. 25000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Hourly Rate ($/hr)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={equipmentHourlyRate}
                        onChange={(e) => setEquipmentHourlyRate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                        placeholder="e.g. 50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Photo (optional)</label>
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setShowCameraModal(true)}
                        className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-blue-500/30 transition-colors"
                      >
                        <Camera size={14} /> Take Photo
                      </button>
                      <label className="cursor-pointer bg-slate-700/50 text-slate-300 border border-slate-600 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-slate-600 transition-colors">
                        <Upload size={14} /> Upload File
                        <input type="file" accept="image/*" onChange={handleEquipmentImageChange} className="hidden" />
                      </label>
                    </div>
                    {equipmentImage && (
                      <div className="relative w-24 h-24">
                        <img src={equipmentImage} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-slate-600" />
                        <button
                          type="button"
                          onClick={() => setEquipmentImage('')}
                          className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-rose-500/25"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-1">Max 2MB.</p>
                  </div>

                  <button type="submit" disabled={equipmentLoading} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
                    {equipmentLoading ? 'Adding...' : 'Save Equipment'}
                  </button>
                </form>

                {equipmentMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    equipmentMessage.includes('successfully') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {equipmentMessage}
                  </div>
                )}

                <h4 className="text-sm font-medium text-slate-300 mb-2">Current Equipment</h4>
                {/* Category Filter */}
                <div className="flex gap-3 mb-4">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Equipment table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-700">
                        <th className="pb-2 pr-3 font-medium">Photo</th>
                        <th className="pb-2 pr-3 font-medium">Name</th>
                        <th className="pb-2 pr-3 font-medium">Category</th>
                        <th className="pb-2 pr-3 font-medium">Cost</th>
                        <th className="pb-2 pr-3 font-medium">Rate/hr</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEquipment.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-4 text-center text-slate-400">No equipment found.</td>
                        </tr>
                      )}
                      {filteredEquipment.map((item) => (
                        <tr key={item.id} className="border-b border-slate-700/50">
                          <td className="py-2 pr-3">
                            {item.imageBase64 ? (
                              <img src={item.imageBase64} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-600" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-500">
                                <FlaskConical size={18} />
                              </div>
                            )}
                          </td>
                          <td className="py-2 pr-3 font-medium text-white capitalize">{item.name}</td>
                          <td className="py-2 pr-3 text-slate-400 capitalize">{item.category || '—'}</td>
                          <td className="py-2 pr-3 text-slate-300">{item.cost ? `$${item.cost}` : '—'}</td>
                          <td className="py-2 pr-3 text-slate-300">{item.hourlyRate ? `$${item.hourlyRate}/hr` : '—'}</td>
                          <td className="py-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              item.status === 'UNDER_MAINTENANCE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {item.status || 'AVAILABLE'}
                            </span>
                          </td>
                          <td className="py-2">
                            <div className="flex gap-1">
                              <button
                                onClick={() => openEditModal(item)}
                                className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-1 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteEquipment(item.id)}
                                className="text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-2 py-1 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}

            {/* ---------- Edit Equipment Modal ---------- */}
            <AnimatePresence>
              {showEditModal && editingEquipment && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-800 rounded-2xl p-6 w-full max-w-4xl shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-800 z-10 pb-4 border-b border-slate-700">
                      <h3 className="text-xl font-semibold text-white">Edit Equipment: {editingEquipment.name}</h3>
                      <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-slate-700 transition-colors">
                        <X size={24} className="text-gray-400" />
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-1 mb-6 border-b border-slate-700 pb-2">
                      {['basic', 'location', 'availability', 'booking', 'maintenance', 'calibration', 'cost', 'sharing'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setEditTab(tab)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            editTab === tab
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleUpdateEquipment}>
                      {/* --- TAB: Basic --- */}
                      {editTab === 'basic' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Equipment Name *</label>
                            <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                            <input type="text" name="category" value={editFormData.category} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                            <textarea name="description" value={editFormData.description} onChange={handleEditChange} rows={2} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Manufacturer</label>
                            <input type="text" name="manufacturer" value={editFormData.manufacturer} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Model Number</label>
                            <input type="text" name="modelNumber" value={editFormData.modelNumber} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Serial Number</label>
                            <input type="text" name="serialNumber" value={editFormData.serialNumber} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Image (Base64)</label>
                            <input type="text" name="imageBase64" value={editFormData.imageBase64} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" placeholder="data:image/jpeg;base64,..." />
                          </div>
                        </div>
                      )}

                      {/* --- TAB: Location --- */}
                      {editTab === 'location' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Institution ID</label>
                            <input type="number" name="institutionId" value={editFormData.institutionId} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
                            <input type="text" name="department" value={editFormData.department} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Location / Room</label>
                            <input type="text" name="location" value={editFormData.location} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Equipment Owner</label>
                            <input type="text" name="owner" value={editFormData.owner} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" name="availableForSharing" checked={editFormData.availableForSharing} onChange={handleEditChange} className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-blue-500" />
                            <label className="text-sm text-slate-300">Available for inter‑institution sharing</label>
                          </div>
                        </div>
                      )}

                      {/* --- TAB: Availability --- */}
                      {editTab === 'availability' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                            <select name="status" value={editFormData.status} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white">
                              <option value="AVAILABLE">Available</option>
                              <option value="IN_USE">In Use</option>
                              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                              <option value="RESERVED">Reserved</option>
                              <option value="OUT_OF_SERVICE">Out of Service</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Availability (e.g., Mon-Fri 9-5)</label>
                            <input type="text" name="availability" value={editFormData.availability} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Operating Hours</label>
                            <input type="text" name="operatingHours" value={editFormData.operatingHours} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                        </div>
                      )}

                      {/* --- TAB: Booking --- */}
                      {editTab === 'booking' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" name="bookingEnabled" checked={editFormData.bookingEnabled} onChange={handleEditChange} className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-blue-500" />
                            <label className="text-sm text-slate-300">Booking Enabled</label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Max Booking Duration (hrs)</label>
                            <input type="number" name="maxBookingDuration" value={editFormData.maxBookingDuration} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Min Booking Duration (hrs)</label>
                            <input type="number" name="minBookingDuration" value={editFormData.minBookingDuration} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Advance Booking Limit (days)</label>
                            <input type="number" name="advanceBookingLimit" value={editFormData.advanceBookingLimit} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Usage Restrictions</label>
                            <input type="text" name="usageRestrictions" value={editFormData.usageRestrictions} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                        </div>
                      )}

                      {/* --- TAB: Maintenance --- */}
                      {editTab === 'maintenance' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Last Maintenance Date</label>
                            <input type="date" name="lastMaintenanceDate" value={editFormData.lastMaintenanceDate} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Next Maintenance Date</label>
                            <input type="date" name="nextMaintenanceDate" value={editFormData.nextMaintenanceDate} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Maintenance Frequency</label>
                            <input type="text" name="maintenanceFrequency" value={editFormData.maintenanceFrequency} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Maintenance Notes</label>
                            <input type="text" name="maintenanceNotes" value={editFormData.maintenanceNotes} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                        </div>
                      )}

                      {/* --- TAB: Calibration --- */}
                      {editTab === 'calibration' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" name="calibrationRequired" checked={editFormData.calibrationRequired} onChange={handleEditChange} className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-blue-500" />
                            <label className="text-sm text-slate-300">Calibration Required</label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Last Calibration Date</label>
                            <input type="date" name="lastCalibrationDate" value={editFormData.lastCalibrationDate} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Next Calibration Date</label>
                            <input type="date" name="nextCalibrationDate" value={editFormData.nextCalibrationDate} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Certificate Number</label>
                            <input type="text" name="calibrationCertificateNumber" value={editFormData.calibrationCertificateNumber} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Certificate Upload (Base64)</label>
                            <input type="text" name="certificateUpload" value={editFormData.certificateUpload} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                        </div>
                      )}

                      {/* --- TAB: Cost --- */}
                      {editTab === 'cost' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Cost per Hour ($)</label>
                            <input type="number" step="0.01" name="costPerHour" value={editFormData.costPerHour} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Maintenance Cost ($)</label>
                            <input type="number" step="0.01" name="maintenanceCost" value={editFormData.maintenanceCost} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Usage Cost ($)</label>
                            <input type="number" step="0.01" name="usageCost" value={editFormData.usageCost} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Inter‑Institution Usage Fee ($)</label>
                            <input type="number" step="0.01" name="interInstitutionFee" value={editFormData.interInstitutionFee} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                        </div>
                      )}

                      {/* --- TAB: Sharing --- */}
                      {editTab === 'sharing' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" name="allowExternalRequests" checked={editFormData.allowExternalRequests} onChange={handleEditChange} className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-blue-500" />
                            <label className="text-sm text-slate-300">Allow External/Other Institution Requests</label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Sharing Fee ($)</label>
                            <input type="number" step="0.01" name="sharingFee" value={editFormData.sharingFee} onChange={handleEditChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" name="sharingApprovalRequired" checked={editFormData.sharingApprovalRequired} onChange={handleEditChange} className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-blue-500" />
                            <label className="text-sm text-slate-300">Sharing Approval Required</label>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700 sticky bottom-0 bg-slate-800 py-4">
                        <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-slate-600 rounded-lg text-sm font-medium text-gray-300 hover:bg-slate-700 transition-colors">
                          Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25">
                          Update Equipment
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* ---------- REQUESTS ---------- */}
            {activePanel === 'requests' && userRole === 'DEPARTMENT_HEAD' && (
              <Panel title="Pending Access Requests" icon={ClipboardList}>
                {requestsMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    requestsMessage.includes('approved') || requestsMessage.includes('rejected') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {requestsMessage}
                  </div>
                )}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {requestsList.length === 0 && <p className="text-sm text-slate-400">No requests found.</p>}
                  {requestsList.map((req) => (
                    <div key={req.id} className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div>
                        <span className="font-medium text-white capitalize">{req.equipmentName}</span>
                        <span className="text-slate-400 ml-2 text-xs">by {req.requestedBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          req.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {req.status}
                        </span>
                        {req.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleApprove(req.id)} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Approve</button>
                            <button onClick={() => handleReject(req.id)} className="text-xs bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- INSTITUTIONS ---------- */}
            {activePanel === 'institutions' && userRole === 'INSTITUTION_ADMINISTRATOR' && (
              <Panel title="Manage Institutions" icon={Building2}>
                <form onSubmit={handleAddInstitution} className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Institution Name</label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. IIT Bangalore"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
                    <input
                      type="text"
                      value={institutionAddress}
                      onChange={(e) => setInstitutionAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. Bangalore, India"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={institutionEmail}
                      onChange={(e) => setInstitutionEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. admin@institution.edu"
                      required
                    />
                  </div>
                  <button type="submit" disabled={institutionLoading} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
                    {institutionLoading ? 'Adding...' : 'Add Institution'}
                  </button>
                </form>

                {institutionMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    institutionMessage.includes('successfully') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {institutionMessage}
                  </div>
                )}

                <h4 className="text-sm font-medium text-slate-300 mb-2">All Institutions</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {institutionsList.length === 0 && <p className="text-sm text-slate-400">No institutions added yet.</p>}
                  {institutionsList.map((inst) => (
                    <div key={inst.id} className="bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div className="font-medium text-white">{inst.name}</div>
                      <div className="text-slate-400 text-xs">{inst.address} — {inst.contactEmail}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- USERS ---------- */}
            {activePanel === 'users' && userRole === 'SYSTEM_ADMINISTRATOR' && (
              <Panel title="Manage Users" icon={Users}>
                {adminMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    adminMessage.includes('is now') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {adminMessage}
                  </div>
                )}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {usersList.length === 0 && <p className="text-sm text-slate-400">No users found.</p>}
                  {usersList.map((u) => (
                    <div key={u.id} className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div>
                        <span className="font-medium text-white">{u.name}</span>
                        <span className="text-slate-400 ml-2 text-xs">{u.email}</span>
                      </div>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs border border-slate-600 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all bg-slate-700/50 text-white"
                      >
                        {ALL_ROLES.map((r) => <option key={r} value={r} className="bg-slate-800">{r}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- ROLE REQUESTS ADMIN ---------- */}
            {activePanel === 'roleRequestsAdmin' && userRole === 'SYSTEM_ADMINISTRATOR' && (
              <Panel title="Pending Role Requests" icon={ShieldCheck}>
                {roleRequestAdminMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    roleRequestAdminMessage.includes('approved') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {roleRequestAdminMessage}
                  </div>
                )}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allRoleRequests.length === 0 && <p className="text-sm text-slate-400">No role requests found.</p>}
                  {allRoleRequests.map((r) => (
                    <div key={r.id} className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div>
                        <span className="font-medium text-white">{r.userEmail}</span>
                        <span className="text-slate-400 ml-2 text-xs">wants {r.requestedRole.replace('_', ' ')} — {r.reason}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${roleRequestStatusColor(r.status)}`}>{r.status}</span>
                        {r.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleApproveRoleRequest(r.id)} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Approve</button>
                            <button onClick={() => handleRejectRoleRequest(r.id)} className="text-xs bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- MY ROLE REQUEST ---------- */}
            {activePanel === 'roleRequest' && userRole !== 'SYSTEM_ADMINISTRATOR' && (
              <Panel title="Request a Different Role" icon={GraduationCap}>
                <form onSubmit={handleRoleRequestSubmit} className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Desired Role</label>
                    <select
                      value={desiredRole}
                      onChange={(e) => setDesiredRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                    >
                      {REQUESTABLE_ROLES.map((r) => <option key={r} value={r} className="bg-slate-800">{r.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Reason</label>
                    <input
                      type="text"
                      value={roleRequestReason}
                      onChange={(e) => setRoleRequestReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. I manage the chemistry lab"
                      required
                    />
                  </div>
                  <button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25">
                    Submit Request
                  </button>
                </form>

                {roleRequestMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    roleRequestMessage.includes('submitted') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {roleRequestMessage}
                  </div>
                )}

                <h4 className="text-sm font-medium text-slate-300 mb-2">My Requests</h4>
                <div className="space-y-2">
                  {myRoleRequests.length === 0 && <p className="text-sm text-slate-400">No requests yet.</p>}
                  {myRoleRequests.map((r) => (
                    <div key={r.id} className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div>
                        <span className="font-medium text-white">{r.requestedRole.replace('_', ' ')}</span>
                        <span className="text-slate-400 ml-2 text-xs">{r.reason}</span>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${roleRequestStatusColor(r.status)}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- MY PROFILE ---------- */}
            {activePanel === 'myProfile' && (
              <Panel title="My Profile" icon={UserIcon}>
                <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                  <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-slate-400">Name</div>
                    <div className="font-medium text-white">{userName || '—'}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-slate-400">Email</div>
                    <div className="font-medium text-white">{userEmail}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-slate-400">Role</div>
                    <div className="font-medium text-white">{userRole.replace('_', ' ')}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-slate-400">Current Institution</div>
                    <div className="font-medium text-white">{userInstitutionId ? institutionNameById(userInstitutionId) : 'None'}</div>
                  </div>
                </div>

                <form onSubmit={handleUpdateMyProfile} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Institution</label>
                    <select
                      value={myProfileInstitutionId}
                      onChange={(e) => setMyProfileInstitutionId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                    >
                      <option value="" className="bg-slate-800">No institution</option>
                      {allInstitutionsForDropdown.map((i) => <option key={i.id} value={i.id} className="bg-slate-800">{i.name}</option>)}
                    </select>
                  </div>
                  {userRole === 'RESEARCHER_STUDENT' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">I am a...</label>
                      <select
                        value={myProfileType}
                        onChange={(e) => setMyProfileType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      >
                        <option value="STUDENT" className="bg-slate-800">Student</option>
                        <option value="RESEARCHER" className="bg-slate-800">Researcher</option>
                      </select>
                    </div>
                  )}
                  <button type="submit" disabled={myProfileLoading} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
                    {myProfileLoading ? 'Saving...' : 'Save Profile'}
                  </button>
                </form>

                {myProfileMessage && (
                  <div className="text-sm p-3 rounded-lg mt-4 bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {myProfileMessage}
                  </div>
                )}
              </Panel>
            )}
          </main>
        </div>

        {showCameraModal && (
          <CameraCapture
            onCapture={(dataUrl) => { setEquipmentImage(dataUrl); setShowCameraModal(false); }}
            onClose={() => setShowCameraModal(false)}
          />
        )}
      </div>
    );
  }

  // ==================== NOT LOGGED IN: AUTH PAGE ====================
  return <AuthPage onLogin={handleLogin} />;
}

// ==================== EXPORT ====================
export default App;