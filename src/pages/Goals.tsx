import React, { useState, useEffect } from 'react';
import { Target, Award, Flame, Clock, Plus, ChevronRight, Cpu, Sparkles, Terminal, Trophy } from 'lucide-react';
import { PageId } from '../components/Layout';
import { stateManager } from '../services/stateManager';
import { Goal } from '../data/mockData';

interface GoalsProps {
  onNavigate: (page: PageId) => void;
  setSelectedGoalIdForDetails: (id: string) => void;
}

export const Goals: React.FC<GoalsProps> = ({ onNavigate, setSelectedGoalIdForDetails }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'paused' | 'overdue'>('all');

  useEffect(() => {
    setGoals(stateManager.getGoals());
  }, []);

  const handleViewGoal = (id: string) => {
    setSelectedGoalIdForDetails(id);
    onNavigate('goal-details');
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
      return <Cpu size={size} className="text-purple-400" />;
    }
    if (t.includes('rag') || t.includes('production') || t.includes('specialist') || t.includes('search')) {
      return <Sparkles size={size} className="text-cyan-400" />;
    }
    if (t.includes('kubernetes') || t.includes('devops') || t.includes('orchestration')) {
      return <Terminal size={size} className="text-blue-400" />;
    }
    return <Target size={size} className="text-indigo-400" />;
  };

  const getGoalWatermark = (title: string, isCompleted: boolean) => {
    const t = title.toLowerCase();
    const size = 120;
    const colorClass = isCompleted 
      ? 'text-emerald-500/10' 
      : 'text-slate-800/20 group-hover:text-indigo-500/5 group-hover:scale-110';
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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Syllabus Cabinets</h2>
          <p className="text-xs text-slate-555 mt-0.5 font-display">Configure and track long-term competency milestones mapped to active job gaps.</p>
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
      <div className="flex border-b border-brand-border text-xs gap-1 select-none overflow-x-auto pb-1">
        {(['all', 'active', 'completed', 'paused', 'overdue'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-bold font-display tracking-wider uppercase border-b-2 transition-all ${
              activeTab === tab 
                ? 'border-indigo-500 text-white' 
                : 'border-transparent text-slate-500 hover:text-slate-350'
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
                className={`group p-5 flex flex-col justify-between min-h-[265px] relative transition-all duration-300 rounded-2xl border bg-[#0f111a] hover:bg-[#141624] overflow-hidden select-none hover:-translate-y-1 ${
                  isCompleted 
                    ? 'border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] shadow-md' 
                    : 'border-[#1e2238] hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] shadow-md'
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
                      goal.difficulty === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-405 border-yellow-500/20' : 
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${
                        goal.difficulty === 'Advanced' ? 'bg-red-400 animate-pulse' : 
                        goal.difficulty === 'Intermediate' ? 'bg-yellow-400 animate-pulse' : 
                        'bg-blue-400'
                      }`}></span>
                      {goal.difficulty}
                    </span>

                    <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-md border font-mono uppercase flex items-center gap-1 select-none ${
                      isCompleted ? 'bg-emerald-950/40 text-emerald-450 border-emerald-900/30' :
                      goal.status === 'Behind' ? 'bg-red-950/40 text-red-400 border-red-900/30' :
                      goal.status === 'Paused' ? 'bg-slate-900 border-slate-800 text-slate-500' :
                      'bg-indigo-950/40 text-indigo-400 border-indigo-900/30'
                    }`}>
                      {isCompleted ? '✓ Completed' : goal.status}
                    </span>
                  </div>

                  {/* Icon + Title */}
                  <div>
                    <div className="flex items-center gap-2.5 mt-2">
                      <div className="p-1.5 rounded-md bg-slate-950/80 border border-[#222741] shrink-0 shadow-[inset_0_0_8px_rgba(99,102,241,0.1)]">
                        {getGoalIcon(goal.title, 14)}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold font-display text-white truncate flex-1 leading-snug group-hover:text-indigo-400 transition-colors">
                        {goal.title}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed font-medium">
                      {goal.description}
                    </p>
                  </div>

                </div>

                {/* Progress bar info */}
                <div className="my-4 relative z-10">
                  <div className="flex justify-between items-center text-[9px] mb-1 font-mono font-bold select-none">
                    <span className="text-slate-500 uppercase tracking-wider">Milestone Progress</span>
                    <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-indigo-400'}`}>
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900/40">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                          : 'bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Statistics Footer */}
                <div className="border-t border-[#1e2238] pt-3.5 flex justify-between items-center text-[9.5px] font-bold text-slate-500 relative z-10">
                  <div className="flex gap-3 select-none">
                    <span className="flex items-center gap-1 font-mono text-[9px] text-slate-450 hover:text-slate-350 transition-colors">
                      <Clock size={11} className="text-slate-555" />
                      <span>{goal.deadlineDays}d left</span>
                    </span>
                    {!isCompleted && goal.streak > 0 && (
                      <span className="flex items-center gap-1 text-orange-400 font-mono text-[9px] font-bold hover:text-orange-300 transition-colors">
                        <Flame size={11} className="text-orange-500 animate-pulse" />
                        <span>{goal.streak}d streak</span>
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleViewGoal(goal.id)}
                    className={`flex items-center gap-0.5 font-bold tracking-wider font-display uppercase hover:underline transition-colors ${
                      isCompleted ? 'text-emerald-400 hover:text-emerald-300' : 'text-indigo-400 hover:text-indigo-305'
                    }`}
                  >
                    <span>Inspect</span>
                    <ChevronRight size={11} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </button>
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
