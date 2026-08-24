import React from 'react';
import { Terminal, Heart, ShieldCheck, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#05070f] border-t border-slate-900 py-12 text-slate-400 text-xs font-sans relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-mono font-bold text-xs">
                CSE
              </div>
              <span className="font-mono font-bold text-white text-base">Teachers' Day  2026</span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm mb-4 leading-relaxed">
              Organized by the Department of Computer Science & Engineering students to express heartfelt gratitude to our mentors, professors, and guides on 3rd September 2026.
            </p>
            <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Event Portal </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono text-white text-xs font-bold uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2">
              <li><a href="#hero" className="hover:text-white transition-colors">Home & Countdown</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">Tribute & Mentors</a></li>
              <li><a href="#schedule" className="hover:text-white transition-colors">Program Schedule</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Event Gallery</a></li>
              <li><a href="#participate" className="hover:text-white transition-colors">Register Performance</a></li>
            </ul>
          </div>

          {/* Admin & Department Portal */}
          <div>
            <h4 className="font-mono text-white text-xs font-bold uppercase tracking-wider mb-3">Organizers</h4>
            <ul className="space-y-2 mb-4">
              <li><span className="text-slate-300 font-medium">CSE Event Committee 2026</span></li>
              <li><span>To Be Announced</span></li>
              <li><span>Event Date: 3rd September 2026</span></li>
            </ul>
            <a
              href="https://teachers-day-backend.onrender.com/auth/login"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-[11px] font-mono"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Admin Portal
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[11px] font-mono text-center sm:text-left">
            © 2026 Department of Computer Science & Engineering. Built with <Heart className="w-3 h-3 text-rose-500 inline mx-0.5" /> by CSE Students.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[11px] font-mono transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
