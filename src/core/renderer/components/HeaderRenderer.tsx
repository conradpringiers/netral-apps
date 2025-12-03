/**
 * Header Renderer Component
 * Renders different header styles: Classic, BigText, SplitImage
 */

import { HeaderConfig } from '@/core/parser/netralParser';

interface HeaderRendererProps {
  header: HeaderConfig;
}

export function HeaderRenderer({ header }: HeaderRendererProps) {
  switch (header.type) {
    case 'BigText':
      return (
        <header className="py-20 px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            {header.title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {header.description}
          </p>
          {header.link && (
            <a
              href={header.link}
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              En savoir plus
            </a>
          )}
        </header>
      );

    case 'SplitImage':
      return (
        <header className="grid md:grid-cols-2 gap-8 items-center py-16 px-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {header.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {header.description}
            </p>
            {header.link && (
              <a
                href={header.link}
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Commencer
              </a>
            )}
          </div>
          {header.imageUrl && (
            <div className="order-first md:order-last">
              <img
                src={header.imageUrl}
                alt={header.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}
        </header>
      );

    case 'Classic':
    default:
      return (
        <header className="py-16 px-6 text-center bg-secondary/30">
          {header.imageUrl && (
            <img
              src={header.imageUrl}
              alt={header.title}
              className="w-full max-w-4xl h-64 object-cover rounded-lg mx-auto mb-8"
            />
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {header.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {header.description}
          </p>
          {header.link && (
            <a
              href={header.link}
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Découvrir
            </a>
          )}
        </header>
      );
  }
}
