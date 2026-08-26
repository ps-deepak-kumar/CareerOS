import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronDown, ChevronUp, Bot, RefreshCw, Cpu, CheckCircle } from 'lucide-react';
import { stateManager, AgentLog } from '../services/stateManager';

export const AgentTerminal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLogs(stateManager.getAgentLogs());
    const interval = setInterval(() => {
      setLogs(stateManager.getAgentLogs());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  const getAgentBadgeClass = (agent: string) => {
    switch (agent) {
      case 'Orchestrator Agent': return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
      case 'Work Intelligence Agent': return 'text-blue-500 border-blue-500/20 bg-blue-500/5';
      case 'Goal Agent': return 'text-indigo-500 border-indigo-500/20 bg-indigo-500/5';
      case 'Skill Gap Agent': return 'text-purple-500 border-purple-500/20 bg-purple-500/5';
      case 'Roadmap Agent': return 'text-cyan-500 border-cyan-500/20 bg-cyan-500/5';
      case 'Resource Curator Agent': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
      case 'Daily Planner Agent': return 'text-orange-500 border-orange-500/20 bg-orange-500/5';
      case 'Progress Agent': return 'text-teal-500 border-teal-500/20 bg-teal-500/5';
      default: return 'text-slate-400 border-slate-700 bg-slate-800/10';
    }
  };

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    setInputVal('');
    setIsTyping(true);

    stateManager.addLog({
      timestamp: new Date().toLocaleTimeString(),
      agent: 'User Controller',
      action: 'dispatch_query',
      status: 'info',
      message: `Dispatched: "${userText}"`,
      reasoning: 'Resolving natural language intent parameters for system router.'
    });
    setLogs(stateManager.getAgentLogs());

    setTimeout(() => {
      setIsTyping(false);
      let replyMsg = `Orchestrator completed diagnostic run. Services online.`;
      let replier = 'Orchestrator Agent';
      let toolName = undefined;
      
      const query = userText.toLowerCase();
      if (query.includes('status') || query.includes('track') || query.includes('how am i')) {
        replyMsg = 'Skill mastery analyzer: Deepak is 71% of target level. Attention equations unlocked.';
        replier = 'Progress Agent';
      } else if (query.includes('work') || query.includes('teams') || query.includes('meeting')) {
        replyMsg = 'Teams Sync: Pulling assigned sprint tickets. 2 tasks pending code submission.';
        replier = 'Work Intelligence Agent';
        toolName = 'm365Mcp.get_teams_tasks()';
      } else if (query.includes('learn') || query.includes('course') || query.includes('transformer')) {
        replyMsg = 'Roadmap analyzer: Focus lesson "Multi-Head Attention" active. Accompanying quiz ready.';
        replier = 'Roadmap Agent';
        toolName = 'learningMcp.get_learning_progress()';
      }

      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: replier,
        action: 'trace_completion',
        status: 'success',
        message: replyMsg,
        reasoning: `Decoded instruction: "${userText}". Evaluated through Llama3 local classification.`,
        tool: toolName
      });
      setLogs(stateManager.getAgentLogs());
    }, 1000);
  };

  const handleClearLogs = () => {
    stateManager.clearLogs();
    setLogs([]);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 shadow-2xl font-mono glass-panel flex flex-col bg-[#0e0f17] ${
      isOpen ? 'w-[480px] h-[520px]' : 'w-64 h-12'
    }`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 h-12 border-b border-brand-border cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Terminal size={14} className={isOpen ? 'text-indigo-400' : 'text-slate-400'} />
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">
            {isOpen ? 'AI Trace Inspector' : 'Open AI Trace Inspector'}
          </span>
        </div>
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {isOpen && (
            <button 
              onClick={handleClearLogs}
              title="Clear Inspector"
              className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800/40"
            >
              <RefreshCw size={11} />
            </button>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800/40"
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Structured log lists */}
      {isOpen && (
        <>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-[10px] bg-[#090a0f] text-slate-300">
            <div className="text-[9px] text-slate-500 border-b border-slate-900 pb-2 flex justify-between select-none">
              <span>SYSTEM TRACER GRAPH ACTIVE</span>
              <span>v1.0.2</span>
            </div>
            
            {logs.map((log, idx) => (
              <div key={idx} className="border-b border-slate-900/60 pb-3 flex flex-col gap-1.5">
                {/* Header Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-600 font-semibold">{log.timestamp}</span>
                  <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold ${getAgentBadgeClass(log.agent)}`}>
                    {log.agent}
                  </span>
                  <span className="text-slate-400 font-bold bg-slate-950 px-1.5 py-0.2 rounded border border-slate-900">
                    {log.action}
                  </span>
                </div>
                
                {/* Message */}
                <p className="text-slate-200 text-xs font-sans leading-normal">{log.message}</p>
                
                {/* Reasoning Detail */}
                {log.reasoning && (
                  <p className="text-slate-500 italic text-[10px] font-sans">↳ {log.reasoning}</p>
                )}

                {/* Tool check */}
                {log.tool && (
                  <div className="mt-0.5 flex items-center gap-1">
                    <Cpu size={10} className="text-indigo-400" />
                    <span className="text-[9px] text-indigo-400 bg-indigo-950/20 px-1.5 py-0.2 rounded border border-indigo-950/10">
                      Tool: {log.tool}
                    </span>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-center gap-2 text-slate-500 italic pl-1">
                <Bot size={12} className="animate-spin text-indigo-400" />
                <span>Tracer resolving schema...</span>
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>

          {/* Form input */}
          <form 
            onSubmit={handleSendCommand}
            className="p-3 border-t border-brand-border bg-[#0d0e15] flex gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ping orchestrator: 'work status' or 'learning recommendation'..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/40"
            />
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded px-4 text-xs font-semibold font-display tracking-wider transition-colors"
            >
              SEND
            </button>
          </form>
        </>
      )}
    </div>
  );
};
export default AgentTerminal;
