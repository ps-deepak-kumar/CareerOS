import React, { useState, useEffect } from 'react';
import { Search, Link2, Film, FileText, BookOpen, Compass, CheckCircle2, Circle } from 'lucide-react';
import { stateManager } from '../services/stateManager';
import { Resource } from '../data/mockData';

export const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'paper' | 'doc' | 'project' | 'book'>('all');
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    setResources(stateManager.getResources());
  }, []);

  const handleToggleCompleted = (id: string) => {
    const updated = stateManager.toggleResourceCompleted(id);
    setResources([...updated]);
  };

  const filteredResources = resources.filter(res => {
    const matchesFilter = activeFilter === 'all' || res.type === activeFilter;
    const matchesSearch = res.title.toLowerCase().includes(searchVal.toLowerCase()) || 
                          res.whyRecommended.toLowerCase().includes(searchVal.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type: Resource['type']) => {
    switch (type) {
      case 'video': return <Film size={14} className="text-blue-500" />;
      case 'paper': return <FileText size={14} className="text-indigo-500" />;
      case 'doc': return <Compass size={14} className="text-cyan-500" />;
      case 'book': return <BookOpen size={14} className="text-amber-500" />;
      default: return <Link2 size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Resource Catalog Index</h2>
          <p className="text-xs text-slate-550 mt-0.5 font-display">Reference materials evaluated and indexed by the Resource Curator Agent.</p>
        </div>
        
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-900 border border-brand-border rounded-lg px-3 py-1.5 w-full sm:w-64 focus-within:border-indigo-500/40 transition-all text-xs shrink-0">
          <Search size={13} className="text-slate-550" />
          <input 
            type="text" 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search catalog..."
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex bg-slate-900 border border-brand-border rounded-lg p-1 select-none overflow-x-auto text-xs gap-1 max-w-fit">
        {(['all', 'video', 'paper', 'doc', 'book', 'project'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-md font-bold font-display tracking-wider uppercase transition-all ${
              activeFilter === filter ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            {filter}s
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResources.length > 0 ? (
          filteredResources.map(res => (
            <div 
              key={res.id} 
              className={`glass-panel p-5 flex flex-col justify-between gap-4 bg-[#0e0f17]/40 transition-all duration-200 ${
                res.completed 
                  ? 'border-emerald-500/20 bg-emerald-950/5' 
                  : 'glass-panel-hover'
              }`}
            >
              <div className="flex gap-4 items-start text-left">
                <div className="p-2.5 rounded bg-slate-950 border border-brand-border shrink-0 mt-0.5">
                  {getIcon(res.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    <span>{res.type}</span>
                    <span>•</span>
                    <span>{res.duration}</span>
                    <span>•</span>
                    <span>{res.difficulty}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug">{res.title}</h3>
                  <p className="text-[11px] text-slate-450 mt-2 leading-relaxed italic">" {res.whyRecommended} "</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-[10px] font-bold font-display uppercase tracking-wider">
                <button
                  onClick={() => handleToggleCompleted(res.id)}
                  className={`flex items-center gap-1 transition-colors ${
                    res.completed ? 'text-emerald-400 hover:text-emerald-305' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {res.completed ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle size={12} className="text-slate-700" />
                      <span>Mark complete</span>
                    </>
                  )}
                </button>

                <a 
                  href={res.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-305 hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Open Resource</span>
                  <Link2 size={10} />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-500 italic text-xs">
            No resources found.
          </div>
        )}
      </div>

    </div>
  );
};
export default Resources;
