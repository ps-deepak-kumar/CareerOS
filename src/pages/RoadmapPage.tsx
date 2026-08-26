import React, { useState, useEffect } from 'react';
import { Map, Sparkles, CheckCircle2, Lock, Clock, ArrowRight, PlayCircle, Brain, Cpu, Zap, Layers, Terminal, Network } from 'lucide-react';
import { stateManager } from '../services/stateManager';
import { RoadmapNode } from '../data/mockData';

export const RoadmapPage: React.FC = () => {
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);

  useEffect(() => {
    const roadmap = stateManager.getRoadmap();
    setNodes(roadmap);
    const active = roadmap.find(n => n.status === 'current') || roadmap[0];
    setSelectedNode(active);
  }, []);

  const getStatusIcon = (status: RoadmapNode['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />;
      case 'current': return <PlayCircle size={13} className="text-indigo-400 shrink-0" />;
      case 'locked': return <Lock size={11} className="text-slate-500 shrink-0" />;
    }
  };

  const getNodeIcon = (nodeId: string) => {
    switch (nodeId) {
      case 'node-1': return <Brain size={12} className="text-pink-400" />;
      case 'node-2': return <Layers size={12} className="text-orange-400" />;
      case 'node-3': return <Cpu size={12} className="text-yellow-400" />;
      case 'node-4': return <Zap size={12} className="text-amber-400" />;
      case 'node-5': return <Cpu size={12} className="text-cyan-400" />;
      case 'node-6': return <Layers size={12} className="text-indigo-400" />;
      case 'node-7': return <Network size={12} className="text-blue-405" />;
      case 'node-8': return <Cpu size={12} className="text-purple-400" />;
      case 'node-9': return <Terminal size={12} className="text-emerald-400" />;
      case 'node-10': return <Terminal size={12} className="text-teal-400" />;
      default: return <Sparkles size={12} className="text-amber-400" />;
    }
  };

  const getNodeDescription = (nodeId: string) => {
    const descriptions: Record<string, string> = {
      'node-1': "Learn neural network components, feedforward loops, and basic cost functions.",
      'node-2': "Build backpropagation chains, gradient steps, and initial optimizer vectors.",
      'node-3': "Master sequence embeddings, recurrence matrices, and basic translation vectors.",
      'node-4': "Understand Q, K, and V attention weights and scaled dot-product masking formulas.",
      'node-5': "Deploy multi-head parallel attention projections to merge semantic sequences.",
      'node-6': "Compute positional wave vectors and masked decoder output probabilities.",
      'node-7': "Architect full Transformer Encoders & Decoders with causal cross-attention layers.",
      'node-8': "Study causal self-supervised learning, tokenization models, and alignment matrices.",
      'node-9': "Design autonomous loops, ReAct reasoning trees, and vector search tools.",
      'node-10': "Compile a live Model Context Protocol (MCP) server exposing tools natively."
    };
    return descriptions[nodeId] || "Custom target milestone designed by CareerOS tracer agents.";
  };

  const getNodePosition = (nodeId: string, index: number) => {
    const defaultPositions: Record<string, { x: number; y: number }> = {
      'node-1': { x: 300, y: 70 },
      'node-2': { x: 300, y: 185 },
      'node-3': { x: 300, y: 300 },
      'node-4': { x: 180, y: 415 },
      'node-5': { x: 420, y: 415 },
      'node-6': { x: 300, y: 530 },
      'node-7': { x: 300, y: 645 },
      'node-8': { x: 300, y: 760 },
      'node-9': { x: 300, y: 875 },
      'node-10': { x: 300, y: 990 }
    };

    if (defaultPositions[nodeId]) {
      return defaultPositions[nodeId];
    }
    return { x: 300, y: 1105 + (index - 10) * 115 };
  };

  const nodeWidth = 190;
  const nodeHeight = 76;
  const svgHeight = Math.max(1080, 1000 + (nodes.length - 10) * 115);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      
      <style>{`
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(99, 102, 241, 0.2);
            border-color: rgba(99, 102, 241, 0.25);
          }
          50% {
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.65);
            border-color: rgba(99, 102, 241, 0.7);
          }
        }
        .animate-pulse-glow {
          animation: pulseGlow 2s infinite ease-in-out;
        }
        
        /* Particle flow line keyframes */
        @keyframes flow {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-flow-line {
          animation: flow 1s linear infinite;
        }

        /* Grid styling */
        .roadmap-grid {
          background-image: radial-gradient(#1e293b 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* TOP HEADER */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold font-display text-white">Skill Roadmaps Diagram</h2>
        <p className="text-xs text-slate-550 mt-0.5 font-display">A dependency-aware learning sequence mapped by skill gap tracer agents.</p>
      </div>

      {/* ROADMAP GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* GRAPH TREE COLUMN (3/4 layout) */}
        <div className="lg:col-span-3 glass-panel p-5 flex flex-col gap-4 overflow-hidden min-h-[600px] relative bg-[#06070b]/60">
          <div className="flex items-center justify-between border-b border-brand-border pb-3 z-10">
            <span className="text-[10px] font-bold font-display text-slate-400 uppercase tracking-wider">Active Target: Become an AI Engineer</span>
            <div className="flex items-center gap-4 text-[9px] font-bold font-mono text-slate-550 select-none uppercase tracking-wider">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-950/20 border border-emerald-500/20" /> Completed</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-950/20 border border-indigo-500/20" /> Active</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-900 border border-slate-950" /> Locked</span>
            </div>
          </div>

          {/* SVG Tree Graph */}
          <div className="overflow-auto max-h-[750px] roadmap-grid border border-brand-border/40 rounded-xl relative py-4 bg-[#07080d]/40">
            <svg 
              width="100%" 
              height={svgHeight}
              viewBox={`0 0 600 ${svgHeight}`}
              className="mx-auto"
            >
              {/* Connection Lines (Paths) */}
              {nodes.map((node, index) => {
                const childPos = getNodePosition(node.id, index);
                return node.prerequisites.map((prereqId) => {
                  const parentIndex = nodes.findIndex(n => n.id === prereqId);
                  if (parentIndex === -1) return null;
                  const parentPos = getNodePosition(prereqId, parentIndex);
                  
                  const dx = childPos.x - parentPos.x;
                  const dy = childPos.y - parentPos.y;
                  
                  let pathD = '';
                  if (dx === 0) {
                    pathD = `M ${parentPos.x} ${parentPos.y + nodeHeight / 2} L ${childPos.x} ${childPos.y - nodeHeight / 2}`;
                  } else {
                    const cy1 = parentPos.y + dy * 0.45;
                    const cy2 = parentPos.y + dy * 0.55;
                    pathD = `M ${parentPos.x} ${parentPos.y + nodeHeight / 2} C ${parentPos.x} ${cy1}, ${childPos.x} ${cy2}, ${childPos.x} ${childPos.y - nodeHeight / 2}`;
                  }

                  let strokeClass = 'stroke-slate-800/80';
                  let isCompleted = node.status === 'completed' && nodes[parentIndex].status === 'completed';
                  let isActive = (node.status === 'current' && nodes[parentIndex].status === 'completed') || (node.status === 'completed' && nodes[parentIndex].status === 'current');

                  if (isCompleted) {
                    strokeClass = 'stroke-emerald-500/60 filter drop-shadow-[0_0_2px_#10b981]';
                  } else if (isActive) {
                    strokeClass = 'stroke-indigo-500/60 filter drop-shadow-[0_0_2px_#6366f1]';
                  }
                  
                  return (
                    <g key={`${prereqId}-${node.id}`}>
                      {/* Base connection path */}
                      <path 
                        d={pathD}
                        fill="none"
                        className={`transition-all duration-300 ${strokeClass}`}
                        strokeWidth={2}
                      />
                      {/* Flowing dashed particle overlay */}
                      {(isCompleted || isActive) && (
                        <path 
                          d={pathD}
                          fill="none"
                          className={isCompleted ? "stroke-emerald-300/40 animate-flow-line" : "stroke-indigo-300/40 animate-flow-line"}
                          strokeWidth={1.5}
                          strokeDasharray="4 6"
                        />
                      )}
                      {/* Shadow background line */}
                      <path 
                        d={pathD}
                        fill="none"
                        className="stroke-slate-900"
                        strokeWidth={1}
                      />
                    </g>
                  );
                });
              })}

              {/* RPG-Style Level Tiers floating in background */}
              <g opacity="0.2" className="select-none font-bold uppercase tracking-widest font-mono text-[11px] fill-slate-500">
                <text x="35" y="125">Tier 1: Novice Initiation</text>
                <line x1="35" y1="133" x2="200" y2="133" stroke="#64748b" strokeWidth="1" />
                
                <text x="35" y="405">Tier 2: The Core Crucible</text>
                <line x1="35" y1="413" x2="200" y2="413" stroke="#64748b" strokeWidth="1" />
                
                <text x="35" y="685">Tier 3: System Architect</text>
                <line x1="35" y1="693" x2="200" y2="693" stroke="#64748b" strokeWidth="1" />
                
                <text x="35" y="915">Tier 4: Autonomous Mage</text>
                <line x1="35" y1="923" x2="200" y2="923" stroke="#64748b" strokeWidth="1" />
              </g>

              {/* Node foreignObjects */}
              {nodes.map((node, index) => {
                const pos = getNodePosition(node.id, index);
                const isSelected = selectedNode?.id === node.id;
                
                return (
                  <foreignObject
                    key={node.id}
                    x={pos.x - nodeWidth / 2}
                    y={pos.y - nodeHeight / 2}
                    width={nodeWidth}
                    height={nodeHeight}
                  >
                    <div 
                      onClick={() => setSelectedNode(node)}
                      className={`p-2.5 rounded-lg text-left cursor-pointer transition-all duration-300 select-none flex flex-col justify-between h-full group relative overflow-hidden ${
                        isSelected 
                          ? 'bg-[#0f111a] border-l-4 border-l-indigo-500 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                          : node.status === 'completed'
                          ? 'bg-[#0e1716] border-l-4 border-l-emerald-500 border-emerald-500/25 border-r border-t border-b hover:border-emerald-450 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:-translate-y-1 hover:scale-105'
                          : node.status === 'current'
                          ? 'bg-[#111322] border-l-4 border-l-indigo-500 border-indigo-500/30 border-r border-t border-b hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:-translate-y-1 hover:scale-105 animate-pulse-glow'
                          : 'bg-[#0d0f17] border-l-4 border-l-slate-605 border-slate-800/80 border-r border-t border-b opacity-85 hover:opacity-100 hover:border-slate-600 hover:-translate-y-1 hover:scale-105'
                      }`}
                    >
                      {/* Node Details */}
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex justify-between items-center gap-1.5 border-b border-brand-border/30 pb-1 mb-1">
                          <span className="text-[7px] font-bold text-slate-500 font-mono tracking-wider uppercase">{node.phase}</span>
                          {getNodeIcon(node.id)}
                        </div>
                        
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[10px] font-bold text-slate-200 leading-snug group-hover:text-white transition-colors line-clamp-2">
                            {node.title}
                          </span>
                          {getStatusIcon(node.status)}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 mt-1 uppercase font-bold border-t border-brand-border/30 pt-1">
                        <span className="flex items-center gap-0.5"><Clock size={8} /> {node.estimatedTime}</span>
                        <span>{node.difficulty}</span>
                      </div>

                      {/* Gamified Objective Slide-up Overlay */}
                      {node.status !== 'locked' ? (
                        <div className="absolute inset-0 bg-[#0a0b15] z-20 p-2.5 rounded-lg border border-indigo-500/60 flex flex-col justify-center text-left transform translate-y-full group-hover:translate-y-0 transition-transform duration-350 ease-out pointer-events-none select-none">
                          <span className="text-[7.5px] uppercase font-bold text-indigo-400 font-mono tracking-widest flex items-center gap-1">
                            <Sparkles size={8} /> Objective Details
                          </span>
                          <p className="text-[9px] text-slate-300 leading-normal mt-0.5 font-medium line-clamp-3">
                            {getNodeDescription(node.id)}
                          </p>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-[#0a0b15] z-20 p-2.5 rounded-lg border border-slate-700/60 flex flex-col justify-center text-left transform translate-y-full group-hover:translate-y-0 transition-transform duration-350 ease-out pointer-events-none select-none">
                          <span className="text-[7.5px] uppercase font-bold text-slate-500 font-mono tracking-widest flex items-center gap-1">
                            <Lock size={8} /> Node Locked
                          </span>
                          <p className="text-[8.5px] text-slate-405 leading-normal mt-0.5 font-medium">
                            Requires completion of: {node.prerequisites.map(prereqId => {
                              const prereqNode = nodes.find(n => n.id === prereqId);
                              return prereqNode ? `"${prereqNode.title}"` : "Prerequisite";
                            }).join(', ')}.
                          </p>
                        </div>
                      )}
                    </div>
                  </foreignObject>
                );
              })}
            </svg>
          </div>
        </div>

        {/* NODE INSPECTOR DRAWER */}
        <div className="glass-panel p-4 flex flex-col gap-4 lg:col-span-1 h-fit bg-[#090a10] border border-brand-border">
          <h3 className="text-xs font-bold font-display text-white border-b border-brand-border pb-2 uppercase tracking-wider flex items-center gap-1.5">
            <span>Node Inspector</span>
          </h3>

          {selectedNode ? (
            <div className="flex flex-col gap-4 text-xs leading-relaxed text-slate-400">
              <div>
                <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase font-mono ${
                  selectedNode.status === 'completed' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/25' :
                  selectedNode.status === 'current' ? 'bg-indigo-950/20 text-indigo-400 border-indigo-900/25' :
                  'bg-slate-900 text-slate-550 border-slate-800'
                }`}>
                  {selectedNode.status}
                </span>
                <h4 className="text-xs font-bold text-white mt-1.5 leading-snug">{selectedNode.title}</h4>
              </div>

              <div>
                <p className="text-slate-500 font-medium">Competency Index</p>
                <p className="text-slate-300 mt-0.5 font-bold uppercase font-mono text-[10px]">{selectedNode.difficulty}</p>
              </div>

              <div>
                <p className="text-slate-500 font-medium">Session Estimate</p>
                <p className="text-slate-300 mt-0.5 font-semibold">{selectedNode.estimatedTime}</p>
              </div>

              {selectedNode.prerequisites.length > 0 && (
                <div>
                  <p className="text-slate-505 font-medium mb-1">Prerequisites</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.prerequisites.map((prereqId, idx) => {
                      const prereqNode = nodes.find(n => n.id === prereqId);
                      return (
                        <span key={idx} className="bg-slate-900/50 border border-slate-800 text-[8px] px-1.5 py-0.5 rounded text-slate-450 font-semibold truncate max-w-full">
                          {prereqNode ? prereqNode.title : "Prerequisite Concept"}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Progress bar */}
              <div className="border-t border-slate-900 pt-3">
                <div className="flex justify-between items-center text-[9px] text-slate-555 mb-1 font-mono font-semibold uppercase">
                  <span>Topic Completion</span>
                  <span className="text-white font-bold">{selectedNode.completionPercent}%</span>
                </div>
                <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${selectedNode.completionPercent}%` }} />
                </div>
              </div>

              {selectedNode.status !== 'locked' ? (
                <button 
                  onClick={() => window.location.hash = '#/learning'}
                  className="btn-primary py-2 text-xs font-bold mt-2 w-full"
                >
                  <span>Open textbook chapters</span>
                  <ArrowRight size={12} />
                </button>
              ) : (
                <div className="text-[9px] text-slate-550 flex items-center gap-1.5 p-2 rounded bg-slate-950 border border-slate-900 mt-2">
                  <Lock size={12} className="text-slate-705 shrink-0" />
                  <span>Topic locked. Solve prerequisite sequences first.</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-505 text-xs italic text-center py-6">Select a roadmap node to inspect details.</p>
          )}
        </div>

      </div>

    </div>
  );
};
export default RoadmapPage;
