import React, { useState, useEffect } from 'react';
import { PageId } from '../components/Layout';
import { 
  ArrowLeft, Flame, Clock, Award, BookOpen, 
  HelpCircle, Code, Sparkles, TrendingUp, Trash2, AlertTriangle
} from 'lucide-react';
import { stateManager } from '../services/stateManager';
import { Goal } from '../data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface GoalDetailsProps {
  onNavigate: (page: PageId) => void;
  goalId: string;
  setSelectedCourseIdForDetails?: (id: string) => void;
}

export const GoalDetails: React.FC<GoalDetailsProps> = ({ onNavigate, goalId, setSelectedCourseIdForDetails }) => {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const goals = stateManager.getGoals();
    const found = goals.find(g => g.id === goalId) || goals[0];
    if (found) {
      setGoal(found);
    }
  }, [goalId]);

  if (!goal) {
    return <div className="text-center text-xs text-slate-500 py-10 italic">Loading goal data...</div>;
  }

  const handleInspectRoadmap = () => {
    if (!goal) return;
    const courses = stateManager.getCourses();
    const matched = courses.find(c => 
      c.title.toLowerCase().includes(goal.title.toLowerCase()) ||
      goal.title.toLowerCase().includes(c.title.toLowerCase()) ||
      (goal.category && c.title.toLowerCase().includes(goal.category.toLowerCase()))
    ) || courses[0];

    if (matched) {
      try {
        localStorage.setItem('career_os_active_course_id', matched.id);
      } catch {}
      if (setSelectedCourseIdForDetails) {
        setSelectedCourseIdForDetails(matched.id);
      }
    }
    onNavigate('roadmap');
  };

  const handleOpenCourseTextbook = () => {
    if (!goal) return;
    const courses = stateManager.getCourses();
    const matched = courses.find(c => 
      c.title.toLowerCase().includes(goal.title.toLowerCase()) ||
      goal.title.toLowerCase().includes(c.title.toLowerCase()) ||
      (goal.category && c.title.toLowerCase().includes(goal.category.toLowerCase()))
    ) || courses[0];

    if (matched && setSelectedCourseIdForDetails) {
      setSelectedCourseIdForDetails(matched.id);
    }
    onNavigate('course-details');
  };

  // Mock data for Recharts
  const activityHoursData = [
    { name: 'Mon', hours: 1.5 },
    { name: 'Tue', hours: 2.0 },
    { name: 'Wed', hours: 1.0 },
    { name: 'Thu', hours: 2.5 },
    { name: 'Fri', hours: 1.5 },
    { name: 'Sat', hours: 3.0 },
    { name: 'Sun', hours: 2.0 }
  ];

  const quizHistoryData = [
    { name: 'RNNs', score: 80 },
    { name: 'Embeddings', score: 90 },
    { name: 'Attention', score: 85 },
    { name: 'Self-Attention', score: 95 },
    { name: 'Multi-Head', score: 60 }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* BACK HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('goals')}
            className="p-2 rounded-lg bg-slate-950/40 border border-brand-border text-slate-400 hover:text-white hover:bg-slate-900 transition-all shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-bold font-mono">Syllabus Analytics</span>
            <h2 className="text-lg sm:text-xl font-bold font-display text-white mt-0.5">{goal.title}</h2>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 hover:border-red-500/50 text-red-400 hover:text-red-300 text-xs font-mono transition-colors self-end sm:self-auto"
        >
          <Trash2 size={13} />
          <span>Remove Goal</span>
        </button>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 flex items-center gap-3">
          <div className="p-2 rounded bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 shrink-0">
            <BookOpen size={14} />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-semibold">Topics Covered</p>
            <p className="text-sm font-bold text-white mt-0.5 font-display">12 Completed</p>
            <p className="text-[9px] text-slate-550">5 Syllabus left</p>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3">
          <div className="p-2 rounded bg-blue-500/5 text-blue-400 border border-blue-500/10 shrink-0">
            <HelpCircle size={14} />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-semibold">Assessments Taken</p>
            <p className="text-sm font-bold text-white mt-0.5 font-display">8 Quizzes</p>
            <p className="text-[9px] text-slate-550">Avg accuracy: 82%</p>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3">
          <div className="p-2 rounded bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 shrink-0">
            <Code size={14} />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-semibold">Labs Completed</p>
            <p className="text-sm font-bold text-white mt-0.5 font-display">3 Projects</p>
            <p className="text-[9px] text-slate-555">1 Capstone active</p>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3">
          <div className="p-2 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
            <Flame size={14} />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-semibold">Study Duration</p>
            <p className="text-sm font-bold text-white mt-0.5 font-display">24 Sessions</p>
            <p className="text-[9px] text-slate-550">14 Days current streak</p>
          </div>
        </div>

      </div>

      {/* TABS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ABOUT */}
        <div className="glass-panel p-5 flex flex-col gap-5 lg:col-span-1 h-fit">
          <h3 className="text-xs font-bold font-display text-white border-b border-brand-border pb-2.5 uppercase tracking-wider">
            Objective Scope
          </h3>
          
          <div className="flex flex-col gap-3 text-xs leading-relaxed">
            <div>
              <p className="text-slate-500 font-medium">Description</p>
              <p className="text-slate-300 mt-1">{goal.description}</p>
            </div>
            
            <div className="border-t border-brand-border/60 pt-3">
              <p className="text-slate-550 font-bold uppercase tracking-wider text-[9px] font-display">Expected Outcomes</p>
              <p className="text-slate-300 mt-1">{goal.expectedOutcome || "Deliver deployable configurations demonstrating core skill indices."}</p>
            </div>

            <div className="border-t border-brand-border/60 pt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 font-medium font-display text-[9px] uppercase tracking-wider">Baseline</p>
                <p className="text-slate-300 mt-0.5 font-bold uppercase font-mono">{goal.currentLevel}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium font-display text-[9px] uppercase tracking-wider">Target</p>
                <p className="text-indigo-400 mt-0.5 font-bold uppercase font-mono">{goal.targetLevel}</p>
              </div>
            </div>

            <div className="border-t border-brand-border/60 pt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 font-medium">Allotment</p>
                <p className="text-slate-350 mt-0.5">{goal.studyTimePreference || "1 hour/day"}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Format</p>
                <p className="text-slate-350 mt-0.5">{goal.learningStylePreference || "Mixed"}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-3">
            <button
              onClick={handleInspectRoadmap}
              className="btn-accent text-xs w-full flex items-center justify-center gap-1.5 py-2.5 font-bold uppercase tracking-wider font-display"
            >
              <Sparkles size={13} />
              <span>Inspect Skill Roadmap</span>
            </button>

            <button
              onClick={handleOpenCourseTextbook}
              className="btn-secondary text-xs w-full flex items-center justify-center gap-1.5 py-2.5 font-bold uppercase tracking-wider font-display text-indigo-300 border border-indigo-900/40 hover:text-white"
            >
              <BookOpen size={13} />
              <span>Open Course Textbook</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: CHARTS */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Chart 1: Study hours */}
          <div className="glass-panel p-5">
            <div className="flex justify-between items-center mb-4 border-b border-brand-border pb-2.5">
              <h3 className="text-xs font-bold font-display text-white flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp size={14} className="text-indigo-400" />
                <span>Study Activity Log (Hours)</span>
              </h3>
              <span className="text-[9px] text-slate-550 font-mono font-semibold uppercase">Weekly Sync</span>
            </div>
            
            <div className="h-56 w-full text-[10px] font-mono select-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityHoursData}>
                  <defs>
                    <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#12131c" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#475569" />
                  <YAxis stroke="#475569" />
                  <Tooltip contentStyle={{ backgroundColor: '#0d0e15', borderColor: 'rgba(255,255,255,0.04)', borderRadius: '6px' }} />
                  <Area type="monotone" dataKey="hours" stroke="#4f46e5" fillOpacity={1} fill="url(#hoursGradient)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Quiz Accuracy */}
          <div className="glass-panel p-5">
            <div className="flex justify-between items-center mb-4 border-b border-brand-border pb-2.5">
              <h3 className="text-xs font-bold font-display text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Award size={14} className="text-blue-400" />
                <span>Assessment Performance Accuracy (%)</span>
              </h3>
              <span className="text-[9px] text-slate-555 font-mono font-semibold uppercase">Passing: 75%</span>
            </div>

            <div className="h-56 w-full text-[10px] font-mono select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizHistoryData}>
                  <CartesianGrid stroke="#12131c" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#475569" />
                  <YAxis stroke="#475569" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d0e15', borderColor: 'rgba(255,255,255,0.04)', borderRadius: '6px' }} />
                  <Bar dataKey="score" fill="#3b82f6" radius={[3, 3, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-900/50">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display">Remove Goal & Unlink Everywhere?</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Cascading purge across CareerOS</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-white">"{goal.title}"</strong>? 
              This will automatically unlink its textbook chapters, roadmap milestones, scheduled study blocks, and competency profile metrics.
            </p>

            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-xs font-mono text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  stateManager.removeGoal(goal.id);
                  onNavigate('goals');
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono transition-colors shadow-lg shadow-red-900/30"
              >
                Confirm Delete Everywhere
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default GoalDetails;
