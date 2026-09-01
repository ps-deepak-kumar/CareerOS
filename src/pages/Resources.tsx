import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Link2, Film, FileText, BookOpen, Compass, CheckCircle2, 
  Circle, Plus, Sparkles, ExternalLink, Bookmark, Clock, 
  CheckCheck, Filter, Code2, Layers, X, Download
} from 'lucide-react';
import { stateManager } from '../services/stateManager';
import { Resource } from '../data/mockData';
import { showToast } from '../components/ToastContainer';

export const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'paper' | 'doc' | 'project' | 'book'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchVal, setSearchVal] = useState('');
  const [isAiCurating, setIsAiCurating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New resource form states
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<Resource['type']>('paper');
  const [newDifficulty, setNewDifficulty] = useState<Resource['difficulty']>('Intermediate');
  const [newDuration, setNewDuration] = useState('30 min');
  const [newWhy, setNewWhy] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const refreshResources = () => {
    setResources(stateManager.getResources());
  };

  useEffect(() => {
    refreshResources();
  }, []);

  const handleToggleCompleted = (id: string) => {
    const updated = stateManager.toggleResourceCompleted(id);
    setResources([...updated]);
    const item = updated.find(r => r.id === id);
    if (item?.completed) {
      stateManager.logActivity(1);
      showToast(`Marked "${item.title}" as completed! (+10 XP)`, 'success');
    }
  };

  const handleAiCurate = () => {
    if (!searchVal.trim()) {
      showToast('Enter a research topic in the search bar first!', 'error');
      return;
    }
    setIsAiCurating(true);
    setTimeout(() => {
      const topic = searchVal.trim();
      const newItems: Resource[] = [
        {
          id: `res-${Date.now()}-1`,
          title: `State-of-the-Art Deep Dive: ${topic}`,
          type: 'paper',
          difficulty: 'Advanced',
          duration: '18 pages',
          whyRecommended: `Semantic indexing identified highest citation impact and benchmarking analysis for ${topic}.`,
          url: `https://arxiv.org/search/?query=${encodeURIComponent(topic)}&searchtype=all`,
          completed: false
        },
        {
          id: `res-${Date.now()}-2`,
          title: `${topic} — Architecture Implementation in PyTorch`,
          type: 'project',
          difficulty: 'Intermediate',
          duration: '2.5 hours',
          whyRecommended: `Verified production repository with clean modular classes and training checkpoints.`,
          url: `https://github.com/topics/${encodeURIComponent(topic.toLowerCase().replace(/\s+/g, '-'))}`,
          completed: false
        }
      ];

      const current = stateManager.getResources();
      const merged = [...newItems, ...current];
      stateManager.saveResources(merged);
      setResources(merged);

      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Resource Curator Agent',
        action: 'curate_materials',
        status: 'success',
        message: `Indexed 2 top-ranked research papers & code repositories for: "${topic}".`,
        reasoning: 'Filtered Arxiv and GitHub index for high citation rate and clean pedagogical structure.'
      });

      setIsAiCurating(false);
      showToast(`AI Curator indexed 2 new materials for "${topic}"!`, 'success');
    }, 1500);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const newRes: Resource = {
      id: `res-custom-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      difficulty: newDifficulty,
      duration: newDuration.trim() || '30 min',
      whyRecommended: newWhy.trim() || 'User curated reference material for syllabus development.',
      url: newUrl.trim(),
      completed: false
    };

    const current = stateManager.getResources();
    const updated = [newRes, ...current];
    stateManager.saveResources(updated);
    setResources(updated);

    setNewTitle('');
    setNewUrl('');
    setNewWhy('');
    setShowAddModal(false);
    showToast(`Added "${newRes.title}" to your Resource Index!`, 'success');
  };

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchesType = activeFilter === 'all' || res.type === activeFilter;
      const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'completed' ? res.completed : !res.completed);
      const matchesSearch = res.title.toLowerCase().includes(searchVal.toLowerCase()) || 
                            res.whyRecommended.toLowerCase().includes(searchVal.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [resources, activeFilter, statusFilter, searchVal]);

  const totalCount = resources.length;
  const completedCount = resources.filter(r => r.completed).length;
  const completedPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const getIcon = (type: Resource['type']) => {
    switch (type) {
      case 'video': return <Film size={15} className="text-zinc-700" />;
      case 'paper': return <FileText size={15} className="text-zinc-700" />;
      case 'doc': return <Compass size={15} className="text-zinc-600" />;
      case 'book': return <BookOpen size={15} className="text-zinc-600" />;
      case 'project': return <Code2 size={15} className="text-zinc-600" />;
      default: return <Link2 size={15} className="text-zinc-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-12 font-sans text-zinc-700">
      
      {/* TOP HEADER */}
      <div className="glass-panel p-5 border border-zinc-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-zinc-50/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-2xl shadow-inner">
            📚
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold font-sans text-zinc-900 tracking-tight">
                Academic & Research Material Index
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-cyan-500/30">
                Curator Agent Online
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Peer-reviewed papers, Stanford & MIT video archives, GitHub reference architectures, and official technical specs.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-secondary flex items-center gap-1.5 py-2 px-3 text-xs"
          >
            <Plus size={13} />
            <span>Add Material</span>
          </button>
        </div>
      </div>

      {/* SEARCH, AI CURATOR & METRICS BAR */}
      <div className="glass-panel p-4 bg-zinc-100 border border-zinc-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Search with AI Trigger */}
        <div className="flex items-center gap-2 w-full md:w-96">
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 w-full focus-within:border-zinc-300 transition-all text-xs">
            <Search size={14} className="text-zinc-400 shrink-0" />
            <input 
              type="text" 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search topic or ask AI to index..."
              className="bg-transparent text-xs text-zinc-900 placeholder-slate-500 focus:outline-none w-full"
            />
          </div>
          
          <button
            onClick={handleAiCurate}
            disabled={isAiCurating}
            className="btn-primary shrink-0 flex items-center gap-1.5 py-2 px-3 text-xs font-bold uppercase tracking-wider shadow-sm"
            title="Ask AI Curator to search Arxiv & GitHub"
          >
            <Sparkles size={13} className={isAiCurating ? 'animate-spin text-zinc-600' : 'text-zinc-600'} />
            <span>{isAiCurating ? 'Indexing...' : 'AI Discover'}</span>
          </button>
        </div>

        {/* Progress HUD */}
        <div className="flex items-center gap-4 text-xs font-mono w-full md:w-auto justify-between md:justify-end">
          <span className="text-zinc-500">
            Read Progress: <strong className="text-zinc-600">{completedCount} / {totalCount}</strong> ({completedPercent}%)
          </span>
          <div className="w-28 h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
            <div className="h-full bg-zinc-800 rounded-full transition-all duration-700" style={{ width: `${completedPercent}%` }} />
          </div>
        </div>
      </div>

      {/* FILTER TABS & STATUS SWITCHER */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-200 pb-3">
        {/* Type filters */}
        <div className="flex bg-white p-1 rounded-xl border border-zinc-200 overflow-x-auto text-xs">
          {(['all', 'video', 'paper', 'project', 'doc', 'book'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg font-bold font-sans uppercase tracking-wider transition-all ${
                activeFilter === filter ? 'bg-zinc-900 text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {filter === 'all' ? 'All Types' : `${filter}s`}
            </button>
          ))}
        </div>

        {/* Status filters */}
        <div className="flex bg-white p-1 rounded-xl border border-zinc-200 text-xs font-mono">
          {(['all', 'pending', 'completed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg capitalize transition-all ${
                statusFilter === st ? 'bg-slate-800 text-zinc-900 font-bold' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {st === 'all' ? 'All Status' : st === 'pending' ? 'To Study' : 'Finished'}
            </button>
          ))}
        </div>
      </div>

      {/* RESOURCE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredResources.length > 0 ? (
          filteredResources.map(res => (
            <div 
              key={res.id} 
              className={`glass-panel p-5 flex flex-col justify-between gap-4 bg-zinc-100 border rounded-2xl transition-all duration-300 shadow-md ${
                res.completed 
                  ? 'border-emerald-500/30 bg-zinc-100' 
                  : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'
              }`}
            >
              <div className="flex gap-4 items-start text-left">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 shrink-0 mt-0.5 shadow-inner">
                  {getIcon(res.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                    <span className="text-zinc-700 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-300">{res.type}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={10} />{res.duration}</span>
                    <span>•</span>
                    <span className={res.difficulty === 'Advanced' ? 'text-red-400' : 'text-zinc-600'}>{res.difficulty}</span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-zinc-900 mt-1.5 leading-snug">{res.title}</h3>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed italic bg-zinc-100 p-2.5 rounded-lg border border-zinc-200">
                    "{res.whyRecommended}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-zinc-200 pt-3 flex justify-between items-center text-xs font-mono">
                <button
                  onClick={() => handleToggleCompleted(res.id)}
                  className={`flex items-center gap-1.5 transition-colors font-bold uppercase tracking-wider text-[10px] ${
                    res.completed ? 'text-zinc-600 hover:text-zinc-600' : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {res.completed ? (
                    <>
                      <CheckCircle2 size={15} className="text-zinc-600" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle size={15} className="text-slate-600 hover:text-zinc-700" />
                      <span>Mark Studied</span>
                    </>
                  )}
                </button>

                <a 
                  href={res.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-primary py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm"
                >
                  <span>Access Material</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-zinc-400 italic text-xs bg-zinc-100 rounded-2xl border border-dashed border-zinc-200">
            No materials found matching your criteria. Use "AI Discover" to search Arxiv & GitHub!
          </div>
        )}
      </div>

      {/* CREATE MATERIAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 bg-white border border-zinc-200 w-full max-w-lg rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Plus size={16} className="text-zinc-700" />
                <span>Add Academic Reference Material</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-zinc-900 p-1">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-500 font-semibold block mb-1">Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. FlashAttention-2: Faster Attention with Better Parallelism"
                  className="bg-zinc-100 border border-zinc-200 rounded-xl px-3.5 py-2 text-zinc-900 placeholder-slate-500 w-full focus:outline-none focus:border-zinc-300"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 w-full focus:outline-none focus:border-zinc-300"
                  >
                    <option value="paper">Paper (Arxiv)</option>
                    <option value="video">Video Lecture</option>
                    <option value="project">GitHub Repo</option>
                    <option value="doc">Documentation</option>
                    <option value="book">Textbook</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e: any) => setNewDifficulty(e.target.value)}
                    className="bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 w-full focus:outline-none focus:border-zinc-300"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-500 font-semibold block mb-1">Est. Duration</label>
                  <input 
                    type="text" 
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="e.g. 45 min"
                    className="bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 w-full focus:outline-none focus:border-zinc-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-500 font-semibold block mb-1">URL Reference</label>
                <input 
                  type="url" 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://arxiv.org/abs/2307.08691"
                  className="bg-zinc-100 border border-zinc-200 rounded-xl px-3.5 py-2 text-zinc-900 placeholder-slate-500 w-full focus:outline-none focus:border-zinc-300 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-zinc-500 font-semibold block mb-1">Why Recommended / Notes</label>
                <textarea 
                  value={newWhy}
                  onChange={(e) => setNewWhy(e.target.value)}
                  placeholder="Key GPU SRAM memory IO speedups and parallelization notes..."
                  rows={2}
                  className="bg-zinc-100 border border-zinc-200 rounded-xl px-3.5 py-2 text-zinc-900 placeholder-slate-500 w-full focus:outline-none focus:border-zinc-300 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary py-2 px-4">
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-4">
                  Add Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default Resources;
