import React, { useState } from 'react';
import { PageId } from '../components/Layout';
import { Sparkles, Brain, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { stateManager } from '../services/stateManager';

interface SetGoalProps {
  onNavigate: (page: PageId) => void;
}

export const SetGoal: React.FC<SetGoalProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  
  // Form values
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [deadlineDays, setDeadlineDays] = useState(60);
  const [studyTime, setStudyTime] = useState('1 hour/day');
  const [learningStyle, setLearningStyle] = useState('Mixed');

  // Loading generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMsgIdx, setGenerationMsgIdx] = useState(0);

  const generationMessages = [
    "Analyzing organizational gap parameters...",
    "Querying Career MCP to identify baseline skills...",
    "Learning Agent parsing sequence dependencies on roadmap...",
    "Curating top-starred production GitHub repositories & clone specs...",
    "Resource Agent fetching verified video project build walkthroughs...",
    "Daily Planner syncing free focus blocks with Teams exchange...",
    "Guardian verification: quality metrics & lab links validated...",
    "University-grade Masterclass & Curriculum blueprint successfully structured."
  ];

  const handleNextStep = () => {
    if (step === 1 && !title.trim()) return;
    if (step < 7) {
      setStep(step + 1);
    } else {
      triggerRoadmapGeneration();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const triggerRoadmapGeneration = async () => {
    setIsGenerating(true);
    setGenerationMsgIdx(0);

    const interval = setInterval(() => {
      setGenerationMsgIdx(prev => {
        if (prev < generationMessages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 1000);

    await stateManager.simulateGoalGeneration(
      title,
      difficulty,
      expectedOutcome,
      deadlineDays,
      studyTime,
      learningStyle,
      () => {}
    );

    clearInterval(interval);
    setIsGenerating(false);
    onNavigate('goals');
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">What competency do you want to build?</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. IBM Cloud Native, Microsoft Azure, Meta React 19, Agentic AI..."
              className="bg-zinc-100 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-900 placeholder-slate-500 focus:outline-none focus:border-zinc-300"
              required
            />
            
            {/* Quick Enterprise & FAANG Goal Presets */}
            <div className="flex flex-col gap-1.5 mt-1">
              <span className="text-[9px] text-zinc-400 font-bold uppercase font-mono">Popular Enterprise & FAANG Tracks:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'IBM Cloud Native & Microservices',
                  'Microsoft Azure Solutions Architecture',
                  'Meta React 19 Architecture',
                  'Netflix Chaos Engineering',
                  'AWS Serverless Architecture',
                  'Agentic AI & MCP Gateway'
                ].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTitle(preset)}
                    className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-[9.5px] font-mono text-zinc-500 hover:text-zinc-700 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 font-semibold font-mono uppercase">Provide a clear skill parameter or select a company track.</p>
          </div>
        );
      
      case 2:
        return (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Select current proficiency index</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`p-3.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider font-display transition-colors ${
                    difficulty === lvl 
                      ? 'border-zinc-300 text-zinc-900 bg-zinc-100' 
                      : 'border-zinc-200 text-zinc-500 hover:border-zinc-200 bg-zinc-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Define corporate outcome deliverables</label>
            <textarea
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              placeholder="e.g. Deploy production-grade LangGraph agent servers connecting Outlook MCP calendar hooks."
              rows={4}
              className="bg-zinc-100 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-900 placeholder-slate-500 focus:outline-none focus:border-zinc-300 resize-none font-sans"
            />
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Configure deadline timeline</label>
            <div className="flex items-center gap-4">
              <input 
                type="range"
                min="15"
                max="180"
                step="15"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(parseInt(e.target.value))}
                className="flex-1 accent-indigo-650 cursor-pointer h-1.5 bg-zinc-100 rounded-full"
              />
              <span className="text-xs font-bold text-zinc-900 font-mono bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-lg shrink-0">
                {deadlineDays} Days
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono leading-normal uppercase">Timelines sync with available buffer loads in Teams Planner.</p>
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Configure daily study allotment</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['30 min/day', '1 hour/day', '2 hours/day', '3+ hours/day'].map(time => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setStudyTime(time)}
                  className={`p-3 rounded-lg border text-[10px] font-bold uppercase tracking-wider font-display transition-colors ${
                    studyTime === time 
                      ? 'border-zinc-300 text-zinc-900 bg-zinc-100' 
                      : 'border-zinc-200 text-zinc-500 hover:border-zinc-200 bg-zinc-50'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Preferred pedagogy format</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {['Reading', 'Videos', 'Hands-on coding', 'Projects', 'Mixed'].map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setLearningStyle(style)}
                  className={`p-2.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider font-display transition-colors ${
                    learningStyle === style 
                      ? 'border-zinc-300 text-zinc-900 bg-zinc-100' 
                      : 'border-zinc-200 text-zinc-500 hover:border-zinc-200 bg-zinc-50'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="flex flex-col gap-4 text-center py-4 bg-zinc-50 border border-zinc-200 rounded-lg p-5">
            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center mx-auto text-zinc-700 shadow-md">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-display">Compile Skill Path Blueprint</h4>
              <p className="text-[11px] text-zinc-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Clicking compile runs dynamic tracer agents to check skill gaps and schedule calendars.
              </p>
            </div>
            <div className="text-[10px] text-zinc-500 max-w-md mx-auto space-y-1 bg-zinc-50 p-3 rounded border border-zinc-200 text-left font-mono w-full">
              <div className="flex justify-between border-b border-zinc-200 pb-1 mb-1"><span className="text-zinc-400 font-bold uppercase">Parameter</span> <span className="text-zinc-400 font-bold uppercase">Setting</span></div>
              <div className="flex justify-between"><span className="text-slate-600 font-bold">Goal Target:</span> <span className="font-bold text-zinc-700">Master {title}</span></div>
              <div className="flex justify-between"><span className="text-slate-600 font-bold">Timeline:</span> <span className="font-bold text-zinc-700">{deadlineDays} Days</span></div>
              <div className="flex justify-between"><span className="text-slate-600 font-bold">Focus hours:</span> <span className="font-bold text-zinc-700">{studyTime}</span></div>
              <div className="flex justify-between"><span className="text-slate-600 font-bold">Pedagogy:</span> <span className="font-bold text-zinc-700">{learningStyle}</span></div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      
      {/* BACK HEADER */}
      <button 
        onClick={() => onNavigate('goals')}
        className="flex items-center gap-1 text-zinc-400 hover:text-zinc-600 text-xs font-semibold mb-6 transition-colors font-display tracking-wide uppercase"
      >
        <ArrowLeft size={13} />
        <span>Return to cabinet</span>
      </button>

      {/* GENERATING LOADER SCREEN */}
      {isGenerating ? (
        <div className="glass-panel p-8 text-center flex flex-col gap-6 items-center bg-white">
          <Loader2 size={32} className="text-zinc-700 animate-spin" />
          <div>
            <h3 className="text-xs font-bold font-display uppercase tracking-widest text-zinc-900">AI Planning Systems coordinating...</h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Orchestrator routing gap schemas.
            </p>
          </div>
          
          {/* Animated log lines */}
          <div className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-4 font-mono text-[9px] text-left leading-relaxed h-32 overflow-y-auto">
            {generationMessages.slice(0, generationMsgIdx + 1).map((msg, idx) => (
              <p 
                key={idx} 
                className={`${idx === generationMsgIdx ? 'text-zinc-700' : 'text-slate-600'} flex items-start gap-1`}
              >
                <span>↳</span>
                <span>{msg}</span>
              </p>
            ))}
          </div>
        </div>
      ) : (
        /* STEPPED CONTAINER WIZARD */
        <div className="glass-panel p-6 flex flex-col gap-6 bg-zinc-100">
          <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
            <div className="flex items-center gap-2">
              <Brain size={14} className="text-zinc-700" />
              <span className="text-[10px] font-bold font-display text-zinc-900 uppercase tracking-wider">AI Goal Blueprint setup</span>
            </div>
            <span className="text-xs font-bold text-slate-550 font-mono">Step {step}/7</span>
          </div>

          <div className="py-2">
            {renderStepContent()}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-zinc-200 mt-2 text-xs">
            <button
              onClick={handlePrevStep}
              disabled={step === 1}
              className={`btn-secondary ${step === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <span>Back</span>
            </button>

            <button
              onClick={handleNextStep}
              className="btn-primary"
            >
              <span>{step === 7 ? 'Compile path' : 'Next'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
export default SetGoal;
