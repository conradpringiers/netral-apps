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

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Netral element snippets for Type & Tab
const netralSnippets: Record<string, string> = {
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
};

// Autocompletion for Netral elements
function netralCompletions(context: CompletionContext) {
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;

  const completions: Completion[] = Object.entries(netralSnippets).map(([label, snippet]) => ({
    label,
    type: 'keyword',
    apply: snippet,
    detail: 'Netral element',
  }));

  return {
    from: word.from,
    options: completions.filter(c => c.label.toLowerCase().startsWith(word.text.toLowerCase())),
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
    backgroundColor: 'transparent',
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
    backgroundColor: 'hsl(var(--accent))',
  },
});

// Type for editor methods
export interface EditorMethods {
  insertAtCursor: (text: string) => void;
  wrapSelection: (prefix: string, suffix: string) => void;
  focus: () => void;
}

export const Editor = forwardRef<EditorMethods, EditorProps>(
  ({ value, onChange, className = '' }, ref) => {
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
            override: [netralCompletions],
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
