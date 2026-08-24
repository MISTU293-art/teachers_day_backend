import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Sparkles, ChevronRight, Terminal, Code2, Layers, Clock, AlertCircle } from 'lucide-react';

export default function Hero() {
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetch('http://localhost:3000/api/programs/featured')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setFeaturedEvent(data.data);
        }
      })
      .catch(err => {
        console.warn('Backend connection note:', err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!featuredEvent || !featuredEvent.eventDate) return;

    // Parse date if possible
    let targetDate = null;
    const parsed = Date.parse(featuredEvent.eventDate);
    if (!isNaN(parsed)) {
      targetDate = new Date(parsed);
    } else {
      // If natural format like "3rd September 2026", normalize
      const cleanDateStr = featuredEvent.eventDate.replace(/(st|nd|rd|th)/i, '');
      const d = Date.parse(cleanDateStr);
      if (!isNaN(d)) targetDate = new Date(d);
    }

    if (!targetDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [featuredEvent]);

  return (
    <section id="hero" className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden bg-grid-pattern">
      
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-blue-500/30 text-blue-400 text-xs sm:text-sm font-mono mb-6 backdrop-blur-md animate-float">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>CSE DEPARTMENT • EVENT & PROGRAM MANAGEMENT HUB</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Department of <br className="hidden sm:inline" />
            <span className="gradient-text">Computer Science & Engineering</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-8 font-normal leading-relaxed">
            Centralized portal for all CSE department programs, celebrations, technical hackathons, cultural events, and workshops. All schedules and photos are updated live by department administrators.
          </p>

          {/* Featured Event Card (If added in backend) */}
          {featuredEvent ? (
            <div className="glass-panel-glow rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto mb-10 border border-blue-500/30 text-left">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Featured Program
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-mono">
                  {featuredEvent.category}
                </span>
              </div>
              
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-1.5">{featuredEvent.title}</h3>
              {featuredEvent.shortDescription && (
                <p className="text-xs sm:text-sm text-slate-400 mb-3">{featuredEvent.shortDescription}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-slate-300 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Calendar className="w-3.5 h-3.5" /> {featuredEvent.eventDate}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> {featuredEvent.eventTime}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <MapPin className="w-3.5 h-3.5" /> {featuredEvent.venue}
                </span>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-4 max-w-xl mx-auto mb-8 border border-slate-800 text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Programs and event schedules added from the Admin Portal will appear here live.</span>
            </div>
          )}

          {/* Countdown Timer (If active target date exists) */}
          {(timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0) && (
            <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-xl mx-auto mb-10">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds },
              ].map((unit, idx) => (
                <div key={idx} className="glass-panel rounded-2xl p-3 sm:p-4 text-center border border-slate-800 hover:border-blue-500/40 transition-colors">
                  <div className="text-2xl sm:text-4xl font-mono font-bold text-white mb-1">
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-mono">
                    {unit.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#programs"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-sm sm:text-base shadow-xl shadow-blue-600/30 hover:scale-105 transition-all flex items-center justify-center gap-2 group"
            >
              <Layers className="w-4 h-4" />
              <span>View Department Programs</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#participate"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
            >
              <span>Submit Participation / Performance</span>
            </a>
          </div>

        </div>

        {/* Code Terminal Mock */}
        <div className="mt-14 max-w-3xl mx-auto rounded-2xl glass-panel border border-slate-800 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">cse_department_events.js</span>
            </div>
            <span className="text-[11px] font-mono text-blue-400 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5" /> Node.js • Live Backend API
            </span>
          </div>

          <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed overflow-x-auto">
            <p><span className="text-purple-400">const</span> <span className="text-blue-400">cseEvents</span> = <span className="text-purple-400">await</span> fetch(<span className="text-emerald-300">"/api/programs"</span>);</p>
            <p className="mt-1 text-slate-400"><span className="text-slate-500">// Connected to Admin Portal:</span> Programs &amp; schedules are updated dynamically.</p>
            <p className="mt-1 text-emerald-400"><span className="text-slate-500">// Status:</span> Operational (Ready for all departmental events &amp; celebrations)</p>
          </div>
        </div>

      </div>
    </section>
  );
}
