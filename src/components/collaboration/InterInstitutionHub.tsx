import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, BookingStatus } from '../../types';
import { initialInstitutions, initialEquipment } from '../../data/initialData';
import { 
  Building2, 
  Award, 
  History, 
  Check, 
  X, 
  AlertTriangle, 
  ArrowUpRight, 
  DollarSign, 
  Clock, 
  Activity, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export const InterInstitutionHub: React.FC = () => {
  const { 
    bookings, 
    equipment, 
    currentUser, 
    currentRole, 
    assignSlot, 
    rejectBooking 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'network' | 'ledger' | 'outbound' | 'inbound'>('network');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [customStart, setCustomStart] = useState<string>('09:00');
  const [customEnd, setCustomEnd] = useState<string>('11:00');
  const [rejectReason, setRejectReason] = useState<string>('');

  const isAuthorized = ['admin', 'hod', 'lab_technician'].includes(currentRole || '');

  React.useEffect(() => {
    if (!isAuthorized && (activeSubTab === 'ledger' || activeSubTab === 'inbound')) {
      setActiveSubTab('network');
    }
  }, [currentRole, activeSubTab, isAuthorized]);

  const user = currentUser!;
  
  // Dynamic filtering of bookings
  const outboundBookings = bookings.filter(
    b => b.userInstitutionId === user.institutionId && b.institutionId !== user.institutionId
  );
  
  const inboundBookings = bookings.filter(
    b => b.userInstitutionId && b.userInstitutionId !== user.institutionId && b.institutionId === user.institutionId
  );

  const pendingInbound = inboundBookings.filter(b => b.status === 'Pending Approval');
  const activeInbound = inboundBookings.filter(b => b.status !== 'Pending Approval');

  // Helper: compute hours for a booking
  const getBookingHours = (bk: Booking): number => {
    const start = bk.allocatedStartTime || bk.requestedStartTime;
    const end = bk.allocatedEndTime || bk.requestedEndTime;
    if (!start || !end) return 2.0;
    try {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const diffMin = (eh * 60 + em) - (sh * 60 + sm);
      return Math.max(0.5, Number((diffMin / 60).toFixed(1)));
    } catch {
      return 2.0;
    }
  };

  // Helper: find hourly rate of the equipment
  const getHourlyRate = (equipmentId: string): number => {
    const eq = equipment.find(e => e.id === equipmentId);
    return eq ? eq.hourlyRate : 50; // default rate
  };

  // Dynamic Ledger Calculations
  let totalLentHours = 0;
  let totalLentCredits = 0;
  let totalBorrowedHours = 0;
  let totalBorrowedCredits = 0;

  bookings.forEach(b => {
    const isApproved = b.status === 'Confirmed' || b.status === 'Assigned Slot' || b.status === 'In Use' || b.status === 'Completed';
    if (isApproved) {
      const hours = getBookingHours(b);
      const rate = getHourlyRate(b.equipmentId);
      const cost = hours * rate;

      if (b.userInstitutionId !== user.institutionId && b.institutionId === user.institutionId) {
        // Inbound approved: We lent equipment to partner
        totalLentHours += hours;
        totalLentCredits += cost;
      } else if (b.userInstitutionId === user.institutionId && b.institutionId !== user.institutionId) {
        // Outbound approved: We borrowed equipment from partner
        totalBorrowedHours += hours;
        totalBorrowedCredits += cost;
      }
    }
  });

  const netCredits = totalLentCredits - totalBorrowedCredits;
  const isAuthorizedToApprove = ['admin', 'hod', 'lab_technician'].includes(currentRole || '');

  const handleAllocateSlot = (bookingId: string) => {
    assignSlot(bookingId, customStart, customEnd, user.name);
    setSelectedBookingId(null);
  };

  const handleReject = (bookingId: string) => {
    if (!rejectReason.trim()) return;
    rejectBooking(bookingId, rejectReason);
    setSelectedBookingId(null);
    setRejectReason('');
  };

  // Mock Partner data
  const partners = initialInstitutions.map((inst, index) => {
    const isLocal = inst.id === user.institutionId;
    const colors = [
      'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'bg-rose-500/20 text-rose-400 border-rose-500/30',
      'bg-purple-500/20 text-purple-400 border-purple-500/30',
    ];
    return {
      id: inst.id,
      name: inst.name,
      role: isLocal ? 'Local Host Node' : (index % 2 === 0 ? 'Strategic Partner' : 'Educational Affiliate'),
      logo: colors[index % colors.length],
      status: 'Connected',
      sharedAssets: initialEquipment.filter(e => e.institutionId === inst.id).length,
      borrowedHours: isLocal ? totalBorrowedHours : (index * 2.5 + 4.0),
      lentHours: isLocal ? totalLentHours : (index * 1.5),
      agreement: isLocal ? 'Core Platform Coordinator' : (index % 2 === 0 ? 'Active - Reciprocal Sharing (Full Access)' : 'Active - Calibration Swap Agreement'),
      contact: `Research Office (${inst.shortName.toLowerCase()}.office@chennai-edu.in)`
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Premium Header */}
      <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-500/30 uppercase">
              Inter-Institution Hub
            </span>
            <h2 className="text-lg font-bold text-white">Cross-University Sharing Network</h2>
          </div>
          <p className="text-xs text-slate-400">
            Pool equipment catalogs, coordinate remote schedules, and track shared research budgets via the Co-Funding Credit Ledger.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-xs text-slate-300 shrink-0">
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Sharing Ledger</div>
            <div className={`font-mono font-bold text-sm mt-0.5 ${netCredits >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netCredits >= 0 ? '+' : ''}${netCredits.toLocaleString()} Credits
            </div>
          </div>
          <div className="w-px h-8 bg-slate-700/80"></div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">External Bookings</div>
            <div className="font-mono font-bold text-sm mt-0.5 text-indigo-400 text-center">
              {outboundBookings.length + inboundBookings.length} Active
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveSubTab('network')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors ${
            activeSubTab === 'network'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <span>Sharing Network ({partners.length})</span>
          </div>
        </button>

        {isAuthorized && (
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`px-4 py-2.5 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'ledger'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span>Co-Funding Ledger</span>
            </div>
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('outbound')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'outbound'
              ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4" />
            <span>Outbound Requests ({outboundBookings.length})</span>
          </div>
        </button>

        {isAuthorized && (
          <button
            onClick={() => setActiveSubTab('inbound')}
            className={`px-4 py-2.5 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'inbound'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Inbound Requests ({inboundBookings.length})</span>
              {pendingInbound.length > 0 && (
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></span>
              )}
            </div>
          </button>
        )}
      </div>

      {/* Subtab Content */}
      {activeSubTab === 'network' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {partners.map(p => (
            <div key={p.id} className="bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${p.logo} flex items-center justify-center border font-bold text-sm shrink-0`}>
                    {p.name.charAt(0)}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    p.status === 'Online' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' :
                    'bg-sky-950/60 text-sky-400 border border-sky-500/30'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white leading-normal">{p.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{p.role}</p>
                </div>

                <div className="space-y-1.5 text-[11px] pt-1.5 border-t border-slate-700/40">
                  <div className="flex justify-between text-slate-400">
                    <span>Agreement:</span>
                    <span className="text-slate-200 text-right font-medium">{p.agreement}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shared Assets:</span>
                    <span className="text-slate-200 font-semibold">{p.sharedAssets} Instruments</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Activity:</span>
                    <span className="text-slate-200 font-mono">
                      {p.lentHours + p.borrowedHours} hours exchanged
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/40 text-[10px] text-slate-400 leading-relaxed font-mono">
                <strong>Contact:</strong> {p.contact}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'ledger' && (
        <div className="space-y-6">
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-4.5 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>Earned Shared Credits</span>
              </div>
              <div className="text-2xl font-mono font-black text-white">${totalLentCredits.toLocaleString()}</div>
              <p className="text-[11px] text-slate-400">
                Credits accumulated by lending local equipment to external partner institutions ({totalLentHours} hours).
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-4.5 space-y-2">
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <History className="w-4 h-4" />
                <span>Borrowed Usage Fees</span>
              </div>
              <div className="text-2xl font-mono font-black text-white">${totalBorrowedCredits.toLocaleString()}</div>
              <p className="text-[11px] text-slate-400">
                Usage fees charged for local researchers borrowing resources from external partners ({totalBorrowedHours} hours).
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-4.5 space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Activity className="w-4 h-4" />
                <span>Net Collaboration Balance</span>
              </div>
              <div className="text-2xl font-mono font-black text-white">
                {netCredits >= 0 ? '+' : ''}${netCredits.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400">
                Current co-funding ledger balance. Net positive represents surplus lent value.
              </p>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                Co-Funding Exchange Ledger
              </h3>
            </div>
            
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-700 text-slate-400 font-semibold">
                    <th className="p-3">Reference / Date</th>
                    <th className="p-3">Lending Host</th>
                    <th className="p-3">Borrower / Project</th>
                    <th className="p-3">Resource Requested</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3 text-right">Credits Transferred</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 text-slate-200">
                  {bookings.filter(b => b.institutionId !== b.userInstitutionId && (b.status === 'Confirmed' || b.status === 'Assigned Slot' || b.status === 'In Use' || b.status === 'Completed')).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-mono">
                        No transactions recorded on the exchange ledger. Confirm external bookings to trigger ledger transfers.
                      </td>
                    </tr>
                  ) : (
                    bookings
                      .filter(b => b.institutionId !== b.userInstitutionId && (b.status === 'Confirmed' || b.status === 'Assigned Slot' || b.status === 'In Use' || b.status === 'Completed'))
                      .map(b => {
                        const isLent = b.institutionId === user.institutionId;
                        const hours = getBookingHours(b);
                        const rate = getHourlyRate(b.equipmentId);
                        const cost = hours * rate;

                        return (
                          <tr key={b.id} className="hover:bg-slate-700/30">
                            <td className="p-3 font-mono">
                              <div>{b.id.toUpperCase()}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{b.bookingDate}</div>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-white">{b.institutionName}</span>
                            </td>
                            <td className="p-3">
                              <div>{b.userName}</div>
                              <div className="text-[10px] text-indigo-300 font-semibold">{b.userInstitutionName}</div>
                            </td>
                            <td className="p-3 font-medium text-white">{b.equipmentName}</td>
                            <td className="p-3 font-mono">{hours} hrs (@${rate}/hr)</td>
                            <td className={`p-3 text-right font-mono font-bold ${isLent ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isLent ? '+' : '-'}${cost.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'outbound' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight className="w-4.5 h-4.5 text-indigo-400" />
              Outbound Requests to Partner Institutions
            </h3>
            <p className="text-xs text-slate-400">Track status of equipment requests you have submitted to other campuses.</p>
          </div>

          {outboundBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No outbound inter-institution booking requests submitted.
            </div>
          ) : (
            <div className="space-y-3">
              {outboundBookings.map(bk => (
                <div key={bk.id} className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-bold uppercase mr-2">
                        {bk.institutionName.split(' ')[0]}
                      </span>
                      <strong className="text-white text-xs">{bk.equipmentName}</strong>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      bk.status === 'Pending Approval' ? 'bg-amber-950/60 text-amber-400 border-amber-500/30 animate-pulse' :
                      bk.status === 'Rejected' ? 'bg-rose-950/60 text-rose-400 border-rose-500/30' :
                      'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {bk.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-500">Date & Slot:</span>
                      <span className="text-slate-200">{bk.bookingDate} ({bk.requestedStartTime} - {bk.requestedEndTime})</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-500">Requester:</span>
                      <span className="text-slate-200">{bk.userName} ({bk.userRole})</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-500">Grant Ref:</span>
                      <span className="text-amber-400 font-semibold font-mono">{bk.grantReference || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-500">Estimated Cost:</span>
                      <span className="text-slate-200 font-mono font-bold">
                        ${(getBookingHours(bk) * getHourlyRate(bk.equipmentId)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {bk.rejectionReason && (
                    <div className="p-2.5 bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-lg text-[11px]">
                      <strong>Rejection Reason:</strong> {bk.rejectionReason}
                    </div>
                  )}

                  {bk.allocatedStartTime && (
                    <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 rounded-lg text-[11px] flex items-center justify-between">
                      <div>
                        <strong>Allocated Slot:</strong> {bk.bookingDate} @ {bk.allocatedStartTime} - {bk.allocatedEndTime}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        by Tech: {bk.allocatedByTechnicianName}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'inbound' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-indigo-400" />
              Inbound Collaboration Requests (Lending)
            </h3>
            <p className="text-xs text-slate-400">Incoming booking requests from partner campuses for your local lab assets.</p>
          </div>

          {/* Pending Approval Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">Pending Action ({pendingInbound.length})</h4>
            
            {pendingInbound.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-900/30 rounded-xl border border-slate-700/40">
                No pending inbound external requests.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingInbound.map(bk => (
                  <div key={bk.id} className="p-4 bg-slate-900 border border-amber-500/30 rounded-xl space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase mr-2">
                          {bk.userInstitutionName?.split(' ')[0]}
                        </span>
                        <strong className="text-white text-xs">{bk.equipmentName}</strong>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-amber-950/60 text-amber-400 border-amber-500/30 animate-pulse">
                        {bk.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-slate-400 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">Target Date & Slot:</span>
                        <span className="text-slate-200">{bk.bookingDate} ({bk.requestedStartTime} - {bk.requestedEndTime})</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">External Borrower:</span>
                        <span className="text-slate-200">{bk.userName} ({bk.userRole})</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">Grant Ref:</span>
                        <span className="text-amber-400 font-semibold font-mono">{bk.grantReference || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">Lending Rate:</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          ${(getBookingHours(bk) * getHourlyRate(bk.equipmentId)).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-800/30 rounded-lg text-[11px] text-slate-300 italic border border-slate-800">
                      <strong>Purpose:</strong> {bk.purpose}
                    </div>

                    {/* Authorized Action Controls */}
                    {isAuthorizedToApprove ? (
                      <div className="pt-2 border-t border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {selectedBookingId === bk.id ? (
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-300">Set Hours:</span>
                              <input
                                type="time"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-white text-[11px]"
                              />
                              <span className="text-slate-500">to</span>
                              <input
                                type="time"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-white text-[11px]"
                              />
                              <button
                                onClick={() => handleAllocateSlot(bk.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded text-[11px]"
                              >
                                Confirm Allocation
                              </button>
                              <button
                                onClick={() => setSelectedBookingId(null)}
                                className="text-slate-400 hover:text-white text-[11px]"
                              >
                                Cancel
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-2 border-t border-slate-800 pt-2">
                              <input
                                type="text"
                                placeholder="Provide reject reason..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-[11px] flex-1 placeholder-slate-500"
                              />
                              <button
                                onClick={() => handleReject(bk.id)}
                                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded text-[11px]"
                              >
                                Reject Booking
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2 w-full">
                            <button
                              onClick={() => {
                                setSelectedBookingId(bk.id);
                                setCustomStart(bk.requestedStartTime);
                                setCustomEnd(bk.requestedEndTime);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs"
                            >
                              Configure Slot & Approve
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-450 italic text-right flex items-center justify-end gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Approval requires HOD or Technician permissions.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active / Confirmed Inbound */}
          <div className="space-y-3 pt-3 border-t border-slate-700/50">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Processed / Active ({activeInbound.length})</h4>
            
            {activeInbound.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs italic bg-slate-900/10 rounded-xl border border-slate-800">
                No active external bookings processed yet.
              </div>
            ) : (
              <div className="space-y-3">
                {activeInbound.map(bk => (
                  <div key={bk.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-semibold uppercase mr-2">
                          {bk.userInstitutionName?.split(' ')[0]}
                        </span>
                        <strong className="text-white text-xs">{bk.equipmentName}</strong>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        bk.status === 'Rejected' ? 'bg-rose-950/40 text-rose-400 border-rose-500/20' :
                        'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {bk.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[11px] text-slate-400">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">Allocated Slot:</span>
                        <span className="text-slate-200">
                          {bk.bookingDate} @ {bk.allocatedStartTime || bk.requestedStartTime} - {bk.allocatedEndTime || bk.requestedEndTime}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">External Borrower:</span>
                        <span className="text-slate-200">{bk.userName} ({bk.userRole})</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">Allocated By:</span>
                        <span className="text-slate-200 font-semibold">{bk.allocatedByTechnicianName || 'Admin'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500 font-mono">Net Credits:</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          +${(getBookingHours(bk) * getHourlyRate(bk.equipmentId)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
