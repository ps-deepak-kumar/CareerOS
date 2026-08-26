import React, { useState, useEffect } from 'react';
import { stateManager, getLocalDateString } from '../services/stateManager';

export const Heatmap: React.FC = () => {
  const [profile, setProfile] = useState(stateManager.getProfile());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(stateManager.getProfile());
    };
    window.addEventListener('heatmap-updated', handleUpdate);
    return () => window.removeEventListener('heatmap-updated', handleUpdate);
  }, []);

  const heatmapActivity = profile.heatmapActivity || {};

  // Year list from 2025 to 2035 (next 10 years from 2025)
  const years = [2035, 2034, 2033, 2032, 2031, 2030, 2029, 2028, 2027, 2026, 2025];

  const getIntensityClass = (val: number) => {
    if (val === 0) return 'bg-[#14151f] border-slate-800/40 hover:border-slate-500';
    if (val <= 2) return 'bg-[#0e6231] border-[#0e6231] hover:border-emerald-500'; // Faint/visited green
    if (val <= 4) return 'bg-[#188849] border-[#188849] hover:border-emerald-400';
    if (val <= 6) return 'bg-[#24b263] border-[#24b263] hover:border-emerald-300';
    return 'bg-[#39d353] border-[#39d353] hover:border-white scale-105 shadow-[0_0_8px_rgba(57,211,83,0.3)]'; // Max intensity neon green
  };

  const formatDateTooltip = (date: Date, score: number) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const dateStr = date.toLocaleDateString('en-US', options);
    let activityText = 'No focus activity';
    if (score === 1) activityText = '1 activity unit (Visited)';
    else if (score > 1) activityText = `${score} activity units`;
    return `${activityText} on ${dateStr}`;
  };

  // Helper to generate monthly grids for selectedYear
  const getMonthGridData = (monthIdx: number) => {
    const startOfMonth = new Date(selectedYear, monthIdx, 1);
    const endOfMonth = new Date(selectedYear, monthIdx + 1, 0);

    // Grid starts on Sunday of the week containing startOfMonth
    const gridStart = new Date(startOfMonth);
    gridStart.setDate(startOfMonth.getDate() - startOfMonth.getDay());
    gridStart.setHours(0,0,0,0);

    // Grid ends on Saturday of the week containing endOfMonth
    const gridEnd = new Date(endOfMonth);
    gridEnd.setDate(endOfMonth.getDate() + (6 - endOfMonth.getDay()));
    gridEnd.setHours(0,0,0,0);

    const diffTime = Math.abs(gridEnd.getTime() - gridStart.getTime());
    const numDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const numWeeks = numDays / 7;

    return Array.from({ length: numWeeks }, (_, colIdx) =>
      Array.from({ length: 7 }, (_, rowIdx) => {
        const cellDate = new Date(gridStart);
        cellDate.setDate(gridStart.getDate() + (colIdx * 7 + rowIdx));
        return {
          date: cellDate,
          isPadding: cellDate.getMonth() !== monthIdx
        };
      })
    );
  };

  const getStreakStats = () => {
    const activityDays = Object.keys(heatmapActivity)
      .filter(d => (heatmapActivity[d] || 0) > 0)
      .sort();

    const total = activityDays.length;

    let longest = 0;
    let current = 0;

    if (total > 0) {
      // Find longest streak
      let tempStreak = 1;
      let prevDate = new Date(activityDays[0]);
      prevDate.setHours(0, 0, 0, 0);

      for (let i = 1; i < activityDays.length; i++) {
        const currDate = new Date(activityDays[i]);
        currDate.setHours(0, 0, 0, 0);
        
        const diffTime = currDate.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (tempStreak > longest) {
            longest = tempStreak;
          }
          tempStreak = 1;
        }
        prevDate = currDate;
      }
      if (tempStreak > longest) {
        longest = tempStreak;
      }

      // Find current streak: check if today or yesterday is active, and trace backwards
      const todayStr = getLocalDateString(new Date());
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);

      const hasToday = activityDays.includes(todayStr);
      const hasYesterday = activityDays.includes(yesterdayStr);

      if (hasToday || hasYesterday) {
        current = 1;
        const checkDate = hasToday ? new Date() : yesterday;
        checkDate.setHours(0, 0, 0, 0);
        
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const checkStr = getLocalDateString(checkDate);
          if (activityDays.includes(checkStr)) {
            current++;
          } else {
            break;
          }
        }
      } else {
        current = 0;
      }
    }

    return {
      total,
      longest: Math.max(longest, current),
      current
    };
  };

  const stats = getStreakStats();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-[#0f111a] border border-brand-border rounded-xl p-5 shadow-sm w-full text-slate-300">
      
      {/* Heatmap header */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4 pb-2 border-b border-brand-border/40">
        <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider flex items-center gap-2">
          <span>📊 Contribution Heatmap</span>
        </h3>
        
        {/* Custom Dropdown select for Year */}
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-[#0f111a] text-slate-300 border border-brand-border hover:border-slate-500 rounded pl-3 pr-8 py-1.5 text-[10px] font-bold font-mono focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
          >
            {years.map(yr => (
              <option key={yr} value={yr} className="bg-[#0f111a] text-slate-300">
                {yr}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <svg className="fill-current h-3.5 w-3.5" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* 12 Monthly Grid Cards Layout - 4 columns on desktop for balanced grid spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
        {monthNames.map((monthName, monthIdx) => {
          const monthGrid = getMonthGridData(monthIdx);
          
          return (
            <div 
              key={monthIdx} 
              className="bg-[#090a12] border border-brand-border/40 rounded-xl p-3.5 flex flex-col gap-2 hover:border-indigo-500/25 transition-all duration-300 shadow-sm"
            >
              <div className="text-[10px] font-bold text-white uppercase tracking-wider font-sans border-b border-brand-border/20 pb-1.5 flex justify-between items-center select-none">
                <span>{monthName}</span>
                <span className="text-[8px] text-slate-500 font-mono font-normal">{selectedYear}</span>
              </div>
              
              <div className="flex justify-center pt-1">
                {/* Columns of weeks (removed vertical day labels column) */}
                <div className="flex gap-[3.5px]">
                  {monthGrid.map((week, colIdx) => (
                    <div key={colIdx} className="flex gap-[3.5px] flex-col">
                      {week.map((dayData, rowIdx) => {
                        if (dayData.isPadding) {
                          return (
                            <div key={rowIdx} className="w-[11px] h-[11px] sm:w-[12px] sm:h-[12px] opacity-0 pointer-events-none" />
                          );
                        }
                        const dateStr = getLocalDateString(dayData.date);
                        const score = heatmapActivity[dateStr] || 0;
                        return (
                          <div
                            key={rowIdx}
                            className={`w-[11px] h-[11px] sm:w-[12px] sm:h-[12px] rounded-[1.5px] border transition-all duration-200 hover:scale-125 hover:z-10 cursor-pointer ${getIntensityClass(score)}`}
                            title={formatDateTooltip(dayData.date, score)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend & Stats footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-4 border-t border-brand-border/40 select-none">
        
        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase font-sans">
          <span>Less</span>
          <div className="w-[8px] h-[8px] rounded-[1px] bg-[#14151f] border border-slate-800/40" />
          <div className="w-[8px] h-[8px] rounded-[1px] bg-[#0e6231] border border-[#0e6231]" />
          <div className="w-[8px] h-[8px] rounded-[1px] bg-[#188849] border border-[#188849]" />
          <div className="w-[8px] h-[8px] rounded-[1px] bg-[#24b263] border border-[#24b263]" />
          <div className="w-[8px] h-[8px] rounded-[1px] bg-[#39d353] border border-[#39d353]" />
          <span>More</span>
        </div>

        {/* Dynamic streak summaries */}
        <div className="flex gap-6 text-[10px] text-slate-500 uppercase tracking-wider font-bold font-sans">
          <div>
            Current Streak: <span className="text-[#FFA116]">🔥 {stats.current} Days</span>
          </div>
          <div>
            Longest Streak: <span className="text-slate-300">⚡ {stats.longest} Days</span>
          </div>
          <div>
            Total Active Days: <span className="text-white">🎯 {stats.total} Days</span>
          </div>
        </div>
      </div>
      
    </div>
  );
};
export default Heatmap;
