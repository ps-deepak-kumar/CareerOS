import React, { useState, useEffect } from 'react';
import { 
  Brain, ArrowRight, CheckCircle2, XCircle, AlertCircle, RefreshCw, 
  Sparkles, Award, Lightbulb, HelpCircle, BookOpen, Layers, Trophy, 
  ChevronDown, ChevronUp, Flame, Check, X, ShieldAlert, ArrowLeft
} from 'lucide-react';
import { stateManager } from '../services/stateManager';
import { assessmentMcp, QuizQuestion } from '../services/mcp/assessmentMcp';
import { Course } from '../data/mockData';

interface UserAnswerRecord {
  question: QuizQuestion;
  selectedIdx: number;
  isCorrect: boolean;
}

export const Quiz: React.FC = () => {
  // Screen mode: 'setup' | 'quiz' | 'results'
  const [screen, setScreen] = useState<'setup' | 'quiz' | 'results'>('setup');

  // Setup options
  const [courses, setCourses] = useState<Course[]>([]);
  const [topicSource, setTopicSource] = useState<'custom' | 'course'>('custom');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('Cloud Computing');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [allowHints, setAllowHints] = useState<boolean>(true);

  // Active quiz states
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Results state
  const [awardedBadge, setAwardedBadge] = useState<string | null>(null);
  const [showReviewList, setShowReviewList] = useState(true);

  useEffect(() => {
    const loadedCourses = stateManager.getCourses();
    setCourses(loadedCourses);
    if (loadedCourses.length > 0) {
      setSelectedCourseId(loadedCourses[0].id);
    }
  }, []);

  const popularTopics = [
    'Cloud Computing', 'Machine Learning', 'Python', 'Transformers',
    'Data Structures', 'SQL', 'Cybersecurity', 'Docker', 'Kubernetes', 'System Design'
  ];

  const handleStartQuiz = async () => {
    setIsLoading(true);
    let activeTopic = customTopic.trim() || 'Software Engineering';

    if (topicSource === 'course') {
      const found = courses.find(c => c.id === selectedCourseId);
      if (found) {
        activeTopic = found.title;
      }
    }

    try {
      const generatedQuestions = await assessmentMcp.create_quiz(activeTopic, difficulty, questionCount);
      setQuestions(generatedQuestions);
      setCurrentIdx(0);
      setSelectedOpt(null);
      setIsAnswered(false);
      setShowHint(false);
      setScore(0);
      setUserAnswers([]);
      setAwardedBadge(null);
      setScreen('quiz');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOpt === null || isAnswered || !questions[currentIdx]) return;

    const currentQ = questions[currentIdx];
    const correct = selectedOpt === currentQ.correctIndex;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore(prev => prev + 1);
    }

    setUserAnswers(prev => [
      ...prev,
      {
        question: currentQ,
        selectedIdx: selectedOpt,
        isCorrect: correct
      }
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
      setShowHint(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const finalScore = score + (isCorrect ? 0 : 0); // already updated
    const totalQ = questions.length;
    const accuracy = Math.round((finalScore / totalQ) * 100);

    // Determine and save badge
    let badgeType: 'master' | 'proficient' | 'learner' | 'retry' = 'retry';
    if (accuracy >= 90) badgeType = 'master';
    else if (accuracy >= 70) badgeType = 'proficient';
    else if (accuracy >= 50) badgeType = 'learner';

    const activeTopic = topicSource === 'course' 
      ? courses.find(c => c.id === selectedCourseId)?.title || customTopic 
      : customTopic;

    if (badgeType !== 'retry') {
      stateManager.awardQuizBadge(badgeType, activeTopic, finalScore, totalQ);
      setAwardedBadge(badgeType);
    }

    // Update profile stats
    const profile = stateManager.getProfile();
    profile.stats.quizzesCompleted = (profile.stats.quizzesCompleted || 0) + 1;
    stateManager.saveProfile(profile);

    setScreen('results');
  };

  const handleResetToSetup = () => {
    setScreen('setup');
    setQuestions([]);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setShowHint(false);
    setScore(0);
    setUserAnswers([]);
  };

  // ─── 1. SETUP SCREEN ────────────────────────────────────────────────────────
  if (screen === 'setup') {
    return (
      <div className="max-w-3xl mx-auto py-6 flex flex-col gap-6">
        
        {/* Header */}
        <div className="border-b border-zinc-200 pb-5">
          <div className="flex items-center gap-2 text-zinc-700 font-mono text-[9px] font-bold uppercase tracking-widest">
            <Brain size={14} />
            <span>Interactive Diagnostic Engine</span>
          </div>
          <h2 className="text-xl font-bold font-display text-zinc-900 mt-1">AI Test Assessments & Skill Verification</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Configure topic, question count, difficulty, and hints. Earn verifiable achievement badges based on score.
          </p>
        </div>

        {/* Configuration Card */}
        <div className="glass-panel p-6 bg-white border border-zinc-200 rounded-2xl flex flex-col gap-6">
          
          {/* Section 1: Topic Selection Source */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold font-display text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Choose Assessment Subject</span>
            </label>

            <div className="grid grid-cols-2 gap-3 p-1 bg-zinc-50 rounded-xl border border-zinc-200">
              <button
                type="button"
                onClick={() => setTopicSource('custom')}
                className={`py-2 px-3 rounded-lg text-xs font-bold font-display transition-all ${
                  topicSource === 'custom'
                    ? 'bg-zinc-900 text-white shadow-md'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                ✍️ Write Topic / Subject
              </button>
              <button
                type="button"
                onClick={() => setTopicSource('course')}
                className={`py-2 px-3 rounded-lg text-xs font-bold font-display transition-all ${
                  topicSource === 'course'
                    ? 'bg-zinc-900 text-white shadow-md'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                📚 Select from Enrolled Courses
              </button>
            </div>

            {/* Custom topic input or Course dropdown */}
            {topicSource === 'custom' ? (
              <div className="flex flex-col gap-2 mt-1">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Enter topic name (e.g. Cloud Computing, Python, Transformers, SQL...)"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-slate-600 focus:outline-none focus:border-zinc-300 transition-colors"
                />

                {/* Popular Topic Pills */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-550 mr-1 self-center">Popular:</span>
                  {popularTopics.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCustomTopic(t)}
                      className={`px-2.5 py-1 text-[9px] font-mono rounded-lg border transition-all ${
                        customTopic.toLowerCase() === t.toLowerCase()
                          ? 'bg-zinc-100 border-zinc-300 text-zinc-700 font-bold'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-1">
                {courses.length > 0 ? (
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-700 font-semibold focus:outline-none focus:border-zinc-300"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title} • ({c.difficulty} Track, {c.progress}% completed)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-400 text-xs text-center">
                    No active courses found. Please create a goal or write a custom topic above.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Number of Questions & Difficulty Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-zinc-200 pt-5">
            
            {/* Question count */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold font-display text-zinc-900 uppercase tracking-wider">
                2. Number of Questions
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all text-center ${
                      questionCount === count
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    {count} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold font-display text-zinc-900 uppercase tracking-wider">
                3. Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Easy', 'Medium', 'Hard'] as const).map(level => {
                  const isSelected = difficulty === level;
                  const activeColor = 
                    level === 'Easy' ? 'bg-zinc-900 border-zinc-900 text-white' :
                    level === 'Medium' ? 'bg-zinc-900 border-zinc-900 text-white' :
                    'bg-zinc-900 border-zinc-900 text-white';

                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`py-2 text-xs font-display font-bold rounded-xl border transition-all text-center ${
                        isSelected
                          ? activeColor
                          : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-200'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Section 3: Hints toggle & Rewards Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-zinc-200 pt-5 items-center">
            
            {/* Hints Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-amber-500/30 flex items-center justify-center text-zinc-600">
                  <Lightbulb size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Enable AI Hints</p>
                  <p className="text-[10px] text-zinc-400">Provide guidance during questions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllowHints(!allowHints)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  allowHints ? 'bg-zinc-900' : 'bg-slate-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  allowHints ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Reward badges preview pill */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-950/15 via-zinc-100/15 to-transparent rounded-xl border border-amber-900/25 text-xs">
              <Trophy size={16} className="text-zinc-600 shrink-0" />
              <div>
                <p className="text-[10.5px] font-bold text-zinc-600">Earn Verifiable Badges</p>
                <p className="text-[9.5px] text-zinc-500">🥇 Gold (90%+) • 🥈 Silver (70%+) • 🥉 Bronze (50%+)</p>
              </div>
            </div>

          </div>

          {/* CTA Start Button */}
          <button
            type="button"
            onClick={handleStartQuiz}
            disabled={isLoading || (topicSource === 'custom' && !customTopic.trim())}
            className="btn-primary py-3 text-sm font-bold font-display uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-zinc-200 transition-all rounded-xl"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Compiling AI Assessment Questions...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Start Assessment ({questionCount} Questions)</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>

        </div>

      </div>
    );
  }

  // ─── 2. ACTIVE QUIZ SCREEN ──────────────────────────────────────────────────
  if (screen === 'quiz' && questions.length > 0) {
    const currentQ = questions[currentIdx];
    const percentComplete = Math.round(((currentIdx + 1) / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto py-6 flex flex-col gap-5">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleResetToSetup}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Exit Assessment</span>
          </button>
          
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bg-zinc-100 text-zinc-700 border border-zinc-300 px-2.5 py-0.5 rounded-md font-bold uppercase text-[9.5px]">
              {currentQ.topic || customTopic}
            </span>
            <span className="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-md text-[9.5px] uppercase font-bold">
              {difficulty}
            </span>
          </div>
        </div>

        {/* Main Quiz Box */}
        <div className="glass-panel p-6 flex flex-col gap-5 bg-zinc-100 border border-zinc-200 rounded-2xl relative overflow-hidden">
          
          {/* Header row with progress */}
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-900 uppercase tracking-wider font-display flex items-center gap-1.5">
              <Brain size={15} className="text-zinc-700" />
              <span>Assessment Diagnostic Test</span>
            </span>
            <span className="font-mono font-bold text-zinc-500">
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-zinc-50 rounded-full overflow-hidden border border-zinc-200">
            <div 
              className="h-full bg-gradient-to-r from-zinc-800 to-zinc-900 transition-all duration-300 rounded-full" 
              style={{ width: `${percentComplete}%` }} 
            />
          </div>

          {/* Question text */}
          <h3 className="text-sm sm:text-base font-bold text-zinc-900 leading-relaxed mt-1 select-text">
            {currentQ.question}
          </h3>

          {/* Hint Drawer */}
          {allowHints && currentQ.hint && (
            <div className="flex flex-col gap-1.5">
              {!showHint ? (
                <button
                  onClick={() => setShowHint(true)}
                  className="self-start text-[10px] font-mono text-zinc-600/90 hover:text-zinc-600 flex items-center gap-1 bg-zinc-100 border border-amber-900/30 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Lightbulb size={11} />
                  <span>Reveal AI Guidance Hint</span>
                </button>
              ) : (
                <div className="bg-zinc-100 border border-amber-900/30 p-3 rounded-xl text-xs text-zinc-600/90 flex gap-2 animate-fade-in">
                  <Lightbulb size={14} className="text-zinc-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <span className="font-bold">Hint: </span>
                    {currentQ.hint}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Options list */}
          <div className="flex flex-col gap-2.5">
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = selectedOpt === oIdx;
              let optStyle = 'border-zinc-200 bg-zinc-100 text-zinc-600 hover:border-zinc-200';

              if (isSelected) {
                optStyle = 'border-zinc-300 text-zinc-900 bg-zinc-100 shadow-[0_0_12px_rgba(99,102,241,0.2)] font-semibold';
              }

              if (isAnswered) {
                if (oIdx === currentQ.correctIndex) {
                  optStyle = 'border-emerald-500/80 text-zinc-600 bg-zinc-100 font-bold';
                } else if (isSelected) {
                  optStyle = 'border-red-500/80 text-red-200 bg-red-950/30';
                } else {
                  optStyle = 'border-zinc-200 bg-zinc-100 text-slate-600 opacity-50';
                }
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleOptionSelect(oIdx)}
                  disabled={isAnswered}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs leading-normal transition-all flex items-start gap-3 ${optStyle}`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-mono font-bold ${
                    isSelected ? 'border-zinc-300 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-400'
                  }`}>
                    {String.fromCharCode(65 + oIdx)}
                  </div>
                  <span className="flex-1">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Answer Feedback Banner */}
          {isAnswered && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed flex gap-3 animate-fade-in ${
              isCorrect 
                ? 'bg-zinc-100 border-emerald-900/30 text-zinc-600' 
                : 'bg-red-950/20 border-red-900/30 text-red-200'
            }`}>
              {isCorrect ? (
                <CheckCircle2 size={18} className="text-zinc-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="text-left flex-1">
                <p className="font-bold text-zinc-900 text-xs mb-1">
                  {isCorrect ? '✅ Correct Answer!' : '❌ Incorrect Answer'}
                </p>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end pt-2 text-xs">
            {!isAnswered ? (
              <button 
                onClick={handleSubmitAnswer}
                disabled={selectedOpt === null}
                className={`btn-primary py-2 px-5 font-bold font-display uppercase tracking-wider ${
                  selectedOpt === null ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button 
                onClick={handleNextQuestion}
                className="btn-accent py-2 px-5 font-bold font-display uppercase tracking-wider flex items-center gap-1.5"
              >
                <span>{currentIdx === questions.length - 1 ? 'View Final Results' : 'Next Question'}</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

        </div>

      </div>
    );
  }

  // ─── 3. RESULTS & BADGES SCREEN ─────────────────────────────────────────────
  if (screen === 'results') {
    const totalQ = questions.length;
    const accuracy = Math.round((score / totalQ) * 100);
    const incorrectCount = totalQ - score;

    return (
      <div className="max-w-3xl mx-auto py-6 flex flex-col gap-6">
        
        {/* Results Header Panel */}
        <div className="glass-panel p-6 flex flex-col gap-6 text-center bg-white border border-zinc-200 rounded-2xl">
          
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-100/40 to-zinc-100 border border-zinc-300 flex items-center justify-center mx-auto text-zinc-700 shadow-lg">
            {accuracy >= 70 ? <Trophy size={26} className="text-zinc-600" /> : <CheckCircle2 size={26} className="text-zinc-700" />}
          </div>
          
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-zinc-900 uppercase tracking-wider">
              Assessment Evaluation Complete
            </h2>
            <p className="text-xs text-zinc-500 mt-1 font-mono">
              Diagnostic subject: <span className="text-zinc-700 font-bold">{customTopic}</span> ({difficulty} Level)
            </p>
          </div>

          {/* Key Score Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono max-w-xl mx-auto w-full">
            <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
              <p className="text-[9px] text-zinc-400 uppercase font-bold">Total Score</p>
              <p className="text-lg font-bold text-zinc-900 mt-1">{score} / {totalQ}</p>
            </div>
            
            <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
              <p className="text-[9px] text-zinc-400 uppercase font-bold">Accuracy</p>
              <p className={`text-lg font-bold mt-1 ${accuracy >= 70 ? 'text-zinc-600' : accuracy >= 50 ? 'text-zinc-600' : 'text-red-400'}`}>
                {accuracy}%
              </p>
            </div>

            <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
              <p className="text-[9px] text-zinc-400 uppercase font-bold">Correct</p>
              <p className="text-lg font-bold text-zinc-600 mt-1">+{score}</p>
            </div>

            <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
              <p className="text-[9px] text-zinc-400 uppercase font-bold">Incorrect</p>
              <p className="text-lg font-bold text-red-400 mt-1">-{incorrectCount}</p>
            </div>
          </div>

          {/* Badge Unlocked Banner */}
          {awardedBadge && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 via-zinc-100/20 to-amber-950/30 border border-amber-500/40 max-w-lg mx-auto w-full flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="text-3xl">
                  {awardedBadge === 'master' ? '🥇' : awardedBadge === 'proficient' ? '🥈' : '🥉'}
                </div>
                <div>
                  <span className="text-[8.5px] font-mono font-bold uppercase tracking-widest text-zinc-600">Credential Unlocked & Saved</span>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900">
                    {awardedBadge === 'master' ? 'Assessment Grandmaster Badge' : awardedBadge === 'proficient' ? 'Assessment Specialist Badge' : 'Assessment Achiever Badge'}
                  </h4>
                  <p className="text-[10px] text-zinc-500">Permanently unlocked in your Competency Milestones / Achievements.</p>
                </div>
              </div>
            </div>
          )}

          {/* Skill Diagnostic Feedback */}
          <div className="text-left bg-zinc-50 p-4 rounded-xl border border-zinc-200 max-w-lg mx-auto w-full text-xs">
            <h4 className="font-bold text-zinc-900 mb-2 font-display flex items-center gap-1.5 uppercase text-[9.5px] tracking-wider text-zinc-700">
              <AlertCircle size={13} />
              <span>AI Skill Gap Diagnostic</span>
            </h4>
            
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              {accuracy >= 90 ? (
                <span>🎉 Excellent mastery! You demonstrated high proficiency in core concepts and edge cases. Ready to tackle advanced capstone labs.</span>
              ) : accuracy >= 70 ? (
                <span>👍 Solid performance! You understand the foundational mechanics well. Review the specific missed questions below to cement 100% mastery.</span>
              ) : (
                <span>💡 Diagnostic recommendation: Review textbook syllabus chapters and analogy breakdowns before attempting higher-difficulty assessments.</span>
              )}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-3 justify-center text-xs">
            <button 
              onClick={handleResetToSetup}
              className="btn-secondary py-2.5 px-4 flex items-center gap-1.5 font-bold font-display uppercase tracking-wider"
            >
              <RefreshCw size={13} />
              <span>Configure New Quiz</span>
            </button>
            <button 
              onClick={() => window.location.hash = '#/learning'}
              className="btn-primary py-2.5 px-4 flex items-center gap-1.5 font-bold font-display uppercase tracking-wider"
            >
              <BookOpen size={13} />
              <span>Return to Textbook</span>
            </button>
            <button 
              onClick={() => window.location.hash = '#/achievements'}
              className="btn-secondary py-2.5 px-4 flex items-center gap-1.5 font-bold font-display uppercase tracking-wider text-zinc-600 border-amber-900/30"
            >
              <Award size={13} />
              <span>View Badges</span>
            </button>
          </div>

        </div>

        {/* Detailed Question-by-Question Review List */}
        <div className="glass-panel p-6 bg-white border border-zinc-200 rounded-2xl flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
            <h3 className="text-xs sm:text-sm font-bold font-display text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <span>Detailed Assessment Breakdown</span>
              <span className="text-[10px] font-mono text-zinc-400">({userAnswers.length} Questions Reviewed)</span>
            </h3>
            <button
              onClick={() => setShowReviewList(!showReviewList)}
              className="text-zinc-500 hover:text-zinc-900 text-xs flex items-center gap-1"
            >
              <span>{showReviewList ? 'Collapse' : 'Expand'}</span>
              {showReviewList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {showReviewList && (
            <div className="flex flex-col gap-4">
              {userAnswers.map((record, qIdx) => (
                <div 
                  key={qIdx}
                  className={`p-4 rounded-xl border flex flex-col gap-3 text-xs ${
                    record.isCorrect 
                      ? 'bg-zinc-100 border-emerald-900/25' 
                      : 'bg-red-950/10 border-red-900/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-[10px] font-bold text-zinc-400 shrink-0 mt-0.5">
                        Q{qIdx + 1}.
                      </span>
                      <p className="font-bold text-zinc-900 leading-snug">
                        {record.question.question}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {record.isCorrect ? (
                        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-zinc-600 bg-zinc-100 border border-emerald-800/40 px-2 py-0.5 rounded">
                          <Check size={11} /> Correct (+1)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-red-400 bg-red-950/40 border border-red-800/40 px-2 py-0.5 rounded">
                          <X size={11} /> Incorrect (0)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options with indicator */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    {record.question.options.map((opt, oIdx) => {
                      const isUserSelection = record.selectedIdx === oIdx;
                      const isCorrectAns = record.question.correctIndex === oIdx;

                      let optColor = 'text-zinc-500 bg-zinc-100 border-zinc-200';
                      if (isCorrectAns) {
                        optColor = 'text-zinc-600 bg-zinc-100 border-emerald-700/40 font-bold';
                      } else if (isUserSelection && !record.isCorrect) {
                        optColor = 'text-red-300 bg-red-950/30 border-red-700/40 line-through';
                      }

                      return (
                        <div key={oIdx} className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${optColor}`}>
                          <span className="truncate">{String.fromCharCode(65 + oIdx)}. {opt}</span>
                          {isCorrectAns && <Check size={12} className="text-zinc-600 shrink-0" />}
                          {isUserSelection && !record.isCorrect && <X size={12} className="text-red-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="bg-zinc-100 p-2.5 rounded-lg border border-zinc-200 text-[10.5px] text-zinc-600 leading-relaxed">
                    <span className="font-bold text-zinc-700">Explanation: </span>
                    {record.question.explanation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    );
  }

  return null;
};

export default Quiz;

