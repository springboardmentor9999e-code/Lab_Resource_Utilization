import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  Wrench, 
  UserCheck, 
  HardHat, 
  Bell, 
  Sparkles, 
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X
} from 'lucide-react';

interface NavbarProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onOpenAiModal: () => void;
  onOpenBookingModal?: () => void;
  onOpenTicketModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onSearchChange, 
  searchQuery, 
  onOpenAiModal,
  onOpenBookingModal,
  onOpenTicketModal
}) => {
  const { 
    currentRole, 
    switchUserRole, 
    currentUser, 
    notifications, 
    markNotificationRead, 
    clearAllNotifications 
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleOptions: { role: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    { 
      role: 'admin', 
      label: 'Admin / Org', 
      icon: <ShieldCheck className="w-4 h-4" />, 
      color: 'bg-purple-600 text-white' 
    },
    { 
      role: 'hod', 
      label: 'Dept Head (HOD)', 
      icon: <Building2 className="w-4 h-4" />, 
      color: 'bg-blue-600 text-white' 
    },
    { 
      role: 'staff', 
      label: 'Staff / Faculty', 
      icon: <GraduationCap className="w-4 h-4" />, 
      color: 'bg-emerald-600 text-white' 
    },
    { 
      role: 'lab_technician', 
      label: 'Lab Technician', 
      icon: <Wrench className="w-4 h-4" />, 
      color: 'bg-amber-600 text-white' 
    },
    { 
      role: 'student', 
      label: 'Student / Scholar', 
      icon: <UserCheck className="w-4 h-4" />, 
      color: 'bg-indigo-600 text-white' 
    },
    { 
      role: 'maintenance', 
      label: 'Maintenance Team', 
      icon: <HardHat className="w-4 h-4" />, 
      color: 'bg-rose-600 text-white' 
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                LabResource <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">v2.5</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                University Lab & Equipment Utilization Platform
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search equipment, labs, model numbers, or departments..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2">
            
            {/* Quick Action Button based on role */}
            {(currentRole === 'student' || currentRole === 'staff') && onOpenBookingModal && (
              <button
                onClick={onOpenBookingModal}
                className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                + Request Equipment
              </button>
            )}

            {(currentRole === 'lab_technician' || currentRole === 'maintenance') && onOpenTicketModal && (
              <button
                onClick={onOpenTicketModal}
                className="hidden sm:flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                + Raise Ticket
              </button>
            )}

            {/* AI Advisor Modal Trigger */}
            <button
              onClick={onOpenAiModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all shadow-sm shadow-purple-900/30"
              title="Ask AI Advisor for scheduling optimization & diagnostic support"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>AI Advisor</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Drawer Overlay */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden text-slate-100">
                  <div className="p-3 bg-slate-900/90 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold text-sm">Notifications</span>
                      <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                        {unreadCount} new
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-slate-400 hover:text-slate-200"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No notifications at this time.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 text-xs cursor-pointer transition-colors ${
                            n.read ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-800 text-slate-200 border-l-2 border-indigo-500'
                          } hover:bg-slate-700/60`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                              {n.type === 'booking' && <Clock className="w-3.5 h-3.5 text-blue-400" />}
                              {n.type === 'maintenance' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                              {n.type === 'calibration' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current User Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-indigo-500/50"
              />
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-indigo-400 truncate max-w-[120px]">
                  {currentUser.departmentName}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Role Switcher Toolbar */}
        <div className="py-2 border-t border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <span>Switch Role:</span>
            </span>
            {roleOptions.map(option => {
              const isActive = currentRole === option.role;
              return (
                <button
                  key={option.role}
                  onClick={() => switchUserRole(option.role)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    isActive
                      ? `${option.color} ring-2 ring-white/20 shadow-sm scale-105`
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </header>
  );
};
