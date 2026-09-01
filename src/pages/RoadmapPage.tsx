import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, Sparkles, CheckCircle2, Lock, Clock, ArrowRight, PlayCircle, 
  Brain, Cpu, Zap, Layers, Terminal, Network, BookOpen, 
  Compass, Award, FolderGit2, Lightbulb, Check, HelpCircle, Code, ChevronRight,
  ShieldCheck, Activity, Target, ChevronDown
} from 'lucide-react';
import { PageId } from '../components/Layout';
import { stateManager } from '../services/stateManager';
import { RoadmapNode, Course } from '../data/mockData';
import { generateRoadmapNodesForCourse, getSkillNameForTopic } from '../data/coursesData';

interface RoadmapPageProps {
  onNavigate?: (page: PageId) => void;
  setSelectedCourseIdForDetails?: (id: string) => void;
  courseId?: string;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ 
  onNavigate, 
  setSelectedCourseIdForDetails,
  courseId 
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reactive loader
  const refreshRoadmap = () => {
    const loadedCourses = stateManager.getCourses();
    setCourses(loadedCourses);

    // If a specific courseId was passed or stored in localStorage, focus on it
    const activeStoredId = localStorage.getItem('career_os_active_course_id');
    const targetCourseId = courseId || activeStoredId || (loadedCourses.length > 0 ? loadedCourses[loadedCourses.length - 1].id : 'all');

    if (targetCourseId && (targetCourseId === 'all' || loadedCourses.some(c => c.id === targetCourseId))) {
      setSelectedCourseId(targetCourseId);
      loadRoadmapForSelection(targetCourseId, loadedCourses);
    } else {
      loadRoadmapForSelection('all', loadedCourses);
    }
  };

  useEffect(() => {
    refreshRoadmap();

    const handleCoursesUpdated = () => refreshRoadmap();
    const handleRoadmapUpdated = () => refreshRoadmap();
    window.addEventListener('courses-updated', handleCoursesUpdated);
    window.addEventListener('roadmap-updated', handleRoadmapUpdated);

    return () => {
      window.removeEventListener('courses-updated', handleCoursesUpdated);
      window.removeEventListener('roadmap-updated', handleRoadmapUpdated);
    };
  }, [courseId]);

  const loadRoadmapForSelection = (cId: string, availableCourses: Course[]) => {
    if (cId === 'all') {
      const globalRoadmap = stateManager.getRoadmap();
      setNodes(globalRoadmap);
      const active = globalRoadmap.find(n => n.status === 'current') || globalRoadmap[0];
      setSelectedNode(active);
    } else {
      const course = availableCourses.find(c => c.id === cId);
      if (course) {
        const generatedNodes = generateRoadmapNodesForCourse(course);
        setNodes(generatedNodes);
        const active = generatedNodes.find(n => n.status === 'current') || generatedNodes[0];
        setSelectedNode(active);
      }
    }
  };

  const handleCourseChange = (newCourseId: string) => {
    setSelectedCourseId(newCourseId);
    try {
      localStorage.setItem('career_os_active_course_id', newCourseId);
    } catch {}
    loadRoadmapForSelection(newCourseId, courses);
  };

  const getStatusIcon = (status: RoadmapNode['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />;
      case 'current': return <PlayCircle size={13} className="text-indigo-400 shrink-0" />;
      case 'locked': return <Lock size={11} className="text-slate-500 shrink-0" />;
    }
  };

