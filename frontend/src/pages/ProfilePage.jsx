import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { notificationService } from '../services/notificationService';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Building2, Briefcase, Shield,
  Loader2, CheckCircle, AlertTriangle, KeyRound, Save,
  Bell, MessageSquare, Smartphone,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';

const ProfilePage = () => {
  const { user, setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  // Profile form
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', gender: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // { type, text }

  // Password form
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  // Notification channels
  const [prefs, setPrefs] = useState(null); // { smsEnabled, pushEnabled, phoneOnFile }
  const [savingChannel, setSavingChannel] = useState(null); // which toggle is in flight
  const [prefsMsg, setPrefsMsg] = useState(null);

  useEffect(() => {
    loadProfile();
    loadPreferences();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Preferences are a side panel, not the point of the page: a failure here shows
  // an inline note rather than blocking the profile form behind an error screen.
  const loadPreferences = async () => {
    try {
      setPrefs(await notificationService.getPreferences());
    } catch {
      setPrefs(null);
    }
  };

  const toggleChannel = async (channel, next) => {
    setSavingChannel(channel);
    setPrefsMsg(null);
    const previous = prefs;
    setPrefs({ ...prefs, [channel]: next }); // optimistic — the switch should not lag the click
    try {
      setPrefs(await notificationService.updatePreferences({ [channel]: next }));
    } catch (err) {
      setPrefs(previous); // put the switch back where the user left it
      setPrefsMsg({ type: 'error', text: err.response?.data?.message || 'Could not save preference' });
    } finally {
      setSavingChannel(null);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const updated = await userService.updateProfile(form);
      setProfile(updated);
      // Keep the session's cached user in sync so the sidebar/header update
      if (setUser) {
        const merged = { ...user, ...updated };
        setUser(merged);
        const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(merged));
      }
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
      // The phone field lives in this form, so adding or clearing a number changes
      // whether the SMS toggle is usable at all.
      loadPreferences();
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New password and confirmation do not match' });
      return;
    }
    setSavingPwd(true);
    setPwdMsg(null);
    try {
      await userService.changePassword(pwd);
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwdMsg({ type: 'success', text: 'Password changed successfully' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Password change failed' });
    } finally {
      setSavingPwd(false);
    }
  };

  const roles = profile?.roles ? Array.from(profile.roles) : [];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6 animate-fadeIn">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        )}

        {/* Identity header */}
        <div className="glass-card dark:glass-card-dark rounded-2xl p-6 flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
            {(profile?.firstName?.[0] || profile?.username?.[0] || 'U').toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white truncate">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{profile?.username}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {roles.map((r) => (
                <span key={r} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
                  <Shield className="h-3 w-3" /> {r.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Edit profile */}
          <div className="glass-card dark:glass-card-dark rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-primary" /> Edit Profile
            </h3>

            {profileMsg && (
              <div className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                profileMsg.type === 'success'
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                {profileMsg.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" required value={form.firstName}
                  onChange={(v) => setForm({ ...form, firstName: v })} />
                <Field label="Last Name" required value={form.lastName}
                  onChange={(v) => setForm({ ...form, lastName: v })} />
              </div>
              <Field label="Email" type="email" icon={Mail} required value={form.email}
                onChange={(v) => setForm({ ...form, email: v })} />
              <Field label="Phone" icon={Phone} value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })} />
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40">
                  <option value="">Prefer not to say</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Read-only org context */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <ReadOnly label="Institution" icon={Building2} value={profile?.institution} />
                <ReadOnly label="Department" icon={Briefcase} value={profile?.department} />
              </div>

              <button type="submit" disabled={savingProfile}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-2.5 text-sm font-bold text-white hover:opacity-95 disabled:opacity-60">
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="glass-card dark:glass-card-dark rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <KeyRound className="h-4.5 w-4.5 text-primary" /> Change Password
            </h3>

            {pwdMsg && (
              <div className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                pwdMsg.type === 'success'
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                {pwdMsg.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                {pwdMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Field label="Current Password" type="password" required value={pwd.currentPassword}
                onChange={(v) => setPwd({ ...pwd, currentPassword: v })} />
              <Field label="New Password" type="password" required value={pwd.newPassword}
                onChange={(v) => setPwd({ ...pwd, newPassword: v })} />
              <Field label="Confirm New Password" type="password" required value={pwd.confirmPassword}
                onChange={(v) => setPwd({ ...pwd, confirmPassword: v })} />
              <button type="submit" disabled={savingPwd}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 dark:bg-slate-700 py-2.5 text-sm font-bold text-white hover:opacity-95 disabled:opacity-60">
                {savingPwd ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Notification channels */}
        {prefs && (
          <div className="glass-card dark:glass-card-dark rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-primary" /> Notification Channels
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              In-app and email alerts are always on. These extra channels are used only for
              time-critical alerts — waitlist offers, booking reminders, work-order assignments
              and overdue calibrations.
            </p>

            {prefsMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" /> {prefsMsg.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ChannelToggle
                icon={MessageSquare}
                label="SMS"
                description={prefs.phoneOnFile
                  ? 'Text messages to the phone number on your profile'
                  : 'Add a phone number above to enable SMS alerts'}
                checked={prefs.smsEnabled !== false}
                disabled={!prefs.phoneOnFile || savingChannel === 'smsEnabled'}
                busy={savingChannel === 'smsEnabled'}
                onChange={(v) => toggleChannel('smsEnabled', v)}
              />
              <ChannelToggle
                icon={Smartphone}
                label="Push"
                description="Browser and mobile push notifications on this and other signed-in devices"
                checked={prefs.pushEnabled !== false}
                disabled={savingChannel === 'pushEnabled'}
                busy={savingChannel === 'pushEnabled'}
                onChange={(v) => toggleChannel('pushEnabled', v)}
              />
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

// --- small presentational helpers ---

const Field = ({ label, value, onChange, type = 'text', required = false, icon: Icon }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
      {label}{required && <span className="text-red-500"> *</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 ${Icon ? 'pl-9 pr-3' : 'px-3'}`}
      />
    </div>
  </div>
);

const ChannelToggle = ({ icon: Icon, label, description, checked, disabled, busy, onChange }) => (
  <div className={`flex items-start gap-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-800/30 px-4 py-3 ${disabled && !busy ? 'opacity-60' : ''}`}>
    <Icon className="h-4.5 w-4.5 mt-0.5 shrink-0 text-primary" />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-slate-800 dark:text-white">{label}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${label} notifications`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed ${
        checked ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
      {busy && <Loader2 className="absolute inset-0 m-auto h-3.5 w-3.5 animate-spin text-white" />}
    </button>
  </div>
);

const ReadOnly = ({ label, value, icon: Icon }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</label>
    <div className="flex items-center gap-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-100/50 dark:bg-slate-800/30 px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400">
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="truncate">{value || '—'}</span>
    </div>
  </div>
);

export default ProfilePage;
