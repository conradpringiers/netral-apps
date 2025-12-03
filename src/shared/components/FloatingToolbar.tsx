/**
 * Floating Toolbar Component
 * Retractable formatting toolbar at the bottom of the editor
 */

import { useState, useCallback } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link,
  Image,
  Quote,
  Code,
  AlertTriangle,
  Info,
  Columns,
  LayoutGrid,
  Video,
  Globe,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FloatingToolbarProps {
  onInsert: (text: string) => void;
  onWrap: (prefix: string, suffix: string) => void;
}

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  group: 'format' | 'structure' | 'media' | 'blocks';
}

export function FloatingToolbar({ onInsert, onWrap }: FloatingToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const buttons: ToolbarButton[] = [
    // Format group
    {
      icon: <Bold className="w-4 h-4" />,
      label: 'Gras',
      action: () => onWrap('**', '**'),
      group: 'format',
    },
    {
      icon: <Italic className="w-4 h-4" />,
      label: 'Italique',
      action: () => onWrap('*', '*'),
      group: 'format',
    },
    {
      icon: <Heading1 className="w-4 h-4" />,
      label: 'Titre 1',
      action: () => onInsert('\n# '),
      group: 'format',
    },
    {
      icon: <Heading2 className="w-4 h-4" />,
      label: 'Titre 2',
      action: () => onInsert('\n## '),
      group: 'format',
    },
    {
      icon: <List className="w-4 h-4" />,
      label: 'Liste',
      action: () => onInsert('\n- '),
      group: 'format',
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      label: 'Liste numérotée',
      action: () => onInsert('\n1. '),
      group: 'format',
    },
    {
      icon: <Code className="w-4 h-4" />,
      label: 'Code',
      action: () => onWrap('`', '`'),
      group: 'format',
    },
    // Structure group
    {
      icon: <Columns className="w-4 h-4" />,
      label: 'Colonnes',
      action: () => onInsert('\nColumn[\n{Contenu gauche}\n{Contenu droite}\n]\n'),
      group: 'structure',
    },
    {
      icon: <LayoutGrid className="w-4 h-4" />,
      label: 'Feature',
      action: () => onInsert('\nFeature[\n{🚀;Titre;Description}\n{⚡;Titre;Description}\n]\n'),
      group: 'structure',
    },
    // Media group
    {
      icon: <Image className="w-4 h-4" />,
      label: 'Image',
      action: () => onInsert('\nImage[https://example.com/image.jpg]\n'),
      group: 'media',
    },
    {
      icon: <Video className="w-4 h-4" />,
      label: 'Vidéo',
      action: () => onInsert('\nVideo[https://example.com/video.mp4]\n'),
      group: 'media',
    },
    {
      icon: <Globe className="w-4 h-4" />,
      label: 'Embed',
      action: () => onInsert('\nEmbed[https://example.com]\n'),
      group: 'media',
    },
    {
      icon: <Link className="w-4 h-4" />,
      label: 'Element',
      action: () => onInsert('\nElement[\n{Titre;Description;https://image.url}\n]\n'),
      group: 'media',
    },
    // Blocks group
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      label: 'Warning',
      action: () => onInsert('\nWarn[Texte d\'avertissement]\n'),
      group: 'blocks',
    },
    {
      icon: <Info className="w-4 h-4" />,
      label: 'Info',
      action: () => onInsert('\nDef[Texte informatif]\n'),
      group: 'blocks',
    },
    {
      icon: <Quote className="w-4 h-4" />,
      label: 'Citation',
      action: () => onInsert('\nquote[Citation inspirante]\n'),
      group: 'blocks',
    },
  ];

  const groupedButtons = {
    format: buttons.filter(b => b.group === 'format'),
    structure: buttons.filter(b => b.group === 'structure'),
    media: buttons.filter(b => b.group === 'media'),
    blocks: buttons.filter(b => b.group === 'blocks'),
  };

  const renderGroup = (group: ToolbarButton[], label: string) => (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">{label}</span>
      {group.map((button, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={button.action}
              className="h-8 w-8 hover:bg-accent"
            >
              {button.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{button.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden transition-all duration-200">
        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-1.5 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:bg-accent transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronDown className="w-3 h-3" />
              Masquer
            </>
          ) : (
            <>
              <ChevronUp className="w-3 h-3" />
              Formatage
            </>
          )}
        </button>

        {/* Toolbar content */}
        {isExpanded && (
          <div className="px-3 pb-3 pt-1 flex flex-wrap items-center gap-2 justify-center">
            {renderGroup(groupedButtons.format, 'Format')}
            <div className="w-px h-6 bg-border hidden sm:block" />
            {renderGroup(groupedButtons.structure, 'Structure')}
            <div className="w-px h-6 bg-border hidden sm:block" />
            {renderGroup(groupedButtons.media, 'Média')}
            <div className="w-px h-6 bg-border hidden sm:block" />
            {renderGroup(groupedButtons.blocks, 'Blocs')}
          </div>
        )}
      </div>
    </div>
  );
}

export default FloatingToolbar;
