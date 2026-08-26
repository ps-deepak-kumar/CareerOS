import React, { useState } from 'react';
import { 
  Home, Calendar, Target, BookOpen, Map, FileText, Link2, Trophy, User, Briefcase, Settings, 
  Search, Bell, Flame, Menu, X, Brain, Zap
} from 'lucide-react';
import { stateManager } from '../services/stateManager';

export type PageId = 
  | 'landing'
  | 'dashboard'
  | 'daily-plan'
  | 'goals'
  | 'set-goal'
  | 'goal-details'
  | 'learning'
  | 'course-details'
  | 'roadmap'
  | 'quiz'
  | 'resources'
  | 'achievements'
  | 'profile'
  | 'work-intel'
  | 'settings';

interface LayoutProps {
  children: React.ReactNode;
  activePage: PageId;
  onPageChange: (page: PageId) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activePage, 
  onPageChange 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const profile = stateManager.getProfile();
  
  const navigationItems = [
    { id: 'dashboard',    label: 'Home Dashboard',          icon: Home,      color: 'from-sky-500 to-blue-600',        iconColor: 'text-sky-400',      glow: 'shadow-sky-500/30' },
    { id: 'daily-plan',  label: 'My Daily Task Plan',       icon: Calendar,  color: 'from-violet-500 to-purple-600',   iconColor: 'text-violet-400',   glow: 'shadow-violet-500/30' },
    { id: 'goals',       label: 'My Goals & Targets',       icon: Target,    color: 'from-rose-500 to-pink-600',       iconColor: 'text-rose-400',     glow: 'shadow-rose-500/30' },
    { id: 'learning',    label: 'Courses & Lessons',        icon: BookOpen,  color: 'from-amber-500 to-orange-600',    iconColor: 'text-amber-400',    glow: 'shadow-amber-500/30' },
    { id: 'roadmap',     label: 'Skill Learning Roadmap',   icon: Map,       color: 'from-teal-500 to-emerald-600',    iconColor: 'text-teal-400',     glow: 'shadow-teal-500/30' },
    { id: 'quiz',        label: 'Tests & Assessments',      icon: FileText,  color: 'from-cyan-500 to-blue-600',       iconColor: 'text-cyan-400',     glow: 'shadow-cyan-500/30' },
    { id: 'resources',   label: 'Study Resource Library',   icon: Link2,     color: 'from-lime-500 to-green-600',      iconColor: 'text-lime-400',     glow: 'shadow-lime-500/30' },
    { id: 'achievements',label: 'Badges & Achievements',    icon: Trophy,    color: 'from-yellow-400 to-amber-500',    iconColor: 'text-yellow-400',   glow: 'shadow-yellow-400/30' },
    { id: 'profile',     label: 'My Career Profile',        icon: User,      color: 'from-fuchsia-500 to-pink-600',    iconColor: 'text-fuchsia-400',  glow: 'shadow-fuchsia-500/30' },
    { id: 'work-intel',  label: 'Work & Job Insights',      icon: Briefcase, color: 'from-indigo-500 to-blue-600',     iconColor: 'text-indigo-400',   glow: 'shadow-indigo-500/30' },
  ] as const;

  const handleNavClick = (id: PageId) => {
    onPageChange(id);
    setMobileMenuOpen(false);
  };

  const notifications = [
    { text: "Critic Agent verified your study consistency metrics.", time: "10 min ago" },
    { text: "Planner Sync: Logged completion ofauth gateways task.", time: "2 hours ago" },
    { text: "Roadmap Agent generated Positional Encoding resources.", time: "1 day ago" }
  ];

