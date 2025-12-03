/**
 * Netral Block Application
 * Main application component for the Netral editor
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Editor, getEditorMethods } from '@/components/Editor';
import { NetralRenderer } from '@/core/renderer/NetralRenderer';
import { FloatingToolbar } from '@/shared/components/FloatingToolbar';
import { getCharCount } from '@/core/renderer/markdownRenderer';
import { downloadHtml } from '@/core/exporter/htmlExporter';
import { toast } from '@/hooks/use-toast';
import { Layers, Download, Eye, Code2, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Default content to showcase the new syntax
const DEFAULT_CONTENT = `--- Mon Site Netral
Theme[Modern]
Logo[Netral]
Navbar[
{Accueil;#home}
{Fonctionnalités;#features}
{Tarifs;#pricing}
{Contact;#contact}
]
Header[BigText;Créez des sites web avec une syntaxe simple;Netral vous permet de construire des pages web magnifiques en utilisant une syntaxe intuitive, sans code complexe.;https://picsum.photos/1200/600;#features]

-- Fonctionnalités
Bigtitle[Tout ce dont vous avez besoin]

Feature[
{🚀;Rapide;Créez des pages en quelques minutes avec notre syntaxe intuitive}
{🎨;Thèmes;9 thèmes professionnels prêts à l'emploi}
{📱;Responsive;Toutes les pages sont automatiquement adaptées aux mobiles}
]

Def[Netral utilise une syntaxe inspirée du Markdown mais étendue pour le web moderne.]

-- Contenu riche

Vous pouvez écrire du **texte en gras**, *en italique*, et même créer des listes :

- Premier élément
- Deuxième élément
- Troisième élément

Column[
{La colonne de gauche peut contenir du texte explicatif sur votre produit ou service.}
{La colonne de droite peut présenter des informations complémentaires ou des détails importants.}
]

Image[https://picsum.photos/800/400]

-- Témoignages

Testimonial[
{Marie Dupont;CEO de TechCorp;Netral a transformé notre façon de créer du contenu web;https://i.pravatar.cc/100?img=1}
{Jean Martin;Designer;Une interface intuitive qui booste ma productivité;https://i.pravatar.cc/100?img=2}
]

Warn[Cette syntaxe est encore en développement. De nouvelles fonctionnalités arrivent bientôt !]

-- Tarifs

Pricing[
{Gratuit;0€/mois;Usage personnel, 1 projet, Support communauté}
{Pro;19€/mois;Usage commercial, Projets illimités, Support prioritaire}
{Entreprise;99€/mois;Multi-utilisateurs, API access, Support dédié}
]

quote[La simplicité est la sophistication suprême. - Léonard de Vinci]
`;

export function BlockApp() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const charCount = getCharCount(content);

  // Editor action handlers
  const handleInsert = useCallback((text: string) => {
    const methods = getEditorMethods(editorContainerRef);
    if (methods) {
      methods.insertAtCursor(text);
    }
  }, []);

  const handleWrap = useCallback((prefix: string, suffix: string) => {
    const methods = getEditorMethods(editorContainerRef);
    if (methods) {
      methods.wrapSelection(prefix, suffix);
    }
  }, []);

  const handleExport = () => {
    downloadHtml(content, 'netral-site.html');
    toast({
      title: 'Export réussi',
      description: 'Le fichier HTML a été téléchargé.',
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            handleWrap('**', '**');
            break;
          case 'i':
            e.preventDefault();
            handleWrap('*', '*');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleWrap]);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Netral Block</span>
          <span className="text-xs text-muted-foreground">{charCount} caractères</span>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-muted rounded-md p-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'editor' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewMode('editor')}
                >
                  <Code2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Éditeur seul</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'split' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewMode('split')}
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Vue divisée</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewMode('preview')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Aperçu seul</TooltipContent>
            </Tooltip>
          </div>

          {/* Export */}
          <Button variant="default" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'split' ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="relative h-full border-r border-border" ref={editorContainerRef}>
                <Editor value={content} onChange={setContent} />
                <FloatingToolbar onInsert={handleInsert} onWrap={handleWrap} />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full overflow-auto bg-background">
                <NetralRenderer content={content} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : viewMode === 'editor' ? (
          <div className="relative h-full" ref={editorContainerRef}>
            <Editor value={content} onChange={setContent} />
            <FloatingToolbar onInsert={handleInsert} onWrap={handleWrap} />
          </div>
        ) : (
          <div className="h-full overflow-auto bg-background">
            <NetralRenderer content={content} />
          </div>
        )}
      </div>
    </div>
  );
}

export default BlockApp;
