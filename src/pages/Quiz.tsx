import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { stateManager } from '../services/stateManager';
import { assessmentMcp, QuizQuestion } from '../services/mcp/assessmentMcp';

export const Quiz: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    assessmentMcp.create_quiz('Attention Mechanics').then(data => {
      setQuestions(data);
    });
  }, []);

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
  };

  const handleSubmit = () => {
    if (selectedOpt === null || isAnswered) return;
    
    const correct = selectedOpt === questions[currentIdx].correctIndex;
    setIsCorrect(correct);
    setIsAnswered(true);
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    const profile = stateManager.getProfile();
    profile.stats.quizzesCompleted += 1;
    stateManager.saveProfile(profile);

    stateManager.addLog({
      timestamp: new Date().toLocaleTimeString(),
      agent: 'Assessment Agent',
      action: 'complete_quiz',
      status: score >= 2 ? 'success' : 'warning',
      message: `Completed assessment run. Score: ${score}/${questions.length} (${Math.round((score / questions.length) * 100)}% accuracy).`,
      reasoning: score >= 2 
        ? 'Prerequisites verified. Active nodes open.'
        : 'Diagnostic warning triggered: Review Positional Fourier wave files.',
      tool: 'assessmentMcp.save_quiz_result()'
    });
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  if (questions.length === 0) {
    return <div className="text-center text-xs text-slate-500 py-10 italic">Initializing quiz metrics...</div>;
  }

  const currentQuestion = questions[currentIdx];
  const percentComplete = Math.round(((currentIdx) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-6">
      
      {!quizFinished ? (
        <div className="glass-panel p-6 flex flex-col gap-5 bg-[#0e0f17]/45">
          
          <div className="flex justify-between items-center border-b border-brand-border pb-3 text-xs">
            <span className="font-semibold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
              <Brain size={14} className="text-indigo-400" />
              <span>Assessment Diagnostic Test</span>
            </span>
            <span className="font-mono text-slate-500">Question {currentIdx + 1} of {questions.length}</span>
          </div>

          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${percentComplete}%` }} />
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-white leading-relaxed mt-1 select-text">
            {currentQuestion.question}
          </h3>

          <div className="flex flex-col gap-2">
            {currentQuestion.options.map((opt, oIdx) => {
              const isSelected = selectedOpt === oIdx;
              let optBorder = 'border-slate-800 bg-slate-950/40 text-slate-350 hover:border-slate-700';
              if (isSelected) optBorder = 'border-indigo-500 text-white bg-indigo-950/15';
              
              if (isAnswered) {
                if (oIdx === currentQuestion.correctIndex) {
                  optBorder = 'border-emerald-500/50 text-emerald-300 bg-emerald-950/10';
                } else if (isSelected) {
                  optBorder = 'border-red-500/50 text-red-300 bg-red-950/10';
                } else {
                  optBorder = 'border-slate-900/60 bg-slate-950/5 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleOptionSelect(oIdx)}
                  disabled={isAnswered}
                  className={`w-full text-left p-3 rounded-lg border text-xs leading-normal font-medium transition-all ${optBorder}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className={`p-4 rounded-lg border text-xs leading-relaxed flex gap-3 ${
              isCorrect ? 'bg-emerald-950/5 border-emerald-900/15' : 'bg-red-950/5 border-red-900/15'
            }`}>
              {isCorrect ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              )}
              <div className="text-left">
                <p className="font-bold text-white mb-0.5">{isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}</p>
                <p className="text-slate-400">{currentQuestion.explanation}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2 text-xs">
            {!isAnswered ? (
              <button 
                onClick={handleSubmit}
                disabled={selectedOpt === null}
                className={`btn-primary ${selectedOpt === null ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Submit Answer
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="btn-accent"
              >
                <span>{currentIdx === questions.length - 1 ? 'Finish Assessment' : 'Next Question'}</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>

        </div>
      ) : (
        /* QUIZ COMPLETE */
        <div className="glass-panel p-6 flex flex-col gap-6 text-center bg-[#0e0f17]/45">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-indigo-500/25 flex items-center justify-center mx-auto text-indigo-400 shadow-md">
            <CheckCircle2 size={20} />
          </div>
          
          <div>
            <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider">Assessment Results Compiled</h3>
            <p className="text-[11px] text-slate-550 mt-1 font-mono uppercase font-semibold">Evaluation status: Complete</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto w-full font-mono">
            <div className="bg-slate-950/30 p-3 rounded-lg border border-brand-border text-xs">
              <p className="text-[9px] text-slate-500 uppercase font-bold">Total Score</p>
              <p className="text-lg font-bold text-white mt-1">{score} / {questions.length}</p>
            </div>
            
            <div className="bg-slate-950/30 p-3 rounded-lg border border-brand-border text-xs">
              <p className="text-[9px] text-slate-500 uppercase font-bold">Accuracy</p>
              <p className="text-lg font-bold text-indigo-400 mt-1">
                {Math.round((score / questions.length) * 100)}%
              </p>
            </div>
          </div>

          <div className="text-left bg-slate-950 p-4 rounded-lg border border-slate-900 max-w-sm mx-auto w-full text-xs font-sans">
            <h4 className="font-bold text-white mb-2 font-display flex items-center gap-1.5 uppercase text-[9px] tracking-wider">
              <AlertCircle size={12} className="text-indigo-400" />
              <span>Skill Gap Diagnostic</span>
            </h4>
            
            <div className="space-y-1.5 border-b border-slate-900 pb-2 mb-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Self-Attention Equations:</span>
                <span className="font-bold text-emerald-450">92% (Pass)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Positional Encodings:</span>
                <span className="font-bold text-yellow-500">54% (Review)</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-normal italic">
              💡 **AI Tracer note**: "Slight understanding gap detected in Fourier Positional Encoding. Review chapter wave files before moving forward."
            </p>
          </div>

          <div className="flex gap-2.5 justify-center text-xs">
            <button 
              onClick={handleRestart}
              className="btn-secondary"
            >
              <RefreshCw size={11} />
              <span>Retake</span>
            </button>
            <button 
              onClick={() => window.location.hash = '#/learning'}
              className="btn-primary"
            >
              Return to Textbook
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
export default Quiz;
