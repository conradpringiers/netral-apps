/**
 * CodeMirror Editor Component
 * Provides syntax highlighting and editing features for Markdown
 */

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap, CompletionContext, Completion } from '@codemirror/autocomplete';

export type EditorMode = 'block' | 'deck' | 'doc';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  mode?: EditorMode;
}

// Block mode snippets (sites)
const blockSnippets: Record<string, string> = {
  'Feature': `Feature[
{🚀;Title;Description}
{⚡;Title;Description}
]`,
  'Column': `Column[
{Left content}
{Right content}
]`,
  'Element': `Element[
{Title;Description;https://image.url}
]`,
  'Testimonial': `Testimonial[
{Name;Role;Quote text;https://avatar.url}
]`,
  'Pricing': `Pricing[
{Basic;$9/mo;Feature 1, Feature 2, Feature 3}
{Pro;$29/mo;Everything in Basic, Priority support}
]`,
  'Image': `Image[https://example.com/image.jpg]`,
  'Video': `Video[https://example.com/video.mp4]`,
  'Embed': `Embed[https://example.com]`,
  'Warn': `Warn[Warning message here]`,
  'Def': `Def[Info message here]`,
  'quote': `quote[Your quote here]`,
  'Bigtitle': `Bigtitle[Your Big Title]`,
  'Header': `Header[Classic;Title;Description;https://image.url;https://link.url]`,
  'Navbar': `Navbar[
{Home;#home}
{Features;#features}
{Contact;#contact}
]`,
  'Stats': `Stats[
{100+;Clients}
{50K;Downloads}
{99%;Satisfaction}
]`,
  'CTA': `CTA[Ready to get started?;Join thousands of satisfied users;Get Started;https://example.com]`,
  'FAQ': `FAQ[
{What is this?;This is a great product that helps you achieve your goals.}
{How does it work?;Simply sign up and start using our intuitive interface.}
]`,
  'Divider': `Divider[wave]`,
  'Gallery': `Gallery[
{https://picsum.photos/400/300?1;Image 1}
{https://picsum.photos/400/300?2;Image 2}
{https://picsum.photos/400/300?3;Image 3}
]`,
  'Timeline': `Timeline[
{2024;Step 1;Description of the step}
{2025;Step 2;Description of the step}
]`,
  'Team': `Team[
{John Doe;CEO;https://i.pravatar.cc/150?img=1}
{Jane Smith;CTO;https://i.pravatar.cc/150?img=2}
]`,
  'Steps': `Steps[
{1;First Step;Description of what to do in this step}
{2;Second Step;Continue with this action}
{3;Third Step;Final step to complete}
]`,
  'Metric': `Metric[
{📈;12.5K;Monthly Users;+15%}
{💰;$48K;Revenue;+8%}
{⭐;4.9;Rating;↑0.2}
]`,
  'Badge': `Badge[New Feature]`,
  'Progress': `Progress[75;Loading...]`,
  'Showcase': `Showcase[
https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600;
Premium Headphones;
Experience crystal-clear audio with our flagship model
{Battery;40h}
{Driver;50mm}
{Noise Cancelling;Active}
{Connectivity;Bluetooth 5.0}
]`,
};

