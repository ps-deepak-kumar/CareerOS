import React, { useState } from 'react';
import { Settings, Cpu, Database, Bell, RefreshCw, Sparkles, Server } from 'lucide-react';
import { stateManager } from '../services/stateManager';

export const SettingsPage: React.FC = () => {
  const [modelMode, setModelMode] = useState<'hybrid' | 'local' | 'cloud'>('hybrid');
  const [notifySetting, setNotifySetting] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = () => {
    setIsResetting(true);
    setTimeout(() => {
      localStorage.clear();
      setIsResetting(false);
      window.location.reload(); // Refresh to reload default data
    }, 1200);
  };

  const activeMcps = [
    { name: 'MICROSOFT 365 MCP', status: 'Active', tools: 'get_teams_tasks(), get_meetings(), search_teams_messages()' },
    { name: 'CAREER MCP', status: 'Active', tools: 'create_goal(), get_goals(), get_user_skills(), save_skill_gap()' },
    { name: 'LEARNING MCP', status: 'Active', tools: 'get_topics(), get_prerequisites(), save_roadmap()' },
    { name: 'RESOURCE MCP', status: 'Active', tools: 'search_youtube(), search_courses(), search_books()' },
    { name: 'ASSESSMENT MCP', status: 'Active', tools: 'create_quiz(), evaluate_answer(), save_quiz_result()' },
    { name: 'PRODUCTIVITY MCP', status: 'Active', tools: 'get_available_time(), create_schedule()' }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* 1. TOP HEADER */}
      <div>
        <h2 className="text-2xl font-bold font-display text-white">⚙️ Platform Configurations</h2>
        <p className="text-xs text-slate-400 mt-0.5 font-display">Configure multi-agent parameters, model router modes, and connected MCP servers.</p>
      </div>

      {/* 2. DOCKING CONTROL PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PANEL A: MODEL ROUTER SETUP */}
        <div className="glass-panel p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold font-display text-white border-b border-brand-border pb-2.5 flex items-center gap-1.5 uppercase">
            <Cpu size={15} className="text-violet-400" />
            <span>AI Model Router Setup</span>
          </h3>

          <div className="flex flex-col gap-3 text-xs">
            <label className="text-slate-400">Router Strategy Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'hybrid', label: 'Hybrid AI' },
                { id: 'local', label: 'Ollama Only' },
                { id: 'cloud', label: 'OpenRouter' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setModelMode(mode.id as any)}
                  className={`py-2 text-[10px] font-bold font-display uppercase tracking-wider rounded border transition-colors ${
                    modelMode === mode.id 
                      ? 'border-violet-500 text-white bg-violet-950/20' 
                      : 'border-slate-800 text-slate-400 hover:border-slate-700 bg-slate-900/20'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 leading-normal mt-1 italic">
              * Hybrid AI automatically delegates routine classifications to local models (Ollama Llama3) and complex reasoning to cloud models (Claude 3.5 Sonnet via OpenRouter).
            </p>
          </div>
        </div>

        {/* PANEL B: INTEGRATIONS AND SYSTEM */}
        <div className="glass-panel p-5 flex flex-col gap-4 justify-between">
          <div>
            <h3 className="text-sm font-bold font-display text-white border-b border-brand-border pb-2.5 flex items-center gap-1.5 uppercase">
              <Bell size={15} className="text-cyan-400" />
              <span>Platform Notification Controls</span>
            </h3>

            <div className="flex items-center justify-between text-xs mt-3">
              <span className="text-slate-300">Enable Agent feedback updates</span>
              <button 
                onClick={() => setNotifySetting(!notifySetting)}
                className={`w-10 h-6 rounded-full p-1 transition-colors ${notifySetting ? 'bg-violet-600' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifySetting ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="border-t border-brand-border/40 pt-4 mt-2">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="btn-secondary border-red-950/30 text-red-400 hover:text-red-300 hover:bg-red-950/10 text-xs py-2 w-full justify-center"
            >
              <RefreshCw size={12} className={isResetting ? 'animate-spin' : ''} />
              <span>{isResetting ? 'Wiping Local Database...' : 'Reset Platform Local Database'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* 3. ACTIVE MODEL CONTEXT PROTOCOL (MCP) REGISTER */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold font-display text-white mb-4 border-b border-brand-border pb-2.5 flex items-center gap-1.5 uppercase">
          <Server size={15} className="text-emerald-400" />
          <span>Active Model Context Protocol (MCP) Server Registry</span>
        </h3>

        <div className="flex flex-col gap-3.5 text-xs">
          {activeMcps.map((mcp, idx) => (
            <div key={idx} className="flex justify-between items-start gap-4 border-b border-slate-900 last:border-0 pb-3 last:pb-0">
              <div>
                <span className="font-bold text-white font-display text-xs">{mcp.name}</span>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Connected tools: {mcp.tools}</p>
              </div>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded uppercase tracking-wider select-none shrink-0">
                {mcp.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default SettingsPage;
