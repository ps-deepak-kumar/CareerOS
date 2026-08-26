import React, { useState, useEffect, useRef } from 'react';
import { PageId } from '../components/Layout';
import { ArrowLeft, BookOpen, Code, ArrowRight, CheckCircle, Play, Sparkles, Send, HelpCircle, Check, X, Lightbulb, ExternalLink } from 'lucide-react';
import { stateManager } from '../services/stateManager';
import { Course } from '../data/mockData';

interface CourseDetailsProps {
  onNavigate: (page: PageId) => void;
  courseId: string;
}

export const CourseDetails: React.FC<CourseDetailsProps> = ({ onNavigate, courseId }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  
  // Interactive Quiz State
  const [selectedQuizOpt, setSelectedQuizOpt] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);

  // AI Assistant Chat State
  const [aiInput, setAiInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Video thumbnail state — must be here (before any early return) to satisfy Rules of Hooks
  const [thumbError, setThumbError] = useState(false);

  useEffect(() => {
    const courses = stateManager.getCourses();
    const found = courses.find(c => c.id === courseId) || courses[0];
    if (found) {
      setCourse(found);
      
      // Auto-set to the active 'current' chapter
      const activeIdx = found.chapters.findIndex(ch => ch.status === 'current');
      if (activeIdx !== -1) {
        setActiveChapterIdx(activeIdx);
      } else {
        setActiveChapterIdx(0);
      }
    }
  }, [courseId]);

  useEffect(() => {
    // Reset quiz state whenever active chapter changes
    setSelectedQuizOpt(null);
    setQuizSubmitted(false);
    setQuizSuccess(false);
  }, [activeChapterIdx]);

  useEffect(() => {
    // Scroll chat to bottom
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!course) {
    return <div className="text-center text-xs text-slate-500 py-10 italic">Loading chapter curriculum...</div>;
  }

  const activeChapter = course.chapters[activeChapterIdx] || course.chapters[0];

  const handleMarkChapterComplete = () => {
    if (!course) return;

    const updatedChapters = course.chapters.map((ch, idx) => {
      if (idx === activeChapterIdx) {
        return { ...ch, status: 'completed' as const };
      }
      if (idx === activeChapterIdx + 1 && ch.status === 'locked') {
        return { ...ch, status: 'current' as const };
      }
      return ch;
    });

    const completedCount = updatedChapters.filter(ch => ch.status === 'completed').length;
    const newProgress = Math.round((completedCount / course.chapters.length) * 100);

    const updatedCourse: Course = {
      ...course,
      progress: newProgress,
      completedLessons: course.completedLessons < course.totalLessons ? course.completedLessons + 4 : course.totalLessons,
      completedQuizzes: course.completedQuizzes < course.totalQuizzes ? course.completedQuizzes + 1 : course.totalQuizzes,
      chapters: updatedChapters,
      currentChapter: activeChapterIdx < course.chapters.length - 1 ? course.chapters[activeChapterIdx + 1].title : 'Curriculum Completed'
    };

    const coursesList = stateManager.getCourses();
    const cIdx = coursesList.findIndex(c => c.id === course.id);
    if (cIdx !== -1) {
      coursesList[cIdx] = updatedCourse;
      stateManager.saveCourses(coursesList);
      setCourse(updatedCourse);

      // Trigger XP heatmap updates
      stateManager.logActivity(3);

      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Progress Agent',
        action: 'chapter_completion',
        status: 'success',
        message: `Saved completion of chapter: "${course.chapters[activeChapterIdx].title}". Module progress: ${newProgress}%.`,
        reasoning: 'Verifying competency indicators before enabling diagnostic quiz assessments.'
      });

      if (activeChapterIdx < course.chapters.length - 1) {
        setActiveChapterIdx(activeChapterIdx + 1);
      }
    }
  };

  const handleQuizSubmit = () => {
    if (selectedQuizOpt === null || !activeChapter.quizQuestion) return;
    
    setQuizSubmitted(true);
    const correct = selectedQuizOpt === activeChapter.quizQuestion.answerIdx;
    setQuizSuccess(correct);

    stateManager.addLog({
      timestamp: new Date().toLocaleTimeString(),
      agent: 'Assessment Agent',
      action: 'grade_quiz',
      status: correct ? 'success' : 'warning',
      message: correct 
        ? `Passed assessment quiz for chapter: "${activeChapter.title}" with score 100%.`
        : `Failed assessment quiz for chapter: "${activeChapter.title}". Correct answer required to master topic.`,
      reasoning: 'Updating diagnostic student parameters and checking achievements rules.'
    });
    
    if (correct) {
      stateManager.logActivity(2);
    }
  };

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiInput('');

    // Simulate AI response
    setTimeout(() => {
      let aiResponseText = `### CareerOS AI Instructor: ${activeChapter.title}\n\n`;
      const q = userMsg.toLowerCase();

      if (q.includes('explain') || q.includes('what') || q.includes('how')) {
        aiResponseText += `Here is a simplified explanation aligned with your target **${course.difficulty}** track:

* **Core Premise:** The focus concepts inside this chapter govern how variables scale coordinates dynamically.
* **Analogy:** Think of it like mapping coordinates on a digital globe. Instead of plotting values on a flat grid, we map vectors as relationships (angles) to preserve distances.
* **Why it Matters:** Without this math, deep networks struggle to balance gradients, leading to poor optimization.`;
      } else {
        aiResponseText += `I registered your question regarding "${userMsg}". 

Here are study pointers for the **${course.difficulty}** track:
1. **Syllabus Context:** Review the **Analyst Analogy** and the **Code Block** inside this chapter.
2. **Implementation check:** Try coding the pytest assignment on your terminal. Let me know if you run into syntax exceptions!`;
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponseText }]);

      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Learning Agent',
        action: 'query_assistant',
        status: 'success',
        message: `Replied to student prompt: "${userMsg.substring(0, 30)}..."`,
        reasoning: 'Tailoring mathematical explanation to student background constraints.'
      });
    }, 800);
  };

  // Video section — thumbnail card approach (no iframes, no embedding errors)
  // YouTube CDN thumbnails are always publicly accessible
  const rawVideoId = activeChapter.videoUrl || course.videoUrl || 'kCc8FmEb1nY';
  const thumbnailUrl = `https://img.youtube.com/vi/${rawVideoId}/maxresdefault.jpg`;
  const thumbnailFallback = `https://img.youtube.com/vi/${rawVideoId}/hqdefault.jpg`;
  // No &t= timestamp — chapter offsets caused YouTube "unavailable" errors on shorter videos
  const youtubeLink = `https://www.youtube.com/watch?v=${rawVideoId}`;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('learning')}
            className="p-2 rounded-lg bg-[#0c0d15] border border-brand-border text-slate-400 hover:text-white hover:bg-slate-900 transition-all shrink-0"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-bold font-mono">Personalized Course textbook</span>
            <h2 className="text-base font-bold font-display text-white mt-0.5">{course.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0 font-mono font-semibold">
          <span className="text-slate-500 uppercase tracking-wider">Module Progress: {course.progress}%</span>
          <div className="w-24 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${course.progress}%` }} />
          </div>
        </div>
      </div>

      {/* SPLIT PANEL CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT INDEX COLUMN */}
        <div className="lg:col-span-1 glass-panel p-3.5 flex flex-col gap-4 bg-[#0c0d15] h-fit">
          <div className="flex justify-between items-center border-b border-brand-border pb-2">
            <h3 className="text-[10px] font-bold font-display text-slate-500 uppercase tracking-wider">
              Syllabus Chapters
            </h3>
            {course.provider && (
              <span className="text-[8px] bg-indigo-950/20 text-indigo-400 border border-indigo-900/30 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                {course.provider}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 text-[11px]">
            {course.chapters.map((ch, idx) => {
              const isActive = idx === activeChapterIdx;
              const isCompleted = ch.status === 'completed';
              const isLocked = ch.status === 'locked';
              
              return (
                <button
                  key={ch.id}
                  onClick={() => !isLocked && setActiveChapterIdx(idx)}
                  className={`w-full flex items-center justify-between p-2 rounded-md border text-left transition-all ${
                    isActive 
                      ? 'border-indigo-500 text-white bg-indigo-950/20 font-bold shadow-[inset_0_0_8px_rgba(99,102,241,0.1)]' 
                      : isCompleted
                      ? 'border-transparent text-emerald-400 bg-emerald-950/5 hover:bg-emerald-950/10'
                      : isLocked
                      ? 'border-transparent text-slate-600 cursor-not-allowed opacity-50'
                      : 'border-transparent text-slate-400 hover:bg-slate-900/20'
                  }`}
                  disabled={isLocked}
                >
                  <span className="truncate pr-2">Ch {idx + 1}: {ch.title}</span>
                  {isCompleted ? (
                    <CheckCircle size={12} className="text-emerald-500 shrink-0 animate-fade-in" />
                  ) : isLocked ? (
                    <span className="text-[8px] text-slate-700 font-mono font-bold uppercase shrink-0">lock</span>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN TEXTBOOK PANE & ASSISTANT */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Main Book Reader */}
          <div className="glass-panel p-6 flex flex-col gap-6 text-slate-350 leading-relaxed bg-[#090a0f]/20">
            
            {/* Title */}
            <div className="border-b border-slate-900 pb-4">
              <span className="text-[9px] text-indigo-400 font-bold uppercase font-mono tracking-widest bg-indigo-950/20 border border-indigo-900/30 px-2 py-0.5 rounded">
                Chapter {activeChapterIdx + 1}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white mt-2">
                {activeChapter.title}
              </h1>
              {course.license && (
                <p className="text-[8.5px] text-slate-500 font-mono mt-1">Open License Attribution: {course.license}</p>
              )}
            </div>

            {/* WHAT YOU WILL LEARN */}
            {activeChapter.explanation && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen size={12} className="text-indigo-400" />
                  <span>Syllabus Explanation</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {activeChapter.explanation}
                </p>
              </div>
            )}

            {/* ANALOGY */}
            {activeChapter.analogy && (
              <div className="bg-indigo-950/10 p-4 rounded-xl border border-indigo-900/20 text-xs">
                <h4 className="text-[10px] font-bold text-indigo-400 mb-1 uppercase tracking-wider font-display flex items-center gap-1">
                  <Lightbulb size={11} className="text-indigo-400" />
                  <span>Analogy Breakdown</span>
                </h4>
                <p className="text-slate-400">
                  {activeChapter.analogy}
                </p>
              </div>
            )}

            {/* VIDEO SECTION — YouTube Thumbnail Card (zero errors, always works) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Play size={12} className="text-red-400" />
                  <span>Lecture Video</span>
                  <span className="text-[8px] font-mono bg-red-950/30 border border-red-900/30 text-red-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Chapter {activeChapterIdx + 1}
                  </span>
                </h3>
                <a
                  href={youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[9px] font-bold font-mono uppercase tracking-wider text-red-400 hover:text-red-300 border border-red-900/40 hover:border-red-600/60 bg-red-950/20 hover:bg-red-950/30 px-2 py-1 rounded-lg transition-all"
                >
                  <ExternalLink size={9} />
                  <span>YouTube</span>
                </a>
              </div>

              {/* Thumbnail player card */}
              <a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-full aspect-video rounded-xl overflow-hidden border border-[#1e2238] hover:border-red-500/60 shadow-lg cursor-pointer block transition-all duration-300"
              >
                {/* Thumbnail image */}
                {!thumbError ? (
                  <img
                    src={thumbnailUrl}
                    alt={activeChapter.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => setThumbError(true)}
                  />
                ) : (
                  <img
                    src={thumbnailFallback}
                    alt={activeChapter.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/70 transition-all duration-300" />

                {/* Center play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center shadow-2xl shadow-red-900/60 group-hover:scale-110 transition-all duration-300">
                    <Play size={28} className="text-white ml-1" fill="white" />
                  </div>
                </div>

                {/* Bottom info bar */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between">
                  <div>
                    <p className="text-[9px] text-red-400 font-mono font-bold uppercase tracking-widest mb-0.5">
                      {course.provider || 'freeCodeCamp'}
                    </p>
                    <p className="text-xs font-bold text-white font-display leading-snug line-clamp-1">
                      {activeChapter.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider shrink-0 transition-all">
                    <ExternalLink size={9} />
                    <span>Watch Now</span>
                  </div>
                </div>
              </a>
              <p className="text-[8.5px] text-slate-600 font-mono text-center">
                Click to open on YouTube › Chapter {activeChapterIdx + 1} lecture
              </p>
            </div>

            {/* TERMINOLOGY */}
            {activeChapter.keyTerminology && activeChapter.keyTerminology.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider text-slate-400">Key Terminology</h3>
                <div className="flex flex-wrap gap-1.5">
                  {activeChapter.keyTerminology.map(term => (
                    <span key={term} className="px-2.5 py-1 text-[9px] font-mono rounded bg-slate-900 border border-slate-800 text-slate-450">
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* QUIZ SECTION */}
            {activeChapter.quizQuestion && (
              <div className="p-5 rounded-xl border border-[#1e2238] bg-[#0c0d15]/50 flex flex-col gap-4 text-xs">
                <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-indigo-400 animate-pulse" />
                  <span>Interactive Chapter Assessment</span>
                </h3>
                <p className="text-slate-300 font-semibold leading-relaxed">{activeChapter.quizQuestion.question}</p>
                
                {/* Options List */}
                <div className="flex flex-col gap-2">
                  {activeChapter.quizQuestion.options.map((opt, idx) => {
                    const isSelected = selectedQuizOpt === idx;
                    const showCorrect = quizSubmitted && idx === activeChapter.quizQuestion?.answerIdx;
                    const showWrong = quizSubmitted && isSelected && idx !== activeChapter.quizQuestion?.answerIdx;
                    
                    return (
                      <button
                        key={idx}
                        disabled={quizSubmitted}
                        onClick={() => setSelectedQuizOpt(idx)}
                        className={`w-full flex items-center gap-2 p-2.5 rounded-lg border text-left text-[11px] transition-all ${
                          showCorrect
                            ? 'border-emerald-500 bg-emerald-950/20 text-emerald-450 font-bold'
                            : showWrong
                            ? 'border-red-500 bg-red-950/20 text-red-400 font-bold'
                            : isSelected
                            ? 'border-indigo-500 bg-indigo-950/20 text-white font-bold'
                            : 'border-[#1e2238] bg-slate-950/40 text-slate-400 hover:text-slate-205 hover:bg-slate-900/30'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] shrink-0 ${
                          showCorrect ? 'border-emerald-500 bg-emerald-500 text-slate-950' :
                          showWrong ? 'border-red-500 bg-red-500 text-slate-950' :
                          isSelected ? 'border-indigo-500 bg-indigo-500 text-white' :
                          'border-slate-800'
                        }`}>
                          {showCorrect ? <Check size={10} strokeWidth={3} /> :
                           showWrong ? <X size={10} strokeWidth={3} /> :
                           String.fromCharCode(65 + idx)}
                        </div>
                        <span className="flex-1 leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Banners */}
                {quizSubmitted ? (
                  <div className={`p-3.5 rounded-lg border text-[11px] leading-relaxed ${
                    quizSuccess ? 'bg-emerald-950/15 border-emerald-900/30 text-emerald-450' : 'bg-red-950/15 border-red-900/30 text-red-400'
                  }`}>
                    <h4 className="font-bold font-display uppercase tracking-wider mb-1">
                      {quizSuccess ? '🎉 Option Correct' : '⚠ Option Incorrect'}
                    </h4>
                    <p className="text-slate-400">{activeChapter.quizQuestion.explanation}</p>
                  </div>
                ) : (
                  <button
                    disabled={selectedQuizOpt === null}
                    onClick={handleQuizSubmit}
                    className="btn-primary self-start text-[10px] py-1.5 px-4"
                  >
                    Submit Answer
                  </button>
                )}
              </div>
            )}

            {/* PRACTICE LAB EXERCISE */}
            {activeChapter.practiceTask && (
              <div className="p-4 rounded-xl border border-brand-border/60 bg-slate-900/20 text-xs">
                <h3 className="text-xs font-bold text-white font-display mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Code size={12} className="text-indigo-400" />
                  <span>Practice Lab Exercise</span>
                </h3>
                <p className="text-slate-400 mb-3 leading-relaxed">
                  {activeChapter.practiceTask}
                </p>
                <div className="bg-[#07080f] border border-slate-900 rounded p-2.5 font-mono text-[9.5px] flex items-center justify-between text-slate-500 select-all">
                  <span>npm run test-curriculum</span>
                  <span className="text-indigo-400 font-bold uppercase tracking-wider font-display">Labs Hook Active</span>
                </div>
              </div>
            )}

            {/* FOOTER ACTIONS */}
            <div className="border-t border-[#1e2238] pt-6 flex justify-between items-center mt-4 text-xs select-none">
              <button 
                onClick={() => activeChapterIdx > 0 && setActiveChapterIdx(activeChapterIdx - 1)}
                className="btn-secondary text-[10px] border border-slate-800"
                disabled={activeChapterIdx === 0}
              >
                Previous Chapter
              </button>

              <button 
                disabled={activeChapter.quizQuestion !== undefined && !quizSuccess}
                onClick={handleMarkChapterComplete}
                className={`btn-primary text-[10px] flex items-center gap-1 shadow-md ${
                  activeChapter.quizQuestion !== undefined && !quizSuccess ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>{activeChapterIdx === course.chapters.length - 1 ? 'Finish course' : 'Complete & Next'}</span>
                <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </div>

          {/* Chat AI Assistant Drawer */}
          <div className="glass-panel p-5 flex flex-col gap-4 bg-[#0a0b12]/60 border border-[#1e2238]">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-indigo-400 animate-pulse" />
                <h4 className="text-[10px] font-bold font-display text-white uppercase tracking-wider">AI Syllabus Tutor</h4>
              </div>
              <span className="text-[8px] text-slate-500 font-mono uppercase font-bold">online • ready</span>
            </div>

            {/* Messages Pane */}
            <div className="flex flex-col gap-3 min-h-[160px] max-h-[220px] overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-900 text-[10px]">
              {chatMessages.length === 0 ? (
                <div className="my-auto text-center text-slate-600 italic">
                  Ask me to explain concepts, equations, or analogies in this chapter.
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[85%] rounded-lg p-2.5 ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-950/40 border border-indigo-900/30 text-indigo-300 self-end' 
                        : 'bg-[#0f111a] border border-[#1e2238] text-slate-450 self-start'
                    }`}
                  >
                    {msg.sender === 'ai' ? (
                      <div className="prose prose-invert max-w-full text-[10px] leading-relaxed">
                        {msg.text.split('\n').map((line, lIdx) => {
                          if (line.startsWith('###')) {
                            return <h5 key={lIdx} className="font-bold text-white font-display mb-1">{line.replace('###', '')}</h5>;
                          }
                          if (line.startsWith('*')) {
                            return <li key={lIdx} className="ml-2 list-none text-slate-400">{line.replace('*', '•')}</li>;
                          }
                          return <p key={lIdx} className="mb-0.5 text-slate-400">{line}</p>;
                        })}
                      </div>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleAskAI} className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={`Ask AI about: ${activeChapter.title}...`}
                className="bg-slate-950 border border-slate-900 focus:border-indigo-500/40 rounded-lg p-2 text-[10px] text-white focus:outline-none w-full"
              />
              <button 
                type="submit"
                disabled={!aiInput.trim()}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-550 text-white transition-colors shrink-0 disabled:opacity-50"
              >
                <Send size={12} />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
export default CourseDetails;
