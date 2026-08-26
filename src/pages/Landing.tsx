import React from 'react';
import { Sparkles, ArrowRight, Briefcase, CalendarClock, Zap } from 'lucide-react';
import { PageId } from '../components/Layout';

interface LandingProps {
  onNavigate: (page: PageId) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  
  const features = [
    {
      title: "Workload Harmonizer",
      desc: "Integrates with MS Teams tasks and meetings. CareerOS schedules learning micro-blocks in calendar gaps without disrupting sprint velocities.",
      icon: Briefcase,
      color: "from-blue-600 to-indigo-600"
    },
    {
      title: "AI Skill Gap Optimizer",
      desc: "Define target skill proficiencies (e.g. Master Agentic AI). Our orchestrator calculates gap matrices and builds structured curriculums.",
      icon: Sparkles,
      color: "from-indigo-600 to-blue-500"
    },
    {
      title: "Dual Action Daily Planner",
      desc: "Separates company responsibilities from career growth modules, providing clarity and preventing employee burn-out.",
      icon: CalendarClock,
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "Diagnostic Quiz Assessments",
      desc: "Micro-quizzes measure understanding on foundational topics. Critiquing agents adapt roadmap speeds in real time.",
      icon: Zap,
      color: "from-emerald-600 to-teal-500"
    }
  ];

  const workflowSteps = [
    { label: "Define Objectives", desc: "Identify career targets and current metrics" },
    { label: "Skill Gap Diagnostic", desc: "Orchestrator maps missing skill indexes" },
    { label: "Personalized Roadmap", desc: "Syllabus nodes structured sequentially" },
    { label: "Balanced Daily Plan", desc: "Focus windows scheduled around meeting slots" },
    { label: "Textbook Study", desc: "Technical chapters with reference codes" },
    { label: "Graded Assessment", desc: "Micro-quizzes diagnose subject masteries" },
    { label: "Reflective Critique", desc: "timelines evaluated for deadline safety" },
    { label: "Competency Mastered", desc: "Goal completed and logged to profile" }
  ];

  return (
    <div className="py-8 flex flex-col gap-16 max-w-5xl mx-auto">
      
      {/* HERO SECTION */}
      <section className="text-center flex flex-col items-center gap-6 mt-6">
        {/* Sparkle badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-brand-border text-indigo-400 text-[10px] font-bold tracking-widest uppercase animate-pulse select-none">
          <Sparkles size={11} />
          <span>Enterprise Performance Management Suite</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] font-display text-white max-w-3xl">
          Align Organizational Delivery <br />
          <span className="text-gradient-royal">
            with Career Growth.
          </span>
        </h1>
        
        <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
          CareerOS intelligently balances daily professional responsibilities with long-term skill development. Build competence systematically without falling behind on team deliverables.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full justify-center text-xs">
          <button 
            onClick={() => onNavigate('set-goal')}
            className="btn-primary py-3 px-8 text-[11px]"
          >
            <span>Configure Goal Path</span>
            <ArrowRight size={14} />
          </button>
          
          <button 
            onClick={() => onNavigate('dashboard')}
            className="btn-secondary py-3 px-8 text-[11px]"
          >
            <span>Open System Console</span>
          </button>
        </div>
      </section>

      {/* CONTINUOUS IMPROVEMENT LOOP */}
      <section className="glass-panel p-6 border border-brand-border bg-[#0d0e15]/40 w-full">
        <h3 className="text-center text-xs font-bold font-display text-slate-400 uppercase tracking-widest mb-8">
          🔄 The CareerOS Continuous Competency Lifecycle
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center relative group">
              {idx < workflowSteps.length - 1 && (
                <div className="hidden md:block absolute top-5 -right-[50%] w-full h-[1px] bg-slate-800/60 z-0" />
              )}
              
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-brand-border flex items-center justify-center font-bold text-slate-400 font-mono text-xs relative z-10 group-hover:border-indigo-500/40 group-hover:text-white transition-all shadow">
                {idx + 1}
              </div>
              
              <p className="text-xs font-semibold text-white mt-3 leading-tight">{step.label}</p>
              <p className="text-[10px] text-slate-500 mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div 
              key={idx} 
              className="glass-panel p-5 flex gap-4 text-left items-start bg-[#0d0e15]/30 border border-brand-border hover:border-slate-800 transition-all"
            >
              <div className={`p-2.5 rounded bg-gradient-to-br ${feat.color} text-white shadow-md`}>
                <Icon size={16} />
              </div>
              <div>
                <h4 className="font-display font-semibold text-white text-sm mb-1">{feat.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* VALUE COMPARISON */}
      <section className="w-full text-center">
        <h3 className="text-xl font-bold font-display text-white mb-6">Designed for Professional Retention</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="glass-panel p-5 bg-slate-900/10 border-slate-800">
            <h4 className="text-slate-400 font-bold font-display text-xs uppercase tracking-wider mb-3">Disconnected Learning</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">❌ Video platforms disjointed from real workloads.</li>
              <li className="flex items-center gap-2">❌ Training is skipped due to calendar meetings and sprint loads.</li>
              <li className="flex items-center gap-2">❌ General courses that fail to match active job deliverables.</li>
            </ul>
          </div>
          
          <div className="glass-panel p-5 bg-indigo-950/5 border-indigo-950/20">
            <h4 className="text-indigo-400 font-bold font-display text-xs uppercase tracking-wider mb-3">CareerOS Ecosystem</h4>
            <ul className="space-y-2 text-xs text-slate-350">
              <li className="flex items-center gap-2">✓ Study sessions calculated automatically in meeting gaps.</li>
              <li className="flex items-center gap-2">✓ Dynamic skills tracking mapped directly to personal roadmaps.</li>
              <li className="flex items-center gap-2">✓ Critical re-planning alerts protect timelines from slipping.</li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
};
export default Landing;
