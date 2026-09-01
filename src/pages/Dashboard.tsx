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
      return { text: 'Due Today', color: 'bg-zinc-100 text-zinc-600 border-rose-500/20' };
    }
    const today = new Date(todayStr);
    const target = new Date(deadlineStr);
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return { text: 'Due Tomorrow', color: 'bg-zinc-100 text-zinc-600 border-amber-500/20' };
    }
    if (diffDays <= 7) {
      return { text: `In ${diffDays} days`, color: 'bg-zinc-100 text-zinc-600 border-cyan-500/20' };
    }
    if (diffDays <= 30) {
      return { text: `In ${diffDays} days`, color: 'bg-zinc-100 text-zinc-700 border-zinc-300' };
    }
    return { text: deadlineStr, color: 'bg-zinc-100 text-zinc-500 border-zinc-200' };
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
    <div className="flex flex-col gap-6 w-full pb-10 font-sans text-zinc-700">
      
      {/* GREETING & COMMAND HEADER */}
      <div className="glass-panel p-5 border border-zinc-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-100/20 to-blue-500/10 border border-zinc-300 flex items-center justify-center shrink-0 shadow-inner">
            <Cpu className="w-6 h-6 text-zinc-700 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-zinc-900 tracking-tight">
                Console Overview & Strategic Horizons
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Symphony
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Welcome back, <span className="text-zinc-900 font-semibold">{profile?.name || 'Deepak'}</span>. AI agents have organized your daily, weekly, and monthly deliverables.
            </p>
          </div>
        </div>
        
        {/* Top Horizon Filters & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs w-full md:w-auto">
          {/* Horizon Switcher */}
          <div className="flex bg-white p-1 rounded-xl border border-zinc-200 shadow-card">
            {(['all', 'daily', 'weekly', 'monthly'] as HorizonTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveHorizon(tab)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeHorizon === tab
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {tab === 'all' ? '✨ All' : tab === 'daily' ? '⚡ Daily' : tab === 'weekly' ? '📅 Weekly' : '🗓️ Monthly'}
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
          <div className="glass-panel p-5 bg-zinc-100 border border-zinc-200 hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-100 rounded-full blur-2xl pointer-events-none group-hover:bg-zinc-100 transition-all" />
            
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-700">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-sans text-zinc-900 uppercase tracking-wider">Today's Focus Sprint</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-zinc-100 text-zinc-700 border border-zinc-300">
                  {completedTodayWork + completedTodayLearn}/{todayWorkTasks.length + todayLearnTasks.length} Done
                </span>
              </div>

              {/* Progress split */}
              <div className="space-y-3 mt-4">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold mb-1">
                    <span className="text-zinc-700 flex items-center gap-1">
                      <Briefcase size={12} />
                      <span>M365 Work Duties</span>
                    </span>
                    <span className="font-mono text-zinc-600">{completedTodayWork}/{todayWorkTasks.length} ({todayWorkPercent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                    <div className="h-full bg-zinc-700 rounded-full transition-all duration-500" style={{ width: `${todayWorkPercent}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold mb-1">
                    <span className="text-zinc-700 flex items-center gap-1">
                      <Target size={12} />
                      <span>Syllabus Study</span>
                    </span>
                    <span className="font-mono text-zinc-600">{completedTodayLearn}/{todayLearnTasks.length} ({todayLearnPercent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                    <div className="h-full bg-zinc-900 rounded-full transition-all duration-500" style={{ width: `${todayLearnPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-zinc-600 font-mono font-bold text-[11px]">
                <Flame size={14} className="text-zinc-600 animate-bounce" />
                <span>{streakDays} Day Streak</span>
              </div>
              <button 
                onClick={() => onNavigate('daily-plan')}
                className="text-[11px] font-bold text-zinc-700 hover:text-zinc-700 flex items-center gap-1 uppercase tracking-wider"
              >
                <span>Launch Day Plan</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* CARD 2: WEEKLY SPRINT & CONSISTENCY CARD */}
        {(activeHorizon === 'all' || activeHorizon === 'weekly') && (
          <div className="glass-panel p-5 bg-zinc-100 border border-zinc-200 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-100 rounded-full blur-2xl pointer-events-none group-hover:bg-zinc-100 transition-all" />

            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-zinc-100 border border-cyan-500/20 text-zinc-600">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-sans text-zinc-900 uppercase tracking-wider">Weekly Sprint</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">7-Day Horizon Cadence</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-zinc-100 text-zinc-600 border border-cyan-800/40">
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
                        ? 'border-zinc-300 bg-zinc-100 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                        : day.isActive
                          ? 'border-emerald-500/40 bg-zinc-100 text-zinc-600'
                          : 'border-zinc-200 bg-zinc-100 text-zinc-400'
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

              <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-3 font-mono">
                <span>Active Target: {weeklyActiveDaysCount}/7 Days</span>
                <span className="text-zinc-600 font-semibold">On Track</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between text-xs">
              <span className="text-[11px] text-zinc-500 font-mono">
                Weekly Horizon: <strong className="text-zinc-900">Sprint Track Active</strong>
              </span>
              <button 
                onClick={() => onNavigate('profile')}
                className="text-[11px] font-bold text-zinc-600 hover:text-zinc-600 flex items-center gap-1 uppercase tracking-wider"
              >
                <span>View Heatmap</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* CARD 3: MONTHLY ROADMAP & MASTERY CARD */}
        {(activeHorizon === 'all' || activeHorizon === 'monthly') && (
          <div className="glass-panel p-5 bg-zinc-100 border border-zinc-200 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-100 rounded-full blur-2xl pointer-events-none group-hover:bg-zinc-100 transition-all" />

            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-zinc-100 border border-emerald-500/20 text-zinc-600">
                    <Award size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-sans text-zinc-900 uppercase tracking-wider">Monthly Roadmap</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">{currentMonthName}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-zinc-100 text-zinc-600 border border-emerald-800/40">
                  {totalFocusHours}h Logged
                </span>
              </div>

              {/* Course Syllabus Progress Spotlight */}
              {activeCourse ? (
                <div className="mt-3 p-2.5 rounded-lg bg-zinc-100 border border-zinc-200">
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="text-zinc-900 font-bold truncate max-w-[180px]">{activeCourse.title}</span>
                    <span className="text-zinc-600 font-mono font-bold">{activeCourse.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-zinc-50 rounded-full" style={{ width: `${activeCourse.progress}%` }} />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 truncate">
                    Target: {activeCourse.currentChapter}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">No enrolled courses active.</p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between text-xs">
              <span className="text-[11px] text-zinc-500 font-mono">
                Active Days (2W): <strong className="text-zinc-900">{activeDays}d</strong>
              </span>
              <button 
                onClick={() => onNavigate('roadmap')}
                className="text-[11px] font-bold text-zinc-600 hover:text-zinc-600 flex items-center gap-1 uppercase tracking-wider"
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
        <div className="glass-panel p-5 border border-zinc-300 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-zinc-300 bg-zinc-50 shrink-0 relative group">
              <img 
                src={activeCourse.thumbnail} 
                alt={activeCourse.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-zinc-100 flex items-center justify-center">
                <BookOpen size={18} className="text-zinc-900" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                  {activeCourse.provider || 'University Track'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{activeCourse.difficulty} Level</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900 mt-1 leading-snug">{activeCourse.title}</h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                Current Focus: <span className="text-zinc-700 font-medium">{activeCourse.currentChapter}</span> ({activeCourse.completedLessons}/{activeCourse.totalLessons} Lessons)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Course Mastery</p>
              <p className="text-lg font-bold font-mono text-zinc-600 leading-none mt-0.5">{activeCourse.progress}%</p>
            </div>
            <button
              onClick={() => handleCourseClick(activeCourse.id)}
              className="btn-primary flex items-center gap-2 py-2.5 px-4 text-xs font-bold uppercase tracking-wider shadow-lg shadow-zinc-200"
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
        <div className="glass-panel p-5 reveal-up flex flex-col gap-4 bg-zinc-100 border border-zinc-200 shadow-md">
          
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-zinc-200 pb-3.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-zinc-100 border border-blue-500/20 text-zinc-700">
                  <Briefcase size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-sans text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>M365 Enterprise Tasks</span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono">Teams & Exchange Calendar Sync</p>
                </div>
              </div>
              
              <button 
                onClick={() => handleOpenAddTask('work')}
                className="flex items-center gap-1 text-[11px] font-bold text-zinc-700 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-100 border border-blue-800/40 px-2.5 py-1 rounded-lg transition-all"
              >
                <Plus size={12} />
                <span>Add Work</span>
              </button>
            </div>

            {/* Timeframe Horizons Selector for M365 Tasks */}
            <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
              <div className="flex bg-white p-1 rounded-lg border border-zinc-200">
                <button
                  onClick={() => setWorkTimeframe('today')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    workTimeframe === 'today' 
                      ? 'bg-blue-600 text-zinc-900 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  ⚡ Today ({allWorkTasks.filter(t => isTaskInTimeframe(t, 'today')).length})
                </button>
                <button
                  onClick={() => setWorkTimeframe('weekly')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    workTimeframe === 'weekly' 
                      ? 'bg-blue-600 text-zinc-900 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  📅 Weekly ({allWorkTasks.filter(t => isTaskInTimeframe(t, 'weekly')).length})
                </button>
                <button
                  onClick={() => setWorkTimeframe('monthly')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    workTimeframe === 'monthly' 
                      ? 'bg-blue-600 text-zinc-900 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  🗓️ Monthly ({allWorkTasks.filter(t => isTaskInTimeframe(t, 'monthly')).length})
                </button>
                <button
                  onClick={() => setWorkTimeframe('all')}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    workTimeframe === 'all' 
                      ? 'bg-blue-600 text-zinc-900 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-900'
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
                      workFilter === st ? 'bg-slate-800 text-zinc-700 font-bold border border-zinc-200' : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe Progress Bar */}
            <div className="bg-zinc-100 p-2 rounded-lg border border-zinc-200 flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">
                Horizon Load: <strong className="text-zinc-900">{workTimeframeDoneHours}h / {workTimeframeTotalHours}h</strong> ({workProgressPercent}%)
              </span>
              <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-700 rounded-full transition-all duration-500" style={{ width: `${workProgressPercent}%` }} />
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
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-400' 
                        : 'bg-zinc-50 border-zinc-200 hover:border-blue-500/40 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button 
                        onClick={() => handleToggleTask(t.id)}
                        className="text-zinc-400 hover:text-zinc-900 transition-colors shrink-0 p-0.5"
                        title={t.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                      >
                        {t.status === 'completed' ? (
                          <CheckCircle2 size={17} className="text-zinc-600" />
                        ) : (
                          <Square size={17} className="hover:text-zinc-700" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-semibold leading-normal block truncate ${t.status === 'completed' ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>
                          {t.title}
                        </span>
                        
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold border ${deadlineBadge.color}`}>
                            {deadlineBadge.text}
                          </span>
                          
                          {t.timeOfDay && (
                            <span className="text-[9px] text-zinc-400 font-mono flex items-center gap-1">
                              <Clock size={10} />
                              <span>{t.timeOfDay}</span>
                            </span>
                          )}

                          <span className="text-[9px] text-zinc-400 font-mono">
                            {t.source === 'teams' ? 'Teams' : 'Outlook'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-zinc-500 font-medium font-mono">
                        {t.estimatedTime}h
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        t.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        t.priority === 'medium' ? 'bg-zinc-100 text-zinc-600 border border-yellow-500/20' : 
                        'bg-slate-800 text-zinc-500 border border-zinc-200'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 px-4 bg-zinc-100 rounded-xl border border-dashed border-zinc-200">
                <CheckCheck size={28} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-zinc-500">No {workTimeframe} work tasks matching filter.</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Click "+ Add Work" above to schedule tasks into this horizon.</p>
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMN B: TARGETED SYLLABUS TASKS ================= */}
        <div className="glass-panel p-5 reveal-up flex flex-col gap-4 bg-zinc-100 border border-zinc-200 shadow-md">
          
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-zinc-200 pb-3.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-700">
                  <Target size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-sans text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Targeted Syllabus Tasks</span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono">Curriculum Modules & Assessment Quizzes</p>
                </div>
              </div>
              
              <button 
                onClick={() => handleOpenAddTask('learning')}
                className="flex items-center gap-1 text-[11px] font-bold text-zinc-700 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-100 border border-zinc-300 px-2.5 py-1 rounded-lg transition-all"
              >
                <Plus size={12} />
                <span>Add Study</span>
              </button>
            </div>

            {/* Timeframe Horizons Selector for Syllabus Tasks */}
            <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
              <div className="flex bg-white p-1 rounded-lg border border-zinc-200">
                <button
                  onClick={() => setLearnTimeframe('today')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    learnTimeframe === 'today' 
                      ? 'bg-zinc-900 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  ⚡ Today ({allLearnTasks.filter(t => isTaskInTimeframe(t, 'today')).length})
                </button>
                <button
                  onClick={() => setLearnTimeframe('weekly')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    learnTimeframe === 'weekly' 
                      ? 'bg-zinc-900 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  📅 Weekly ({allLearnTasks.filter(t => isTaskInTimeframe(t, 'weekly')).length})
                </button>
                <button
                  onClick={() => setLearnTimeframe('monthly')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    learnTimeframe === 'monthly' 
                      ? 'bg-zinc-900 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  🗓️ Monthly ({allLearnTasks.filter(t => isTaskInTimeframe(t, 'monthly')).length})
                </button>
                <button
                  onClick={() => setLearnTimeframe('all')}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    learnTimeframe === 'all' 
                      ? 'bg-zinc-900 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-900'
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
                      learnFilter === st ? 'bg-slate-800 text-zinc-700 font-bold border border-zinc-200' : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe Progress Bar */}
            <div className="bg-zinc-100 p-2 rounded-lg border border-zinc-200 flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">
                Syllabus Study: <strong className="text-zinc-900">{learnTimeframeDoneHours}h / {learnTimeframeTotalHours}h</strong> ({learnProgressPercent}%)
              </span>
              <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-900 rounded-full transition-all duration-500" style={{ width: `${learnProgressPercent}%` }} />
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
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-400' 
                        : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button 
                        onClick={() => handleToggleTask(t.id)}
                        className="text-zinc-400 hover:text-zinc-900 transition-colors shrink-0 p-0.5"
                        title={t.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                      >
                        {t.status === 'completed' ? (
                          <CheckCircle2 size={17} className="text-zinc-600" />
                        ) : (
                          <Square size={17} className="hover:text-zinc-700" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-semibold leading-normal block truncate ${t.status === 'completed' ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>
                          {t.title}
                        </span>
                        
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold border ${deadlineBadge.color}`}>
                            {deadlineBadge.text}
                          </span>
                          
                          {t.timeOfDay && (
                            <span className="text-[9px] text-zinc-700/90 font-mono flex items-center gap-1">
                              <Clock size={10} />
                              <span>Slot: {t.timeOfDay}</span>
                            </span>
                          )}

                          <span className="text-[9px] text-zinc-400 font-mono">
                            {t.title.toLowerCase().includes('quiz') ? 'Assessment Quiz' : 'Curriculum Chapter'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200 text-[10px] text-zinc-700 font-mono">
                        {Math.round((t.estimatedTime || 1) * 60)} min
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        t.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        t.priority === 'medium' ? 'bg-zinc-100 text-zinc-600 border border-yellow-500/20' : 
                        'bg-slate-800 text-zinc-500 border border-zinc-200'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 px-4 bg-zinc-100 rounded-xl border border-dashed border-zinc-200">
                <CheckCheck size={28} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-zinc-500">No {learnTimeframe} study tasks matching filter.</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Click "+ Add Study" above to schedule tasks into this horizon.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* LIVE AGENT MONITOR */}
      {recentLog && (
        <div className="glass-panel p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-indigo-500 bg-zinc-100 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-300 shrink-0">
              <Cpu size={16} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-700 font-bold uppercase tracking-wider font-mono">
                  Autonomous Agent: {recentLog.agent}
                </span>
                <span className="text-[9px] text-zinc-400 font-mono">{recentLog.timestamp}</span>
              </div>
              <p className="text-xs font-semibold text-zinc-600 mt-0.5 leading-snug">{recentLog.message}</p>
              {recentLog.reasoning && (
                <p className="text-[10px] text-zinc-500 mt-0.5 italic">Cognitive Trace: {recentLog.reasoning}</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => refreshData()}
            className="text-[10px] font-bold text-zinc-700 hover:text-zinc-700 shrink-0 uppercase tracking-wider border border-zinc-300 hover:border-zinc-300 px-3 py-1.5 rounded-lg bg-zinc-100 transition-all font-mono flex items-center gap-1.5"
          >
            <RefreshCw size={11} />
            <span>Sync Grid</span>
          </button>
        </div>
      )}

      {/* CREATE TASK POPUP MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 bg-white border border-zinc-200 shadow-2xl rounded-2xl">
            <h3 className="text-sm font-bold font-sans text-zinc-900 mb-4 flex items-center gap-2">
              <Plus size={16} className="text-zinc-700" />
              <span>Create Strategic Action Item</span>
            </h3>
            <form onSubmit={handleAddTaskSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-zinc-500 font-semibold">Action Title</label>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement multi-head attention matrix projections"
                  className="bg-zinc-100 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder-slate-500 focus:outline-none focus:border-zinc-300"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-zinc-500 font-semibold">Category Track</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setNewTaskCategory('work')}
                    className={`py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-colors ${
                      newTaskCategory === 'work' 
                        ? 'border-blue-500 text-zinc-700 bg-zinc-100' 
                        : 'border-zinc-200 text-zinc-500 hover:border-zinc-200 bg-zinc-50'
                    }`}
                  >
                    💼 Office Duty
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewTaskCategory('learning')}
                    className={`py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-colors ${
                      newTaskCategory === 'learning' 
                        ? 'border-zinc-300 text-zinc-700 bg-zinc-100' 
                        : 'border-zinc-200 text-zinc-500 hover:border-zinc-200 bg-zinc-50'
                    }`}
                  >
                    🎯 Study Milestone
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-500 font-semibold">Priority</label>
                  <select 
                    value={newTaskPriority}
                    onChange={(e: any) => setNewTaskPriority(e.target.value)}
                    className="bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-300"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-500 font-semibold">Estimate (Hours)</label>
                  <input 
                    type="number" 
                    step="0.25"
                    min="0.25"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(parseFloat(e.target.value) || 1)}
                    className="bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-500 font-semibold">Deadline Target</label>
                  <input 
                    type="date"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-300 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-500 font-semibold">Time of Day (Optional)</label>
                  <input 
                    type="text" 
                    value={newTaskTimeOfDay}
                    onChange={(e) => setNewTaskTimeOfDay(e.target.value)}
                    placeholder="e.g. 2:00 PM"
                    className="bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-slate-500 focus:outline-none focus:border-zinc-300 font-mono"
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
