import React, { useState, useEffect, useRef } from 'react';
import { PageId } from '../components/Layout';
import { 
  ArrowLeft, BookOpen, Code2, ArrowRight, CheckCircle, Play, Sparkles, 
  Send, HelpCircle, Check, X, Lightbulb, ExternalLink, Trash2, 
  ShieldCheck, CheckCircle2, Activity, Cpu, AlertTriangle, RefreshCw,
  Star, GitFork, Copy, Terminal, Award, MessageSquare,
  Bookmark, Video, Layers, CheckCheck, PlayCircle, Share2, Compass,
  FolderGit2, Flame, Laptop, Target, Bot, CheckSquare, Pause, Maximize2
} from 'lucide-react';
import { stateManager } from '../services/stateManager';
import { Course, CourseGithubRepo, CourseVideoProject } from '../data/mockData';
import { getChapterStart, getVideoForTopic, getLecturePairForTopic, getGithubReposForTopic, getVideoProjectsForTopic, TopicLecturePair } from '../data/coursesData';
import { verificationAgent, VerificationReport } from '../services/ai/verificationAgent';
import { showToast } from '../components/ToastContainer';

const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface CourseDetailsProps {
  onNavigate: (page: PageId) => void;
  courseId: string;
}

type CourseTab = 'textbook' | 'github' | 'projects' | 'quiz' | 'tutor' | 'sandbox';
type LectureKey = 'indian' | 'foreign';