// Deck mode snippets (presentations)
const deckSnippets: Record<string, string> = {
  'slide': `-- Titre de la slide`,
  'Feature': `Feature[
{🚀;Title;Description}
{⚡;Title;Description}
{🎯;Title;Description}
]`,
  'Column': `Column[
{
## Gauche
Contenu gauche
}
{
## Droite
Contenu droite
}
]`,
  'Stats': `Stats[
{100+;Métrique}
{50K;Valeur}
{99%;Score}
]`,
  'Image': `Image[https://example.com/image.jpg]`,
  'Warn': `Warn[Message d'avertissement]`,
  'Def': `Def[Information importante]`,
  'quote': `quote[Votre citation ici]`,
  'Bigtitle': `Bigtitle[Titre principal]`,
  'Timeline': `Timeline[
{2024;Étape 1;Description de l'étape}
{2025;Étape 2;Description de l'étape}
{2026;Étape 3;Description de l'étape}
]`,
  'List': `List[
{✓;Premier élément}
{✓;Deuxième élément}
{✓;Troisième élément}
]`,
  'Video': `Video[https://example.com/video.mp4]`,
  'Code': `Code[javascript;
function hello() {
  console.log('Hello World!');
}
]`,
  'Badge': `Badge[Nouveau]`,
  'Gallery': `Gallery[
{https://picsum.photos/400/300?1;Image 1}
{https://picsum.photos/400/300?2;Image 2}
{https://picsum.photos/400/300?3;Image 3}
]`,
  'Progress': `Progress[75;Progression]`,
  'Graph': `Graph[
{start;Début;->step1}
{step1;Étape 1;->step2}
{step2;Étape 2;->end}
{end;Fin;}
]`,
  'Comparison': `Comparison[
{Avant;❌ Problème 1;❌ Problème 2}
{Après;✅ Solution 1;✅ Solution 2}
]`,
  'Agenda': `Agenda[
{1;Introduction;5 min}
{2;Développement;15 min}
{3;Conclusion;5 min}
]`,
  'Background': `Background[https://images.unsplash.com/photo-1557683316-973673baf926?w=1920]`,
  'Speaker': `Speaker[La simplicité est la sophistication ultime;Leonardo da Vinci;Artiste & Inventeur;https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Leonardo_da_Vinci%2C_Head_of_a_Woman.jpg/440px-Leonardo_da_Vinci%2C_Head_of_a_Woman.jpg]`,
};

// Doc mode snippets (documents)
const docSnippets: Record<string, string> = {
  'section': `--- Titre de section`,
  'subsection': `-- Sous-section`,
  'h1': `# Titre principal`,
  'h2': `## Sous-titre`,
  'h3': `### Titre niveau 3`,
  'h4': `#### Titre niveau 4`,
  'bold': `**texte en gras**`,
  'italic': `*texte en italique*`,
  'strike': `~~texte barré~~`,
  'highlight': `==texte surligné==`,
  'list': `- Premier élément
- Deuxième élément
- Troisième élément`,
  'numbered': `1. Premier élément
2. Deuxième élément
3. Troisième élément`,
  'quote': `> Citation importante`,
  'code': `\`\`\`javascript
// Votre code ici
\`\`\``,
  'inline': `\`code inline\``,
  'link': `[texte du lien](https://url.com)`,
  'image': `![description](https://url.com/image.jpg)`,
  'table': `| Colonne 1 | Colonne 2 | Colonne 3 |
|-----------|-----------|-----------|
| Valeur 1  | Valeur 2  | Valeur 3  |
| Valeur A  | Valeur B  | Valeur C  |`,
  'divider': `---`,
  'checkbox': `- [ ] Tâche à faire
- [x] Tâche terminée`,
  'note': `> **📝 Note:** Information importante`,
  'warn': `> **⚠️ Attention:** Message d'avertissement`,
  'success': `> **✅ Succès:** Opération réussie`,
  'info': `> **ℹ️ Info:** Information utile`,
  'definition': `**Terme**
: Définition du terme`,
  'footnote': `Texte avec note[^1]

[^1]: Contenu de la note de bas de page`,
  'abbr': `*[HTML]: HyperText Markup Language`,
  'toc': `[[toc]]`,
  'Callout': `Callout[info;Ceci est une information importante à retenir.]`,
  'Calloutw': `Callout[warning;Attention: cette action est irréversible!]`,
  'Callouts': `Callout[success;Opération réussie avec succès!]`,
  'Calloute': `Callout[error;Une erreur s'est produite lors du traitement.]`,
};

// Get snippets based on mode
function getSnippetsForMode(mode: EditorMode): Record<string, string> {
  if (mode === 'deck') return deckSnippets;
  if (mode === 'doc') return docSnippets;
  return blockSnippets;
}

// Autocompletion for Netral elements
function createNetralCompletions(mode: EditorMode) {
  return (context: CompletionContext) => {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;

    const snippets = getSnippetsForMode(mode);
    const completions: Completion[] = Object.entries(snippets).map(([label, snippet]) => ({
      label,
      type: 'keyword',
      apply: snippet,
      detail: mode === 'deck' ? 'Slide element' : 'Netral element',
    }));

    return {
      from: word.from,
      options: completions.filter(c => c.label.toLowerCase().startsWith(word.text.toLowerCase())),
    };
  };
}

/**
 * Custom light theme for the editor with line wrapping
 */
const netralTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
  },
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    lineHeight: '1.6',
    overflow: 'auto',
  },
  '.cm-content': {
    padding: '16px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  '.cm-line': {
    wordBreak: 'break-word',
  },
  '.cm-gutters': {
    backgroundColor: 'hsl(220 9% 46%)',
    borderRight: '1px solid hsl(220 13% 91%)',
    color: 'hsl(220 9% 46%)',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 12px 0 8px',
    minWidth: '40px',
  },
  '.cm-activeLine': {
    backgroundColor: 'hsl(220 9% 46%)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'hsl(220 9% 46%)',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'hsl(221 83% 53% / 0.15)',
  },
  '.cm-cursor': {
    borderLeftColor: 'hsl(221 83% 53%)',
    borderLeftWidth: '2px',
  },
  '.cm-tooltip.cm-tooltip-autocomplete': {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  '.cm-tooltip-autocomplete ul li': {
    padding: '6px 12px',
    
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'hsl(220 9% 46%)',
  },
});

// Type for editor methods
export interface EditorMethods {
  insertAtCursor: (text: string) => void;
  wrapSelection: (prefix: string, suffix: string) => void;
  focus: () => void;
}

export const Editor = forwardRef<EditorMethods, EditorProps>(
  ({ value, onChange, className = '', mode = 'block' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorView | null>(null);

    // Handle external value changes
    const updateListener = useCallback(
      (update: { docChanged: boolean; state: EditorState }) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      },
      [onChange]
    );

    /**
     * Insert text at cursor position
     */
    const insertAtCursor = useCallback((text: string) => {
      const view = editorRef.current;
      if (!view) return;

      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      });
      view.focus();
    }, []);

    /**
     * Wrap selected text with prefix and suffix
     */
    const wrapSelection = useCallback((prefix: string, suffix: string) => {
      const view = editorRef.current;
      if (!view) return;

      const { from, to } = view.state.selection.main;
      const selectedText = view.state.doc.sliceString(from, to);
      const newText = `${prefix}${selectedText}${suffix}`;

      view.dispatch({
        changes: { from, to, insert: newText },
        selection: { anchor: from + prefix.length, head: from + prefix.length + selectedText.length },
      });
      view.focus();
    }, []);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      insertAtCursor,
      wrapSelection,
      focus: () => editorRef.current?.focus(),
    }), [insertAtCursor, wrapSelection]);

    // Initialize editor
    useEffect(() => {
      if (!containerRef.current) return;

      const state = EditorState.create({
        doc: value,
        extensions: [
          // Basic setup
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          history(),
          bracketMatching(),
          closeBrackets(),
          
          // Line wrapping
          EditorView.lineWrapping,

          // Autocompletion with Netral snippets
          autocompletion({
            override: [createNetralCompletions(mode)],
            activateOnTyping: true,
          }),

          // Keymaps
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...closeBracketsKeymap,
            ...completionKeymap,
          ]),

          // Language support
          markdown(),
          syntaxHighlighting(defaultHighlightStyle),

          // Theme
          netralTheme,

          // Update listener
          EditorView.updateListener.of(updateListener),
        ],
      });

      const view = new EditorView({
        state,
        parent: containerRef.current,
      });

      editorRef.current = view;

      return () => {
        view.destroy();
      };
    }, []); // Only initialize once

    // Sync external value changes
    useEffect(() => {
      const view = editorRef.current;
      if (!view) return;

      const currentValue = view.state.doc.toString();
      if (value !== currentValue) {
        view.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
        });
      }
    }, [value]);

    // Also store methods on container for backward compatibility
    useEffect(() => {
      if (containerRef.current) {
        (containerRef.current as any).editorMethods = {
          insertAtCursor,
          wrapSelection,
          focus: () => editorRef.current?.focus(),
        };
      }
    }, [insertAtCursor, wrapSelection]);

    return (
      <div
        ref={containerRef}
        className={`h-full w-full overflow-hidden bg-background ${className}`}
        data-editor="true"
      />
    );
  }
);

Editor.displayName = 'Editor';

// Helper to get editor methods from container ref (backward compatibility)
export function getEditorMethods(containerRef: React.RefObject<HTMLDivElement>): EditorMethods | null {
  if (containerRef.current && (containerRef.current as any).editorMethods) {
    return (containerRef.current as any).editorMethods;
  }
  return null;
}
