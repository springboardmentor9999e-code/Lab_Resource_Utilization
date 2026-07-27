import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Gauge,
  Clock,
  AlertTriangle,
  Loader2,
  CalendarClock,
  MoonStar,
  TrendingUp,
  History,
  Target,
  Share2,
  Flame,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import PageTransition from '../components/PageTransition';
import StatusBadge from '../components/equipment/StatusBadge';
import UtilizationHeatmap from '../components/utilization/UtilizationHeatmap';
import { useToast } from '../components/ui/Toast';
import { utilizationService } from '../services/utilizationService';
import { platformService } from '../services/platformService';
import { connectUtilizationFeed } from '../services/utilizationSocket';

const DAY_RANGES = [7, 30, 90];

// Compact figure used across the peak-analysis panel
const PeakStat = ({ label, value, sub, tone }) => (
  <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 p-3">
    <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 my-0">{label}</p>
    <p className={`text-lg font-extrabold my-0.5 ${tone}`}>{value}</p>
    <p className="text-[10px] text-slate-400 my-0">{sub}</p>
  </div>
);

// Equipment that moved most between the current and previous window
const TrendList = ({ title, items, positive }) => (
  <div>
    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">{title}</h3>
    {!items || items.length === 0 ? (
      <p className="text-[11px] text-slate-400">No measurable movement.</p>
    ) : (
      <ul className="space-y-1.5">
        {items.map((t) => (
          <li key={t.equipmentId} className="flex items-center justify-between text-[11px] gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
              {t.equipmentName}
            </span>
            <span
              className={`shrink-0 font-bold ${
                positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {t.changePercentagePoints > 0 ? '+' : ''}
              {t.changePercentagePoints} pts
              <span className="ml-1.5 font-normal text-slate-400">
                ({t.previousRate}%→{t.currentRate}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

// Actual utilization against the target, with the bar showing the target as a marker
const TargetList = ({ title, rows }) => (
  <div>
    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">{title}</h3>
    {!rows || rows.length === 0 ? (
      <p className="text-[11px] text-slate-400">Nothing to report.</p>
    ) : (
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={`${r.scope}-${r.id ?? r.name}`}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
                {r.name}
                <span className="ml-1.5 font-normal text-slate-400">
                  {r.equipmentCount} asset{r.equipmentCount === 1 ? '' : 's'}
                </span>
              </span>
              <span
                className={`font-bold shrink-0 ml-2 ${
                  r.status === 'BELOW'
                    ? 'text-red-600 dark:text-red-400'
                    : r.status === 'ABOVE'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-slate-500'
                }`}
              >
                {r.actualPercent}% / {r.targetPercent}%
                {r.targetSource !== 'OWN' && (
                  <span className="ml-1 text-[9px] font-normal text-slate-400 uppercase">
                    {r.targetSource === 'INHERITED' ? 'inherited' : 'default'}
                  </span>
                )}
              </span>
            </div>
            {/* Bar is the actual; the notch marks where the target sits */}
            <div className="relative h-2 rounded-full bg-slate-200/60 dark:bg-slate-800/60 overflow-hidden">
              <span
                className={`block h-full rounded-full ${
                  r.status === 'BELOW'
                    ? 'bg-red-400'
                    : r.status === 'ABOVE'
                    ? 'bg-green-500'
                    : 'bg-primary'
                }`}
                style={{ width: `${Math.min(100, r.actualPercent)}%` }}
              />
              <span
                className="absolute top-0 h-full w-0.5 bg-slate-600 dark:bg-slate-200"
                style={{ left: `${Math.min(100, r.targetPercent)}%` }}
                title={`Target ${r.targetPercent}%`}
              />
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const DEMAND_TONES = {
  OVERSUBSCRIBED: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25',
  HIGH: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
  BALANCED: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25',
  LOW: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25',
  DORMANT: 'bg-slate-500/10 text-slate-500 border-slate-500/25',
};

// One row of the demand tables: contention bar plus how much demand went unserved.
// The bar can exceed 100% of capacity, so it is clamped visually and the number carries the truth.
const DemandRow = ({ item }) => (
  <li className="flex items-center gap-2 text-[11px]">
    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate flex-1 min-w-0">
      {item.equipmentName}
      {item.departmentName && (
        <span className="ml-1.5 font-normal text-slate-400">{item.departmentName}</span>
      )}
    </span>
    <span className="w-20 shrink-0 h-1.5 rounded-full bg-slate-200/60 dark:bg-slate-800/60 overflow-hidden">
      <span
        className={`block h-full rounded-full ${
          item.contentionIndex >= 1 ? 'bg-red-500' : item.contentionIndex >= 0.6 ? 'bg-amber-400' : 'bg-sky-400'
        }`}
        style={{ width: `${Math.min(100, item.contentionIndex * 100)}%` }}
      />
    </span>
    <span className="w-12 text-right shrink-0 font-bold text-slate-600 dark:text-slate-300">
      {Math.round(item.contentionIndex * 100)}%
    </span>
    <span className="w-24 text-right shrink-0 text-slate-400">
      {item.unmetMinutes > 0 ? `${Math.round(item.unmetMinutes / 60)} h unmet` : 'fully served'}
    </span>
  </li>
);

const StatCard = ({ icon: Icon, label, value, sub, accent = 'text-primary', bar = null }) => (
  <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className={`text-3xl font-extrabold mt-1.5 ${accent}`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
    {bar !== null && (
      <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
          style={{ width: `${Math.min(100, bar)}%` }}
        />
      </div>
    )}
  </div>
);

const RateBar = ({ rate }) => (
  <div className="flex items-center gap-2 min-w-[120px]">
    <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
        style={{ width: `${Math.min(100, rate)}%` }}
      />
    </div>
    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 w-11 text-right">
      {rate.toFixed(1)}%
    </span>
  </div>
);

// Renders an institution/department -> avg utilization-rate map as a ranked bar list
const AggregationPanel = ({ title, data }) => {
  const rows = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
  return (
    <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
      <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0 mb-4">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center">No data available.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(([name, rate]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 w-32 truncate" title={name}>
                {name}
              </span>
              <div className="flex-1">
                <RateBar rate={rate} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const UtilizationPage = () => {
  const toast = useToast();

  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState(null);
  const [demand, setDemand] = useState(null);
  const [heatmapCells, setHeatmapCells] = useState([]);
  const [peak, setPeak] = useState(null);
  // Live feed state: whether the socket is up, and when it last pushed a change
  const [liveConnected, setLiveConnected] = useState(false);
  const [lastLiveUpdate, setLastLiveUpdate] = useState(null);
  const [idleList, setIdleList] = useState([]);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [heatmapEquipmentId, setHeatmapEquipmentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [heatmapLoading, setHeatmapLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, idleData, demandData] = await Promise.all([
        utilizationService.getSummary(days),
        utilizationService.getIdle(14),
        // Demand shares the same window as the summary — the two are read side by side
        utilizationService.getDemand(days),
      ]);
      setSummary(summaryData);
      setIdleList(idleData || []);
      setDemand(demandData || null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load utilization data. Ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const loadHeatmap = useCallback(async () => {
    setHeatmapLoading(true);
    try {
      // The peak analysis reduces the same 6-week grid, so keep the two in lockstep —
      // showing a heatmap for one scope beside peaks for another would be misleading
      const [cells, peakData] = await Promise.all([
        utilizationService.getHeatmap(42, heatmapEquipmentId || null),
        utilizationService.getPeakUsage(42, heatmapEquipmentId || null),
      ]);
      setHeatmapCells(cells || []);
      setPeak(peakData || null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load booking heatmap.');
    } finally {
      setHeatmapLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heatmapEquipmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live feed: the server pushes a nudge when a booking transition changes utilization, and we
  // refetch. Refs keep the socket from being torn down and rebuilt every time `days` changes —
  // the connection is independent of which window is being viewed.
  const loadDataRef = useRef(loadData);
  const loadHeatmapRef = useRef(loadHeatmap);
  loadDataRef.current = loadData;
  loadHeatmapRef.current = loadHeatmap;

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return undefined;

    setLiveConnected(true);
    const disconnect = connectUtilizationFeed(token, () => {
      setLastLiveUpdate(new Date());
      loadDataRef.current();
      loadHeatmapRef.current();
    });

    return () => {
      setLiveConnected(false);
      disconnect();
    };
  }, []);

  useEffect(() => {
    loadHeatmap();
  }, [loadHeatmap]);

  useEffect(() => {
    // Equipment list for the heatmap filter dropdown
    platformService
      .getEquipment({ size: 100 })
      .then((page) => setEquipmentOptions(page?.content || []))
      .catch((err) => console.error('Error fetching equipment list:', err));
  }, []);

  const totalBookedHours = summary ? Math.round(summary.totalBookedMinutes / 60) : 0;
  const top10 = (summary?.equipment || []).slice(0, 10).map((e) => ({
    name: e.equipmentCode || e.equipmentName,
    rate: e.utilizationRate,
  }));

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header + day-range selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
              Utilization Monitoring
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              Equipment usage rates, booking intensity, and idle asset detection.
              {/* Live badge — otherwise a user has no way to tell the figures are self-updating */}
              {liveConnected && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-600 dark:text-green-400 border border-green-500/25">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                  </span>
                  Live
                  {lastLiveUpdate && (
                    <span className="font-normal text-green-600/70 dark:text-green-400/70">
                      · updated {lastLiveUpdate.toLocaleTimeString()}
                    </span>
                  )}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1 glass-card dark:glass-card-dark rounded-xl p-1">
            {DAY_RANGES.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  days === d
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col justify-center items-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-sm text-slate-500">Computing utilization metrics...</span>
          </div>
        ) : summary ? (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Gauge}
                label="Overall Utilization"
                value={`${summary.overallUtilizationRate}%`}
                sub={`of 08:00–20:00 capacity, last ${days} days`}
                bar={summary.overallUtilizationRate}
              />
              <StatCard
                icon={Clock}
                label="Total Booked Hours"
                value={totalBookedHours.toLocaleString()}
                sub={`${summary.totalBookings} bookings across ${summary.equipmentCount} assets`}
              />
              <StatCard
                icon={CalendarClock}
                label="Recorded Usage Hours"
                value={Math.round(summary.totalUsedMinutes / 60).toLocaleString()}
                sub="from tracked usage sessions"
              />
              <StatCard
                icon={MoonStar}
                label="Idle Equipment"
                value={summary.idleEquipmentCount}
                sub="no bookings in the last 14 days"
                accent="text-red-500"
              />
            </div>

            {/* Heatmap */}
            <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 my-0">
                  Booking Intensity — Last 6 Weeks
                </h2>
                <select
                  value={heatmapEquipmentId}
                  onChange={(e) => setHeatmapEquipmentId(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <option value="">All equipment</option>
                  {equipmentOptions.map((eq) => (
                    <option key={eq.equipmentId} value={eq.equipmentId}>
                      {eq.equipmentName} ({eq.equipmentCode})
                    </option>
                  ))}
                </select>
              </div>
              {heatmapLoading ? (
                <div className="h-48 flex justify-center items-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : (
                <UtilizationHeatmap cells={heatmapCells} />
              )}
            </div>

            {/* Current vs historical benchmark — the same window length, immediately prior */}
            {summary.benchmark && (
              <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0 mb-4 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" /> Current vs Previous {summary.benchmark.days} Days
                </h2>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-800 dark:text-white">
                      {summary.benchmark.currentUtilizationRate}%
                    </span>
                    <span className="text-xs text-slate-400">
                      vs {summary.benchmark.previousUtilizationRate}% before
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                      summary.benchmark.trend === 'UP'
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25'
                        : summary.benchmark.trend === 'DOWN'
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25'
                        : 'bg-slate-500/10 text-slate-500 border-slate-500/25'
                    }`}
                  >
                    {summary.benchmark.trend === 'UP' ? '▲' : summary.benchmark.trend === 'DOWN' ? '▼' : '='}{' '}
                    {Math.abs(summary.benchmark.changePercentagePoints)} pts
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 my-0 flex-1 min-w-[200px]">
                    {summary.benchmark.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <TrendList
                    title="Biggest risers"
                    items={summary.benchmark.biggestRisers}
                    positive
                  />
                  <TrendList
                    title="Biggest fallers"
                    items={summary.benchmark.biggestFallers}
                    positive={false}
                  />
                </div>
              </div>
            )}

            {/* Department & institution performance against their targets */}
            {(summary.departmentTargets?.length > 0 || summary.institutionTargets?.length > 0) && (
              <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0 mb-4 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" /> Utilization vs Target
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TargetList title="Departments" rows={summary.departmentTargets} />
                  <TargetList title="Institutions" rows={summary.institutionTargets} />
                </div>
              </div>
            )}

            {/* Demand analysis — what was asked for vs what we could serve. Utilization only
                counts granted bookings, so this is where turned-away demand becomes visible. */}
            {demand && demand.totalRequests > 0 && (
              <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0 mb-4 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5" /> Demand Analysis
                  <span className="ml-1 font-normal normal-case tracking-normal text-slate-400">
                    last {demand.windowDays} days
                  </span>
                </h2>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                  <PeakStat
                    label="Contention"
                    value={`${Math.round(demand.contentionIndex * 100)}%`}
                    sub="requested vs capacity"
                    tone={
                      demand.contentionIndex >= 1
                        ? 'text-red-600 dark:text-red-400'
                        : demand.contentionIndex >= 0.6
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-700 dark:text-slate-200'
                    }
                  />
                  <PeakStat
                    label="Fulfilment"
                    value={`${demand.fulfilmentRate}%`}
                    sub={`${demand.grantedRequests} of ${demand.totalRequests} requests`}
                    tone={
                      demand.fulfilmentRate >= 90
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }
                  />
                  <PeakStat
                    label="Unmet demand"
                    value={`${Math.round(demand.totalUnmetMinutes / 60)} h`}
                    sub={`${demand.deniedRequests} denied · ${demand.waitlistedRequests} waitlisted`}
                    tone={
                      demand.totalUnmetMinutes > 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-slate-700 dark:text-slate-200'
                    }
                  />
                  <PeakStat
                    label="Oversubscribed"
                    value={demand.oversubscribed?.length ?? 0}
                    sub={`of ${demand.equipment?.length ?? 0} assets`}
                    tone={
                      demand.oversubscribed?.length
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Under pressure — buy or redeploy
                    </h3>
                    {demand.oversubscribed?.length ? (
                      <ul className="space-y-1.5">
                        {demand.oversubscribed.slice(0, 6).map((item) => (
                          <DemandRow key={`over-${item.equipmentId}`} item={item} />
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        Nothing oversubscribed — capacity absorbed every request.
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Spare capacity — redeploy or share out
                    </h3>
                    {demand.underutilised?.length ? (
                      <ul className="space-y-1.5">
                        {demand.underutilised.slice(0, 6).map((item) => (
                          <DemandRow key={`under-${item.equipmentId}`} item={item} />
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        Every asset is carrying meaningful demand.
                      </p>
                    )}
                  </div>
                </div>

                {demand.categories?.length > 0 && (
                  <div className="mt-5 border-t border-slate-200/40 dark:border-slate-800/40 pt-4 overflow-x-auto">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Demand by category
                    </h3>
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="text-slate-400 text-left">
                          <th className="font-semibold py-1">Category</th>
                          <th className="font-semibold py-1 text-right">Assets</th>
                          <th className="font-semibold py-1 text-right">Contention</th>
                          <th className="font-semibold py-1 text-right">Fulfilment</th>
                          <th className="font-semibold py-1 text-right">Unmet</th>
                          <th className="font-semibold py-1 text-right">Hot / Idle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {demand.categories.map((c) => (
                          <tr
                            key={c.category}
                            className="border-t border-slate-200/30 dark:border-slate-800/30"
                          >
                            <td className="py-1.5 font-semibold text-slate-700 dark:text-slate-200">
                              {c.category}
                            </td>
                            <td className="py-1.5 text-right text-slate-500">{c.equipmentCount}</td>
                            <td
                              className={`py-1.5 text-right font-bold ${
                                c.contentionIndex >= 1
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {Math.round(c.contentionIndex * 100)}%
                            </td>
                            <td className="py-1.5 text-right text-slate-500">{c.fulfilmentRate}%</td>
                            <td className="py-1.5 text-right text-slate-500">
                              {Math.round(c.unmetMinutes / 60)} h
                            </td>
                            <td className="py-1.5 text-right">
                              <span
                                className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${
                                  c.oversubscribedCount > 0 && c.dormantCount > 0
                                    ? DEMAND_TONES.HIGH
                                    : DEMAND_TONES.DORMANT
                                }`}
                              >
                                {c.oversubscribedCount} / {c.dormantCount}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {demand.recommendations?.length > 0 && (
                  <ul className="mt-5 space-y-1.5 border-t border-slate-200/40 dark:border-slate-800/40 pt-4">
                    {demand.recommendations.map((text, i) => (
                      <li key={i} className="flex gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="text-primary font-bold">•</span>
                        {text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Shared vs exclusive — inventory posture and whether sharing is actually happening */}
            {summary.sharedUsage && (
              <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0 mb-4 flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5" /> Shared vs Exclusive Usage
                </h2>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                  <PeakStat
                    label="Listed shareable"
                    value={`${summary.sharedUsage.shareablePercent}%`}
                    sub={`${summary.sharedUsage.shareableEquipmentCount} of ${
                      summary.sharedUsage.shareableEquipmentCount +
                      summary.sharedUsage.exclusiveEquipmentCount
                    } assets`}
                    tone="text-primary"
                  />
                  <PeakStat
                    label="Shareable rate"
                    value={`${summary.sharedUsage.shareableUtilizationRate}%`}
                    sub="utilization"
                    tone="text-green-500"
                  />
                  <PeakStat
                    label="Exclusive rate"
                    value={`${summary.sharedUsage.exclusiveUtilizationRate}%`}
                    sub="utilization"
                    tone="text-blue-500"
                  />
                  <PeakStat
                    label="Booked externally"
                    value={`${summary.sharedUsage.externalUtilizationPercent}%`}
                    sub="of shareable time"
                    tone={
                      summary.sharedUsage.externalUtilizationPercent > 0
                        ? 'text-amber-500'
                        : 'text-slate-400'
                    }
                  />
                </div>

                {summary.sharedUsage.unrealisedSharing?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Shared on paper, never booked externally
                    </h3>
                    <ul className="space-y-1.5">
                      {summary.sharedUsage.unrealisedSharing.slice(0, 5).map((e) => (
                        <li
                          key={e.equipmentId}
                          className="flex items-center justify-between text-[11px]"
                        >
                          <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                            {e.equipmentName}
                            <span className="ml-1.5 font-mono text-[9px] text-slate-400">
                              {e.equipmentCode}
                            </span>
                          </span>
                          <span className="text-slate-400 shrink-0 ml-2">
                            {e.utilizationRate}% · {e.internalBookings} internal
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.sharedUsage.insights?.length > 0 && (
                  <ul className="space-y-1.5 border-t border-slate-200/40 dark:border-slate-800/40 pt-4">
                    {summary.sharedUsage.insights.map((text, i) => (
                      <li key={i} className="flex gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="text-primary font-bold">•</span>
                        {text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Peak usage pattern analysis — reduces the heatmap grid to when demand actually bites */}
            {peak && (
              <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 my-0 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" /> Peak Usage Patterns
                  </h2>
                  {peak.peakToAverageRatio > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                        peak.peakToAverageRatio >= 2
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                          : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25'
                      }`}
                    >
                      Peak is {peak.peakToAverageRatio}× the average hour
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                  <PeakStat
                    label="Peak day"
                    value={peak.peakDayLabel || '—'}
                    sub={peak.peakDayMinutes ? `${Math.round(peak.peakDayMinutes / 60)} h booked` : 'no data'}
                    tone="text-red-500"
                  />
                  <PeakStat
                    label="Peak hour"
                    value={peak.peakHourLabel || '—'}
                    sub={peak.peakHourMinutes ? `${Math.round(peak.peakHourMinutes / 60)} h booked` : 'no data'}
                    tone="text-amber-500"
                  />
                  <PeakStat
                    label="Quietest hour"
                    value={peak.quietestHourLabel || '—'}
                    sub={`${Math.round((peak.quietestHourMinutes || 0) / 60)} h booked`}
                    tone="text-blue-500"
                  />
                  <PeakStat
                    label="Top-quarter load"
                    value={`${peak.concentrationPercent ?? 0}%`}
                    sub="of all booked time"
                    tone="text-primary"
                  />
                </div>

                {/* Hour-of-day distribution */}
                {peak.minutesByHour && Object.keys(peak.minutesByHour).length > 0 && (
                  <div className="h-48 mb-5">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(peak.minutesByHour).map(([hour, minutes]) => ({
                          hour,
                          hours: Math.round((minutes / 60) * 10) / 10,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                        <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <Tooltip
                          formatter={(v) => [`${v} h`, 'Booked']}
                          contentStyle={{
                            borderRadius: '0.75rem',
                            fontSize: '0.7rem',
                            border: '1px solid rgba(148,163,184,0.25)',
                          }}
                        />
                        <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Busiest slots
                    </h3>
                    <ul className="space-y-1.5">
                      {(peak.busiestSlots || []).filter((s) => s.minutes > 0).length === 0 ? (
                        <li className="text-[11px] text-slate-400">No usage recorded in this window.</li>
                      ) : (
                        peak.busiestSlots
                          .filter((s) => s.minutes > 0)
                          .map((s) => (
                            <li
                              key={`busy-${s.dayOfWeek}-${s.hour}`}
                              className="flex items-center gap-2 text-[11px]"
                            >
                              <span className="font-bold text-slate-700 dark:text-slate-200 w-20 shrink-0">
                                {s.dayLabel} {s.hourLabel}
                              </span>
                              <span className="flex-1 h-1.5 rounded-full bg-slate-200/60 dark:bg-slate-800/60 overflow-hidden">
                                <span
                                  className="block h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500"
                                  style={{ width: `${s.intensityPercent}%` }}
                                />
                              </span>
                              <span className="text-slate-400 w-16 text-right shrink-0">
                                {s.bookings} bkg
                              </span>
                            </li>
                          ))
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      Quietest weekday slots — steer flexible work here
                    </h3>
                    <ul className="space-y-1.5">
                      {(peak.quietestSlots || []).map((s) => (
                        <li
                          key={`quiet-${s.dayOfWeek}-${s.hour}`}
                          className="flex items-center justify-between text-[11px]"
                        >
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {s.dayLabel} {s.hourLabel}
                          </span>
                          <span className="text-slate-400">
                            {s.minutes === 0 ? 'completely free' : `${Math.round(s.minutes / 60)} h used`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {peak.insights?.length > 0 && (
                  <ul className="mt-5 space-y-1.5 border-t border-slate-200/40 dark:border-slate-800/40 pt-4">
                    {peak.insights.map((text, i) => (
                      <li key={i} className="flex gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="text-primary font-bold">•</span>
                        {text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Top-10 chart + per-equipment table */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <div className="glass-card dark:glass-card-dark rounded-2xl p-5 xl:col-span-2">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0 mb-4">
                  Top 10 by Utilization
                </h2>
                {top10.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No booking data in this window.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={Math.max(220, top10.length * 34)}>
                    <BarChart data={top10} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="0" stroke="rgba(148,163,184,0.15)" horizontal={false} />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        unit="%"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={90}
                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(v) => [`${v}%`, 'Utilization']}
                        contentStyle={{
                          fontSize: 12,
                          borderRadius: 12,
                          border: '1px solid rgba(148,163,184,0.25)',
                        }}
                      />
                      <Bar dataKey="rate" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="glass-card dark:glass-card-dark rounded-2xl p-5 xl:col-span-3 overflow-x-auto">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0 mb-4">
                  Per-Equipment Utilization
                </h2>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-900">
                      <th className="py-2 pr-3 font-extrabold">Equipment</th>
                      <th className="py-2 pr-3 font-extrabold">Status</th>
                      <th className="py-2 pr-3 font-extrabold text-right">Bookings</th>
                      <th className="py-2 pr-3 font-extrabold text-right">Booked Hrs</th>
                      <th className="py-2 font-extrabold">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary.equipment || []).map((eq) => (
                      <tr
                        key={eq.equipmentId}
                        className="border-b border-slate-50 dark:border-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                      >
                        <td className="py-2.5 pr-3">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 my-0">
                            {eq.equipmentName}
                          </p>
                          <p className="text-[10px] text-slate-400 my-0">{eq.equipmentCode}</p>
                        </td>
                        <td className="py-2.5 pr-3">
                          <StatusBadge status={eq.status} />
                        </td>
                        <td className="py-2.5 pr-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {eq.bookingCount}
                        </td>
                        <td className="py-2.5 pr-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {(eq.bookedMinutes / 60).toFixed(1)}
                        </td>
                        <td className="py-2.5">
                          <RateBar rate={eq.utilizationRate} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(summary.equipment || []).length === 0 && (
                  <p className="text-xs text-slate-400 py-8 text-center">No equipment registered.</p>
                )}
              </div>
            </div>

            {/* Institution & Department aggregation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <AggregationPanel
                title="Utilization by Institution"
                data={summary.institutionUtilization}
              />
              <AggregationPanel
                title="Utilization by Department"
                data={summary.departmentUtilization}
              />
            </div>

            {/* Idle equipment */}
            <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 my-0">
                  Idle Equipment — 14+ Days Without Bookings
                </h2>
              </div>
              {idleList.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No idle equipment detected. All active assets have recent bookings.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {idleList.map((eq, idx) => (
                    <motion.div
                      key={eq.equipmentId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 my-0 truncate">
                            {eq.equipmentName}
                          </p>
                          <p className="text-[10px] text-slate-400 my-0">
                            {eq.equipmentCode}
                            {eq.labName ? ` · ${eq.labName}` : ''}
                          </p>
                        </div>
                        <StatusBadge status={eq.status} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-amber-600 dark:text-amber-400">
                          Idle {eq.idleDays}+ days
                        </span>
                        <span className="text-slate-400">
                          {eq.lastBookingDate ? `Last: ${eq.lastBookingDate}` : 'Never booked'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="glass-card dark:glass-card-dark p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 border border-red-500/20">
            <BarChart3 className="h-10 w-10 text-red-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Failed to load utilization data.
            </span>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default UtilizationPage;
