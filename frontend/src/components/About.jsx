import React from 'react';
import { Cpu, Bug, Lightbulb, Compass, Award, Quote } from 'lucide-react';

export default function About() {
  const pillars = [
    {
      icon: Cpu,
      title: 'Architects of Logic',
      desc: 'Teaching us how to break down monumental real-world challenges into elegant, structured algorithms.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Bug,
      title: 'Debugging Our Doubts',
      desc: 'Patiently sitting with us through stack traces, syntax errors, and conceptual hurdles until light dawned.',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: Lightbulb,
      title: 'Fueling Innovation',
      desc: 'Pushing our boundaries into AI, Cloud, Distributed Systems, and emerging technologies beyond textbooks.',
      color: 'from-amber-500 to-yellow-500'
    },
    {
      icon: Compass,
      title: 'Life Mentorship',
      desc: 'Guiding our career paths, ethical principles, and personal growth with unending wisdom and care.',
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  return (
    <section id="about" className="py-24 relative bg-[#070b16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>HONORING EXCELLENCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Why We Celebrate On <span className="gradient-text">3rd September</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            In the fast-paced world of computer science, code syntax updates every season, but the wisdom, critical thinking, and perseverance instilled by our teachers stay with us for a lifetime.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${p.color} flex items-center justify-center text-white mb-5 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform`}>
                <p.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Featured Quote Banner */}
        <div className="glass-panel-glow rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Quote className="w-64 h-64 text-blue-400" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-widest mb-3">
              <Quote className="w-4 h-4" /> Message from Students
            </div>
            <blockquote className="text-lg sm:text-2xl font-medium text-white italic leading-relaxed mb-6">
              "A teacher doesn't just show you how to write code; they teach you how to think, how to question, and how to engineer solutions that change the world."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-mono font-bold text-white text-xs">
                CSE
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Computer Science & Engineering Student Council</div>
                <div className="text-slate-400 text-xs font-mono">Teachers' Day Organizing Committee 2026</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
