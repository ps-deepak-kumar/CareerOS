import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PageId } from '../components/Layout';

interface LandingProps {
  onNavigate: (page: PageId) => void;
}

// Floating hero icon definition
const floatingIcons = [
  { emoji: '🎯', anim: 'animate-float-a', pos: 'top-8 left-[8%]',   size: 'text-2xl', ring: 'w-14 h-14', delay: '' },
  { emoji: '📚', anim: 'animate-float-b', pos: 'top-16 right-[10%]', size: 'text-2xl', ring: 'w-14 h-14', delay: '' },
  { emoji: '🗺️', anim: 'animate-float-c', pos: 'top-36 left-[3%]',  size: 'text-xl',  ring: 'w-11 h-11', delay: '' },
  { emoji: '📝', anim: 'animate-float-d', pos: 'top-28 right-[4%]',  size: 'text-xl',  ring: 'w-11 h-11', delay: '' },
  { emoji: '🏆', anim: 'animate-float-e', pos: 'bottom-8 left-[12%]', size: 'text-xl', ring: 'w-12 h-12', delay: '' },
  { emoji: '💡', anim: 'animate-float-b', pos: 'bottom-4 right-[8%]', size: 'text-xl', ring: 'w-12 h-12', delay: '' },
  { emoji: '⚡', anim: 'animate-float-a', pos: 'top-6 left-[32%]',   size: 'text-base', ring: 'w-9 h-9',  delay: '' },
  { emoji: '🔗', anim: 'animate-float-c', pos: 'top-4 right-[28%]',  size: 'text-base', ring: 'w-9 h-9',  delay: '' },
];

const workflowSteps = [
  { label: 'Define Objectives',   desc: 'Identify career targets and current metrics',      emoji: '🎯' },
  { label: 'Skill Gap Diagnostic',desc: 'Orchestrator maps missing skill indexes',           emoji: '🔍' },
  { label: 'Personalized Roadmap',desc: 'Syllabus nodes structured sequentially',           emoji: '🗺️' },
  { label: 'Balanced Daily Plan', desc: 'Focus windows scheduled around meeting slots',     emoji: '📅' },
  { label: 'Textbook Study',      desc: 'Technical chapters with reference codes',          emoji: '📚' },
  { label: 'Graded Assessment',   desc: 'Micro-quizzes diagnose subject masteries',         emoji: '📝' },
  { label: 'Reflective Critique', desc: 'Timelines evaluated for deadline safety',          emoji: '🔄' },
  { label: 'Competency Mastered', desc: 'Goal completed and logged to profile',             emoji: '🏆' },
];

