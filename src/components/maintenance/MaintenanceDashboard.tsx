import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TicketStatus, TicketPriority } from '../../types';
import { 
  HardHat, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Plus 
} from 'lucide-react';

interface MaintenanceDashboardProps {
  onOpenTicketModal: () => void;
}

export const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({ onOpenTicketModal }) => {
  const { tickets, updateTicketStatus, currentUser } = useApp();
  const user = currentUser!;
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [repairCost, setRepairCost] = useState<number>(250);

  const filteredTickets = tickets.filter(t => {
    if (priorityFilter !== 'all' && t.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;
    if (statusFilter !== 'all' && t.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    return true;
  });

  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress' || t.status === 'Spare Parts Needed').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  const handleUpdateStatus = (ticketId: string, newStatus: TicketStatus) => {
    if (newStatus === 'Resolved' || newStatus === 'Closed') {
      updateTicketStatus(ticketId, newStatus, resolutionNotes || 'Component replaced & calibrated.', repairCost);
      setEditingTicketId(null);
      setResolutionNotes('');
    } else {
      updateTicketStatus(ticketId, newStatus);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Maintenance Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded border border-rose-500/30">
              @maintenance
            </span>
            <h2 className="text-lg font-bold text-white">Central Maintenance & Repair Work Orders</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Welcome, {user.name}. Track incoming maintenance tickets, assign engineering work orders, log repair costs, and clear downtime.
          </p>
        </div>

        <button
          onClick={onOpenTicketModal}
          className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Maintenance Ticket
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Open Work Orders</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1">{openCount} Tickets</h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">In Progress / Parts</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{inProgressCount} Active</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Resolved & Cleared</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{resolvedCount} Tickets</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Ticket Queue */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <HardHat className="w-4 h-4 text-rose-400" />
            Equipment Maintenance Work Order Queue
          </h3>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span>Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="spare parts needed">Spare Parts Needed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {filteredTickets.map(tkt => (
            <div key={tkt.id} className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl space-y-3 text-xs">
              
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-400 text-sm">{tkt.ticketNumber}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      tkt.priority === 'Critical' ? 'bg-rose-900/80 text-rose-200 border border-rose-500' :
                      tkt.priority === 'High' ? 'bg-amber-900/80 text-amber-200 border border-amber-500' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {tkt.priority} Priority
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{tkt.equipmentName}</h4>
                  <p className="text-slate-400">Lab: {tkt.labName} ({tkt.departmentName})</p>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded border inline-block ${
                    tkt.status === 'Open' ? 'bg-rose-900/50 text-rose-300 border-rose-700/50' :
                    tkt.status === 'In Progress' ? 'bg-amber-900/50 text-amber-300 border-amber-700/50' :
                    'bg-emerald-900/50 text-emerald-300 border-emerald-700/50'
                  }`}>
                    {tkt.status}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                    Raised by: {tkt.raisedByUserName} ({tkt.raisedByUserRole})
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 text-slate-200 leading-relaxed">
                <strong className="text-slate-400 text-[10px] block uppercase">Issue Summary:</strong>
                {tkt.description}
              </div>

              {/* Resolution Controls */}
              {editingTicketId === tkt.id ? (
                <div className="p-3 bg-slate-800 border border-emerald-500/50 rounded-lg space-y-3">
                  <label className="text-[11px] font-bold text-emerald-300 block">
                    Resolution Notes & Cost Logging:
                  </label>
                  
                  <textarea
                    rows={2}
                    placeholder="e.g., Replaced blown power supply capacitor and recalibrated signal generator..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                  />

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-400">Repair Cost ($):</span>
                      <input
                        type="number"
                        value={repairCost}
                        onChange={(e) => setRepairCost(Number(e.target.value))}
                        className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 flex-1">
                      <button
                        onClick={() => setEditingTicketId(null)}
                        className="text-slate-400 text-xs px-2 py-1"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(tkt.id, 'Resolved')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1 rounded"
                      >
                        Confirm Resolution & Restore Equipment
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400 text-[11px]">
                    Assigned Technician: <strong className="text-white">{tkt.assignedTechnician || 'Dave Lawson'}</strong>
                  </span>

                  {tkt.status !== 'Resolved' && tkt.status !== 'Closed' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(tkt.id, 'In Progress')}
                        className="bg-amber-600 text-white text-xs px-2.5 py-1 rounded font-medium"
                      >
                        Start Repair
                      </button>
                      <button
                        onClick={() => setEditingTicketId(tkt.id)}
                        className="bg-emerald-600 text-white text-xs px-2.5 py-1 rounded font-bold"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
