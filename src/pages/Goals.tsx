import React, { useState, useEffect } from 'react';
import { Flame, Clock, Plus, ChevronRight, Map, Eye, Trash2 } from 'lucide-react';
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
      try { localStorage.setItem('career_os_active_course_id', matched.id); } catch {}
      if (setSelectedCourseIdForDetails) setSelectedCourseIdForDetails(matched.id);
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

  return (
    <div className="flex flex-col gap-6 w-full" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-5 reveal-up">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">🎯 Syllabus Cabinets</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Configure and track long-term competency milestones mapped to active job gaps.</p>
        </div>
        <button
          onClick={() => onNavigate('set-goal')}
          className="btn-primary text-xs"
        >
          <Plus size={13} />
          <span>Configure Syllabus</span>
        </button>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex border-b border-zinc-200 text-xs gap-1 select-none overflow-x-auto pb-1">
        {(['all', 'active', 'completed', 'paused', 'overdue'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-bold tracking-wider uppercase border-b-2 transition-all ${
              activeTab === tab
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* GOALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal, idx) => {
            const isCompleted = goal.status === 'Completed';

            return (
              <div
                key={goal.id}
                className="group p-5 flex flex-col justify-between min-h-[240px] relative transition-all duration-200 rounded-2xl border bg-white hover:shadow-cardHover hover:-translate-y-0.5 border-zinc-200 hover:border-zinc-300 overflow-hidden reveal-up"
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <div className="flex flex-col gap-3">

                  {/* Status + Difficulty badges */}
                  <div className="flex justify-between items-center gap-2">
                    {/* Difficulty */}
                    <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase font-mono bg-zinc-100 text-zinc-600 border-zinc-200 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        goal.difficulty === 'Advanced' ? 'bg-zinc-900' :
                        goal.difficulty === 'Intermediate' ? 'bg-zinc-600' :
                        'bg-zinc-400'
                      }`} />
                      {goal.difficulty}
                    </span>

                    {/* Status */}
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border font-mono uppercase ${
                      isCompleted
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : goal.status === 'Behind'
                        ? 'bg-zinc-800 text-white border-zinc-800'
                        : goal.status === 'Paused'
                        ? 'bg-zinc-100 text-zinc-500 border-zinc-200'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}>
                      {isCompleted ? '✓ Done' : goal.status}
                    </span>
                  </div>

                  {/* Title only — no icon */}
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 leading-snug">
                      {goal.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {goal.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="my-3">
                  <div className="flex justify-between items-center text-[9px] mb-1.5 font-mono font-bold">
                    <span className="text-zinc-400 uppercase tracking-wider">Progress</span>
                    <span className="text-zinc-700">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-zinc-100 pt-3 flex justify-between items-center gap-2">

                  {/* Left: deadline + streak pills */}
                  <div className="flex items-center gap-1.5">
                    {/* Days left — black pill */}
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 text-white text-[9px] font-bold font-mono">
                      <Clock size={9} />
                      {goal.deadlineDays}d left
                    </span>

                    {/* Streak — black pill */}
                    {!isCompleted && goal.streak > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 text-white text-[9px] font-bold font-mono">
                        🔥 {goal.streak}d
                      </span>
                    )}
                  </div>

                  {/* Right: action buttons — all black */}
                  <div className="flex items-center gap-1.5">
                    {/* Roadmap */}
                    <button
                      onClick={() => handleOpenRoadmapForGoal(goal)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-wider hover:bg-zinc-700 transition-colors"
                    >
                      <Map size={9} />
                      <span>Roadmap</span>
                    </button>

                    {/* Inspect */}
                    <button
                      onClick={() => handleViewGoal(goal.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-wider hover:bg-zinc-700 transition-colors"
                    >
                      <Eye size={9} />
                      <span>Inspect</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        stateManager.removeGoal(goal.id);
                      }}
                      className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-zinc-900 text-white hover:bg-red-600 transition-colors"
                      title="Remove Goal"
                    >
                      <Trash2 size={9} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-zinc-400 text-sm">
            <p className="text-3xl mb-3">🎯</p>
            <p className="font-semibold text-zinc-900">No goals yet</p>
            <p className="text-xs mt-1">Configure your first syllabus to get started.</p>
          </div>
        )}
      </div>

    </div>
  );
};
export default Goals;
