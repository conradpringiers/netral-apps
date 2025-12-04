/**
 * Netral Parser
 * Parses the Netral syntax into a structured document
 */

import { ThemeName } from '../themes/themes';

// Document structure types
export interface NetralDocument {
  title: string;
  theme: ThemeName;
  logo: { type: 'url' | 'text'; value: string } | null;
  navbar: NavbarItem[];
  header: HeaderConfig | null;
  sections: Section[];
}

export interface NavbarItem {
  label: string;
  url: string;
}

export interface HeaderConfig {
  type: 'Classic' | 'BigText' | 'SplitImage';
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

export interface Section {
  title: string;
  content: ContentBlock[];
}

export type ContentBlock =
  | { type: 'markdown'; content: string }
  | { type: 'image'; url: string }
  | { type: 'element'; items: ElementItem[] }
  | { type: 'bigtitle'; text: string }
  | { type: 'column'; left: string; right: string }
  | { type: 'feature'; items: FeatureItem[] }
  | { type: 'testimonial'; items: TestimonialItem[] }
  | { type: 'pricing'; items: PricingItem[] }
  | { type: 'warn'; text: string }
  | { type: 'def'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'embed'; url: string }
  | { type: 'video'; url: string }
  | { type: 'stats'; items: StatItem[] }
  | { type: 'cta'; title: string; description: string; buttonText: string; buttonUrl: string }
  | { type: 'faq'; items: FAQItem[] }
  | { type: 'divider'; style: string }
  | { type: 'gallery'; items: GalleryItem[] };

export interface ElementItem {
  title: string;
  description: string;
  image: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface TestimonialItem {
  name: string;
  role: string;
  text: string;
  photo: string;
}

export interface PricingItem {
  title: string;
  price: string;
  benefits: string[];
}

export interface StatItem {
  value: string;
  label: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface GalleryItem {
  url: string;
  caption: string;
}

/**
 * Parse Netral document syntax
 */
export function parseNetralDocument(input: string): NetralDocument {
  const doc: NetralDocument = {
    title: '',
    theme: 'Modern',
    logo: null,
    navbar: [],
    header: null,
    sections: [],
  };

  const lines = input.split('\n');
  let currentSection: Section | null = null;
  let markdownBuffer = '';
  let i = 0;

  const flushMarkdown = () => {
    if (markdownBuffer.trim() && currentSection) {
      currentSection.content.push({ type: 'markdown', content: markdownBuffer.trim() });
      markdownBuffer = '';
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Site title: --- Title
    if (trimmed.startsWith('---')) {
      doc.title = trimmed.slice(3).trim();
      i++;
      continue;
    }

    // Theme[...]
    const themeMatch = trimmed.match(/^Theme\[([^\]]+)\]/i);
    if (themeMatch) {
      doc.theme = themeMatch[1].trim() as ThemeName;
      i++;
      continue;
    }

    // Logo[...]
    const logoMatch = trimmed.match(/^Logo\[([^\]]+)\]/i);
    if (logoMatch) {
      const value = logoMatch[1].trim();
      doc.logo = {
        type: value.startsWith('http') ? 'url' : 'text',
        value,
      };
      i++;
      continue;
    }

    // Navbar[...]
    if (trimmed.startsWith('Navbar[')) {
      const { content, endIndex } = extractBracketContent(lines, i);
      doc.navbar = parseNavbarItems(content);
      i = endIndex + 1;
      continue;
    }

    // Header[Type;Title;Description;ImageURL;Link]
    const headerMatch = trimmed.match(/^Header\[([^\]]+)\]/i);
    if (headerMatch) {
      const parts = headerMatch[1].split(';').map(s => s.trim());
      if (parts.length >= 3) {
        doc.header = {
          type: (parts[0] || 'Classic') as HeaderConfig['type'],
          title: parts[1] || '',
          description: parts[2] || '',
          imageUrl: parts[3] || '',
          link: parts[4] || '',
        };
      }
      i++;
      continue;
    }

    // Section title: -- Title
    if (trimmed.startsWith('--') && !trimmed.startsWith('---')) {
      flushMarkdown();
      if (currentSection) {
        doc.sections.push(currentSection);
      }
      currentSection = {
        title: trimmed.slice(2).trim(),
        content: [],
      };
      i++;
      continue;
    }

    // Content blocks (only inside sections)
    if (currentSection || doc.sections.length === 0) {
      // Create default section if none exists
      if (!currentSection) {
        currentSection = { title: '', content: [] };
      }

      // Image[URL]
      const imageMatch = trimmed.match(/^Image\[([^\]]+)\]/i);
      if (imageMatch) {
        flushMarkdown();
        currentSection.content.push({ type: 'image', url: imageMatch[1].trim() });
        i++;
        continue;
      }

