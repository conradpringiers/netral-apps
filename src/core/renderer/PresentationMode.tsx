/**
 * Presentation Mode
 * Fullscreen presentation with keyboard navigation and smooth transitions
 */

import { useEffect, useCallback, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToPrevSlide = useCallback(() => {
    if (currentSlide > 0 && !isTransitioning) {
      setSlideDirection('left');
      setIsTransitioning(true);
      setTimeout(() => {
        onSlideChange(currentSlide - 1);
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentSlide, onSlideChange, isTransitioning]);

  const goToNextSlide = useCallback(() => {
    if (currentSlide < totalSlides && !isTransitioning) {
      setSlideDirection('right');
      setIsTransitioning(true);
      setTimeout(() => {
        onSlideChange(currentSlide + 1);
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentSlide, totalSlides, onSlideChange, isTransitioning]);

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
      {/* Navigation pill - bottom left */}
      <div
        className="absolute bottom-6 left-6 z-50 flex items-center bg-white/10 backdrop-blur-sm rounded-full transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left arrow - visible on hover */}
        <button
          onClick={goToPrevSlide}
          disabled={currentSlide === 0}
          className={`p-2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 ${
            isHovered ? 'opacity-100 w-8' : 'opacity-0 w-0 overflow-hidden'
          }`}
          title="Previous slide (←)"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Slide number */}
        <span className="px-3 py-2 text-white/80 text-sm font-medium min-w-[3rem] text-center">
          {currentSlide === 0 ? 'Intro' : `${currentSlide}/${totalSlides}`}
        </span>

        {/* Right arrow - visible on hover */}
        <button
          onClick={goToNextSlide}
          disabled={currentSlide === totalSlides}
          className={`p-2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 ${
            isHovered ? 'opacity-100 w-8' : 'opacity-0 w-0 overflow-hidden'
          }`}
          title="Next slide (→)"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Slide content with transition */}
      <div
        className={`h-full w-full transition-all duration-300 ease-out ${
          isTransitioning
            ? slideDirection === 'right'
              ? 'opacity-80 translate-x-3'
              : 'opacity-80 -translate-x-3'
            : 'opacity-100 translate-x-0'
        }`}
      >
        <FullscreenSlide content={content} currentSlide={currentSlide} />
      </div>
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
          <h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-center text-[hsl(var(--primary))] px-8"
            style={{ fontFamily: theme.headingFontFamily }}
          >
            {doc.title}
          </h1>
          <p className="text-2xl text-[hsl(var(--muted-foreground))] mt-6">
            {doc.slides.length} slides
          </p>
        </div>
      ) : slide ? (
        <div className="fullscreen-slide relative h-full w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col items-center">
          <DeckLogo logo={doc.logo} />
          {/* Slide title with separator */}
          <div className="w-full max-w-7xl px-12 pt-10 pb-6">
            <h1 
              className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))]"
              style={{ fontFamily: theme.headingFontFamily }}
            >
              {slide.title}
            </h1>
            <hr className="mt-4 border-t border-[hsl(var(--border))]" />
          </div>
          
          {/* Slide content */}
          <div className="flex-1 w-full max-w-7xl px-12 pb-10 overflow-auto">
            <div className="w-full space-y-6">
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
