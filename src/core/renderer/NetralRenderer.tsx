/**
 * Netral Renderer
 * Main component that renders a complete Netral document
 */

import { useMemo } from 'react';
import { parseNetralDocument, NetralDocument } from '@/core/parser/netralParser';
import { getTheme, generateThemeCSS } from '@/core/themes/themes';
import { HeaderRenderer } from './components/HeaderRenderer';
import { ContentBlockRenderer } from './components/ContentBlockRenderer';
import { Menu } from 'lucide-react';

interface NetralRendererProps {
  content: string;
  className?: string;
}

export function NetralRenderer({ content, className = '' }: NetralRendererProps) {
  const document = useMemo(() => {
    try {
      return parseNetralDocument(content);
    } catch (error) {
      console.error('Parse error:', error);
      return null;
    }
  }, [content]);

  const theme = useMemo(() => {
    if (!document) return getTheme('Modern');
    return getTheme(document.theme);
  }, [document?.theme]);

  const themeCSS = useMemo(() => generateThemeCSS(theme), [theme]);

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Commencez à écrire...</p>
      </div>
    );
  }

  return (
    <div
      className={`netral-render min-h-full ${className}`}
      style={{ cssText: themeCSS, fontFamily: theme.fontFamily } as React.CSSProperties}
    >
      {/* Custom theme variables */}
      <style>{`
        .netral-render {
          ${themeCSS}
        }
        .netral-render .prose-content h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; color: hsl(var(--foreground)); }
        .netral-render .prose-content h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; color: hsl(var(--foreground)); }
        .netral-render .prose-content h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: hsl(var(--foreground)); }
        .netral-render .prose-content p { margin-bottom: 1rem; color: hsl(var(--foreground)); line-height: 1.7; }
        .netral-render .prose-content a { color: hsl(var(--primary)); text-decoration: underline; }
        .netral-render .prose-content code { background: hsl(var(--muted)); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; }
        .netral-render .prose-content pre { background: hsl(var(--muted)); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; }
        .netral-render .prose-content ul, .netral-render .prose-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
        .netral-render .prose-content li { margin-bottom: 0.25rem; color: hsl(var(--foreground)); }
        .netral-render .prose-content blockquote { border-left: 4px solid hsl(var(--primary)); padding-left: 1rem; color: hsl(var(--muted-foreground)); font-style: italic; margin: 1rem 0; }
        .netral-render .prose-content strong { font-weight: 600; }
        .netral-render .prose-content em { font-style: italic; }
      `}</style>

      {/* Navbar */}
      {(document.logo || document.navbar.length > 0) && (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-2">
            {document.logo && (
              document.logo.type === 'url' ? (
                <img src={document.logo.value} alt="Logo" className="h-8 w-auto" />
              ) : (
                <span className="text-xl font-bold text-foreground">{document.logo.value}</span>
              )
            )}
          </div>
          
          {document.navbar.length > 0 && (
            <>
              <div className="hidden md:flex items-center gap-6">
                {document.navbar.map((item, index) => (
                  <a
                    key={index}
                    href={item.url}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <button className="md:hidden p-2 text-muted-foreground">
                <Menu className="w-5 h-5" />
              </button>
            </>
          )}
        </nav>
      )}

      {/* Header */}
      {document.header && <HeaderRenderer header={document.header} />}

      {/* Sections */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {document.sections.map((section, sectionIndex) => (
          <section key={sectionIndex} className="mb-16">
            {section.title && (
              <h2 className="text-3xl font-bold text-foreground mb-8 pb-2 border-b border-border">
                {section.title}
              </h2>
            )}
            {section.content.map((block, blockIndex) => (
              <ContentBlockRenderer key={blockIndex} block={block} />
            ))}
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border text-center text-muted-foreground text-sm">
        {document.title && <p>© {new Date().getFullYear()} {document.title}</p>}
        <p className="mt-1 text-xs opacity-60">Créé avec Netral</p>
      </footer>
    </div>
  );
}

export default NetralRenderer;
