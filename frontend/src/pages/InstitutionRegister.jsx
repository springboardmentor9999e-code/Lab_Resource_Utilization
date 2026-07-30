import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdBusiness, MdEmail, MdLock, MdPerson, MdPhone, MdWeb, MdLocationOn,
  MdVisibility, MdVisibilityOff, MdCheckCircle
} from 'react-icons/md';
import { authService } from '../services/services';

export default function InstitutionRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', code: '', type: 'University', email: '', phone: '',
    address: '', website: '', logoUrl: '',
    adminFirstName: '', adminLastName: '', adminEmail: '', adminPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.adminFirstName || !form.adminLastName || !form.adminEmail || !form.adminPassword) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.adminPassword.length < 8) {
      setError('Admin password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await authService.registerInstitution(form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Institution registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-lg animate-scale-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MdCheckCircle className="text-4xl" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Registration Submitted!</h2>
          <p className="text-sm text-slate-600 mb-6">
            Your institution registration for <strong className="text-slate-900">{form.name}</strong> has been submitted.
            It is currently <span className="text-amber-600 font-bold">Pending Approval</span> by the System Administrator.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 py-10 px-4 items-center justify-center">
      <div className="max-w-3xl w-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0f1535] text-white p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <MdBusiness className="text-3xl text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Register New Institution</h1>
            <p className="text-slate-300 text-sm mt-1">Submit your institution application for platform onboarding</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Institution Info */}
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
              Institution Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Institution Name *</label>
                <div className="relative">
                  <MdBusiness className="absolute left-3.5 top-3 text-slate-400 text-lg" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Stanford University"
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Institution Code (Unique) *</label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="STANFORD-LABS"
                  className="form-input uppercase"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Institution Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="University">University</option>
                  <option value="Research Institute">Research Institute</option>
                  <option value="Medical Center">Medical Center</option>
                  <option value="Corporate R&D">Corporate R&D</option>
                  <option value="Government Agency">Government Agency</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <div className="relative">
                  <MdEmail className="absolute left-3.5 top-3 text-slate-400 text-lg" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="contact@stanford.edu"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="relative">
                  <MdPhone className="absolute left-3.5 top-3 text-slate-400 text-lg" />
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 650-723-2300"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Website URL</label>
                <div className="relative">
                  <MdWeb className="absolute left-3.5 top-3 text-slate-400 text-lg" />
                  <input
                    type="url"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://www.stanford.edu"
                    className="form-input pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="form-group">
                <label className="form-label">Address Line</label>
                <div className="relative">
                  <MdLocationOn className="absolute left-3.5 top-3 text-slate-400 text-lg" />
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Campus Road / Area"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">City / Town</label>
                <input
                  type="text"
                  name="city"
                  value={form.city || ''}
                  onChange={handleChange}
                  placeholder="Visakhapatnam"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">District</label>
                <input
                  type="text"
                  name="district"
                  value={form.district || ''}
                  onChange={handleChange}
                  placeholder="Visakhapatnam"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={form.state || 'Andhra Pradesh'}
                  onChange={handleChange}
                  placeholder="Andhra Pradesh"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Primary Admin Info */}
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
              Primary Administrator Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Admin First Name *</label>
                <div className="relative">
                  <MdPerson className="absolute left-3.5 top-3 text-slate-400 text-lg" />
                  <input
                    type="text"
                    name="adminFirstName"
                    value={form.adminFirstName}
                    onChange={handleChange}
                    placeholder="Alice"
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Admin Last Name *</label>
                <div className="relative">
                  <MdPerson className="absolute left-3.5 top-3 text-slate-400 text-lg" />
                  <input
                    type="text"
                    name="adminLastName"
                    value={form.adminLastName}
                    onChange={handleChange}
                    placeholder="Smith"
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Admin Email *</label>
                <div className="relative">
                  <MdEmail className="absolute left-3.5 top-3 text-slate-400 text-lg" />
                  <input
                    type="email"
                    name="adminEmail"
                    value={form.adminEmail}
                    onChange={handleChange}
                    placeholder="alice.admin@stanford.edu"
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Admin Password *</label>
                <div className="relative">
                  <MdLock className="absolute left-3.5 top-3 text-slate-400 text-lg" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="adminPassword"
                    value={form.adminPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="form-input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Link to="/register" className="text-slate-600 hover:text-purple-600 text-sm font-semibold">
              ← Register as User
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8 py-3 text-base font-bold shadow-lg"
            >
              {loading ? 'Submitting Application...' : 'Submit Institution Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
