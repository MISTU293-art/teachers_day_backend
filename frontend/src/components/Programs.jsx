import React, { useState, useEffect } from 'react';
import { Layers, Calendar, Clock, MapPin, Tag, ArrowUpRight, Sparkles, RefreshCw, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedProgramId, setExpandedProgramId] = useState(null);

  const categories = [
    'All',
    'Celebration',
    'Hackathon',
    'Workshop',
    'Technical Fest',
    'Cultural',
    'Seminar & Keynote',
    'Orientation & Freshers',
    'Farewell',
    'Coding Contest'
  ];

  const fetchPrograms = () => {
    setLoading(true);
    fetch(API_ENDPOINTS.PROGRAMS)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setPrograms(data.data);
        } else {
          setPrograms([]);
        }
      })
      .catch(err => {
        console.warn('Programs fetch notice:', err.message);
        setPrograms([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const filteredPrograms = selectedCategory === 'All'
    ? programs
    : programs.filter(p => p.category === selectedCategory);

  const toggleExpand = (id) => {
    setExpandedProgramId(expandedProgramId === id ? null : id);
  };

  return (
    <section id="programs" className="py-24 relative bg-[#070b16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-4">
              <Layers className="w-3.5 h-3.5" />
              <span>DEPARTMENT EVENTS &amp; INITIATIVES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              All Department <span className="gradient-text">Programs</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl">
              Browse all scheduled CSE events, celebrations, technical hackathons, seminars, and cultural meets.
            </p>
          </div>

          <button
            onClick={fetchPrograms}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-mono transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span>Refresh Schedules</span>
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Programs Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm font-mono">Loading schedules from backend...</p>
          </div>
        ) : filteredPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((p) => {
              const isExpanded = expandedProgramId === p._id;
              return (
                <div
                  key={p._id}
                  className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono font-semibold">
                        {p.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {p.isFeatured && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Featured
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                          p.status === 'Upcoming' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {p.title}
                    </h3>

                    {/* Description */}
                    {p.shortDescription && (
                      <p className="text-xs text-slate-400 mb-4 line-clamp-2">{p.shortDescription}</p>
                    )}

                    {/* Meta info */}
                    <div className="space-y-2 text-xs font-mono text-slate-300 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{p.eventDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{p.eventTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{p.venue}</span>
                      </div>
                    </div>

                    {/* Agenda Expansion Toggle */}
                    {p.agenda && p.agenda.length > 0 && (
                      <div className="mb-4">
                        <button
                          onClick={() => toggleExpand(p._id)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                        >
                          <span>Itinerary / Agenda ({p.agenda.length} slots)</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
                            {p.agenda.map((slot, idx) => (
                              <div key={idx} className="flex items-start justify-between gap-2 border-b border-slate-900 pb-1.5 last:border-0 last:pb-0">
                                <span className="text-blue-400 shrink-0 font-semibold">{slot.time}</span>
                                <span className="text-slate-300 text-right">{slot.activity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">
                      Registration: <strong className="text-slate-300">{p.registrationStatus || 'Open'}</strong>
                    </span>
                    <a
                      href="#participate"
                      className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      <span>Participate</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-12 text-center max-w-xl mx-auto border border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Programs Scheduled Yet</h3>
            <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
              Programs and events added by department administrators will appear here in real-time.
            </p>
            <a
              href={API_ENDPOINTS.ADMIN_PROGRAM_CREATE}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Schedule First Program (Admin)
            </a>
          </div>
        )}

      </div>
    </section>
  );
}
