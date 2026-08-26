import React, { useState, useEffect } from 'react';
import { 
  MapPin, Briefcase, GraduationCap, Globe, 
  Edit, Plus, Trash2, X, Save, Trophy, BookOpen, Target, FileText, CheckCircle2, Cpu
} from 'lucide-react';
import { stateManager } from '../services/stateManager';
import { Profile, Badge } from '../data/mockData';
import { Heatmap } from '../components/Heatmap';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Edit form states
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSchool, setEditSchool] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [editSkills, setEditSkills] = useState<{ name: string; level: number }[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(50);

  const loadProfile = () => {
    const data = stateManager.getProfile();
    setProfile(data);
    
    // Initialize edit states
    setEditName(data.name || '');
    setEditTitle(data.title || '');
    setEditUsername(data.username || '');
    setEditAvatar(data.avatar || '');
    setEditBio(data.bio || '');
    setEditCompany(data.company || '');
    setEditLocation(data.location || '');
    setEditSchool(data.school || '');
    setEditWebsite(data.website || '');
    setEditGithub(data.github || '');
    setEditLinkedin(data.linkedin || '');
    setEditTwitter(data.twitter || '');
    setEditSkills(data.skills ? [...data.skills] : []);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (!profile) {
    return <div className="text-center text-xs text-slate-500 py-10 italic">Loading profile parameters...</div>;
  }

  const handleSave = () => {
    const updatedProfile: Profile = {
      ...profile,
      name: editName,
      title: editTitle,
      username: editUsername,
      avatar: editAvatar,
      bio: editBio,
      company: editCompany,
      location: editLocation,
      school: editSchool,
      website: editWebsite,
      github: editGithub,
      linkedin: editLinkedin,
      twitter: editTwitter,
      skills: editSkills,
    };
    stateManager.saveProfile(updatedProfile);
    
    // Automatically log activity points for updating profile info, making today active (green)
    stateManager.logActivity(2);
    
    // Load updated profile from stateManager to ensure all data & stats are fully refreshed in UI
    loadProfile();
    setIsEditing(false);

    // Notify state listener of profile changes
    window.dispatchEvent(new CustomEvent('heatmap-updated'));
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    if (editSkills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) return;
    setEditSkills([...editSkills, { name: newSkillName.trim(), level: newSkillLevel }]);
    setNewSkillName('');
    setNewSkillLevel(50);
  };

  const handleRemoveSkill = (index: number) => {
    setEditSkills(editSkills.filter((_, i) => i !== index));
  };

  // Helper to format handle display
  const getDisplayHandle = (url: string, type: 'github' | 'linkedin' | 'twitter') => {
    if (!url) return '';
    try {
      const cleanUrl = url.replace(/\/$/, ""); // remove trailing slash
      const parts = cleanUrl.split('/');
      return parts[parts.length - 1];
    } catch {
      return url;
    }
  };

  // Badge tier styles helper for LeetCode-style custom glows
  const getBadgeTierStyle = (badgeId: string) => {
    // Gold/Legend Tier: 30, 100 days streaks and career complete
    if (['badge-2', 'badge-8', 'badge-10'].includes(badgeId)) {
      return {
        border: 'border-[#FFA116]/40 hover:border-[#FFA116] bg-[#FFA116]/5 hover:bg-[#FFA116]/10',
        shadow: 'shadow-[0_0_12px_rgba(255,161,22,0.12)] hover:shadow-[0_0_18px_rgba(255,161,22,0.22)]',
        color: 'text-[#FFA116]',
        glowBg: 'bg-[#FFA116]/10 border-[#FFA116]/30 shadow-[0_0_20px_rgba(255,161,22,0.2)]',
        textBadge: 'bg-[#FFA116]/10 text-[#FFA116] border border-[#FFA116]/20'
      };
    }
    // Purple/Epic Tier: goals completion, focus hours, project completion
    if (['badge-4', 'badge-6', 'badge-11'].includes(badgeId)) {
      return {
        border: 'border-purple-500/30 hover:border-purple-400 bg-purple-500/5 hover:bg-purple-500/10',
        shadow: 'shadow-[0_0_12px_rgba(168,85,247,0.12)] hover:shadow-[0_0_18px_rgba(168,85,247,0.22)]',
        color: 'text-purple-400',
        glowBg: 'bg-purple-500/10 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]',
        textBadge: 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
      };
    }
    // Blue/Rare Tier: 7, 50 day streaks, system architect, monthly active badges
    if (['badge-1', 'badge-3', 'badge-7', 'badge-9', 'badge-12', 'badge-13'].includes(badgeId)) {
      return {
        border: 'border-blue-500/30 hover:border-blue-400 bg-blue-500/5 hover:bg-blue-500/10',
        shadow: 'shadow-[0_0_12px_rgba(59,130,246,0.12)] hover:shadow-[0_0_18px_rgba(59,130,246,0.22)]',
        color: 'text-blue-400',
        glowBg: 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]',
        textBadge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
      };
    }
    // Green/Uncommon Tier: quiz master
    return {
      border: 'border-emerald-500/30 hover:border-emerald-450 bg-emerald-500/5 hover:bg-emerald-500/10',
      shadow: 'shadow-[0_0_12px_rgba(16,185,129,0.12)] hover:shadow-[0_0_18px_rgba(16,185,129,0.22)]',
      color: 'text-emerald-400',
      glowBg: 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
      textBadge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    };
  };

  // Calculate statistics progress angles (circumference 2 * pi * r = 2 * 3.14159 * 36 = 226)
  const totalCourses = 15; // Target
  const coursesPercent = Math.min(100, Math.round((profile.stats.coursesCompleted / totalCourses) * 100));
  const coursesStrokeDashOffset = 226 - (226 * coursesPercent) / 100;

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto text-slate-350 font-sans">
      
      {/* LEFT COLUMN: USER PROFILE SIDEBAR */}
      <div className="w-full lg:w-80 flex flex-col gap-5 shrink-0">
        
        {/* User Stats Card */}
        <div className="glass-panel p-5 flex flex-col gap-4 bg-slate-900/10">
          <div className="flex flex-col items-center text-center">
            {/* Avatar container */}
            <div className="w-28 h-28 rounded-xl overflow-hidden border border-brand-border shadow-md mb-3 bg-[#090a0f]">
              <img 
                src={profile.avatar} 
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <h2 className="text-lg font-bold font-sans text-white leading-tight">{profile.name}</h2>
            <p className="text-xs text-slate-500 font-mono">@{profile.username}</p>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mt-1">{profile.title}</p>
            
            {/* Edit button aligned with navy theme */}
            <button 
              onClick={() => setIsEditing(true)}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 border border-brand-border hover:border-slate-400 hover:text-white rounded-lg text-xs font-semibold bg-slate-955/40 hover:bg-slate-900/30 transition-colors uppercase tracking-wider font-sans"
            >
              <Edit size={12} className="text-indigo-400" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="border-t border-brand-border/40 my-1" />

          {/* User Bio */}
          <div className="text-xs text-slate-400 leading-relaxed italic font-sans">
            {profile.bio || "No profile bio configured. Add one to show the community your goals!"}
          </div>

          <div className="border-t border-brand-border/40 my-1" />

          {/* Profile metadata info */}
          <div className="flex flex-col gap-2.5 text-xs text-slate-455 font-medium font-sans">
            {profile.location && (
              <div className="flex items-center gap-2.5">
                <MapPin size={14} className="text-slate-500 shrink-0" />
                <span className="truncate">{profile.location}</span>
              </div>
            )}
            {profile.company && (
              <div className="flex items-center gap-2.5">
                <Briefcase size={14} className="text-slate-500 shrink-0" />
                <span className="truncate">{profile.company}</span>
              </div>
            )}
            {profile.school && (
              <div className="flex items-center gap-2.5">
                <GraduationCap size={14} className="text-slate-500 shrink-0" />
                <span className="truncate">{profile.school}</span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-2.5">
                <Globe size={14} className="text-slate-500 shrink-0" />
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline truncate">
                  {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </div>
            )}
          </div>

          <div className="border-t border-brand-border/40 my-1" />

          {/* Socials connections */}
          <div className="flex flex-col gap-2.5 text-xs text-slate-455 font-medium font-sans">
            {profile.github && (
              <div className="flex items-center gap-2.5">
                <div className="text-slate-500 shrink-0">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.35-2.2-.25-4.52-1.1-4.52-4.9 0-1.08.38-1.96 1.03-2.65-.1-.26-.45-1.27.1-2.64 0 0 .83-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.38.1 2.64.65.7 1.03 1.57 1.03 2.65 0 3.8-2.3 4.65-4.5 4.9.35.3.66.9.66 1.81V21c0 .27.16.59.67.5A10 10 0 0 0 22 12A10 10 0 0 0 12 2z"/></svg>
                </div>
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="hover:text-white truncate">
                  {getDisplayHandle(profile.github, 'github')}
                </a>
              </div>
            )}
            {profile.linkedin && (
              <div className="flex items-center gap-2.5">
                <div className="text-slate-500 shrink-0">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </div>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white truncate">
                  {getDisplayHandle(profile.linkedin, 'linkedin')}
                </a>
              </div>
            )}
            {profile.twitter && (
              <div className="flex items-center gap-2.5">
                <div className="text-slate-500 shrink-0">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </div>
                <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-white truncate">
                  @{getDisplayHandle(profile.twitter, 'twitter')}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Skill tags Grid Card */}
        <div className="glass-panel p-5 flex flex-col gap-3 bg-slate-900/10">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-brand-border/40 pb-2 flex items-center gap-1.5 font-sans">
            <Cpu size={13} className="text-indigo-400" />
            <span>Technologies & Skills</span>
          </h3>
          
          <div className="flex flex-wrap gap-1.5 mt-1 font-sans">
            {profile.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill, idx) => (
                <div 
                  key={idx} 
                  className="px-2.5 py-1 rounded bg-slate-955/40 border border-brand-border/60 text-[10px] font-medium text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-900/10 transition-all flex items-center gap-1.5 select-none"
                  title={`Mastery: ${skill.level}%`}
                >
                  <span>{skill.name}</span>
                  <span className="text-[9px] text-slate-500 font-bold font-mono">{skill.level}%</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No skills listed. Click edit to customize!</span>
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: MAIN PLATFORM BOARD */}
      <div className="flex-1 flex flex-col gap-5">

        {/* PROGRESS METRICS HUD CARD */}
        <div className="glass-panel p-5 flex flex-col sm:flex-row gap-6 items-center justify-around bg-slate-900/10 font-sans">
          
          {/* Circular progress wheel */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                <circle 
                  cx="40" cy="40" r="36" 
                  className="stroke-slate-800/40 fill-none" 
                  strokeWidth="6"
                />
                <circle 
                  cx="40" cy="40" r="36" 
                  className="stroke-emerald-500 fill-none transition-all duration-1000" 
                  strokeWidth="6"
                  strokeDasharray="226"
                  strokeDashoffset={coursesStrokeDashOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-bold font-mono text-white leading-none">
                  {profile.stats.coursesCompleted}
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  Complete
                </span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none font-sans">Syllabus Completion</h4>
              <p className="text-xs text-slate-500 mt-1.5 font-semibold">Target Course Level: {totalCourses} Courses</p>
              <div className="w-28 h-1.5 bg-slate-800/40 rounded-full overflow-hidden mt-1.5">
                <div style={{ width: `${coursesPercent}%` }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>

          <div className="hidden sm:block border-l border-brand-border/40 h-14" />

          {/* Breakdowns columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3.5 text-xs w-full sm:w-auto font-sans">
            <div className="flex items-center justify-between gap-6 bg-slate-950/40 px-3.5 py-2 rounded-lg border border-brand-border">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Target size={13} className="text-indigo-400" />
                <span>Goals Completed</span>
              </div>
              <span className="font-mono font-bold text-white text-sm">{profile.stats.goalsCompleted}</span>
            </div>

            <div className="flex items-center justify-between gap-6 bg-slate-955/40 px-3.5 py-2 rounded-lg border border-brand-border">
              <div className="flex items-center gap-1.5 font-semibold text-slate-350">
                <FileText size={13} className="text-[#FFA116]" />
                <span>Quizzes Taken</span>
              </div>
              <span className="font-mono font-bold text-white text-sm">{profile.stats.quizzesCompleted}</span>
            </div>

            <div className="flex items-center justify-between gap-6 bg-slate-955/40 px-3.5 py-2 rounded-lg border border-brand-border">
              <div className="flex items-center gap-1.5 font-semibold text-slate-350">
                <CheckCircle2 size={13} className="text-emerald-450" />
                <span>Projects Built</span>
              </div>
              <span className="font-mono font-bold text-white text-sm">{profile.stats.projectsCompleted}</span>
            </div>

            <div className="flex items-center justify-between gap-6 bg-slate-955/40 px-3.5 py-2 rounded-lg border border-brand-border">
              <div className="flex items-center gap-1.5 font-semibold text-slate-355">
                <BookOpen size={13} className="text-blue-400" />
                <span>Focus Duration</span>
              </div>
              <span className="font-mono font-bold text-white text-sm">{profile.stats.learningHours}h</span>
            </div>
          </div>

        </div>

        {/* Heatmap Section */}
        <div className="w-full">
          <Heatmap />
        </div>

        {/* BADGES & RECENT ACTIVITIES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-sans">
          
          {/* Badges Cabinet Showcase */}
          <div className="glass-panel p-5 flex flex-col gap-4 bg-slate-900/10">
            <h3 className="text-xs font-bold text-white border-b border-brand-border/40 pb-2.5 uppercase tracking-wider flex items-center gap-2 font-sans">
              <Trophy size={14} className="text-[#FFA116]" />
              <span>Badges Cabinet</span>
            </h3>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 py-1">
              {stateManager.getBadges().map((badge) => {
                const tier = getBadgeTierStyle(badge.id);
                return (
                  <div 
                    key={badge.id}
                    onClick={() => badge.unlocked && setSelectedBadge(badge)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all duration-300 ${
                      badge.unlocked 
                        ? `${tier.border} ${tier.shadow} cursor-pointer hover:scale-105 active:scale-95` 
                        : 'bg-slate-950/15 border-brand-border/10 opacity-20 select-none cursor-not-allowed'
                    }`}
                    title={badge.unlocked ? `Click to inspect: ${badge.title}` : 'Locked badge'}
                  >
                    <span className="text-3xl filter drop-shadow animate-hover-float">{badge.icon}</span>
                    <span className={`text-[8px] font-bold mt-2 truncate max-w-full font-mono uppercase tracking-wider ${badge.unlocked ? tier.color : 'text-slate-500'}`}>
                      {badge.title.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent logs activity */}
          <div className="glass-panel p-5 flex flex-col gap-4 bg-slate-900/10">
            <h3 className="text-xs font-bold text-white border-b border-brand-border/40 pb-2.5 uppercase tracking-wider font-sans">
              ⚡ Recent Logs
            </h3>
            
            <div className="flex flex-col gap-3.5 text-xs">
              {profile.recentActivity && profile.recentActivity.length > 0 ? (
                profile.recentActivity.map((act) => (
                  <div 
                    key={act.id} 
                    className="flex items-center justify-between border-b border-brand-border/30 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-slate-300 truncate">{act.text}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold font-mono shrink-0 select-none pl-2">
                      {act.timestamp}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No recent log entries reported.</span>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* EDIT PROFILE DIALOG MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="glass-panel bg-[#0c0d15]/95 border border-brand-border w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in text-xs text-slate-355 font-sans">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border/40">
              <div className="flex items-center gap-2">
                <Edit size={14} className="text-[#FFA116]" />
                <h3 className="text-sm font-bold text-white font-sans">Edit Growth Profile Parameters</h3>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-[#2b2b2b]/40 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5">
              
              {/* Basic Details */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <h4 className="font-bold text-[#FFA116] uppercase tracking-widest text-[9px] mb-1">Identity & Avatar</h4>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold mb-0.5">Full Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-[#0f111a] border border-brand-border focus:border-indigo-500 rounded px-3 py-1.5 text-white focus:outline-none transition-colors"
                  placeholder="e.g. Deepak Chaudhary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold mb-0.5">Username</label>
                <input 
                  type="text" 
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="bg-[#0f111a] border border-brand-border focus:border-indigo-500 rounded px-3 py-1.5 text-white focus:outline-none transition-colors"
                  placeholder="e.g. deepak_c"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold mb-0.5">Job Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-[#0f111a] border border-brand-border focus:border-indigo-500 rounded px-3 py-1.5 text-white focus:outline-none transition-colors"
                  placeholder="e.g. AI Product Engineer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold mb-0.5">Avatar URL</label>
                <input 
                  type="text" 
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="bg-[#0f111a] border border-brand-border focus:border-indigo-500 rounded px-3 py-1.5 text-white focus:outline-none transition-colors"
                  placeholder="Paste URL"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-slate-400 font-semibold mb-0.5">Bio / About Me</label>
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="bg-[#0f111a] border border-brand-border focus:border-indigo-500 rounded px-3 py-1.5 text-white focus:outline-none resize-none leading-relaxed transition-colors"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Professional Metadata */}
              <div className="flex flex-col gap-1.5 md:col-span-2 mt-2">
                <h4 className="font-bold text-[#FFA116] uppercase tracking-widest text-[9px] mb-1">Professional details</h4>
                <div className="border-b border-brand-border/40" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold mb-0.5">Company / Org</label>
                <input 
                  type="text" 
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="bg-[#0f111a] border border-brand-border focus:border-indigo-500 rounded px-3 py-1.5 text-white focus:outline-none transition-colors"
                  placeholder="e.g. Deepmind"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold mb-0.5">Location</label>
                <input 
                  type="text" 
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="bg-[#0f111a] border border-brand-border focus:border-indigo-500 rounded px-3 py-1.5 text-white focus:outline-none transition-colors"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold mb-0.5">School / Uni</label>
                <input 
                  type="text" 
                  value={editSchool}
                  onChange={(e) => setEditSchool(e.target.value)}
                  className="bg-[#0f111a] border border-brand-border focus:border-indigo-500 rounded px-3 py-1.5 text-white focus:outline-none transition-colors"
                  placeholder="e.g. Stanford University"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold mb-0.5">Website / Portfolio</label>
                <input 
                  type="text" 
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="bg-[#0f111a] border border-brand-border focus:border-indigo-500 rounded px-3 py-1.5 text-white focus:outline-none transition-colors"
                  placeholder="e.g. https://deepak.ai"
                />
              </div>

              {/* Social Connections */}
              <div className="flex flex-col gap-1.5 md:col-span-2 mt-2">
                <h4 className="font-bold text-[#FFA116] uppercase tracking-widest text-[9px] mb-1">Social handles</h4>
                <div className="border-b border-brand-border/40" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold mb-0.5">GitHub URL</label>
                <input 
                  type="text" 
                  value={editGithub}
                  onChange={(e) => setEditGithub(e.target.value)}
                  className="bg-[#0f111a] border border-brand-border focus:border-indigo-500 rounded px-3 py-1.5 text-white focus:outline-none transition-colors"
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold mb-0.5">LinkedIn URL</label>
                <input 
                  type="text" 
                  value={editLinkedin}
                  onChange={(e) => setEditLinkedin(e.target.value)}
                  className="bg-[#0f111a] border border-brand-border focus:border-indigo-500 rounded px-3 py-1.5 text-white focus:outline-none transition-colors"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-slate-400 font-semibold mb-0.5">Twitter URL</label>
                <input 
                  type="text" 
                  value={editTwitter}
                  onChange={(e) => setEditTwitter(e.target.value)}
                  className="bg-[#0f111a] border border-brand-border focus:border-indigo-500 rounded px-3 py-1.5 text-white focus:outline-none transition-colors"
                  placeholder="https://twitter.com/username"
                />
              </div>

              {/* SKILLS TAG MANAGER */}
              <div className="flex flex-col gap-1.5 md:col-span-2 mt-2">
                <h4 className="font-bold text-[#FFA116] uppercase tracking-widest text-[9px] mb-1">Skills tag manager</h4>
                <div className="border-b border-brand-border/40" />
              </div>

              {/* New Skill adding controls */}
              <div className="flex gap-2 items-end md:col-span-2">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold mb-0.5">Add Skill Tag</label>
                  <input 
                    type="text" 
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="bg-[#0f111a] border border-brand-border focus:border-indigo-500 rounded px-3 py-1.5 text-white focus:outline-none transition-colors"
                    placeholder="e.g. Next.js, PyTorch..."
                  />
                </div>
                <div className="w-28 flex flex-col gap-1 shrink-0">
                  <label className="text-slate-400 font-semibold mb-0.5">Level ({newSkillLevel}%)</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#0f111a] rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none border border-brand-border"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded flex items-center justify-center gap-1 transition-colors uppercase tracking-wider text-[10px]"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>

              {/* Skills current listing and removal */}
              <div className="flex flex-col gap-1.5 md:col-span-2 mt-2 bg-[#090a14]/65 p-3 rounded-lg border border-brand-border/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase select-none mb-1 block">Active tags ({editSkills.length})</span>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {editSkills.map((skill, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0f111a]/70 border border-brand-border hover:border-slate-400 text-slate-355"
                    >
                      <span className="font-semibold">{skill.name}</span>
                      <span className="font-bold text-slate-500 font-mono text-[9px]">{skill.level}%</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(index)}
                        className="text-slate-500 hover:text-rose-500 p-0.5 rounded-full hover:bg-slate-900 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {editSkills.length === 0 && (
                    <span className="text-[10px] text-slate-500 italic select-none">No custom skills tags created.</span>
                  )}
                </div>
              </div>

            </div>

            {/* Footer actions */}
            <div className="px-5 py-4 border-t border-brand-border/40 flex items-center justify-end gap-2 bg-[#08090f]/90">
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-brand-border bg-transparent hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg font-bold font-sans tracking-wide uppercase transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold font-sans tracking-wide uppercase flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20"
              >
                <Save size={13} />
                <span>Save Changes</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CLICKABLE BADGE POPUP DETAILS MODAL */}
      {selectedBadge && (() => {
        const tier = getBadgeTierStyle(selectedBadge.id);
        return (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
            <div className={`glass-panel w-full max-w-sm p-6 text-center flex flex-col items-center gap-4 relative shadow-2xl bg-[#0c0d18]/95 border backdrop-blur-xl animate-fade-in text-slate-355 font-sans ${tier.border} ${tier.shadow}`}>
              {/* Close button */}
              <button 
                onClick={() => setSelectedBadge(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 hover:bg-[#2b2b2b]/40 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
              
              {/* Glow circle background matching tier */}
              <div className={`relative w-24 h-24 flex items-center justify-center rounded-full border animate-pulse ${tier.glowBg}`}>
                <span className="text-5xl filter drop-shadow">{selectedBadge.icon}</span>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-sans">{selectedBadge.title}</h3>
                <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider uppercase ${tier.textBadge}`}>
                  Unlocked
                </span>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">{selectedBadge.description}</p>
              
              {selectedBadge.unlockedAt && (
                <div className="text-[10px] text-slate-500 font-mono">
                  Unlocked on {new Date(selectedBadge.unlockedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              )}

              <button
                onClick={() => setSelectedBadge(null)}
                className="mt-2 px-5 py-2 w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-lg tracking-wider uppercase text-[10px]"
              >
                Close Details
              </button>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
export default ProfilePage;
