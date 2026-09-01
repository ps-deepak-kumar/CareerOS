import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Target, Clock, CheckCircle2, Square, Sparkles, 
  ChevronRight, Calendar, Eye, EyeOff, Cpu, RefreshCw, Play, 
  Sliders, CalendarDays, Zap, ArrowRight, ShieldCheck, CheckCheck
} from 'lucide-react';
import { stateManager, getLocalDateString } from '../services/stateManager';
import { Task } from '../data/mockData';
import { ProgressRing } from '../components/ProgressRing';
import { showToast } from '../components/ToastContainer';

interface TimeBlock {
  time: string;
  title: string;
  category: 'work' | 'learning' | 'meeting' | 'break';
  duration: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  taskId?: string;
}

export const DailyPlan: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | 'month'>('today');
  const [viewMode, setViewMode] = useState<'blocks' | 'timeline'>('timeline');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});

  const refreshTasks = () => {
    setTasks(stateManager.getTasks());
  };

  useEffect(() => {
    refreshTasks();
    window.addEventListener('tasks-updated', refreshTasks);
    return () => window.removeEventListener('tasks-updated', refreshTasks);
  }, []);

  const handleToggleTask = (id: string) => {
    const updated = stateManager.toggleTaskCompleted(id);
    setTasks([...updated]);
  };

  const handleRunAiOptimizer = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Daily Planner Agent',
        action: 'optimize_schedule',
        status: 'success',
        message: 'Dynamic day schedule optimized: 6.5h company duty with 1.75h protected learning slot.',
        reasoning: 'Re-balanced meeting conflicts with Transformer study sessions to prevent cognitive fatigue.'
      });
      setIsOptimizing(false);
      showToast('AI Planner has optimized and protected your study blocks!', 'success');
    }, 1200);
  };

  const filterByTime = (task: Task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    
    const taskDate = new Date((task.deadline || getLocalDateString()) + 'T00:00:00');
    const taskTime = taskDate.getTime();
    
    if (timeFilter === 'today') {
      return (task.deadline || getLocalDateString()) === getLocalDateString();
    }
    
    const diffDays = (taskTime - todayTime) / (1000 * 60 * 60 * 24);
    
    if (timeFilter === '7days') {
      return diffDays >= -2 && diffDays <= 7;
    }
    
    if (timeFilter === 'month') {
      return diffDays >= -14 && diffDays <= 30;
    }
    
    return false;
  };

  const getMonthInfo = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const year = date.getFullYear();
    const monthName = date.toLocaleDateString(undefined, { month: 'long' });
    return { monthName, year, key: `${year}-${monthName}` };
  };

  const getWeekOfMonthAndYear = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const year = date.getFullYear();
    const monthName = date.toLocaleDateString(undefined, { month: 'long' });
    const weekNum = Math.ceil(day / 7);
    return { weekNum, monthName, year, key: `${year}-${monthName}-W${weekNum}` };
  };

  const filteredTasks = tasks.filter(filterByTime);
  const uniqueDates = Array.from(new Set(filteredTasks.map(t => t.deadline || getLocalDateString()))).sort();

  // Metrics
  const workTimeline = filteredTasks.filter(t => t.category === 'work');
  const learnTimeline = filteredTasks.filter(t => t.category === 'learning');

  const workHours = workTimeline.reduce((acc, curr) => acc + (curr.estimatedTime || 1), 0);
  const learnHours = learnTimeline.reduce((acc, curr) => acc + (curr.estimatedTime || 1), 0);
  const totalPlannedHours = workHours + learnHours;

  const completedWorkHours = workTimeline
    .filter(t => t.status === 'completed')
    .reduce((acc, curr) => acc + (curr.estimatedTime || 1), 0);
  const completedLearnHours = learnTimeline
    .filter(t => t.status === 'completed')
    .reduce((acc, curr) => acc + (curr.estimatedTime || 1), 0);

  const overallProductivity = totalPlannedHours 
    ? Math.round(((completedWorkHours + completedLearnHours) / totalPlannedHours) * 100) 
    : 0;

  // Timeline schedule blocks for today
  const timelineBlocks: TimeBlock[] = [
    { time: '09:30 AM - 10:30 AM', title: 'M365 Integration Sync Meeting', category: 'meeting', duration: '1h', status: 'completed' },
    { time: '11:00 AM - 01:00 PM', title: 'Fix authentication bug in gateway services', category: 'work', duration: '2h', status: 'completed', taskId: 'task-work-1' },
    { time: '01:00 PM - 02:00 PM', title: 'Lunch & Cognitive Rest Window', category: 'break', duration: '1h', status: 'completed' },
    { time: '02:00 PM - 04:30 PM', title: 'Complete MCP assignment implementation for dashboard', category: 'work', duration: '2.5h', status: 'in-progress', taskId: 'task-work-3' },
    { time: '04:30 PM - 05:30 PM', title: 'Perform peer code reviews for v2 pull request', category: 'work', duration: '1h', status: 'upcoming', taskId: 'task-work-2' },
    { time: '06:00 PM - 07:00 PM', title: 'Study Transformer Attention Mechanics & Dot Products', category: 'learning', duration: '1h', status: 'upcoming', taskId: 'task-learn-1' },
    { time: '07:15 PM - 08:00 PM', title: 'Complete MCP Client Development & JSON-RPC Protocol', category: 'learning', duration: '45m', status: 'upcoming', taskId: 'task-learn-2' },
    { time: '08:00 PM - 08:30 PM', title: 'Multi-Head Attention Diagnostic Assessment Quiz', category: 'learning', duration: '30m', status: 'upcoming', taskId: 'task-learn-3' }
  ];

  return (
    <div className="flex flex-col gap-6 w-full pb-12 font-sans text-zinc-700">
      
      {/* TOP HEADER */}
      <div className="glass-panel p-5 border border-zinc-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold font-sans text-zinc-900 tracking-tight">
              Daily Schedule & Strategic Planner
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-300 flex items-center gap-1">
              <Zap size={11} className="text-zinc-600" />
              AI Balanced
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Autonomous multi-agent scheduling that factors your Microsoft Teams obligations and protects deep learning focus blocks.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleRunAiOptimizer}
            disabled={isOptimizing}
            className="btn-primary flex items-center gap-2 py-2 px-4 text-xs font-bold uppercase tracking-wider shadow-md shadow-zinc-200"
          >
            <Sparkles size={13} className={isOptimizing ? 'animate-spin' : 'text-zinc-600'} />
            <span>{isOptimizing ? 'Balancing Schedule...' : 'AI Auto-Optimize'}</span>
          </button>
        </div>
      </div>

      {/* METRICS HUD ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 bg-zinc-100 border border-zinc-200 rounded-xl">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
            <span>Productivity Velocity</span>
            <span className="text-zinc-600">{overallProductivity}%</span>
          </div>
          <p className="text-xl font-bold text-zinc-900 mt-1 font-mono">{completedWorkHours + completedLearnHours}h / {totalPlannedHours}h</p>
          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-zinc-800 rounded-full transition-all" style={{ width: `${overallProductivity}%` }} />
          </div>
        </div>

        <div className="glass-panel p-4 bg-zinc-100 border border-zinc-200 rounded-xl">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-700 font-mono">
            <span>Corporate Work Load</span>
            <span className="text-zinc-600">{workHours}h</span>
          </div>
          <p className="text-xl font-bold text-zinc-900 mt-1 font-mono">{completedWorkHours}h Done</p>
          <p className="text-[10px] text-zinc-400 mt-1">M365 Teams & PR Reviews</p>
        </div>

        <div className="glass-panel p-4 bg-zinc-100 border border-zinc-200 rounded-xl">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-700 font-mono">
            <span>Protected Study</span>
            <span className="text-zinc-600">{learnHours}h</span>
          </div>
          <p className="text-xl font-bold text-zinc-900 mt-1 font-mono">{completedLearnHours}h Done</p>
          <p className="text-[10px] text-zinc-400 mt-1">University Syllabus Slot</p>
        </div>

        <div className="glass-panel p-4 bg-zinc-100 border border-zinc-200 rounded-xl">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-600 font-mono">
            <span>Cadence Status</span>
            <span className="text-zinc-600">Optimal</span>
          </div>
          <p className="text-xl font-bold text-zinc-900 mt-1 font-mono">Zero Overlaps</p>
          <p className="text-[10px] text-zinc-400 mt-1">AI Guardian Active</p>
        </div>
      </div>

      {/* TIMEFRAME & VIEW CONTROLS */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-200 pb-3">
        <div className="flex bg-white p-1 rounded-xl border border-zinc-200">
          <button
            onClick={() => setTimeFilter('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              timeFilter === 'today' ? 'bg-zinc-900 text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            ⚡ Today's Sprint
          </button>
          <button
            onClick={() => setTimeFilter('7days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              timeFilter === '7days' ? 'bg-zinc-900 text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            📅 7-Day Horizon
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              timeFilter === 'month' ? 'bg-zinc-900 text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            🗓️ Monthly Agenda
          </button>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-zinc-200 text-xs font-mono">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'timeline' ? 'bg-slate-800 text-zinc-900 font-bold' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            24h Timeline
          </button>
          <button
            onClick={() => setViewMode('blocks')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'blocks' ? 'bg-slate-800 text-zinc-900 font-bold' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Task Matrix
          </button>
        </div>
      </div>

      {/* ================= VIEW 1: 24-HOUR TIMELINE SCHEDULER ================= */}
      {viewMode === 'timeline' && timeFilter === 'today' && (
        <div className="glass-panel p-6 bg-zinc-100 border border-zinc-200 rounded-2xl shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
            <div>
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Clock size={15} className="text-zinc-700" />
                <span>Today's Time-Blocked Schedule Symphony</span>
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono">Sequential distribution of corporate duties and deep research</p>
            </div>
            <span className="text-[10px] font-mono text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded border border-zinc-300">
              8 Blocks Mapped
            </span>
          </div>

          <div className="space-y-3 mt-2">
            {timelineBlocks.map((block, idx) => {
              const isWork = block.category === 'work';
              const isLearning = block.category === 'learning';
              const isMeeting = block.category === 'meeting';
              const isBreak = block.category === 'break';

              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${
                    isBreak 
                      ? 'border-dashed border-zinc-200 bg-zinc-100 text-zinc-400'
                      : isLearning 
                        ? 'border-zinc-300 bg-zinc-100 hover:border-zinc-300 shadow-[0_0_12px_rgba(99,102,241,0.06)]'
                        : isMeeting
                          ? 'border-cyan-500/30 bg-zinc-100 hover:border-cyan-500/60'
                          : 'border-blue-500/30 bg-zinc-100 hover:border-blue-500/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg text-xs font-bold font-mono shrink-0 ${
                      isBreak ? 'bg-zinc-100 text-zinc-400' :
                      isLearning ? 'bg-zinc-100 text-zinc-700 border border-zinc-300' :
                      isMeeting ? 'bg-zinc-100 text-zinc-600 border border-cyan-500/30' :
                      'bg-zinc-100 text-zinc-700 border border-blue-500/30'
                    }`}>
                      {isLearning ? '🎯 Study' : isMeeting ? '🤝 Sync' : isBreak ? '☕ Rest' : '💼 Work'}
                    </div>

                    <div>
                      <span className="text-xs font-bold text-zinc-900 leading-snug block">{block.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{block.time} ({block.duration})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                      block.status === 'completed' ? 'bg-zinc-100 text-zinc-600 border-emerald-800/40' :
                      block.status === 'in-progress' ? 'bg-zinc-100 text-zinc-600 border-amber-800/40 animate-pulse' :
                      'bg-zinc-100 text-zinc-500 border-zinc-200'
                    }`}>
                      {block.status}
                    </span>

                    {block.taskId && (
                      <button
                        onClick={() => handleToggleTask(block.taskId!)}
                        className="text-zinc-500 hover:text-zinc-900 p-1"
                        title="Toggle Task Completion"
                      >
                        <CheckCircle2 size={16} className={block.status === 'completed' ? 'text-zinc-600' : 'text-slate-600'} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= VIEW 2: TASK MATRIX / MULTI-DAY VIEWS ================= */}
      {(viewMode === 'blocks' || timeFilter !== 'today') && (
        <div className="space-y-6">
          {uniqueDates.map(date => {
            const dayTasks = filteredTasks.filter(t => (t.deadline || getLocalDateString()) === date);
            const dayWork = dayTasks.filter(t => t.category === 'work');
            const dayLearn = dayTasks.filter(t => t.category === 'learning');

            const isToday = date === getLocalDateString();
            const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div 
                key={date}
                className={`glass-panel p-5 bg-zinc-100 border rounded-2xl flex flex-col gap-4 shadow-md ${
                  isToday ? 'border-zinc-300 border-l-4 border-l-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'border-zinc-200 border-l-4 border-l-slate-700'
                }`}
              >
                <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Calendar size={15} className={isToday ? 'text-zinc-700' : 'text-zinc-500'} />
                    <span className="text-xs font-bold text-zinc-900">{formattedDate}</span>
                    {isToday && (
                      <span className="text-[9px] font-bold font-mono text-zinc-700 bg-zinc-100 px-2 py-0.2 rounded border border-zinc-300 uppercase">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {dayTasks.length} Deliverables Scheduled
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Work List */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 font-mono">Office Duties ({dayWork.length})</p>
                    {dayWork.map((t, idx) => (
                      <div 
                        key={`${t.id}-${idx}`}
                        className={`p-3 rounded-xl border flex justify-between items-center gap-3 transition-all ${
                          t.status === 'completed' ? 'bg-zinc-50 border-zinc-200 text-zinc-400 line-through' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-200 text-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <button onClick={() => handleToggleTask(t.id)} className="text-zinc-400 hover:text-zinc-900">
                            {t.status === 'completed' ? <CheckCircle2 size={15} className="text-zinc-600" /> : <Square size={15} />}
                          </button>
                          <span className="text-xs font-semibold truncate">{t.title}</span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500 shrink-0">{t.estimatedTime}h</span>
                      </div>
                    ))}
                    {dayWork.length === 0 && <p className="text-xs text-slate-600 italic py-2">No work duties.</p>}
                  </div>

                  {/* Learning List */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 font-mono">Syllabus Study ({dayLearn.length})</p>
                    {dayLearn.map((t, idx) => (
                      <div 
                        key={`${t.id}-${idx}`}
                        className={`p-3 rounded-xl border flex justify-between items-center gap-3 transition-all ${
                          t.status === 'completed' ? 'bg-zinc-50 border-zinc-200 text-zinc-400 line-through' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 text-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <button onClick={() => handleToggleTask(t.id)} className="text-zinc-400 hover:text-zinc-900">
                            {t.status === 'completed' ? <CheckCircle2 size={15} className="text-zinc-600" /> : <Square size={15} />}
                          </button>
                          <span className="text-xs font-semibold truncate">{t.title}</span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-700 shrink-0">{Math.round(t.estimatedTime * 60)}m</span>
                      </div>
                    ))}
                    {dayLearn.length === 0 && <p className="text-xs text-slate-600 italic py-2">No study sessions.</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
export default DailyPlan;