  const getNodeIcon = (nodeId: string, index: number = 0) => {
    const icons = [
      <Brain size={13} className="text-pink-400" />,
      <Layers size={13} className="text-orange-400" />,
      <Cpu size={13} className="text-yellow-400" />,
      <Zap size={13} className="text-amber-400" />,
      <Network size={13} className="text-cyan-400" />,
      <Terminal size={13} className="text-indigo-400" />,
      <FolderGit2 size={13} className="text-emerald-400" />,
      <Award size={13} className="text-purple-400" />
    ];
    return icons[index % icons.length] || <Sparkles size={13} className="text-indigo-400" />;
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  // Extract matching chapter details for the selected node
  const getSelectedNodeChapter = () => {
    if (!selectedCourse || !selectedNode) return null;
    const chapters = selectedCourse.chapters || [];
    return chapters.find(ch => ch.title.toLowerCase() === selectedNode.title.toLowerCase()) || chapters[0] || null;
  };

  const activeChapterData = getSelectedNodeChapter();

  const getNodeDescription = (nodeId: string) => {
    if (activeChapterData && activeChapterData.explanation) {
      return activeChapterData.explanation;
    }

    const defaultDescriptions: Record<string, string> = {
      'node-1': "Learn neural network components, feedforward loops, and basic cost functions.",
      'node-2': "Build backpropagation chains, gradient steps, and initial optimizer vectors.",
      'node-3': "Master sequence embeddings, recurrence matrices, and basic translation vectors.",
      'node-4': "Understand Q, K, and V attention weights and scaled dot-product masking formulas.",
      'node-5': "Deploy multi-head parallel attention projections to merge semantic sequences.",
      'node-6': "Compute positional wave vectors and masked decoder output probabilities.",
      'node-7': "Architect full Transformer Encoders & Decoders with causal cross-attention layers.",
      'node-8': "Study causal self-supervised learning, tokenization models, and alignment matrices.",
      'node-9': "Design autonomous loops, ReAct reasoning trees, and vector search tools.",
      'node-10': "Compile a live Model Context Protocol (MCP) server exposing tools natively."
    };
    return defaultDescriptions[nodeId] || selectedCourse?.description || "Core syllabus milestone mapped by AI learning agents for progressive mastery.";
  };

  const getNodePosition = (nodeId: string, index: number) => {
    if (selectedCourseId === 'all') {
      const defaultPositions: Record<string, { x: number; y: number }> = {
        'node-1': { x: 300, y: 70 },
        'node-2': { x: 300, y: 185 },
        'node-3': { x: 300, y: 300 },
        'node-4': { x: 180, y: 415 },
        'node-5': { x: 420, y: 415 },
        'node-6': { x: 300, y: 530 },
        'node-7': { x: 300, y: 645 },
        'node-8': { x: 300, y: 760 },
        'node-9': { x: 300, y: 875 },
        'node-10': { x: 300, y: 990 }
      };

      if (defaultPositions[nodeId]) {
        return defaultPositions[nodeId];
      }
      return { x: 300, y: 1105 + (index - 10) * 120 };
    } else {
      const isEven = index % 2 === 0;
      const xPos = nodes.length <= 4 ? 300 : isEven ? 260 : 340;
      return { x: xPos, y: 75 + index * 130 };
    }
  };

  const handleOpenCourseDetails = () => {
    if (selectedCourseId !== 'all') {
      if (setSelectedCourseIdForDetails) setSelectedCourseIdForDetails(selectedCourseId);
      if (onNavigate) onNavigate('course-details');
      else window.location.hash = '#/course-details';
    } else {
      if (onNavigate) onNavigate('learning');
      else window.location.hash = '#/learning';
    }
  };

  const handleStartQuiz = () => {
    if (onNavigate) onNavigate('quiz');
    else window.location.hash = '#/quiz';
  };

  // Associated skill info for current course
  const currentSkillInfo = selectedCourse ? getSkillNameForTopic(selectedCourse.title) : { name: 'AI Engineering & Core Systems', category: 'AI/ML' };
  const userProfile = stateManager.getProfile();
  const currentSkillLevel = userProfile.skills?.find(s => s.name.toLowerCase() === currentSkillInfo.name.toLowerCase())?.level || 45;

  const nodeWidth = 210;
  const nodeHeight = 85;
  const svgHeight = Math.max(680, 150 + nodes.length * 130);

  return (
    <div className="flex flex-col gap-6 w-full pb-12 font-sans text-slate-200">
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.8); }
        }
        .animate-pulse-glow { animation: pulseGlow 2s infinite ease-in-out; }
        @keyframes flow { to { stroke-dashoffset: -20; } }
        .animate-flow-line { animation: flow 1s linear infinite; }
        .roadmap-grid {
          background-image: radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      {/* TOP HEADER */}
      <div className="relative z-40 overflow-visible glass-panel p-6 bg-gradient-to-r from-slate-900/95 via-[#0e1122]/95 to-slate-900/95 border border-brand-border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-blue-500/15 border border-indigo-500/40 flex items-center justify-center shrink-0 text-2xl shadow-inner">
            🗺️
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">
                Skill Roadmaps & Curriculum Trees
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/35 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                Adaptive Trees
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Dependency-aware learning milestones mapped to verified university syllabi, chapter quizzes, and production codebases.
            </p>
          </div>
        </div>

        {/* Custom Interactive Active Track Dropdown Selector */}
        <div className="relative z-50 w-full md:w-auto" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full md:w-80 bg-[#161a32] hover:bg-[#1c2242] border-2 border-indigo-500/60 hover:border-indigo-400 p-2.5 rounded-xl shadow-lg flex items-center justify-between gap-3 text-left transition-all duration-200"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-base shrink-0">
                {selectedCourseId === 'all' ? '🌟' : '📚'}
              </span>
              <div className="min-w-0">
                <span className="text-[8.5px] font-mono font-bold uppercase text-indigo-400 block tracking-wider leading-none mb-1">
                  Active Roadmap Track:
                </span>
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {selectedCourseId === 'all' ? 'Global Career Target Roadmap' : selectedCourse?.title}
                </p>
              </div>
            </div>
            <ChevronDown 
              size={16} 
              className={`text-indigo-400 shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-white' : ''}`} 
            />
          </button>

          {/* Custom Dropdown Popover (Floating High Z-Index Layer) */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-full md:w-96 bg-[#13162b] border-2 border-indigo-400 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(99,102,241,0.4)] p-3 z-[100] backdrop-blur-2xl animate-fade-in flex flex-col gap-2 max-h-[420px] overflow-y-auto">
              <div className="px-2.5 py-1 text-[9.5px] font-mono uppercase font-bold text-indigo-300 border-b border-indigo-500/30 pb-2">
                Available Roadmap Trees
              </div>

              {/* Global Career Target Option */}
              <button
                onClick={() => {
                  handleCourseChange('all');
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  selectedCourseId === 'all'
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-brand-border/60 text-slate-300 hover:bg-slate-900/80 hover:text-white hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg shrink-0">🌟</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white leading-tight">Global Career Target Roadmap</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">Multi-Phase AI, MCP & Systems Mastery</p>
                  </div>
                </div>
                {selectedCourseId === 'all' && (
                  <CheckCircle2 size={15} className="text-indigo-400 shrink-0" />
                )}
              </button>

              {courses.length > 0 && (
                <>
                  <div className="px-2.5 pt-2 text-[9px] font-mono uppercase font-bold text-slate-400">
                    Your Active Curriculums ({courses.length})
                  </div>
                  {courses.map(c => {
                    const isSelected = selectedCourseId === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          handleCourseChange(c.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                            : 'bg-slate-950/60 border-brand-border/60 text-slate-300 hover:bg-slate-900/80 hover:text-white hover:border-indigo-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-lg shrink-0">📚</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate leading-tight">{c.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[8.5px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                                c.difficulty === 'Beginner' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50' :
                                c.difficulty === 'Intermediate' ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50' :
                                'bg-purple-950/80 text-purple-300 border-purple-700/50'
                              }`}>
                                {c.difficulty}
                              </span>
                              <span className="text-[9.5px] font-mono text-slate-400">
                                {c.chapters.length} Milestones
                              </span>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 size={15} className="text-indigo-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ACTIVE COURSE & SKILLS BANNER */}
      {selectedCourse ? (
        <div className="p-5 bg-gradient-to-r from-[#181b30] via-[#121526] to-[#0c0e1c] border-2 border-indigo-500/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-500/50 flex items-center justify-center text-indigo-300 shrink-0 shadow-lg">
              <Compass size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-300 font-bold bg-indigo-950/70 border border-indigo-800/50 px-2 py-0.5 rounded">
                  {selectedCourse.provider || 'University Track'}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                  {selectedCourse.difficulty} Track
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug mt-1">{selectedCourse.title}</h3>
            </div>
          </div>

          {/* Associated Skill Gauge & Actions */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono w-full md:w-auto justify-between md:justify-end">
            <div className="bg-[#070914] border border-indigo-950/80 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-inner">
              <div>
                <span className="text-[8.5px] uppercase text-slate-400 font-bold block">Target Skill Matrix</span>
                <span className="text-xs font-bold text-emerald-400">{currentSkillInfo.name}</span>
              </div>
              <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full" style={{ width: `${currentSkillLevel}%` }} />
              </div>
              <span className="text-xs font-bold text-white">{currentSkillLevel}%</span>
            </div>

            <button 
              onClick={handleOpenCourseDetails} 
              className="btn-primary text-xs py-2.5 px-4 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <span>Open Textbook</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#0c0e1c] border border-brand-border rounded-xl flex justify-between items-center text-xs text-slate-300 shadow-md">
          <span className="flex items-center gap-2">
            <Sparkles size={15} className="text-indigo-400" />
            <span>Showing global milestone tree. Select an enrolled course from the dropdown above to focus on its curriculum roadmap.</span>
          </span>
        </div>
      )}

      {/* ROADMAP GRAPH & DEEP DIVE INSPECTOR PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SVG ROADMAP GRAPH CONTAINER */}
        <div className="lg:col-span-3 p-5 bg-gradient-to-b from-[#15182a] via-[#0e101e] to-[#090b14] border-2 border-indigo-500/30 rounded-2xl flex flex-col gap-4 overflow-hidden min-h-[600px] relative shadow-xl">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3 z-10">
            <span className="text-xs font-bold font-sans text-white uppercase tracking-wider flex items-center gap-2">
              <Map size={14} className="text-indigo-400" />
              <span>{selectedCourseId === 'all' ? 'Global Career Target: Senior AI & Systems Engineer' : `${selectedCourse?.title} Milestones`}</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/40 uppercase">
              {nodes.length} Milestones
            </span>
          </div>

          <div className="overflow-auto max-h-[750px] roadmap-grid border border-indigo-500/20 rounded-xl relative py-4 bg-[#05060c]/90 shadow-inner">
            <svg width="100%" height={svgHeight} viewBox={`0 0 600 ${svgHeight}`} className="mx-auto">
              <defs>
                <linearGradient id="activeNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#252b4d" />
                  <stop offset="100%" stopColor="#14172c" />
                </linearGradient>
                <linearGradient id="completedNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0d2b22" />
                  <stop offset="100%" stopColor="#071712" />
                </linearGradient>
                <linearGradient id="queuedNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#171926" />
                  <stop offset="100%" stopColor="#0d0e17" />
                </linearGradient>
              </defs>

              {/* Laser Connector Paths */}
              {nodes.map((node, index) => {
                const childPos = getNodePosition(node.id, index);
                return node.prerequisites.map((prereqId) => {
                  const parentIndex = nodes.findIndex(n => n.id === prereqId);
                  if (parentIndex === -1) return null;
                  const parentPos = getNodePosition(prereqId, parentIndex);
                  const dy = childPos.y - parentPos.y;
                  const cy1 = parentPos.y + dy * 0.45;
                  const cy2 = parentPos.y + dy * 0.55;
                  const pathD = `M ${parentPos.x} ${parentPos.y + nodeHeight / 2} C ${parentPos.x} ${cy1}, ${childPos.x} ${cy2}, ${childPos.x} ${childPos.y - nodeHeight / 2}`;
                  
                  const isCompleted = node.status === 'completed' && nodes[parentIndex]?.status === 'completed';
                  const isActive = (node.status === 'current' && nodes[parentIndex]?.status === 'completed') || (node.status === 'completed' && nodes[parentIndex]?.status === 'current');
                  const strokeClass = isCompleted ? 'stroke-emerald-400' : isActive ? 'stroke-indigo-400' : 'stroke-slate-800';
                  
                  return (
                    <g key={`${prereqId}-${node.id}`}>
                      <path d={pathD} fill="none" className={`transition-all duration-300 ${strokeClass}`} strokeWidth={2.5} />
                      {(isCompleted || isActive) && (
                        <path 
                          d={pathD} 
                          fill="none" 
                          className={isCompleted ? "stroke-emerald-300 animate-flow-line" : "stroke-indigo-300 animate-flow-line"} 
                          strokeWidth={2} 
                          strokeDasharray="4 6" 
                        />
                      )}
                      <path d={pathD} fill="none" className="stroke-slate-900" strokeWidth={1} />
                    </g>
                  );
                });
              })}

              {/* Node Cards */}
              {nodes.map((node, index) => {
                const pos = getNodePosition(node.id, index);
                const isSelected = selectedNode?.id === node.id;
                const isCurrent = node.status === 'current';
                const isCompleted = node.status === 'completed';

                let nodeBg = 'url(#queuedNodeGrad)';
                let strokeColor = '#2b3049';

                if (isSelected) {
                  strokeColor = '#818cf8';
                  nodeBg = 'url(#activeNodeGrad)';
                } else if (isCurrent) {
                  strokeColor = '#6366f1';
                  nodeBg = 'url(#activeNodeGrad)';
                } else if (isCompleted) {
                  strokeColor = '#10b981';
                  nodeBg = 'url(#completedNodeGrad)';
                }

                return (
                  <g 
                    key={node.id}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => setSelectedNode(node)}
                  >
                    {isSelected && (
                      <rect
                        x={pos.x - nodeWidth / 2 - 4}
                        y={pos.y - nodeHeight / 2 - 4}
                        width={nodeWidth + 8}
                        height={nodeHeight + 8}
                        rx={16}
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth={2.5}
                        opacity={0.85}
                        className="animate-pulse"
                      />
                    )}

                    <rect
                      x={pos.x - nodeWidth / 2}
                      y={pos.y - nodeHeight / 2}
                      width={nodeWidth}
                      height={nodeHeight}
                      rx={12}
                      fill={nodeBg}
                      className="transition-all duration-200"
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />

                    <foreignObject
                      x={pos.x - nodeWidth / 2 + 12}
                      y={pos.y - nodeHeight / 2 + 8}
                      width={nodeWidth - 24}
                      height={20}
                    >
                      <div className="flex items-center justify-between text-[8.5px] font-mono font-bold uppercase tracking-wider select-none">
                        <span className="flex items-center gap-1.5 text-indigo-300">
                          {getNodeIcon(node.id, index)}
                          <span className="truncate">{node.phase}</span>
                        </span>
                        <span>{getStatusIcon(node.status)}</span>
                      </div>
                    </foreignObject>

                    <foreignObject
                      x={pos.x - nodeWidth / 2 + 12}
                      y={pos.y - nodeHeight / 2 + 28}
                      width={nodeWidth - 24}
                      height={34}
                    >
                      <p className="text-[11px] font-bold text-white leading-tight line-clamp-2 select-none font-sans">
                        {node.title}
                      </p>
                    </foreignObject>

                    <foreignObject
                      x={pos.x - nodeWidth / 2 + 12}
                      y={pos.y - nodeHeight / 2 + 63}
                      width={nodeWidth - 24}
                      height={16}
                    >
                      <div className="flex items-center justify-between text-[8px] font-mono select-none">
                        <span className={`uppercase font-bold ${isCompleted ? 'text-emerald-400' : isCurrent ? 'text-indigo-300' : 'text-slate-400'}`}>
                          {node.status}
                        </span>
                        <span className="text-slate-300 font-bold">{node.completionPercent}%</span>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* =========================================================================
            ELEVATED HIGH-CONTRAST DEEP DIVE INSPECTION CARD
           ========================================================================= */}
        <div className="lg:col-span-1 p-5 bg-gradient-to-b from-[#181b30] via-[#121526] to-[#0c0e1c] border-2 border-indigo-500/35 rounded-2xl flex flex-col justify-between gap-5 shadow-[0_12px_36px_rgba(0,0,0,0.65),0_2px_6px_rgba(99,102,241,0.2)] h-fit relative overflow-hidden">
          {/* Top Accent Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />

          {selectedNode ? (
            <div className="flex flex-col gap-4">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3 pt-1">
                <span className="text-[9.5px] font-mono font-bold uppercase text-indigo-300 bg-indigo-950/80 border border-indigo-700/50 px-2.5 py-0.5 rounded-md">
                  {selectedNode.phase}
                </span>
                <span className="flex items-center gap-1.5 text-[9.5px] font-mono uppercase font-bold text-slate-300">
                  {getStatusIcon(selectedNode.status)}
                  <span>{selectedNode.status}</span>
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <span className="text-[9px] font-mono uppercase text-indigo-400 font-bold block mb-1">Deep Dive Inspector</span>
                <h3 className="text-base font-bold font-sans text-white leading-snug">
                  {selectedNode.title}
                </h3>
                <p className="text-xs text-slate-200 mt-2 leading-relaxed font-normal">
                  {getNodeDescription(selectedNode.id)}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-300 mt-3 bg-[#070914] p-2 rounded-xl border border-indigo-950/80">
                  <span className="flex items-center gap-1"><Clock size={12} className="text-indigo-400" /> {selectedNode.estimatedTime}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">{selectedNode.difficulty} Level</span>
                </div>
              </div>

              {/* Intuitive Mental Model / Analogy Box */}
              {activeChapterData?.analogy && (
                <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 p-3 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[9.5px] font-bold font-mono uppercase tracking-wider text-amber-300">
                    <Lightbulb size={13} className="text-amber-400" />
                    <span>Real-world Analogy</span>
                  </div>
                  <p className="text-xs text-amber-100 leading-relaxed italic">
                    "{activeChapterData.analogy}"
                  </p>
                </div>
              )}

              {/* Key Terminology Competencies */}
              {activeChapterData?.keyTerminology && activeChapterData.keyTerminology.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-slate-400">Key Competencies</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeChapterData.keyTerminology.map((term, i) => (
                      <span key={i} className="text-[9px] font-mono px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-200 font-semibold">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mastery Progress Bar */}
              <div className="bg-[#070914] border border-indigo-950/80 p-3 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-slate-300">
                  <span>Milestone Mastery</span>
                  <span className="text-emerald-400 font-bold">{selectedNode.completionPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-teal-300 rounded-full transition-all duration-300"
                    style={{ width: `${selectedNode.completionPercent}%` }}
                  />
                </div>
              </div>

              {/* Prerequisites */}
              {selectedNode.prerequisites.length > 0 && (
                <div className="flex flex-col gap-1.5 text-xs">
                  <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-slate-400">Prerequisites</span>
                  <div className="space-y-1.5">
                    {selectedNode.prerequisites.map(prereqId => {
                      const parent = nodes.find(n => n.id === prereqId);
                      return (
                        <div key={prereqId} className="flex items-center gap-2 text-[10.5px] text-slate-200 bg-[#070914] p-2 rounded-lg border border-slate-800">
                          <CheckCircle2 size={12} className={parent?.status === 'completed' ? 'text-emerald-400' : 'text-slate-500'} />
                          <span className="truncate">{parent?.title || prereqId}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Action Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-indigo-500/20">
                <button
                  onClick={handleOpenCourseDetails}
                  className="btn-primary text-xs py-2.5 w-full flex items-center justify-center gap-1.5 font-bold font-sans uppercase tracking-wider shadow-md shadow-indigo-600/30"
                >
                  <BookOpen size={13} />
                  <span>Open in Course Textbook</span>
                </button>

                <button
                  onClick={handleStartQuiz}
                  className="btn-secondary text-xs py-2.5 w-full flex items-center justify-center gap-1.5 font-bold font-sans uppercase tracking-wider text-indigo-300 border border-indigo-700/50 hover:text-white"
                >
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Take Chapter Quiz</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 italic text-xs">
              Select a milestone node on the map to view curriculum requirements.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RoadmapPage;
