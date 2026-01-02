/**
 * Presentation Mode
 * Fullscreen presentation with keyboard navigation
 */

import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DeckRenderer } from './DeckRenderer';

interface PresentationModeProps {
  content: string;
  currentSlide: number;
  totalSlides: number;
  onSlideChange: (slide: number) => void;
  onClose: () => void;
}

export function PresentationMode({
  content,
  currentSlide,
  totalSlides,
  onSlideChange,
  onClose,
}: PresentationModeProps) {
  const goToPrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      onSlideChange(currentSlide - 1);
    }
  }, [currentSlide, onSlideChange]);

  const goToNextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      onSlideChange(currentSlide + 1);
    }
  }, [currentSlide, totalSlides, onSlideChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          goToPrevSlide();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          goToNextSlide();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Home':
          e.preventDefault();
          onSlideChange(0);
          break;
        case 'End':
          e.preventDefault();
          onSlideChange(totalSlides - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevSlide, goToNextSlide, onClose, onSlideChange, totalSlides]);

  // Request fullscreen on mount
  useEffect(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {
        // Fullscreen not supported or user denied
      });
    }

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white/50 hover:text-white transition-colors"
        title="Fermer (Échap)"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation buttons */}
      <button
        onClick={goToPrevSlide}
        disabled={currentSlide === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        title="Slide précédente (←)"
      >
        <ChevronLeft className="h-10 w-10" />
      </button>

      <button
        onClick={goToNextSlide}
        disabled={currentSlide === totalSlides - 1}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        title="Slide suivante (→)"
      >
        <ChevronRight className="h-10 w-10" />
      </button>

      {/* Slide counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-white/50 text-sm">
        {currentSlide + 1} / {totalSlides}
      </div>

      {/* Slide content */}
      <DeckRenderer 
        content={content} 
        currentSlide={currentSlide}
        className="h-full"
      />
    </div>
  );
}

export default PresentationMode;
