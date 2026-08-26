import React, { useState, useEffect } from 'react';
import { PageId } from '../components/Layout';
import { BookOpen, Clock, Star, Play, Search, Award, Cpu, Sparkles, Terminal, SlidersHorizontal, ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { stateManager } from '../services/stateManager';
import { Course } from '../data/mockData';
import { learningMcp } from '../services/mcp/learningMcp';

interface LearningProps {
  onNavigate: (page: PageId) => void;
  setSelectedCourseIdForDetails: (id: string) => void;
}

export const Learning: React.FC<LearningProps> = ({ onNavigate, setSelectedCourseIdForDetails }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'completed' | 'discovery'>('my');

  // Intake states
  const [searchTopic, setSearchTopic] = useState('');
  const [currentLevel, setCurrentLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [learningGoal, setLearningGoal] = useState<string>('Master the subject');
  const [dailyCommitment, setDailyCommitment] = useState<string>('1 hour/day');

  // Discovery flow states
  const [discoveryState, setDiscoveryState] = useState<'idle' | 'searching' | 'results'>('idle');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [agentSearchLogs, setAgentSearchLogs] = useState<string[]>([]);
  
  // Filtering & Sorting
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'beginner' | 'practical'>('score');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  useEffect(() => {
    setCourses(stateManager.getCourses());
  }, []);

  const handleStartCourse = (courseId: string) => {
    setSelectedCourseIdForDetails(courseId);
    onNavigate('course-details');
  };

  const getBadgeColor = (providerText: string = '') => {
    const p = providerText.toLowerCase();
    if (p.includes('mit')) return 'bg-red-950/40 text-red-400 border-red-900/30';
    if (p.includes('stanford')) return 'bg-red-950/40 text-red-300 border-red-900/30';
    if (p.includes('nptel') || p.includes('iit')) return 'bg-teal-950/40 text-teal-400 border-teal-900/30';
    if (p.includes('youtube')) return 'bg-red-950/40 text-red-400 border-red-900/30';
    if (p.includes('deeplearning')) return 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30';
    return 'bg-slate-950 text-slate-400 border-slate-900';
  };

  const renderStars = (rating: number = 4.6) => {
    const starsList = [];
    const floor = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      starsList.push(
        <Star 
          key={i} 
          size={10.5} 
          className={i < floor ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} 
        />
      );
    }
    return (
      <div className="flex items-center gap-1 select-none">
        <div className="flex items-center gap-0.5">{starsList}</div>
        <span className="text-[10px] font-bold text-amber-500 font-mono ml-0.5">{rating}</span>
      </div>
    );
  };

  const filteredMyCourses = courses.filter(c => {
    if (activeTab === 'completed') return c.progress === 100;
    if (activeTab === 'my') return c.progress < 100;
    return false;
  });

  const popularTopics = [
    'Machine Learning', 'Deep Learning', 'Transformers', 'RAG Pipelines',
    'Agentic AI', 'Python Algorithms', 'React Hooks', 'System Design'
  ];

  const handleSearchSubmit = async (topic: string) => {
    if (!topic.trim()) return;
    setDiscoveryState('searching');
    setAgentSearchLogs([]);

    const steps = [
      { msg: '🔍 [Learning Intake Agent] Parsing query parameters, goal, and study time preference...', delay: 600 },
      { msg: '📡 [Course Discovery Agent] Crawling university catalogs (MIT, Stanford, Yale, NPTEL) and YouTube playlists...', delay: 800 },
      { msg: '⚖️ [Course Analysis Agent] Scoring courses based on comprehensiveness, technical depth, and project alignment...', delay: 700 },
      { msg: '📊 [Evaluation Agent] Compiling multi-dimensional scores and generating strengths/weaknesses matrices...', delay: 500 }
    ];

    for (let i = 0; i < steps.length; i++) {
      setAgentSearchLogs(prev => [...prev, steps[i].msg]);
      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: steps[i].msg.split(' ')[1].replace('[', '').replace(']', ''),
        action: 'query_index',
        status: 'success',
        message: steps[i].msg
      });
      await new Promise(resolve => setTimeout(resolve, steps[i].delay));
    }

    // Call MCP to get search recommendations
    const results = await learningMcp.search_courses(topic, currentLevel, learningGoal);
    
    // If no catalog course matches, build a custom personalized course roadmap
    if (results.length === 0) {
      const generated = await learningMcp.build_learning_roadmap(topic, currentLevel, learningGoal, dailyCommitment);
      setSearchResults([generated]);
    } else {
      setSearchResults(results);
    }
    
    setDiscoveryState('results');
  };

  const handleEnrollCourse = async (selectedCourse: Course) => {
    // Add course to local state via stateManager
    const currentCourses = stateManager.getCourses();
    
    // Check if already enrolled
    const exists = currentCourses.some(c => c.id === selectedCourse.id);
    if (!exists) {
      const updated = [...currentCourses, selectedCourse];
      stateManager.saveCourses(updated);
      setCourses(updated);
    }

    // Populate Daily Task list with starting task
    const hours = dailyCommitment.includes('30') ? 0.5 : dailyCommitment.includes('2') ? 2 : dailyCommitment.includes('3') ? 3 : 1;
    const planData = await learningMcp.create_daily_learning_plan(selectedCourse.title, hours);
    
    // Insert custom study tasks into existing tasks list
    planData.activities.forEach((activity, idx) => {
      stateManager.addTask(
        activity,
        'learning',
        idx === 0 ? 'high' : 'medium',
        hours / planData.activities.length,
        idx === 0 ? '6:00 PM' : '7:00 PM'
      );
    });

    stateManager.addLog({
      timestamp: new Date().toLocaleTimeString(),
      agent: 'Roadmap Agent',
      action: 'enroll_course',
      status: 'success',
      message: `Enrolled Deepak in personalized course: "${selectedCourse.title}". Added study tasks to Daily Plan.`,
      reasoning: 'Linking curriculum chapters to daily task scheduler.'
    });

    // Navigate to chapter details
    setSelectedCourseIdForDetails(selectedCourse.id);
    onNavigate('course-details');
  };

  // Filter & Sort search results
  const processedResults = searchResults
    .filter(c => {
      if (providerFilter === 'all') return true;
      return c.provider?.toLowerCase().includes(providerFilter.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'score') return (b.careerOSScore || 0) - (a.careerOSScore || 0);
      if (sortBy === 'beginner') return a.difficulty === 'Beginner' ? -1 : 1;
      if (sortBy === 'practical') {
        const aIsPrac = a.title.toLowerCase().includes('zero') || a.title.toLowerCase().includes('project');
        const bIsPrac = b.title.toLowerCase().includes('zero') || b.title.toLowerCase().includes('project');
        return aIsPrac && !bIsPrac ? -1 : !aIsPrac && bIsPrac ? 1 : 0;
      }
      return 0;
    });

  const getProviderIcon = (provider: string = '') => {
    const p = provider.toLowerCase();
    if (p.includes('mit') || p.includes('stanford') || p.includes('yale') || p.includes('harvard') || p.includes('iit') || p.includes('nptel')) {
      return <Award className="text-indigo-400" size={14} />;
    }
    if (p.includes('youtube')) {
      return <Play className="text-red-400" size={14} />;
    }
    return <Cpu className="text-cyan-400" size={14} />;
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      
      {/* TOP HEADER */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold font-display text-white">Syllabus Curriculum Cabinets</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-display">Access university course roadmaps and textbook-style curriculums customized for your path.</p>
      </div>

      {/* CATALOG CATEGORY TABS */}
      <div className="flex border-b border-brand-border text-xs gap-1 select-none overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2.5 font-bold font-display tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'my' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-305'
          }`}
        >
          Active Courses
        </button>
        
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2.5 font-bold font-display tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'completed' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-305'
          }`}
        >
          Completed Courses
        </button>

        <button
          onClick={() => setActiveTab('discovery')}
          className={`px-4 py-2.5 font-bold font-display tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'discovery' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-305'
          }`}
        >
          AI Course Discoverer
        </button>
      </div>

      {/* RENDER MY COURSES & COMPLETED COURSES */}
      {activeTab !== 'discovery' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMyCourses.length > 0 ? (
            filteredMyCourses.map(course => {
              const p = course.provider?.toLowerCase() || '';
              
              // Specific border color accents
              const borderClass = p.includes('mit')
                ? 'border-l-4 border-l-red-500/80'
                : p.includes('stanford')
                ? 'border-l-4 border-l-red-700/80'
                : p.includes('nptel') || p.includes('iit')
                ? 'border-l-4 border-l-teal-500/80'
                : p.includes('youtube')
                ? 'border-l-4 border-l-red-600/80'
                : 'border-l-4 border-l-indigo-500/80';

              return (
                <div 
                  key={course.id} 
                  className={`group relative flex flex-col justify-between bg-[#0b0c14] border border-[#1e2238] hover:border-indigo-500/50 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] hover:-translate-y-0.5 rounded-2xl p-5 gap-5 shadow-lg transition-all duration-300 ${borderClass}`}
                >
                  {/* Content Area: Provider info, Title, Description, and Metrics */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 flex-wrap select-none border-b border-slate-900/40 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[8.5px] font-mono font-bold uppercase ${getBadgeColor(course.provider)}`}>
                            {getProviderIcon(course.provider)}
                            <span>{course.provider || 'University Open Course'}</span>
                          </div>
                          {course.license && (
                            <span className="text-[8px] font-mono text-slate-500 bg-slate-950/30 border border-slate-900 px-1.5 py-0.5 rounded-md">
                              {course.license}
                            </span>
                          )}
                        </div>
                        {renderStars(course.rating)}
                      </div>
                      
                      <h3 className="text-xs sm:text-sm font-bold font-display text-white mt-3 group-hover:text-indigo-400 transition-colors leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-[10.5px] text-slate-400 mt-2 leading-relaxed font-medium line-clamp-3">
                        {course.description || 'Access personalized university learning roadmap chapters and study guides.'}
                      </p>

                      {/* Multi-Dimensional Progress Indicators */}
                      <div className="flex flex-col gap-2.5 mt-4 bg-slate-950/40 border border-slate-900/60 p-3 rounded-xl select-none">
                        
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[8.5px] font-mono font-semibold uppercase text-slate-505">
                            <span>Comprehensiveness</span>
                            <span className="text-slate-350">{course.comprehensiveness || 9.0}/10</span>
                          </div>
                          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(course.comprehensiveness || 9.0) * 10}%` }} />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[8.5px] font-mono font-semibold uppercase text-slate-505">
                            <span>Theory Quality</span>
                            <span className="text-slate-350">{course.theoryDepth || 9.0}/10</span>
                          </div>
                          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(course.theoryDepth || 9.0) * 10}%` }} />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[8.5px] font-mono font-semibold uppercase text-slate-505">
                            <span>Practical Learning</span>
                            <span className="text-slate-350">{course.practicalLearning || 8.0}/10</span>
                          </div>
                          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(course.practicalLearning || 8.0) * 10}%` }} />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[8.5px] font-mono font-semibold uppercase text-slate-505">
                            <span>Beginner Friendly</span>
                            <span className="text-slate-355">{course.beginnerFriendly || 7.0}/10</span>
                          </div>
                          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(course.beginnerFriendly || 7.0) * 10}%` }} />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Metadata grid */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[9.5px] text-slate-500 font-bold font-mono uppercase tracking-wider select-none pt-3 border-t border-slate-900/50">
                      <span className="text-slate-450">{course.difficulty}</span>
                      <span>•</span>
                      <span>{course.chapters.length} Modules</span>
                      <span>•</span>
                      <span>{course.estimatedTime}</span>
                    </div>
                  </div>

                  {/* Student progress details */}
                  <div className="border-t border-[#1e2238] pt-4 flex flex-col gap-3 select-none mt-auto">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono font-bold uppercase">
                        <span>Course progress</span>
                        <span className="text-indigo-405 font-bold">{course.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${course.progress}%` }} />
                      </div>
                      <div className="flex justify-between text-[8.5px] text-slate-500 font-mono font-bold uppercase pt-0.5">
                        <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                        <span>{course.completedQuizzes}/{course.totalQuizzes} Quizzes</span>
                      </div>
                      <p className="text-[9px] text-slate-505 mt-1 font-mono uppercase font-bold tracking-wider truncate">Current: {course.currentChapter}</p>
                    </div>

                    {/* CTA button */}
                    <button 
                      onClick={() => handleStartCourse(course.id)}
                      className="btn-primary text-[9.5px] py-1.5 w-full font-bold font-display uppercase tracking-wider flex items-center justify-center gap-1 shadow-md mt-1"
                    >
                      <span>{course.progress === 100 ? 'Review syllabus textbook' : 'Open chapters reader'}</span>
                      <Play size={10} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500 italic text-xs">
              No courses matching criteria. Enroll in the Course Discoverer!
            </div>
          )}
        </div>
      ) : (
        
        /* DISCOVERY WIZARD TAB */
        <div className="flex flex-col gap-6">
          
          {/* SEARCH STATE: IDLE INTAKE FORM */}
          {discoveryState === 'idle' && (
            <div className="glass-panel p-6 flex flex-col gap-5 max-w-2xl mx-auto w-full bg-[#0a0b12]/40">
              <div className="text-center pb-2">
                <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider">AI Discovery Portal</h3>
                <p className="text-[11px] text-slate-500 mt-1">Intelligently crawls open university syllabus networks and video channels.</p>
              </div>

              {/* Topic search */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">What do you want to learn?</label>
                <div className="flex gap-2 relative bg-slate-950 border border-slate-800 rounded-lg p-2 focus-within:border-indigo-500/40">
                  <Search size={14} className="text-slate-500 mt-1 shrink-0" />
                  <input
                    type="text"
                    value={searchTopic}
                    onChange={(e) => setSearchTopic(e.target.value)}
                    placeholder="Search or type a topic (e.g. Transformers, Machine Learning, Python...)"
                    className="bg-transparent text-xs text-white focus:outline-none w-full"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(searchTopic)}
                  />
                  <button 
                    onClick={() => handleSearchSubmit(searchTopic)}
                    className="btn-primary text-[10px] py-1 px-3.5 shrink-0"
                  >
                    Discover
                  </button>
                </div>
                
                {/* Popular Pills */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {popularTopics.map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        setSearchTopic(t);
                        handleSearchSubmit(t);
                      }}
                      className="px-2.5 py-1 text-[9px] font-mono rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intake parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-900 pt-4">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Current Level</label>
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value as any)}
                    className="bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Learning Goal</label>
                  <select
                    value={learningGoal}
                    onChange={(e) => setLearningGoal(e.target.value)}
                    className="bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Understand the fundamentals">Understand fundamentals</option>
                    <option value="Build projects">Build projects</option>
                    <option value="Prepare for interviews">Prepare for interviews</option>
                    <option value="Master the subject">Master the subject</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Daily Study Time</label>
                  <select
                    value={dailyCommitment}
                    onChange={(e) => setDailyCommitment(e.target.value)}
                    className="bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="30 minutes/day">30 minutes/day</option>
                    <option value="1 hour/day">1 hour/day</option>
                    <option value="2 hours/day">2 hours/day</option>
                    <option value="3+ hours/day">3+ hours/day</option>
                  </select>
                </div>

              </div>

            </div>
          )}

          {/* SEARCH STATE: AGENT LOG MONITOR */}
          {discoveryState === 'searching' && (
            <div className="glass-panel p-6 max-w-xl mx-auto w-full flex flex-col gap-4 bg-[#07080f]">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">AI Learning Agents actively mapping syllabus...</span>
              </div>
              
              <div className="bg-black/80 rounded-lg p-4 font-mono text-[9px] text-indigo-400 space-y-2 border border-slate-900 max-h-60 overflow-y-auto leading-relaxed select-none">
                {agentSearchLogs.map((log, idx) => (
                  <p key={idx} className="animate-fade-in">{log}</p>
                ))}
              </div>
            </div>
          )}

          {/* SEARCH STATE: COMPARISON RESULTS */}
          {discoveryState === 'results' && (
            <div className="flex flex-col gap-6">
              
              {/* Top controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a0b12]/30 p-4 border border-brand-border rounded-xl">
                <button
                  onClick={() => setDiscoveryState('idle')}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
                >
                  <ArrowLeft size={13} />
                  <span>Configure search parameters</span>
                </button>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  {/* Sorting dropdown */}
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal size={12} className="text-slate-500" />
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Sort By</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-slate-950 border border-slate-900 text-slate-300 p-1 rounded font-mono text-[10px]"
                    >
                      <option value="score">Best CareerOS Score</option>
                      <option value="beginner">Difficulty: Low to High</option>
                      <option value="practical">Practical / Implementation First</option>
                    </select>
                  </div>
                  
                  {/* Provider filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Provider</span>
                    <select
                      value={providerFilter}
                      onChange={(e) => setProviderFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-900 text-slate-300 p-1 rounded font-mono text-[10px]"
                    >
                      <option value="all">All Providers</option>
                      <option value="mit">MIT OCW</option>
                      <option value="stanford">Stanford Online</option>
                      <option value="nptel">NPTEL / IIT</option>
                      <option value="youtube">YouTube Playlists</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Recommended Catalog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedResults.length > 0 ?
                  processedResults.map(course => {
                    const isExpanded = expandedCourseId === course.id;
                    const p = course.provider?.toLowerCase() || '';
                    
                    // Specific border color accents
                    const borderClass = p.includes('mit')
                      ? 'border-l-4 border-l-red-500/80'
                      : p.includes('stanford')
                      ? 'border-l-4 border-l-red-700/80'
                      : p.includes('nptel') || p.includes('iit')
                      ? 'border-l-4 border-l-teal-500/80'
                      : p.includes('youtube')
                      ? 'border-l-4 border-l-red-600/80'
                      : 'border-l-4 border-l-indigo-500/80';

                    // Local helper variables now mapped to component-level shared helper functions

                    return (
                      <div 
                        key={course.id}
                        className={`group relative flex flex-col justify-between bg-[#0b0c14] border border-[#1e2238] hover:border-indigo-500/50 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] hover:-translate-y-0.5 rounded-2xl p-5 gap-5 shadow-lg transition-all duration-300 ${borderClass}`}
                      >
                        {/* Content Area: Provider info, Title, Description, and Metrics */}
                        <div className="flex flex-col gap-4">
                          <div>
                            <div className="flex items-center justify-between gap-2 flex-wrap select-none border-b border-slate-900/40 pb-2.5">
                              <div className="flex items-center gap-2">
                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[8.5px] font-mono font-bold uppercase ${getBadgeColor()}`}>
                                  {getProviderIcon(course.provider)}
                                  <span>{course.provider || 'University Open Course'}</span>
                                </div>
                                {course.license && (
                                  <span className="text-[8px] font-mono text-slate-505 bg-slate-950/30 border border-slate-900 px-1.5 py-0.5 rounded-md">
                                    {course.license}
                                  </span>
                                )}
                              </div>
                              {renderStars(course.rating)}
                            </div>
                            
                            <h3 className="text-xs sm:text-sm font-bold font-display text-white mt-3 group-hover:text-indigo-400 transition-colors leading-snug">
                              {course.title}
                            </h3>
                            <p className="text-[10.5px] text-slate-405 mt-2 leading-relaxed font-medium line-clamp-3">
                              {course.description}
                            </p>

                            {/* Multi-Dimensional Progress Indicators */}
                            <div className="flex flex-col gap-2.5 mt-4 bg-slate-950/40 border border-slate-900/60 p-3 rounded-xl select-none">
                              
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-[8.5px] font-mono font-semibold uppercase text-slate-500">
                                  <span>Comprehensiveness</span>
                                  <span className="text-slate-350">{course.comprehensiveness || 9.0}/10</span>
                                </div>
                                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(course.comprehensiveness || 9.0) * 10}%` }} />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-[8.5px] font-mono font-semibold uppercase text-slate-505">
                                  <span>Theory Quality</span>
                                  <span className="text-slate-350">{course.theoryDepth || 9.0}/10</span>
                                </div>
                                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(course.theoryDepth || 9.0) * 10}%` }} />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-[8.5px] font-mono font-semibold uppercase text-slate-505">
                                  <span>Practical Learning</span>
                                  <span className="text-slate-350">{course.practicalLearning || 8.0}/10</span>
                                </div>
                                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(course.practicalLearning || 8.0) * 10}%` }} />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-[8.5px] font-mono font-semibold uppercase text-slate-505">
                                  <span>Beginner Friendly</span>
                                  <span className="text-slate-355">{course.beginnerFriendly || 7.0}/10</span>
                                </div>
                                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(course.beginnerFriendly || 7.0) * 10}%` }} />
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Metadata grid */}
                          <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[9.5px] text-slate-500 font-bold font-mono uppercase tracking-wider select-none pt-3 border-t border-slate-900/50">
                            <span className="text-slate-450">{course.difficulty}</span>
                            <span>•</span>
                            <span>{course.chapters.length} Modules</span>
                            <span>•</span>
                            <span>{course.estimatedTime}</span>
                          </div>
                        </div>

                        {/* Match Rate, Pros/Cons, and Action Controls */}
                        <div className="border-t border-slate-900/80 pt-4 flex flex-col gap-4 select-none mt-auto">
                          {/* Match Rate Score Pill */}
                          <div className="flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-900 p-2 rounded-xl">
                            <div>
                              <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest font-mono">Match Rate</p>
                              <p className="text-[14px] font-bold font-mono text-indigo-405 leading-tight">{course.careerOSScore}%</p>
                            </div>
                            <div className="flex-1 max-w-[90px] h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" 
                                style={{ width: `${course.careerOSScore}%` }}
                              />
                            </div>
                          </div>

                          {/* Pros & Cons list */}
                          <div className="space-y-1.5 text-[9px] leading-tight font-semibold">
                            {course.strengths?.slice(0, 2).map((s, idx) => (
                              <div key={idx} className="flex gap-1.5 items-start text-emerald-450">
                                <CheckCircle2 size={11} className="shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{s}</span>
                              </div>
                            ))}
                            {course.weaknesses?.slice(0, 1).map((w, idx) => (
                              <div key={idx} className="flex gap-1.5 items-start text-orange-400">
                                <AlertTriangle size={11} className="shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{w}</span>
                              </div>
                            ))}
                          </div>

                          {/* CTA Control buttons */}
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              {course.sourceUrl && (
                                <a 
                                  href={course.sourceUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="btn-secondary text-[9px] py-1.5 flex-1 text-center font-bold font-display uppercase tracking-wider border border-slate-850 bg-slate-950/20 text-slate-400 hover:text-white"
                                >
                                  Open Link
                                </a>
                              )}
                              <button
                                onClick={() => handleEnrollCourse(course)}
                                className="btn-primary text-[9.5px] py-1.5 flex-1 font-bold font-display uppercase tracking-wider flex items-center justify-center gap-1 shadow-md"
                              >
                                <span>Enroll</span>
                                <Play size={9} fill="currentColor" />
                              </button>
                            </div>
                            
                            {/* Collapse/Expand Syllabus Map trigger */}
                            <button
                              onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                              className="w-full py-1 text-center text-[9px] font-bold font-mono uppercase tracking-wider border border-slate-900 bg-slate-950/40 rounded-md text-slate-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-0.5"
                            >
                              <span>{isExpanded ? 'Hide chapters' : 'Preview chapters'}</span>
                              {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Syllabus Map Drawer */}
                        {isExpanded && (
                          <div className="w-full mt-2 border-t border-slate-900/60 pt-4 flex flex-col gap-2.5 animate-fade-in relative z-10">
                            <span className="text-[9px] font-bold text-slate-500 font-mono uppercase tracking-wider">Curriculum Chapters Preview:</span>
                            <div className="grid grid-cols-1 gap-2">
                              {course.chapters.map((ch, idx) => (
                                <div key={ch.id} className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-900 hover:border-slate-800 transition-all flex flex-col gap-0.5 text-left">
                                  <span className="text-[7.5px] font-bold text-indigo-400 font-mono uppercase">Module 0{idx + 1}</span>
                                  <span className="text-[10px] font-semibold text-slate-350 truncate leading-snug">{ch.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })
                :
                  <div className="py-16 text-center text-slate-555 italic text-xs">
                    No courses match provider criteria.
                  </div>
                }
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
export default Learning;
