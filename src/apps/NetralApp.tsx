/**
 * Netral Main Application
 * Handles mode switching between Block, Deck, and Launcher
 */

import { useState, useCallback, useRef } from 'react';
import { Launcher, NetralMode } from './launcher/Launcher';
import { BlockApp } from './block/BlockApp';
import { DeckApp } from './deck/DeckApp';

export function NetralApp() {
  const [mode, setMode] = useState<NetralMode>(null);
  const [initialContent, setInitialContent] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectMode = useCallback((selectedMode: NetralMode) => {
    setMode(selectedMode);
    setInitialContent(undefined);
  }, []);

  const handleBack = useCallback(() => {
    setMode(null);
    setInitialContent(undefined);
  }, []);

  // Global file drop handler
  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInitialContent(text);
        
        if (file.name.endsWith('.netdeck')) {
          setMode('deck');
        } else if (file.name.endsWith('.netblock')) {
          setMode('block');
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Render based on mode
  if (mode === 'block') {
    return <BlockApp initialContent={initialContent} onBack={handleBack} />;
  }

  if (mode === 'deck') {
    return <DeckApp initialContent={initialContent} onBack={handleBack} />;
  }

  // Show launcher
  return (
    <div 
      onDrop={handleFileDrop}
      onDragOver={handleDragOver}
      className="h-screen"
    >
      <Launcher onSelectMode={handleSelectMode} />
    </div>
  );
}

export default NetralApp;
