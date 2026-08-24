import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, X, Maximize2, ExternalLink, RefreshCw, UploadCloud, Sparkles } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [filterTag, setFilterTag] = useState('all');

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.GALLERY);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setImages(data.data);
        } else {
          setImages([]);
        }
      } else {
        setImages([]);
      }
    } catch (err) {
      console.warn('Gallery API note:', err.message);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const allTags = ['all', ...Array.from(new Set(images.flatMap(img => img.tags || [])))];

  const filteredImages = filterTag === 'all' 
    ? images 
    : images.filter(img => img.tags && img.tags.includes(filterTag));

  return (
    <section id="gallery" className="py-24 relative bg-[#060913]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-4">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>OFFICIAL EVENT GALLERY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Event <span className="gradient-cyan">Memories</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl">
              High-resolution photo highlights uploaded by department coordinators via ImageKit.io CDN.
            </p>
          </div>

          {/* Tag filters & refresh button */}
          <div className="flex items-center gap-2 flex-wrap">
            {allTags.length > 1 && allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono capitalize transition-all ${
                  filterTag === tag
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                #{tag}
              </button>
            ))}

            <button
              onClick={fetchGallery}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Gallery from API"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Image Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm font-mono">Fetching images from ImageKit CDN...</p>
          </div>
        ) : filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((img) => (
              <div
                key={img._id}
                onClick={() => setActiveImage(img)}
                className="group glass-panel rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer shadow-lg"
              >
                <div className="relative h-64 overflow-hidden bg-slate-950">
                  <img
                    src={img.imageUrl}
                    alt={img.title || 'Event photo'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-90 transition-opacity flex items-end p-5">
                    <div className="text-white">
                      <p className="text-xs font-mono text-cyan-400 mb-1">Click to expand</p>
                      <h4 className="font-bold text-sm leading-tight">{img.title}</h4>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-bold text-white text-sm mb-1 truncate">{img.title}</h4>
                  {img.description && (
                    <p className="text-xs text-slate-400 truncate mb-2">{img.description}</p>
                  )}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
                    <span>{new Date(img.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="text-cyan-400 flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" /> View Full
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-12 text-center max-w-xl mx-auto border border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Photos Uploaded Yet</h3>
            <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
              Official photos uploaded by department coordinators via ImageKit CDN will appear here.
            </p>
            <a
              href={API_ENDPOINTS.ADMIN_GALLERY_UPLOAD}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors"
            >
              <UploadCloud className="w-4 h-4" /> Upload Photos in Admin Portal
            </a>
          </div>
        )}

        {/* Full Image Modal Lightbox */}
        {activeImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
            onClick={() => setActiveImage(null)}
          >
            <div
              className="relative max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveImage(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={activeImage.imageUrl}
                  alt={activeImage.title}
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>

              <div className="p-6 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{activeImage.title}</h3>
                  <p className="text-xs text-slate-400">{activeImage.description || 'CSE Department Event Photo'}</p>
                </div>
                <a
                  href={activeImage.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 self-start sm:self-auto transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Full Resolution
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
