/**
 * CodeMirror Editor Component
 * Provides syntax highlighting and editing features for Markdown
 */

import { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Custom light theme for the editor
 */
const netralTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
  },
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    lineHeight: '1.6',
  },
  '.cm-content': {
    padding: '16px',
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
    backgroundColor: 'hsl(221 83% 53% / 0.08)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
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
});

export function Editor({ value, onChange, className = '' }: EditorProps) {
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
        autocompletion(),

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

  // Expose methods via ref-like pattern using data attributes
  useEffect(() => {
    if (containerRef.current) {
      // Store methods on the container for parent access
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

// Type for editor methods
export interface EditorMethods {
  insertAtCursor: (text: string) => void;
  wrapSelection: (prefix: string, suffix: string) => void;
  focus: () => void;
}

// Helper to get editor methods from container ref
export function getEditorMethods(containerRef: React.RefObject<HTMLDivElement>): EditorMethods | null {
  if (containerRef.current && (containerRef.current as any).editorMethods) {
    return (containerRef.current as any).editorMethods;
  }
  return null;
}
