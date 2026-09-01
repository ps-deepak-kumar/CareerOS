import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageId } from '../components/Layout';
import {
  BookOpen, Clock, Star, Play, Search, Award, Cpu, Sparkles,
  SlidersHorizontal, ArrowLeft, CheckCircle2, AlertTriangle, ChevronDown,
  ChevronUp, Bookmark, BookmarkCheck, Trash2, X, Plus,
  Building2, GraduationCap, Film, Cloud, Video, LayoutGrid, List,
  Filter, Check, ExternalLink, Code2, ShieldCheck, Compass, PlayCircle,
  Layers, Flame, CheckCircle
} from 'lucide-react';
import { stateManager } from '../services/stateManager';
import { Course } from '../data/mockData';
import { learningMcp } from '../services/mcp/learningMcp';
import { getGithubReposForTopic, getVideoProjectsForTopic } from '../data/coursesData';
import { showToast } from '../components/ToastContainer';

interface LearningProps {
  onNavigate: (page: PageId) => void;
  setSelectedCourseIdForDetails: (id: string) => void;
}

const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 13, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const Learning: React.FC<LearningProps> = ({ onNavigate, setSelectedCourseIdForDetails }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'wishlist' | 'completed' | 'discovery'>('my');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Intake & Filter states
  const [searchTopic, setSearchTopic] = useState('');
  const [currentLevel, setCurrentLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');
  const [providerCategory, setProviderCategory] = useState<'all' | 'university' | 'enterprise' | 'community'>('all');
  const [learningGoal, setLearningGoal] = useState<string>('Master the subject');
  const [dailyCommitment, setDailyCommitment] = useState<string>('1 hour/day');

  // Discovery flow states
  const [discoveryState, setDiscoveryState] = useState<'idle' | 'searching' | 'results'>('idle');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [agentSearchLogs, setAgentSearchLogs] = useState<string[]>([]);

  // Delete modal state
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const refreshCourses = useCallback(() => {
    setCourses(stateManager.getCourses());
  }, []);

  useEffect(() => {
    refreshCourses();
    const handleCoursesUpdated = () => refreshCourses();
    window.addEventListener('courses-updated', handleCoursesUpdated);
    return () => window.removeEventListener('courses-updated', handleCoursesUpdated);
  }, [refreshCourses]);

  const handleStartCourse = (courseId: string) => {
    try {
      localStorage.setItem('career_os_active_course_id', courseId);
    } catch {}
    setSelectedCourseIdForDetails(courseId);
    onNavigate('course-details');
  };

  const handleOpenRoadmapForCourse = (courseId: string) => {
    try {
      localStorage.setItem('career_os_active_course_id', courseId);
    } catch {}
    setSelectedCourseIdForDetails(courseId);
    onNavigate('roadmap');
  };

  const handleRemoveCourse = (id: string) => {
    const updated = stateManager.removeCourse(id);
    setCourses(updated);
    setConfirmRemoveId(null);
    showToast('Course removed from your cabinet.', 'info');
  };

  const handleWishlist = (id: string) => {
    const updated = stateManager.addCourseToWishlist(id);
    setCourses(updated);
    showToast('Saved course to your Wishlist!', 'success');
  };

  const handleMoveToActive = (id: string) => {
    const updated = stateManager.moveCourseToActive(id);
    setCourses(updated);
    showToast('Moved course to Active curriculum!', 'success');
  };

  const getBadgeColor = (providerText: string = '') => {
    const p = providerText.toLowerCase();
    if (p.includes('ibm')) return 'bg-zinc-100 text-zinc-700 border-blue-700/50';
    if (p.includes('microsoft')) return 'bg-zinc-100 text-zinc-600 border-cyan-700/50';
    if (p.includes('meta')) return 'bg-zinc-100 text-zinc-700 border-blue-700/50';
    if (p.includes('netflix')) return 'bg-zinc-100 text-zinc-600 border-rose-700/50';
    if (p.includes('aws') || p.includes('amazon')) return 'bg-zinc-100 text-zinc-600 border-amber-700/50';
    if (p.includes('mit') || p.includes('stanford') || p.includes('harvard')) return 'bg-zinc-100 text-zinc-700 border-zinc-300';
    return 'bg-zinc-50 text-zinc-600 border-zinc-200';
  };

  const renderStars = (rating: number = 4.8) => {
    return (
      <div className="flex items-center gap-1 font-mono text-xs select-none bg-zinc-100 border border-amber-500/30 px-2 py-0.5 rounded-full">
        <Star size={11} className="fill-amber-400 text-zinc-600" />
        <span className="font-bold text-zinc-600">{rating}</span>
      </div>
    );
  };

  // Filtered Course Collections
  const activeCourses = courses.filter(c => c.courseStatus !== 'wishlist' && !c.wishlist && c.progress < 100);
  const wishlistCourses = courses.filter(c => c.courseStatus === 'wishlist' || c.wishlist === true);
  const completedCourses = courses.filter(c => c.progress === 100 && !c.wishlist);

  const currentTabBaseCourses =
    activeTab === 'my' ? activeCourses :
    activeTab === 'wishlist' ? wishlistCourses :
    activeTab === 'completed' ? completedCourses :
    [];

  const filteredCourses = useMemo(() => {
    return currentTabBaseCourses.filter(c => {
      // Difficulty filter
      if (difficultyFilter !== 'all' && c.difficulty !== difficultyFilter) return false;

      // Provider filter
      const p = (c.provider || '').toLowerCase();
      if (providerCategory === 'university' && !p.includes('stanford') && !p.includes('mit') && !p.includes('harvard') && !p.includes('university')) return false;
      if (providerCategory === 'enterprise' && !p.includes('ibm') && !p.includes('microsoft') && !p.includes('meta') && !p.includes('netflix') && !p.includes('aws')) return false;
      if (providerCategory === 'community' && !p.includes('youtube') && !p.includes('community') && !p.includes('open')) return false;

      // Search query filter
      if (searchTopic.trim()) {
        const q = searchTopic.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesDesc = (c.description || '').toLowerCase().includes(q);
        const matchesInstructor = (c.instructor || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesInstructor) return false;
      }

      return true;
    });
  }, [currentTabBaseCourses, difficultyFilter, providerCategory, searchTopic]);

  const handleSearchSubmit = async (topic: string) => {
    if (!topic.trim()) return;
    setDiscoveryState('searching');
    setAgentSearchLogs([]);

    const steps = [
      '🔍 [Learning Intake Agent] Parsing query parameters, goal, and skill index...',
      '📡 [Course Discovery Agent] Crawling Stanford, MIT OpenCourseWare, and GitHub repositories...',
      '⭐ [Repository Curator] Filtering top-starred open-source reference implementations...',
      '🎥 [Video Lab Agent] Matching verified project builds & practical coding walkthroughs...',
      '📊 [Evaluation Agent] Compiling multi-dimensional scores and curriculum blueprints...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setAgentSearchLogs(prev => [...prev, steps[i]]);
      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Course Discovery Agent',
        action: 'curate_curriculum',
        status: 'success',
        message: steps[i]
      });
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const results = await learningMcp.search_courses(topic, currentLevel, learningGoal);
    if (results.length === 0) {
      const generated = await learningMcp.build_learning_roadmap(topic, currentLevel, learningGoal, dailyCommitment);
      setSearchResults([generated]);
    } else {
      setSearchResults(results);
    }
    setDiscoveryState('results');
  };

  const handleEnrollCourse = async (selectedCourse: Course) => {
    if (!selectedCourse.githubRepos || selectedCourse.githubRepos.length === 0) {
      selectedCourse.githubRepos = getGithubReposForTopic(selectedCourse.title);
    }
    if (!selectedCourse.videoProjects || selectedCourse.videoProjects.length === 0) {
      selectedCourse.videoProjects = getVideoProjectsForTopic(selectedCourse.title);
    }

    stateManager.addCourseWithRoadmap(selectedCourse);
    refreshCourses();
    setActiveTab('my');
    setDiscoveryState('idle');
    showToast(`Enrolled in "${selectedCourse.title}"! Added to your active cabinet.`, 'success');
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-12 font-sans text-zinc-700">

      {/* TOP HEADER */}
      <div className="glass-panel p-5 border border-zinc-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-100/25 via-purple-500/20 to-blue-500/15 border border-zinc-300 flex items-center justify-center shrink-0 text-2xl shadow-inner">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-zinc-900 tracking-tight">
                Curriculum & Masterclass Cabinets
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-300 flex items-center gap-1">
                <Sparkles size={11} className="text-zinc-600" />
                AI Powered
              </span>
            </div>
            <p className="text-xs text-zinc-600 mt-1">
              Personalized university-grade textbooks, curated production GitHub repositories, and step-by-step video lab builds.
            </p>
          </div>
        </div>

        {/* Live Status Counters */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider w-full md:w-auto justify-between md:justify-end">
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-100 border border-zinc-300 text-zinc-700 shadow-sm">
            {activeCourses.length} Active
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-100 border border-amber-800/50 text-zinc-600 shadow-sm">
            {wishlistCourses.length} Wishlist
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-100 border border-emerald-800/50 text-zinc-600 shadow-sm">
            {completedCourses.length} Mastered
          </div>
        </div>
      </div>

      {/* SEARCH, VIEW CONTROLS & MAIN TAB SWITCHER */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-zinc-200 pb-3">
        
        {/* Tab Buttons */}
        <div className="flex bg-white p-1.5 rounded-xl border border-zinc-200 overflow-x-auto text-xs gap-1 shadow-md">
          {([
            { id: 'my', label: 'Active Curriculums', count: activeCourses.length },
            { id: 'wishlist', label: '🔖 Saved Wishlist', count: wishlistCourses.length },
            { id: 'completed', label: '✓ Completed', count: completedCourses.length },
            { id: 'discovery', label: '✨ AI Course Discoverer', count: null },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'discovery' && discoveryState === 'idle') {
                  setDiscoveryState('searching');
                  handleSearchSubmit('Agentic AI & LLMs');
                }
              }}
              className={`px-4 py-2 rounded-lg font-bold font-sans uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-zinc-800 to-zinc-900 text-zinc-900 shadow-md shadow-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Layout View Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3.5 py-2 w-full md:w-64 focus-within:border-zinc-300 transition-all text-xs shadow-inner">
            <Search size={13} className="text-zinc-700 shrink-0" />
            <input 
              type="text" 
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              placeholder="Search courses, topics..."
              className="bg-transparent text-xs text-zinc-900 placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          <div className="flex bg-white p-1 rounded-xl border border-zinc-200 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-zinc-900 text-zinc-900 font-bold shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-zinc-900 text-zinc-900 font-bold shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="List View"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS & LEVEL SELECTORS */}
      {activeTab !== 'discovery' && (
        <div className="flex items-center justify-between gap-3 flex-wrap bg-white border border-zinc-200 p-3 rounded-2xl shadow-md">
          {/* Level Filter */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 pl-1">Level:</span>
            {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all ${
                  difficultyFilter === diff
                    ? 'bg-zinc-900 text-zinc-900 shadow-sm'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {diff === 'all' ? 'All Levels' : diff}
              </button>
            ))}
          </div>

          {/* Provider Filter */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 pl-1">Provider:</span>
            {(['all', 'university', 'enterprise', 'community'] as const).map(prov => (
              <button
                key={prov}
                onClick={() => setProviderCategory(prov)}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-sans uppercase tracking-wider capitalize transition-all ${
                  providerCategory === prov
                    ? 'bg-slate-700 text-zinc-900 font-bold shadow-sm'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {prov === 'all' ? 'All Providers' : prov}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION 1: ENHANCED HIGH-CONTRAST COURSE CARDS ================= */}
      {activeTab !== 'discovery' && (
        <>
          {filteredCourses.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => {
                  const isWishlist = activeTab === 'wishlist';
                  const isCompleted = course.progress === 100;
                  const isConfirmingRemove = confirmRemoveId === course.id;

                  const githubList = course.githubRepos && course.githubRepos.length > 0 
                    ? course.githubRepos 
                    : getGithubReposForTopic(course.title);

                  const videoList = course.videoProjects && course.videoProjects.length > 0
                    ? course.videoProjects
                    : getVideoProjectsForTopic(course.title);

                  return (
                    <div
                      key={course.id}
                      className="p-5 bg-zinc-50 to-zinc-50 border-2 border-zinc-300 hover:border-zinc-300 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1.5 shadow-card hover:shadow-[0_20px_45px_rgba(99,102,241,0.28)] relative group overflow-hidden"
                    >
                      {/* Top Accent Gradient Bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-50 to-cyan-400" />

                      {/* Top Action Hover Overlay */}
                      <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        {!isWishlist ? (
                          <button
                            title="Save to Wishlist"
                            onClick={() => handleWishlist(course.id)}
                            className="p-1.5 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-600 hover:border-amber-500/50 transition-all shadow-md"
                          >
                            <Bookmark size={13} />
                          </button>
                        ) : (
                          <button
                            title="Move to Active"
                            onClick={() => handleMoveToActive(course.id)}
                            className="p-1.5 rounded-lg bg-zinc-100 border border-amber-900/50 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 transition-all shadow-md"
                          >
                            <BookmarkCheck size={13} />
                          </button>
                        )}
                        <button
                          title="Remove Course"
                          onClick={() => setConfirmRemoveId(course.id)}
                          className="p-1.5 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-600 hover:border-rose-500/50 transition-all shadow-md"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Remove confirmation overlay */}
                      {isConfirmingRemove && (
                        <div className="absolute inset-0 bg-black/95 backdrop-blur-md rounded-2xl z-20 flex flex-col items-center justify-center gap-3 p-5 text-center">
                          <p className="text-sm text-zinc-900 font-bold">Remove this curriculum?</p>
                          <p className="text-xs text-zinc-500">Will be removed from your active courses.</p>
                          <div className="flex gap-2.5 mt-2">
                            <button onClick={() => setConfirmRemoveId(null)} className="btn-secondary text-xs py-1.5 px-4">
                              Cancel
                            </button>
                            <button onClick={() => handleRemoveCourse(course.id)} className="px-4 py-1.5 rounded-lg text-xs font-bold text-zinc-900 bg-red-600 hover:bg-red-500 transition-colors shadow-md">
                              Remove
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Top Metadata Banner */}
                      <div className="flex items-center justify-between gap-2 border-b border-zinc-300 pb-3 pt-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-1 rounded-md text-[9.5px] font-mono font-bold uppercase tracking-wider border shadow-sm ${
                            course.difficulty === 'Beginner' ? 'bg-zinc-100 text-zinc-600 border-emerald-600/50' :
                            course.difficulty === 'Intermediate' ? 'bg-zinc-100 text-zinc-700 border-zinc-300' :
                            'bg-zinc-100 text-zinc-700 border-purple-600/50'
                          }`}>
                            {course.difficulty}
                          </span>
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold uppercase border truncate max-w-[140px] shadow-sm ${getBadgeColor(course.provider)}`}>
                            {course.provider || 'University Track'}
                          </span>
                        </div>
                        {renderStars(course.rating || 4.9)}
                      </div>

                      {/* Title & Description */}
                      <div className="flex flex-col gap-2.5">
                        <h3 className="text-base font-bold font-sans text-zinc-900 group-hover:text-zinc-700 transition-colors leading-snug">
                          {course.title}
                        </h3>
                        <p className="text-xs text-zinc-700 leading-relaxed line-clamp-2 font-normal">
                          {course.description || 'Comprehensive curriculum modules, chapter analogies, and verifiable capstones.'}
                        </p>

                        {/* Curated Assets Highlight Strip */}
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-600 bg-white p-2.5 rounded-xl border border-zinc-300 shadow-inner">
                          <div className="flex items-center gap-1.5 text-zinc-700 font-bold justify-center">
                            <GithubIcon size={12} className="text-zinc-600" />
                            <span>{githubList.length} Repos</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-600 font-bold justify-center border-x border-zinc-200">
                            <Video size={12} className="text-zinc-600" />
                            <span>{videoList.length} Labs</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-600 font-bold justify-center">
                            <Layers size={12} className="text-zinc-600" />
                            <span>{course.chapters.length} Chs</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress & Actions */}
                      <div className="space-y-3 pt-3 border-t border-zinc-300">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-600 font-semibold">Course Progress</span>
                          <span className="text-zinc-600 font-bold">{course.progress}% Completed</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-50 rounded-full overflow-hidden border border-zinc-200 shadow-inner">
                          <div className="h-full bg-zinc-50 to-teal-300 rounded-full transition-all duration-700" style={{ width: `${course.progress}%` }} />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                          <button
                            onClick={() => handleStartCourse(course.id)}
                            className="btn-primary py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-zinc-200"
                          >
                            <Play size={11} fill="currentColor" />
                            <span>{isCompleted ? 'Review' : 'Open Course'}</span>
                          </button>
                          
                          <button
                            onClick={() => handleOpenRoadmapForCourse(course.id)}
                            className="btn-secondary py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Compass size={13} />
                            <span>Roadmap</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View Mode */
              <div className="space-y-3.5">
                {filteredCourses.map(course => (
                  <div
                    key={course.id}
                    className="p-4 bg-zinc-50 to-zinc-50 border-2 border-zinc-300 hover:border-zinc-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-lg hover:shadow-zinc-200"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-300 flex items-center justify-center text-xl shrink-0 shadow-inner">
                        📖
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-zinc-900 truncate">{course.title}</h4>
                          <span className="text-[9.5px] font-mono font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300 uppercase">
                            {course.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-0.5 truncate">{course.instructor || course.provider} • {course.estimatedTime || '8h'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                      <div className="text-right font-mono text-xs hidden md:block">
                        <span className="text-[10px] text-zinc-500 uppercase block font-sans">Progress</span>
                        <span className="text-zinc-600 font-bold">{course.progress}%</span>
                      </div>

                      <button
                        onClick={() => handleStartCourse(course.id)}
                        className="btn-primary py-2 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-zinc-200"
                      >
                        <Play size={11} fill="currentColor" />
                        <span>Study Course</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="py-20 text-center text-zinc-500 italic text-xs bg-zinc-100 rounded-2xl border border-dashed border-zinc-200">
              No curriculums found matching this filter. Switch filters or use the <strong>AI Course Discoverer</strong>!
            </div>
          )}
        </>
      )}

      {/* ================= SECTION 2: AI COURSE DISCOVERY ENGINE ================= */}
      {activeTab === 'discovery' && (
        <div className="glass-panel p-6 bg-zinc-100 border border-zinc-200 rounded-2xl shadow-xl flex flex-col gap-6">
          <div className="border-b border-zinc-200 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-zinc-700" />
              <span>Autonomous Multi-Agent Curriculum Discovery</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Enter any technical subject or framework to autonomously crawl universities, GitHub codebases, and video projects.
            </p>
          </div>

          {/* Prompt Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              placeholder="e.g. Scalable Vector RAG Systems, Multi-Agent MCP, React 19..."
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-slate-500 focus:outline-none focus:border-zinc-300 shadow-inner"
            />
            <button
              onClick={() => handleSearchSubmit(searchTopic || 'Agentic AI')}
              className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-zinc-200"
            >
              <Sparkles size={13} className="text-zinc-600" />
              <span>Generate Course & Labs</span>
            </button>
          </div>

          {/* Discovery State Logs */}
          {discoveryState === 'searching' && (
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-xs space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">Live Agent Stream:</span>
              {agentSearchLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-2 text-zinc-700 animate-fade-in">
                  <CheckCircle2 size={13} className="text-zinc-600 shrink-0" />
                  <span>{log}</span>
                </div>
              ))}
            </div>
          )}

          {/* Discovery Results Grid */}
          {discoveryState === 'results' && searchResults.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold font-mono text-zinc-700 uppercase tracking-wider">
                {searchResults.length} Autonomous Masterclasses Structured:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {searchResults.map(res => (
                  <div 
                    key={res.id}
                    className="p-5 bg-zinc-50 to-zinc-50 border-2 border-zinc-300 rounded-2xl flex flex-col justify-between gap-4 shadow-xl"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9.5px] font-mono font-bold text-zinc-700 bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-300 uppercase">
                          {res.provider || 'Stanford & MIT Track'}
                        </span>
                        {renderStars(res.rating || 4.9)}
                      </div>

                      <h3 className="text-base font-bold text-zinc-900 leading-snug">{res.title}</h3>
                      <p className="text-xs text-zinc-700 mt-2 leading-relaxed font-normal">{res.description}</p>

                      <div className="flex items-center gap-2 mt-3 text-[10px] font-mono text-zinc-600 bg-white p-2.5 rounded-xl border border-zinc-300">
                        <span className="text-zinc-600 font-bold">✓ {res.chapters.length} Modules</span>
                        <span>•</span>
                        <span className="text-zinc-600 font-bold">⭐ {res.githubRepos?.length || 3} GitHub Repos</span>
                        <span>•</span>
                        <span className="text-zinc-600 font-bold">🎥 {res.videoProjects?.length || 2} Video Labs</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-300 flex justify-end gap-2">
                      <button
                        onClick={() => handleEnrollCourse(res)}
                        className="btn-primary py-2 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-zinc-200"
                      >
                        <Plus size={13} />
                        <span>Enroll & Add to Cabinet</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
export default Learning;
