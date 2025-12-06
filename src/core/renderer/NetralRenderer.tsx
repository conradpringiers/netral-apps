/**
 * Netral Renderer
 * Main component that renders a complete Netral document with modern floating navbar
 */

import { useMemo, useState } from 'react';
import { parseNetralDocument, NetralDocument } from '@/core/parser/netralParser';
import { getTheme, generateThemeCSS } from '@/core/themes/themes';
import { HeaderRenderer } from './components/HeaderRenderer';
import { ContentBlockRenderer } from './components/ContentBlockRenderer';
import { Menu, X } from 'lucide-react';

interface NetralRendererProps {
  content: string;
  className?: string;
}

export function NetralRenderer({ content, className = '' }: NetralRendererProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        
        /* Modern floating navbar - sticky instead of fixed to stay within preview */
        .netral-render .floating-nav {
          position: sticky;
          top: 1rem;
          z-index: 100;
          padding: 0.75rem 1.5rem;
          border-radius: 9999px;
          background: hsl(var(--background) / 0.8);
          backdrop-filter: blur(16px);
          border: 1px solid hsl(var(--border) / 0.5);
          box-shadow: 0 8px 32px -8px hsl(var(--foreground) / 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          max-width: fit-content;
          margin: 1rem auto 0;
        }
        
        /* Navbar link effects */
        .netral-render .nav-link {
          position: relative;
          padding: 0.5rem 0;
          font-size: 0.875rem;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
          transition: color 0.2s ease;
          white-space: nowrap;
        }
        .netral-render .nav-link::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.5));
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(-50%);
        }
        .netral-render .nav-link:hover::before {
          width: 100%;
        }
        .netral-render .nav-link:hover {
          color: hsl(var(--foreground));
        }
        
        /* Mobile menu - positioned within the render container */
        .netral-render .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99;
          background: hsl(var(--background) / 0.98);
          backdrop-filter: blur(16px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
        }
        .netral-render .mobile-menu a {
          font-size: 1.5rem;
          font-weight: 600;
          color: hsl(var(--foreground));
          transition: color 0.2s;
        }
        .netral-render .mobile-menu a:hover {
          color: hsl(var(--primary));
        }
      `}</style>

      {/* Modern Floating Navbar */}
      {(document.logo || document.navbar.length > 0) && (
        <>
          <nav className="floating-nav">
            <div className="flex items-center gap-2">
              {document.logo && (
                document.logo.type === 'url' ? (
                  <img src={document.logo.value} alt="Logo" className="h-8 w-auto" />
                ) : (
                  <span className="text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>{document.logo.value}</span>
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
                      className="nav-link"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
                <button 
                  className="md:hidden p-2 rounded-full transition-colors"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            )}
          </nav>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="mobile-menu">
              <button 
                className="absolute top-4 right-4 p-2"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: 'hsl(var(--foreground))' }}
              >
                <X className="w-6 h-6" />
              </button>
              {document.navbar.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}

          {/* No spacer needed with sticky positioning */}
        </>
      )}

      {/* Header */}
      {document.header && <HeaderRenderer header={document.header} />}

      {/* Sections */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {document.sections.map((section, sectionIndex) => (
          <section key={sectionIndex} className="mb-16">
            {section.title && (
              <h2 className="text-2xl sm:text-3xl font-bold mb-8 pb-2 border-b text-center sm:text-left" style={{ 
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