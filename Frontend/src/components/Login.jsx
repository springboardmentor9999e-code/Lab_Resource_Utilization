import React, { useState, useRef, useCallback } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

import microscope from '../../public/microscope.png'

export default function Login({ onNavigate, onLoginSuccess }) {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const roleIdRef = useRef(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // New Google User Setup Modal State
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState('');
  const [googleUserEmail, setGoogleUserEmail] = useState('');
  const [googleUserName, setGoogleUserName] = useState('');
  const newRoleRef = useRef(null);
  const newInstRef = useRef(null);
  const newDeptRef = useRef(null);
  const newLabRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id-here.apps.googleusercontent.com';

  const handleGoogleSuccess = useCallback((idToken) => {
    if (!idToken) return;

    setLoading(true);
    setError('');

    const roleIdVal = roleIdRef.current?.value ? Number(roleIdRef.current.value) : null;

    fetch('http://localhost:8080/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, roleId: roleIdVal })
    })
    .then(async (res) => {
      if (!res.ok) {
        let errStr = 'Google login failed';
        try {
          const json = await res.json();
          errStr = json.message || json.error || errStr;
        } catch (_) {}

        if (res.status === 428 || errStr.startsWith('NEW_GOOGLE_USER_ROLE_REQUIRED')) {
          const parts = errStr.replace('NEW_GOOGLE_USER_ROLE_REQUIRED: ', '').split('|');
          setGoogleIdToken(idToken);
          setGoogleUserEmail(parts[0] || 'Google User');
          setGoogleUserName(parts[1] || 'User');
          setShowNewUserModal(true);
          setLoading(false);
          return;
        }
        throw new Error(errStr);
      }
      return res.json();
    })
    .then((data) => {
      if (!data) return;
      setLoading(false);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      onLoginSuccess(data.user);
    })
    .catch((err) => {
      setLoading(false);
      setError(err.message || 'Google sign in failed');
    });
  }, [onLoginSuccess]);

  const handleGoogleError = useCallback((errMsg) => {
    setError(errMsg || 'Google Authentication Failed');
  }, []);

  const { buttonContainerRef } = useGoogleAuth({
    clientId: googleClientId,
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError
  });

  const handleConfirmNewUserGoogleSetup = (e) => {
    e.preventDefault();
    if (!googleIdToken) return;

    setLoading(true);
    setError('');

    const roleIdVal = newRoleRef.current?.value ? Number(newRoleRef.current.value) : 1;
    const instIdVal = newInstRef.current?.value ? Number(newInstRef.current.value) : null;
    const deptIdVal = newDeptRef.current?.value ? Number(newDeptRef.current.value) : null;
    const labIdVal = newLabRef.current?.value ? Number(newLabRef.current.value) : null;

    fetch('http://localhost:8080/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: googleIdToken,
        roleId: roleIdVal,
        institutionId: instIdVal,
        departmentId: deptIdVal,
        labId: labIdVal
      })
    })
    .then(async (res) => {
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Account registration failed');
      }
      return res.json();
    })
    .then((data) => {
      setLoading(false);
      setShowNewUserModal(false);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      onLoginSuccess(data.user);
    })
    .catch((err) => {
      setLoading(false);
      setError(err.message || 'Failed to complete Google account registration');
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const emailVal = emailRef.current?.value ? emailRef.current.value.trim() : '';
    const passwordVal = passwordRef.current?.value || '';
    const roleIdVal = roleIdRef.current?.value ? Number(roleIdRef.current.value) : 3;

    if (!emailVal || !passwordVal) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    const payload = {
      email: emailVal,
      password: passwordVal,
      roleId: roleIdVal
    };

    fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(async (res) => {
      if (!res.ok) {
        let errorMsg = 'Authentication failed';
        try {
          const data = await res.json();
          errorMsg = data.message || errorMsg;
        } catch (_) {
          try {
            const text = await res.text();
            errorMsg = text || errorMsg;
          } catch (_) {}
        }
        throw new Error(errorMsg);
      }
      return res.json();
    })
    .then((data) => {
      setLoading(false);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      onLoginSuccess(data.user);
    })
    .catch((err) => {
      console.warn('Backend authentication failed:', err);
      
      if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('network')) {
        setLoading(false);
        setError(err.message);
        return;
      }

      const email = emailVal.toLowerCase();
      const password = passwordVal;
      const roleIdInt = roleIdVal;

      const demoCredentials = {
        'student@demo.com': { password: 'student123', roleId: 1, name: 'Student Demo' },
        'tech@demo.com': { password: 'tech123', roleId: 2, name: 'Technician Demo' },
        'manager@demo.com': { password: 'manager123', roleId: 3, name: 'Manager Demo' },
        'head@demo.com': { password: 'head123', roleId: 4, name: 'Dept Head Demo' },
        'admin@demo.com': { password: 'admin123', roleId: 5, name: 'Admin Demo' }
      };

      const match = demoCredentials[email];
      if (match && match.password === password && match.roleId === roleIdInt) {
        setTimeout(() => {
          setLoading(false);
          let permissions = [];
          let roleName = "";
          
          switch (roleIdInt) {
            case 1:
              permissions = ["view_equipment", "create_booking", "view_own_bookings", "join_waitlist"];
              roleName = "Researcher / Student";
              break;
            case 2:
              permissions = ["view_equipment", "update_equipment_status", "manage_maintenance_requests", "log_calibration"];
              roleName = "Lab Technician";
              break;
            case 3:
              permissions = ["approve_bookings", "manage_equipment", "view_department_utilization", "manage_waitlist", "manage_maintenance", "view_equipment"];
              roleName = "Lab Manager";
              break;
            case 4:
              permissions = ["approve_bookings", "view_department_reports", "manage_department_budget", "approve_sharing_requests", "approve_lab_manager", "approve_lab_technician", "manage_labs", "view_equipment"];
              roleName = "Department Head";
              break;
            case 5:
              permissions = ["manage_users", "view_institution_reports", "manage_sharing_agreements", "manage_institution_equipment", "manage_departments", "approve_department_head", "view_equipment"];
              roleName = "Institution Administrator";
              break;
            case 6:
              permissions=["manage_all_institutions","view_equipment"];
              roleName="System Administrator";
            default:
              permissions = ["view_equipment"];
              roleName = "User";
          }

          onLoginSuccess({
            email: email,
            name: match.name,
            roleId: roleIdInt,
            roleName: roleName,
            permissions: permissions,
            institutionId: 101,
            departmentId: 11,
            labId: 1,
            status: 'ACTIVE',
          });
        }, 600);
      } else {
        setLoading(false);
        setError('Invalid credentials. (Note: Offline? Use demo accounts: student@demo.com / student123)');
      }
    });
  };

  return (
    <div className="min-h-screen bg-surface-bg text-on-surface flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-outline-variant/30 py-4 px-6 md:px-10 flex items-center justify-between">
        <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
          <img className='w-8 mr-3' src={microscope} alt="logo" />
          <span className="text-xl md:text-2xl font-bold text-primary logo-font tracking-tight">LabMaintain</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('login')}
            className="text-sm font-semibold text-primary border-b-2 border-primary pb-0.5"
          >
            Login
          </button>
          <button 
            onClick={() => onNavigate('register')}
            className="text-sm font-semibold text-on-surface-variant hover:text-primary transition"
          >
            Register
          </button>
        </div>
      </header>

      {/* Main Login */}
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-4">
        <div className="w-full max-w-[500px] bg-white border border-outline-variant/30 rounded-xl shadow-md p-10 space-y-8 animate-fadeIn">
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-primary font-serif">Welcome Back</h2>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
              Sign in to manage your laboratory assets and schedules.
            </p>
          </div>

          {/* Google OAuth Single Sign-On Button */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-full flex justify-center min-h-[44px]">
              <div ref={buttonContainerRef} className="flex justify-center" />
            </div>
            <div className="w-full flex items-center gap-3 my-1">
              <div className="flex-1 h-[1px] bg-slate-200"></div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">or sign in with password</span>
              <div className="flex-1 h-[1px] bg-slate-200"></div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-lg font-semibold">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4 py-4">
              <Skeleton height={18} width="35%" />
              <Skeleton height={44} borderRadius={8} />
              <Skeleton height={18} width="35%" />
              <Skeleton height={44} borderRadius={8} />
              <Skeleton height={48} borderRadius={8} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-sm font-semibold">
              
              <div className="space-y-1.5 text-left">
                <label className="block text-xs uppercase tracking-wider text-on-surface-variant">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="scientist@demo.com"
                  ref={emailRef}
                  defaultValue=""
                  className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs uppercase tracking-wider text-on-surface-variant">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  ref={passwordRef}
                  defaultValue=""
                  className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs uppercase tracking-wider text-on-surface-variant">
                  Login Role
                </label>
                <select
                  ref={roleIdRef}
                  defaultValue={3}
                  className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition bg-white"
                >
                  <option value={1}>Research / Student</option>
                  <option value={2}>Lab Technician</option>
                  <option value={3}>Lab Manager</option>
                  <option value={4}>Department Head</option>
                  <option value={5}>Institution Administrator</option>
                  <option value={6}>System Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00a2c0] hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}

          <div className="text-center pt-4 border-t border-outline-variant/30">
            <p className="text-xs text-on-surface-variant font-semibold">
              Don't have an account?{' '}
              <button 
                onClick={() => onNavigate('register')}
                className="text-primary hover:underline font-bold"
              >
                Register instead
              </button>
            </p>
          </div>

        </div>
      </main>

      {/* Warning / Setup Modal for New Google Users */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-left space-y-5">
            
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="font-bold text-amber-800 text-sm flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                New Google Account Setup
              </span>
              <p className="text-xs text-amber-700 leading-normal">
                Welcome <span className="font-bold">{googleUserName}</span>! No existing account was found for <span className="font-mono">{googleUserEmail}</span>. Please select your account details to complete registration (nothing assigned by default).
              </p>
            </div>

            <form onSubmit={handleConfirmNewUserGoogleSetup} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block uppercase text-slate-500 font-bold">Select Role <span className="text-rose-500">*</span></label>
                <select
                  ref={newRoleRef}
                  defaultValue={1}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary"
                  required
                >
                  <option value={1}>Researcher / Student</option>
                  <option value={2}>Lab Technician</option>
                  <option value={3}>Lab Manager</option>
                  <option value={4}>Department Head</option>
                  <option value={5}>Institution Administrator</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block uppercase text-slate-500 font-bold text-[10px]">Institution ID</label>
                  <input
                    type="number"
                    placeholder="e.g. 101 (Optional)"
                    ref={newInstRef}
                    className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block uppercase text-slate-500 font-bold text-[10px]">Department ID</label>
                  <input
                    type="number"
                    placeholder="e.g. 11 (Optional)"
                    ref={newDeptRef}
                    className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block uppercase text-slate-500 font-bold text-[10px]">Lab ID (For Tech / Manager)</label>
                <input
                  type="number"
                  placeholder="e.g. 1 (Optional)"
                  ref={newLabRef}
                  className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-[#00a2c0] hover:bg-cyan-700 text-white font-bold text-xs transition"
                >
                  {loading ? 'Finalizing Setup...' : 'Complete Google Registration'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* On-Screen Error Popup Modal */}
      {error && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white border border-rose-100 rounded-3xl w-full max-w-md p-7 shadow-2xl text-center space-y-5 transform transition-all scale-100">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 font-serif">Authentication Failed</h3>
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-semibold leading-relaxed">
                {error}
              </div>
            </div>

            <button
              onClick={() => setError('')}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition shadow-md active:scale-95 text-sm"
            >
              Dismiss & Try Again
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

