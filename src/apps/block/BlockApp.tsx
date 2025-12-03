/**
 * Netral Block Application
 * Main application component for the Markdown editor
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Editor, getEditorMethods } from '@/components/Editor';
import { Preview } from '@/components/Preview';
import { Toolbar } from '@/components/Toolbar';
import { getWordCount, getCharCount } from '@/core/renderer/markdownRenderer';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

// Default content to showcase features
const DEFAULT_CONTENT = `# Bienvenue sur Netral Block

Netral Block est un éditeur Markdown moderne avec des extensions personnalisées.

## Fonctionnalités

### Formatage classique

Vous pouvez utiliser **du gras**, *de l'italique*, et même ~~du texte barré~~.

> Les citations sont également supportées avec style.

### Code

Inline \`code\` ou blocs de code :

\`\`\`javascript
function hello() {
  console.log("Hello, Netral!");
}
\`\`\`

### Extensions Netral

#### Boutons

{button label:"Visiter Netral" url:"https://netral.app"}

#### Blocs d'alerte

{block type:"info"}
Ceci est un bloc d'information. Utilisez-le pour mettre en avant des détails importants.
{/block}

{block type:"warning"}
Attention ! Ce bloc sert à avertir vos lecteurs.
{/block}

{block type:"success"}
Parfait ! Utilisez ce bloc pour les messages positifs.
{/block}

### Listes

- Premier élément
- Deuxième élément
- Troisième élément

1. Étape un
2. Étape deux
3. Étape trois

---

*Créé avec Netral Block* ✨
`;

export function BlockApp() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Calculate stats
  const wordCount = getWordCount(content);
  const charCount = getCharCount(content);

  // Editor action handlers
  const handleBold = useCallback(() => {
    const methods = getEditorMethods(editorContainerRef);
    if (methods) {
      methods.wrapSelection('**', '**');
    }
  }, []);

  const handleItalic = useCallback(() => {
    const methods = getEditorMethods(editorContainerRef);
    if (methods) {
      methods.wrapSelection('*', '*');
    }
  }, []);

  const handleInsertButton = useCallback(() => {
    const methods = getEditorMethods(editorContainerRef);
    if (methods) {
      methods.insertAtCursor('{button label:"Cliquez ici" url:"https://example.com"}');
    }
  }, []);

  const handleInsertBlock = useCallback((type: string) => {
    const methods = getEditorMethods(editorContainerRef);
    if (methods) {
      methods.insertAtCursor(`\n{block type:"${type}"}\nVotre contenu ici\n{/block}\n`);
    }
  }, []);

  const handleInsertGallery = useCallback(() => {
    const methods = getEditorMethods(editorContainerRef);
    if (methods) {
      methods.insertAtCursor('{gallery https://picsum.photos/400/300,https://picsum.photos/400/301,https://picsum.photos/400/302}');
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            handleBold();
            break;
          case 'i':
            e.preventDefault();
            handleItalic();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleBold, handleItalic]);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Toolbar */}
      <Toolbar
        onBold={handleBold}
        onItalic={handleItalic}
        onInsertButton={handleInsertButton}
        onInsertBlock={handleInsertBlock}
        onInsertGallery={handleInsertGallery}
        content={content}
        wordCount={wordCount}
        charCount={charCount}
      />

      {/* Split view */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Editor Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full border-r border-border bg-editor-bg" ref={editorContainerRef}>
              <Editor value={content} onChange={setContent} />
            </div>
          </ResizablePanel>

          {/* Resize Handle */}
          <ResizableHandle withHandle />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <Preview content={content} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export default BlockApp;