const features = [
  {
    emoji: '⚖️',
    title: 'Workload Harmonizer',
    desc: 'Integrates with MS Teams tasks and meetings. CareerOS schedules learning micro-blocks in calendar gaps without disrupting sprint velocities.',
  },
  {
    emoji: '🤖',
    title: 'AI Skill Gap Optimizer',
    desc: 'Define target skill proficiencies. Our orchestrator calculates gap matrices and builds structured curriculums automatically.',
  },
  {
    emoji: '📅',
    title: 'Dual Action Daily Planner',
    desc: 'Separates company responsibilities from career growth modules, providing clarity and preventing employee burn-out.',
  },
  {
    emoji: '⚡',
    title: 'Diagnostic Quiz Assessments',
    desc: 'Micro-quizzes measure understanding on foundational topics. Critiquing agents adapt roadmap speeds in real time.',
  },
];

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col gap-20 pb-16" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* ── HERO SECTION ── */}
      <section className="relative text-center flex flex-col items-center gap-7 pt-10 pb-4 overflow-hidden min-h-[420px]">

        {/* Floating Background Circles (subtle) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large faint rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-zinc-200 animate-orbit" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-zinc-300/60 animate-orbit" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-zinc-300/40 animate-orbit" style={{ animationDelay: '2s' }} />
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {floatingIcons.map((icon, i) => (
            <div
              key={i}
              className={`absolute ${icon.pos} ${icon.anim} ${icon.ring} rounded-full bg-white border border-zinc-200 shadow-card flex items-center justify-center select-none`}
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <span className={icon.size}>{icon.emoji}</span>
            </div>
          ))}
        </div>

        {/* Badge */}
        <div className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 text-white text-[10px] font-bold tracking-widest uppercase shadow-lg select-none reveal-up">
          <span>✦</span>
          <span>Autonomous AI Career Learning Suite</span>
          <span>✦</span>
        </div>

        {/* Headline */}
        <h1 className="relative z-10 text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] text-zinc-900 max-w-3xl reveal-up delay-100">
          Harmonize Enterprise Delivery<br />
          <span className="relative inline-block">
            with Accelerating
            {/* Underline accent */}
            <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 300 8" preserveAspectRatio="none">
              <path d="M0 6 Q75 1 150 5 Q225 9 300 4" stroke="#09090B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            </svg>
          </span>{' '}
          <span className="border-b-4 border-zinc-900">Mastery.</span>
        </h1>

        {/* Sub */}
        <p className="relative z-10 text-zinc-500 text-sm sm:text-base max-w-xl leading-relaxed reveal-up delay-200">
          CareerOS intelligently balances daily professional responsibilities with long-term skill development. Build competence systematically without falling behind on team deliverables.
        </p>

        {/* CTAs */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 mt-2 justify-center reveal-up delay-300">
          <button
            onClick={() => onNavigate('set-goal')}
            className="btn-primary py-3.5 px-8 text-sm shadow-xl shadow-zinc-300/60"
          >
            <span>Configure Goal Path</span>
            <ArrowRight size={15} />
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="btn-secondary py-3.5 px-8 text-sm"
          >
            <span>Open System Console</span>
          </button>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 flex items-center gap-8 mt-4 reveal-up delay-400">
          {[
            { val: '10+', label: 'Courses' },
            { val: '200+', label: 'Resources' },
            { val: 'AI', label: 'Powered' },
          ].map(s => (
            <div key={s.val} className="text-center">
              <p className="text-xl font-black text-zinc-900">{s.val}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTINUOUS COMPETENCY LOOP ── */}
      <section className="w-full">
        <div className="text-center mb-8 reveal-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
            🔄 How it works
          </span>
          <h2 className="text-2xl font-black text-zinc-900">The CareerOS Competency Lifecycle</h2>
        </div>

        <div className="relative bg-white border border-zinc-200 rounded-2xl p-6 shadow-card">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[52px] left-[calc(12.5%+16px)] right-[calc(12.5%+16px)] h-px bg-zinc-200 z-0" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center text-center group reveal-up`}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="w-11 h-11 rounded-xl bg-white border-2 border-zinc-200 flex items-center justify-center text-xl relative z-10 group-hover:border-zinc-900 group-hover:scale-110 transition-all duration-200 shadow-card mb-3">
                  {step.emoji}
                </div>
                <div className="w-4 h-4 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center text-[9px] font-mono font-black text-zinc-600 mb-2 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-all duration-200">
                  {idx + 1}
                </div>
                <p className="text-xs font-bold text-zinc-900 leading-tight">{step.label}</p>
                <p className="text-[10.5px] text-zinc-400 mt-1 leading-normal">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="w-full">
        <div className="text-center mb-8 reveal-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
            🚀 Core capabilities
          </span>
          <h2 className="text-2xl font-black text-zinc-900">Everything you need to grow professionally</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className={`group bg-white border border-zinc-200 rounded-xl p-5 flex gap-4 items-start hover:border-zinc-900 hover:shadow-cardHover transition-all duration-200 cursor-default ${idx % 2 === 0 ? 'reveal-left' : 'reveal-right'}`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Emoji icon circle */}
              <div className="w-11 h-11 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-2xl shrink-0 group-hover:bg-zinc-900 group-hover:border-zinc-900 transition-all duration-200">
                <span className="group-hover:grayscale-0 grayscale transition-all">{feat.emoji}</span>
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 text-sm mb-1">{feat.title}</h4>
                <p className="text-zinc-500 text-xs leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VALUE COMPARISON ── */}
      <section className="w-full reveal-up">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-zinc-900">Designed for Professional Retention</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Without */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 reveal-left">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">😔</span>
              <h4 className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Disconnected Learning</h4>
            </div>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">❌</span>
                <span>Video platforms disjointed from real workloads.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">❌</span>
                <span>Training skipped due to calendar meetings and sprint loads.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">❌</span>
                <span>General courses that fail to match active job deliverables.</span>
              </li>
            </ul>
          </div>

          {/* With CareerOS */}
          <div className="bg-zinc-900 border border-zinc-900 rounded-xl p-6 reveal-right">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🚀</span>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">CareerOS Ecosystem</h4>
            </div>
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">✅</span>
                <span>Study sessions calculated automatically in meeting gaps.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">✅</span>
                <span>Dynamic skills tracking mapped directly to personal roadmaps.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">✅</span>
                <span>Critical re-planning alerts protect timelines from slipping.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER STRIP ── */}
      <section className="w-full reveal-scale">
        <div className="bg-zinc-900 rounded-2xl p-8 text-center flex flex-col items-center gap-5">
          <span className="text-3xl">🎓</span>
          <h2 className="text-2xl font-black text-white">Start Your Career Acceleration</h2>
          <p className="text-zinc-400 text-sm max-w-md">
            Join thousands of professionals systematically building career-defining skills while staying ahead at work.
          </p>
          <button
            onClick={() => onNavigate('set-goal')}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-zinc-900 font-bold text-sm hover:bg-zinc-100 transition-all duration-150 active:scale-95 shadow-lg"
          >
            <span>Get Started Now</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
