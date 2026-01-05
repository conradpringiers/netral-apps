/**
 * Deck Preview - Scrollable view of all slides for editing
 */

import { useMemo } from 'react';
import { parseDeckDocument, SlideContent } from '../parser/deckParser';
import { getTheme, generateThemeCSS } from '../themes/themes';
import { renderMarkdown } from './markdownRenderer';

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
      <style>{`
        .deck-preview-slide { ${themeCSS} }
      `}</style>
      
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {/* Intro slide with presentation title */}
        <div 
          className="relative w-full rounded-lg shadow-xl overflow-hidden"
          style={{ aspectRatio: '16/9' }}
        >
          <div 
            className="absolute inset-0"
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
            <div className="deck-preview-slide h-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col items-center justify-center">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-center text-[hsl(var(--primary))] px-6">
                {doc.title}
              </h1>
              <p className="text-sm md:text-base text-[hsl(var(--muted-foreground))] mt-4">
                {doc.slides.length} slides
              </p>
            </div>
          </div>
          {/* Slide indicator */}
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
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
              <div className="deck-preview-slide h-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col">
                {/* Slide title at top left */}
                <div className="px-4 pt-3 pb-2 border-b border-[hsl(var(--border))]">
                  <h1 className="text-base md:text-xl font-bold text-[hsl(var(--foreground))]">
                    {slide.title}
                  </h1>
                </div>
                
                {/* Slide content */}
                <div className="flex-1 flex flex-col items-center justify-center p-3 md:p-4 overflow-hidden min-h-0">
                  <div className="w-full max-w-3xl space-y-2 md:space-y-3">
                    {slide.content.map((block, blockIndex) => (
                      <PreviewSlideBlock key={blockIndex} block={block} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Slide indicator */}
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {index + 1} / {doc.slides.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewSlideBlock({ block }: { block: SlideContent }) {
  switch (block.type) {
    case 'markdown':
    case 'text':
      return (
        <div 
          className="prose prose-sm max-w-none"
          style={{ color: 'hsl(var(--foreground))' }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }}
        />
      );
    
    case 'bigtitle':
      return (
        <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-center text-[hsl(var(--primary))]">
          {block.content}
        </h2>
      );
    
    case 'image':
      return (
        <div className="flex justify-center">
          <img 
            src={block.content} 
            alt="Slide image" 
            className="max-h-24 md:max-h-32 rounded-lg shadow-lg object-contain"
          />
        </div>
      );
    
    case 'column':
      const columns = block.props?.columns || [];
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {columns.map((col: string, idx: number) => (
            <div 
              key={idx}
              className="p-2 bg-[hsl(var(--card))] rounded-lg text-xs prose prose-sm max-w-none overflow-hidden"
              style={{ color: 'hsl(var(--foreground))' }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(col) }}
            />
          ))}
        </div>
      );
    
    case 'feature':
      const features = block.props?.items || [];
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {features.map((item: { icon: string; title: string; description: string }, idx: number) => (
            <div key={idx} className="text-center p-2 bg-[hsl(var(--card))] rounded-lg">
              <div className="text-base md:text-lg mb-1">{item.icon}</div>
              <h3 className="font-bold text-xs mb-0.5 text-[hsl(var(--foreground))]">{item.title}</h3>
              <p className="text-[hsl(var(--muted-foreground))] text-[10px] line-clamp-2">{item.description}</p>
            </div>
          ))}
        </div>
      );
    
    case 'stats':
      const stats = block.props?.items || [];
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {stats.map((item: { value: string; label: string }, idx: number) => (
            <div key={idx} className="text-center p-2">
              <div className="text-lg md:text-xl font-bold text-[hsl(var(--primary))] mb-0.5">
                {item.value}
              </div>
              <div className="text-[hsl(var(--muted-foreground))] text-xs">{item.label}</div>
            </div>
          ))}
        </div>
      );
    
    case 'warn':
      return (
        <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center text-xs">
          <span className="text-amber-500">⚠️ {block.content}</span>
        </div>
      );
    
    case 'def':
      return (
        <div className="p-2 bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 rounded-lg text-center text-xs">
          <span className="text-[hsl(var(--primary))]">ℹ️ {block.content}</span>
        </div>
      );
    
    case 'quote':
      return (
        <blockquote className="text-sm italic text-center text-[hsl(var(--muted-foreground))] border-l-4 border-[hsl(var(--primary))] pl-3 py-1">
          "{block.content}"
        </blockquote>
      );
    
    default:
      return null;
  }
}

export default DeckPreview;
