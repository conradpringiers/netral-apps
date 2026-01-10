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
    text: isPreview ? 'text-xs' : 'text-lg',
    textLg: isPreview ? 'text-sm' : 'text-xl',
    textXl: isPreview ? 'text-base' : 'text-2xl',
    text2xl: isPreview ? 'text-lg' : 'text-3xl',
    text3xl: isPreview ? 'text-xl' : 'text-4xl',
    text4xl: isPreview ? 'text-2xl' : 'text-5xl',
    heading1: isPreview ? 'text-base' : 'text-3xl',
    heading2: isPreview ? 'text-sm' : 'text-2xl',
    heading3: isPreview ? 'text-xs' : 'text-xl',
    icon: isPreview ? 'text-xl' : 'text-3xl',
    iconLg: isPreview ? 'text-2xl' : 'text-4xl',
    gap: isPreview ? 'gap-2' : 'gap-8',
    gapSm: isPreview ? 'gap-1' : 'gap-4',
    padding: isPreview ? 'p-2' : 'p-6',
    paddingSm: isPreview ? 'p-1' : 'p-3',
    paddingLg: isPreview ? 'p-2' : 'p-8',
    space: isPreview ? 'space-y-1' : 'space-y-4',
    maxH: isPreview ? 'max-h-24' : 'max-h-[60vh]',
    rounded: isPreview ? 'rounded' : 'rounded-lg',
    roundedLg: isPreview ? 'rounded-md' : 'rounded-xl',
  };

  switch (block.type) {
    case 'markdown':
    case 'text':
      return (
        <div
          className={`text-[hsl(var(--foreground))] leading-relaxed
            [&_h1]:${sizes.heading1} [&_h1]:font-bold [&_h1]:mb-3
            [&_h2]:${sizes.heading2} [&_h2]:font-bold [&_h2]:mb-2
            [&_h3]:${sizes.heading3} [&_h3]:font-semibold [&_h3]:mb-2
            [&_p]:${sizes.text} [&_p]:leading-relaxed [&_p]:mb-2
            [&_ul]:${sizes.text} [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1
            [&_ol]:${sizes.text} [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1
            [&_li]:${sizes.text}
            [&_strong]:font-bold [&_em]:italic
            [&_a]:underline [&_a]:decoration-[hsl(var(--primary))]`}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }}
        />
      );

    case 'bigtitle':
      return (
        <div className="flex items-center justify-center py-4">
          <h2 className={`${sizes.text4xl} font-bold text-center text-[hsl(var(--primary))] leading-tight`}>
            {block.content}
          </h2>
        </div>
      );

    case 'image':
      return (
        <div className="flex justify-center py-2">
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
        <div className={`grid grid-cols-2 ${sizes.gapSm} items-start`}>
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
        <div className={`grid grid-cols-3 ${sizes.gap} py-4`}>
          {features.map((item: { icon: string; title: string; description: string }, idx: number) => (
            <div key={idx} className="text-center">
              <div className={`${sizes.iconLg} mb-2`}>{item.icon}</div>
              <h3 className={`font-bold ${sizes.textLg} mb-1 text-[hsl(var(--foreground))]`}>{item.title}</h3>
              <p className={`text-[hsl(var(--muted-foreground))] ${sizes.text}`}>{item.description}</p>
            </div>
          ))}
        </div>
      );
    
    case 'stats':
      const stats = block.props?.items || [];
      return (
        <div className={`grid grid-cols-3 ${sizes.gap} py-6`}>
          {stats.map((item: { value: string; label: string }, idx: number) => (
            <div key={idx} className="text-center">
              <div className={`${sizes.text4xl} font-bold text-[hsl(var(--primary))]`}>
                {item.value}
              </div>
              <div className={`text-[hsl(var(--muted-foreground))] ${sizes.textLg} mt-1`}>{item.label}</div>
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
              <div className={`flex-shrink-0 ${sizes.textLg} font-bold text-[hsl(var(--primary))] min-w-[60px]`}>{item.year}</div>
              <div className={`flex-shrink-0 ${isPreview ? 'w-2 h-2' : 'w-3 h-3'} mt-2 rounded-full bg-[hsl(var(--primary))]`} />
              <div className="flex-1 ml-2">
                <h4 className={`${sizes.textLg} font-bold text-[hsl(var(--foreground))]`}>{item.title}</h4>
                <p className={`text-[hsl(var(--muted-foreground))] ${sizes.text} mt-0.5`}>{item.description}</p>
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
              <span className={`${sizes.textLg} text-[hsl(var(--foreground))]`}>{item.text}</span>
            </div>
          ))}
        </div>
      );

    case 'video':
      return (
        <div className="flex justify-center py-2">
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
        <pre className={`overflow-auto ${sizes.rounded} ${sizes.paddingSm} bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] font-mono ${isPreview ? 'text-[10px]' : 'text-sm'}`}>
          <code>{block.content.trim()}</code>
        </pre>
      );

    case 'warn':
      return (
        <div className={`${sizes.padding} bg-amber-500/10 border-l-4 border-amber-500 ${sizes.rounded}`}>
          <span className={`text-amber-600 ${sizes.textLg} font-medium`}>⚠️ {block.content}</span>
        </div>
      );

    case 'def':
      return (
        <div className={`${sizes.padding} bg-[hsl(var(--primary))]/10 border-l-4 border-[hsl(var(--primary))] ${sizes.rounded}`}>
          <span className={`text-[hsl(var(--primary))] ${sizes.textLg} font-medium`}>ℹ️ {block.content}</span>
        </div>
      );

    case 'quote':
      return (
        <blockquote className={`${sizes.text2xl} italic text-[hsl(var(--muted-foreground))] border-l-4 border-[hsl(var(--primary))] pl-6 py-2`}>
          "{block.content}"
        </blockquote>
      );

    case 'badge':
      return (
        <span className={`inline-block ${isPreview ? 'px-2 py-0.5 text-[10px]' : 'px-4 py-1.5 text-sm'} rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold`}>
          {block.content}
        </span>
      );

    case 'gallery':
      const galleryItems = block.props?.items || [];
      return (
        <div className={`grid grid-cols-3 ${sizes.gapSm} py-2`}>
          {galleryItems.slice(0, 6).map((item: { url: string; caption: string }, idx: number) => (
            <div key={idx} className="group relative">
              <img
                src={item.url}
                alt={item.caption}
                className={`w-full aspect-video object-cover ${sizes.rounded} shadow-md`}
              />
              {item.caption && (
                <div className={`absolute bottom-0 left-0 right-0 bg-black/60 text-white ${isPreview ? 'text-[8px] p-0.5' : 'text-xs p-2'} text-center ${isPreview ? 'rounded-b' : 'rounded-b-lg'}`}>
                  {item.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      );

    case 'progress':
      const progressValue = block.props?.value || 0;
      const progressLabel = block.props?.label;
      return (
        <div className={`w-full ${sizes.space}`}>
          <div className="flex justify-between items-center mb-1">
            {progressLabel && (
              <span className={`${sizes.text} text-[hsl(var(--foreground))]`}>{progressLabel}</span>
            )}
            <span className={`${sizes.text} text-[hsl(var(--muted-foreground))] ml-auto`}>{progressValue}%</span>
          </div>
          <div className={`w-full ${isPreview ? 'h-2' : 'h-3'} bg-[hsl(var(--muted))] ${sizes.rounded} overflow-hidden`}>
            <div 
              className={`h-full bg-[hsl(var(--primary))] ${sizes.rounded} transition-all duration-500`}
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      );

    case 'graph':
      const graphNodes = block.props?.nodes || [];
      return (
        <div className={`flex items-center justify-center ${sizes.gap} flex-wrap py-4`}>
          {graphNodes.map((node: { id: string; label: string; connections: string[] }, idx: number) => (
            <div key={node.id} className="flex items-center">
              <div className={`${isPreview ? 'px-2 py-1 text-[10px]' : 'px-4 py-2 text-sm'} rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium shadow-md`}>
                {node.label}
              </div>
              {node.connections.length > 0 && idx < graphNodes.length - 1 && (
                <div className={`${isPreview ? 'mx-1' : 'mx-3'} flex items-center text-[hsl(var(--muted-foreground))]`}>
                  <div className={`${isPreview ? 'w-4' : 'w-8'} h-0.5 bg-[hsl(var(--border))]`} />
                  <span className={isPreview ? 'text-xs' : 'text-lg'}>→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

export default SlideBlockRenderer;
