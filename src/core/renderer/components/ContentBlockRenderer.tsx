/**
 * Content Block Renderer
 * Renders various content block types
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ContentBlock } from '@/core/parser/netralParser';
import { AlertTriangle, Info, CheckCircle, Quote } from 'lucide-react';

interface ContentBlockRendererProps {
  block: ContentBlock;
}

export function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  switch (block.type) {
    case 'markdown':
      const html = DOMPurify.sanitize(marked.parse(block.content) as string);
      return (
        <div
          className="prose-content mb-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );

    case 'image':
      return (
        <figure className="my-8">
          <img
            src={block.url}
            alt="Content image"
            className="w-full h-auto rounded-lg shadow-md"
            loading="lazy"
          />
        </figure>
      );

    case 'bigtitle':
      return (
        <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center my-12">
          {block.text}
        </h2>
      );

    case 'element':
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          {block.items.map((item, index) => (
            <div
              key={index}
              className="bg-card rounded-lg overflow-hidden shadow-md border border-border"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      );

    case 'column':
      return (
        <div className="grid md:grid-cols-2 gap-8 my-8">
          <div className="prose-content">
            {block.left}
          </div>
          <div className="prose-content">
            {block.right}
          </div>
        </div>
      );

    case 'feature':
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          {block.items.map((item, index) => (
            <div
              key={index}
              className="p-6 bg-card rounded-lg border border-border"
            >
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      );

    case 'testimonial':
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          {block.items.map((item, index) => (
            <div
              key={index}
              className="p-6 bg-card rounded-lg border border-border"
            >
              <p className="text-muted-foreground italic mb-4">"{item.text}"</p>
              <div className="flex items-center gap-3">
                {item.photo && (
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-card-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'pricing':
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          {block.items.map((item, index) => (
            <div
              key={index}
              className="p-6 bg-card rounded-lg border border-border text-center"
            >
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-3xl font-bold text-primary mb-4">{item.price}</p>
              <ul className="space-y-2">
                {item.benefits.map((benefit, i) => (
                  <li
                    key={i}
                    className="text-muted-foreground text-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-success" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case 'warn':
      return (
        <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning rounded-lg my-4">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-foreground">{block.text}</p>
        </div>
      );

    case 'def':
      return (
        <div className="flex items-start gap-3 p-4 bg-info/10 border border-info rounded-lg my-4">
          <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <p className="text-foreground">{block.text}</p>
        </div>
      );

    case 'quote':
      return (
        <blockquote className="flex items-start gap-3 p-4 bg-muted border-l-4 border-primary my-4">
          <Quote className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-foreground italic">{block.text}</p>
        </blockquote>
      );

    case 'embed':
      return (
        <div className="my-8 rounded-lg overflow-hidden border border-border">
          <iframe
            src={block.url}
            className="w-full h-96"
            title="Embedded content"
            loading="lazy"
          />
        </div>
      );

    case 'video':
      return (
        <div className="my-8">
          <video
            src={block.url}
            controls
            className="w-full rounded-lg shadow-md"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );

    default:
      return null;
  }
}
