import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, Target, Sparkles, Plus, Play, CheckCircle2, Square, 
  Clock, Cpu, ChevronRight, Calendar, CalendarDays, TrendingUp, 
  Flame, Zap, Award, Layers, ArrowUpRight, BarChart3, BookOpen,
  CheckCircle, Compass, ListTodo, ShieldCheck, Filter, Search,
  CheckCheck, AlertCircle, RefreshCw
} from 'lucide-react';
import { PageId } from '../components/Layout';
import { stateManager, AgentLog, getLocalDateString } from '../services/stateManager';
import { Task, Goal, Course, Profile } from '../data/mockData';
import { showToast } from '../components/ToastContainer';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
  setSelectedGoalIdForDetails: (id: string) => void;
  setSelectedCourseIdForDetails: (id: string) => void;
}

type HorizonTab = 'all' | 'daily' | 'weekly' | 'monthly';
type TaskTimeframe = 'today' | 'weekly' | 'monthly' | 'all';
type StatusFilter = 'all' | 'pending' | 'completed';

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  setSelectedGoalIdForDetails,
  setSelectedCourseIdForDetails
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentLog, setRecentLog] = useState<AgentLog | null>(null);
  const [activeHorizon, setActiveHorizon] = useState<HorizonTab>('all');
  
  // Tasks Section timeframe and filter states
  const [workTimeframe, setWorkTimeframe] = useState<TaskTimeframe>('today');
  const [learnTimeframe, setLearnTimeframe] = useState<TaskTimeframe>('today');
  const [workFilter, setWorkFilter] = useState<StatusFilter>('all');
  const [learnFilter, setLearnFilter] = useState<StatusFilter>('all');
  const [taskSearch, setTaskSearch] = useState('');

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [modalDefaultCategory, setModalDefaultCategory] = useState<'work' | 'learning'>('work');

  // Form states for add task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'work' | 'learning'>('work');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskTime, setNewTaskTime] = useState(1);
  const [newTaskDeadline, setNewTaskDeadline] = useState(getLocalDateString());
  const [newTaskTimeOfDay, setNewTaskTimeOfDay] = useState('');

  const refreshData = () => {
    setTasks(stateManager.getTasks());
    setGoals(stateManager.getGoals());
    setCourses(stateManager.getCourses());
    setProfile(stateManager.getProfile());
    const logs = stateManager.getAgentLogs();
    if (logs.length > 0) {
      setRecentLog(logs[logs.length - 1]);
    }
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('tasks-updated', refreshData);
    window.addEventListener('courses-updated', refreshData);
    window.addEventListener('goals-updated', refreshData);
    window.addEventListener('profile-updated', refreshData);
    window.addEventListener('heatmap-updated', refreshData);

    return () => {
      window.removeEventListener('tasks-updated', refreshData);
      window.removeEventListener('courses-updated', refreshData);
      window.removeEventListener('goals-updated', refreshData);
      window.removeEventListener('profile-updated', refreshData);
      window.removeEventListener('heatmap-updated', refreshData);
    };
  }, []);

  // Sync horizon filter with task tabs if user clicks global horizon
  useEffect(() => {
    if (activeHorizon === 'daily') {
      setWorkTimeframe('today');
      setLearnTimeframe('today');
    } else if (activeHorizon === 'weekly') {
      setWorkTimeframe('weekly');
      setLearnTimeframe('weekly');
    } else if (activeHorizon === 'monthly') {
      setWorkTimeframe('monthly');
      setLearnTimeframe('monthly');
    }
  }, [activeHorizon]);

  const handleToggleTask = (id: string) => {
    const updated = stateManager.toggleTaskCompleted(id);
    setTasks([...updated]);
    setProfile(stateManager.getProfile());
  };

  const handleOpenAddTask = (category: 'work' | 'learning') => {
    setModalDefaultCategory(category);
    setNewTaskCategory(category);
    setNewTaskDeadline(getLocalDateString());
    setShowAddTaskModal(true);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const added = stateManager.addTask(
      newTaskTitle, 
      newTaskCategory, 
      newTaskPriority, 
      newTaskTime, 
      newTaskTimeOfDay || undefined
    );

    // If deadline custom specified, update it
    if (newTaskDeadline) {
      const currentTasks = stateManager.getTasks();
      const idx = currentTasks.findIndex(t => t.id === added.id);
      if (idx !== -1) {
        currentTasks[idx].deadline = newTaskDeadline;
        stateManager.saveTasks(currentTasks);
      }
    }

    setTasks(stateManager.getTasks());
    setNewTaskTitle('');
    setNewTaskTimeOfDay('');
    setShowAddTaskModal(false);
    showToast(`Registered new ${newTaskCategory} task!`, 'success');
  };

  // Date constants
  const todayStr = getLocalDateString();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const sevenDaysLaterStr = getLocalDateString(sevenDaysLater);

  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  const thirtyDaysLaterStr = getLocalDateString(thirtyDaysLater);

  // Helper for deadline categorization
  const isTaskInTimeframe = (task: Task, timeframe: TaskTimeframe) => {
    const d = task.deadline || todayStr;
    if (timeframe === 'today') {
      return d <= todayStr;
    }
    if (timeframe === 'weekly') {
      return d <= sevenDaysLaterStr;
    }
    if (timeframe === 'monthly') {
      return d <= thirtyDaysLaterStr;
    }
    return true; // 'all'
  };

  // Helper for deadline badge display
  const getDeadlineBadge = (deadlineStr: string) => {
    if (!deadlineStr || deadlineStr <= todayStr) {
      return { text: 'Due Today', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    }
    const today = new Date(todayStr);
    const target = new Date(deadlineStr);
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return { text: 'Due Tomorrow', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
    if (diffDays <= 7) {
      return { text: `In ${diffDays} days`, color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
    }
    if (diffDays <= 30) {
      return { text: `In ${diffDays} days`, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
    }
    return { text: deadlineStr, color: 'bg-slate-800/60 text-slate-400 border-slate-700/60' };
  };

  // Filter Tasks by Category and Timeframe
  const allWorkTasks = tasks.filter(t => t.category === 'work');
  const allLearnTasks = tasks.filter(t => t.category === 'learning');

  const filteredWorkTasks = useMemo(() => {
    return allWorkTasks
      .filter(t => isTaskInTimeframe(t, workTimeframe))
      .filter(t => {
        if (workFilter === 'pending') return t.status !== 'completed';
        if (workFilter === 'completed') return t.status === 'completed';
        return true;
      })
      .filter(t => !taskSearch || t.title.toLowerCase().includes(taskSearch.toLowerCase()));
  }, [allWorkTasks, workTimeframe, workFilter, taskSearch]);

  const filteredLearnTasks = useMemo(() => {
    return allLearnTasks
      .filter(t => isTaskInTimeframe(t, learnTimeframe))
      .filter(t => {
        if (learnFilter === 'pending') return t.status !== 'completed';
        if (learnFilter === 'completed') return t.status === 'completed';
        return true;
      })
      .filter(t => !taskSearch || t.title.toLowerCase().includes(taskSearch.toLowerCase()));
  }, [allLearnTasks, learnTimeframe, learnFilter, taskSearch]);

  // Overall Statistics
  const todayWorkTasks = allWorkTasks.filter(t => isTaskInTimeframe(t, 'today'));
  const todayLearnTasks = allLearnTasks.filter(t => isTaskInTimeframe(t, 'today'));

  const completedTodayWork = todayWorkTasks.filter(t => t.status === 'completed').length;
  const todayWorkPercent = todayWorkTasks.length ? Math.round((completedTodayWork / todayWorkTasks.length) * 100) : 0;

  const completedTodayLearn = todayLearnTasks.filter(t => t.status === 'completed').length;
  const todayLearnPercent = todayLearnTasks.length ? Math.round((completedTodayLearn / todayLearnTasks.length) * 100) : 0;

  // Timeframe Hours Calculations
  const workTimeframeTotalHours = filteredWorkTasks.reduce((acc, t) => acc + (t.estimatedTime || 1), 0);
  const workTimeframeDoneHours = filteredWorkTasks.filter(t => t.status === 'completed').reduce((acc, t) => acc + (t.estimatedTime || 1), 0);
  const workCompletedCount = filteredWorkTasks.filter(t => t.status === 'completed').length;
  const workProgressPercent = filteredWorkTasks.length ? Math.round((workCompletedCount / filteredWorkTasks.length) * 100) : 0;

  const learnTimeframeTotalHours = filteredLearnTasks.reduce((acc, t) => acc + (t.estimatedTime || 1), 0);
  const learnTimeframeDoneHours = filteredLearnTasks.filter(t => t.status === 'completed').reduce((acc, t) => acc + (t.estimatedTime || 1), 0);
  const learnCompletedCount = filteredLearnTasks.filter(t => t.status === 'completed').length;
  const learnProgressPercent = filteredLearnTasks.length ? Math.round((learnCompletedCount / filteredLearnTasks.length) * 100) : 0;

  // Active Goal & Course
  const activeGoal = goals.find(g => g.status === 'On Track') || goals[0];
  const activeCourse = courses.find(c => !c.wishlist) || courses[0];

  const handleGoalDetailsClick = (goalId: string) => {
    setSelectedGoalIdForDetails(goalId);
    onNavigate('goal-details');
  };

  const handleCourseClick = (courseId: string) => {
    setSelectedCourseIdForDetails(courseId);
    onNavigate('course-details');
  };

  // Weekly pills calculation (Current week Monday - Sunday)
  const getWeeklyDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const days = [];
    const heatmap = profile?.heatmapActivity || {};

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = getLocalDateString(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const isActive = (heatmap[dateStr] || 0) > 0;
      const isToday = dateStr === todayStr;

      days.push({
        name: dayName,
        dateNum: dayNum,
        dateStr,
        isActive,
        isToday,
        score: heatmap[dateStr] || 0
      });
    }
    return days;
  };

  const weeklyDays = getWeeklyDays();
  const weeklyActiveDaysCount = weeklyDays.filter(d => d.isActive).length;
  const weeklyConsistencyPercent = Math.round((weeklyActiveDaysCount / 7) * 100);

  // Month stats
  const now = new Date();
  const currentMonthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const totalFocusHours = profile?.stats.learningHours || 24;
  const streakDays = profile?.stats.streakDays ?? 1;
  const activeDays = profile?.stats.activeDays ?? 4;

  return (
    <div className="flex flex-col gap-6 w-full pb-10 font-sans text-slate-200">
      
      {/* GREETING & COMMAND HEADER */}
      <div className="glass-panel p-6 bg-gradient-to-r from-slate-900/80 via-[#0c0e18]/90 to-slate-900/80 border border-brand-border flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Cpu className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">
                Console Overview & Strategic Horizons
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Symphony
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Welcome back, <span className="text-white font-semibold">{profile?.name || 'Deepak'}</span>. AI agents have organized your daily, weekly, and monthly deliverables.
            </p>
          </div>
        </div>
        
        {/* Top Horizon Filters & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs w-full md:w-auto">
          {/* Horizon Switcher */}
          <div className="flex bg-[#07080e] p-1 rounded-lg border border-brand-border/60">
            {(['all', 'daily', 'weekly', 'monthly'] as HorizonTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveHorizon(tab)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeHorizon === tab
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {tab === 'all' ? '✨ All Horizons' : tab === 'daily' ? '⚡ Daily' : tab === 'weekly' ? '📅 Weekly' : '🗓️ Monthly'}
              </button>
            ))}
          </div>

          <button 
            onClick={() => onNavigate('set-goal')}
            className="btn-primary flex items-center gap-1.5 py-2 px-3 text-xs"
          >
            <Plus size={13} />
            <span>New Goal</span>
          </button>
          
          <button 
            onClick={() => handleOpenAddTask('work')}
            className="btn-secondary flex items-center gap-1.5 py-2 px-3 text-xs"
          >
            <Plus size={13} />
            <span>Add Action</span>
          </button>
        </div>
      </div>

      {/* THREE TIME-HORIZON EXECUTIVE CARDS (DAILY, WEEKLY, MONTHLY) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* CARD 1: DAILY FOCUS CARD */}
        {(activeHorizon === 'all' || activeHorizon === 'daily') && (
          <div className="glass-panel p-5 bg-[#090b14]/70 border border-brand-border/80 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-all" />
            
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">Today's Focus Sprint</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-950/40 text-indigo-300 border border-indigo-800/40">
                  {completedTodayWork + completedTodayLearn}/{todayWorkTasks.length + todayLearnTasks.length} Done
                </span>
              </div>

              {/* Progress split */}
              <div className="space-y-3 mt-4">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold mb-1">
                    <span className="text-blue-400 flex items-center gap-1">
                      <Briefcase size={12} />
                      <span>M365 Work Duties</span>
                    </span>
                    <span className="font-mono text-slate-300">{completedTodayWork}/{todayWorkTasks.length} ({todayWorkPercent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/60">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${todayWorkPercent}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold mb-1">
                    <span className="text-indigo-400 flex items-center gap-1">
                      <Target size={12} />
                      <span>Syllabus Study</span>
                    </span>
                    <span className="font-mono text-slate-300">{completedTodayLearn}/{todayLearnTasks.length} ({todayLearnPercent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/60">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${todayLearnPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-brand-border/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-[11px]">
                <Flame size={14} className="text-orange-400 animate-bounce" />
                <span>{streakDays} Day Streak</span>
              </div>
              <button 
                onClick={() => onNavigate('daily-plan')}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-wider"
              >
                <span>Launch Day Plan</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* CARD 2: WEEKLY SPRINT & CONSISTENCY CARD */}
        {(activeHorizon === 'all' || activeHorizon === 'weekly') && (
          <div className="glass-panel p-5 bg-[#090b14]/70 border border-brand-border/80 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-all" />

            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">Weekly Sprint</h3>
                    <p className="text-[10px] text-slate-400 font-mono">7-Day Horizon Cadence</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                  {weeklyConsistencyPercent}% Velocity
                </span>
              </div>

              {/* 7-Day Interactive Day Pills */}
              <div className="grid grid-cols-7 gap-1.5 mt-3 py-1">
                {weeklyDays.map((day, idx) => (
                  <div 
                    key={idx}
                    className={`flex flex-col items-center justify-center py-2 rounded-lg border text-center transition-all ${
                      day.isToday
                        ? 'border-indigo-500 bg-indigo-500/15 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                        : day.isActive
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                          : 'border-slate-800/60 bg-slate-950/40 text-slate-500'
                    }`}
                    title={`${day.name} (${day.dateStr}): ${day.isActive ? 'Active Study Logged' : 'No Activity'}`}
                  >
                    <span className="text-[9px] font-bold uppercase font-mono">{day.name[0]}</span>
                    <span className="text-[11px] font-bold mt-0.5 font-mono">{day.dateNum}</span>
                    <div className="mt-1">
                      {day.isActive ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 font-mono">
                <span>Active Target: {weeklyActiveDaysCount}/7 Days</span>
                <span className="text-emerald-400 font-semibold">On Track</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-brand-border/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                Weekly Horizon: <strong className="text-white">Sprint Track Active</strong>
              </span>
              <button 
                onClick={() => onNavigate('profile')}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase tracking-wider"
              >
                <span>View Heatmap</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* CARD 3: MONTHLY ROADMAP & MASTERY CARD */}
        {(activeHorizon === 'all' || activeHorizon === 'monthly') && (
          <div className="glass-panel p-5 bg-[#090b14]/70 border border-brand-border/80 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />

            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Award size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">Monthly Roadmap</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{currentMonthName}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                  {totalFocusHours}h Logged
                </span>
              </div>

              {/* Course Syllabus Progress Spotlight */}
              {activeCourse ? (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-950/50 border border-brand-border/60">
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="text-white font-bold truncate max-w-[180px]">{activeCourse.title}</span>
                    <span className="text-emerald-400 font-mono font-bold">{activeCourse.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${activeCourse.progress}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 truncate">
                    Target: {activeCourse.currentChapter}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No enrolled courses active.</p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-brand-border/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                Active Days (2W): <strong className="text-white">{activeDays}d</strong>
              </span>
              <button 
                onClick={() => onNavigate('roadmap')}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 uppercase tracking-wider"
              >
                <span>Full Roadmap</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ACTIVE SYLLABUS & RAPID RESUME SPOTLIGHT */}
      {activeCourse && (
        <div className="glass-panel p-5 bg-gradient-to-r from-[#0c0e18] via-slate-900/60 to-[#0c0e18] border border-indigo-500/20 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-indigo-500/30 bg-slate-950 shrink-0 relative group">
              <img 
                src={activeCourse.thumbnail} 
                alt={activeCourse.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-indigo-900/30 flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                  {activeCourse.provider || 'University Track'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{activeCourse.difficulty} Level</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white mt-1 leading-snug">{activeCourse.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Current Focus: <span className="text-indigo-300 font-medium">{activeCourse.currentChapter}</span> ({activeCourse.completedLessons}/{activeCourse.totalLessons} Lessons)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Course Mastery</p>
              <p className="text-lg font-bold font-mono text-emerald-400 leading-none mt-0.5">{activeCourse.progress}%</p>
            </div>
            <button
              onClick={() => handleCourseClick(activeCourse.id)}
              className="btn-primary flex items-center gap-2 py-2.5 px-4 text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/20"
            >
              <Play size={12} fill="currentColor" />
              <span>Open Chapter Textbook</span>
            </button>
          </div>
        </div>
      )}

      {/* DUAL-TRACK WORKSPACE: CUSTOMIZED M365 TASKS & SYLLABUS TASKS WITH TIMEFRAME HORIZONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* ================= COLUMN A: M365 ENTERPRISE TASKS ================= */}
        <div className="glass-panel p-5 flex flex-col gap-4 bg-[#090a12]/85 border border-brand-border shadow-md">
          
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-brand-border/60 pb-3.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Briefcase size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>M365 Enterprise Tasks</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Teams & Exchange Calendar Sync</p>
                </div>
              </div>
              
              <button 
                onClick={() => handleOpenAddTask('work')}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-950/40 hover:bg-blue-900/40 border border-blue-800/40 px-2.5 py-1 rounded-lg transition-all"
              >
                <Plus size={12} />
                <span>Add Work</span>
              </button>
            </div>

            {/* Timeframe Horizons Selector for M365 Tasks */}
            <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
              <div className="flex bg-[#06070d] p-1 rounded-lg border border-brand-border/60">
                <button
                  onClick={() => setWorkTimeframe('today')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    workTimeframe === 'today' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Today ({allWorkTasks.filter(t => isTaskInTimeframe(t, 'today')).length})
                </button>
                <button
                  onClick={() => setWorkTimeframe('weekly')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    workTimeframe === 'weekly' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📅 Weekly ({allWorkTasks.filter(t => isTaskInTimeframe(t, 'weekly')).length})
                </button>
                <button
                  onClick={() => setWorkTimeframe('monthly')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    workTimeframe === 'monthly' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🗓️ Monthly ({allWorkTasks.filter(t => isTaskInTimeframe(t, 'monthly')).length})
                </button>
                <button
                  onClick={() => setWorkTimeframe('all')}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    workTimeframe === 'all' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 text-[10px] font-mono">
                {(['all', 'pending', 'completed'] as StatusFilter[]).map(st => (
                  <button
                    key={st}
                    onClick={() => setWorkFilter(st)}
                    className={`px-2 py-0.5 rounded capitalize ${
                      workFilter === st ? 'bg-slate-800 text-blue-300 font-bold border border-slate-700' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe Progress Bar */}
            <div className="bg-slate-950/60 p-2 rounded-lg border border-brand-border/40 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">
                Horizon Load: <strong className="text-white">{workTimeframeDoneHours}h / {workTimeframeTotalHours}h</strong> ({workProgressPercent}%)
              </span>
              <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${workProgressPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Task Items List */}
          <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredWorkTasks.length > 0 ? (
              filteredWorkTasks.map((t, idx) => {
                const deadlineBadge = getDeadlineBadge(t.deadline || todayStr);
                return (
                  <div 
                    key={`${t.id}-${idx}`} 
                    className={`p-3 rounded-xl border flex justify-between items-center gap-4 transition-all duration-200 ${
                      t.status === 'completed' 
                        ? 'bg-slate-900/10 border-slate-900/40 text-slate-500' 
                        : 'bg-slate-900/30 border-brand-border/70 hover:border-blue-500/40 text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button 
                        onClick={() => handleToggleTask(t.id)}
                        className="text-slate-500 hover:text-white transition-colors shrink-0 p-0.5"
                        title={t.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                      >
                        {t.status === 'completed' ? (
                          <CheckCircle2 size={17} className="text-emerald-500" />
                        ) : (
                          <Square size={17} className="hover:text-blue-400" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-semibold leading-normal block truncate ${t.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {t.title}
                        </span>
                        
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold border ${deadlineBadge.color}`}>
                            {deadlineBadge.text}
                          </span>
                          
                          {t.timeOfDay && (
                            <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                              <Clock size={10} />
                              <span>{t.timeOfDay}</span>
                            </span>
                          )}

                          <span className="text-[9px] text-slate-500 font-mono">
                            {t.source === 'teams' ? 'Teams' : 'Outlook'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded border border-slate-800 bg-slate-950 text-slate-400 font-medium font-mono">
                        {t.estimatedTime}h
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        t.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        t.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 px-4 bg-slate-950/20 rounded-xl border border-dashed border-brand-border/40">
                <CheckCheck size={28} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-400">No {workTimeframe} work tasks matching filter.</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Click "+ Add Work" above to schedule tasks into this horizon.</p>
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMN B: TARGETED SYLLABUS TASKS ================= */}
        <div className="glass-panel p-5 flex flex-col gap-4 bg-[#090a12]/85 border border-brand-border shadow-md">
          
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-brand-border/60 pb-3.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Target size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Targeted Syllabus Tasks</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Curriculum Modules & Assessment Quizzes</p>
                </div>
              </div>
              
              <button 
                onClick={() => handleOpenAddTask('learning')}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-800/40 px-2.5 py-1 rounded-lg transition-all"
              >
                <Plus size={12} />
                <span>Add Study</span>
              </button>
            </div>

            {/* Timeframe Horizons Selector for Syllabus Tasks */}
            <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
              <div className="flex bg-[#06070d] p-1 rounded-lg border border-brand-border/60">
                <button
                  onClick={() => setLearnTimeframe('today')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    learnTimeframe === 'today' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Today ({allLearnTasks.filter(t => isTaskInTimeframe(t, 'today')).length})
                </button>
                <button
                  onClick={() => setLearnTimeframe('weekly')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    learnTimeframe === 'weekly' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📅 Weekly ({allLearnTasks.filter(t => isTaskInTimeframe(t, 'weekly')).length})
                </button>
                <button
                  onClick={() => setLearnTimeframe('monthly')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    learnTimeframe === 'monthly' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🗓️ Monthly ({allLearnTasks.filter(t => isTaskInTimeframe(t, 'monthly')).length})
                </button>
                <button
                  onClick={() => setLearnTimeframe('all')}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    learnTimeframe === 'all' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 text-[10px] font-mono">
                {(['all', 'pending', 'completed'] as StatusFilter[]).map(st => (
                  <button
                    key={st}
                    onClick={() => setLearnFilter(st)}
                    className={`px-2 py-0.5 rounded capitalize ${
                      learnFilter === st ? 'bg-slate-800 text-indigo-300 font-bold border border-slate-700' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe Progress Bar */}
            <div className="bg-slate-950/60 p-2 rounded-lg border border-brand-border/40 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">
                Syllabus Study: <strong className="text-white">{learnTimeframeDoneHours}h / {learnTimeframeTotalHours}h</strong> ({learnProgressPercent}%)
              </span>
              <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${learnProgressPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Task Items List */}
          <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredLearnTasks.length > 0 ? (
              filteredLearnTasks.map((t, idx) => {
                const deadlineBadge = getDeadlineBadge(t.deadline || todayStr);
                return (
                  <div 
                    key={`${t.id}-${idx}`} 
                    className={`p-3 rounded-xl border flex justify-between items-center gap-4 transition-all duration-200 ${
                      t.status === 'completed' 
                        ? 'bg-slate-900/10 border-slate-900/40 text-slate-500' 
                        : 'bg-slate-900/30 border-brand-border/70 hover:border-indigo-500/40 text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button 
                        onClick={() => handleToggleTask(t.id)}
                        className="text-slate-500 hover:text-white transition-colors shrink-0 p-0.5"
                        title={t.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                      >
                        {t.status === 'completed' ? (
                          <CheckCircle2 size={17} className="text-emerald-500" />
                        ) : (
                          <Square size={17} className="hover:text-indigo-400" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-semibold leading-normal block truncate ${t.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {t.title}
                        </span>
                        
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold border ${deadlineBadge.color}`}>
                            {deadlineBadge.text}
                          </span>
                          
                          {t.timeOfDay && (
                            <span className="text-[9px] text-indigo-400/90 font-mono flex items-center gap-1">
                              <Clock size={10} />
                              <span>Slot: {t.timeOfDay}</span>
                            </span>
                          )}

                          <span className="text-[9px] text-slate-500 font-mono">
                            {t.title.toLowerCase().includes('quiz') ? 'Assessment Quiz' : 'Curriculum Chapter'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px] text-indigo-300 font-mono">
                        {Math.round((t.estimatedTime || 1) * 60)} min
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        t.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        t.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 px-4 bg-slate-950/20 rounded-xl border border-dashed border-brand-border/40">
                <CheckCheck size={28} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-400">No {learnTimeframe} study tasks matching filter.</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Click "+ Add Study" above to schedule tasks into this horizon.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* LIVE AGENT MONITOR */}
      {recentLog && (
        <div className="glass-panel p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-indigo-500 bg-[#0c0d16]/80 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Cpu size={16} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-mono">
                  Autonomous Agent: {recentLog.agent}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">{recentLog.timestamp}</span>
              </div>
              <p className="text-xs font-semibold text-slate-300 mt-0.5 leading-snug">{recentLog.message}</p>
              {recentLog.reasoning && (
                <p className="text-[10px] text-slate-400 mt-0.5 italic">Cognitive Trace: {recentLog.reasoning}</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => refreshData()}
            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 shrink-0 uppercase tracking-wider border border-indigo-500/30 hover:border-indigo-500 px-3 py-1.5 rounded-lg bg-indigo-950/20 transition-all font-mono flex items-center gap-1.5"
          >
            <RefreshCw size={11} />
            <span>Sync Grid</span>
          </button>
        </div>
      )}

      {/* CREATE TASK POPUP MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 bg-[#0c0d15] border border-brand-border shadow-2xl rounded-2xl">
            <h3 className="text-sm font-bold font-sans text-white mb-4 flex items-center gap-2">
              <Plus size={16} className="text-indigo-400" />
              <span>Create Strategic Action Item</span>
            </h3>
            <form onSubmit={handleAddTaskSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-slate-400 font-semibold">Action Title</label>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement multi-head attention matrix projections"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-slate-400 font-semibold">Category Track</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setNewTaskCategory('work')}
                    className={`py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-colors ${
                      newTaskCategory === 'work' 
                        ? 'border-blue-500 text-blue-400 bg-blue-950/30' 
                        : 'border-slate-800 text-slate-400 hover:border-slate-700 bg-slate-900/30'
                    }`}
                  >
                    💼 Office Duty
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewTaskCategory('learning')}
                    className={`py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-colors ${
                      newTaskCategory === 'learning' 
                        ? 'border-indigo-500 text-indigo-400 bg-indigo-950/30' 
                        : 'border-slate-800 text-slate-400 hover:border-slate-700 bg-slate-900/30'
                    }`}
                  >
                    🎯 Study Milestone
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold">Priority</label>
                  <select 
                    value={newTaskPriority}
                    onChange={(e: any) => setNewTaskPriority(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold">Estimate (Hours)</label>
                  <input 
                    type="number" 
                    step="0.25"
                    min="0.25"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(parseFloat(e.target.value) || 1)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold">Deadline Target</label>
                  <input 
                    type="date"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold">Time of Day (Optional)</label>
                  <input 
                    type="text" 
                    value={newTaskTimeOfDay}
                    onChange={(e) => setNewTaskTimeOfDay(e.target.value)}
                    placeholder="e.g. 2:00 PM"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4 text-xs">
                <button 
                  type="button" 
                  onClick={() => setShowAddTaskModal(false)}
                  className="btn-secondary py-2 px-4"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary py-2 px-4"
                >
                  Add Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default Dashboard;
