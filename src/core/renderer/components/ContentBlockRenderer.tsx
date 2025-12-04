/**
 * Content Block Renderer
 * Renders various content block types
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ContentBlock } from '@/core/parser/netralParser';
import { AlertTriangle, Info, CheckCircle, Quote, ChevronDown } from 'lucide-react';
import { useState } from 'react';

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
            className="w-full h-auto rounded-xl shadow-lg"
            loading="lazy"
          />
        </figure>
      );

    case 'bigtitle':
      return (
        <h2 
          className="text-4xl md:text-5xl font-bold text-center my-12"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          {block.text}
        </h2>
      );

    case 'element':
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          {block.items.map((item, index) => (
            <div
              key={index}
              className="card-hover rounded-xl overflow-hidden shadow-md border"
              style={{ 
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))'
              }}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-5">
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'hsl(var(--card-foreground))' }}
                >
                  {item.title}
                </h3>
                <p style={{ color: 'hsl(var(--muted-foreground))' }} className="text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      );

    case 'column':
      return (
        <div className="grid md:grid-cols-2 gap-8 my-8">
          <div className="prose-content" style={{ color: 'hsl(var(--foreground))' }}>
            {block.left}
          </div>
          <div className="prose-content" style={{ color: 'hsl(var(--foreground))' }}>
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
              className="card-hover p-6 rounded-xl border"
              style={{ 
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))'
              }}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 
                className="text-lg font-semibold mb-2"
                style={{ color: 'hsl(var(--card-foreground))' }}
              >
                {item.title}
              </h3>
              <p style={{ color: 'hsl(var(--muted-foreground))' }} className="text-sm">
                {item.description}
              </p>
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
              className="card-hover p-6 rounded-xl border"
              style={{ 
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))'
              }}
            >
              <p 
                className="italic mb-4"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                "{item.text}"
              </p>
              <div className="flex items-center gap-3">
                {item.photo && (
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary"
                  />
                )}
                <div>
                  <p 
                    className="font-semibold"
                    style={{ color: 'hsl(var(--card-foreground))' }}
                  >
                    {item.name}
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    {item.role}
                  </p>
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
              className="card-hover p-6 rounded-xl border text-center"
              style={{ 
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))'
              }}
            >
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ color: 'hsl(var(--card-foreground))' }}
              >
                {item.title}
              </h3>
              <p 
                className="text-3xl font-bold mb-6"
                style={{ color: 'hsl(var(--primary))' }}
              >
                {item.price}
              </p>
              <ul className="space-y-3 text-left">
                {item.benefits.map((benefit, i) => (
                  <li
                    key={i}
                    className="text-sm flex items-center gap-2"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--success))' }} />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case 'stats':
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8">
          {block.items.map((item, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl"
              style={{ backgroundColor: 'hsl(var(--secondary))' }}
            >
              <p 
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{ color: 'hsl(var(--primary))' }}
              >
                {item.value}
              </p>
              <p 
                className="text-sm font-medium"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>
      );

    case 'cta':
      return (
        <div 
          className="my-12 p-8 md:p-12 rounded-2xl text-center"
          style={{ backgroundColor: 'hsl(var(--secondary))' }}
        >
          <h3 
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: 'hsl(var(--secondary-foreground))' }}
          >
            {block.title}
          </h3>
          <p 
            className="mb-6 max-w-2xl mx-auto"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            {block.description}
          </p>
          <a
            href={block.buttonUrl}
            className="btn-primary inline-flex items-center px-8 py-4 rounded-lg font-medium"
          >
            {block.buttonText}
          </a>
        </div>
      );

    case 'faq':
      return (
        <div className="my-8 space-y-4">
          {block.items.map((item, index) => (
            <FAQItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>
      );

    case 'divider':
      if (block.style === 'wave') {
        return (
          <div className="my-12 overflow-hidden">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12">
              <path 
                d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" 
                style={{ fill: 'hsl(var(--secondary))' }}
              />
            </svg>
          </div>
        );
      }
      return (
        <hr className="my-12 border-t" style={{ borderColor: 'hsl(var(--border))' }} />
      );

    case 'gallery':
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8">
          {block.items.map((item, index) => (
            <figure key={index} className="group relative overflow-hidden rounded-xl">
              <img
                src={item.url}
                alt={item.caption}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              {item.caption && (
                <figcaption 
                  className="absolute bottom-0 left-0 right-0 p-3 text-sm font-medium bg-gradient-to-t from-black/70 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      );

    case 'warn':
      return (
        <div 
          className="flex items-start gap-3 p-4 rounded-lg my-4 border"
          style={{ 
            backgroundColor: 'hsl(var(--warning) / 0.1)',
            borderColor: 'hsl(var(--warning))'
          }}
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(var(--warning))' }} />
          <p style={{ color: 'hsl(var(--foreground))' }}>{block.text}</p>
        </div>
      );

    case 'def':
      return (
        <div 
          className="flex items-start gap-3 p-4 rounded-lg my-4 border"
          style={{ 
            backgroundColor: 'hsl(var(--info) / 0.1)',
            borderColor: 'hsl(var(--info))'
          }}
        >
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(var(--info))' }} />
          <p style={{ color: 'hsl(var(--foreground))' }}>{block.text}</p>
        </div>
      );

    case 'quote':
      return (
        <blockquote 
          className="flex items-start gap-3 p-6 my-6 border-l-4 rounded-r-lg"
          style={{ 
            backgroundColor: 'hsl(var(--muted))',
            borderColor: 'hsl(var(--primary))'
          }}
        >
          <Quote className="w-6 h-6 flex-shrink-0" style={{ color: 'hsl(var(--primary))' }} />
          <p className="italic text-lg" style={{ color: 'hsl(var(--foreground))' }}>{block.text}</p>
        </blockquote>
      );

    case 'embed':
      return (
        <div className="my-8 rounded-xl overflow-hidden border" style={{ borderColor: 'hsl(var(--border))' }}>
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
            className="w-full rounded-xl shadow-lg"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );

    default:
      return null;
  }
}

// FAQ Item with accordion behavior
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      className="border rounded-xl overflow-hidden"
      style={{ borderColor: 'hsl(var(--border))' }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left transition-colors"
        style={{ backgroundColor: isOpen ? 'hsl(var(--secondary))' : 'hsl(var(--card))' }}
      >
        <span className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>{question}</span>
        <ChevronDown 
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'hsl(var(--muted-foreground))' }}
        />
      </button>
      {isOpen && (
        <div className="p-4" style={{ backgroundColor: 'hsl(var(--card))' }}>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>{answer}</p>
        </div>
      )}
    </div>
  );
}
