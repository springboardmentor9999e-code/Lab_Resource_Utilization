import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import microscope from '../../public/microscope.png'

export default function Login({ onNavigate, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    roleId: 3, // Default role: Lab Manager (id: 3)
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    const payload = {
      email: formData.email.trim(),
      password: formData.password,
      roleId: Number(formData.roleId)
    };

    // Try logging in to the backend
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
      
      // If it is a thrown Error during backend validation (e.g. Invalid password or Selected role does not match)
      if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('network')) {
        setLoading(false);
        setError(err.message);
        return;
      }

      // If backend is offline, check against predefined demo credentials
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;
      const roleIdInt = Number(formData.roleId);

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
              
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-on-surface-variant">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="scientist@demo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-on-surface-variant">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-on-surface-variant">
                  Login Role
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
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

    </div>
  );
}