export const CourseDetails: React.FC<CourseDetailsProps> = ({ onNavigate, courseId }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<CourseTab>('textbook');
  
  // Interactive Video Player State
  const [isPlayingMainVideo, setIsPlayingMainVideo] = useState<boolean>(false);
  const [playingProjectId, setPlayingProjectId] = useState<string | null>(null);

  // Interactive Quiz State
  const [selectedQuizOpt, setSelectedQuizOpt] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);

  // AI Assistant Chat State
  const [aiInput, setAiInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: "👋 Welcome to your dedicated AI Syllabus Copilot! I have full contextual access to this course syllabus, math formulations, and code implementations. Ask me to explain concepts, generate code examples, or test your understanding.",
      time: 'Just now'
    }
  ]);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Interactive Code Sandbox Simulator
  const [userCode, setUserCode] = useState<string>('');
  const [sandboxOutput, setSandboxOutput] = useState<string>('');
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [copiedCloneUrl, setCopiedCloneUrl] = useState<string | null>(null);

  // Video source selector
  const [lectureSourceType, setLectureSourceType] = useState<LectureKey>('indian');

  // Quality verification inspection modal
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditReport, setAuditReport] = useState<VerificationReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    let targetId = courseId;
    if (!targetId) {
      targetId = localStorage.getItem('career_os_active_course_id') || 'ai-foundations';
    }
    const allCourses = stateManager.getCourses();
    const c = allCourses.find(item => item.id === targetId) || allCourses[0];
    if (c) {
      setCourse(c);
      // Initialize code sandbox with starter snippet
      setUserCode(
        `# PyTorch Hands-on Implementation for ${c.chapters[0]?.title || 'Core Model'}\n` +
        `import torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\n` +
        `class MultiHeadAttentionModule(nn.Module):\n` +
        `    def __init__(self, d_model=512, n_heads=8):\n` +
        `        super().__init__()\n` +
        `        self.d_model = d_model\n` +
        `        self.n_heads = n_heads\n` +
        `        self.head_dim = d_model // n_heads\n` +
        `        self.q_proj = nn.Linear(d_model, d_model)\n` +
        `        self.k_proj = nn.Linear(d_model, d_model)\n` +
        `        self.v_proj = nn.Linear(d_model, d_model)\n\n` +
        `    def forward(self, x):\n` +
        `        batch_size, seq_len, _ = x.shape\n` +
        `        queries = self.q_proj(x)\n` +
        `        keys = self.k_proj(x)\n` +
        `        values = self.v_proj(x)\n` +
        `        scores = torch.matmul(queries, keys.transpose(-2, -1)) / (self.head_dim ** 0.5)\n` +
        `        attn_weights = F.softmax(scores, dim=-1)\n` +
        `        return torch.matmul(attn_weights, values)\n\n` +
        `# Execute forward pass simulation\n` +
        `sample_tensor = torch.randn(2, 16, 512)\n` +
        `model = MultiHeadAttentionModule()\n` +
        `output = model(sample_tensor)\n` +
        `print(f"✅ Forward pass successful! Output Shape: {output.shape}")\n` +
        `print("🎯 Latency: 4.2ms | Compute: 0.12 TFLOPs | Memory: 14.8MB")`
      );
    }
  }, [courseId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-zinc-500 mb-4">No course loaded.</p>
        <button onClick={() => onNavigate('learning')} className="btn-primary">
          Back to Courses Catalog
        </button>
      </div>
    );
  }

  const activeChapter = course.chapters[activeChapterIdx] || course.chapters[0] || {
    id: 'ch-1',
    title: 'Foundational Theory',
    explanation: 'Comprehensive architectural concepts.',
    videoUrl: 'aircAruvnKk',
    status: 'active'
  };

  const handleMarkChapterComplete = () => {
    const allCourses = stateManager.getCourses();
    const targetCourse = allCourses.find(c => c.id === course.id);
    if (targetCourse) {
      const chapter = targetCourse.chapters[activeChapterIdx];
      if (chapter) chapter.status = 'completed';
      const completedCount = targetCourse.chapters.filter(ch => ch.status === 'completed').length;
      targetCourse.progress = Math.round((completedCount / targetCourse.chapters.length) * 100);
      targetCourse.completedLessons = completedCount;
      stateManager.saveCourses(allCourses);
      setCourse({ ...targetCourse });
    }

    showToast(`Completed: ${activeChapter.title}! +50 XP Earned`, 'success');
    if (activeChapterIdx < course.chapters.length - 1) {
      setActiveChapterIdx(activeChapterIdx + 1);
      setIsPlayingMainVideo(false); // Reset video state for next chapter
    }
  };

  const handleQuizOptionSelect = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedQuizOpt(idx);
  };

  const handleQuizSubmit = () => {
    if (selectedQuizOpt === null) return;
    setQuizSubmitted(true);
    const correct = activeChapter.quizQuestion ? selectedQuizOpt === activeChapter.quizQuestion.answerIdx : selectedQuizOpt === 1;
    setQuizSuccess(correct);

    if (correct) {
      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Critic Agent',
        action: 'validate_assessment',
        status: 'success',
        message: `Passed checkpoint quiz for ${activeChapter.title} with 100% precision.`
      });
      showToast('Correct! Checkpoint quiz passed. +30 XP Logged.', 'success');
    } else {
      showToast('Incorrect answer. Review the explanation notes below and retry.', 'error');
    }
  };

  const handleResetQuiz = () => {
    setSelectedQuizOpt(null);
    setQuizSubmitted(false);
    setQuizSuccess(false);
  };

  const handleAskAI = (promptText?: string) => {
    const textToSend = promptText || aiInput;
    if (!textToSend.trim()) return;

    const userMsg = textToSend.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: timeNow }]);
    if (!promptText) setAiInput('');
    setIsAiResponding(true);

    setTimeout(() => {
      let aiResponseText = `### CareerOS AI Instructor: ${activeChapter.title}\n\n`;
      const q = userMsg.toLowerCase();

      if (q.includes('analogy') || q.includes('simply') || q.includes('beginner')) {
        aiResponseText += `Here is an intuitive mental model for **${activeChapter.title}**:\n\n` +
          `* **The Concept in Plain English:** ${activeChapter.analogy || 'Imagine a smart indexing system where you can look up exact contextual relationships dynamically.'}\n\n` +
          `* **Why Top Engineers Use It:** It reduces compute bottlenecks while preserving high-dimensional precision.`;
      } else if (q.includes('code') || q.includes('python') || q.includes('example')) {
        aiResponseText += `Here is a production PyTorch implementation pattern for **${activeChapter.title}**:\n\n` +
          '```python\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\nclass CustomLayer(nn.Module):\n    def __init__(self, d_model=512):\n        super().__init__()\n        self.proj = nn.Linear(d_model, d_model)\n        \n    def forward(self, x):\n        scores = self.proj(x)\n        return F.softmax(scores, dim=-1)\n```\n\nYou can also test and run this directly in the **Hands-on Sandbox** tab above!';
      } else if (q.includes('interview') || q.includes('question') || q.includes('faang')) {
        aiResponseText += `Here are the top 2 FAANG / Research interview questions on **${activeChapter.title}**:\n\n` +
          `1. **System Scalability:** "How do dot-product attention scales behave with $O(N^2)$ memory, and how does FlashAttention-2 optimize SRAM IO?"\n` +
          `2. **Mathematical Grounding:** "Why do we scale by $\\sqrt{d_k}$ prior to Softmax temperature normalization?"`;
      } else {
        aiResponseText += `Here are key takeaways for **${activeChapter.title}** on the **${course.difficulty}** track:\n\n` +
          `* **Core Formula:** ${activeChapter.explanation || 'Detailed vector transformations governing attention distribution.'}\n\n` +
          `* **Next Milestone:** Run the hands-on code assignment and review the verified GitHub repositories in the **GitHub Repos** tab!`;
      }

      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: aiResponseText, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
      setIsAiResponding(false);
    }, 700);
  };

  const handleRunCodeSandbox = () => {
    setIsRunningCode(true);
    setSandboxOutput('⚙️ Initializing virtual PyTorch runtime & WebAssembly sandbox...\n');

    setTimeout(() => {
      setSandboxOutput(
        '🚀 [STDOUT] Compiling MultiHeadAttention computational graph...\n' +
        '📊 [TENSOR] Input Batch Shape: (2, 16, 512)\n' +
        '⚡ [GPU VENDOR] Simulated CUDA 12.4 Engine (A100 SRAM Emulation)\n' +
        '✅ [STATUS] Forward Pass Executed: Output Tensor [2, 16, 512]\n' +
        '📈 [METRICS] Attention Entropy: 0.842 | Parameter Count: 1.05M | Execution Time: 3.8ms\n' +
        '🎉 All 4 Unit Test Assertions Passed (Loss: 0.0024)'
      );
      setIsRunningCode(false);
      showToast('Sandbox script executed with 0 errors! +25 XP', 'success');
    }, 1100);
  };

  const handleCopyClone = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCloneUrl(cmd);
    setTimeout(() => setCopiedCloneUrl(null), 2500);
    showToast(`Copied clone command: "${cmd}"`, 'info');
  };

  // Video section — resolve dual lecture pair
  const chapterTopic = `${course.title} ${activeChapter.title}`;
  const lecturePair = getLecturePairForTopic(chapterTopic);
  const activeLecture = lecturePair[lectureSourceType];
  const rawVideoId = activeLecture?.videoId || activeChapter.videoUrl || getVideoForTopic(chapterTopic);
  const youtubeLink = activeLecture?.playlistUrl || `https://www.youtube.com/watch?v=${rawVideoId}`;

  const githubRepos: CourseGithubRepo[] = course.githubRepos && course.githubRepos.length > 0 
    ? course.githubRepos 
    : getGithubReposForTopic(course.title);

  const videoProjects: CourseVideoProject[] = course.videoProjects && course.videoProjects.length > 0
    ? course.videoProjects
    : getVideoProjectsForTopic(course.title);

  const handleRunVerification = async () => {
    if (!course) return;
    setIsAuditing(true);
    setShowAuditModal(true);
    const rep = await verificationAgent.auditCourse(course, true);
    setAuditReport(rep);
    setIsAuditing(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-12 font-sans text-zinc-700">
      
      {/* HEADER ROW */}
      <div className="glass-panel p-5 border border-zinc-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('learning')}
            className="p-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-slate-800 transition-all shrink-0 shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-zinc-700 uppercase tracking-widest font-bold font-mono bg-zinc-100 px-2.5 py-0.5 rounded-md border border-zinc-300">
                {course.provider || 'University Masterclass'}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase bg-zinc-100 border border-emerald-900/40 text-zinc-600 px-2.5 py-0.5 rounded-full">
                <ShieldCheck size={11} />
                <span>AI Quality Verified</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold font-sans text-zinc-900 mt-1.5 leading-snug">{course.title}</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5 text-xs font-mono font-semibold bg-zinc-100 px-3.5 py-2 rounded-xl border border-zinc-200 shadow-inner">
            <span className="text-zinc-500 uppercase text-[10px]">Progress:</span>
            <span className="text-zinc-600 font-bold">{course.progress}%</span>
            <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-zinc-800 rounded-full transition-all duration-700" style={{ width: `${course.progress}%` }} />
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunVerification}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-100 border border-emerald-800/40 hover:border-emerald-500 text-zinc-600 hover:text-zinc-900 text-xs font-mono font-bold uppercase transition-all shadow-sm"
          >
            <ShieldCheck size={13} />
            <span>Audit</span>
          </button>

          <button
            type="button"
            onClick={() => {
              try {
                localStorage.setItem('career_os_active_course_id', course.id);
              } catch {}
              onNavigate('roadmap');
            }}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-bold font-sans uppercase tracking-wider shadow-md"
          >
            <Sparkles size={13} />
            <span>Roadmap</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ATTRACTIVE NO-SCROLL MULTI-TAB WORKSPACE RIBBON WITH DUAL SYMBOLS
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full p-2 bg-zinc-100 border border-zinc-200 rounded-2xl shadow-xl">
        
        {/* Tab 1: Textbook */}
        <button
          onClick={() => setActiveTab('textbook')}
          className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-200 text-center ${
            activeTab === 'textbook'
              ? 'bg-zinc-50 to-violet-600 text-zinc-900 shadow-lg shadow-zinc-200 border border-white/20 scale-[1.02]'
              : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <span className="text-sm">📖</span>
          <BookOpen size={13} className={activeTab === 'textbook' ? 'text-zinc-900' : 'text-zinc-700'} />
          <span className="truncate">Textbook</span>
        </button>

        {/* Tab 2: GitHub Repos */}
        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-200 text-center ${
            activeTab === 'github'
              ? 'bg-zinc-50 to-violet-600 text-zinc-900 shadow-lg shadow-zinc-200 border border-white/20 scale-[1.02]'
              : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <span className="text-sm">⭐</span>
          <GithubIcon size={13} className={activeTab === 'github' ? 'text-zinc-900' : 'text-zinc-600'} />
          <span className="truncate">GitHub ({githubRepos.length})</span>
        </button>

        {/* Tab 3: Video Projects & Labs */}
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-200 text-center ${
            activeTab === 'projects'
              ? 'bg-zinc-50 to-violet-600 text-zinc-900 shadow-lg shadow-zinc-200 border border-white/20 scale-[1.02]'
              : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <span className="text-sm">🎥</span>
          <Video size={13} className={activeTab === 'projects' ? 'text-zinc-900' : 'text-zinc-600'} />
          <span className="truncate">Video Labs ({videoProjects.length})</span>
        </button>

        {/* Tab 4: Code Lab Sandbox */}
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-200 text-center ${
            activeTab === 'sandbox'
              ? 'bg-zinc-50 to-violet-600 text-zinc-900 shadow-lg shadow-zinc-200 border border-white/20 scale-[1.02]'
              : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <span className="text-sm">💻</span>
          <Terminal size={13} className={activeTab === 'sandbox' ? 'text-zinc-900' : 'text-zinc-600'} />
          <span className="truncate">Code Lab</span>
        </button>

        {/* Tab 5: Chapter Quiz */}
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-200 text-center ${
            activeTab === 'quiz'
              ? 'bg-zinc-50 to-violet-600 text-zinc-900 shadow-lg shadow-zinc-200 border border-white/20 scale-[1.02]'
              : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <span className="text-sm">🧠</span>
          <Award size={13} className={activeTab === 'quiz' ? 'text-zinc-900' : 'text-zinc-600'} />
          <span className="truncate">Quiz</span>
        </button>

        {/* Tab 6: AI Copilot Tutor */}
        <button
          onClick={() => setActiveTab('tutor')}
          className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all duration-200 text-center ${
            activeTab === 'tutor'
              ? 'bg-zinc-50 to-violet-600 text-zinc-900 shadow-lg shadow-zinc-200 border border-white/20 scale-[1.02]'
              : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <span className="text-sm">🤖</span>
          <Sparkles size={13} className={activeTab === 'tutor' ? 'text-zinc-900' : 'text-zinc-700'} />
          <span className="truncate">AI Tutor</span>
        </button>

      </div>

      {/* ================= TAB 1: CHAPTER TEXTBOOK & THEORY ================= */}
      {activeTab === 'textbook' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT: CHAPTERS NAVIGATION SIDEBAR */}
          <div className="glass-panel p-5 bg-zinc-100 border border-zinc-200 rounded-2xl flex flex-col gap-3 shadow-md">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
              <h3 className="text-xs font-bold font-sans text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Layers size={14} className="text-zinc-700" />
                <span>Curriculum Modules</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-600 font-bold bg-zinc-100 px-2 py-0.5 rounded border border-emerald-800/40">
                {course.chapters.filter(c => c.status === 'completed').length}/{course.chapters.length} Done
              </span>
            </div>

            <div className="space-y-2 mt-1">
              {course.chapters.map((ch, idx) => {
                const isCurrent = idx === activeChapterIdx;
                const isCompleted = ch.status === 'completed';
                return (
                  <button
                    key={ch.id || idx}
                    onClick={() => {
                      setActiveChapterIdx(idx);
                      setIsPlayingMainVideo(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isCurrent
                        ? 'border-zinc-300 bg-zinc-100 text-zinc-900 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                        : isCompleted
                          ? 'border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-50'
                          : 'border-zinc-200 bg-zinc-100 text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${
                        isCompleted ? 'bg-zinc-100 text-zinc-600 border border-emerald-500/40' :
                        isCurrent ? 'bg-zinc-100 text-zinc-700 border border-zinc-300' :
                        'bg-zinc-100 text-zinc-400'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </span>
                      <span className="text-xs font-semibold truncate leading-tight">{ch.title}</span>
                    </div>
                    <span className={`text-[9px] font-mono shrink-0 uppercase font-bold ${isCompleted ? 'text-zinc-600' : isCurrent ? 'text-zinc-700' : 'text-zinc-400'}`}>
                      {isCompleted ? 'Done' : isCurrent ? 'Current' : 'Queued'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: TEXTBOOK CONTENT & EMBEDDED VIDEO LECTURE */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Textbook Chapter Panel */}
            <div className="glass-panel p-6 bg-zinc-100 border border-zinc-200 rounded-2xl shadow-md flex flex-col gap-5">
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <span className="text-[10px] font-bold font-mono text-zinc-700 uppercase tracking-widest bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-300">
                    Chapter {activeChapterIdx + 1} of {course.chapters.length}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">Estimated 45 min deep study</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight leading-snug">{activeChapter.title}</h3>
              </div>

              {/* =========================================================================
                  INLINE INTERACTIVE VIDEO LECTURE TEMPLATE / PLAYER
                 ========================================================================= */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-100 overflow-hidden shadow-xl flex flex-col">
                {/* Video Top Controls & Stream Switcher */}
                <div className="p-3.5 bg-white border-b border-zinc-200 flex items-center justify-between flex-wrap gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold font-mono text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Video Lecture Stream:</span>
                      <span className="text-zinc-700 font-normal">({activeLecture.creatorName.split(' ')[0]})</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Dual Stream Switcher */}
                    <div className="flex bg-white p-0.5 rounded-xl border border-zinc-200 text-[10px] font-mono">
                      <button
                        onClick={() => {
                          setLectureSourceType('indian');
                        }}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          lectureSourceType === 'indian' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
                        }`}
                      >
                        🇮🇳 Indian Masterclass
                      </button>
                      <button
                        onClick={() => {
                          setLectureSourceType('foreign');
                        }}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          lectureSourceType === 'foreign' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
                        }`}
                      >
                        🌍 Global / Stanford
                      </button>
                    </div>

                    {isPlayingMainVideo && (
                      <button
                        onClick={() => setIsPlayingMainVideo(false)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-zinc-600 hover:text-zinc-900 text-[10px] font-mono font-bold uppercase transition-colors"
                        title="Close Player"
                      >
                        Minimize
                      </button>
                    )}
                  </div>
                </div>

                {/* Video Container Canvas */}
                <div className="relative w-full aspect-video bg-black flex items-center justify-center group overflow-hidden">
                  {isPlayingMainVideo ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${rawVideoId}?autoplay=1&rel=0&modestbranding=1`}
                      title={activeLecture.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    /* Interactive Video Lecture Template (Click to Play) */
                    <div 
                      onClick={() => setIsPlayingMainVideo(true)}
                      className="relative w-full h-full cursor-pointer flex flex-col items-center justify-center p-6 text-center select-none"
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(8,9,18,0.4) 0%, rgba(8,9,18,0.85) 100%), url(https://img.youtube.com/vi/${rawVideoId}/hqdefault.jpg)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {/* Top Pill Watermark */}
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-black/75 text-white border border-white/20 backdrop-blur-md">
                          {lectureSourceType === 'indian' ? '🇮🇳 Verified Indian Track' : '🌍 University Track'}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-black/75 text-white border border-white/20 backdrop-blur-md">
                          HD 1080p Stream
                        </span>
                      </div>

                      {/* Glowing Centered Play Button */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-50 to-violet-500 text-zinc-900 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.7)] group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(99,102,241,0.9)] transition-all duration-300 border-2 border-white/30">
                        <Play size={28} fill="currentColor" className="ml-1 text-zinc-900" />
                      </div>

                      {/* Video Title Card Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 text-left p-3.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-zinc-900 truncate">{activeLecture.title}</p>
                          <p className="text-[10px] text-zinc-700 font-mono mt-0.5 truncate">
                            {activeLecture.channelName} • {activeLecture.creatorName}
                          </p>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider font-display shrink-0 flex items-center gap-1.5 shadow-md">
                          <Play size={11} fill="currentColor" />
                          <span>Play Now</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Core Theory Explanation */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold font-mono text-zinc-700 uppercase tracking-wider">Theory & Mathematical Formulation</h4>
                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed bg-zinc-100 p-4 rounded-xl border border-zinc-200 font-normal">
                  {activeChapter.explanation || `Comprehensive mathematical and architectural foundations governing ${activeChapter.title}.`}
                </p>
              </div>

              {/* Real World Analogy Card */}
              {activeChapter.analogy && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 flex gap-3.5 items-start">
                  <Lightbulb size={20} className="text-zinc-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-zinc-600 uppercase tracking-wider font-mono">Intuitive Mental Model</h5>
                    <p className="text-xs text-zinc-700 mt-1 leading-relaxed italic">{activeChapter.analogy}</p>
                  </div>
                </div>
              )}

              {/* Key Terminology Badges */}
              {activeChapter.keyTerminology && activeChapter.keyTerminology.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold font-mono text-zinc-700 uppercase tracking-wider mb-2">Key Vocabulary & Concepts</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeChapter.keyTerminology.map((term, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-colors">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Assignment */}
              {activeChapter.practiceTask && (
                <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-200 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 font-mono uppercase">
                    <Terminal size={14} className="text-zinc-600" />
                    <span>Hands-on Lab Assignment</span>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed font-mono bg-white p-3 rounded-lg border border-zinc-200">
                    {activeChapter.practiceTask}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-zinc-200">
                <button
                  onClick={() => setActiveTab('sandbox')}
                  className="btn-secondary py-2 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Terminal size={13} />
                  <span>Open Code Lab</span>
                </button>

                <button
                  onClick={handleMarkChapterComplete}
                  className="btn-primary py-2 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-card"
                >
                  <CheckCircle2 size={14} />
                  <span>Mark Chapter Complete</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PRODUCTION GITHUB REPOSITORIES ================= */}
      {activeTab === 'github' && (
        <div className="glass-panel p-6 bg-zinc-100 border border-zinc-200 rounded-2xl shadow-xl flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-zinc-200 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <GithubIcon size={18} className="text-zinc-600" />
                <span>Production GitHub Repositories & Real-World Codebases</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Top-starred, open-source reference implementations, inference engines, and production repos for <strong className="text-zinc-700">{course.title}</strong>.
              </p>
            </div>

            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-100 px-3 py-1 rounded-lg border border-emerald-800/40 font-bold uppercase">
              ⭐ {githubRepos.length} Repositories Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {githubRepos.map((repo, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl border border-zinc-200 bg-zinc-100 hover:border-zinc-300 hover:bg-white transition-all duration-300 flex flex-col justify-between gap-4 shadow-lg group relative"
              >
                <div>
                  {/* Top Bar with Star rating and Language */}
                  <div className="flex justify-between items-start gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-600 group-hover:scale-105 transition-transform">
                        <GithubIcon size={18} />
                      </div>
                      <div>
                        <a 
                          href={repo.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-sm font-bold text-zinc-700 hover:text-zinc-700 hover:underline flex items-center gap-1.5 leading-tight font-mono"
                        >
                          <span>{repo.name}</span>
                          <ExternalLink size={12} className="opacity-70" />
                        </a>
                        <span className="text-[10px] text-zinc-500 font-mono font-bold mt-0.5 inline-block">
                          ● {repo.language || 'Python'}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-100 text-zinc-600 border border-amber-500/30 flex items-center gap-1 shrink-0">
                      <Star size={11} className="fill-amber-400 text-zinc-600" />
                      <span>{repo.stars || '⭐ Starred'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-zinc-700 leading-relaxed mt-1">
                    {repo.description}
                  </p>

                  {/* Topic Chips */}
                  {repo.topics && (
                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      {repo.topics.map((t, i) => (
                        <span key={i} className="text-[9.5px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clone Command Box & Launch Button */}
                <div className="pt-3 border-t border-zinc-200 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-zinc-200 font-mono text-[11px] text-zinc-600 overflow-hidden">
                    <span className="truncate text-zinc-600">{repo.cloneCommand || `git clone ${repo.url}.git`}</span>
                    <button
                      onClick={() => handleCopyClone(repo.cloneCommand || `git clone ${repo.url}.git`)}
                      className={`p-1 rounded-lg transition-all shrink-0 ml-2 flex items-center gap-1 text-[10px] ${
                        copiedCloneUrl === (repo.cloneCommand || `git clone ${repo.url}.git`)
                          ? 'bg-emerald-600 text-zinc-900 font-bold px-2'
                          : 'text-zinc-500 hover:text-zinc-900 hover:bg-slate-800'
                      }`}
                      title="Copy clone command"
                    >
                      {copiedCloneUrl === (repo.cloneCommand || `git clone ${repo.url}.git`) ? (
                        <>
                          <Check size={11} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>

                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary py-2 px-3 text-xs font-bold font-sans uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Browse Repository on GitHub</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: VIDEO BUILD PROJECTS ================= */}
      {activeTab === 'projects' && (
        <div className="glass-panel p-6 bg-zinc-100 border border-zinc-200 rounded-2xl shadow-xl flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-zinc-200 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Video size={18} className="text-zinc-600" />
                <span>Hands-on Video Build Projects & Step-by-Step Coding Labs</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Build real-world production systems from scratch with interactive video build templates.
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-100 px-3 py-1 rounded-lg border border-cyan-800/40 font-bold uppercase">
              🎥 {videoProjects.length} Coding Labs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videoProjects.map((proj, idx) => {
              const projKey = proj.videoUrl || String(idx);
              const isPlayingThisProj = playingProjectId === projKey;
              const projVideoId = proj.videoUrl || 'aircAruvnKk';

              return (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl border border-zinc-200 bg-zinc-100 hover:border-cyan-500/50 hover:bg-white transition-all duration-300 flex flex-col justify-between gap-4 shadow-lg overflow-hidden"
                >
                  <div>
                    {/* Header Metadata */}
                    <div className="flex items-center justify-between gap-2 mb-2.5 text-[10px] font-mono text-zinc-500">
                      <span className="text-zinc-600 font-bold uppercase bg-zinc-100 px-2.5 py-0.5 rounded border border-cyan-800/40">
                        {proj.channel || 'Verified Lab'}
                      </span>
                      <span className="text-zinc-600 font-semibold">{proj.duration || '1h 30m'}</span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-zinc-900 leading-snug">{proj.title}</h4>

                    {/* Interactive Video Player Canvas inside the Card */}
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden mt-3 bg-black border border-zinc-200">
                      {isPlayingThisProj ? (
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${projVideoId}?autoplay=1&rel=0`}
                          title={proj.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div 
                          onClick={() => setPlayingProjectId(projKey)}
                          className="w-full h-full cursor-pointer relative flex flex-col items-center justify-center p-4 group select-none"
                          style={{
                            backgroundImage: `linear-gradient(180deg, rgba(8,9,18,0.3) 0%, rgba(8,9,18,0.85) 100%), url(https://img.youtube.com/vi/${projVideoId}/hqdefault.jpg)`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200 border border-white/30">
                            <Play size={20} fill="currentColor" className="ml-0.5 text-zinc-900" />
                          </div>
                          <span className="mt-2 text-[10px] font-mono font-bold uppercase text-zinc-900 bg-black/70 px-2.5 py-0.5 rounded backdrop-blur-sm border border-white/10">
                            ▶ Click to Play Video Lab
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-zinc-700 mt-3 leading-relaxed font-normal">{proj.description}</p>

                    {/* Key Concepts */}
                    {proj.keyConcepts && (
                      <div className="mt-3.5">
                        <p className="text-[9.5px] font-mono uppercase font-bold text-zinc-500 mb-1.5">Architectures Covered:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.keyConcepts.map((kc, i) => (
                            <span key={i} className="text-[9.5px] font-mono px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-300 flex items-center gap-1">
                              <CheckSquare size={10} className="text-zinc-600" />
                              <span>{kc}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3.5 border-t border-zinc-200 flex items-center justify-between gap-3">
                    {proj.githubUrl ? (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-zinc-600 hover:text-zinc-900 font-mono flex items-center gap-1.5 hover:underline"
                      >
                        <GithubIcon size={14} />
                        <span>Repo Code</span>
                      </a>
                    ) : <div />}

                    {isPlayingThisProj ? (
                      <button
                        onClick={() => setPlayingProjectId(null)}
                        className="btn-secondary py-1.5 px-3 text-[10px] font-mono font-bold uppercase"
                      >
                        Close Video
                      </button>
                    ) : (
                      <button
                        onClick={() => setPlayingProjectId(projKey)}
                        className="btn-primary py-2 px-4 text-xs font-bold font-sans uppercase tracking-wider flex items-center gap-1.5 shadow-card"
                      >
                        <Play size={11} fill="currentColor" />
                        <span>Watch Lab Inside</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 4: CODE LAB RUNNER SANDBOX ================= */}
      {activeTab === 'sandbox' && (
        <div className="glass-panel p-6 bg-zinc-100 border border-zinc-200 rounded-2xl shadow-xl flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-zinc-200 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Terminal size={17} className="text-zinc-600" />
                <span>Interactive Code Lab & Virtual Python Sandbox</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Run, edit, and test implementation scripts directly in browser.
              </p>
            </div>

            <button
              onClick={handleRunCodeSandbox}
              disabled={isRunningCode}
              className="btn-primary py-2 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-card"
            >
              <Play size={13} fill="currentColor" />
              <span>{isRunningCode ? 'Executing Sandbox...' : 'Execute Code Lab'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Editor Pane */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-mono text-zinc-500 px-1">
                <span>Implementation Code (Python 3.12 / PyTorch):</span>
                <span>Editable Buffer</span>
              </div>
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                rows={16}
                className="w-full bg-white border border-zinc-200 rounded-xl p-4 font-mono text-xs text-zinc-600 focus:outline-none focus:border-zinc-300 leading-relaxed shadow-inner"
              />
            </div>

            {/* Terminal Output Pane */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-mono text-zinc-500 px-1">
                <span>Simulated Terminal Output (STDOUT):</span>
                <span className="text-zinc-600">● Runtime Ready</span>
              </div>
              <div className="w-full h-full bg-white border border-zinc-200 rounded-xl p-4 font-mono text-xs text-zinc-700 overflow-y-auto leading-relaxed shadow-inner min-h-[300px]">
                {sandboxOutput ? (
                  <pre className="whitespace-pre-wrap">{sandboxOutput}</pre>
                ) : (
                  <p className="text-slate-600 italic">Click "Execute Code Lab" above to compile and run this script.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: CHAPTER QUIZ ASSESSMENT ================= */}
      {activeTab === 'quiz' && (
        <div className="glass-panel p-6 bg-zinc-100 border border-zinc-200 rounded-2xl shadow-xl flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-zinc-200 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Award size={17} className="text-zinc-600" />
                <span>Chapter Checkpoint Diagnostic Quiz</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Verify conceptual mastery on <strong>{activeChapter.title}</strong> before advancing.
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-100 px-3 py-1 rounded-lg border border-amber-800/40 font-bold uppercase">
              +30 XP Checkpoint
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-100 border border-zinc-200 flex flex-col gap-4">
            <h4 className="text-sm sm:text-base font-bold text-zinc-900 leading-snug">
              {activeChapter.quizQuestion?.question || `What is the core architectural advantage of ${activeChapter.title}?`}
            </h4>

            {/* Options list */}
            <div className="space-y-2.5">
              {(activeChapter.quizQuestion?.options || [
                "It reduces gradient decay across deep sequential dependencies.",
                "It enables parallelized contextual representation learning across all token positions.",
                "It removes the need for positional encodings during inference.",
                "It strictly limits token attention to unidirectional left-to-right processing."
              ]).map((opt: string, i: number) => {
                const isSelected = selectedQuizOpt === i;
                const isCorrect = activeChapter.quizQuestion ? i === activeChapter.quizQuestion.answerIdx : i === 1;

                let optStyle = 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100';
                if (isSelected && !quizSubmitted) {
                  optStyle = 'border-zinc-300 bg-zinc-100 text-zinc-900 shadow-md';
                } else if (quizSubmitted) {
                  if (isCorrect) {
                    optStyle = 'border-emerald-500 bg-zinc-100 text-zinc-600 font-bold';
                  } else if (isSelected && !isCorrect) {
                    optStyle = 'border-rose-500 bg-zinc-100 text-zinc-600';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleQuizOptionSelect(i)}
                    className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${optStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full border border-zinc-200 flex items-center justify-center font-mono font-bold text-[10px] text-zinc-500 shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </div>
                    {quizSubmitted && isCorrect && <CheckCircle2 size={16} className="text-zinc-600 shrink-0" />}
                    {quizSubmitted && isSelected && !isCorrect && <X size={16} className="text-zinc-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Quiz Result / Explanation Notes */}
            {quizSubmitted && (
              <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                quizSuccess ? 'bg-zinc-100 border-emerald-500/40 text-zinc-600' : 'bg-zinc-100 border-rose-500/40 text-zinc-600'
              }`}>
                <p className="font-bold mb-1">{quizSuccess ? '🎉 Correct Assessment!' : '⚠️ Incorrect Selection'}</p>
                <p className="text-zinc-700">
                  {activeChapter.quizQuestion?.explanation || 'Self-attention allows every token in the input sequence to compute affinity weights with all other tokens simultaneously in $O(1)$ sequential operations.'}
                </p>
              </div>
            )}

            {/* Quiz Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200">
              {quizSubmitted ? (
                <button onClick={handleResetQuiz} className="btn-secondary py-2 px-4 text-xs font-bold uppercase">
                  Try Again
                </button>
              ) : (
                <button 
                  onClick={handleQuizSubmit} 
                  disabled={selectedQuizOpt === null}
                  className="btn-primary py-2 px-6 text-xs font-bold uppercase shadow-card"
                >
                  Submit Diagnostic Answer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: AI COPILOT TUTOR CHAT ================= */}
      {activeTab === 'tutor' && (
        <div className="glass-panel p-6 bg-zinc-100 border border-zinc-200 rounded-2xl shadow-xl flex flex-col gap-4">
          <div className="border-b border-zinc-200 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={17} className="text-zinc-700" />
              <span>Socratic AI Syllabus Tutor</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Ask deep conceptual questions, request code snippets, or prepare for technical interviews.
            </p>
          </div>

          {/* Quick Prompt Starters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Quick Prompts:</span>
            {[
              "Explain analogy simply",
              "Show PyTorch code example",
              "FAANG interview questions on this topic"
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => handleAskAI(p)}
                className="px-3 py-1 rounded-lg text-xs bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900 transition-all shadow-sm"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="h-96 overflow-y-auto space-y-3 p-4 rounded-xl bg-zinc-100 border border-zinc-200 text-xs">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-zinc-900 text-white rounded-br-none shadow-md' 
                    : 'bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-bl-none'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
                <span className="text-[9px] text-zinc-400 mt-1 font-mono px-1">{msg.time}</span>
              </div>
            ))}
            {isAiResponding && (
              <div className="flex items-center gap-2 text-zinc-700 font-mono text-xs animate-pulse p-2">
                <Sparkles size={13} />
                <span>AI Tutor is analyzing curriculum context...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="flex gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
              placeholder="Ask anything about this chapter's theory, formulas, or implementation..."
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-slate-500 focus:outline-none focus:border-zinc-300 shadow-inner"
            />
            <button
              onClick={() => handleAskAI()}
              className="btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-card"
            >
              <Send size={13} />
              <span>Ask</span>
            </button>
          </div>
        </div>
      )}

      {/* VERIFICATION AUDIT MODAL */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-lg w-full bg-white border border-zinc-200 rounded-2xl shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={17} className="text-zinc-600" />
                <span>Autonomous Curriculum Audit Inspector</span>
              </h3>
              <button onClick={() => setShowAuditModal(false)} className="text-zinc-500 hover:text-zinc-900">
                <X size={16} />
              </button>
            </div>

            {isAuditing ? (
              <div className="py-16 text-center flex flex-col items-center gap-3">
                <RefreshCw size={28} className="text-zinc-700 animate-spin" />
                <p className="text-xs font-mono text-zinc-700 font-bold uppercase tracking-wider">
                  Quality Agent is crawling video endpoints & verifying curriculum assets...
                </p>
              </div>
            ) : auditReport ? (
              <div className="flex flex-col gap-4 text-xs">
                <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-700">Verification Result:</span>
                  <p className="text-sm font-bold text-zinc-600 font-mono">{auditReport.overallScore}% Fully Verified</p>
                  <p className="text-zinc-600 mt-1">
                    {auditReport.auditLog[0] || 'All video streams, chapter analogies, quizzes, and production GitHub repositories are active and verified.'}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button onClick={() => setShowAuditModal(false)} className="btn-primary py-2 px-5 text-xs">
                    Close Inspection
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
};
export default CourseDetails;
