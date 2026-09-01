import React, { useState, useEffect } from 'react';
import { Target, Award, Flame, Clock, Plus, ChevronRight, Cpu, Sparkles, Terminal, Trophy, Trash2 } from 'lucide-react';
import { PageId } from '../components/Layout';
import { stateManager } from '../services/stateManager';
import { Goal } from '../data/mockData';

interface GoalsProps {
  onNavigate: (page: PageId) => void;
  setSelectedGoalIdForDetails: (id: string) => void;
  setSelectedCourseIdForDetails?: (id: string) => void;
}

export const Goals: React.FC<GoalsProps> = ({ onNavigate, setSelectedGoalIdForDetails, setSelectedCourseIdForDetails }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'paused' | 'overdue'>('all');

  useEffect(() => {
    const refreshGoals = () => setGoals(stateManager.getGoals());
    refreshGoals();
    window.addEventListener('goals-updated', refreshGoals);
    window.addEventListener('courses-updated', refreshGoals);
    window.addEventListener('goal-deleted', refreshGoals);
    window.addEventListener('course-deleted', refreshGoals);
    return () => {
      window.removeEventListener('goals-updated', refreshGoals);
      window.removeEventListener('courses-updated', refreshGoals);
      window.removeEventListener('goal-deleted', refreshGoals);
      window.removeEventListener('course-deleted', refreshGoals);
    };
  }, []);

  const handleViewGoal = (id: string) => {
    setSelectedGoalIdForDetails(id);
    onNavigate('goal-details');
  };

  const handleOpenRoadmapForGoal = (goal: Goal) => {
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

  const filteredGoals = goals.filter(g => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return g.status === 'On Track' || g.status === 'Behind';
    if (activeTab === 'completed') return g.status === 'Completed';
    if (activeTab === 'paused') return g.status === 'Paused';
    return false;
  });

  const getGoalIcon = (title: string, size: number = 14) => {
    const t = title.toLowerCase();
    if (t.includes('ai') || t.includes('neural') || t.includes('agent') || t.includes('engineer')) {
      return <Cpu size={size} className="text-zinc-700" />;
    }
    if (t.includes('rag') || t.includes('production') || t.includes('specialist') || t.includes('search')) {
      return <Sparkles size={size} className="text-zinc-600" />;
    }
    if (t.includes('kubernetes') || t.includes('devops') || t.includes('orchestration')) {
      return <Terminal size={size} className="text-zinc-700" />;
    }
    return <Target size={size} className="text-zinc-700" />;
  };

  const getGoalWatermark = (title: string, isCompleted: boolean) => {
    const t = title.toLowerCase();
    const size = 120;
    const colorClass = isCompleted 
      ? 'text-zinc-600/10' 
      : 'text-slate-800/20 group-hover:text-zinc-700/5 group-hover:scale-110';
    const cn = `transition-all duration-500 transform translate-x-3 translate-y-3 ${colorClass}`;
    
    if (isCompleted) {
      return <Trophy size={size} className={cn} />;
    }
    if (t.includes('ai') || t.includes('neural') || t.includes('agent') || t.includes('engineer')) {
      return <Cpu size={size} className={cn} />;
    }
    if (t.includes('rag') || t.includes('production') || t.includes('specialist') || t.includes('search')) {
      return <Sparkles size={size} className={cn} />;
    }
    if (t.includes('kubernetes') || t.includes('devops') || t.includes('orchestration')) {
      return <Terminal size={size} className={cn} />;
    }
    return <Target size={size} className={cn} />;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-zinc-900">Syllabus Cabinets</h2>
          <p className="text-xs text-zinc-500 mt-0.5 font-display">Configure and track long-term competency milestones mapped to active job gaps.</p>
        </div>
        
        <button 
          onClick={() => onNavigate('set-goal')}
          className="btn-primary text-xs"
        >
          <Plus size={13} />
          <span>Configure Syllabus</span>
        </button>
      </div>

      {/* CATEGORY TABS SELECTOR */}
      <div className="flex border-b border-zinc-200 text-xs gap-1 select-none overflow-x-auto pb-1">
        {(['all', 'active', 'completed', 'paused', 'overdue'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-bold font-display tracking-wider uppercase border-b-2 transition-all ${
              activeTab === tab 
                ? 'border-zinc-300 text-zinc-900' 
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* GOALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.length > 0 ? (
          filteredGoals.map(goal => {
            const isCompleted = goal.status === 'Completed';
            
            return (
              <div 
                key={goal.id} 
                className={`group p-5 flex flex-col justify-between min-h-[265px] relative transition-all duration-300 rounded-2xl border bg-white hover:bg-white overflow-hidden select-none hover:-translate-y-1 ${
                  isCompleted 
                    ? 'border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] shadow-md' 
                    : 'border-zinc-200 hover:border-zinc-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] shadow-md'
                }`}
              >
                {/* Background Watermark Icon */}
                <div className="absolute right-[-10px] bottom-[-10px] select-none pointer-events-none z-0">
                  {getGoalWatermark(goal.title, isCompleted)}
                </div>

                <div className="relative z-10 flex flex-col gap-3">
                  
                  {/* Category, Difficulty & Status Badges */}
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-md border uppercase font-mono flex items-center gap-1.5 select-none ${
                      goal.difficulty === 'Advanced' ? 'bg-red-500/10 text-red-405 border-red-500/20' : 
                      goal.difficulty === 'Intermediate' ? 'bg-zinc-100 text-zinc-600 border-yellow-500/20' : 
                      'bg-zinc-100 text-zinc-700 border-blue-500/20'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${
                        goal.difficulty === 'Advanced' ? 'bg-red-400 animate-pulse' : 
                        goal.difficulty === 'Intermediate' ? 'bg-yellow-400 animate-pulse' : 
                        'bg-blue-400'
                      }`}></span>
                      {goal.difficulty}
                    </span>

                    <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-md border font-mono uppercase flex items-center gap-1 select-none ${
                      isCompleted ? 'bg-zinc-100 text-zinc-600 border-emerald-900/30' :
                      goal.status === 'Behind' ? 'bg-red-950/40 text-red-400 border-red-900/30' :
                      goal.status === 'Paused' ? 'bg-zinc-100 border-zinc-200 text-zinc-400' :
                      'bg-zinc-100 text-zinc-700 border-zinc-300'
                    }`}>
                      {isCompleted ? '✓ Completed' : goal.status}
                    </span>
                  </div>

                  {/* Icon + Title */}
                  <div>
                    <div className="flex items-center gap-2.5 mt-2">
                      <div className="p-1.5 rounded-md bg-zinc-100 border border-zinc-200 shrink-0 shadow-[inset_0_0_8px_rgba(99,102,241,0.1)]">
                        {getGoalIcon(goal.title, 14)}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold font-display text-zinc-900 truncate flex-1 leading-snug group-hover:text-zinc-700 transition-colors">
                        {goal.title}
                      </h3>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-2 line-clamp-2 leading-relaxed font-medium">
                      {goal.description}
                    </p>
                  </div>

                </div>

                {/* Progress bar info */}
                <div className="my-4 relative z-10">
                  <div className="flex justify-between items-center text-[9px] mb-1 font-mono font-bold select-none">
                    <span className="text-zinc-400 uppercase tracking-wider">Milestone Progress</span>
                    <span className={`font-bold ${isCompleted ? 'text-zinc-600' : 'text-zinc-700'}`}>
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        isCompleted ? 'bg-zinc-900' : 'bg-zinc-700'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Statistics Footer */}
                <div className="border-t border-zinc-200 pt-3.5 flex justify-between items-center text-[9.5px] font-bold text-zinc-400 relative z-10">
                  <div className="flex gap-3 select-none">
                    <span className="flex items-center gap-1 font-mono text-[9px] text-slate-450 hover:text-zinc-700 transition-colors">
                      <Clock size={11} className="text-zinc-500" />
                      <span>{goal.deadlineDays}d left</span>
                    </span>
                    {!isCompleted && goal.streak > 0 && (
                      <span className="flex items-center gap-1 text-zinc-600 font-mono text-[9px] font-bold hover:text-zinc-600 transition-colors">
                        <Flame size={11} className="text-zinc-600 animate-pulse" />
                        <span>{goal.streak}d streak</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleOpenRoadmapForGoal(goal)}
                      className="flex items-center gap-1 font-mono text-[9px] font-bold text-zinc-700 hover:text-zinc-700 uppercase transition-colors"
                    >
                      <Sparkles size={10} />
                      <span>Roadmap</span>
                    </button>

                    <button
                      onClick={() => handleViewGoal(goal.id)}
                      className={`flex items-center gap-0.5 font-bold tracking-wider font-display uppercase hover:underline transition-colors ${
                        isCompleted ? 'text-zinc-600 hover:text-zinc-600' : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <span>Inspect</span>
                      <ChevronRight size={11} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        stateManager.removeGoal(goal.id);
                      }}
                      className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                      title="Remove Goal & Unlink Everywhere"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-slate-550 italic text-xs">
            No goals matching criteria.
          </div>
        )}
      </div>

    </div>
  );
};
export default Goals;
