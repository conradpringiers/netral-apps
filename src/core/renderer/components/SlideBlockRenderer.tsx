/**
 * Unified Slide Block Renderer
 * Used by both PresentationMode and DeckPreview for pixel-perfect consistency
 */

import { SlideContent } from '../../parser/deckParser';
import { renderMarkdown } from '../markdownRenderer';

interface SlideBlockRendererProps {
  block: SlideContent;
  scale?: 'preview' | 'fullscreen';
}

export function SlideBlockRenderer({ block, scale = 'fullscreen' }: SlideBlockRendererProps) {
  const isPreview = scale === 'preview';
  
  // Scale factors for preview vs fullscreen
  const sizes = {
    text: isPreview ? 'text-xs' : 'text-xl',
    textLg: isPreview ? 'text-sm' : 'text-2xl',
    textXl: isPreview ? 'text-base' : 'text-3xl',
    text2xl: isPreview ? 'text-lg' : 'text-4xl',
    text3xl: isPreview ? 'text-xl' : 'text-5xl',
    text4xl: isPreview ? 'text-2xl' : 'text-6xl',
    heading1: isPreview ? 'text-base' : 'text-4xl',
    heading2: isPreview ? 'text-sm' : 'text-3xl',
    heading3: isPreview ? 'text-xs' : 'text-2xl',
    icon: isPreview ? 'text-xl' : 'text-4xl',
    iconLg: isPreview ? 'text-2xl' : 'text-5xl',
    gap: isPreview ? 'gap-1' : 'gap-4',
    gapSm: isPreview ? 'gap-0.5' : 'gap-2',
    padding: isPreview ? 'p-1.5' : 'p-4',
    paddingSm: isPreview ? 'p-1' : 'p-3',
    paddingLg: isPreview ? 'p-2' : 'p-6',
    space: isPreview ? 'space-y-1' : 'space-y-3',
    maxH: isPreview ? 'max-h-20' : 'max-h-[50vh]',
    rounded: isPreview ? 'rounded' : 'rounded-lg',
    roundedLg: isPreview ? 'rounded-md' : 'rounded-xl',
  };

  switch (block.type) {
    case 'markdown':
    case 'text':
      return (
        <div
          className={`text-[hsl(var(--foreground))] leading-relaxed
            [&_h1]:${sizes.heading1} [&_h1]:font-bold [&_h1]:mb-2
            [&_h2]:${sizes.heading2} [&_h2]:font-bold [&_h2]:mb-1.5
            [&_h3]:${sizes.heading3} [&_h3]:font-semibold [&_h3]:mb-1
            [&_p]:${sizes.text} [&_p]:leading-relaxed [&_p]:mb-1
            [&_ul]:${sizes.text} [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-0.5
            [&_ol]:${sizes.text} [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-0.5
            [&_li]:${sizes.text}
            [&_strong]:font-bold [&_em]:italic
            [&_a]:underline [&_a]:decoration-[hsl(var(--primary))]`}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }}
        />
      );

    case 'bigtitle':
      return (
        <h2 className={`${sizes.text4xl} font-bold text-center text-[hsl(var(--primary))] leading-tight`}>
          {block.content}
        </h2>
      );

    case 'image':
      return (
        <div className="flex justify-center">
          <img
            src={block.content}
            alt="Slide image"
            className={`${sizes.maxH} ${sizes.roundedLg} shadow-lg object-contain`}
          />
        </div>
      );

    case 'column':
      const columns = (block.props?.columns || []) as SlideContent[][];
      return (
        <div className={`grid grid-cols-2 ${sizes.gapSm}`}>
          {columns.map((colBlocks, idx) => (
            <div key={idx} className={sizes.space}>
              {colBlocks.map((child, childIdx) => (
                <SlideBlockRenderer key={childIdx} block={child} scale={scale} />
              ))}
            </div>
          ))}
        </div>
      );

    case 'feature':
      const features = block.props?.items || [];
      return (
        <div className={`grid grid-cols-3 ${sizes.gap}`}>
          {features.map((item: { icon: string; title: string; description: string }, idx: number) => (
            <div key={idx} className={`text-center ${sizes.padding}`}>
              <div className={`${sizes.iconLg} mb-1`}>{item.icon}</div>
              <h3 className={`font-bold ${sizes.text} mb-0.5 text-[hsl(var(--foreground))]`}>{item.title}</h3>
              <p className={`text-[hsl(var(--muted-foreground))] ${isPreview ? 'text-[9px]' : 'text-base'}`}>{item.description}</p>
            </div>
          ))}
        </div>
      );
    
    case 'stats':
      const stats = block.props?.items || [];
      return (
        <div className={`grid grid-cols-3 ${sizes.gap}`}>
          {stats.map((item: { value: string; label: string }, idx: number) => (
            <div key={idx} className="text-center">
              <div className={`${sizes.text3xl} font-bold text-[hsl(var(--primary))]`}>
                {item.value}
              </div>
              <div className={`text-[hsl(var(--muted-foreground))] ${sizes.text}`}>{item.label}</div>
            </div>
          ))}
        </div>
      );
    
    case 'timeline':
      const timelineItems = block.props?.items || [];
      return (
        <div className={sizes.space}>
          {timelineItems.map((item: { year: string; title: string; description: string }, idx: number) => (
            <div key={idx} className={`flex items-start ${sizes.gapSm}`}>
              <div className={`flex-shrink-0 ${sizes.text} font-bold text-[hsl(var(--primary))]`}>{item.year}</div>
              <div className={`flex-shrink-0 ${isPreview ? 'w-1.5 h-1.5' : 'w-3 h-3'} mt-1 rounded-full bg-[hsl(var(--primary))]`} />
              <div className="flex-1">
                <h4 className={`${sizes.text} font-bold text-[hsl(var(--foreground))]`}>{item.title}</h4>
                <p className={`text-[hsl(var(--muted-foreground))] ${isPreview ? 'text-[9px]' : 'text-base'}`}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      );
    
    case 'list':
      const listItems = block.props?.items || [];
      return (
        <div className={sizes.space}>
          {listItems.map((item: { icon: string; text: string }, idx: number) => (
            <div key={idx} className={`flex items-center ${sizes.gapSm}`}>
              <span className={sizes.icon}>{item.icon}</span>
              <span className={`${sizes.text} text-[hsl(var(--foreground))]`}>{item.text}</span>
            </div>
          ))}
        </div>
      );

    case 'video':
      return (
        <div className="flex justify-center">
          <video
            src={block.content}
            controls={!isPreview}
            muted={isPreview}
            loop={isPreview}
            playsInline
            className={`${sizes.maxH} ${sizes.roundedLg} shadow-lg`}
          />
        </div>
      );

    case 'code':
      return (
        <pre className={`overflow-auto ${sizes.rounded} ${sizes.paddingSm} bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] font-mono ${isPreview ? 'text-[9px]' : 'text-base'}`}>
          <code>{block.content.trim()}</code>
        </pre>
      );

    case 'warn':
      return (
        <div className={`${sizes.paddingSm} bg-amber-500/10 border border-amber-500/30 ${sizes.rounded}`}>
          <span className={`text-amber-500 ${sizes.text}`}>⚠️ {block.content}</span>
        </div>
      );

    case 'def':
      return (
        <div className={`${sizes.paddingSm} bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 ${sizes.rounded}`}>
          <span className={`text-[hsl(var(--primary))] ${sizes.text}`}>ℹ️ {block.content}</span>
        </div>
      );

    case 'quote':
      return (
        <blockquote className={`${sizes.textLg} italic text-[hsl(var(--muted-foreground))] border-l-2 border-[hsl(var(--primary))] pl-3`}>
          "{block.content}"
        </blockquote>
      );

    case 'badge':
      return (
        <span className={`inline-block ${isPreview ? 'px-1.5 py-0.5 text-[9px]' : 'px-3 py-1 text-sm'} rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold`}>
          {block.content}
        </span>
      );

    case 'gallery':
      const galleryItems = block.props?.items || [];
      return (
        <div className={`grid grid-cols-3 ${sizes.gapSm}`}>
          {galleryItems.slice(0, 6).map((item: { url: string; caption: string }, idx: number) => (
            <div key={idx}>
              <img
                src={item.url}
                alt={item.caption}
                className={`w-full aspect-video object-cover ${sizes.rounded}`}
              />
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

export default SlideBlockRenderer;
