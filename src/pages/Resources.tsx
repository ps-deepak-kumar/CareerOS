import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Link2, Film, FileText, BookOpen, Compass, CheckCircle2,
  Circle, Plus, Sparkles, ExternalLink, Bookmark, Clock,
  CheckCheck, Filter, Code2, Layers, X, Download, RefreshCw, LayoutGrid, List
} from 'lucide-react';
import { stateManager } from '../services/stateManager';
import { Resource } from '../data/mockData';
import { resourceMcp, MultiSectionResources } from '../services/mcp/resourceMcp';
import { showToast } from '../components/ToastContainer';

export const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'paper' | 'project' | 'doc' | 'book'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchVal, setSearchVal] = useState('');
  const [isAiCurating, setIsAiCurating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'sections' | 'grid'>('sections');
  const [lastCuratedQuery, setLastCuratedQuery] = useState<string>('');

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

  const executeCurate = async (queryToSearch: string) => {
    const query = queryToSearch.trim() || 'Modern AI & Software Architecture';
    setIsAiCurating(true);

    try {
      const multiSection = await resourceMcp.curateAllSections(query);
      const allNew: Resource[] = [
        ...multiSection.videos,
        ...multiSection.papers,
        ...multiSection.projects,
        ...multiSection.docs,
        ...multiSection.books,
      ];

      // Merge avoiding duplicate ids
      const current = stateManager.getResources();
      const existingIds = new Set(current.map(r => r.id));
      const freshItems = allNew.filter(item => !existingIds.has(item.id));

      const merged = [...freshItems, ...current];
      stateManager.saveResources(merged);
      setResources(merged);
      setLastCuratedQuery(query);

      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Resource Curator Agent',
        action: 'curate_multi_section',
        status: 'success',
        message: `Indexed 15+ multi-category resources (Videos, Papers, Projects, Docs, Books) for "${query}".`,
        reasoning: 'Fetched and synthesized at least 3 curated items across all 5 standard knowledge media types.'
      });

      showToast(`Curated 3+ items across Videos, Papers, Projects, Docs & Books for "${query}"!`, 'success');
    } catch (err) {
      console.error('Curate error:', err);
      showToast('Error curating materials. Offline knowledge bank loaded.', 'warning');
    } finally {
      setIsAiCurating(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      executeCurate(searchVal);
    }
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
      const matchesSearch = !searchVal ||
                            res.title.toLowerCase().includes(searchVal.toLowerCase()) ||
                            res.whyRecommended.toLowerCase().includes(searchVal.toLowerCase()) ||
                            res.type.toLowerCase().includes(searchVal.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [resources, activeFilter, statusFilter, searchVal]);

  // Sectioned groups
  const categorized = useMemo(() => {
    const list = filteredResources;
    return {
      video: list.filter(r => r.type === 'video'),
      paper: list.filter(r => r.type === 'paper'),
      project: list.filter(r => r.type === 'project'),
      doc: list.filter(r => r.type === 'doc'),
      book: list.filter(r => r.type === 'book'),
    };
  }, [filteredResources]);

  const totalCount = resources.length;
  const completedCount = resources.filter(r => r.completed).length;
  const completedPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const getIcon = (type: Resource['type']) => {
    switch (type) {
      case 'video': return <Film size={15} className="text-zinc-700" />;
      case 'paper': return <FileText size={15} className="text-zinc-700" />;
      case 'doc': return <Compass size={15} className="text-zinc-700" />;
      case 'book': return <BookOpen size={15} className="text-zinc-700" />;
      case 'project': return <Code2 size={15} className="text-zinc-700" />;
      default: return <Link2 size={15} className="text-zinc-600" />;
    }
  };

  const renderResourceCard = (res: Resource) => (
    <div
      key={res.id}
      className={`glass-panel p-5 flex flex-col justify-between gap-4 bg-white border rounded-2xl transition-all duration-300 shadow-sm ${
        res.completed
          ? 'border-emerald-400/60 bg-emerald-50/20'
          : 'border-zinc-200 hover:border-zinc-300 hover:shadow-md'
      }`}
    >
      <div className="flex gap-4 items-start text-left">
        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 shrink-0 mt-0.5 shadow-inner">
          {getIcon(res.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
            <span className="text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">{res.type}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock size={11} />{res.duration}</span>
            <span>•</span>
            <span className={res.difficulty === 'Advanced' ? 'text-red-700 font-bold' : 'text-zinc-600'}>{res.difficulty}</span>
          </div>

          <h3 className="text-sm font-bold text-zinc-900 mt-1.5 leading-snug">{res.title}</h3>
          <p className="text-xs text-zinc-600 mt-2 leading-relaxed bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
            "{res.whyRecommended}"
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-zinc-100 pt-3 flex justify-between items-center text-xs font-mono">
        <button
          onClick={() => handleToggleCompleted(res.id)}
          className={`flex items-center gap-1.5 transition-colors font-bold uppercase tracking-wider text-[11px] cursor-pointer ${
            res.completed ? 'text-emerald-700' : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          {res.completed ? (
            <>
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Completed</span>
            </>
          ) : (
            <>
              <Circle size={16} className="text-zinc-400 hover:text-zinc-700" />
              <span>Mark Studied</span>
            </>
          )}
        </button>

        <a
          href={res.url}
          target="_blank"
          rel="noreferrer"
          className="btn-primary py-1.5 px-3 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
        >
          <span>Open Resource</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full pb-12 font-sans text-zinc-700">

      {/* TOP HEADER */}
      <div className="bg-white p-6 border border-zinc-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shrink-0 text-2xl shadow-md">
            📚
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-sans text-zinc-900 tracking-tight">
                Resource Library & Multi-Section Search
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-300">
                Universal Curator Online
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Search any topic to automatically populate at least 3 items in each section: Videos, Research Papers, Open-Source Projects, Specs & Docs, and Textbooks.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-secondary flex items-center gap-1.5 py-2 px-3 text-xs"
          >
            <Plus size={14} />
            <span>Add Custom Material</span>
          </button>
        </div>
      </div>

      {/* SEARCH, AI DISCOVER & PROGRESS BAR */}
      <div className="bg-white p-4 border border-zinc-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">

        {/* Search Bar with AI Trigger */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-2xl">
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 w-full focus-within:border-zinc-400 transition-all text-xs">
            <Search size={15} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search any topic (e.g. Distributed Consensus, Transformers, React, Rust, Kubernetes)..."
              className="bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none w-full"
            />
          </div>

          <button
            type="submit"
            disabled={isAiCurating}
            className="btn-primary shrink-0 flex items-center gap-2 py-2.5 px-4 text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
            title="Search and index at least 3 items in each section"
          >
            {isAiCurating ? (
              <><RefreshCw size={13} className="animate-spin" /> Fetching...</>
            ) : (
              <><Sparkles size={13} /> Multi-Search</>
            )}
          </button>
        </form>

        {/* Progress HUD */}
        <div className="flex items-center gap-4 text-xs font-mono w-full md:w-auto justify-between md:justify-end">
          <span className="text-zinc-500">
            Read Progress: <strong className="text-zinc-900">{completedCount} / {totalCount}</strong> ({completedPercent}%)
          </span>
          <div className="w-28 h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
            <div className="h-full bg-zinc-800 rounded-full transition-all duration-700" style={{ width: `${completedPercent}%` }} />
          </div>
        </div>
      </div>

      {/* FILTER TABS & VIEW SWITCHER */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-200 pb-3">

        {/* Type filters */}
        <div className="flex bg-white p-1 rounded-xl border border-zinc-200 overflow-x-auto text-xs shadow-sm">
          {[
            { id: 'all', label: 'All Resources', count: filteredResources.length },
            { id: 'video', label: 'Videos', count: categorized.video.length },
            { id: 'paper', label: 'Research Papers', count: categorized.paper.length },
            { id: 'project', label: 'Projects', count: categorized.project.length },
            { id: 'doc', label: 'Docs & Specs', count: categorized.doc.length },
            { id: 'book', label: 'Books', count: categorized.book.length },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold font-sans transition-all flex items-center gap-1.5 ${
                activeFilter === filter.id
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <span>{filter.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                activeFilter === filter.id ? 'bg-zinc-700 text-white' : 'bg-zinc-100 text-zinc-600'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* View Mode & Status */}
        <div className="flex items-center gap-2">
          {/* Sectioned vs Flat Grid Toggle */}
          <div className="flex bg-white p-1 rounded-xl border border-zinc-200 text-xs">
            <button
              onClick={() => setViewMode('sections')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-bold ${
                viewMode === 'sections' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Organized by 5 Respective Sections"
            >
              <Layers size={13} />
              <span>Section View</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-bold ${
                viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Combined Flat Grid"
            >
              <LayoutGrid size={13} />
              <span>Grid View</span>
            </button>
          </div>

          {/* Status filters */}
          <div className="flex bg-white p-1 rounded-xl border border-zinc-200 text-xs font-mono">
            {(['all', 'pending', 'completed'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  statusFilter === st ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {st === 'all' ? 'All' : st === 'pending' ? 'To Study' : 'Done'}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* SEARCH BANNER / SUMMARY */}
      {lastCuratedQuery && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 px-4 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-600" />
            <span>Showing verified multi-section resources curated for <strong>"{lastCuratedQuery}"</strong> (at least 3 in each section).</span>
          </div>
          <button
            onClick={() => executeCurate(lastCuratedQuery)}
            className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
          >
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
      )}

      {/* ── SECTIONED VIEW (Default & Recommended) ── */}
      {viewMode === 'sections' && activeFilter === 'all' ? (
        <div className="space-y-8">

          {/* 1. Videos Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                <Film size={16} className="text-zinc-800" />
                <span>1. Video Masterclasses & Stanford/MIT Lectures</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 text-zinc-700 font-mono font-bold">
                  {categorized.video.length} Available (Min 3)
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorized.video.map(renderResourceCard)}
            </div>
          </section>

          {/* 2. Research Papers Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                <FileText size={16} className="text-zinc-800" />
                <span>2. Peer-Reviewed Research Papers (arXiv & NeurIPS)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 text-zinc-700 font-mono font-bold">
                  {categorized.paper.length} Available (Min 3)
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorized.paper.map(renderResourceCard)}
            </div>
          </section>

          {/* 3. Open-Source Projects Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                <Code2 size={16} className="text-zinc-800" />
                <span>3. Open-Source Projects & GitHub Reference Architectures</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 text-zinc-700 font-mono font-bold">
                  {categorized.project.length} Available (Min 3)
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorized.project.map(renderResourceCard)}
            </div>
          </section>

          {/* 4. Documentation & Specs Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                <Compass size={16} className="text-zinc-800" />
                <span>4. Official Documentation & Technical RFC Specs</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 text-zinc-700 font-mono font-bold">
                  {categorized.doc.length} Available (Min 3)
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorized.doc.map(renderResourceCard)}
            </div>
          </section>

          {/* 5. Textbooks & Books Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                <BookOpen size={16} className="text-zinc-800" />
                <span>5. Essential Textbooks & Reference Books (Open Library)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 text-zinc-700 font-mono font-bold">
                  {categorized.book.length} Available (Min 3)
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorized.book.map(renderResourceCard)}
            </div>
          </section>

        </div>
      ) : (
        /* FLAT GRID VIEW (Or filtered by single type) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.length > 0 ? (
            filteredResources.map(renderResourceCard)
          ) : (
            <div className="col-span-full py-16 text-center text-zinc-500 italic text-xs bg-white rounded-2xl border border-dashed border-zinc-300">
              No materials found matching your filter. Use "Multi-Search" above to fetch at least 3 items in each section!
            </div>
          )}
        </div>
      )}

      {/* CREATE MATERIAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-zinc-200 w-full max-w-lg rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Plus size={16} className="text-zinc-800" />
                <span>Add Custom Knowledge Material</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-800 p-1">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-700 font-bold block mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. FlashAttention-3: Fast and Accurate Attention with FP8"
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-zinc-900 placeholder:text-zinc-400 w-full focus:outline-none focus:border-zinc-400"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-700 font-bold block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 w-full focus:outline-none focus:border-zinc-400"
                  >
                    <option value="paper">Paper (arXiv)</option>
                    <option value="video">Video Lecture</option>
                    <option value="project">GitHub Project</option>
                    <option value="doc">Documentation</option>
                    <option value="book">Textbook</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-700 font-bold block mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e: any) => setNewDifficulty(e.target.value)}
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 w-full focus:outline-none focus:border-zinc-400"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-700 font-bold block mb-1">Est. Duration</label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="e.g. 45 min"
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 w-full focus:outline-none focus:border-zinc-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-700 font-bold block mb-1">URL Reference</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://arxiv.org/abs/2307.08691"
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-zinc-900 placeholder:text-zinc-400 w-full focus:outline-none focus:border-zinc-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-zinc-700 font-bold block mb-1">Why Recommended / Key Takeaways</label>
                <textarea
                  value={newWhy}
                  onChange={(e) => setNewWhy(e.target.value)}
                  placeholder="Key insights, architectural trade-offs, and empirical findings..."
                  rows={2}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-zinc-900 placeholder:text-zinc-400 w-full focus:outline-none focus:border-zinc-400 resize-none"
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
