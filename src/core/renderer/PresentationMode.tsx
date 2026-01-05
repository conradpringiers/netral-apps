/**
 * Presentation Mode
 * Fullscreen presentation with keyboard navigation
 */

import { useEffect, useCallback, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { parseDeckDocument, SlideContent } from '../parser/deckParser';
import { getTheme, generateThemeCSS } from '../themes/themes';
import { renderMarkdown } from './markdownRenderer';

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
    // +1 for intro slide
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
          onSlideChange(totalSlides); // +1 for intro slide
          break;
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

      {/* Slide counter - adjusted for intro slide */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-white/50 text-sm">
        {currentSlide === 0 ? 'Intro' : `${currentSlide} / ${totalSlides}`}
      </div>

      {/* Slide content - fullscreen, no card wrapper */}
      <FullscreenSlide 
        content={content} 
        currentSlide={currentSlide}
      />
    </div>
  );
}

// Fullscreen slide renderer - takes entire screen without card wrapper
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
  
  // currentSlide === 0 is the intro slide
  const isIntroSlide = currentSlide === 0;
  const slide = isIntroSlide ? null : doc.slides[Math.min(currentSlide - 1, doc.slides.length - 1)];

  return (
    <div 
      className="h-full w-full"
      style={{ 
        // @ts-ignore
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
      <style>{`
        .fullscreen-slide { ${themeCSS} }
      `}</style>
      
      {isIntroSlide ? (
        // Intro slide with presentation title
        <div className="fullscreen-slide h-full w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center text-[hsl(var(--primary))] px-8">
            {doc.title}
          </h1>
          <p className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] mt-6">
            {doc.slides.length} slides
          </p>
        </div>
      ) : slide ? (
        <div className="fullscreen-slide h-full w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col">
          {/* Slide title at top left */}
          <div className="px-8 pt-6 pb-4 border-b border-[hsl(var(--border))]">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))]">
              {slide.title}
            </h1>
          </div>
          
          {/* Slide content - centered and responsive */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
            <div className="w-full max-w-5xl space-y-6">
              {slide.content.map((block, index) => (
                <FullscreenSlideBlock key={index} block={block} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FullscreenSlideBlock({ block }: { block: SlideContent }) {
  switch (block.type) {
    case 'markdown':
    case 'text':
      return (
        <div 
          className="prose prose-lg md:prose-xl max-w-none"
          style={{ color: 'hsl(var(--foreground))' }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }}
        />
      );
    
    case 'bigtitle':
      return (
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-[hsl(var(--primary))]">
          {block.content}
        </h2>
      );
    
    case 'image':
      return (
        <div className="flex justify-center">
          <img 
            src={block.content} 
            alt="Slide image" 
            className="max-h-[50vh] rounded-lg shadow-lg object-contain"
          />
        </div>
      );
    
    case 'column':
      const columns = block.props?.columns || [];
      return (
        <div className="grid md:grid-cols-2 gap-6">
          {columns.map((col: string, idx: number) => (
            <div 
              key={idx}
              className="p-6 bg-[hsl(var(--card))] rounded-lg prose prose-lg max-w-none"
              style={{ color: 'hsl(var(--foreground))' }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(col) }}
            />
          ))}
        </div>
      );
    
    case 'feature':
      const features = block.props?.items || [];
      return (
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((item: { icon: string; title: string; description: string }, idx: number) => (
            <div key={idx} className="text-center p-6 bg-[hsl(var(--card))] rounded-lg">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2 text-[hsl(var(--foreground))]">{item.title}</h3>
              <p className="text-[hsl(var(--muted-foreground))]">{item.description}</p>
            </div>
          ))}
        </div>
      );
    
    case 'stats':
      const stats = block.props?.items || [];
      return (
        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((item: { value: string; label: string }, idx: number) => (
            <div key={idx} className="text-center p-6">
              <div className="text-5xl md:text-6xl font-bold text-[hsl(var(--primary))] mb-2">
                {item.value}
              </div>
              <div className="text-[hsl(var(--muted-foreground))] text-lg">{item.label}</div>
            </div>
          ))}
        </div>
      );
    
    case 'warn':
      return (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center text-lg">
          <span className="text-amber-500">⚠️ {block.content}</span>
        </div>
      );
    
    case 'def':
      return (
        <div className="p-4 bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 rounded-lg text-center text-lg">
          <span className="text-[hsl(var(--primary))]">ℹ️ {block.content}</span>
        </div>
      );
    
    case 'quote':
      return (
        <blockquote className="text-xl md:text-2xl italic text-center text-[hsl(var(--muted-foreground))] border-l-4 border-[hsl(var(--primary))] pl-6 py-2">
          "{block.content}"
        </blockquote>
      );
    
    default:
      return null;
  }
}

export default PresentationMode;