      // Bigtitle[Text]
      const bigtitleMatch = trimmed.match(/^Bigtitle\[([^\]]+)\]/i);
      if (bigtitleMatch) {
        flushMarkdown();
        currentSection.content.push({ type: 'bigtitle', text: bigtitleMatch[1].trim() });
        i++;
        continue;
      }

      // Warn[text]
      const warnMatch = trimmed.match(/^Warn\[([^\]]+)\]/i);
      if (warnMatch) {
        flushMarkdown();
        currentSection.content.push({ type: 'warn', text: warnMatch[1].trim() });
        i++;
        continue;
      }

      // Def[text]
      const defMatch = trimmed.match(/^Def\[([^\]]+)\]/i);
      if (defMatch) {
        flushMarkdown();
        currentSection.content.push({ type: 'def', text: defMatch[1].trim() });
        i++;
        continue;
      }

      // quote[text]
      const quoteMatch = trimmed.match(/^quote\[([^\]]+)\]/i);
      if (quoteMatch) {
        flushMarkdown();
        currentSection.content.push({ type: 'quote', text: quoteMatch[1].trim() });
        i++;
        continue;
      }

      // Embed[URL]
      const embedMatch = trimmed.match(/^Embed\[([^\]]+)\]/i);
      if (embedMatch) {
        flushMarkdown();
        currentSection.content.push({ type: 'embed', url: embedMatch[1].trim() });
        i++;
        continue;
      }

      // Video[URL]
      const videoMatch = trimmed.match(/^Video\[([^\]]+)\]/i);
      if (videoMatch) {
        flushMarkdown();
        currentSection.content.push({ type: 'video', url: videoMatch[1].trim() });
        i++;
        continue;
      }

      // Divider[style]
      const dividerMatch = trimmed.match(/^Divider\[([^\]]+)\]/i);
      if (dividerMatch) {
        flushMarkdown();
        currentSection.content.push({ type: 'divider', style: dividerMatch[1].trim() });
        i++;
        continue;
      }

      // CTA[title;description;buttonText;buttonUrl]
      const ctaMatch = trimmed.match(/^CTA\[([^\]]+)\]/i);
      if (ctaMatch) {
        flushMarkdown();
        const parts = ctaMatch[1].split(';').map(s => s.trim());
        currentSection.content.push({
          type: 'cta',
          title: parts[0] || '',
          description: parts[1] || '',
          buttonText: parts[2] || 'Learn More',
          buttonUrl: parts[3] || '#',
        });
        i++;
        continue;
      }

      // Element[...]
      if (trimmed.startsWith('Element[')) {
        flushMarkdown();
        const { content, endIndex } = extractBracketContent(lines, i);
        currentSection.content.push({ type: 'element', items: parseElementItems(content) });
        i = endIndex + 1;
        continue;
      }

      // Column[...]
      if (trimmed.startsWith('Column[')) {
        flushMarkdown();
        const { content, endIndex } = extractBracketContent(lines, i);
        const columns = parseColumnContent(content);
        currentSection.content.push({ type: 'column', left: columns.left, right: columns.right });
        i = endIndex + 1;
        continue;
      }

      // Feature[...]
      if (trimmed.startsWith('Feature[')) {
        flushMarkdown();
        const { content, endIndex } = extractBracketContent(lines, i);
        currentSection.content.push({ type: 'feature', items: parseFeatureItems(content) });
        i = endIndex + 1;
        continue;
      }

      // Testimonial[...]
      if (trimmed.startsWith('Testimonial[')) {
        flushMarkdown();
        const { content, endIndex } = extractBracketContent(lines, i);
        currentSection.content.push({ type: 'testimonial', items: parseTestimonialItems(content) });
        i = endIndex + 1;
        continue;
      }

      // Pricing[...]
      if (trimmed.startsWith('Pricing[')) {
        flushMarkdown();
        const { content, endIndex } = extractBracketContent(lines, i);
        currentSection.content.push({ type: 'pricing', items: parsePricingItems(content) });
        i = endIndex + 1;
        continue;
      }

      // Stats[...]
      if (trimmed.startsWith('Stats[')) {
        flushMarkdown();
        const { content, endIndex } = extractBracketContent(lines, i);
        currentSection.content.push({ type: 'stats', items: parseStatItems(content) });
        i = endIndex + 1;
        continue;
      }

      // FAQ[...]
      if (trimmed.startsWith('FAQ[')) {
        flushMarkdown();
        const { content, endIndex } = extractBracketContent(lines, i);
        currentSection.content.push({ type: 'faq', items: parseFAQItems(content) });
        i = endIndex + 1;
        continue;
      }

      // Gallery[...]
      if (trimmed.startsWith('Gallery[')) {
        flushMarkdown();
        const { content, endIndex } = extractBracketContent(lines, i);
        currentSection.content.push({ type: 'gallery', items: parseGalleryItems(content) });
        i = endIndex + 1;
        continue;
      }

      // Regular markdown content
      markdownBuffer += line + '\n';
    }

    i++;
  }

  // Flush remaining content
  flushMarkdown();
  if (currentSection) {
    doc.sections.push(currentSection);
  }

  return doc;
}

