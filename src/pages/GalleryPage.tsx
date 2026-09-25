import React, { useState, useEffect } from 'react';
import { GalleryImageItem } from '../types';
import { galleryService } from '../services/gallery.service';
import { X, ZoomIn, Scissors } from 'lucide-react';
import { getImageUrl, handleImageError } from '../lib/images';

interface GalleryPageProps {
  onNavigate: (path: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigate }) => {
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalImage, setActiveModalImage] = useState<GalleryImageItem | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await galleryService.getAll(false);
        setImages(list);
      } catch (err) {
        console.error('Error loading gallery images:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
          Visual Showcase
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#F5F2EA]">
          Shop & Craftsmanship Gallery
        </h1>
        <p className="text-sm text-[#B8B5AE] leading-relaxed">
          A glimpse into the environment, precision shear work, and traditional grooming rituals at U.S. Barber in Catonsville.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-[#B8B5AE] text-sm">
          Loading gallery...
        </div>
      ) : images.length === 0 ? (
        <div className="py-24 text-center text-[#B8B5AE] text-sm">
          No gallery images published yet.
        </div>
      ) : (
        /* Responsive 2-col mobile, 3-col tablet, 4-col desktop */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => setActiveModalImage(img)}
              className="group relative aspect-[4/3] bg-[#1A1B1D] border border-[#2E3035] rounded overflow-hidden cursor-pointer hover:border-[#C5A059]/70 transition-all shadow-md"
            >
              <img
                src={getImageUrl(img.image_url)}
                alt={img.alt_text}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-[#121314]/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <span className="font-serif text-sm text-[#F5F2EA] leading-tight">
                  {img.title || 'U.S. Barber Craft'}
                </span>
                <span className="text-[11px] text-[#C5A059] mt-0.5 flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" /> Click to expand
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Lightbox */}
      {activeModalImage && (
        <div
          className="fixed inset-0 z-50 bg-[#121314]/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveModalImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-[#1A1B1D] border border-[#2E3035] rounded overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModalImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-[#121314]/80 text-[#F5F2EA] hover:text-[#C5A059] rounded-full border border-[#2E3035]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={getImageUrl(activeModalImage.image_url)}
              alt={activeModalImage.alt_text}
              className="w-full max-h-[70vh] object-contain bg-[#121314]"
              onError={handleImageError}
            />
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl text-[#F5F2EA]">
                  {activeModalImage.title || 'U.S. Barber'}
                </h3>
                <p className="text-xs text-[#B8B5AE] mt-1">{activeModalImage.alt_text}</p>
              </div>
              <button
                onClick={() => {
                  setActiveModalImage(null);
                  onNavigate('/book');
                }}
                className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs tracking-wider uppercase whitespace-nowrap"
              >
                BOOK THIS SERVICE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
