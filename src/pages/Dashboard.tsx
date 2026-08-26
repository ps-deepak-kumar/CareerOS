import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Target, Sparkles, Plus, Play, CheckCircle2, Square, 
  Clock, Cpu, ChevronRight 
} from 'lucide-react';
import { PageId } from '../components/Layout';
import { stateManager, AgentLog } from '../services/stateManager';
import { Task, Goal, Course } from '../data/mockData';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
  setSelectedGoalIdForDetails: (id: string) => void;
  setSelectedCourseIdForDetails: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  setSelectedGoalIdForDetails,
  setSelectedCourseIdForDetails
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentLog, setRecentLog] = useState<AgentLog | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Form states for add task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'work' | 'learning'>('work');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskTime, setNewTaskTime] = useState(1);

  useEffect(() => {
    const refreshTasks = () => {
      setTasks(stateManager.getTasks());
    };
    refreshTasks();
    
    setGoals(stateManager.getGoals());
    setCourses(stateManager.getCourses());
    
    const logs = stateManager.getAgentLogs();
    if (logs.length > 0) {
      setRecentLog(logs[logs.length - 1]);
    }

    window.addEventListener('tasks-updated', refreshTasks);
    return () => window.removeEventListener('tasks-updated', refreshTasks);
  }, []);

  const handleToggleTask = (id: string) => {
    const updated = stateManager.toggleTaskCompleted(id);
    setTasks([...updated]);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    stateManager.addTask(newTaskTitle, newTaskCategory, newTaskPriority, newTaskTime);
    setTasks(stateManager.getTasks());
    setNewTaskTitle('');
    setShowAddTaskModal(false);
  };

  // Filter Tasks
  const workTasks = tasks.filter(t => t.category === 'work');
  const learnTasks = tasks.filter(t => t.category === 'learning');

  const completedWorkCount = workTasks.filter(t => t.status === 'completed').length;
  const workPercent = workTasks.length ? Math.round((completedWorkCount / workTasks.length) * 100) : 0;

  const completedLearnCount = learnTasks.filter(t => t.status === 'completed').length;
  const learnPercent = learnTasks.length ? Math.round((completedLearnCount / learnTasks.length) * 100) : 0;

  // Active Goal
  const activeGoal = goals.find(g => g.status === 'On Track') || goals[0];
  const activeCourse = courses[0];

  const handleGoalDetailsClick = (goalId: string) => {
    setSelectedGoalIdForDetails(goalId);
    onNavigate('goal-details');
  };

  const handleCourseClick = (courseId: string) => {
    setSelectedCourseIdForDetails(courseId);
    onNavigate('course-details');
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      
      {/* GREETING HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">Console Overview</h2>
          <p className="text-xs text-slate-550 mt-0.5">Welcome back, Deepak. Syncing local work parameters and syllabus roadmaps.</p>
        </div>
        
        {/* Quick Actions Panel */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button 
            onClick={() => onNavigate('set-goal')}
            className="btn-primary"
          >
            <Plus size={13} />
            <span>Configure Goal</span>
          </button>
          
          <button 
            onClick={() => setShowAddTaskModal(true)}
            className="btn-secondary"
          >
            <Plus size={13} />
            <span>Add Action Item</span>
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Work Tasks Progress */}
        <div className="glass-panel p-4 bg-slate-900/10 border-slate-800">
          <div className="flex justify-between items-center mb-2 text-[10px] font-bold font-display uppercase tracking-wider">
            <span className="text-blue-400">💼 M365 Planner Tasks</span>
            <span className="text-slate-400 font-mono">{completedWorkCount}/{workTasks.length} Completed</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${workPercent}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-bold text-white leading-none font-mono">{workPercent}%</span>
          </div>
        </div>

        {/* Learning Lessons Progress */}
        <div className="glass-panel p-4 bg-slate-900/10 border-slate-800">
          <div className="flex justify-between items-center mb-2 text-[10px] font-bold font-display uppercase tracking-wider">
            <span className="text-indigo-400">🎯 Learning Milestones</span>
            <span className="text-slate-400 font-mono">{completedLearnCount}/{learnTasks.length} Done</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${learnPercent}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-bold text-white leading-none font-mono">{learnPercent}%</span>
          </div>
        </div>

        {/* Career Goal Status */}
        <div className="glass-panel p-4 bg-slate-900/10 border-slate-800">
          {activeGoal ? (
            <>
              <div className="flex justify-between items-center mb-2 text-[10px] font-bold font-display uppercase tracking-wider">
                <span className="text-indigo-400">🔥 Current Syllabus</span>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/20 px-2 py-0.2 rounded border border-emerald-900/20">
                  {activeGoal.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white truncate w-40">{activeGoal.title}</span>
                <span className="text-sm font-bold text-white leading-none font-mono">{activeGoal.progress}%</span>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-550 italic">
              No active goals configured
            </div>
          )}
        </div>
      </div>

      {/* DUAL-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUMN A: COMPANY WORK */}
        <div className="glass-panel p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-brand-border pb-3">
            <h3 className="text-xs font-bold font-display text-white uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={14} className="text-blue-400" />
              <span>Microsoft Teams Tasks</span>
            </h3>
            <span className="text-[9px] text-blue-400 bg-blue-950/20 px-2 py-0.5 border border-blue-900/30 rounded font-semibold font-mono uppercase tracking-wider">
              Live Synced
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {workTasks.length > 0 ? (
              workTasks.map(t => (
                <div 
                  key={t.id} 
                  className={`p-3 rounded-lg border flex justify-between items-center gap-4 transition-all duration-200 ${
                    t.status === 'completed' 
                      ? 'bg-slate-900/10 border-slate-950/40 text-slate-500 line-through' 
                      : 'bg-slate-900/30 border-brand-border hover:border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleToggleTask(t.id)}
                      className="text-slate-500 hover:text-white transition-colors shrink-0"
                    >
                      {t.status === 'completed' ? (
                        <CheckCircle2 size={15} className="text-emerald-500" />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                    <span className="text-xs font-semibold leading-normal text-slate-300">{t.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {t.timeOfDay && (
                      <span className="text-[9px] text-slate-500 font-bold font-mono">{t.timeOfDay}</span>
                    )}
                    <span className="text-[9px] px-1.5 py-0.2 rounded border border-slate-800 bg-slate-950 text-slate-400 font-medium font-mono">
                      {t.estimatedTime}h
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      t.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/15' : 
                      t.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15' : 
                      'bg-slate-850 text-slate-400 border border-slate-800'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-xs italic py-4 text-center">No active work tasks found.</p>
            )}
          </div>
        </div>

        {/* COLUMN B: CAREER DEVELOPMENT */}
        <div className="glass-panel p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-brand-border pb-3">
            <h3 className="text-xs font-bold font-display text-white uppercase tracking-wider flex items-center gap-1.5">
              <Target size={14} className="text-indigo-400" />
              <span>Career Roadmap & Syllabus</span>
            </h3>
            {activeGoal && (
              <button 
                onClick={() => handleGoalDetailsClick(activeGoal.id)}
                className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 uppercase tracking-wider"
              >
                <span>Syllabus Analytics</span>
                <ChevronRight size={10} />
              </button>
            )}
          </div>

          {activeGoal && (
            <div className="p-3 bg-slate-900/30 border border-brand-border rounded-lg">
              <p className="text-[9px] text-indigo-400 uppercase tracking-widest font-bold font-mono">Focus Objective</p>
              <h4 className="text-xs font-bold text-white mt-0.5">{activeGoal.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal line-clamp-2">{activeGoal.description}</p>
            </div>
          )}

          {activeCourse && (
            <div 
              onClick={() => handleCourseClick(activeCourse.id)}
              className="p-3 border border-brand-border rounded-lg bg-slate-900/30 hover:bg-slate-900/50 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[9px] text-blue-400 font-bold uppercase font-mono">Active Module</p>
                  <h5 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors leading-snug">{activeCourse.title}</h5>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">{activeCourse.progress}% compile</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${activeCourse.progress}%` }} />
              </div>
              <div className="flex justify-between items-center mt-2 text-[9px] text-slate-550">
                <span className="truncate">Next: {activeCourse.currentChapter}</span>
                <span className="shrink-0 flex items-center gap-1 text-indigo-400 font-bold group-hover:underline uppercase tracking-wider">
                  <span>Open Textbook</span>
                  <Play size={8} fill="currentColor" />
                </span>
              </div>
            </div>
          )}

          {/* Today's Study agenda */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actionable Lessons</p>
            {learnTasks.length > 0 ? (
              learnTasks.map(t => (
                <div 
                  key={t.id}
                  className={`flex justify-between items-center p-2.5 rounded border ${
                    t.status === 'completed' 
                      ? 'bg-slate-900/10 border-slate-950/40 text-slate-500 line-through' 
                      : 'bg-slate-900/20 border-brand-border hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggleTask(t.id)}
                      className="text-slate-500 hover:text-white"
                    >
                      {t.status === 'completed' ? (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      ) : (
                        <Square size={14} />
                      )}
                    </button>
                    <span className="text-xs text-slate-300 font-semibold">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
                    {t.timeOfDay && <span>{t.timeOfDay}</span>}
                    <span className="bg-slate-950 px-1.5 py-0.2 rounded border border-slate-900 text-slate-400">{t.estimatedTime * 60}m</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-xs italic text-center py-2">No learning tasks scheduled.</p>
            )}
          </div>
        </div>
      </div>

      {/* LIVE AGENT MONITOR */}
      {recentLog && (
        <div className="glass-panel p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-2 border-l-indigo-500 bg-[#0d0e15]/40">
          <div className="flex gap-3">
            <div className="p-2 rounded bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 shrink-0">
              <Cpu size={14} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider font-mono">Agent Monitor: {recentLog.agent}</p>
              <p className="text-xs font-semibold text-slate-350 mt-0.5 leading-snug">{recentLog.message}</p>
              {recentLog.reasoning && (
                <p className="text-[9px] text-slate-500 mt-0.5 italic">Trace: {recentLog.reasoning}</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => onNavigate('dashboard')} // reload
            className="text-[9px] text-indigo-400 hover:underline shrink-0 font-semibold font-mono uppercase tracking-wider"
          >
            Open Inspector
          </button>
        </div>
      )}

      {/* ADD TASK MODAL POPUP */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-5 bg-[#0e0f17] border border-brand-border">
            <h3 className="text-sm font-bold font-display text-white mb-4">Create Action Item</h3>
            <form onSubmit={handleAddTaskSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-slate-400">Task Title</label>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement masked multi-head attention matrix"
                  className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/40"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <label className="text-slate-400">Work Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setNewTaskCategory('work')}
                    className={`py-2 rounded border font-semibold tracking-wider font-display uppercase transition-colors ${
                      newTaskCategory === 'work' 
                        ? 'border-blue-500 text-blue-400 bg-blue-950/20' 
                        : 'border-slate-800 text-slate-450 hover:border-slate-700 bg-slate-900/10'
                    }`}
                  >
                    💼 Office duty
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewTaskCategory('learning')}
                    className={`py-2 rounded border font-semibold tracking-wider font-display uppercase transition-colors ${
                      newTaskCategory === 'learning' 
                        ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20' 
                        : 'border-slate-800 text-slate-450 hover:border-slate-700 bg-slate-900/10'
                    }`}
                  >
                    🎯 Career study
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400">Priority</label>
                  <select 
                    value={newTaskPriority}
                    onChange={(e: any) => setNewTaskPriority(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400">Hours Estimate</label>
                  <input 
                    type="number" 
                    step="0.25"
                    min="0.25"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(parseFloat(e.target.value) || 1)}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4 text-xs">
                <button 
                  type="button" 
                  onClick={() => setShowAddTaskModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  Add Task
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
