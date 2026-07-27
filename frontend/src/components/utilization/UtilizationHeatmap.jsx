import React, { useMemo } from 'react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Blue sequential intensity — 0 uses a neutral empty cell, then 4 alpha steps of the primary blue
const intensityStyle = (minutes, max) => {
  if (!minutes || max === 0) return null;
  const ratio = minutes / max;
  const alpha = ratio <= 0.25 ? 0.2 : ratio <= 0.5 ? 0.4 : ratio <= 0.75 ? 0.65 : 0.9;
  return { backgroundColor: `rgba(37, 99, 235, ${alpha})` };
};

const LEGEND_ALPHAS = [0.2, 0.4, 0.65, 0.9];

/**
 * 7 (Mon..Sun) x 12 (08:00..19:00) booking-intensity heatmap.
 * cells: [{ dayOfWeek: 1-7, hour: 8-19, bookings, minutes }]
 */
const UtilizationHeatmap = ({ cells = [] }) => {
  const { grid, maxMinutes } = useMemo(() => {
    const map = {};
    let max = 0;
    cells.forEach((c) => {
      map[`${c.dayOfWeek}-${c.hour}`] = c;
      if (c.minutes > max) max = c.minutes;
    });
    return { grid: map, maxMinutes: max };
  }, [cells]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        {/* Hour header row */}
        <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: '3rem repeat(12, minmax(0, 1fr))' }}>
          <div />
          {HOURS.map((h) => (
            <div key={h} className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
              {String(h).padStart(2, '0')}
            </div>
          ))}
        </div>

        {/* Day rows */}
        {DAY_LABELS.map((label, dayIdx) => (
          <div
            key={label}
            className="grid gap-1 mb-1"
            style={{ gridTemplateColumns: '3rem repeat(12, minmax(0, 1fr))' }}
          >
            <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {label}
            </div>
            {HOURS.map((hour) => {
              const cell = grid[`${dayIdx + 1}-${hour}`];
              const minutes = cell?.minutes || 0;
              const style = intensityStyle(minutes, maxMinutes);
              return (
                <div
                  key={hour}
                  title={`${DAY_NAMES[dayIdx]} ${String(hour).padStart(2, '0')}:00 — ${cell?.bookings || 0} bookings, ${minutes} min`}
                  className={`aspect-square min-h-6 rounded-md transition-transform hover:scale-110 cursor-default ${
                    style ? '' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                  style={style || undefined}
                />
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 mt-3">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
            Low
          </span>
          <div className="h-3.5 w-3.5 rounded-sm bg-slate-100 dark:bg-slate-800" />
          {LEGEND_ALPHAS.map((a) => (
            <div
              key={a}
              className="h-3.5 w-3.5 rounded-sm"
              style={{ backgroundColor: `rgba(37, 99, 235, ${a})` }}
            />
          ))}
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1">
            High
          </span>
        </div>
      </div>
    </div>
  );
};

export default UtilizationHeatmap;
