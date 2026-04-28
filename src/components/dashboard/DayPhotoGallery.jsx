import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DayPhotoGallery({ entries }) {
  const [lightbox, setLightbox] = useState(null);

  const photos = entries
    .filter(e => e.image_url)
    .map(e => ({ url: e.image_url, name: e.food_name, calories: e.calories }));

  if (photos.length === 0) return null;

  return (
    <>
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Today's Food Photos</span>
          <span className="ml-auto text-xs text-muted-foreground">{photos.length} item{photos.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setLightbox(p)}
              className="relative aspect-square rounded-xl overflow-hidden bg-muted group"
            >
              <img
                src={p.url}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 text-white"
              onClick={() => setLightbox(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              src={lightbox.url}
              alt={lightbox.name}
              className="max-w-full max-h-[70vh] rounded-2xl object-contain"
              onClick={e => e.stopPropagation()}
            />
            <div className="mt-4 text-center text-white">
              <p className="font-semibold">{lightbox.name}</p>
              {lightbox.calories > 0 && (
                <p className="text-sm text-white/70">{lightbox.calories} kcal</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}