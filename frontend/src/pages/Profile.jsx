import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MdPerson, MdEmail, MdPhone, MdBusiness, MdDomain, MdVerified, MdSecurity, MdLock } from 'react-icons/md';

export default function Profile() {
  const { user } = useAuth();
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePwdSubmit = (e) => {
    e.preventDefault();
    if (pwdForm.newPwd !== pwdForm.confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    showToast('Password updated successfully!');
    setPwdForm({ current: '', newPwd: '', confirm: '' });
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium
          ${toast.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-300' : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white">Your Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account details and security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mx-auto border-2 border-white/10">
            <span className="text-white text-3xl font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg flex items-center justify-center gap-1.5">
              {user?.firstName} {user?.lastName}
              <MdVerified className="text-blue-400 text-lg" />
            </h3>
            <p className="text-slate-400 text-sm">{user?.email}</p>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2 justify-center">
            {user?.roles?.map(r => (
              <span key={r} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg text-xs font-semibold">
                {r.replace(/_/g, ' ')}
              </span>
            ))}
          </div>

          <div className="text-slate-500 text-xs pt-2">
            Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Details and Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MdPerson className="text-purple-400 text-xl" /> Account Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-slate-500 text-xs">Email Address</span>
                <div className="flex items-center gap-2 text-slate-300 text-sm bg-white/3 border border-white/5 rounded-xl px-3 py-2">
                  <MdEmail className="text-slate-400" /> {user?.email || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 text-xs">Phone Number</span>
                <div className="flex items-center gap-2 text-slate-300 text-sm bg-white/3 border border-white/5 rounded-xl px-3 py-2">
                  <MdPhone className="text-slate-400" /> {user?.phone || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 text-xs">Institution</span>
                <div className="flex items-center gap-2 text-slate-300 text-sm bg-white/3 border border-white/5 rounded-xl px-3 py-2">
                  <MdBusiness className="text-slate-400" /> {user?.institutionName || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 text-xs">Department</span>
                <div className="flex items-center gap-2 text-slate-300 text-sm bg-white/3 border border-white/5 rounded-xl px-3 py-2">
                  <MdDomain className="text-slate-400" /> {user?.departmentName || 'Not Assigned (NULL)'}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MdSecurity className="text-purple-400 text-xl" /> Change Password
            </h4>
            <form onSubmit={handlePwdSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Current Password</label>
                <div className="relative">
                  <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password" required value={pwdForm.current}
                    onChange={e => setPwdForm(p => ({ ...p, current: e.target.value }))}
                    className="w-full bg-[#0b0f2a] border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">New Password</label>
                <div className="relative">
                  <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password" required value={pwdForm.newPwd}
                    onChange={e => setPwdForm(p => ({ ...p, newPwd: e.target.value }))}
                    className="w-full bg-[#0b0f2a] border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
              <div>
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold py-2 rounded-xl transition-all">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
