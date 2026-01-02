/**
 * Netral Deck Application
 * Presentation editor with slide preview and fullscreen mode
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Editor, getEditorMethods } from '@/components/Editor';
import { DeckRenderer } from '@/core/renderer/DeckRenderer';
import { PresentationMode } from '@/core/renderer/PresentationMode';
import { FloatingToolbar } from '@/shared/components/FloatingToolbar';
import { HelpModal } from '@/shared/components/HelpModal';
import { getCharCount } from '@/core/renderer/markdownRenderer';
import { parseDeckDocument, getDefaultDeckContent } from '@/core/parser/deckParser';
import { toast } from '@/hooks/use-toast';
import { Presentation, Play, Eye, Code2, PanelLeft, ChevronLeft, ChevronRight, Save, FolderOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DeckAppProps {
  initialContent?: string;
  onBack: () => void;
}

export function DeckApp({ initialContent, onBack }: DeckAppProps) {
  const [content, setContent] = useState(initialContent || getDefaultDeckContent());
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = getCharCount(content);
  
  // Parse document
  const doc = useMemo(() => {
    try {
      return parseDeckDocument(content);
    } catch (e) {
      return null;
    }
  }, [content]);
  
  const totalSlides = doc?.slides.length || 0;
  const documentTitle = doc?.title || 'Présentation';

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

  const handleLaunch = () => {
    if (totalSlides === 0) {
      toast({
        title: 'Aucune slide',
        description: 'Ajoutez des slides avec -- Titre de slide',
        variant: 'destructive',
      });
      return;
    }
    setIsPresenting(true);
  };
  
  const handleSave = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle || 'presentation'}.netdeck`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Fichier sauvegardé',
      description: `${documentTitle}.netdeck`,
    });
  };
  
  const handleLoad = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setContent(text);
        setCurrentSlide(0);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Slide navigation
  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToNextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPresenting) return; // Handled by PresentationMode
      
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
          case 's':
            e.preventDefault();
            handleSave();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleWrap, isPresenting]);

  // Reset slide when content changes significantly
  useEffect(() => {
    if (currentSlide >= totalSlides && totalSlides > 0) {
      setCurrentSlide(totalSlides - 1);
    }
  }, [totalSlides, currentSlide]);

  if (isPresenting) {
    return (
      <PresentationMode
        content={content}
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        onSlideChange={setCurrentSlide}
        onClose={() => setIsPresenting(false)}
      />
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".netdeck,.txt"
        className="hidden"
      />
      
      {/* Header */}
      <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Presentation className="h-5 w-5 text-purple-500" />
          <span className="font-semibold text-foreground">Netral Deck</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
            {charCount} chars
          </span>
          
          {/* File menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">Fichier</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLoad}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Ouvrir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {/* Slide navigation */}
          <div className="flex items-center gap-1 mr-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goToPrevSlide}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[60px] text-center">
              {totalSlides > 0 ? `${currentSlide + 1} / ${totalSlides}` : '0 / 0'}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={goToNextSlide}
              disabled={currentSlide >= totalSlides - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Help */}
          <HelpModal />
          
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
              <TooltipContent>Vue partagée</TooltipContent>
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

          {/* Launch presentation */}
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleLaunch} 
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Play className="h-4 w-4" />
            Lancer
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'split' ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="relative h-full border-r border-border" ref={editorContainerRef}>
                <Editor value={content} onChange={setContent} mode="deck" />
                <FloatingToolbar onInsert={handleInsert} onWrap={handleWrap} mode="deck" />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full overflow-hidden bg-slate-900">
                <DeckRenderer content={content} currentSlide={currentSlide} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : viewMode === 'editor' ? (
          <div className="relative h-full" ref={editorContainerRef}>
            <Editor value={content} onChange={setContent} mode="deck" />
            <FloatingToolbar onInsert={handleInsert} onWrap={handleWrap} mode="deck" />
          </div>
        ) : (
          <div className="h-full overflow-hidden bg-slate-900">
            <DeckRenderer content={content} currentSlide={currentSlide} />
          </div>
        )}
      </div>
    </div>
  );
}

export default DeckApp;
