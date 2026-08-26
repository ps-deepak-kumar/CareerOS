import React, { useState, useEffect } from 'react';
import { Briefcase, Target, Clock, CheckCircle2, Square, Sparkles, ChevronRight, Calendar, Eye, EyeOff } from 'lucide-react';
import { stateManager, getLocalDateString } from '../services/stateManager';
import { Task } from '../data/mockData';
import { ProgressRing } from '../components/ProgressRing';

export const DailyPlan: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | 'month'>('today');
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const refreshTasks = () => {
      setTasks(stateManager.getTasks());
    };
    refreshTasks();

    window.addEventListener('tasks-updated', refreshTasks);
    return () => window.removeEventListener('tasks-updated', refreshTasks);
  }, []);

  const handleToggleTask = (id: string) => {
    const updated = stateManager.toggleTaskCompleted(id);
    setTasks([...updated]);
  };

  const filterByTime = (task: Task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    
    const taskDate = new Date(task.deadline + 'T00:00:00');
    const taskTime = taskDate.getTime();
    
    if (timeFilter === 'today') {
      return task.deadline === getLocalDateString();
    }
    
    const diffDays = (taskTime - todayTime) / (1000 * 60 * 60 * 24);
    
    if (timeFilter === '7days') {
      return diffDays >= -7 && diffDays <= 7;
    }
    
    if (timeFilter === 'month') {
      return diffDays >= -45 && diffDays <= 30; // fully covers July calendar tasks
    }
    
    return false;
  };

  const getMonthInfo = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const year = date.getFullYear();
    const monthName = date.toLocaleDateString(undefined, { month: 'long' });
    return {
      monthName,
      year,
      key: `${year}-${monthName}`
    };
  };

  const getWeekOfMonthAndYear = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const year = date.getFullYear();
    const monthName = date.toLocaleDateString(undefined, { month: 'long' });
    
    const weekNum = Math.ceil(day / 7);
    return {
      weekNum,
      monthName,
      year,
      key: `${year}-${monthName}-W${weekNum}`
    };
  };

  const filteredTasks = tasks.filter(filterByTime);
  const uniqueDates = Array.from(new Set(filteredTasks.map(t => t.deadline))).sort();

  // Initialize auto-expand state for the month and week containing today
  useEffect(() => {
    const today = getLocalDateString();
    const initialExpandedMonths: Record<string, boolean> = {};
    const initialExpandedWeeks: Record<string, boolean> = {};
    
    uniqueDates.forEach(date => {
      const monthInfo = getMonthInfo(date);
      const weekInfo = getWeekOfMonthAndYear(date);
      if (date === today) {
        initialExpandedMonths[monthInfo.key] = true;
        initialExpandedWeeks[weekInfo.key] = true;
      }
    });
    
    setExpandedMonths(prev => ({
      ...initialExpandedMonths,
      ...prev
    }));
    
    setExpandedWeeks(prev => ({
      ...initialExpandedWeeks,
      ...prev
    }));
  }, [tasks, timeFilter]);

  // Group dates by Month -> Week
  const groupedMonths = uniqueDates.reduce((acc, date) => {
    const monthInfo = getMonthInfo(date);
    const weekInfo = getWeekOfMonthAndYear(date);
    
    if (!acc[monthInfo.key]) {
      acc[monthInfo.key] = {
        monthName: monthInfo.monthName,
        year: monthInfo.year,
        weeks: {}
      };
    }
    
    if (!acc[monthInfo.key].weeks[weekInfo.key]) {
      acc[monthInfo.key].weeks[weekInfo.key] = {
        weekNum: weekInfo.weekNum,
        monthName: weekInfo.monthName,
        year: weekInfo.year,
        dates: []
      };
    }
    
    acc[monthInfo.key].weeks[weekInfo.key].dates.push(date);
    return acc;
  }, {} as Record<string, { monthName: string; year: number; weeks: Record<string, { weekNum: number; monthName: string; year: number; dates: string[] }> }>);

  // Group dates by Week directly (useful for 7days view)
  const groupedWeeksDirect = uniqueDates.reduce((acc, date) => {
    const weekInfo = getWeekOfMonthAndYear(date);
    if (!acc[weekInfo.key]) {
      acc[weekInfo.key] = {
        weekNum: weekInfo.weekNum,
        monthName: weekInfo.monthName,
        year: weekInfo.year,
        dates: []
      };
    }
    acc[weekInfo.key].dates.push(date);
    return acc;
  }, {} as Record<string, { weekNum: number; monthName: string; year: number; dates: string[] }>);

  // Metrics calculations for the current filtered set
  const workTimeline = filteredTasks.filter(t => t.category === 'work');
  const learnTimeline = filteredTasks.filter(t => t.category === 'learning');

  const workHours = workTimeline.reduce((acc, curr) => acc + curr.estimatedTime, 0);
  const learnHours = learnTimeline.reduce((acc, curr) => acc + curr.estimatedTime, 0);
  const totalPlannedHours = workHours + learnHours;
  const sleepHours = 8;
  const bufferHours = Math.max(0, 24 - totalPlannedHours - sleepHours);

  const completedWorkHours = workTimeline
    .filter(t => t.status === 'completed')
    .reduce((acc, curr) => acc + curr.estimatedTime, 0);
  const completedLearnHours = learnTimeline
    .filter(t => t.status === 'completed')
    .reduce((acc, curr) => acc + curr.estimatedTime, 0);

  const workCompletePercent = workHours ? Math.round((completedWorkHours / workHours) * 100) : 0;
  const learnCompletePercent = learnHours ? Math.round((completedLearnHours / learnHours) * 100) : 0;
  const overallProductivity = totalPlannedHours 
    ? Math.round(((completedWorkHours + completedLearnHours) / totalPlannedHours) * 100) 
    : 0;

  const completedCount = filteredTasks.filter(t => t.status === 'completed').length;
  const pendingCount = filteredTasks.filter(t => t.status === 'pending').length;
  const backlogCount = filteredTasks.filter(t => t.status === 'backlog').length;
  const overdueCount = 0;

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  const toggleWeek = (weekKey: string) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekKey]: !prev[weekKey]
    }));
  };

  // Render helper for a single Day Block card
  const renderDayBlock = (date: string) => {
    const dayTasks = filteredTasks.filter(t => t.deadline === date);
    const dayCompany = dayTasks.filter(t => t.category === 'work');
    const dayPersonal = dayTasks.filter(t => t.category === 'learning');

    const dayCompanyHours = dayCompany.reduce((sum, t) => sum + t.estimatedTime, 0);
    const dayPersonalHours = dayPersonal.reduce((sum, t) => sum + t.estimatedTime, 0);
    const dayTotalHours = dayCompanyHours + dayPersonalHours;

    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(undefined, { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });

    const isToday = date === getLocalDateString();

    return (
      <div 
        key={date} 
        className={`glass-panel p-5 bg-[#0f111a] border border-[#1e2238] transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] flex flex-col gap-5 ${
          isToday ? 'border-l-4 border-l-indigo-500' : 'border-l-4 border-l-slate-700'
        }`}
      >
        {/* Day Block Header */}
        <div className="flex justify-between items-center border-b border-[#1e2238] pb-3.5 flex-wrap gap-2">
          <span className="text-xs font-bold text-white flex items-center gap-2 font-display select-none">
            <span className={`w-2.5 h-2.5 rounded-full ${isToday ? 'bg-indigo-400 animate-pulse' : 'bg-slate-500'}`}></span>
            {formattedDate} 
            {isToday && (
              <span className="text-[9px] bg-indigo-950/60 text-indigo-400 px-1.5 py-0.2 rounded border border-indigo-900/30 font-mono font-bold uppercase tracking-wider">
                Today
              </span>
            )}
          </span>
          <div className="flex items-center gap-2 text-[9px] font-mono font-bold uppercase select-none">
            <span className="bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded text-slate-300">Total: {dayTotalHours.toFixed(1)}h</span>
          </div>
        </div>

        {/* Day Content split columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Column 1: Company Tasks Sub-Card Panel */}
          <div className="flex flex-col gap-3.5 bg-[#0b0c15]/60 border border-[#222741]/40 rounded-xl p-4 transition-all hover:border-blue-500/40 hover:shadow-[inset_0_0_15px_rgba(59,130,246,0.03)]">
            <div className="border-l-2 border-l-blue-500 pl-2 pb-0.5 flex justify-between items-center select-none mb-1">
              <div className="flex items-center gap-2">
                <Briefcase size={12} className="text-blue-400" />
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest font-display">
                  Company Deliverables
                </h4>
              </div>
              <span className="text-[8px] font-mono text-slate-500 font-bold uppercase bg-slate-950 px-1.5 py-0.2 rounded border border-slate-900">Load: {dayCompanyHours.toFixed(1)}h</span>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {dayCompany.map(t => (
                <div 
                  key={t.id} 
                  className={`p-3.5 rounded-lg border flex justify-between items-center gap-4 transition-all duration-300 ${
                    t.status === 'completed' 
                      ? 'bg-[#06070d]/50 border-[#121424]/40 opacity-40 text-slate-500 line-through' 
                      : 'bg-[#151726]/80 border-[#222741] hover:border-blue-500/50 hover:shadow-[0_0_10px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleToggleTask(t.id)}
                      className="text-slate-555 hover:text-white transition-colors shrink-0"
                    >
                      {t.status === 'completed' ? (
                        <CheckCircle2 size={15} className="text-emerald-500" />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                    <span className="text-xs font-semibold leading-normal font-display text-slate-250">{t.title}</span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 select-none">
                    {t.timeOfDay && (
                      <span className="text-[9px] text-blue-400 font-bold font-mono flex items-center gap-0.5">
                        <Clock size={9} />
                        {t.timeOfDay}
                      </span>
                    )}
                    <span className="text-[9px] px-1.5 py-0.2 rounded border border-[#222741] bg-slate-950 text-slate-400 font-medium font-mono">
                      {t.estimatedTime}h
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase font-mono ${
                      t.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                      t.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-405 border border-yellow-500/20' : 
                      'bg-slate-800/40 text-slate-400 border border-slate-700/20'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              ))}
              {dayCompany.length === 0 && (
                <p className="text-slate-600 text-xs italic py-4 text-center select-none bg-[#090a10]/50 rounded border border-[#1a1c2e]/60 leading-relaxed">No corporate deliverables scheduled.</p>
              )}
            </div>
          </div>

          {/* Column 2: Personal Growth & Study Sub-Card Panel */}
          <div className="flex flex-col gap-3.5 bg-[#0b0c15]/60 border border-[#222741]/40 rounded-xl p-4 transition-all hover:border-indigo-500/40 hover:shadow-[inset_0_0_15px_rgba(99,102,241,0.03)]">
            <div className="border-l-2 border-l-indigo-500 pl-2 pb-0.5 flex justify-between items-center select-none mb-1">
              <div className="flex items-center gap-2">
                <Target size={12} className="text-indigo-400" />
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest font-display">
                  Personal Growth & Study
                </h4>
              </div>
              <span className="text-[8px] font-mono text-slate-500 font-bold uppercase bg-slate-950 px-1.5 py-0.2 rounded border border-slate-900">Load: {dayPersonalHours.toFixed(1)}h</span>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {dayPersonal.map(t => (
                <div 
                  key={t.id} 
                  className={`p-3.5 rounded-lg border flex justify-between items-center gap-4 transition-all duration-300 ${
                    t.status === 'completed' 
                      ? 'bg-[#06070d]/50 border-[#121424]/40 opacity-40 text-slate-500 line-through' 
                      : 'bg-[#151726]/80 border-[#222741] hover:border-indigo-500/50 hover:shadow-[0_0_10px_rgba(99,102,241,0.15)] hover:-translate-y-0.5 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleToggleTask(t.id)}
                      className="text-slate-555 hover:text-white transition-colors shrink-0"
                    >
                      {t.status === 'completed' ? (
                        <CheckCircle2 size={15} className="text-emerald-500" />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                    <span className="text-xs font-semibold leading-normal font-display text-slate-250">{t.title}</span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 select-none">
                    {t.timeOfDay && (
                      <span className="text-[9px] text-indigo-405 font-bold font-mono flex items-center gap-0.5">
                        <Clock size={9} />
                        {t.timeOfDay}
                      </span>
                    )}
                    <span className="text-[9px] px-1.5 py-0.2 rounded border border-[#222741] bg-slate-950 text-slate-400 font-medium font-mono">
                      {t.estimatedTime * 60}m
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase font-mono ${
                      t.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                      t.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-405 border border-yellow-500/20' : 
                      'bg-slate-800/40 text-slate-400 border border-slate-700/20'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              ))}
              {dayPersonal.length === 0 && (
                <p className="text-slate-600 text-xs italic py-4 text-center select-none bg-[#090a10]/50 rounded border border-[#1a1c2e]/60 leading-relaxed">No study blocks planned.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  // Render helper for a single collapsible Weekly Card
  const renderWeeklyCard = (weekKey: string, group: { weekNum: number; monthName: string; year: number; dates: string[] }) => {
    const isExpanded = !!expandedWeeks[weekKey];
    
    let weekTasksCount = 0;
    let weekHours = 0;
    let weekCompleted = 0;
    
    group.dates.forEach(date => {
      const dayTasks = filteredTasks.filter(t => t.deadline === date);
      weekTasksCount += dayTasks.length;
      weekHours += dayTasks.reduce((sum, t) => sum + t.estimatedTime, 0);
      weekCompleted += dayTasks.filter(t => t.status === 'completed').length;
    });

    return (
      <div key={weekKey} className="flex flex-col gap-4">
        
        {/* Weekly Card Header */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            toggleWeek(weekKey);
          }}
          className={`glass-panel p-4 bg-[#0a0b15] hover:bg-[#111324] border border-[#222741] hover:border-indigo-500/50 hover:shadow-[0_0_18px_rgba(99,102,241,0.2)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none flex justify-between items-center ${
            isExpanded ? 'border-b-indigo-500/50 bg-[#0d0e1b] shadow-[0_4px_12px_rgba(0,0,0,0.3)]' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 transition-transform duration-305 ${
              isExpanded ? 'rotate-90 text-indigo-305 bg-indigo-950/40' : ''
            }`}>
              <ChevronRight size={14} />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-white font-display">
                Week {group.weekNum} of {group.monthName}, {group.year}
              </span>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase font-bold">
                {group.dates.length} Days Scheduled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono font-bold select-none text-right">
            <span className="text-slate-400 text-[10px] hidden sm:inline text-slate-450">
              {weekCompleted}/{weekTasksCount} Done
            </span>
            <span className="bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded text-indigo-400 text-[10px]">
              Load: {weekHours.toFixed(1)}h
            </span>
            <span className="text-indigo-405 hover:text-indigo-300 text-[9.5px] uppercase font-display tracking-wider flex items-center gap-1.5 transition-colors bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-900/30 px-2 py-1 rounded-md">
              {isExpanded ? (
                <>
                  <EyeOff size={11} className="animate-pulse" />
                  <span>Hide Week</span>
                </>
              ) : (
                <>
                  <Eye size={11} />
                  <span>Show Week</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Day blocks inside week */}
        {isExpanded && (
          <div className="flex flex-col gap-5 pl-4 border-l border-indigo-500/20 transition-all duration-300">
            {group.dates.map(date => renderDayBlock(date))}
          </div>
        )}

      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Daily Schedule Coordination</h2>
          <p className="text-xs text-slate-555 mt-0.5">Balancing corporate Teams deliverables with developer learning tracks.</p>
        </div>
        
        {/* Date Filter selector tabs */}
        <div className="flex bg-slate-900 border border-brand-border rounded-lg p-1 select-none text-xs">
          {(['today', '7days', 'month'] as const).map(filter => (
            <button 
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1.5 rounded-md font-bold font-display tracking-wider uppercase transition-all ${
                timeFilter === filter ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-405 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* DYNAMIC HIERARCHICAL SCHEDULE VIEWS */}
      <div className="flex flex-col gap-6">
        
        {/* VIEW 1: MONTH FILTER (collapsible Month -> collapsible Week -> Days) */}
        {timeFilter === 'month' && (
          <div className="flex flex-col gap-5">
            {Object.keys(groupedMonths).map(monthKey => {
              const monthData = groupedMonths[monthKey];
              const isMonthExpanded = !!expandedMonths[monthKey];
              
              // Calculate Month metrics
              let monthTasksCount = 0;
              let monthHours = 0;
              let monthCompleted = 0;
              let monthDaysCount = 0;

              Object.keys(monthData.weeks).forEach(wkKey => {
                const wk = monthData.weeks[wkKey];
                monthDaysCount += wk.dates.length;
                wk.dates.forEach(date => {
                  const dayTasks = filteredTasks.filter(t => t.deadline === date);
                  monthTasksCount += dayTasks.length;
                  monthHours += dayTasks.reduce((sum, t) => sum + t.estimatedTime, 0);
                  monthCompleted += dayTasks.filter(t => t.status === 'completed').length;
                });
              });

              return (
                <div key={monthKey} className="flex flex-col gap-4">
                  
                  {/* Collapsible Month Card Header */}
                  <div 
                    onClick={() => toggleMonth(monthKey)}
                    className={`glass-panel p-5 bg-[#0e0f17] hover:bg-[#151726] border border-[#1e2238] hover:border-indigo-500/60 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none flex justify-between items-center border-l-4 border-l-indigo-600`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 transition-transform duration-300 ${
                        isMonthExpanded ? 'rotate-90' : ''
                      }`}>
                        <Calendar size={15} />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-bold text-white font-display uppercase tracking-wider">
                          {monthData.monthName} {monthData.year}
                        </span>
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase font-bold">
                          {monthDaysCount} Days Scheduled in Month
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono font-bold select-none text-right">
                      <span className="text-slate-400 text-[10px] hidden sm:inline text-slate-450">
                        {monthCompleted}/{monthTasksCount} Tasks Completed
                      </span>
                      <span className="bg-indigo-950/60 border border-indigo-900/40 px-2.5 py-0.5 rounded text-indigo-305 text-[10px]">
                        Load: {monthHours.toFixed(1)}h
                      </span>
                      <span className="text-indigo-400 hover:text-indigo-305 text-[9.5px] uppercase font-display tracking-wider flex items-center gap-1.5 transition-colors bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-900/30 px-2.5 py-1 rounded-md">
                        {isMonthExpanded ? (
                          <>
                            <EyeOff size={11} className="animate-pulse" />
                            <span>Hide Month</span>
                          </>
                        ) : (
                          <>
                            <Eye size={11} />
                            <span>Show Month</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Weeks list inside Month */}
                  {isMonthExpanded && (
                    <div className="flex flex-col gap-4 pl-4 border-l border-indigo-500/10 transition-all duration-300">
                      {Object.keys(monthData.weeks).map(weekKey => 
                        renderWeeklyCard(weekKey, monthData.weeks[weekKey])
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: 7DAYS FILTER (collapsible Week -> Days) */}
        {timeFilter === '7days' && (
          <div className="flex flex-col gap-5">
            {Object.keys(groupedWeeksDirect).map(weekKey => 
              renderWeeklyCard(weekKey, groupedWeeksDirect[weekKey])
            )}
          </div>
        )}

        {/* VIEW 3: TODAY FILTER (Flat Day Card list directly) */}
        {timeFilter === 'today' && (
          <div className="flex flex-col gap-5">
            {uniqueDates.map(date => renderDayBlock(date))}
          </div>
        )}

        {uniqueDates.length === 0 && (
          <div className="glass-panel p-10 text-center flex flex-col items-center gap-3 bg-slate-900/10 border-slate-850 select-none">
            <Sparkles size={20} className="text-indigo-455" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">No Schedule Registered</h3>
            <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
              There are no sync tasks or focus blocks scheduled for the selected filter option ({timeFilter}).
            </p>
          </div>
        )}
      </div>

      {/* TODAY'S BALANCE SECTION */}
      {uniqueDates.length > 0 && (
        <div className="glass-panel p-5">
          <h3 className="text-xs font-bold font-display text-slate-400 uppercase tracking-widest mb-4 border-b border-brand-border pb-2.5 select-none">
            📊 Overall Allocation and Load Balancer
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            
            {/* Circular Rings */}
            <div className="flex justify-around md:col-span-2 gap-4">
              <ProgressRing 
                size={95} 
                strokeWidth={6} 
                progress={workCompletePercent} 
                colors={{ from: '#3b82f6', to: '#4f46e5' }}
                label="Work Load"
                gradientId="workRingG"
              />
              <ProgressRing 
                size={95} 
                strokeWidth={6} 
                progress={learnCompletePercent} 
                colors={{ from: '#4f46e5', to: '#06b6d4' }}
                label="Study Load"
                gradientId="studyRingG"
              />
              <ProgressRing 
                size={95} 
                strokeWidth={6} 
                progress={overallProductivity} 
                colors={{ from: '#10b981', to: '#059669' }}
                label="Daily Sync"
                gradientId="totalRingG"
              />
            </div>

            {/* Time Statistics */}
            <div className="text-xs space-y-2 border-l border-r border-brand-border/60 px-4">
              <div className="flex justify-between">
                <span className="text-slate-405 font-medium">💼 Work Focus:</span>
                <span className="font-bold text-white font-mono">{workHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450 font-medium">🎯 Study Focus:</span>
                <span className="font-bold text-white font-mono">{learnHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-455 font-medium">💤 Sleep Allocation:</span>
                <span className="font-bold text-white font-mono">{sleepHours}h</span>
              </div>
              <div className="flex justify-between border-t border-slate-900 pt-1.5">
                <span className="text-slate-400 font-bold font-display">Idle Buffer:</span>
                <span className="font-bold text-emerald-400 font-mono">{bufferHours.toFixed(1)}h</span>
              </div>
            </div>

            {/* Category counters */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-900/30 p-2 rounded border border-brand-border text-xs">
                <p className="text-[9px] text-slate-550 uppercase font-bold">Completed</p>
                <p className="text-sm font-bold font-display text-emerald-400">{completedCount}</p>
              </div>
              <div className="bg-slate-900/30 p-2 rounded border border-brand-border text-xs">
                <p className="text-[9px] text-slate-550 uppercase font-bold">Pending</p>
                <p className="text-sm font-bold font-display text-indigo-405">{pendingCount}</p>
              </div>
              <div className="bg-slate-900/30 p-2 rounded border border-brand-border text-xs">
                <p className="text-[9px] text-slate-550 uppercase font-bold">Overdue</p>
                <p className="text-sm font-bold font-display text-slate-500">{overdueCount}</p>
              </div>
              <div className="bg-slate-900/30 p-2 rounded border border-brand-border text-xs">
                <p className="text-[9px] text-slate-555 uppercase font-bold">Backlog</p>
                <p className="text-sm font-bold font-display text-slate-400">{backlogCount}</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default DailyPlan;
