/**
 * Deck Preview - Scrollable view of all slides for editing
 * Uses same SlideBlockRenderer as PresentationMode for pixel-perfect consistency
 */

import { useMemo } from 'react';
import { parseDeckDocument } from '../parser/deckParser';
import { getTheme, generateThemeCSS } from '../themes/themes';
import { SlideBlockRenderer } from './components/SlideBlockRenderer';

interface DeckPreviewProps {
  content: string;
  className?: string;
}

export function DeckPreview({ content, className = '' }: DeckPreviewProps) {
  const doc = useMemo(() => {
    try {
      return parseDeckDocument(content);
    } catch (e) {
      console.error('Error parsing deck:', e);
      return null;
    }
  }, [content]);

  if (!doc || doc.slides.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Start writing with -- Slide Title</p>
      </div>
    );
  }

  const theme = getTheme(doc.theme);
  const themeCSS = generateThemeCSS(theme);

  return (
    <div 
      className={`h-full overflow-auto p-4 md:p-6 ${className}`}
      style={{ backgroundColor: '#1e293b' }}
    >
      <style>{`.deck-preview-slide { ${themeCSS} }`}</style>
      
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {/* Intro slide */}
        <div 
          className="relative w-full rounded-lg shadow-xl overflow-hidden"
          style={{ aspectRatio: '16/9' }}
        >
          <div 
            className="absolute inset-0"
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
            <div className="deck-preview-slide relative h-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col items-center justify-center">
              <DeckLogo logo={doc.logo} />
              <h1 className="text-2xl md:text-3xl font-bold text-center text-[hsl(var(--primary))] px-6">
                {doc.title}
              </h1>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3">
                {doc.slides.length} slides
              </p>
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
            Intro
          </div>
        </div>

        {/* All slides */}
        {doc.slides.map((slide, index) => (
          <div 
            key={index}
            className="relative w-full rounded-lg shadow-xl overflow-hidden"
            style={{ aspectRatio: '16/9' }}
          >
            <div 
              className="absolute inset-0"
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
              <div className="deck-preview-slide relative h-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col">
                {/* Background image with overlay */}
                {slide.background && (
                  <>
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${slide.background})` }}
                    />
                    <div 
                      className="absolute inset-0"
                      style={{ backgroundColor: `hsl(var(--background) / 0.85)` }}
                    />
                  </>
                )}
                <DeckLogo logo={doc.logo} />
                {/* Slide title with separator */}
                <div className="relative px-4 pt-3 pb-1">
                  <h1 className="text-sm md:text-base font-bold text-[hsl(var(--foreground))]">
                    {slide.title}
                  </h1>
                  <hr className="mt-1.5 border-t border-[hsl(var(--border))]" />
                </div>
                
                {/* Slide content */}
                <div className="relative flex-1 px-4 pb-3 overflow-hidden min-h-0">
                  <div className="w-full space-y-2">
                    {slide.content.map((block, blockIndex) => (
                      <SlideBlockRenderer key={blockIndex} block={block} scale="preview" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
              {index + 1} / {doc.slides.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function isProbablyUrl(value: string) {
  return /^(https?:\/\/|data:image\/)/i.test(value.trim());
}

function DeckLogo({ logo }: { logo?: string }) {
  if (!logo) return null;

  return (
    <div className="absolute top-2 right-3 z-10">
      {isProbablyUrl(logo) ? (
        <img
          src={logo}
          alt="Logo"
          className="h-5 w-auto object-contain"
          loading="lazy"
        />
      ) : (
        <div className="text-[hsl(var(--muted-foreground))] font-semibold text-[10px]">
          {logo}
        </div>
      )}
    </div>
  );
}

export default DeckPreview;
