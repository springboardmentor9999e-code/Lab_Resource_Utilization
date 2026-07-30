import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import microscope from '../assets/microscope.png';

const ROLES = [
  { id: '1', name: 'Research/Student' },
  { id: '2', name: 'Lab Technician' },
  { id: '3', name: 'Lab Manager' },
  { id: '4', name: 'Department Head' },
  { id: '5', name: 'Institution Administrator' }
];

export default function Register({ onNavigate, onRegisterSuccess }) {
  const [step, setStep] = useState(1); // 1, 2, 3
  const [accountType, setAccountType] = useState('Individual User');
  const [formData, setFormData] = useState({
    roleId: '1',
    name: '',
    email: '',
    password: '',
    phone: '',
    institutionId: '',
    departmentId: '',
    labId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all fields.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    const payload = {
      name: formData.name || formData.email.split('@')[0],
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone,
      roleId: Number(formData.roleId),
      institutionId: formData.institutionId ? Number(formData.institutionId) : null,
      departmentId: formData.departmentId ? Number(formData.departmentId) : null,
      labId: (formData.roleId === '2' || formData.roleId === '3') && formData.labId ? Number(formData.labId) : null
    };

    fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(async (res) => {
      if (!res.ok) {
        let errorMsg = 'Registration failed';
        try {
          const data = await res.json();
          if (data.errors && Array.isArray(data.errors)) {
            errorMsg = data.errors.join(', ');
          } else {
            errorMsg = data.message || errorMsg;
          }
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
      const roleIdInt = Number(formData.roleId);
      let permissions = [];
      let roleName = "";
      switch (roleIdInt) {
        case 1: permissions = ["view_equipment", "create_booking", "view_own_bookings", "join_waitlist"]; roleName = "Researcher / Student"; break;
        case 2: permissions = ["view_equipment", "update_equipment_status", "manage_maintenance_requests", "log_calibration"]; roleName = "Lab Technician"; break;
        case 3: permissions = ["approve_bookings", "manage_equipment", "view_department_utilization", "manage_waitlist", "manage_maintenance", "view_equipment"]; roleName = "Lab Manager"; break;
        case 4: permissions = ["approve_bookings", "view_department_reports", "manage_department_budget", "approve_sharing_requests", "approve_lab_manager", "approve_lab_technician", "manage_labs", "view_equipment"]; roleName = "Department Head"; break;
        case 5: permissions = ["manage_users", "view_institution_reports", "manage_sharing_agreements", "manage_institution_equipment", "manage_departments", "approve_department_head", "view_equipment"]; roleName = "Institution Administrator"; break;
      }
      
      onRegisterSuccess({
        userId: data.userId || 999,
        email: formData.email,
        roleId: roleIdInt,
        roleName: roleName,
        permissions: permissions,
        institutionId: payload.institutionId,
        departmentId: payload.departmentId,
        labId: payload.labId,
        status: (roleIdInt === 1) ? 'ACTIVE' : 'PENDING_APPROVAL'
      });
    })
    .catch((err) => {
      console.warn('Backend registration failed:', err);
      setLoading(false);
      
      if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('network')) {
        setError(err.message);
      } else {
        setError('Cannot connect to server. Please verify your backend service is running.');
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
            className="text-sm font-semibold text-on-surface-variant hover:text-primary transition"
          >
            Login
          </button>
          <button 
            onClick={() => onNavigate('register')}
            className="text-sm font-semibold text-primary border-b-2 border-primary pb-0.5"
          >
            Register
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-4">
        
        <div className="w-full max-w-[540px] bg-white border border-outline-variant/30 rounded-xl shadow-md p-10 space-y-8 animate-fadeIn">
          
          <div className="flex flex-col">
            
            {/* Step 1: Account Type selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-primary font-serif">Create Account</h2>
                  <p className="text-sm text-on-surface-variant">
                    Establish credentials to access the LabMaintain infrastructure portal.
                  </p>
                </div>

                <div className="space-y-4 max-w-md mx-auto pt-4 ">
                  <button 
                    onClick={() => { setAccountType('Individual User'); handleNextStep(); }}
                    className="w-full text-left p-5 border border-outline-variant hover:border-primary hover:bg-primary/5 rounded-xl transition flex justify-between items-center group bg-white shadow-sm"
                  >
                    <div>
                      <span className="font-bold text-sm text-on-surface block">Individual User Account</span>
                      <span className="text-xs text-on-surface-variant mt-1 block">For Student Researchers, Technicians, Managers & Heads.</span>
                    </div>
                    <span className="text-lg group-hover:translate-x-1 transition font-bold text-primary">&rarr;</span>
                  </button>
                </div>
                 <div className="space-y-4 max-w-md mx-auto pt-4">
                  <button 
                    onClick={() => { setAccountType('Individual User'); handleNextStep(); }}
                    className="w-full text-left p-5 border border-outline-variant hover:border-primary hover:bg-primary/5 rounded-xl transition flex justify-between items-center group bg-white shadow-sm"
                  >
                    <div>
                      <span className="font-bold text-sm text-on-surface block">Institute</span>
                      <span className="text-xs text-on-surface-variant mt-1 block">For new Institute registrations.</span>
                    </div>
                    <span className="text-lg group-hover:translate-x-1 transition font-bold text-primary">&rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Role selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-primary font-serif">Select Your Role</h2>
                  <p className="text-sm text-on-surface-variant">
                    Determine your authorization clearance inside the maintenance hierarchy.
                  </p>
                </div>

                <div className="space-y-3 max-w-md mx-auto pt-4">
                  {ROLES.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, roleId: role.id })}
                      className={`w-full text-left p-4 rounded-lg border transition flex items-center justify-between ${
                        formData.roleId === role.id ? 'border-[#00a2c0] bg-cyan-50/50 ring-1 ring-cyan-500' : 'border-outline-variant bg-white hover:border-outline'
                      }`}
                    >
                      <span className="text-sm font-semibold">{role.name}</span>
                      {formData.roleId === role.id && (
                        <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-outline-variant/30">
                  <button 
                    onClick={handlePrevStep}
                    className="text-sm font-semibold text-on-surface-variant hover:text-[#00a2c0] transition"
                  >
                    &larr; Back
                  </button>
                  <button 
                    onClick={handleNextStep}
                    className="bg-[#00a2c0] hover:bg-cyan-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition shadow-sm active:scale-95"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Security details */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-primary font-serif">Provide Security Credentials</h2>
                  <p className="text-sm text-on-surface-variant">
                    Setup authentication keys for registering details onto LabMaintain servers.
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-lg font-semibold max-w-md mx-auto">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto pt-4 text-sm font-semibold">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-on-surface-variant block">User Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="Akshay Singh"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-outline rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-on-surface-variant block">Email Address</label>
                    <input 
                      type="email"
                      required
                      placeholder="scientist@demo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-outline rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-on-surface-variant block">Password</label>
                    <input 
                      type="password"
                      required
                      placeholder="Create secure access key"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-outline rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-on-surface-variant block">Contact Phone</label>
                    <input 
                      type="tel"
                      required
                      placeholder="+91 768019-2834"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-outline rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {(formData.roleId!=='1')&&(
                       <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-on-surface-variant block">Institution's ID</label>
                      <input 
                        type="number"
                        required
                        placeholder="101"
                        value={formData.institutionId}
                        onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                        className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
                      />
                    </div>
                    
                  )}
                   
                    
                   
                  </div>
                  {/* departmment ID option dynamically shown for role department head or lab */}
                  {( formData.roleId==='2'|| formData.roleId==='3'||formData.roleId==='4')&&(
                       <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-on-surface-variant block">Department ID</label>
                      <input 
                        type="number"
                        required
                        placeholder="11"
                        value={formData.departmentId}
                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                        className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
                      />
                    </div>

                    )}

                  {/* labId option dynamically shown for Lab Technician (2) and Lab Manager (3) */}
                  {(formData.roleId === '2' || formData.roleId === '3') && (
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-on-surface-variant block">Lab ID</label>
                      <input 
                        type="number"
                        required
                        placeholder="e.g. 5"
                        value={formData.labId}
                        onChange={(e) => setFormData({ ...formData, labId: e.target.value })}
                        className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-outline-variant/30 mt-6">
                    <button 
                      type="button"
                      onClick={handlePrevStep}
                      className="text-sm font-semibold text-on-surface-variant hover:text-[#00a2c0] transition"
                    >
                      &larr; Back
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="bg-[#00a2c0] hover:bg-cyan-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition shadow active:scale-95 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

          <div className="text-center pt-4 border-t border-outline-variant/30">
            <p className="text-xs text-on-surface-variant font-semibold">
              Already have an account?{' '}
              <button 
                onClick={() => onNavigate('login')}
                className="text-[#00a2c0] hover:underline font-bold"
              >
                Sign in
              </button>
            </p>
          </div>

        </div>
      </main>

    </div>
  );
}
