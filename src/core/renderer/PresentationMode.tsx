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
    // totalSlides doesn't include intro, so max is totalSlides (intro is 0, slides are 1 to totalSlides)
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
          onSlideChange(totalSlides); // last slide (accounting for intro)
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
  // currentSlide is 1-indexed for actual slides (1 = first slide, etc.)
  const slideIndex = currentSlide - 1;
  const slide = isIntroSlide ? null : doc.slides[slideIndex];

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
         <div className="fullscreen-slide relative h-full w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col items-center justify-center">
           <DeckLogo logo={doc.logo} />
           <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center text-[hsl(var(--primary))] px-8">
             {doc.title}
           </h1>
           <p className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] mt-6">
             {doc.slides.length} slides
           </p>
         </div>
       ) : slide ? (
         <div className="fullscreen-slide relative h-full w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col">
           <DeckLogo logo={doc.logo} />
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
          className="max-w-none text-[hsl(var(--foreground))] leading-relaxed
            [&_h1]:text-5xl [&_h1]:font-bold [&_h1]:mt-10 [&_h1]:mb-4
            [&_h2]:text-4xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3
            [&_h3]:text-3xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2
            [&_p]:text-2xl [&_p]:leading-relaxed
            [&_ul]:text-2xl [&_ul]:list-disc [&_ul]:pl-8 [&_ul]:space-y-2
            [&_ol]:text-2xl [&_ol]:list-decimal [&_ol]:pl-8 [&_ol]:space-y-2
            [&_li]:text-2xl
            [&_strong]:text-[hsl(var(--foreground))] [&_strong]:font-bold
            [&_em]:italic
            [&_a]:underline [&_a]:decoration-[hsl(var(--primary))] [&_a]:underline-offset-4"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }}
        />
      );

    case 'bigtitle':
      return (
        <h2 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-center text-[hsl(var(--primary))] leading-tight">
          {block.content}
        </h2>
      );

    case 'image':
      return (
        <div className="flex justify-center">
          <img
            src={block.content}
            alt="Slide image"
            className="max-h-[60vh] rounded-xl shadow-2xl object-contain"
          />
        </div>
      );

    case 'column':
      const columns = (block.props?.columns || []) as SlideContent[][];
      return (
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {columns.map((colBlocks, idx) => (
            <div
              key={idx}
              className="p-6 lg:p-8 bg-[hsl(var(--card))] rounded-xl overflow-hidden"
            >
              <div className="space-y-5">
                {colBlocks.map((child, childIdx) => (
                  <FullscreenSlideBlock key={childIdx} block={child} />
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case 'feature':
      const features = block.props?.items || [];
      return (
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((item: { icon: string; title: string; description: string }, idx: number) => (
            <div key={idx} className="text-center p-6 lg:p-8 bg-[hsl(var(--card))] rounded-xl shadow-lg">
              <div className="text-5xl lg:text-6xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-xl lg:text-2xl mb-3 text-[hsl(var(--foreground))]">{item.title}</h3>
              <p className="text-[hsl(var(--muted-foreground))] text-lg">{item.description}</p>
            </div>
          ))}
        </div>
      );
    
    case 'stats':
      const stats = block.props?.items || [];
      return (
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {stats.map((item: { value: string; label: string }, idx: number) => (
            <div key={idx} className="text-center p-6">
              <div className="text-6xl md:text-7xl lg:text-8xl font-bold text-[hsl(var(--primary))] mb-3">
                {item.value}
              </div>
              <div className="text-[hsl(var(--muted-foreground))] text-xl lg:text-2xl">{item.label}</div>
            </div>
          ))}
        </div>
      );
    
    case 'timeline':
      const timelineItems = block.props?.items || [];
      return (
        <div className="space-y-6">
          {timelineItems.map((item: { year: string; title: string; description: string }, idx: number) => (
            <div key={idx} className="flex items-start gap-6">
              <div className="flex-shrink-0 w-24 text-right">
                <span className="text-2xl font-bold text-[hsl(var(--primary))]">{item.year}</span>
              </div>
              <div className="flex-shrink-0 w-4 h-4 mt-2 rounded-full bg-[hsl(var(--primary))]" />
              <div className="flex-1">
                <h4 className="text-xl font-bold text-[hsl(var(--foreground))] mb-1">{item.title}</h4>
                <p className="text-[hsl(var(--muted-foreground))] text-lg">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      );
    
    case 'list':
      const listItems = block.props?.items || [];
      return (
        <div className="space-y-4">
          {listItems.map((item: { icon: string; text: string }, idx: number) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-[hsl(var(--card))] rounded-xl">
              <span className="text-3xl">{item.icon}</span>
              <span className="text-xl text-[hsl(var(--foreground))]">{item.text}</span>
            </div>
          ))}
        </div>
      );

    case 'video':
      return (
        <div className="flex justify-center">
          <video
            src={block.content}
            controls
            className="max-h-[60vh] rounded-xl shadow-2xl"
          />
        </div>
      );

    case 'code':
      return (
        <pre className="overflow-auto rounded-xl p-6 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-mono text-lg lg:text-xl">
          <code>{block.content.trim()}</code>
        </pre>
      );

    case 'warn':
      return (
        <div className="p-6 bg-amber-500/10 border-2 border-amber-500/30 rounded-xl text-center">
          <span className="text-amber-500 text-xl lg:text-2xl">⚠️ {block.content}</span>
        </div>
      );

    case 'def':
      return (
        <div className="p-6 bg-[hsl(var(--primary))]/10 border-2 border-[hsl(var(--primary))]/30 rounded-xl text-center">
          <span className="text-[hsl(var(--primary))] text-xl lg:text-2xl">ℹ️ {block.content}</span>
        </div>
      );

    case 'quote':
      return (
        <blockquote className="text-2xl md:text-3xl lg:text-4xl italic text-center text-[hsl(var(--muted-foreground))] border-l-4 border-[hsl(var(--primary))] pl-8 py-4">
          "{block.content}"
        </blockquote>
      );

    default:
      return null;
  }

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
          className="h-10 md:h-12 lg:h-14 w-auto object-contain"
          loading="lazy"
        />
      ) : (
        <div className="text-[hsl(var(--muted-foreground))] font-semibold text-lg md:text-xl lg:text-2xl">
          {logo}
        </div>
      )}
    </div>
  );
}

export default PresentationMode;
