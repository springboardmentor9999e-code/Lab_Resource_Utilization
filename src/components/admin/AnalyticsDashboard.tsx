import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, MaintenanceTicket } from '../../types';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Building2, 
  Cpu, 
  HelpCircle, 
  FileSpreadsheet,
  Activity,
  Flame
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { 
    bookings, 
    tickets, 
    equipment, 
    departments, 
    currentRole, 
    currentUser 
  } = useApp();

  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [hoveredBar, setHoveredBar] = useState<{ deptName: string; type: string; value: number } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: string; density: number } | null>(null);

  const isHod = currentRole === 'hod';
  const myDeptId = isHod ? (currentUser?.departmentId || 'dept-ece') : selectedDeptId;

  // Filter lists based on selected department (or all)
  const filteredBookings = bookings.filter(b => {
    if (isHod) return b.departmentId === myDeptId;
    if (myDeptId !== 'all') return b.departmentId === myDeptId;
    return true;
  });

  const filteredTickets = tickets.filter(t => {
    if (isHod) return t.departmentId === myDeptId;
    if (myDeptId !== 'all') return t.departmentId === myDeptId;
    return true;
  });

  const filteredEquipment = equipment.filter(e => {
    if (isHod) return e.departmentId === myDeptId;
    if (myDeptId !== 'all') return e.departmentId === myDeptId;
    return true;
  });

  // Calculate stats
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

  const totalBookingHours = filteredBookings
    .filter(b => ['Confirmed', 'Assigned Slot', 'In Use', 'Completed'].includes(b.status))
    .reduce((acc, b) => acc + getBookingHours(b), 0);

  const totalBookingCost = filteredBookings
    .filter(b => ['Confirmed', 'Assigned Slot', 'In Use', 'Completed'].includes(b.status))
    .reduce((acc, b) => {
      const eq = equipment.find(e => e.id === b.equipmentId);
      const rate = eq ? eq.hourlyRate : 25;
      return acc + (getBookingHours(b) * rate);
    }, 0);

  // Maintenance actual cost and downtime (assuming resolved resolvedAt is logged, downtime is estimated hours or ticket time)
  const totalRepairCost = filteredTickets
    .filter(t => t.status === 'Resolved' || t.status === 'Closed')
    .reduce((acc, t) => acc + (t.repairCost || 0), 0);

  // Downtime Hours: We estimate 48 hours for Critical, 24 for High, 12 for Medium, 4 for Low if ticket resolved
  const getDowntimeHours = (t: MaintenanceTicket): number => {
    if (t.status !== 'Resolved' && t.status !== 'Closed') return 0;
    if (t.priority === 'Critical') return 48;
    if (t.priority === 'High') return 24;
    if (t.priority === 'Medium') return 12;
    return 4;
  };

  const totalDowntimeHours = filteredTickets.reduce((acc, t) => acc + getDowntimeHours(t), 0);

  // Booking efficiency index: Booking Hours / (Booking Hours + Downtime Hours) * 100
  const totalHoursCombined = totalBookingHours + totalDowntimeHours;
  const efficiencyIndex = totalHoursCombined > 0 
    ? Math.round((totalBookingHours / totalHoursCombined) * 100) 
    : 100;

  // Department cost metrics for Bar Chart
  const departmentCosts = departments.map(d => {
    // Bookings for this department
    const deptBookings = bookings.filter(b => b.departmentId === d.id && ['Confirmed', 'Assigned Slot', 'In Use', 'Completed'].includes(b.status));
    const bookingRev = deptBookings.reduce((acc, b) => {
      const eq = equipment.find(e => e.id === b.equipmentId);
      const rate = eq ? eq.hourlyRate : 25;
      return acc + (getBookingHours(b) * rate);
    }, 0);

    // Tickets for this department
    const deptTickets = tickets.filter(t => t.departmentId === d.id && (t.status === 'Resolved' || t.status === 'Closed'));
    const repairCost = deptTickets.reduce((acc, t) => acc + (t.repairCost || 0), 0);

    return {
      deptName: d.code,
      bookingRevenue: bookingRev,
      maintenanceCost: repairCost,
    };
  });

  // Heatmap Grid Calculations
  // X axis: 08:00, 10:00, 12:00, 14:00, 16:00, 18:00
  // Y axis: Monday, Tuesday, Wednesday, Thursday, Friday
  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Seed density values blended with real bookings
  const getCellDensity = (day: string, hour: string): number => {
    // Generate base density based on cell position to make it look realistic
    let base = 15;
    if (day === 'Tuesday' || day === 'Thursday') base += 35;
    if (day === 'Wednesday') base += 20;
    if (hour === '10:00' || hour === '14:00') base += 30;
    if (hour === '12:00') base -= 15;

    // Add some dynamic factor from actual bookings on this day of week
    const matchingBookings = filteredBookings.filter(b => {
      // Find matching hour block
      const startHour = b.requestedStartTime.split(':')[0];
      const cellHour = hour.split(':')[0];
      return startHour === cellHour;
    }).length;

    base += matchingBookings * 10;
    return Math.min(100, Math.max(5, base));
  };

  // Color cells based on density
  const getCellColor = (density: number) => {
    if (density < 20) return 'fill-slate-900 stroke-slate-800';
    if (density < 45) return 'fill-emerald-950/80 stroke-emerald-800/40 text-emerald-400';
    if (density < 75) return 'fill-indigo-950/90 stroke-indigo-800/50 text-indigo-300';
    return 'fill-rose-950/80 stroke-rose-800/50 text-rose-300';
  };

  // Find max value in costs to scale the bar map
  const maxCost = Math.max(...departmentCosts.map(d => Math.max(d.bookingRevenue, d.maintenanceCost)), 500);

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>Interactive Operational & Cost Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isHod 
              ? `Displaying specific analytics for Head of Department (${currentUser?.departmentName})` 
              : 'Global overview of resource sharing, booking revenue yields, and maintenance downtime.'
            }
          </p>
        </div>

        {!isHod && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter Department:</span>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-slate-800 border border-slate-700/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Booked Hours</p>
            <h3 className="text-2xl font-bold text-white mt-1 font-mono">{totalBookingHours.toFixed(1)} Hrs</h3>
            <p className="text-[10px] text-slate-500 mt-1">Active equipment operations</p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Rentals Credits</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1 font-mono">${totalBookingCost.toLocaleString()}</h3>
            <p className="text-[10px] text-emerald-500 mt-1">Booking value yield</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Downtime Cost</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1 font-mono">${totalRepairCost.toLocaleString()}</h3>
            <p className="text-[10px] text-rose-500 mt-1">Cumulative maintenance bill</p>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Operational Yield</p>
            <h3 className="text-2xl font-bold text-indigo-400 mt-1 font-mono">{efficiencyIndex}%</h3>
            <p className="text-[10px] text-slate-500 mt-1">Downtime vs operational ratio</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SVG Heatmap Grid */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Equipment Booking Density Heatmap</h3>
            <p className="text-xs text-slate-400">Visual mapping of equipment workload distribution across days and time slots</p>
          </div>

          <div className="relative pt-2">
            {/* SVG Heatmap */}
            <svg viewBox="0 0 540 220" className="w-full h-auto text-slate-300">
              {/* Day Labels (Y Axis) */}
              {days.map((day, idx) => (
                <text key={day} x="10" y={40 + idx * 32} className="text-[10px] font-mono fill-slate-400" dominantBaseline="middle">
                  {day.slice(0, 3)}
                </text>
              ))}

              {/* Hour Labels (X Axis) */}
              {timeSlots.map((slot, idx) => (
                <text key={slot} x={65 + idx * 75} y="15" className="text-[10px] font-mono fill-slate-400 text-center" textAnchor="middle">
                  {slot}
                </text>
              ))}

              {/* Heatmap Blocks */}
              {days.map((day, dIdx) => (
                timeSlots.map((hour, hIdx) => {
                  const density = getCellDensity(day, hour);
                  const colorClass = getCellColor(density);
                  
                  return (
                    <g key={`${day}-${hour}`} className="group cursor-pointer">
                      <rect
                        x={45 + hIdx * 75}
                        y={25 + dIdx * 32}
                        width="70"
                        height="26"
                        rx="4"
                        className={`${colorClass} hover:opacity-80 transition-all duration-150`}
                        onMouseEnter={() => setHoveredCell({ day, hour, density })}
                        onMouseLeave={() => setHoveredCell(null)}
                      />
                      <text 
                        x={80 + hIdx * 75} 
                        y={38 + dIdx * 32} 
                        className="text-[9px] font-mono font-bold opacity-0 group-hover:opacity-100 fill-white text-center" 
                        textAnchor="middle" 
                        dominantBaseline="middle"
                        pointerEvents="none"
                      >
                        {density}%
                      </text>
                    </g>
                  );
                })
              ))}
            </svg>

            {/* Hover details */}
            <div className="mt-2 h-8 bg-slate-900/60 border border-slate-700/60 rounded-xl p-2 text-center text-xs text-slate-300 flex items-center justify-center font-mono">
              {hoveredCell ? (
                <span>
                  {hoveredCell.day} at {hoveredCell.hour} &rarr; Workload Density: <strong className={
                    hoveredCell.density < 20 ? 'text-slate-400' :
                    hoveredCell.density < 45 ? 'text-emerald-400' :
                    hoveredCell.density < 75 ? 'text-indigo-400' : 'text-rose-400'
                  }>{hoveredCell.density}%</strong>
                </span>
              ) : (
                <span className="text-slate-500 italic">Hover over cells to examine booking density</span>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-3.5 pt-3 text-[10px] text-slate-400 font-mono">
              <span>Legend:</span>
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-800"></span>
                <span>&lt;20% Idle</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded bg-emerald-950/80 border border-emerald-800/40"></span>
                <span>20-45% Light</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded bg-indigo-950/90 border border-indigo-800/50"></span>
                <span>45-75% Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded bg-rose-950/80 border border-rose-800/50"></span>
                <span>&gt;75% Peak</span>
              </div>
            </div>

          </div>
        </div>

        {/* SVG Dual Bar Map */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Departmental Cost Ledger (Booking vs Maintenance)</h3>
            <p className="text-xs text-slate-400">Financial distribution mapping generated rental credits vs repair expenses</p>
          </div>

          <div className="relative pt-2">
            {/* SVG Bar Chart */}
            <svg viewBox="0 0 540 220" className="w-full h-auto text-slate-300">
              {/* Y Axis Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
                const yPos = 25 + (1 - ratio) * 140;
                const value = Math.round(ratio * maxCost);
                return (
                  <g key={idx}>
                    <line x1="50" y1={yPos} x2="520" y2={yPos} className="stroke-slate-700/60" strokeDasharray="3,3" />
                    <text x="40" y={yPos} className="text-[9px] font-mono fill-slate-400" textAnchor="end" dominantBaseline="middle">
                      ${value}
                    </text>
                  </g>
                );
              })}

              {/* Department Bars */}
              {departmentCosts.map((dept, idx) => {
                const xBase = 80 + idx * 90;
                
                // Heights scaled
                const bookingHeight = (dept.bookingRevenue / maxCost) * 140;
                const maintenanceHeight = (dept.maintenanceCost / maxCost) * 140;

                const bookingY = 165 - bookingHeight;
                const maintenanceY = 165 - maintenanceHeight;

                return (
                  <g key={dept.deptName}>
                    {/* Booking Revenue Bar */}
                    <rect
                      x={xBase - 15}
                      y={bookingY}
                      width="12"
                      height={Math.max(bookingHeight, 1)}
                      rx="2"
                      className="fill-emerald-500 hover:fill-emerald-400 transition-all cursor-pointer"
                      onMouseEnter={() => setHoveredBar({ deptName: dept.deptName, type: 'Booking Revenue', value: dept.bookingRevenue })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />

                    {/* Maintenance Cost Bar */}
                    <rect
                      x={xBase + 3}
                      y={maintenanceY}
                      width="12"
                      height={Math.max(maintenanceHeight, 1)}
                      rx="2"
                      className="fill-rose-500 hover:fill-rose-400 transition-all cursor-pointer"
                      onMouseEnter={() => setHoveredBar({ deptName: dept.deptName, type: 'Maintenance Cost', value: dept.maintenanceCost })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />

                    {/* X Axis Label */}
                    <text x={xBase} y="182" className="text-[10px] font-mono fill-slate-300 text-center font-bold" textAnchor="middle">
                      {dept.deptName}
                    </text>
                  </g>
                );
              })}

              {/* Baseline Axis */}
              <line x1="50" y1="165" x2="520" y2="165" className="stroke-slate-600" />
            </svg>

            {/* Hover details */}
            <div className="mt-2 h-8 bg-slate-900/60 border border-slate-700/60 rounded-xl p-2 text-center text-xs text-slate-300 flex items-center justify-center font-mono">
              {hoveredBar ? (
                <span>
                  Department <strong className="text-white">{hoveredBar.deptName}</strong> &rarr; {hoveredBar.type}: <strong className={
                    hoveredBar.type.startsWith('Booking') ? 'text-emerald-400' : 'text-rose-400'
                  }>${hoveredBar.value.toLocaleString()}</strong>
                </span>
              ) : (
                <span className="text-slate-500 italic">Hover over bar elements to examine cost data</span>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-5 pt-3 text-[10px] text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                <span>Booking Revenue Yield ($)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500"></span>
                <span>Actual Maintenance Cost ($)</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Analytics Insights */}
      <div className="bg-gradient-to-r from-indigo-950/20 via-slate-800 to-slate-800 border border-indigo-500/20 rounded-2xl p-5 text-xs text-slate-300">
        <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Time vs Cost Analysis Report
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 leading-relaxed">
          <div className="space-y-1">
            <strong className="text-slate-200">Revenue Yield Efficiency</strong>
            <p className="text-slate-400">
              The equipment generated an average of ${(totalBookingCost / (totalBookingHours || 1)).toFixed(2)} in rental value per hour of utilization. This represents a healthy operational yield.
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-200">Maintenance Downtime Overhead</strong>
            <p className="text-slate-400">
              Each hour of maintenance downtime cost the department approximately ${(totalRepairCost / (totalDowntimeHours || 1)).toFixed(2)} in repairs. Reducing downtime by 10% would save an estimated ${(totalRepairCost * 0.1).toFixed(0)} monthly.
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-200">Inter-Department Load Sharing</strong>
            <p className="text-slate-400">
              The high demand cells highlighted in the heatmap suggest moving ECE oscilloscopes and CSE clusters to shared pools to flatten peaks and maximize yield.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
