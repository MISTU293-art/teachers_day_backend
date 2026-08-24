import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Sparkles, Calendar, Layers } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

export default function Schedule() {
  const [activeProgram, setActiveProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_ENDPOINTS.FEATURED_PROGRAM)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setActiveProgram(data.data);
        }
      })
      .catch(err => {
        console.warn('Schedule fetch note:', err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const agenda = activeProgram && Array.isArray(activeProgram.agenda) ? activeProgram.agenda : [];

  return (
    <section id="schedule" className="py-24 relative bg-[#060913]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>EVENT ITINERARY &amp; TIMELINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Program <span className="gradient-text">Schedule</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            {activeProgram 
              ? `Schedule for ${activeProgram.title} (${activeProgram.eventDate})`
              : 'Detailed schedule and timeline of department events published live by coordinators.'}
          </p>
        </div>

        {/* Timeline Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-xs font-mono">Loading itinerary...</p>
          </div>
        ) : agenda.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agenda.map((slot, idx) => (
              <div
                key={idx}
                className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-indigo-500/40 transition-all hover:-translate-y-1 relative overflow-hidden group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {slot.time}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">Slot #{idx + 1}</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug mb-2">{slot.activity}</h3>
                  {slot.speakerOrPerformer && (
                    <p className="text-xs text-indigo-400 font-mono mb-2">By: {slot.speakerOrPerformer}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span className="truncate">{slot.location || activeProgram.venue || 'Auditorium'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-10 text-center max-w-lg mx-auto border border-slate-800">
            <Clock className="w-10 h-10 text-indigo-400/60 mx-auto mb-3" />
            <h4 className="text-white font-bold text-base mb-1">No Schedule Published Yet</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              When department coordinators publish an event schedule with time slots, it will display here automatically.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}