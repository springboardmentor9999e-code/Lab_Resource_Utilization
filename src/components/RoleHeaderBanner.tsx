import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  Wrench, 
  UserCheck, 
  HardHat, 
  CheckCircle2 
} from 'lucide-react';

export const RoleHeaderBanner: React.FC = () => {
  const { currentRole, currentUser } = useApp();

  const roleDetails: Record<
    string, 
    { handle: string; title: string; desc: string; permissions: string[]; badgeColor: string; icon: React.ReactNode }
  > = {
    admin: {
      handle: '@admin / @org',
      title: 'University Dean & System Administrator View',
      desc: 'Full access to all university departments, cross-department resource sharing, global activity logs, procurement intelligence, and user role management.',
      permissions: ['All Dept Access', 'Activity Logs & Audit Trail', 'Global Utilization Heatmap', 'Procurement & Cost Analytics'],
      badgeColor: 'bg-purple-900/60 text-purple-200 border-purple-700/50',
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />
    },
    hod: {
      handle: '@dept / @hod',
      title: 'Head of Department (HOD) Console',
      desc: 'Manage department staff, technicians & students. Oversee required department labs, operational conditions, equipment availability, and approve sharing requests.',
      permissions: ['Department Faculty & Student Roster', 'Lab Operational Condition Check', 'Equipment Availability Matrix', 'Booking & Sharing Approval'],
      badgeColor: 'bg-blue-900/60 text-blue-200 border-blue-700/50',
      icon: <Building2 className="w-5 h-5 text-blue-400" />
    },
    staff: {
      handle: '@staff',
      title: 'Faculty / Professor Portal',
      desc: 'Access required laboratories for assigned subjects, request equipment slots for practical sessions, view lab technician timetable schedules, and report issues.',
      permissions: ['Subject Lab Allocations', 'Equipment Slot Requests', 'Technician Schedule Timetable', 'Equipment Condition Overview'],
      badgeColor: 'bg-emerald-900/60 text-emerald-200 border-emerald-700/50',
      icon: <GraduationCap className="w-5 h-5 text-emerald-400" />
    },
    lab_technician: {
      handle: '@lab_technician',
      title: 'Lab Technician & Manager Console',
      desc: 'Maintain equipment records, track calibration expiry dates, enforce lab safety checklists, allocate time slots for pending student/staff bookings, and manage equipment status.',
      permissions: ['Booking Slot Allocator & Timetable', 'Equipment Calibration Logs', 'Lab Safety & Inspection Audits', 'Equipment Status Toggle'],
      badgeColor: 'bg-amber-900/60 text-amber-200 border-amber-700/50',
      icon: <Wrench className="w-5 h-5 text-amber-400" />
    },
    student: {
      handle: '@student',
      title: 'Student & Researcher Workspace',
      desc: 'View assigned experiments and apparatus, request slots for lab equipment, check waitlist status, and track booking approvals from lab technicians.',
      permissions: ['Assigned Apparatus Operator View', 'Slot Request Submission', 'Booking Status & Waitlist', 'Lab Safety Guidelines'],
      badgeColor: 'bg-indigo-900/60 text-indigo-200 border-indigo-700/50',
      icon: <UserCheck className="w-5 h-5 text-indigo-400" />
    },
    maintenance: {
      handle: '@maintenance',
      title: 'Central Maintenance & Engineering Console',
      desc: 'Receive maintenance tickets raised by technicians, professors, or students. Manage repair work orders, track equipment downtime, and log repair costs.',
      permissions: ['Incoming Work Order Kanban', 'Ticket Severity & Priority Queue', 'Downtime & Repair Cost Tracker', 'Service Resolution Log'],
      badgeColor: 'bg-rose-900/60 text-rose-200 border-rose-700/50',
      icon: <HardHat className="w-5 h-5 text-rose-400" />
    }
  };

  const details = roleDetails[currentRole];

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 mb-6 text-slate-100 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 shrink-0">
            {details.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${details.badgeColor}`}>
                {details.handle}
              </span>
              <h1 className="text-lg font-bold text-white tracking-tight">
                {details.title}
              </h1>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {details.desc}
            </p>
          </div>
        </div>

        {/* User Info & Active Permissions */}
        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/60 shrink-0 flex flex-col justify-center min-w-[240px]">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Active Persona</span>
            <span className="text-indigo-400 font-normal">{currentUser.title}</span>
          </div>
          <div className="text-xs font-bold text-slate-100 mb-2">
            {currentUser.name} ({currentUser.departmentName})
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
            {details.permissions.map((perm, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{perm}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
