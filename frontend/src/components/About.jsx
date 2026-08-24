import React from 'react';
import { Cpu, Bug, Lightbulb, Compass, Award, Quote, Code2, Users, Rocket } from 'lucide-react';

export default function About() {
  const pillars = [
    {
      icon: Cpu,
      title: 'Technical Excellence',
      desc: 'Fostering cutting-edge engineering skills across algorithms, cloud architectures, AI, and distributed systems.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Lightbulb,
      title: 'Hackathons & Innovation',
      desc: 'Encouraging students to build impactful software solutions through department coding sprints and technical challenges.',
      color: 'from-amber-500 to-yellow-500'
    },
    {
      icon: Users,
      title: 'Department Celebrations',
      desc: 'Uniting students and faculty through Teachers\' Day galas, Freshers\' inductions, farewells, and cultural festivals.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Rocket,
      title: 'Mentorship & Guidance',
      desc: 'Deep mentorship from experienced professors nurturing students from their first line of code to industry careers.',
      color: 'from-rose-500 to-pink-500'
    }
  ];

  return (
    <section id="about" className="py-24 relative bg-[#070b16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>CSE DEPARTMENT COMMUNITY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Empowering Innovation &amp; <span className="gradient-text">Community</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            The Computer Science &amp; Engineering department is dedicated to building both technical mastery and a vibrant community of passionate engineers.
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

        {/* Department Info Banner */}
        <div className="glass-panel-glow rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest mb-3">
              <Code2 className="w-4 h-4" /> Department Vision
            </div>
            <blockquote className="text-lg sm:text-2xl font-medium text-white italic leading-relaxed mb-6">
              "Fostering curiosity, ethical engineering, and collaborative spirit through every event, seminar, and celebration we organize."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-mono font-bold text-white text-xs">
                CSE
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Department of Computer Science &amp; Engineering</div>
                <div className="text-slate-400 text-xs font-mono">Event Coordination &amp; Student Welfare Committee</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
