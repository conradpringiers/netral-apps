/**
 * Netral Doc Application
 * Document editor with PDF export
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Editor, getEditorMethods } from '@/components/Editor';
import { DocRenderer } from '@/core/renderer/DocRenderer';
import { HelpModal } from '@/shared/components/HelpModal';
import { FileMenu } from '@/shared/components/FileMenu';
import { getCharCount } from '@/core/renderer/markdownRenderer';
import { parseDocDocument, getDefaultDocContent } from '@/core/parser/docParser';
import { toast } from '@/hooks/use-toast';
import { FileText, Download, Eye, Code2, PanelLeft, ArrowLeft } from 'lucide-react';
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

interface DocAppProps {
  initialContent?: string;
  onBack: () => void;
}

export function DocApp({ initialContent, onBack }: DocAppProps) {
  const [content, setContent] = useState(initialContent || getDefaultDocContent());
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const charCount = getCharCount(content);
  
  // Parse document
  const doc = useMemo(() => {
    try {
      return parseDocDocument(content);
    } catch (e) {
      return null;
    }
  }, [content]);
  
  const documentTitle = doc?.title || 'Document';

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

  const handleExportPDF = async () => {
    toast({
      title: 'Export PDF',
      description: 'Préparation du document...',
    });
    
    // Use browser print functionality for PDF export
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez les popups.',
        variant: 'destructive',
      });
      return;
    }
    
    // Get the rendered content
    const previewElement = previewRef.current;
    if (!previewElement) return;
    
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentTitle}</title>
          <meta charset="utf-8">
          ${styles}
          <style>
            @page {
              margin: 2cm;
              size: A4;
            }
            body {
              font-family: 'Inter', system-ui, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              background: white;
            }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${previewElement.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  
  const handleLoadFile = (newContent: string) => {
    setContent(newContent);
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
          case 'p':
            e.preventDefault();
            handleExportPDF();
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
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <FileText className="h-5 w-5 text-emerald-500" />
          <span className="font-semibold text-foreground">Netral Doc</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
            {charCount} chars
          </span>
          
          <FileMenu 
            documentTitle={documentTitle} 
            content={content} 
            onLoad={handleLoadFile}
            fileExtension=".netdoc"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Help */}
          <HelpModal mode="doc" />
          
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

          {/* Export PDF */}
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleExportPDF} 
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'split' ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="relative h-full border-r border-border" ref={editorContainerRef}>
                <Editor value={content} onChange={setContent} mode="doc" />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <div ref={previewRef} className="h-full overflow-auto bg-white">
                <DocRenderer content={content} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : viewMode === 'editor' ? (
          <div className="relative h-full" ref={editorContainerRef}>
            <Editor value={content} onChange={setContent} mode="doc" />
          </div>
        ) : (
          <div ref={previewRef} className="h-full overflow-auto bg-white">
            <DocRenderer content={content} />
          </div>
        )}
      </div>
    </div>
  );
}

export default DocApp;
