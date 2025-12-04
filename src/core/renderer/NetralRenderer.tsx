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
        <p>Start writing...</p>
      </div>
    );
  }

  return (
    <div
      className={`netral-render min-h-full ${className}`}
      style={{ fontFamily: theme.fontFamily } as React.CSSProperties}
    >
      {/* Custom theme variables */}
      <style>{`
        .netral-render {
          ${themeCSS}
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        .netral-render * {
          border-color: hsl(var(--border));
        }
        .netral-render .prose-content h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; color: hsl(var(--foreground)); }
        .netral-render .prose-content h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; color: hsl(var(--foreground)); }
        .netral-render .prose-content h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: hsl(var(--foreground)); }
        .netral-render .prose-content p { margin-bottom: 1rem; color: hsl(var(--foreground)); line-height: 1.7; }
        .netral-render .prose-content a { color: hsl(var(--primary)); text-decoration: underline; transition: opacity 0.2s; }
        .netral-render .prose-content a:hover { opacity: 0.8; }
        .netral-render .prose-content code { background: hsl(var(--muted)); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; }
        .netral-render .prose-content pre { background: hsl(var(--muted)); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; }
        .netral-render .prose-content ul, .netral-render .prose-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
        .netral-render .prose-content li { margin-bottom: 0.25rem; color: hsl(var(--foreground)); }
        .netral-render .prose-content blockquote { border-left: 4px solid hsl(var(--primary)); padding-left: 1rem; color: hsl(var(--muted-foreground)); font-style: italic; margin: 1rem 0; }
        .netral-render .prose-content strong { font-weight: 600; }
        .netral-render .prose-content em { font-style: italic; }
        
        /* Card hover effects */
        .netral-render .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .netral-render .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px -12px hsl(var(--primary) / 0.3);
        }
        
        /* Button hover effects */
        .netral-render .btn-primary {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          transition: all 0.2s ease;
        }
        .netral-render .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px -8px hsl(var(--primary) / 0.5);
        }
        
        /* Navbar link effects */
        .netral-render .nav-link {
          position: relative;
          transition: color 0.2s ease;
        }
        .netral-render .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: hsl(var(--primary));
          transition: width 0.3s ease;
        }
        .netral-render .nav-link:hover::after {
          width: 100%;
        }
        .netral-render .nav-link:hover {
          color: hsl(var(--primary));
        }
      `}</style>

      {/* Navbar */}
      {(document.logo || document.navbar.length > 0) && (
        <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ 
          backgroundColor: 'hsl(var(--background) / 0.9)',
          borderColor: 'hsl(var(--border))'
        }}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {document.logo && (
                document.logo.type === 'url' ? (
                  <img src={document.logo.value} alt="Logo" className="h-8 w-auto" />
                ) : (
                  <span className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>{document.logo.value}</span>
                )
              )}
            </div>
            
            {document.navbar.length > 0 && (
              <>
                <div className="hidden md:flex items-center gap-8">
                  {document.navbar.map((item, index) => (
                    <a
                      key={index}
                      href={item.url}
                      className="nav-link text-sm font-medium"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
                <button className="md:hidden p-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <Menu className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </nav>
      )}

      {/* Header */}
      {document.header && <HeaderRenderer header={document.header} />}

      {/* Sections */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {document.sections.map((section, sectionIndex) => (
          <section key={sectionIndex} className="mb-16">
            {section.title && (
              <h2 className="text-3xl font-bold mb-8 pb-2 border-b" style={{ 
                color: 'hsl(var(--foreground))',
                borderColor: 'hsl(var(--border))'
              }}>
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
      <footer className="py-8 px-6 border-t text-center text-sm" style={{ 
        borderColor: 'hsl(var(--border))',
        color: 'hsl(var(--muted-foreground))'
      }}>
        {document.title && <p>© {new Date().getFullYear()} {document.title}</p>}
        <p className="mt-1 text-xs opacity-60">Built with Netral</p>
      </footer>
    </div>
  );
}

export default NetralRenderer;
