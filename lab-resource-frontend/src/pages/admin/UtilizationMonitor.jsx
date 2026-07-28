import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Clock, AlertTriangle, BarChart3, Cpu, Building2, ArrowUpDown, Calendar, Activity, Zap } from 'lucide-react';
import { costApi } from '../../api/api';

const getHeatColor = (percent) => {
  if (percent === 0) return 'bg-gray-100 text-gray-400';
  if (percent < 20) return 'bg-blue-50 text-blue-700';
  if (percent < 40) return 'bg-blue-100 text-blue-700';
  if (percent < 60) return 'bg-blue-200 text-blue-800';
  if (percent < 80) return 'bg-blue-400 text-white';
  return 'bg-blue-600 text-white';
};

const getUtilColor = (rate) => {
  if (rate >= 70) return 'text-green-600';
  if (rate >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

const getScoreColor = (score) => {
  if (score >= 70) return 'bg-green-100 text-green-700';
  if (score >= 40) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const getIdleSeverity = (days) => {
  if (days >= 999) return { label: 'Never Booked', color: 'bg-red-100 text-red-700' };
  if (days >= 60) return { label: 'Critical', color: 'bg-red-100 text-red-700' };
  if (days >= 30) return { label: 'Warning', color: 'bg-amber-100 text-amber-700' };
  return { label: 'Low', color: 'bg-yellow-100 text-yellow-700' };
};

const PRESETS = [
  { label: 'This Month', getValue: () => ({ start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10), end: new Date().toISOString().slice(0, 10) }) },
  { label: 'Last 30 Days', getValue: () => { const d = new Date(); d.setDate(d.getDate() - 30); return { start: d.toISOString().slice(0, 10), end: new Date().toISOString().slice(0, 10) }; } },
  { label: 'Last 3 Months', getValue: () => { const d = new Date(); d.setMonth(d.getMonth() - 3); return { start: d.toISOString().slice(0, 10), end: new Date().toISOString().slice(0, 10) }; } },
  { label: 'This Quarter', getValue: () => { const now = new Date(); const q = Math.floor(now.getMonth() / 3); const start = new Date(now.getFullYear(), q * 3, 1); return { start: start.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) }; } },
];

export default function UtilizationMonitor() {
  const [startDate, setStartDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [activePreset, setActivePreset] = useState('This Month');
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['utilization-intelligence', startDate, endDate],
    queryFn: async () => { const res = await costApi.getUtilization({ startDate, endDate }); return res.data; },
  });

  const applyPreset = (preset) => {
    const vals = preset.getValue();
    setStartDate(vals.start);
    setEndDate(vals.end);
    setActivePreset(preset.label);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Utilization Monitor</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertTriangle size={18} />
            <span className="font-semibold">Failed to load utilization data</span>
          </div>
          <p className="text-sm text-red-600">{error?.response?.data?.message || error?.message}</p>
        </div>
      </div>
    );
  }

  const hourlyDist = data?.peakUsage?.hourlyDistribution || [];
  const equipmentUtils = data?.equipmentUtilizations || [];
  const deptUtils = data?.departmentUtilizations || [];
  const idleEquipment = data?.idleEquipment || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Utilization Monitor</h1>
        <p className="text-gray-600 mt-1">Equipment usage analytics with per-equipment capacity and slot occupancy</p>
      </div>

      {/* Date Range Picker */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <div className="flex gap-1">
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activePreset === p.label ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setActivePreset(''); }}
              className="input-field py-1.5 px-3 text-sm" />
            <span className="text-gray-400">to</span>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setActivePreset(''); }}
              className="input-field py-1.5 px-3 text-sm" />
          </div>
          <span className="text-xs text-gray-400 ml-auto">{data?.totalOperatingDays || 0} operating days</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{data?.overallUtilizationRate || 0}%</p>
            <p className="text-sm text-gray-500">Overall Utilization</p>
          </div>
        </div>
        <div className="card flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-green-100 text-green-700">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{data?.overallSessionFrequency || 0}</p>
            <p className="text-sm text-gray-500">Avg Sessions/Day</p>
          </div>
        </div>
        <div className="card flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{data?.peakUsage?.peakHour || 'N/A'}</p>
            <p className="text-sm text-gray-500">Peak Usage Hour</p>
          </div>
        </div>
        <div className="card flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{idleEquipment.length}</p>
            <p className="text-sm text-gray-500">Idle Equipment</p>
          </div>
        </div>
      </div>

      {/* Slot Occupancy Heatmap */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Hourly Slot Occupancy</h3>
          <span className="text-sm text-gray-400 ml-auto">% of days each slot was booked</span>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {hourlyDist.map(({ hour, bookingCount, occupancyPercent }) => (
            <div key={hour}
              className={`p-2 rounded-lg text-center transition-all hover:scale-105 ${getHeatColor(occupancyPercent)}`}
              title={`${hour}:00-${hour + 1}:00: ${bookingCount} bookings, ${occupancyPercent}% occupancy`}>
              <p className="text-xs font-bold">{String(hour).padStart(2, '0')}:00</p>
              <p className="text-lg font-bold">{Math.round(occupancyPercent)}%</p>
              <p className="text-xs opacity-75">{bookingCount} bookings</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <div className="w-4 h-4 bg-blue-50 rounded"></div>
            <div className="w-4 h-4 bg-blue-100 rounded"></div>
            <div className="w-4 h-4 bg-blue-200 rounded"></div>
            <div className="w-4 h-4 bg-blue-400 rounded"></div>
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Department Utilization */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={18} className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Department Utilization</h3>
          </div>
          {deptUtils.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No department data</p>
          ) : (
            <div className="space-y-3">
              {deptUtils.map((d) => (
                <div key={d.departmentId} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{d.departmentName}</span>
                    <span className={`text-sm font-bold ${getUtilColor(d.utilizationRate)}`}>
                      {d.utilizationRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div className={`h-2 rounded-full transition-all bg-primary-500`}
                      style={{ width: `${Math.min(d.utilizationRate, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{d.totalEquipment} equipment</span>
                    <span>{d.totalBookedHours}h / {d.totalAvailableHours}h</span>
                    <span>{d.totalBookings} bookings</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Idle Equipment Alerts */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-800">Idle Equipment Alerts</h3>
          </div>
          {idleEquipment.length === 0 ? (
            <p className="text-green-600 text-center py-6">All equipment is being utilized</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {idleEquipment.map((e) => {
                const severity = getIdleSeverity(e.idleDays);
                return (
                  <div key={e.equipmentId} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{e.equipmentName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severity.color}`}>
                        {severity.label}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{e.departmentName}</span>
                      <span>{e.idleDays >= 999 ? 'Never booked' : `${e.idleDays} days idle`}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Equipment Utilization Table */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Cpu size={18} className="text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">Equipment Utilization Details</h3>
        </div>
        {equipmentUtils.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No equipment data</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-500">Equipment</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-center py-3 px-3 text-sm font-medium text-gray-500">
                    <span className="flex items-center justify-center gap-1"><ArrowUpDown size={12} /> Util%</span>
                  </th>
                  <th className="text-center py-3 px-3 text-sm font-medium text-gray-500">Sessions/Day</th>
                  <th className="text-center py-3 px-3 text-sm font-medium text-gray-500">Booked</th>
                  <th className="text-center py-3 px-3 text-sm font-medium text-gray-500">Available</th>
                  <th className="text-center py-3 px-3 text-sm font-medium text-gray-500">
                    <span className="flex items-center justify-center gap-1"><Zap size={12} /> Score</span>
                  </th>
                  <th className="text-center py-3 px-3 text-sm font-medium text-gray-500">Slots</th>
                </tr>
              </thead>
              <tbody>
                {equipmentUtils.map((e) => (
                  <tr key={e.equipmentId}
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedEquipment?.equipmentId === e.equipmentId ? 'bg-primary-50' : ''}`}
                    onClick={() => setSelectedEquipment(selectedEquipment?.equipmentId === e.equipmentId ? null : e)}>
                    <td className="py-3 px-3">
                      <div className="text-sm font-medium text-gray-800">{e.equipmentName}</div>
                      <div className="text-xs text-gray-400">{e.equipmentCode} | {e.maxDailyHours}h/day</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        e.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                        e.status === 'IN_USE' ? 'bg-blue-100 text-blue-700' :
                        e.status === 'UNDER_MAINTENANCE' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{e.status?.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                          <div className={`h-2 rounded-full ${
                            e.utilizationRate >= 70 ? 'bg-green-500' :
                            e.utilizationRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} style={{ width: `${Math.min(e.utilizationRate, 100)}%` }} />
                        </div>
                        <span className={`text-sm font-bold w-12 text-right ${getUtilColor(e.utilizationRate)}`}>
                          {e.utilizationRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-center text-gray-600">{e.sessionFrequency}</td>
                    <td className="py-3 px-3 text-sm text-center text-gray-600">{e.totalBookedHours}h</td>
                    <td className="py-3 px-3 text-sm text-center text-gray-600">{e.totalAvailableHours}h</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getScoreColor(e.efficiencyScore)}`}>
                        {e.efficiencyScore}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-center text-gray-500">{e.totalBookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Expanded Slot Detail */}
            {selectedEquipment && selectedEquipment.slotOccupancy && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Slot Occupancy: {selectedEquipment.equipmentName}</h4>
                  <span className="text-xs text-gray-400">({selectedEquipment.operatingDays} operating days)</span>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
                  {selectedEquipment.slotOccupancy.map(slot => (
                    <div key={slot.hour}
                      className={`p-1.5 rounded text-center text-xs ${getHeatColor(slot.occupancyPercent)}`}
                      title={`${slot.label}: ${slot.daysBooked}/${selectedEquipment.operatingDays} days, ${slot.bookingCount} bookings`}>
                      <div className="font-bold">{Math.round(slot.occupancyPercent)}%</div>
                      <div className="opacity-75">{slot.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
