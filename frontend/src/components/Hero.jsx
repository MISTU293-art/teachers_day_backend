import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Sparkles, ChevronRight, Terminal, Heart, Code2, Music } from 'lucide-react';

export default function Hero() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Target event: September 3, 2026, 10:30 AM
    const targetDate = new Date('2026-09-03T10:30:00');

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
  }, []);

  return (
    <section id="hero" className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden bg-grid-pattern">
      
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-blue-500/30 text-blue-400 text-xs sm:text-sm font-mono mb-6 backdrop-blur-md animate-float">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>CSE Department Annual Gala • 3rd September 2026</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Honoring The <br className="hidden sm:inline" />
            <span className="gradient-text">Architects Of Our Code</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Every breakthrough algorithm begins with a great mentor. Join the Computer Science & Engineering department on <strong className="text-white">3rd September</strong> as we celebrate our respected professors and guides.
          </p>

          {/* Event Quick Meta */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-12 text-xs sm:text-sm font-mono text-slate-300">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>3rd September 2026 • 10:30 AM</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>CSE Main Auditorium (Hall 302)</span>
            </div>
          </div>

          {/* Countdown Timer Cards */}
          <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-xl mx-auto mb-12">
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

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#participate"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-sm sm:text-base shadow-xl shadow-blue-600/30 hover:scale-105 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Register for Performance</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#gallery"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
            >
              <span>View Memories & Gallery</span>
            </a>
          </div>

        </div>

        {/* Code terminal mock */}
        <div className="mt-16 max-w-3xl mx-auto rounded-2xl glass-panel border border-slate-800 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">tribute_to_teachers.js</span>
            </div>
            <span className="text-[11px] font-mono text-blue-400 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5" /> Node.js 26
            </span>
          </div>

          <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed overflow-x-auto">
            <p><span className="text-purple-400">const</span> <span className="text-blue-400">teachersDay</span> = <span className="text-purple-400">new</span> <span className="text-amber-300">Celebration</span>({'{'}</p>
            <p className="pl-4"><span className="text-slate-400">date:</span> <span className="text-emerald-300">"September 3, 2026"</span>,</p>
            <p className="pl-4"><span className="text-slate-400">department:</span> <span className="text-emerald-300">"Computer Science & Engineering"</span>,</p>
            <p className="pl-4"><span className="text-slate-400">mentors:</span> [<span className="text-emerald-300">"Guiding Light"</span>, <span className="text-emerald-300">"Problem Solvers"</span>, <span className="text-emerald-300">"Life Debuggers"</span>],</p>
            <p className="pl-4"><span className="text-slate-400">ourPromise:</span> () =&gt; {'{'}</p>
            <p className="pl-8 text-blue-300">console.log(<span className="text-amber-300">"Thank you for compiling our dreams into reality! ❤️"</span>);</p>
            <p className="pl-4">{'}'}</p>
            <p>{'}'});</p>
            <p className="mt-2 text-emerald-400"><span className="text-slate-500">// Output:</span> SUCCESS (0 errors, infinite gratitude)</p>
          </div>
        </div>

      </div>
    </section>
  );
}
