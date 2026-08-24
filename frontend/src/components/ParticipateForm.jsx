import React, { useState } from 'react';
import { Mic2, Send, Sparkles, CheckCircle2, AlertCircle, Users, Phone, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { API_ENDPOINTS } from '../config/api';

export default function ParticipateForm() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    year: '2nd Year',
    performance: 'Dance',
    performanceDetails: '',
    teamMembers: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const performanceOptions = [
    'Dance',
    'Singing',
    'Poetry',
    'Skit',
    'Standup Comedy',
    'Instrumental',
    'Mimicry',
    'Speech',
    'Hackathon Project Demo',
    'Technical Presentation',
    'Other'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_ENDPOINTS.PARTICIPATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
        // Trigger celebratory confetti burst
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setError(data.message || 'Failed to submit registration. Please try again.');
      }
    } catch (err) {
      setError('Unable to reach backend server. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="participate" className="py-24 relative bg-[#060913]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OPEN TO ALL CSE STUDENTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Want To <span className="gradient-gold">Perform / Participate?</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Showcase your talent or present your project in upcoming CSE department events. Solo and team submissions are welcome!
          </p>
        </div>

        {submitted ? (
          <div className="glass-panel-glow rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Registration Confirmed! 🎉</h3>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Thank you, <strong className="text-white">{formData.name}</strong>! Your registration for <strong className="text-amber-400">{formData.performance}</strong> has been logged in our department event management console.
            </p>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400 mb-6 text-left">
              <p className="mb-1"><span className="text-slate-500">Student:</span> {formData.name} ({formData.year})</p>
              <p className="mb-1"><span className="text-slate-500">Category:</span> {formData.performance}</p>
              <p className="mb-1"><span className="text-slate-500">Contact:</span> {formData.contact}</p>
              <p className="text-emerald-400 mt-2">✓ Synced to Admin Review Console</p>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '',
                  contact: '',
                  year: '2nd Year',
                  performance: 'Dance',
                  performanceDetails: '',
                  teamMembers: ''
                });
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono transition-colors"
            >
              + Submit Another Registration
            </button>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                    Your Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
                  />
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                    Contact (WhatsApp / Phone / Email) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact"
                    required
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210 or name@cse.edu"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Academic Year */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                    Academic Year <span className="text-rose-400">*</span>
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 text-white text-sm outline-none transition-all"
                  >
                    {years.map((y) => (
                      <option key={y} value={y} className="bg-slate-900 text-white">{y}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                    Performance / Submission Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    name="performance"
                    value={formData.performance}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 text-white text-sm outline-none transition-all"
                  >
                    {performanceOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900 text-white">{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  Act / Song / Presentation Details
                </label>
                <textarea
                  name="performanceDetails"
                  rows="2"
                  value={formData.performanceDetails}
                  onChange={handleChange}
                  placeholder="e.g. Solo acoustic performance / 5-min funny skit / Project demo on ML algorithms"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-blue-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                />
              </div>

              {/* Team Members */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  Team Members (If group submission)
                </label>
                <input
                  type="text"
                  name="teamMembers"
                  value={formData.teamMembers}
                  onChange={handleChange}
                  placeholder="e.g. Priya (Vocals), Rohan (Guitar), Sneha (Keyboard)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-blue-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Submitting Registration...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Performance Slot</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-[11px] text-slate-500 font-mono">
                Submissions are sent directly to the CSE Event Coordinators admin console.
              </p>

            </form>
          </div>
        )}

      </div>
    </section>
  );
}
