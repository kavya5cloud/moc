import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { getGalleryImages } from '../services/data';
import type { GalleryImage } from '../types';

const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  useEffect(() => {
    getGalleryImages().then(setImages);
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-6 pb-20">
        <div className="mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
            Gallery
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
            Photographs from the Museum of Contemporary Art Gandhinagar –
            spaces, installations, and visitors.
          </p>
        </div>

        {images.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-400 font-bold uppercase tracking-widest">
            No gallery images yet. Add images in the Admin → Gallery tab.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => setSelected(image)}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
              >
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-left">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/80 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Gallery
                    </p>
                    <p className="text-sm md:text-base font-bold text-white line-clamp-2">
                      {image.title}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                      Gallery View
                    </p>
                    <p className="text-sm font-bold tracking-tight">
                      {selected.title}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-black">
                <img
                  src={selected.imageUrl}
                  alt={selected.title}
                  className="w-full max-h-[70vh] object-contain bg-black"
                />
              </div>
              {selected.description && (
                <div className="px-6 py-4 text-sm text-gray-600">
                  {selected.description}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;

