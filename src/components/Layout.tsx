import React, { useState } from 'react';
import {
  Home, Calendar, Target, BookOpen, Map, FileText, Link2, Trophy,
  User, Briefcase, Settings, Search, Bell, Flame, Menu, X, Brain,
  ChevronRight, GraduationCap
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
    { id: 'dashboard',    label: 'Home Dashboard',        icon: Home      },
    { id: 'daily-plan',  label: 'My Daily Task Plan',     icon: Calendar  },
    { id: 'goals',       label: 'My Goals & Targets',     icon: Target    },
    { id: 'learning',    label: 'Courses & Lessons',      icon: BookOpen  },
    { id: 'roadmap',     label: 'Skill Learning Roadmap', icon: Map       },
    { id: 'quiz',        label: 'Tests & Assessments',    icon: FileText  },
    { id: 'resources',   label: 'Study Resource Library', icon: Link2     },
    { id: 'achievements',label: 'Badges & Achievements',  icon: Trophy    },
    { id: 'profile',     label: 'My Career Profile',      icon: User      },
    { id: 'work-intel',  label: 'Work & Job Insights',    icon: Briefcase },
  ] as const;

  const handleNavClick = (id: PageId) => {
    onPageChange(id);
    setMobileMenuOpen(false);
  };

  const notifications = [
    { text: "Critic Agent verified your study consistency metrics.", time: "10 min ago" },
    { text: "Planner Sync: Logged completion of auth gateways task.", time: "2 hours ago" },
    { text: "Roadmap Agent generated Positional Encoding resources.", time: "1 day ago" }
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50 text-zinc-900">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 fixed h-screen z-30 bg-white border-r border-zinc-200"
        style={{ width: '256px' }}
      >
        {/* Brand Logo */}
        <div
          className="h-14 flex items-center gap-3 px-5 cursor-pointer border-b border-zinc-200 select-none group"
          onClick={() => handleNavClick('landing')}
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-900 group-hover:bg-zinc-700 transition-colors shrink-0">
            <GraduationCap size={16} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold font-display tracking-tight text-zinc-900 leading-tight">
              CareerOS
            </h1>
            <span className="text-[9px] uppercase tracking-widest font-mono text-zinc-400 font-semibold">
              AI Learning Platform
            </span>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-4 pt-5 pb-2">
          <span className="section-label">Navigation</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 pb-4 flex flex-col gap-0.5 overflow-y-auto">
          {navigationItems.map(item => {
            const isActive = activePage === item.id ||
              (item.id === 'goals' && (activePage === 'goal-details' || activePage === 'set-goal')) ||
              (item.id === 'learning' && activePage === 'course-details');
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium font-sans transition-all duration-150 ${
                  isActive
                    ? 'bg-zinc-900 text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="truncate text-left">{item.label}</span>
                {isActive && <ChevronRight size={12} className="ml-auto shrink-0 opacity-60" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-3 pb-3 pt-2 border-t border-zinc-200">
          <button
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activePage === 'settings'
                ? 'bg-zinc-900 text-zinc-900'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Settings size={14} className="shrink-0" />
            <span>Settings & Preferences</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT PANE ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ paddingLeft: '256px' }}>

        {/* TOP NAVBAR */}
        <header className="h-14 flex items-center justify-between px-5 sticky top-0 z-20 bg-white border-b border-zinc-200">

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <Menu size={18} />
            </button>
            <span className="font-display font-bold text-zinc-900 text-sm">CareerOS</span>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 w-72 focus-within:border-zinc-400 focus-within:bg-white transition-all">
            <Search size={13} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Search curriculum, resources..."
              className="bg-transparent text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none w-full"
              style={{ background: 'transparent !important', border: 'none !important', boxShadow: 'none !important' }}
            />
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Streak */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200">
              <Flame size={12} className="text-zinc-600" />
              <span className="text-[10px] font-bold font-mono text-zinc-700 tracking-wide">14-Day Streak</span>
            </div>

            {/* Date */}
            <div className="hidden lg:block text-right">
              <p className="text-[9px] text-zinc-400 font-mono tracking-wider uppercase">Platform Online</p>
              <p className="text-[11px] font-semibold text-zinc-700">Wednesday, Aug 12</p>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-500 hover:text-zinc-900 transition-colors relative"
              >
                <Bell size={14} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-zinc-900 rounded-full" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-zinc-200 rounded-xl shadow-dropdown p-2 z-50 text-[11px] animate-fade-in">
                  <div className="px-3 py-1.5 border-b border-zinc-100 flex items-center justify-between mb-1">
                    <span className="font-semibold text-zinc-900 text-xs">Notifications</span>
                    <button className="text-[10px] text-zinc-400 hover:text-zinc-900">Clear all</button>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {notifications.map((n, idx) => (
                      <div key={idx} className="px-3 py-2.5 hover:bg-zinc-50 rounded-lg transition-colors">
                        <p className="text-zinc-700 leading-snug">{n.text}</p>
                        <span className="text-[9px] text-zinc-400 mt-1 block font-mono">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div
              onClick={() => handleNavClick('profile')}
              className="flex items-center gap-2 cursor-pointer border border-zinc-200 hover:border-zinc-300 rounded-xl px-2 py-1.5 transition-all bg-white"
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-6 h-6 rounded-md object-cover border border-zinc-200"
              />
              <div className="hidden md:block text-left pr-1">
                <p className="text-[10px] font-semibold text-zinc-900 leading-none">{profile.name}</p>
                <p className="text-[8px] text-zinc-400 mt-0.5">{profile.title}</p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN RENDER AREA */}
        <main className="flex-1 p-5 sm:p-6 w-full bg-zinc-50">
          {children}
        </main>
      </div>

      {/* ── MOBILE SLIDEOUT ─────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 lg:hidden flex backdrop-blur-sm">
          <div className="w-64 flex flex-col bg-white border-r border-zinc-200 shadow-modal">
            <div className="h-14 flex items-center justify-between px-5 border-b border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
                  <GraduationCap size={14} className="text-zinc-900" />
                </div>
                <span className="font-display font-bold text-zinc-900">CareerOS</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-4 pt-5 pb-2">
              <span className="section-label">Navigation</span>
            </div>

            <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto px-3">
              {navigationItems.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive ? 'bg-zinc-900 text-zinc-900' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-zinc-200">
              <button
                onClick={() => handleNavClick('settings')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all w-full"
              >
                <Settings size={14} />
                <span>Settings & Preferences</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-14 border-t border-zinc-200 z-40 flex justify-around items-center px-2 bg-white">
        {[
          { id: 'dashboard', icon: Home, label: 'Home' },
          { id: 'daily-plan', icon: Calendar, label: 'Plan' },
          { id: 'goals', icon: Target, label: 'Goals' },
          { id: 'learning', icon: BookOpen, label: 'Learn' },
          { id: 'profile', icon: User, label: 'Me' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleNavClick(id as PageId)}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activePage === id ? 'text-zinc-900' : 'text-zinc-400'
            }`}
          >
            <Icon size={16} />
            <span className="text-[8px] font-semibold uppercase font-mono">{label}</span>
          </button>
        ))}
      </div>

    </div>
  );
};

export default Layout;
