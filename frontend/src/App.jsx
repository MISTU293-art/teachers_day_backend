import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Programs from './components/Programs';
import Schedule from './components/Schedule';
import About from './components/About';
import Gallery from './components/Gallery';
import ParticipateForm from './components/ParticipateForm';
import MusicPlayer from './components/MusicPlayer';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-blue-500 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Programs />
        <Schedule />
        <About />
        <Gallery />
        <ParticipateForm />
      </main>
      <MusicPlayer />
      <Footer />
    </div>
  );
}
