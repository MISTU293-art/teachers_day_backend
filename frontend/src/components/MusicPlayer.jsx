import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, Volume2, VolumeX, Disc3 } from 'lucide-react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const audioRef = useRef(null);

  // Curated royalty-free tracks for celebration vibes
  const playlist = [
    {
      title: 'Guru Brahma Tribute Flute Melody',
      artist: 'Spiritual Acoustic Medley',
      src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=meditation-flute-22268.mp3'
    },
    {
      title: 'Acoustic Joy & Celebration',
      artist: 'Uplifting Folk Strings',
      src: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=acoustic-guitar-loop-f-91bpm-121544.mp3'
    },
    {
      title: 'CSE Late Night Lo-Fi Beats',
      artist: 'Chill Code Ambience',
      src: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=lofi-study-112191.mp3'
    }
  ];

  const currentTrack = playlist[currentTrackIndex];

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Audio autoplay prevented:', e);
      });
    }
  };

  const nextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIdx);
    setIsPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 100);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm">
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onEnded={nextTrack}
        preload="none"
      />

      <div className="glass-panel-glow p-3 sm:p-4 rounded-2xl border border-blue-500/30 shadow-2xl backdrop-blur-xl flex items-center gap-3">
        
        {/* Vinyl Disc Icon */}
        <div 
          onClick={togglePlay}
          className="relative cursor-pointer group shrink-0"
        >
          <div className={`w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
            <Disc3 className="w-6 h-6" />
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
          </div>
        </div>

        {/* Track details */}
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold">Tribute Audio</span>
          </div>
          <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
          <p className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={nextTrack}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={toggleMute}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors hidden sm:flex"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
}
