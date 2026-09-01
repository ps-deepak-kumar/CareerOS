import React, { useState, useEffect } from 'react';
import { 
  Trophy, Lock, Award, Sparkles, Star, ShieldCheck, Download, 
  Share2, CheckCircle2, Flame, Zap, Target, BookOpen, Users, 
  ExternalLink, FileCheck, X, Printer, Compass, Layers
} from 'lucide-react';
import { stateManager, getLocalDateString } from '../services/stateManager';
import { Badge, Profile, Course } from '../data/mockData';
import { showToast } from '../components/ToastContainer';

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  role: string;
  company: string;
  xp: number;
  streak: number;
  badgesCount: number;
  isCurrentUser?: boolean;
}

export const Achievements: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeTab, setActiveTab] = useState<'badges' | 'certificates' | 'leaderboard'>('badges');
  const [badgeCategory, setBadgeCategory] = useState<'all' | 'unlocked' | 'locked' | 'streak' | 'course' | 'quiz'>('all');
  
  // Certificate Modal State
  const [selectedCertCourse, setSelectedCertCourse] = useState<Course | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    const refreshData = () => {
      setBadges(stateManager.getBadges());
      setProfile(stateManager.getProfile());
      setCourses(stateManager.getCourses());
    };
    refreshData();

    window.addEventListener('profile-updated', refreshData);
    return () => window.removeEventListener('profile-updated', refreshData);
  }, []);

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const xp = profile?.stats.xp || 450;
  const currentLevel = Math.floor(xp / 100) + 1;
  const xpIntoCurrentLevel = xp % 100;
  const xpForNextLevel = 100;
  const levelProgress = Math.min(100, (xpIntoCurrentLevel / xpForNextLevel) * 100);

  // Filtered badges
  const filteredBadges = badges.filter(b => {
    if (badgeCategory === 'unlocked') return b.unlocked;
    if (badgeCategory === 'locked') return !b.unlocked;
    if (badgeCategory === 'streak') return b.title.toLowerCase().includes('streak') || b.title.toLowerCase().includes('focus') || b.id.includes('badge-1') || b.id.includes('badge-2') || b.id.includes('badge-9') || b.id.includes('badge-10');
    if (badgeCategory === 'course') return b.title.toLowerCase().includes('graduate') || b.title.toLowerCase().includes('target') || b.title.toLowerCase().includes('scholar') || b.title.toLowerCase().includes('project') || b.title.toLowerCase().includes('architect');
    if (badgeCategory === 'quiz') return b.id.includes('quiz') || b.title.toLowerCase().includes('assessment') || b.title.toLowerCase().includes('neural');
    return true;
  });

  // Mock Leaderboard
  const leaderboardData: LeaderboardUser[] = [
    { rank: 1, name: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", role: "Principal AI Researcher", company: "DeepMind", xp: 1450, streak: 42, badgesCount: 14 },
    { rank: 2, name: "Alexander Vance", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", role: "Staff ML Engineer", company: "OpenAI", xp: 1280, streak: 31, badgesCount: 12 },
    { rank: 3, name: "Deepak Chaudhary", avatar: profile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", role: profile?.title || "AI Engineer", company: profile?.company || "Google Cloud AI", xp: xp, streak: profile?.stats.streakDays || 4, badgesCount: unlockedCount, isCurrentUser: true },
    { rank: 4, name: "Mei-Ling Zhou", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80", role: "Senior LLM Specialist", company: "Anthropic", xp: 820, streak: 18, badgesCount: 8 },
    { rank: 5, name: "Marcus Thorne", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", role: "AI Infrastructure Lead", company: "Microsoft", xp: 710, streak: 12, badgesCount: 7 }
  ];

  // Tier Styling
  const getBadgeTierStyle = (badgeId: string) => {
    if (['badge-2', 'badge-8', 'badge-10'].includes(badgeId)) {
      return {
        border: 'border-[#FFA116]/40 hover:border-[#FFA116] bg-[#FFA116]/5',
        glow: 'shadow-[0_0_15px_rgba(255,161,22,0.15)]',
        color: 'text-[#FFA116]',
        tag: 'Legendary Tier',
        tagBg: 'bg-[#FFA116]/10 text-[#FFA116] border-[#FFA116]/30'
      };
    }
    if (['badge-4', 'badge-6', 'badge-11'].includes(badgeId)) {
      return {
        border: 'border-purple-500/40 hover:border-purple-400 bg-purple-500/5',
        glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]',
        color: 'text-purple-400',
        tag: 'Epic Tier',
        tagBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
      };
    }
    if (['badge-1', 'badge-3', 'badge-7', 'badge-9', 'badge-12', 'badge-13'].includes(badgeId)) {
      return {
        border: 'border-blue-500/40 hover:border-blue-400 bg-blue-500/5',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
        color: 'text-blue-400',
        tag: 'Rare Tier',
        tagBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      };
    }
    return {
      border: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/5',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      color: 'text-emerald-400',
      tag: 'Specialist Tier',
      tagBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    };
  };

  const handleOpenCertificate = (course: Course) => {
    setSelectedCertCourse(course);
    setShowCertModal(true);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-12 font-sans text-slate-200">
      
      {/* TOP HEADER & GAMIFICATION BANNER */}
      <div className="glass-panel p-6 bg-gradient-to-r from-[#0c0e1a] via-[#101222] to-[#0c0e1a] border border-brand-border rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-amber-500/10">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Competency Hub & Verifications
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Level {currentLevel} Scholar
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Earn immutable AI validation credentials, benchmark your study velocity, and issue verified university certificates.
            </p>
            
            {/* Level & XP Progression bar */}
            <div className="mt-3.5 flex items-center gap-3">
              <div className="w-48 sm:w-64 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-700"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-amber-300 font-bold">
                {xp} XP <span className="text-slate-500 font-normal">({xpIntoCurrentLevel}/100 XP to Lvl {currentLevel + 1})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center font-mono">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-brand-border/80">
            <p className="text-[9px] text-slate-500 font-sans uppercase font-bold tracking-wider">Unlocked</p>
            <p className="text-base sm:text-lg font-bold text-white mt-0.5">{unlockedCount}/{badges.length}</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-brand-border/80">
            <p className="text-[9px] text-slate-500 font-sans uppercase font-bold tracking-wider">Streak</p>
            <p className="text-base sm:text-lg font-bold text-orange-400 mt-0.5">{profile?.stats.streakDays || 4}d</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-brand-border/80">
            <p className="text-[9px] text-slate-500 font-sans uppercase font-bold tracking-wider">Global Rank</p>
            <p className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">#3</p>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS (BADGES, CERTIFICATES, LEADERBOARD) */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-brand-border/60 pb-3">
        <div className="flex bg-[#06070d] p-1 rounded-xl border border-brand-border/70">
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'badges'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Award size={14} />
            <span>Badges Cabinet</span>
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'certificates'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <FileCheck size={14} />
            <span>Verifiable Certificates</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Users size={14} />
            <span>AI Leaderboard</span>
          </button>
        </div>

        {/* Category Filters for Badges */}
        {activeTab === 'badges' && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-medium font-mono select-none">
            {(['all', 'unlocked', 'locked', 'streak', 'course', 'quiz'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setBadgeCategory(cat)}
                className={`px-3 py-1 rounded-lg border capitalize transition-all ${
                  badgeCategory === cat
                    ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                    : 'border-brand-border/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ================= TAB 1: BADGES CABINET ================= */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredBadges.map(badge => {
            const tier = getBadgeTierStyle(badge.id);
            return (
              <div 
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`glass-panel p-5 text-center flex flex-col justify-between items-center min-h-[220px] transition-all duration-300 relative group overflow-hidden rounded-2xl cursor-pointer ${
                  badge.unlocked 
                    ? `${tier.border} ${tier.glow} hover:-translate-y-1 bg-gradient-to-b from-[#0f111d]/90 to-[#07080f]` 
                    : 'opacity-40 select-none bg-slate-950/20 border-brand-border/30 hover:opacity-60'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${badge.unlocked ? tier.tagBg : 'text-slate-600 border-slate-800'}`}>
                    {badge.unlocked ? tier.tag : 'Locked'}
                  </span>
                  {badge.unlocked && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  )}
                </div>

                {/* Badge Icon wrapper */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl my-3 transition-transform duration-300 group-hover:scale-110 ${
                  badge.unlocked 
                    ? 'bg-slate-900/80 border border-brand-border/60 shadow-inner' 
                    : 'bg-slate-950 border border-slate-900 text-slate-700'
                }`}>
                  {badge.unlocked ? badge.icon : <Lock size={20} className="text-slate-600" />}
                </div>

                {/* Description Info */}
                <div className="w-full">
                  <h3 className={`text-xs font-bold truncate leading-snug uppercase tracking-wider ${badge.unlocked ? tier.color : 'text-slate-400'}`}>
                    {badge.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed line-clamp-2">
                    {badge.description}
                  </p>
                </div>

                {/* Unlocked date stamp */}
                <div className="mt-3 pt-2.5 border-t border-brand-border/30 w-full text-[9px] font-mono flex items-center justify-between text-slate-500">
                  <span>Status:</span>
                  <span className={badge.unlocked ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                    {badge.unlocked ? (badge.unlockedAt ? `Earned ${badge.unlockedAt}` : 'Earned Active') : 'Criteria Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= TAB 2: VERIFIABLE CERTIFICATES ================= */}
      {activeTab === 'certificates' && (
        <div className="flex flex-col gap-6">
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center gap-3">
            <ShieldCheck size={24} className="text-indigo-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Accredited Academic Credentials</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Certificates are issued with cryptographic SHA-256 verification hashes upon completing 100% of chapter assessments and capstone labs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((c) => {
              const isEligible = c.progress >= 60;
              const isCompleted = c.progress === 100;
              return (
                <div 
                  key={c.id} 
                  className="glass-panel p-6 bg-[#0c0d16]/80 border border-brand-border rounded-2xl flex flex-col justify-between gap-5 hover:border-indigo-500/30 transition-all shadow-md relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-brand-border/60 bg-slate-950 shrink-0">
                      <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40 uppercase tracking-wider">
                        {c.provider || 'Stanford Online'}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1 leading-snug">{c.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{c.instructor || 'Prof. Christopher Manning'}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Curriculum Completion</span>
                      <span className="text-emerald-400 font-bold">{c.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-brand-border/40 text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {isCompleted ? '✅ Verified & Ready' : isEligible ? '⚡ Capstone Ready' : 'In Progress'}
                    </span>

                    <button
                      onClick={() => handleOpenCertificate(c)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        isEligible 
                          ? 'btn-primary shadow-md shadow-indigo-600/20' 
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileCheck size={13} />
                      <span>View Certificate</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: AI LEADERBOARD ================= */}
      {activeTab === 'leaderboard' && (
        <div className="glass-panel p-6 bg-[#0c0d16]/80 border border-brand-border rounded-2xl shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-brand-border/60 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Trophy size={14} className="text-yellow-400" />
                <span>Global AI Engineering Leaderboard</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">Weekly active research & syllabus study rankings</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-800/40">
              Live Ranked
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {leaderboardData.map((user) => (
              <div 
                key={user.rank}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                  user.isCurrentUser 
                    ? 'border-indigo-500/60 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                    : 'border-brand-border/60 bg-slate-950/40 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank badge */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                    user.rank === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    user.rank === 2 ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40' :
                    user.rank === 3 ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40' :
                    'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}>
                    #{user.rank}
                  </div>

                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-brand-border shrink-0">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{user.name}</span>
                      {user.isCurrentUser && (
                        <span className="text-[9px] font-bold font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.2 rounded border border-indigo-800/40 uppercase">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">{user.role} • {user.company}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end sm:self-center font-mono text-xs">
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 uppercase block font-sans">Streak</span>
                    <span className="text-orange-400 font-bold">🔥 {user.streak}d</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 uppercase block font-sans">Badges</span>
                    <span className="text-indigo-400 font-bold">🏆 {user.badgesCount}</span>
                  </div>
                  <div className="text-right min-w-[70px]">
                    <span className="text-[9px] text-slate-500 uppercase block font-sans">Total XP</span>
                    <span className="text-emerald-400 font-bold text-sm">{user.xp} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= BADGE INSPECTION DIALOG MODAL ================= */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 bg-[#0d0e1a] border border-brand-border w-full max-w-md rounded-2xl shadow-2xl flex flex-col items-center text-center relative">
            <button 
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/40"
            >
              <X size={16} />
            </button>

            <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-center justify-center text-4xl mb-4 shadow-lg shadow-indigo-500/10">
              {selectedBadge.unlocked ? selectedBadge.icon : <Lock size={28} className="text-slate-600" />}
            </div>

            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border mb-2 ${
              selectedBadge.unlocked ? getBadgeTierStyle(selectedBadge.id).tagBg : 'text-slate-500 border-slate-800'
            }`}>
              {selectedBadge.unlocked ? getBadgeTierStyle(selectedBadge.id).tag : 'Locked Credential'}
            </span>

            <h3 className="text-base font-bold text-white">{selectedBadge.title}</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedBadge.description}</p>

            <div className="w-full mt-5 pt-4 border-t border-brand-border/40 text-xs font-mono space-y-1.5 text-left bg-slate-950/40 p-3 rounded-xl">
              <div className="flex justify-between">
                <span className="text-slate-500">Credential ID:</span>
                <span className="text-slate-300 font-bold">{selectedBadge.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issuing Authority:</span>
                <span className="text-indigo-400 font-bold">CareerOS Autonomous Verification</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className={selectedBadge.unlocked ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {selectedBadge.unlocked ? `Unlocked (${selectedBadge.unlockedAt || 'Active'})` : 'Incomplete'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                showToast(`Credential "${selectedBadge.title}" link copied to clipboard!`, 'info');
                setSelectedBadge(null);
              }}
              className="btn-primary w-full mt-5 py-2.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider"
            >
              <Share2 size={13} />
              <span>Share Credential</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= CERTIFICATE GENERATOR MODAL ================= */}
      {showCertModal && selectedCertCourse && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="glass-panel bg-[#07080f] border-2 border-indigo-500/40 w-full max-w-3xl rounded-2xl shadow-2xl p-8 flex flex-col gap-6 relative print:border-0 print:p-0">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowCertModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/40 print:hidden"
            >
              <X size={18} />
            </button>

            {/* Printable Certificate Frame */}
            <div className="border-4 border-double border-indigo-500/30 p-8 rounded-xl bg-gradient-to-b from-[#0e101f] via-[#090a14] to-[#0e101f] text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Watermark Logo */}
              <div className="flex justify-center items-center gap-2 mb-2">
                <ShieldCheck size={28} className="text-indigo-400" />
                <span className="text-xs font-mono font-bold tracking-widest text-indigo-300 uppercase">
                  CareerOS Academic Verification Protocol
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-tight mt-3">
                Certificate of Competency Mastery
              </h1>
              <p className="text-xs text-slate-400 mt-1 italic">This is to certify that</p>

              <h2 className="text-xl sm:text-2xl font-bold font-sans text-amber-300 tracking-wide my-3">
                {profile?.name || 'Deepak Chaudhary'}
              </h2>

              <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                has successfully mastered all university-grade curriculum modules, validated laboratory capstones, and passed theoretical assessments in
              </p>

              <h3 className="text-base sm:text-lg font-bold font-sans text-white my-3 px-4 py-1.5 bg-indigo-950/40 border border-indigo-500/30 rounded-lg inline-block">
                {selectedCertCourse.title}
              </h3>

              <p className="text-[11px] text-slate-400 mt-2">
                Instructed under curriculum standards by <strong className="text-slate-200">{selectedCertCourse.instructor || 'Prof. Christopher Manning'}</strong> ({selectedCertCourse.provider || 'Stanford Online'})
              </p>

              {/* Signatures & Security Hash */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-brand-border/40 text-left font-mono text-[10px]">
                <div>
                  <p className="text-slate-500 uppercase">Issue Date</p>
                  <p className="text-white font-bold">{getLocalDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase">Verification Hash</p>
                  <p className="text-indigo-300 font-bold truncate">SHA256: 8f4a1c...e90b</p>
                </div>
                <div className="col-span-2 sm:col-span-1 text-right">
                  <p className="text-slate-500 uppercase">Accreditation</p>
                  <p className="text-emerald-400 font-bold">Verified Capstone</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 print:hidden">
              <button 
                onClick={() => setShowCertModal(false)}
                className="btn-secondary py-2 px-4 text-xs"
              >
                Close
              </button>
              <button 
                onClick={handlePrintCertificate}
                className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
              >
                <Printer size={13} />
                <span>Print / Download PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default Achievements;
