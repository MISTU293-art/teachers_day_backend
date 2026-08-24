import React, { useState, useEffect } from 'react';
import { Terminal, Calendar, Sparkles, Image, Mic2, ShieldCheck, Menu, X, Layers, Award } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero', icon: Terminal },
    { name: 'All Programs', href: '#programs', icon: Layers },
    { name: 'Schedule', href: '#schedule', icon: Calendar },
    { name: 'About CSE', href: '#about', icon: Award },
    { name: 'Gallery', href: '#gallery', icon: Image },
    { name: 'Register', href: '#participate', icon: Mic2 },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#060913]/95 backdrop-blur-md border-b border-slate-800/80 shadow-2xl py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand */}
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold tracking-tight text-white text-base sm:text-lg">
                  CSE<span className="text-blue-400">.Events</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  DEPT HUB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans tracking-wide">Dept. of Computer Science & Engineering</p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/70 p-1.5 rounded-full border border-slate-800/80 backdrop-blur-md">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
              >
                <item.icon className="w-3.5 h-3.5 text-blue-400" />
                {item.name}
              </a>
            ))}
          </div>

          {/* Action Button & Admin Login */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="#participate"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/30 transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <Mic2 className="w-3.5 h-3.5" />
              Join / Perform
            </a>

            <a
              href="http://localhost:3000/auth/login"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:text-white transition-all flex items-center gap-1.5"
              title="Admin & SuperAdmin Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Admin Portal
            </a>
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <a
              href="http://localhost:3000/auth/login"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-xs"
              title="Admin Portal"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl animate-fadeIn">
            <div className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80"
                >
                  <item.icon className="w-4 h-4 text-blue-400" />
                  {item.name}
                </a>
              ))}
              <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                <a
                  href="#participate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600"
                >
                  Join / Register Performance
                </a>
                <a
                  href="http://localhost:3000/auth/login"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700"
                >
                  Admin Portal Login
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </nav>
  );
}
