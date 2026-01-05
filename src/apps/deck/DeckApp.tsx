/**
 * Netral Deck Application
 * Presentation editor with slide preview and fullscreen mode
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Editor, getEditorMethods } from '@/components/Editor';
import { DeckPreview } from '@/core/renderer/DeckPreview';
import { PresentationMode } from '@/core/renderer/PresentationMode';
import { FloatingToolbar } from '@/shared/components/FloatingToolbar';
import { HelpModal } from '@/shared/components/HelpModal';
import { FileMenu } from '@/shared/components/FileMenu';
import { getCharCount } from '@/core/renderer/markdownRenderer';
import { parseDeckDocument, getDefaultDeckContent } from '@/core/parser/deckParser';
import { toast } from '@/hooks/use-toast';
import { Presentation, Play, Eye, Code2, PanelLeft, ArrowLeft } from 'lucide-react';
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
  const documentTitle = doc?.title || 'Presentation';

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
        title: 'No slides',
        description: 'Add slides with -- Slide Title',
        variant: 'destructive',
      });
      return;
    }
    setIsPresenting(true);
  };
  
  const handleLoad = (loadedContent: string) => {
    setContent(loadedContent);
    setCurrentSlide(0);
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
          
          {/* File menu with dropdown */}
          <FileMenu 
            documentTitle={documentTitle} 
            content={content} 
            onLoad={handleLoad}
            fileExtension=".netdeck"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Help */}
          <HelpModal mode="deck" />
          
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
              <TooltipContent>Editor only</TooltipContent>
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
              <TooltipContent>Split view</TooltipContent>
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
              <TooltipContent>Preview only</TooltipContent>
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
            Launch
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
              <DeckPreview content={content} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : viewMode === 'editor' ? (
          <div className="relative h-full" ref={editorContainerRef}>
            <Editor value={content} onChange={setContent} mode="deck" />
            <FloatingToolbar onInsert={handleInsert} onWrap={handleWrap} mode="deck" />
          </div>
        ) : (
          <DeckPreview content={content} />
        )}
      </div>
    </div>
  );
}

export default DeckApp;
