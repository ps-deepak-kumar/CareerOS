import React, { useState, useEffect } from 'react';
import { Trophy, Lock } from 'lucide-react';
import { stateManager } from '../services/stateManager';
import { Badge } from '../data/mockData';

export const Achievements: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    setBadges(stateManager.getBadges());
  }, []);

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Competency Milestones</h2>
          <p className="text-xs text-slate-550 mt-0.5 font-display">Earn validation credentials as you complete chapters and assessments.</p>
        </div>
        
        <div className="bg-slate-900 border border-brand-border px-3 py-1.5 rounded-lg font-display text-xs flex items-center gap-2 select-none">
          <Trophy size={13} className="text-indigo-400" />
          <span className="text-slate-500 font-semibold uppercase">Credential indexes:</span>
          <span className="font-bold text-white font-mono">{unlockedCount} / {badges.length}</span>
        </div>
      </div>

      {/* BADGES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {badges.map(badge => (
          <div 
            key={badge.id}
            className={`glass-panel p-5 text-center flex flex-col justify-between items-center min-h-[200px] transition-all duration-200 relative group overflow-hidden bg-[#0e0f17]/40 ${
              badge.unlocked 
                ? 'border-indigo-500/20 bg-gradient-to-b from-[#101220]/50 to-transparent hover:border-indigo-500/40 hover:-translate-y-0.5' 
                : 'opacity-40 select-none bg-slate-950/10 border-transparent'
            }`}
          >
            {/* Badge Icon wrapper */}
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-105 ${
              badge.unlocked 
                ? 'bg-slate-900 border border-indigo-500/15 text-indigo-400 shadow-sm' 
                : 'bg-slate-900 border border-slate-950 text-slate-700'
            }`}>
              {badge.unlocked ? badge.icon : <Lock size={18} className="text-slate-700" />}
            </div>

            {/* Description Info */}
            <div>
              <h3 className="text-xs font-bold text-white font-display truncate leading-snug uppercase tracking-wider">{badge.title}</h3>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[150px] mx-auto leading-relaxed">{badge.description}</p>
            </div>

            {/* Unlocked date stamp */}
            {badge.unlocked ? (
              <span className="text-[8px] text-emerald-500 font-bold font-mono mt-3 uppercase tracking-wider">
                Earned {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : ""}
              </span>
            ) : (
              <span className="text-[8px] text-slate-700 font-bold font-mono mt-3 uppercase tracking-wider">
                Locked
              </span>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
export default Achievements;
