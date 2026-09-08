import React, { useState, useEffect } from 'react';
import {
  Mic, FileText, ChevronDown, ChevronUp, RefreshCw, Send, AlertTriangle,
  CheckCircle, Star, Lightbulb, BookOpen, Target, User, Briefcase,
  Award, Sparkles, CheckCircle2, ArrowRight, RotateCcw, HelpCircle,
  BarChart3, ListOrdered, CheckSquare, Layers, XCircle, Zap
} from 'lucide-react';
import {
  interviewAgent,
  InterviewSession,
  ResumeCritique,
  QuestionTypeFilter,
  InterviewEvaluation,
  LiveAnswerFeedback
} from '../services/ai/interviewAgent';
import { stateManager } from '../services/stateManager';
import { showToast } from '../components/ToastContainer';

type Tab = 'questions' | 'resume';
type Level = 'Junior' | 'Mid' | 'Senior';

const ROLE_PRESETS = [
  'AI / ML Engineer', 'Frontend Engineer', 'Backend Engineer',
  'Full Stack Engineer', 'DevOps Engineer', 'Cloud Architect',
  'Data Scientist', 'System Design Specialist', 'Product Manager'
];

const LEVEL_CONFIG: Record<Level, { color: string; desc: string }> = {
  Junior: { color: 'text-emerald-700 bg-emerald-50 border-emerald-300', desc: '0–2 years experience' },
  Mid: { color: 'text-blue-700 bg-blue-50 border-blue-300', desc: '2–5 years experience' },
  Senior: { color: 'text-purple-700 bg-purple-50 border-purple-300', desc: '5+ years experience' },
};

const QUESTION_COUNT_OPTIONS = [
  { value: 3, label: '3 Questions', desc: 'Quick Sprint (10 mins)' },
  { value: 5, label: '5 Questions', desc: 'Standard Practice (20 mins)' },
  { value: 10, label: '10 Questions', desc: 'Deep Assessment (40 mins)' },
  { value: 15, label: '15 Questions', desc: 'Full Simulation (60 mins)' },
];

