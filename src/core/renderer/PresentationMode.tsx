/**
 * Presentation Mode
 * Fullscreen presentation with keyboard navigation
 */

import { useEffect, useCallback, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { parseDeckDocument } from '../parser/deckParser';
import { getTheme, generateThemeCSS } from '../themes/themes';
import { SlideBlockRenderer } from './components/SlideBlockRenderer';

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
    if (currentSlide < totalSlides) {
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
          onSlideChange(totalSlides);
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
      elem.requestFullscreen().catch(() => {});
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
        title="Close (Escape)"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation buttons */}
      <button
        onClick={goToPrevSlide}
        disabled={currentSlide === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        title="Previous slide (←)"
      >
        <ChevronLeft className="h-10 w-10" />
      </button>

      <button
        onClick={goToNextSlide}
        disabled={currentSlide === totalSlides}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        title="Next slide (→)"
      >
        <ChevronRight className="h-10 w-10" />
      </button>

      {/* Slide counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-white/50 text-sm">
        {currentSlide === 0 ? 'Intro' : `${currentSlide} / ${totalSlides}`}
      </div>

      {/* Slide content */}
      <FullscreenSlide content={content} currentSlide={currentSlide} />
    </div>
  );
}

function FullscreenSlide({ content, currentSlide }: { content: string; currentSlide: number }) {
  const doc = useMemo(() => {
    try {
      return parseDeckDocument(content);
    } catch (e) {
      return null;
    }
  }, [content]);

  if (!doc || doc.slides.length === 0) {
    return null;
  }

  const theme = getTheme(doc.theme);
  const themeCSS = generateThemeCSS(theme);
  
  const isIntroSlide = currentSlide === 0;
  const slideIndex = currentSlide - 1;
  const slide = isIntroSlide ? null : doc.slides[slideIndex];

  return (
    <div 
      className="h-full w-full"
      style={{ 
        '--background': theme.colors.background,
        '--foreground': theme.colors.foreground,
        '--primary': theme.colors.primary,
        '--primary-foreground': theme.colors.primaryForeground,
        '--secondary': theme.colors.secondary,
        '--muted': theme.colors.muted,
        '--muted-foreground': theme.colors.mutedForeground,
        '--card': theme.colors.card,
        '--border': theme.colors.border,
        fontFamily: theme.fontFamily,
      } as React.CSSProperties}
    >
      <style>{`.fullscreen-slide { ${themeCSS} }`}</style>
      
      {isIntroSlide ? (
        <div className="fullscreen-slide relative h-full w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col items-center justify-center">
          <DeckLogo logo={doc.logo} />
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center text-[hsl(var(--primary))] px-8">
            {doc.title}
          </h1>
          <p className="text-xl text-[hsl(var(--muted-foreground))] mt-6">
            {doc.slides.length} slides
          </p>
        </div>
      ) : slide ? (
        <div className="fullscreen-slide relative h-full w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col">
          <DeckLogo logo={doc.logo} />
          {/* Slide title */}
          <div className="px-12 pt-8 pb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))]">
              {slide.title}
            </h1>
          </div>
          
          {/* Slide content */}
          <div className="flex-1 px-12 pb-8 overflow-auto">
            <div className="w-full max-w-5xl space-y-4">
              {slide.content.map((block, index) => (
                <SlideBlockRenderer key={index} block={block} scale="fullscreen" />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function isProbablyUrl(value: string) {
  return /^(https?:\/\/|data:image\/)/i.test(value.trim());
}

function DeckLogo({ logo }: { logo?: string }) {
  if (!logo) return null;

  return (
    <div className="absolute top-6 right-8 z-10">
      {isProbablyUrl(logo) ? (
        <img
          src={logo}
          alt="Logo"
          className="h-10 md:h-12 w-auto object-contain"
          loading="lazy"
        />
      ) : (
        <div className="text-[hsl(var(--muted-foreground))] font-semibold text-xl">
          {logo}
        </div>
      )}
    </div>
  );
}

export default PresentationMode;