  return (
    <div className="min-h-screen flex text-slate-300" style={{background: 'linear-gradient(135deg, #0a0b14 0%, #0d0f1e 40%, #0a0c18 70%, #0b0d16 100%)'}}>
      
      {/* DESKTOP SIDEBAR NAV */}
      <aside className="hidden lg:flex flex-col w-68 shrink-0 fixed h-screen z-30" style={{width: '268px', background: 'linear-gradient(180deg, #0e0f1f 0%, #0c0d1c 50%, #080910 100%)', borderRight: '1px solid rgba(255,255,255,0.06)'}}>
        
        {/* Colorful top accent bar */}
        <div className="h-1 w-full" style={{background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #f59e0b, #10b981, #06b6d4)'}} />

        {/* Brand Logo Header */}
        <div className="h-16 flex items-center gap-3 px-5 cursor-pointer group" style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}} onClick={() => handleNavClick('landing')}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300" style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)'}}>
            <Brain size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold font-display tracking-tight leading-none" style={{background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>CareerOS</h1>
            <span className="text-[9px] uppercase tracking-widest font-bold font-mono" style={{color: '#4ade80'}}>● LIVE  Enterprise v1.2</span>
          </div>
          <Zap size={12} className="ml-auto text-yellow-400 opacity-70" />
        </div>

        {/* Section Label */}
        <div className="px-5 pt-5 pb-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono" style={{color: 'rgba(255,255,255,0.25)'}}>Navigation</span>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 px-3 pb-4 flex flex-col gap-0.5 overflow-y-auto">
          {navigationItems.map(item => {
            const isActive = activePage === item.id || 
              (item.id === 'goals' && activePage === 'goal-details') ||
              (item.id === 'goals' && activePage === 'set-goal') ||
              (item.id === 'learning' && activePage === 'course-details');
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-semibold tracking-wide font-display transition-all duration-200 relative group ${
                  isActive 
                    ? `text-white shadow-lg ${item.glow}`
                    : 'text-slate-400 hover:text-white'
                }`}
                style={isActive ? {
                  background: `linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))`,
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                } : {
                  background: 'transparent',
                  border: '1px solid transparent'
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {/* Colored Icon Badge */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110 ${
                  isActive ? `bg-gradient-to-br ${item.color} shadow-md` : 'bg-white/5'
                }`}>
                  <Icon size={13} className={isActive ? 'text-white' : item.iconColor} />
                </div>
                
                <span className="truncate text-left">{item.label}</span>

                {/* Active pill */}
                {isActive && (
                  <div className={`ml-auto w-1.5 h-4 rounded-full bg-gradient-to-b ${item.color} opacity-80`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer (Settings) */}
        <div className="p-3" style={{borderTop: '1px solid rgba(255,255,255,0.05)'}}>
          <button 
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-semibold tracking-wide font-display transition-all duration-200 ${
              activePage === 'settings'
                ? 'text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            style={activePage === 'settings' ? {
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
              border: '1px solid rgba(255,255,255,0.1)'
            } : {
              background: 'transparent',
              border: '1px solid transparent'
            }}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              activePage === 'settings' ? 'bg-gradient-to-br from-slate-500 to-slate-600' : 'bg-white/5'
            }`}>
              <Settings size={13} className={activePage === 'settings' ? 'text-white' : 'text-slate-400'} />
            </div>
            <span>App Settings & Preferences</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen" style={{paddingLeft: '268px'}}>
        
        {/* TOP NAVBAR */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 backdrop-blur-xl" style={{borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(135deg, rgba(14,15,31,0.95) 0%, rgba(12,13,28,0.95) 100%)'}}>
          {/* Colorful bottom accent line on header */}
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(139,92,246,0.5), rgba(236,72,153,0.3), transparent)'}} />
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded text-slate-400 hover:text-white hover:bg-slate-900"
            >
              <Menu size={18} />
            </button>
            <span className="font-display font-bold text-white text-sm tracking-wide">CareerOS</span>
          </div>

          {/* Desktop search wrapper */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-brand-border rounded-lg px-3 py-1.5 w-72 focus-within:border-indigo-500/40 transition-all">
            <Search size={13} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Search curriculum, resources..."
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-4 sm:gap-6 ml-auto">
            {/* Streak indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full select-none" style={{background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.15))', border: '1px solid rgba(245,158,11,0.3)'}}>
              <Flame size={13} className="text-orange-400" />
              <span className="text-[10px] font-bold font-display" style={{background: 'linear-gradient(90deg, #fb923c, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>🔥 14-Day Streak</span>
            </div>

            {/* Current System time & date */}
            <div className="hidden sm:block text-right">
              <p className="text-[9px] text-slate-500 font-mono tracking-wider">PLATFORM ONLINE</p>
              <p className="text-[11px] font-semibold text-slate-300">Wednesday, Aug 12</p>
            </div>

            {/* Notifications Trigger */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-slate-950/40 border border-brand-border hover:border-slate-800 text-slate-400 hover:text-white transition-colors relative"
              >
                <Bell size={14} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 glass-panel p-1.5 shadow-2xl z-50 text-[11px] border border-brand-border">
                  <div className="px-3 py-1.5 border-b border-brand-border flex items-center justify-between">
                    <span className="font-semibold text-white">Agent Notification feed</span>
                    <button className="text-[10px] text-indigo-400 hover:underline">Clear all</button>
                  </div>
                  <div className="divide-y divide-slate-800/65">
                    {notifications.map((n, idx) => (
                      <div key={idx} className="p-2.5 hover:bg-slate-900/30 transition-colors">
                        <p className="text-slate-300 leading-tight">{n.text}</p>
                        <span className="text-[9px] text-slate-500 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Widget */}
            <div 
              onClick={() => handleNavClick('profile')}
              className="flex items-center gap-2 cursor-pointer border border-brand-border hover:border-slate-800 rounded-lg p-1 transition-all"
            >
              <img 
                src={profile.avatar} 
                alt={profile.name}
                className="w-6 h-6 rounded object-cover shadow"
              />
              <div className="hidden md:block text-left pr-1">
                <p className="text-[10px] font-semibold text-white leading-none">{profile.name}</p>
                <p className="text-[8px] text-slate-500">{profile.title}</p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN ROUTER RENDER AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8" style={{background: 'linear-gradient(135deg, rgba(99,102,241,0.02) 0%, transparent 50%, rgba(139,92,246,0.02) 100%)'}}>
          {children}
        </main>
      </div>

      {/* MOBILE SLIDEOUT DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 lg:hidden flex backdrop-blur-sm">
          <div className="w-72 flex flex-col" style={{background: 'linear-gradient(180deg, #0e0f1f 0%, #080910 100%)', borderRight: '1px solid rgba(255,255,255,0.06)'}}>
            <div className="h-1 w-full" style={{background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #f59e0b, #10b981)'}} />
            <div className="flex items-center justify-between px-5 py-4" style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>
                  <Brain size={16} className="text-white" />
                </div>
                <span className="font-display font-bold text-base" style={{background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>CareerOS</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                style={{background: 'rgba(255,255,255,0.05)'}}
              >
                <X size={16} />
              </button>
            </div>
            
            <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto p-3 pt-4">
              {navigationItems.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-semibold font-display tracking-wide transition-all duration-200 ${
                      isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    style={isActive ? {
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
                      border: '1px solid rgba(255,255,255,0.1)'
                    } : { border: '1px solid transparent' }}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? `bg-gradient-to-br ${item.color}` : 'bg-white/5'
                    }`}>
                      <Icon size={13} className={isActive ? 'text-white' : item.iconColor} />
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            
            <div className="p-3" style={{borderTop: '1px solid rgba(255,255,255,0.05)'}}>
              <button 
                onClick={() => handleNavClick('settings')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-semibold font-display tracking-wide text-slate-400 hover:text-white transition-all w-full"
                style={{border: '1px solid transparent'}}
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Settings size={13} className="text-slate-400" />
                </div>
                <span>App Settings & Preferences</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0c0d15]/95 border-t border-brand-border z-40 flex justify-around items-center px-2">
        <button 
          onClick={() => handleNavClick('dashboard')}
          className={`flex flex-col items-center justify-center ${activePage === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <Home size={16} />
          <span className="text-[8px] mt-0.5 font-display font-semibold uppercase">Dash</span>
        </button>
        <button 
          onClick={() => handleNavClick('daily-plan')}
          className={`flex flex-col items-center justify-center ${activePage === 'daily-plan' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <Calendar size={16} />
          <span className="text-[8px] mt-0.5 font-display font-semibold uppercase">Plan</span>
        </button>
        <button 
          onClick={() => handleNavClick('goals')}
          className={`flex flex-col items-center justify-center ${
            activePage === 'goals' || activePage === 'goal-details' || activePage === 'set-goal' 
              ? 'text-indigo-400' 
              : 'text-slate-500'
          }`}
        >
          <Target size={16} />
          <span className="text-[8px] mt-0.5 font-display font-semibold uppercase">Goals</span>
        </button>
        <button 
          onClick={() => handleNavClick('learning')}
          className={`flex flex-col items-center justify-center ${activePage === 'learning' || activePage === 'course-details' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <BookOpen size={16} />
          <span className="text-[8px] mt-0.5 font-display font-semibold uppercase">Learn</span>
        </button>
        <button 
          onClick={() => handleNavClick('profile')}
          className={`flex flex-col items-center justify-center ${activePage === 'profile' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <User size={16} />
          <span className="text-[8px] mt-0.5 font-display font-semibold uppercase">Me</span>
        </button>
      </div>

    </div>
  );
};
export default Layout;
