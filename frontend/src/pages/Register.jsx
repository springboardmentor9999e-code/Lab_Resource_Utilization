import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdScience, MdEmail, MdLock, MdPerson, MdVisibility, MdVisibilityOff,
  MdBusiness, MdApartment, MdPhone, MdSearch, MdCheckCircle, MdImage, MdError
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { institutionService } from '../services/services';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
];

const DEFAULT_AP_INSTITUTIONS = [
  { id: '2b7c6447-ddc1-4e39-8328-652aa9866cff', name: 'Andhra University', code: 'AU-VSP', type: 'University' },
  { id: 'c3a84624-d151-4ab0-a5d6-e4e0b32576c4', name: 'Jawaharlal Nehru Technological University Anantapur', code: 'JNTUA-ATP', type: 'University' },
  { id: '038fba28-07f0-444a-995a-ef837657fc92', name: 'Jawaharlal Nehru Technological University Gurajada', code: 'JNTUGV-VZM', type: 'University' },
  { id: '1a123f88-5593-4d4b-8116-0647204ac9dd', name: 'Sri Venkateswara University', code: 'SVU-TPT', type: 'University' },
  { id: '2d3689c1-2710-478b-8924-96af38d53a18', name: 'Acharya Nagarjuna University', code: 'ANU-GNT', type: 'University' },
  { id: 'a42e9b48-e05a-493a-9d6d-94fc6d0d2e28', name: 'G. Pullaiah College of Engineering and Technology', code: 'GPCET-KNL', type: 'Engineering College' },
  { id: 'a5422035-7a1f-4f4c-959e-57d65a919289', name: 'Rajeev Gandhi Memorial College of Engineering & Tech', code: 'RGMCET-NDL', type: 'Engineering College' },
  { id: '9dbac57f-93d3-4906-ac07-1dd7b80d046b', name: 'G. Pulla Reddy Engineering College', code: 'GPREC-KNL', type: 'Engineering College' },
  { id: 'd0696256-dbb4-4341-beb2-46257e54f99c', name: 'GMR Institute of Technology', code: 'GMRIT-RJM', type: 'Engineering College' },
  { id: '288d6924-7ad0-4bd5-89ac-dc9ca19e487c', name: "Vignan's Foundation for Science, Tech & Research", code: 'VFSTR-GNT', type: 'University' },
  { id: 'e161a892-6dc1-43fa-9607-b3d513762308', name: 'K L University', code: 'KLU-GNT', type: 'University' },
  { id: '52522004-d8a7-43d9-8709-5f5974237615', name: 'SRM University AP', code: 'SRMAP-AMR', type: 'University' },
  { id: 'a8ff48d7-35fd-4dc7-8b15-e9b43e275a4e', name: 'Aditya Engineering College', code: 'AEC-SRP', type: 'Engineering College' },
  { id: 'beb15129-eab2-4d3b-8d82-cd1b83966426', name: 'Gayatri Vidya Parishad College of Engineering', code: 'GVPCE-VSP', type: 'Engineering College' },
  { id: 'd78b2c73-919a-4bdd-994e-bea39654b6c5', name: 'Raghu Engineering College', code: 'REC-VSP', type: 'Engineering College' }
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    institutionId: '', departmentId: '',
    profilePhotoUrl: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [institutions, setInstitutions] = useState(DEFAULT_AP_INSTITUTIONS);
  const [departments, setDepartments] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);

  useEffect(() => {
    const fetchInsts = async () => {
      try {
        const res = await institutionService.getApproved();
        let list = res.data?.data || [];
        if (!Array.isArray(list) || list.length === 0) {
          const allRes = await institutionService.getAll();
          list = allRes.data?.data || [];
        }
        if (Array.isArray(list) && list.length > 0) {
          setInstitutions(list);
        }
      } catch {
        // Keeps DEFAULT_AP_INSTITUTIONS
      }
    };
    fetchInsts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');

    if (name === 'institutionId') {
      setForm(prev => ({ ...prev, institutionId: value, departmentId: '' }));
      setDepartments([]);
      if (value) {
        setLoadingDepts(true);
        institutionService.getDepartments(value)
          .then(r => setDepartments(r.data?.data || []))
          .catch(() => setDepartments([]))
          .finally(() => setLoadingDepts(false));
      }
    }
  };

  const handleSelectInstitution = (inst) => {
    setForm(prev => ({ ...prev, institutionId: inst.id, departmentId: '' }));
    setError('');

    setLoadingDepts(true);
    institutionService.getDepartments(inst.id)
      .then(r => setDepartments(r.data?.data || []))
      .catch(() => setDepartments([]))
      .finally(() => setLoadingDepts(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Please fill in all required personal details');
      return;
    }
    if (!form.institutionId) {
      setError('Institution selection is required to register');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || null,
        password: form.password,
        institutionId: form.institutionId,
        departmentId: form.departmentId || null,
        // Role is implicitly set to RESEARCHER by backend
      });
      navigate('/dashboard');
    } catch (err) {
      let msg = 'Registration failed. Please check your details.';
      if (err.response?.data) {
        const d = err.response.data;
        if (d.validationErrors && Object.keys(d.validationErrors).length > 0) {
          msg = Object.entries(d.validationErrors).map(([k, v]) => `${k}: ${v}`).join(' | ');
        } else if (d.message) {
          msg = d.message;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors py-8 px-4 sm:px-6">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 select-none">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30">
            <MdScience className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Researcher Registration</h1>
          <p className="text-slate-500 text-sm font-semibold max-w-md mx-auto">
            Join the Lab Resource Platform to browse laboratory equipment, schedule bookings, and collaborate.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl p-6 sm:p-10 transition-all">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-shake">
              <MdError className="text-rose-600 text-lg flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name *</label>
                <div className="relative">
                  <MdPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh"
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Last Name *</label>
                <div className="relative">
                  <MdPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Reddy"
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Official Email Address *</label>
                <div className="relative">
                  <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="researcher@au.edu.in"
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Phone Number (Optional)</label>
                <div className="relative">
                  <MdPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91-9876543210"
                    className="form-input pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Mandatory Approved Institution Dropdown */}
            <div>
              <label className="form-label" style={{ color: '#1e293b' }}>Select Approved Institution *</label>
              <div className="relative">
                <MdBusiness className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 text-lg pointer-events-none z-10" />
                <select
                  name="institutionId"
                  value={form.institutionId}
                  onChange={(e) => {
                    const instId = e.target.value;
                    const selected = institutions.find(i => i.id === instId);
                    if (selected) {
                      handleSelectInstitution(selected);
                    } else {
                      setForm(prev => ({ ...prev, institutionId: '', departmentId: '' }));
                      setDepartments([]);
                    }
                  }}
                  disabled={loadingInstitutions}
                  className="form-input pl-10 cursor-pointer font-bold"
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                  required
                >
                  <option value="" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                    {loadingInstitutions ? 'Loading approved institutions...' : '— Select an Approved Institution —'}
                  </option>
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                      {inst.name} {inst.code ? `[${inst.code}]` : ''} {inst.type ? `(${inst.type})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Department Selector */}
            <div>
              <label className="form-label" style={{ color: '#1e293b' }}>Select Department (Optional)</label>
              <div className="relative">
                <MdApartment className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none z-10" />
                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  disabled={!form.institutionId || loadingDepts}
                  className="form-input pl-10 cursor-pointer font-bold disabled:opacity-50"
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                >
                  <option value="" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                    {loadingDepts ? 'Loading departments...' : form.institutionId ? '— None / General Researcher —' : '— Select institution first —'}
                  </option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                You can complete registration without selecting a department. Department mapping can be updated later by your Institution Admin.
              </p>
            </div>

            {/* Optional Avatar Picker */}
            <div>
              <label className="form-label flex items-center gap-1.5">
                <MdImage className="text-purple-600" /> Optional Profile Avatar
              </label>
              <div className="flex items-center gap-3">
                {AVATAR_OPTIONS.map((url, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setForm(prev => ({ ...prev, profilePhotoUrl: url }))}
                    className={`w-11 h-11 rounded-2xl overflow-hidden border-2 transition-all ${
                      form.profilePhotoUrl === url ? 'border-purple-600 ring-4 ring-purple-500/20 scale-105' : 'border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <img src={url} alt="avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Password *</label>
                <div className="relative">
                  <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    className="form-input pl-10 pr-10"
                    required
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

              <div>
                <label className="form-label">Confirm Password *</label>
                <div className="relative">
                  <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role Notice */}
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 font-medium flex items-center gap-2">
              <MdCheckCircle className="text-purple-600 text-lg flex-shrink-0" />
              <span>Newly registered user accounts are automatically assigned the <strong>RESEARCHER</strong> role upon creation.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3.5 text-sm font-extrabold rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Researcher Account...
                </span>
              ) : 'Complete User Registration'}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200/80 pt-6 text-center space-y-3">
            <p className="text-xs text-slate-600 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-bold underline">
                Sign In
              </Link>
            </p>

            <div className="p-3 bg-slate-100/70 border border-slate-200/80 rounded-2xl text-xs text-slate-600 flex items-center justify-between">
              <span>Need to onboard a new institution?</span>
              <Link to="/register-institution" className="text-purple-700 font-bold hover:underline">
                Institution Onboarding →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
