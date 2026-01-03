/**
 * Netral Deck Parser
 * Parses presentation syntax into structured slide data
 */

import { ThemeName } from '../themes/themes';

export interface SlideContent {
  type: 'text' | 'markdown' | 'column' | 'feature' | 'image' | 'warn' | 'def' | 'quote' | 'stats' | 'bigtitle';
  content: string;
  props?: Record<string, any>;
}

export interface Slide {
  title: string;
  content: SlideContent[];
}

export interface DeckDocument {
  title: string;
  theme: ThemeName;
  slides: Slide[];
}

/**
 * Parse a Netral Deck document
 */
export function parseDeckDocument(input: string): DeckDocument {
  const lines = input.split('\n');
  
  let title = 'Présentation';
  let theme: ThemeName = 'Modern';
  const slides: Slide[] = [];
  
  let currentSlide: Slide | null = null;
  let contentBuffer: string[] = [];
  
  const flushContent = () => {
    if (currentSlide && contentBuffer.length > 0) {
      const rawContent = contentBuffer.join('\n').trim();
      if (rawContent) {
        const parsedContent = parseSlideContent(rawContent);
        currentSlide.content.push(...parsedContent);
      }
      contentBuffer = [];
    }
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Document title: --- Title
    if (trimmedLine.startsWith('---')) {
      title = trimmedLine.replace(/^---\s*/, '').trim() || 'Présentation';
      continue;
    }
    
    // Theme: Theme[Name]
    const themeMatch = trimmedLine.match(/^Theme\[([^\]]+)\]$/);
    if (themeMatch) {
      theme = themeMatch[1] as ThemeName;
      continue;
    }
    
    // Slide title: -- Slide Title
    if (trimmedLine.startsWith('--') && !trimmedLine.startsWith('---')) {
      flushContent();
      if (currentSlide) {
        slides.push(currentSlide);
      }
      currentSlide = {
        title: trimmedLine.replace(/^--\s*/, '').trim(),
        content: [],
      };
      continue;
    }
    
    // Add line to content buffer if we're in a slide
    if (currentSlide) {
      contentBuffer.push(line);
    }
  }
  
  // Flush remaining content
  flushContent();
  if (currentSlide) {
    slides.push(currentSlide);
  }
  
  return { title, theme, slides };
}

/**
 * Parse slide content into structured elements
 */
function parseSlideContent(content: string): SlideContent[] {
  const elements: SlideContent[] = [];
  let remaining = content;
  
  // Pattern to match block elements
  const blockPatterns = [
    { type: 'column', pattern: /Column\[([\s\S]*?)\]/g },
    { type: 'feature', pattern: /Feature\[([\s\S]*?)\]/g },
    { type: 'stats', pattern: /Stats\[([\s\S]*?)\]/g },
    { type: 'image', pattern: /Image\[([^\]]+)\]/g },
    { type: 'warn', pattern: /Warn\[([^\]]+)\]/g },
    { type: 'def', pattern: /Def\[([^\]]+)\]/g },
    { type: 'quote', pattern: /quote\[([^\]]+)\]/g },
    { type: 'bigtitle', pattern: /Bigtitle\[([^\]]+)\]/g },
  ];
  
  // Find all matches and their positions
  interface Match {
    type: string;
    content: string;
    start: number;
    end: number;
    props?: Record<string, any>;
  }
  
  const matches: Match[] = [];
  
  for (const { type, pattern } of blockPatterns) {
    const regex = new RegExp(pattern.source, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const matchData: Match = {
        type,
        content: match[1],
        start: match.index,
        end: match.index + match[0].length,
      };
      
      // Parse specific content types
      if (type === 'column') {
        matchData.props = { columns: parseColumnContent(match[1]) };
      } else if (type === 'feature') {
        matchData.props = { items: parseFeatureItems(match[1]) };
      } else if (type === 'stats') {
        matchData.props = { items: parseStatsItems(match[1]) };
      }
      
      matches.push(matchData);
    }
  }
  
  // Sort by position
  matches.sort((a, b) => a.start - b.start);
  
  // Build elements array with text between blocks
  let lastEnd = 0;
  for (const match of matches) {
    // Add text before this match
    if (match.start > lastEnd) {
      const textContent = content.slice(lastEnd, match.start).trim();
      if (textContent) {
        elements.push({ type: 'markdown', content: textContent });
      }
    }
    
    elements.push({
      type: match.type as SlideContent['type'],
      content: match.content,
      props: match.props,
    });
    
    lastEnd = match.end;
  }
  
  // Add remaining text
  if (lastEnd < content.length) {
    const textContent = content.slice(lastEnd).trim();
    if (textContent) {
      elements.push({ type: 'markdown', content: textContent });
    }
  }
  
  return elements;
}

function parseColumnContent(content: string): string[] {
  const columns: string[] = [];
  const matches = content.matchAll(/\{([^}]*)\}/g);
  for (const match of matches) {
    // Strip out any block elements - columns only allow text/markdown
    let columnText = match[1].trim();
    // Remove Image[], Warn[], Def[], Feature[], Stats[], etc.
    columnText = columnText.replace(/Image\[[^\]]*\]/g, '');
    columnText = columnText.replace(/Warn\[[^\]]*\]/g, '');
    columnText = columnText.replace(/Def\[[^\]]*\]/g, '');
    columnText = columnText.replace(/Feature\[[\s\S]*?\]/g, '');
    columnText = columnText.replace(/Stats\[[\s\S]*?\]/g, '');
    columnText = columnText.replace(/Bigtitle\[[^\]]*\]/g, '');
    columnText = columnText.replace(/quote\[[^\]]*\]/g, '');
    columns.push(columnText.trim());
  }
  return columns;
}

function parseFeatureItems(content: string): { icon: string; title: string; description: string }[] {
  const items: { icon: string; title: string; description: string }[] = [];
  const matches = content.matchAll(/\{([^;]+);([^;]+);([^}]+)\}/g);
  for (const match of matches) {
    items.push({
      icon: match[1].trim(),
      title: match[2].trim(),
      description: match[3].trim(),
    });
  }
  return items;
}

function parseStatsItems(content: string): { value: string; label: string }[] {
  const items: { value: string; label: string }[] = [];
  const matches = content.matchAll(/\{([^;]+);([^}]+)\}/g);
  for (const match of matches) {
    items.push({
      value: match[1].trim(),
      label: match[2].trim(),
    });
  }
  return items;
}

/**
 * Get default Deck content
 */
export function getDefaultDeckContent(): string {
  return `--- Ma Présentation
Theme[Modern]
-- Introduction
Bigtitle[Bienvenue à ma présentation]

Cette présentation a été créée avec **Netral Deck**.

-- Fonctionnalités

Feature[
{🚀;Rapide;Créez des slides en quelques minutes}
{🎨;Thèmes;9 thèmes professionnels disponibles}
{📱;Responsive;S'adapte à tous les écrans}
]

-- Statistiques

Stats[
{100+;Utilisateurs}
{50K;Présentations}
{99%;Satisfaction}
]

-- Colonnes

Column[
{
## Partie gauche
Un peu de texte avec du **gras**
- Point 1
- Point 2
}
{
## Partie droite
Image et contenu complémentaire
}
]

-- Avertissement

Warn[N'oubliez pas de sauvegarder votre travail !]

Def[Netral Deck utilise une syntaxe simple pour créer des présentations élégantes.]

-- Conclusion

quote[La simplicité est la sophistication ultime. - Leonardo da Vinci]

Merci pour votre attention !
`;
}