/**
 * Extract content between brackets, handling multi-line
 */
function extractBracketContent(lines: string[], startIndex: number): { content: string; endIndex: number } {
  let content = '';
  let bracketCount = 0;
  let started = false;
  let endIndex = startIndex;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    for (const char of line) {
      if (char === '[') {
        if (started) content += char;
        bracketCount++;
        started = true;
      } else if (char === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          endIndex = i;
          return { content, endIndex };
        }
        content += char;
      } else if (started) {
        content += char;
      }
    }
    
    if (started) content += '\n';
    endIndex = i;
  }

  return { content, endIndex };
}

/**
 * Parse navbar items: {Label;URL}
 */
function parseNavbarItems(content: string): NavbarItem[] {
  const items: NavbarItem[] = [];
  const regex = /\{([^;]+);([^}]+)\}/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    items.push({
      label: match[1].trim(),
      url: match[2].trim(),
    });
  }
  
  return items;
}

/**
 * Parse element items: {Title;Description;Image}
 */
function parseElementItems(content: string): ElementItem[] {
  const items: ElementItem[] = [];
  const regex = /\{([^;]*);([^;]*);([^}]*)\}/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    items.push({
      title: match[1].trim(),
      description: match[2].trim(),
      image: match[3].trim(),
    });
  }
  
  return items;
}

/**
 * Parse column content: {left}{right}
 */
function parseColumnContent(content: string): { left: string; right: string } {
  const parts: string[] = [];
  let current = '';
  let bracketCount = 0;
  
  for (const char of content) {
    if (char === '{') {
      if (bracketCount > 0) current += char;
      bracketCount++;
    } else if (char === '}') {
      bracketCount--;
      if (bracketCount === 0) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    } else if (bracketCount > 0) {
      current += char;
    }
  }
  
  return {
    left: parts[0] || '',
    right: parts[1] || '',
  };
}

/**
 * Parse feature items: {Icon;Title;Desc}
 */
function parseFeatureItems(content: string): FeatureItem[] {
  const items: FeatureItem[] = [];
  const regex = /\{([^;]*);([^;]*);([^}]*)\}/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    items.push({
      icon: match[1].trim(),
      title: match[2].trim(),
      description: match[3].trim(),
    });
  }
  
  return items;
}

/**
 * Parse testimonial items: {Name;Role;Text;Photo}
 */
function parseTestimonialItems(content: string): TestimonialItem[] {
  const items: TestimonialItem[] = [];
  const regex = /\{([^;]*);([^;]*);([^;]*);([^}]*)\}/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    items.push({
      name: match[1].trim(),
      role: match[2].trim(),
      text: match[3].trim(),
      photo: match[4].trim(),
    });
  }
  
  return items;
}

/**
 * Parse pricing items: {Title;Price;Benefits}
 */
function parsePricingItems(content: string): PricingItem[] {
  const items: PricingItem[] = [];
  const regex = /\{([^;]*);([^;]*);([^}]*)\}/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    items.push({
      title: match[1].trim(),
      price: match[2].trim(),
      benefits: match[3].split(',').map(b => b.trim()).filter(Boolean),
    });
  }
  
  return items;
}

/**
 * Parse stat items: {Value;Label}
 */
function parseStatItems(content: string): StatItem[] {
  const items: StatItem[] = [];
  const regex = /\{([^;]*);([^}]*)\}/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    items.push({
      value: match[1].trim(),
      label: match[2].trim(),
    });
  }
  
  return items;
}

/**
 * Parse FAQ items: {Question;Answer}
 */
function parseFAQItems(content: string): FAQItem[] {
  const items: FAQItem[] = [];
  const regex = /\{([^;]*);([^}]*)\}/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    items.push({
      question: match[1].trim(),
      answer: match[2].trim(),
    });
  }
  
  return items;
}

/**
 * Parse gallery items: {URL;Caption}
 */
function parseGalleryItems(content: string): GalleryItem[] {
  const items: GalleryItem[] = [];
  const regex = /\{([^;]*);([^}]*)\}/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    items.push({
      url: match[1].trim(),
      caption: match[2].trim(),
    });
  }
  
  return items;
}
