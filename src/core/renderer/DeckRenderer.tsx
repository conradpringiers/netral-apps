/**
 * Netral Deck Renderer
 * Renders slide preview with navigation
 */

import { useMemo } from 'react';
import { parseDeckDocument, SlideContent } from '../parser/deckParser';
import { getTheme, generateThemeCSS } from '../themes/themes';
import { renderMarkdown } from '../renderer/markdownRenderer';

interface DeckRendererProps {
  content: string;
  currentSlide: number;
  className?: string;
}

export function DeckRenderer({ content, currentSlide, className = '' }: DeckRendererProps) {
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
        <p>Commencez à écrire avec -- Titre de slide</p>
      </div>
    );
  }

  const theme = getTheme(doc.theme);
  const themeCSS = generateThemeCSS(theme);
  const slide = doc.slides[Math.min(currentSlide, doc.slides.length - 1)];

  return (
    <div 
      className={`h-full ${className}`}
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
        .deck-slide { ${themeCSS} }
      `}</style>
      
      <div className="deck-slide h-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col">
        {/* Slide content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 overflow-auto">
          {/* Slide title */}
          <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center text-[hsl(var(--foreground))]">
            {slide.title}
          </h1>
          
          {/* Slide content */}
          <div className="w-full max-w-4xl space-y-6">
            {slide.content.map((block, index) => (
              <SlideBlock key={index} block={block} />
            ))}
          </div>
        </div>
        
        {/* Slide indicator */}
        <div className="p-4 flex justify-center gap-2">
          {doc.slides.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSlide 
                  ? 'bg-[hsl(var(--primary))] w-6' 
                  : 'bg-[hsl(var(--muted))]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideBlock({ block }: { block: SlideContent }) {
  switch (block.type) {
    case 'markdown':
    case 'text':
      return (
        <div 
          className="prose prose-lg max-w-none text-center"
          style={{ color: 'hsl(var(--foreground))' }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }}
        />
      );
    
    case 'bigtitle':
      return (
        <h2 className="text-4xl md:text-6xl font-bold text-center text-[hsl(var(--primary))]">
          {block.content}
        </h2>
      );
    
    case 'image':
      return (
        <div className="flex justify-center">
          <img 
            src={block.content} 
            alt="Slide image" 
            className="max-h-64 rounded-lg shadow-lg"
          />
        </div>
      );
    
    case 'column':
      const columns = block.props?.columns || [];
      return (
        <div className="grid md:grid-cols-2 gap-8">
          {columns.map((col: string, idx: number) => (
            <div 
              key={idx}
              className="p-6 bg-[hsl(var(--card))] rounded-lg"
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
              <p className="text-[hsl(var(--muted-foreground))] text-sm">{item.description}</p>
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
              <div className="text-4xl md:text-5xl font-bold text-[hsl(var(--primary))] mb-2">
                {item.value}
              </div>
              <div className="text-[hsl(var(--muted-foreground))]">{item.label}</div>
            </div>
          ))}
        </div>
      );
    
    case 'warn':
      return (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
          <span className="text-amber-500">⚠️ {block.content}</span>
        </div>
      );
    
    case 'def':
      return (
        <div className="p-4 bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 rounded-lg text-center">
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

export default DeckRenderer;
