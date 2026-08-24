import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Sparkles, Calendar, Layers, RefreshCw, CalendarPlus, UserCheck } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

export default function Schedule() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchScheduleData = () => {
    setLoading(true);
    fetch(API_ENDPOINTS.PROGRAMS)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setPrograms(data.data);
          // Default to featured program or first program
          const featured = data.data.find(p => p.isFeatured) || data.data[0];
          setSelectedProgramId(prevId => prevId || featured._id);
        } else {
          setPrograms([]);
          setSelectedProgramId(null);
        }
      })
      .catch(err => {
        console.warn('Schedule backend connection note:', err.message);
        setPrograms([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const currentProgram = programs.find(p => p._id === selectedProgramId) || programs[0] || null;
  const agenda = currentProgram && Array.isArray(currentProgram.agenda) ? currentProgram.agenda : [];

  return (
    <section id="schedule" className="py-24 relative bg-[#060913]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-4">
              <Clock className="w-3.5 h-3.5" />
              <span>LIVE BACKEND SYNCED ITINERARY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Program <span className="gradient-text">Schedule &amp; Timelines</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl">
              Live department event schedules, time slots, and activities synchronized directly from the Node.js backend.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={fetchScheduleData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-mono transition-colors"
              title="Re-fetch from backend API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Sync Schedule</span>
            </button>
          </div>
        </div>

        {/* Program Selector Tabs (If multiple programs exist) */}
        {programs.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {programs.map(prog => (
              <button
                key={prog._id}
                onClick={() => setSelectedProgramId(prog._id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedProgramId === prog._id
                    ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{prog.title}</span>
                {prog.isFeatured && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Featured" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Selected Program Meta Highlight */}
        {currentProgram && (
          <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-8 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-semibold">
                  {currentProgram.category}
                </span>
                <span className="text-xs font-mono text-slate-400">• {currentProgram.eventDate}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{currentProgram.title}</h3>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Clock className="w-3.5 h-3.5" /> {currentProgram.eventTime}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <MapPin className="w-3.5 h-3.5" /> {currentProgram.venue}
              </span>
            </div>
          </div>
        )}

        {/* Timeline Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-xs font-mono">Fetching schedule from Node.js backend...</p>
          </div>
        ) : agenda.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agenda.map((slot, idx) => (
              <div
                key={idx}
                className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-indigo-500/40 transition-all hover:-translate-y-1 relative overflow-hidden group flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {slot.time}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">Slot #{idx + 1}</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug mb-2 group-hover:text-indigo-400 transition-colors">
                    {slot.activity}
                  </h3>

                  {slot.speakerOrPerformer && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-2">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{slot.speakerOrPerformer}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span className="truncate">{slot.location || (currentProgram && currentProgram.venue) || 'Auditorium'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto border border-slate-800">
            <Clock className="w-12 h-12 text-indigo-400/50 mx-auto mb-3" />
            <h4 className="text-white font-bold text-base mb-1">No Schedule Slots Published Yet</h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-5">
              When department coordinators publish an event schedule with time slots from the Admin Portal, they will appear here in real-time.
            </p>
            <a
              href={API_ENDPOINTS.ADMIN_PROGRAM_CREATE}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              <CalendarPlus className="w-3.5 h-3.5" /> Add Schedule in Admin Portal
            </a>
          </div>
        )}

      </div>
    </section>
  );
}