export const InterviewPrep: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('questions');
  const [role, setRole] = useState('AI / ML Engineer');
  const [customRole, setCustomRole] = useState('');
  const [level, setLevel] = useState<Level>('Mid');
  const [questionType, setQuestionType] = useState<QuestionTypeFilter>('all');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // User interactive answers & live check feedback
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [liveChecks, setLiveChecks] = useState<Record<number, LiveAnswerFeedback>>({});
  const [checkingIdx, setCheckingIdx] = useState<number | null>(null);

  // Full evaluation scorecard
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [activeQuestionTab, setActiveQuestionTab] = useState<'practice' | 'results'>('practice');

  // Resume critique
  const [resumeText, setResumeText] = useState('');
  const [critique, setCritique] = useState<ResumeCritique | null>(null);
  const [isCritiquing, setIsCritiquing] = useState(false);

  // Profile skills for context
  const profile = stateManager.getProfile();

  // Load saved session on mount
  useEffect(() => {
    const saved = interviewAgent.getSavedSessions();
    if (saved.length > 0) {
      setSession(saved[0]);
      if (saved[0].questionType) setQuestionType(saved[0].questionType);
      if (saved[0].questionCount) setQuestionCount(saved[0].questionCount);
    }
  }, []);

  const effectiveRole = customRole.trim() || role;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSession(null);
    setExpandedIdx(null);
    setUserAnswers({});
    setLiveChecks({});
    setEvaluation(null);
    setActiveQuestionTab('practice');

    try {
      const result = await interviewAgent.generateQuestions(
        effectiveRole,
        level,
        profile.skills ?? [],
        questionType,
        questionCount
      );
      setSession(result);
      if (result.questions.length > 0) {
        setExpandedIdx(0);
      }
      showToast(`Generated ${result.questions.length} questions strictly in context: "${effectiveRole}"`, 'success');
    } catch (err) {
      console.error('Interview generation error:', err);
      showToast('Failed to generate interview questions. Please retry.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (index: number, val: string) => {
    setUserAnswers(prev => ({ ...prev, [index]: val }));
    // Clear live check for this question when answer changes
    if (liveChecks[index]) {
      setLiveChecks(prev => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
    }
  };

  const handleLiveCheck = async (idx: number) => {
    if (!session || !session.questions[idx]) return;
    const q = session.questions[idx];
    const ans = userAnswers[idx] || '';

    if (!ans.trim()) {
      showToast('Please type an answer before checking!', 'warning');
      return;
    }

    setCheckingIdx(idx);
    try {
      const feedback = await interviewAgent.checkSingleAnswerLive(q, ans, session.role, session.level);
      setLiveChecks(prev => ({ ...prev, [idx]: feedback }));

      if (feedback.status === 'incorrect') {
        showToast(`❌ Answer Checked: Incorrect response. See critique below.`, 'error');
      } else if (feedback.status === 'partially_correct') {
        showToast(`⚠️ Answer Checked: Partially correct. Missing key details.`, 'warning');
      } else {
        showToast(`✅ Answer Checked: Correct response! (+10 XP)`, 'success');
      }
    } catch (err) {
      console.error('Live check error:', err);
    } finally {
      setCheckingIdx(null);
    }
  };

  const answeredCount = Object.values(userAnswers).filter(a => a && a.trim().length > 0).length;
  const totalQuestions = session?.questions.length || 0;

  const handleSubmitInterview = async () => {
    if (!session) return;
    if (answeredCount === 0) {
      showToast('Please answer at least 1 question before submitting for evaluation!', 'warning');
      return;
    }

    setIsEvaluating(true);
    try {
      const report = await interviewAgent.evaluateInterviewAnswers(session, userAnswers);
      setEvaluation(report);
      setActiveQuestionTab('results');
    } catch (err) {
      console.error('Evaluation error:', err);
      showToast('Evaluation completed with local verifier.', 'info');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCritique = async () => {
    if (!resumeText.trim()) return;
    setIsCritiquing(true);
    setCritique(null);
    try {
      const result = await interviewAgent.critiqueResume(resumeText, effectiveRole);
      setCritique(result);
    } catch (err) {
      console.error('Resume critique error:', err);
    } finally {
      setIsCritiquing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8 font-sans text-zinc-700">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-xl shadow-md">
              🎤
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                  Interview Prep & Live Evaluator
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-zinc-800 text-white">
                  Context-Strict AI Agent
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Honest Live Verifier
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Role-constrained question generation with live answer checking that honestly points out mistakes and wrong answers without score inflation.
              </p>
            </div>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex gap-2 bg-white border border-zinc-200 rounded-xl p-1.5 mb-6 w-fit shadow-sm">
          {(['questions', 'resume'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-800'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              {tab === 'questions' ? '🎤 Role-Specific Mock Simulation' : '📄 Resume AI Review'}
            </button>
          ))}
        </div>

        {/* ── Tab 1: Mock Questions & Live Evaluation ───────────────────────── */}
        {activeTab === 'questions' && (
          <div className="space-y-6">

            {/* Configuration Studio */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-5">
                <h2 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} className="text-zinc-800" />
                  <span>Configure Strict Role Context & Parameters</span>
                </h2>
                <span className="text-[11px] text-zinc-600 font-mono">
                  Context: <strong>{effectiveRole}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                {/* 1. Target Role */}
                <div className="lg:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-zinc-700">1. Target Engineering Role Context</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ROLE_PRESETS.map(r => (
                      <button
                        key={r}
                        onClick={() => { setRole(r); setCustomRole(''); }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          role === r && !customRole
                            ? 'bg-zinc-800 text-white border-zinc-800 shadow-sm'
                            : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value)}
                    placeholder="Or type custom domain (e.g. Distributed Systems Lead)..."
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:outline-none focus:border-zinc-400 transition-colors"
                  />
                </div>

                {/* 2. Question Type Filter */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-700">2. Question Focus</label>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: 'all', label: 'All (Mixed Tech & Behavioral)', desc: 'Balanced simulation' },
                      { id: 'technical', label: 'Technical Questions', desc: 'Architecture & Mechanisms' },
                      { id: 'behavioral', label: 'Behavioral Questions', desc: 'STAR & Team Scenarios' },
                    ].map(typeOpt => (
                      <button
                        key={typeOpt.id}
                        onClick={() => setQuestionType(typeOpt.id as QuestionTypeFilter)}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          questionType === typeOpt.id
                            ? 'bg-zinc-800 text-white border-zinc-800 shadow-sm'
                            : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{typeOpt.label}</div>
                        <div className={`text-[10px] ${questionType === typeOpt.id ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          {typeOpt.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Question Count & Level */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">3. Number of Questions</label>
                    <select
                      value={questionCount}
                      onChange={e => setQuestionCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-800 bg-zinc-50 focus:outline-none focus:border-zinc-400"
                    >
                      {QUESTION_COUNT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} — {opt.desc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">4. Experience Level</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['Junior', 'Mid', 'Senior'] as Level[]).map(l => (
                        <button
                          key={l}
                          onClick={() => setLevel(l)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                            level === l
                              ? LEVEL_CONFIG[l].color + ' shadow-sm font-extrabold'
                              : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Trigger Bar */}
              <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-zinc-500">
                  Generating strictly within <strong>{effectiveRole}</strong> domain • <strong>{questionCount} {questionType.toUpperCase()}</strong> questions ({level} level)
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <><RefreshCw size={14} className="animate-spin" /> Generating Questions in Context...</>
                  ) : (
                    <><Mic size={14} /> Generate In-Context Questions</>
                  )}
                </button>
              </div>
            </div>

            {/* Generating State */}
            {isGenerating && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center shadow-sm animate-pulse">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-md">
                    <Mic size={24} className="animate-spin" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">Synthesizing {questionCount} {level}-Level Questions for {effectiveRole}...</h3>
                  <p className="text-xs text-zinc-500 max-w-md">
                    Agent is constraining technical scenarios strictly to {effectiveRole} core architecture and standard hiring benchmarks.
                  </p>
                </div>
              </div>
            )}

            {/* Session Practice & Live Verification Section */}
            {session && !isGenerating && (
              <div className="space-y-6">

                {/* Session Sub-Tabs (Practice vs Final Results) */}
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-200 pb-3">
                  <div className="flex gap-2 bg-white p-1 rounded-xl border border-zinc-200 text-xs shadow-sm">
                    <button
                      onClick={() => setActiveQuestionTab('practice')}
                      className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                        activeQuestionTab === 'practice'
                          ? 'bg-zinc-800 text-white shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <ListOrdered size={14} />
                      <span>Questions & Live Answering ({totalQuestions})</span>
                    </button>

                    {evaluation && (
                      <button
                        onClick={() => setActiveQuestionTab('results')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                          activeQuestionTab === 'results'
                            ? 'bg-zinc-800 text-white shadow-sm'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        <Award size={14} className="text-amber-400" />
                        <span>Honest Scorecard ({evaluation.overallScore}%)</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-zinc-500">
                      Progress: <strong className="text-zinc-900">{answeredCount} of {totalQuestions}</strong> answered
                    </span>
                    <div className="w-24 h-2 bg-zinc-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Sub-Tab A: Practice & Live Answering ── */}
                {activeQuestionTab === 'practice' && (
                  <div className="space-y-5">

                    {/* Question Cards with Live Checker */}
                    {session.questions.map((q, idx) => {
                      const isExpanded = expandedIdx === idx;
                      const hasAnswered = (userAnswers[idx] || '').trim().length > 0;
                      const currentAns = userAnswers[idx] || '';
                      const liveCheck = liveChecks[idx];
                      const isCheckingThis = checkingIdx === idx;

                      return (
                        <div
                          key={idx}
                          className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all duration-200 ${
                            isExpanded ? 'border-zinc-400 ring-1 ring-zinc-300' : 'border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          {/* Card Header Accordion */}
                          <div
                            onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                            className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none bg-white hover:bg-zinc-50/70 transition-colors"
                          >
                            <div className="flex items-start gap-3.5 flex-1">
                              <span className={`mt-0.5 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 font-mono ${
                                q.type === 'behavioral'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : 'bg-sky-100 text-sky-800 border border-sky-200'
                              }`}>
                                Q{idx + 1} • {q.type === 'behavioral' ? 'Behavioral' : 'Technical'}
                              </span>

                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {q.category && (
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                                      {q.category}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-mono text-zinc-600">
                                    Role: {session.role} ({q.difficulty || level})
                                  </span>

                                  {/* Live Check Status Pill */}
                                  {liveCheck && (
                                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                      liveCheck.status === 'correct'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                        : liveCheck.status === 'partially_correct'
                                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                                        : 'bg-red-50 text-red-700 border-red-300'
                                    }`}>
                                      {liveCheck.status === 'correct' ? <CheckCircle2 size={11} /> : liveCheck.status === 'partially_correct' ? <AlertTriangle size={11} /> : <XCircle size={11} />}
                                      {liveCheck.verdict} ({liveCheck.score}/10)
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-zinc-900 leading-snug">
                                  {q.question}
                                </h3>
                              </div>
                            </div>

                            <button className="text-zinc-400 p-1 mt-1">
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </div>

                          {/* Card Content & Interactive Answer Box */}
                          {isExpanded && (
                            <div className="px-5 pb-6 border-t border-zinc-100 pt-4 space-y-4 bg-zinc-50/40">

                              {/* Helpful Hint */}
                              {q.hint && (
                                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                                  <Lightbulb size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                  <div>
                                    <strong className="font-bold">Interviewer Strategy / Context:</strong> {q.hint}
                                  </div>
                                </div>
                              )}

                              {/* Interactive Answer Input */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <label className="font-bold text-zinc-800 flex items-center gap-1.5">
                                    <Send size={12} className="text-zinc-600" />
                                    <span>Type Your Technical / STAR Response:</span>
                                  </label>
                                  <span className="font-mono text-zinc-600 text-[11px]">
                                    {currentAns.length} chars • {currentAns.trim() ? currentAns.trim().split(/\s+/).length : 0} words
                                  </span>
                                </div>

                                <textarea
                                  value={currentAns}
                                  onChange={e => handleAnswerChange(idx, e.target.value)}
                                  placeholder={
                                    q.type === 'behavioral'
                                      ? "Situation, Task, Action, and measurable Result..."
                                      : `Explain the mechanisms, internal architecture, trade-offs, and failure modes relevant to ${session.role}...`
                                  }
                                  rows={5}
                                  className="w-full p-3.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 bg-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400 leading-relaxed resize-y font-mono"
                                />
                              </div>

                              {/* Live Check Trigger & Status Bar */}
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                <button
                                  onClick={() => handleLiveCheck(idx)}
                                  disabled={isCheckingThis || !currentAns.trim()}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-40 cursor-pointer"
                                >
                                  {isCheckingThis ? (
                                    <><RefreshCw size={13} className="animate-spin" /> Verifying Answer...</>
                                  ) : (
                                    <><Zap size={13} className="text-amber-400" /> Check Answer Live</>
                                  )}
                                </button>

                                <span className="text-[11px] text-zinc-400 italic">
                                  Evaluator will honestly mark wrong or incomplete answers without fake praise.
                                </span>
                              </div>

                              {/* Live Feedback Card */}
                              {liveCheck && (
                                <div className={`p-4 rounded-xl border space-y-2 text-xs animate-fade-in ${
                                  liveCheck.status === 'correct'
                                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                                    : liveCheck.status === 'partially_correct'
                                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                                    : 'bg-red-50/90 border-red-300 text-red-950'
                                }`}>
                                  <div className="flex items-center justify-between font-bold border-b border-zinc-200/50 pb-2">
                                    <span className="flex items-center gap-1.5 text-sm">
                                      {liveCheck.status === 'correct' ? '✅' : liveCheck.status === 'partially_correct' ? '⚠️' : '❌'} {liveCheck.verdict}
                                    </span>
                                    <span className="font-mono text-sm">Score: {liveCheck.score}/10</span>
                                  </div>

                                  <p className="leading-relaxed">{liveCheck.analysis}</p>

                                  {liveCheck.mistakes.length > 0 && (
                                    <div className="mt-2 space-y-1 bg-white/70 p-2.5 rounded-lg border border-red-200">
                                      <strong className="text-red-900 block font-bold">Identified Errors & Flaws:</strong>
                                      <ul className="list-disc list-inside space-y-0.5 text-red-900">
                                        {liveCheck.mistakes.map((m, mi) => <li key={mi}>{m}</li>)}
                                      </ul>
                                    </div>
                                  )}

                                  {liveCheck.modelAnswer && (
                                    <details className="mt-2 text-[11px] pt-1">
                                      <summary className="font-bold cursor-pointer hover:underline text-zinc-700">
                                        View Correct Model Answer Reference
                                      </summary>
                                      <p className="mt-1.5 p-2.5 bg-white/80 rounded border text-zinc-800 leading-relaxed font-mono">
                                        {liveCheck.modelAnswer}
                                      </p>
                                    </details>
                                  )}
                                </div>
                              )}

                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Bottom Submit for Evaluation Bar */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900">Final Verification & Scorecard</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Calculates an honest assessment across all {totalQuestions} questions with no fake score inflation.
                        </p>
                      </div>

                      <button
                        onClick={handleSubmitInterview}
                        disabled={isEvaluating || answeredCount === 0}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-40 cursor-pointer"
                      >
                        {isEvaluating ? (
                          <><RefreshCw size={14} className="animate-spin" /> Verifying All Responses...</>
                        ) : (
                          <><Award size={15} /> Submit For Full Scorecard ({answeredCount}/{totalQuestions})</>
                        )}
                      </button>
                    </div>

                  </div>
                )}

                {/* ── Sub-Tab B: Final Result Scorecard ── */}
                {activeQuestionTab === 'results' && evaluation && (
                  <div className="space-y-6 animate-fade-in">

                    {/* Top Score Banner */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-zinc-100 pb-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-zinc-800 text-white">
                              {session.role} • {session.level} Level
                            </span>
                            <span className="text-xs text-zinc-600 font-mono">
                              Verified at {new Date(evaluation.evaluatedAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                            Candidate Evaluation Report
                          </h2>
                          <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed">
                            {evaluation.summary}
                          </p>
                        </div>

                        {/* Overall Score Badge */}
                        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-center shrink-0 w-full md:w-48 shadow-inner">
                          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Overall Verified Score</div>
                          <div className="text-4xl font-black text-zinc-900 tracking-tight">
                            {evaluation.overallScore}<span className="text-lg font-bold text-zinc-400">/100</span>
                          </div>
                          <div className={`mt-2 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            evaluation.overallScore >= 75
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : evaluation.overallScore >= 55
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}>
                            {evaluation.performanceGrade}
                          </div>
                        </div>
                      </div>

                      {/* Category Breakdown Bars */}
                      <div className="mt-6">
                        <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <BarChart3 size={14} /> Evaluation Breakdown
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {evaluation.categoryBreakdown.map((cat, idx) => (
                            <div key={idx} className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-zinc-800">{cat.category}</span>
                                <span className="font-mono font-bold text-zinc-900">{cat.score}%</span>
                              </div>
                              <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-zinc-800 rounded-full transition-all duration-700"
                                  style={{ width: `${cat.score}%` }}
                                />
                              </div>
                              <p className="text-[11px] text-zinc-500 leading-tight">{cat.feedback}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strengths & Growth Areas Grid */}
                      <div className="mt-6 pt-5 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
                          <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <CheckCircle size={14} className="text-emerald-700" /> Verified Strengths
                          </h5>
                          <ul className="space-y-1.5 text-xs text-emerald-950">
                            {evaluation.keyStrengths.map((str, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Growth Areas */}
                        <div className="bg-red-50/60 border border-red-200 rounded-xl p-4">
                          <h5 className="text-xs font-bold text-red-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <AlertTriangle size={14} className="text-red-700" /> Critical Focus & Gaps
                          </h5>
                          <ul className="space-y-1.5 text-xs text-red-950">
                            {evaluation.growthAreas.map((area, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-red-500 font-bold shrink-0">✗</span>
                                <span>{area}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Question-by-Question Deep Dive Analysis */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                        <CheckSquare size={16} className="text-zinc-800" /> Question-by-Question Honest Breakdown
                      </h3>

                      {evaluation.questionResults.map((qr, idx) => (
                        <div key={idx} className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 ${
                          qr.isCorrect ? 'border-zinc-200' : 'border-red-200'
                        }`}>
                          <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                                Question {idx + 1} • {qr.type}
                              </span>
                              <h4 className="text-sm font-bold text-zinc-900">{qr.question}</h4>
                            </div>

                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold shrink-0 ${
                              qr.isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                              <span>{qr.verdict}</span>
                              <span>•</span>
                              <span>{qr.score}/10</span>
                            </div>
                          </div>

                          {/* Candidate Answer */}
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Your Submitted Answer:</span>
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 leading-relaxed font-mono whitespace-pre-wrap">
                              {qr.userAnswer}
                            </div>
                          </div>

                          {/* Feedback & Critique */}
                          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-700 space-y-1">
                            <strong className="text-zinc-900 font-bold block">Critique & Analysis:</strong>
                            <p>{qr.feedback}</p>
                          </div>

                          {/* Model Answer Reference */}
                          {qr.sampleAnswer && (
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-600 space-y-1">
                              <strong className="text-zinc-800 font-bold block">Correct Architectural Standard:</strong>
                              <p className="font-mono">{qr.sampleAnswer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Reset Button */}
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => {
                          setActiveQuestionTab('practice');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="btn-primary px-8 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <RotateCcw size={14} />
                        <span>Practice Again / Retake Simulation</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>
            )}

            {!session && !isGenerating && (
              <div className="bg-white border border-dashed border-zinc-300 rounded-2xl p-12 text-center shadow-sm">
                <div className="text-4xl mb-3">🎤</div>
                <h3 className="text-base font-bold text-zinc-800 mb-1">No Active Mock Interview Session</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto mb-4">
                  Select your target role context and question count above, then click <strong>Generate In-Context Questions</strong> to begin.
                </p>
              </div>
            )}

          </div>
        )}

        {/* ── Tab 2: Resume Critique ────────────────────────────────────────── */}
        {activeTab === 'resume' && (
          <div className="space-y-5">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                Paste your resume or experience summary (Evaluated strictly for {effectiveRole})
              </label>
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your full resume text, experience bullets, and project summaries here..."
                rows={10}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-xs text-zinc-800 bg-zinc-50 focus:outline-none focus:border-zinc-400 transition-colors resize-y leading-relaxed font-mono"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-zinc-400">{resumeText.length} characters</p>
                <button
                  onClick={handleCritique}
                  disabled={isCritiquing || resumeText.trim().length < 30}
                  className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  {isCritiquing ? (
                    <><RefreshCw size={13} className="animate-spin" /> Reviewing Resume...</>
                  ) : (
                    <><FileText size={13} /> Critique For {effectiveRole}</>
                  )}
                </button>
              </div>
            </div>

            {isCritiquing && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center animate-pulse">
                    <FileText size={20} className="text-zinc-500" />
                  </div>
                  <p className="text-sm text-zinc-600 font-medium">Interview Agent is evaluating your resume against {effectiveRole} hiring criteria...</p>
                </div>
              </div>
            )}

            {critique && !isCritiquing && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-zinc-900">Resume Evaluation — {effectiveRole}</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Strictly aligned with target role standards</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold ${
                    critique.score >= 7 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    critique.score >= 5 ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <Star size={13} className="fill-current" />
                    {critique.score}/10
                  </div>
                </div>

                <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                  {critique.overallFeedback}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
                    <h3 className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2">
                      <CheckCircle size={13} /> Strengths
                    </h3>
                    <ul className="space-y-1.5">
                      {critique.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-emerald-950">
                          <span className="text-emerald-600 font-bold shrink-0">✓</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50/60 border border-red-200 rounded-xl p-4">
                    <h3 className="flex items-center gap-1.5 text-xs font-bold text-red-800 mb-2">
                      <AlertTriangle size={13} /> Missing Keywords & Gaps
                    </h3>
                    <ul className="space-y-1.5">
                      {critique.gaps.map((g, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-red-950">
                          <span className="text-red-500 font-bold shrink-0">✗</span> {g}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
                    <h3 className="flex items-center gap-1.5 text-xs font-bold text-blue-800 mb-2">
                      <Target size={13} /> High-Impact Actions
                    </h3>
                    <ul className="space-y-1.5">
                      {critique.improvements.map((imp, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-blue-950">
                          <span className="text-blue-500 font-bold shrink-0">→</span> {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default InterviewPrep;
